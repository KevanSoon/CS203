import os
import uuid
from typing import Annotated, TypedDict
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.postgres.aio import AsyncPostgresStore
from graph.tools import rag_search, tavily_video_search

DB_URI = os.getenv("SUPABASE_DB_URI", "")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "")


class GraphState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    route: str
    rag_context: str


def _get_model() -> ChatOllama:
    api_key = os.getenv("OLLAMA_API_KEY")
    if api_key:
        return ChatOllama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            client_kwargs={"headers": {"Authorization": f"Bearer {api_key}"}},
        )
    return ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)


#classify query into 'singlish', 'video', or 'general'
async def classify(state: GraphState):
    last_msg = state["messages"][-1]
    model = _get_model()
    response = await model.ainvoke([
        {"role": "system", "content": (
            "You are a query classifier. Reply ONLY with one word. "
            "Reply 'singlish' ONLY if the user explicitly asks to translate or explain something in Singlish. "
            "Reply 'video' if the user is asking for videos about a slang term. "
            "Reply 'general' for everything else."
        )},
        {"role": "user", "content": last_msg.content},
    ])
    raw = response.content.strip().lower()
    if "singlish" in raw:
        route = "singlish"
    elif "video" in raw:
        route = "video"
    else:
        route = "general"
    print(f"[CLASSIFY] route → {route}")
    return {"route": route}


def route_classifier(state: GraphState):
    return state.get("route", "general")


# --- Shared: call RAG directly once and store in state ---

async def run_rag(state: GraphState):
    last_human = next(
        (m for m in reversed(state["messages"]) if getattr(m, "type", None) == "human"), None
    )
    query = last_human.content if last_human else ""
    rag_result = rag_search.invoke({"query": query})
    return {"rag_context": rag_result}


# --- Singlish flow ---

#explain slang in singlish style using only the rag context
async def singlish_translate(state: GraphState):
    last_human = next(
        (m for m in reversed(state["messages"]) if getattr(m, "type", None) == "human"), None
    )
    query = last_human.content if last_human else ""
    rag_context = state.get("rag_context", "")
    system_prompt = (
        "You are a Singlish slang explainer. "
        "Using ONLY the RAG context provided, explain the slang term in this exact structure:\n\n"
        "**What it means:** [explain the meaning in Singlish style]\n\n"
        "**When to use it:** [explain the context — when, where, and with who you'd say this]\n\n"
        "**Example:** [one natural Singlish example sentence using the term]\n\n"
        "Write ALL three sections in Singlish style — use particles and expressions like 'lah', 'leh', 'lor', 'sia', 'can', 'hor', 'wah', 'aiyo' throughout every section, not just the example. "
        "Do NOT add facts or definitions not present in the RAG context. "
        "Keep it conversational, like a Singaporean friend explaining it."
    )
    model = _get_model()
    response = await model.ainvoke([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"RAG Context:\n{rag_context}\n\nUser question: {query}"},
    ])
    return {"messages": [response]}


# --- Video flow ---

#search tavily for videos then format as markdown table
async def video_search(state: GraphState):
    last_human = next(
        (m for m in reversed(state["messages"]) if getattr(m, "type", None) == "human"), None
    )
    query = last_human.content if last_human else ""
    result = tavily_video_search.invoke({"slang_term": query})
    return {"messages": [AIMessage(content=result)]}


# --- General flow ---

#plain slang explanation using rag context, with long-term memory
async def call_model(state: GraphState, config, *, store):
    user_id = config.get("configurable", {}).get("user_id", "default_user")
    namespace = ("memories", user_id)

    last_content = state["messages"][-1].content if state["messages"] else ""
    memories = await store.asearch(namespace, query=last_content)
    memory_info = "\n".join(m.value["data"] for m in memories) if memories else ""

    rag_context = state.get("rag_context", "")
    system_msg = (
        "You are a Gen Alpha slang assistant. You ONLY answer questions about Gen Alpha slang and internet lingo. "
        "Answer using ONLY the RAG context provided. Do NOT use your own training data for definitions. "
        "If the RAG context has no relevant results, tell the user you could not find information on that term. "
        "If a user asks anything unrelated to Gen Alpha slang, respond ONLY with: "
        "'I can only help with Gen Alpha slang — ask me about slang terms, meanings, or lesson content!' "
        "Do NOT explain your reasoning or thought process. Just give the response directly."
    )
    if memory_info:
        system_msg += f"\nUser info:\n{memory_info}"

    last_msg = state["messages"][-1]
    if last_msg.type == "human" and last_msg.content.strip():
        await store.aput(
            namespace,
            str(uuid.uuid4()),
            {"data": last_msg.content},
        )

    model = _get_model()
    response = await model.ainvoke(
        [{"role": "system", "content": system_msg},
         {"role": "user", "content": f"RAG Context:\n{rag_context}\n\nUser question: {last_content}"}]
    )
    return {"messages": [response]}


# Keep context managers alive to prevent connection cleanup
_store_cm = None
_checkpointer_cm = None


#build graph with checkpointer and store connected to supabase
async def build_graph_with_memory():
    global _store_cm, _checkpointer_cm

    _store_cm = AsyncPostgresStore.from_conn_string(DB_URI)
    store = await _store_cm.__aenter__()

    _checkpointer_cm = AsyncPostgresSaver.from_conn_string(DB_URI)
    checkpointer = await _checkpointer_cm.__aenter__()

    await store.setup()
    await checkpointer.setup()

    builder = StateGraph(GraphState)
    builder.add_node("classify", classify)
    builder.add_node("run_rag", run_rag)
    builder.add_node("singlish_translate", singlish_translate)
    builder.add_node("video_search", video_search)
    builder.add_node("call_model", call_model)

    builder.add_edge(START, "classify")
    builder.add_conditional_edges("classify", route_classifier, {
        "singlish": "run_rag",
        "video": "run_rag",
        "general": "run_rag",
    })
    builder.add_conditional_edges("run_rag", route_classifier, {
        "singlish": "singlish_translate",
        "video": "video_search",
        "general": "call_model",
    })
    builder.add_edge("singlish_translate", END)
    builder.add_edge("video_search", END)
    builder.add_edge("call_model", END)

    graph = builder.compile(checkpointer=checkpointer, store=store)
    return graph, checkpointer, store


#cleanup database connections
async def close_connections():
    global _store_cm, _checkpointer_cm
    if _checkpointer_cm:
        await _checkpointer_cm.__aexit__(None, None, None)
    if _store_cm:
        await _store_cm.__aexit__(None, None, None)
