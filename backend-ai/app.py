import os
import sys
import asyncio
from contextlib import asynccontextmanager

# Add app directory to path for local module imports
APP_DIR = os.path.dirname(os.path.abspath(__file__))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Windows-specific fix for psycopg async compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


#pydantic models
class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    thread_id: str = "default_thread"
    stream: bool = False


class ChatResponse(BaseModel):
    response: str


langgraph_chat = None
langgraph_store = None

#intialize langgraph with long term memory
async def init_langgraph():
    """Initialize LangGraph with memory."""
    global langgraph_chat, langgraph_store
    try:
        from graph.builder import build_graph_with_memory
        graph, _, store = await build_graph_with_memory()
        langgraph_chat = graph
        langgraph_store = store
        print("[OK] LangGraph chat with memory initialized")
    except Exception as e:
        import traceback
        print(f"[WARN] LangGraph initialization error: {e}")
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize LangGraph. Shutdown: cleanup."""
    await init_langgraph()
    yield
    try:
        from graph.builder import close_connections
        await close_connections()
    except Exception:
        pass

app = FastAPI(
    title="Simi Slang Agent",
    description="LangGraph chat with memory",
    version="1.0.0",
    lifespan=lifespan,
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from verification.models import VerifyRequest, VerifyResponse
from verification import verify_content


@app.get("/")
def root():
    return {
        "status": "healthy",
        "message": "Fast API is running",
        "services": {
            "langgraph_chat": langgraph_chat is not None,
        }
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with LangGraph-powered chatbot with memory."""
    if not langgraph_chat:
        raise HTTPException(
            status_code=503,
            detail="LangGraph chat not initialized. Check server logs."
        )

    config = {
        "configurable": {
            "thread_id": request.thread_id,
            "user_id": request.user_id,
        }
    }

    # Register thread in store for this user
    if langgraph_store:
        thread_namespace = ("threads", request.user_id)
        existing = await langgraph_store.aget(thread_namespace, request.thread_id)
        if not existing:
            await langgraph_store.aput(
                thread_namespace,
                request.thread_id,
                {
                    "thread_id": request.thread_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                },
            )

    try:
        if request.stream:
            async def generate_stream():
                async for chunk in langgraph_chat.astream(
                    {"messages": [{"role": "user", "content": request.message}]},
                    config,
                    stream_mode="values",
                ):
                    if chunk.get("messages"):
                        last_msg = chunk["messages"][-1]
                        if hasattr(last_msg, "content") and last_msg.type == "ai":
                            yield last_msg.content

            return StreamingResponse(
                generate_stream(),
                media_type="text/event-stream",
            )
        else:
            response_content = ""
            async for chunk in langgraph_chat.astream(
                {"messages": [{"role": "user", "content": request.message}]},
                config,
                stream_mode="values",
            ):
                if chunk.get("messages"):
                    last_msg = chunk["messages"][-1]
                    if hasattr(last_msg, "content") and last_msg.type == "ai":
                        response_content = last_msg.content

            return ChatResponse(response=response_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/chat/threads")
async def chat_threads(user_id: str):
    """List all threads for a user."""
    if not langgraph_store:
        raise HTTPException(
            status_code=503,
            detail="LangGraph store not initialized. Check server logs."
        )

    try:
        namespace = ("threads", user_id)
        items = await langgraph_store.asearch(namespace, query="", limit=100)

        threads = []
        for item in items:
            threads.append(item.value)

        threads.sort(key=lambda t: t.get("created_at", ""), reverse=True)
        return {"user_id": user_id, "threads": threads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chat/history")
async def chat_history(thread_id: str, user_id: str = "default_user"):
    """Retrieve chat history for a given thread."""
    if not langgraph_chat:
        raise HTTPException(
            status_code=503,
            detail="LangGraph chat not initialized. Check server logs."
        )

    config = {
        "configurable": {
            "thread_id": thread_id,
            "user_id": user_id,
        }
    }

    try:
        state = await langgraph_chat.aget_state(config)
        messages = state.values.get("messages", [])

        history = []
        for msg in messages:
            if msg.type in ("human", "ai") and msg.content:
                history.append({
                    "role": msg.type,
                    "content": msg.content,
                })

        return {"thread_id": thread_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/verify", response_model=VerifyResponse)
async def verify_slang(request: VerifyRequest):
    """Verify whether a Gen Alpha slang term is real or AI-generated slop."""
    try:
        result = await verify_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    uvicorn.run(app, host="0.0.0.0", port=7860)
