import os
import uuid
from langchain_ollama import ChatOllama
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.postgres.aio import AsyncPostgresStore
from langgraph.prebuilt import ToolNode, tools_condition
from graph.tools import rag_search, tavily_video_search

tools = [rag_search, tavily_video_search]

DB_URI = os.getenv("SUPABASE_DB_URI", "")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "")

#call gpt-oss:120b from ollama cloud
def _get_model() -> ChatOllama:
    """Create the ChatOllama model instance."""
    api_key = os.getenv("OLLAMA_API_KEY")
    if api_key:
        return ChatOllama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            client_kwargs={"headers": {"Authorization": f"Bearer {api_key}"}},
        )
    return ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)

#graph node thats calls LLM with long-term memory stored in supabase
async def call_model(state: MessagesState, config, *, store):
    user_id = config.get("configurable", {}).get("user_id", "default_user")
    namespace = ("memories", user_id)

    # Retrieve relevant memories for context
    last_content = state["messages"][-1].content if state["messages"] else ""
    memories = await store.asearch(namespace, query=last_content)
    memory_info = "\n".join(m.value["data"] for m in memories) if memories else ""

    system_msg = (
        "You are a Gen Alpha slang assistant. You ONLY answer questions about Gen Alpha slang, "
        "internet lingo, help translate and explain lesson content related to Gen Alpha slang, "
        "or find videos about Gen Alpha slang terms. "
        "If a user asks anything unrelated, respond ONLY with: "
        "'I can only help with Gen Alpha slang — ask me about slang terms, meanings, or lesson content!' "
        "Do NOT explain your reasoning or thought process. Do NOT repeat the rules. Just give the response directly. "
        "When a user asks about Gen Alpha slang or internet lingo, "
        "you MUST use the rag_search tool to search the knowledge base first. "
        "Your answer MUST be based solely on the documents returned by rag_search. "
        "Do NOT add definitions, examples, or explanations from your own training data. "
        "If rag_search returns no relevant results, tell the user you could not find information on that term. "
        "NEVER append the refusal message to a response where you have already provided a slang answer. "
        "The refusal message is exclusively for queries that are entirely unrelated to Gen Alpha slang. "
        "When the user asks for videos about a slang term, you MUST call rag_search first to retrieve the slang definition, "
        "then call tavily_video_search to find relevant video links. "
        "When presenting video results, preserve the markdown table format exactly as returned by tavily_video_search. "
        "Do NOT reformat it into plain text or prose. Do NOT re-explain the slang definition — present only the video table."
    )
    if memory_info:
        system_msg += f"\nUser info:\n{memory_info}"

    # Store every user message as a long-term memory
    last_msg = state["messages"][-1]
    if last_msg.type == "human" and last_msg.content.strip():
        await store.aput(
            namespace,
            str(uuid.uuid4()),
            {"data": last_msg.content},
        )

    model = _get_model().bind_tools(tools)
    response = await model.ainvoke(
        [{"role": "system", "content": system_msg}] + state["messages"]
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

    builder = StateGraph(MessagesState)
    builder.add_node("call_model", call_model)
    builder.add_node("tools", ToolNode(tools))
    builder.add_edge(START, "call_model")
    builder.add_conditional_edges("call_model", tools_condition)
    builder.add_edge("tools", "call_model")

    graph = builder.compile(checkpointer=checkpointer, store=store)

    return graph, checkpointer, store

#cleanup database connections
async def close_connections():
    global _store_cm, _checkpointer_cm
    if _checkpointer_cm:
        await _checkpointer_cm.__aexit__(None, None, None)
    if _store_cm:
        await _store_cm.__aexit__(None, None, None)
