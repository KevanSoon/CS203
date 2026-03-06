import os
import uuid
from langchain_ollama import ChatOllama
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.postgres.aio import AsyncPostgresStore

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
        "You are a helpful assistant. "
        f"User info:\n{memory_info}" if memory_info else "You are a helpful assistant."
    )

    # Store every user message as a long-term memory
    last_msg = state["messages"][-1]
    if last_msg.type == "human" and last_msg.content.strip():
        await store.aput(
            namespace,
            str(uuid.uuid4()),
            {"data": last_msg.content},
        )

    model = _get_model()
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
    builder.add_edge(START, "call_model")

    graph = builder.compile(checkpointer=checkpointer, store=store)

    return graph, checkpointer, store

#cleanup database connections
async def close_connections():
    global _store_cm, _checkpointer_cm
    if _checkpointer_cm:
        await _checkpointer_cm.__aexit__(None, None, None)
    if _store_cm:
        await _store_cm.__aexit__(None, None, None)
