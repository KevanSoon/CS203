import os
import sys
import asyncio
from contextlib import asynccontextmanager

# Add app directory to path for local module imports
APP_DIR = os.path.dirname(os.path.abspath(__file__))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

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

#intialize langgraph with long term memory
async def init_langgraph():
    """Initialize LangGraph with memory."""
    global langgraph_chat
    try:
        from graph.builder import build_graph_with_memory
        graph, _, _ = await build_graph_with_memory()
        langgraph_chat = graph
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    

if __name__ == "__main__":
    import uvicorn

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    uvicorn.run(app, host="0.0.0.0", port=7860)
