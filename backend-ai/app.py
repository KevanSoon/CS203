import os
import sys
import asyncio
from contextlib import asynccontextmanager

# Add app directory to path for local module imports
APP_DIR = os.path.dirname(os.path.abspath(__file__))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import requests
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from auth import verify_jwt

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
    thread_id: str = "default_thread"
    stream: bool = False


class ChatResponse(BaseModel):
    response: str


class CardPayload(BaseModel):
    id: int
    front: str
    back: str

class ChapterPayload(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    cards: list[CardPayload] = []

class LessonPayload(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    tags: list[str] = []
    chapters: list[ChapterPayload] = []

class RecommendRequest(BaseModel):
    query: str
    count: int = 5


# --- Supabase & embedding setup for vector store endpoints ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EMBEDDING_API_URL = os.getenv("EMBEDDING_API_URL")
HF_TOKEN = os.getenv("HF_TOKEN")
VECTORSTORE_API_KEY = os.getenv("VECTORSTORE_API_KEY", "")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def _get_embeddings(texts: list[str]) -> list[list[float]]:
    """Batch-embed texts via the hosted embedding model."""
    response = requests.post(
        EMBEDDING_API_URL,
        json={"texts": texts},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HF_TOKEN}",
        },
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["embeddings"]


def _verify_service_key(x_api_key: str = Header(...)):
    """Verify service-to-service API key for vector store endpoints."""
    if not VECTORSTORE_API_KEY or x_api_key != VECTORSTORE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


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
async def chat(request: ChatRequest, claims: dict = Depends(verify_jwt)):
    """Chat with LangGraph-powered chatbot with memory."""
    user_id = claims["sub"]

    if not langgraph_chat:
        raise HTTPException(
            status_code=503,
            detail="LangGraph chat not initialized. Check server logs."
        )

    config = {
        "configurable": {
            "thread_id": request.thread_id,
            "user_id": user_id,
        }
    }

    # Register thread in store for this user
    if langgraph_store:
        thread_namespace = ("threads", user_id)
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
async def chat_threads(claims: dict = Depends(verify_jwt)):
    """List all threads for a user."""
    user_id = claims["sub"]
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
async def chat_history(thread_id: str, claims: dict = Depends(verify_jwt)):
    """Retrieve chat history for a given thread."""
    user_id = claims["sub"]
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
async def verify_slang(request: VerifyRequest, claims: dict = Depends(verify_jwt)):
    """Verify whether a Gen Alpha slang term is real or AI-generated slop."""
    try:
        result = await verify_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


## ---- Vector Store Management Endpoints ---- ##

@app.post("/vectorstore/lesson")
async def insert_lesson_to_vectorstore(payload: LessonPayload, _: str = Depends(_verify_service_key)):
    """Insert lesson content into the vector store. Idempotent: deletes existing docs first."""
    try:
        # Step 1: Delete existing documents for this lesson (idempotent re-approval)
        supabase_client.table("documents").delete().eq(
            "metadata->>lesson_id", str(payload.id)
        ).execute()

        # Step 2: Build document list
        documents = []

        # Lesson-level document (for recommendations)
        tags_str = ", ".join(payload.tags) if payload.tags else ""
        lesson_content = f"Lesson: {payload.title}\nDescription: {payload.description or ''}"
        if tags_str:
            lesson_content += f"\nTags: {tags_str}"
        documents.append({
            "content": lesson_content,
            "metadata": {
                "type": "lesson",
                "lesson_id": payload.id,
                "lesson_title": payload.title,
                "tags": payload.tags,
            },
        })

        # Chapter and card documents
        for chapter in payload.chapters:
            # Chapter-level document
            documents.append({
                "content": f"Chapter: {chapter.title}\nDescription: {chapter.description or ''}\nLesson: {payload.title}",
                "metadata": {
                    "type": "chapter",
                    "lesson_id": payload.id,
                    "chapter_id": chapter.id,
                    "lesson_title": payload.title,
                },
            })

            # Card-level documents (for chat Q&A)
            for card in chapter.cards:
                documents.append({
                    "content": f"Card Front: {card.front}\nCard Back: {card.back}",
                    "metadata": {
                        "type": "card",
                        "lesson_id": payload.id,
                        "chapter_id": chapter.id,
                        "card_id": card.id,
                        "chapter_title": chapter.title,
                        "lesson_title": payload.title,
                    },
                })

        if not documents:
            return {"status": "ok", "inserted": 0}

        # Step 3: Batch embed all content
        texts = [doc["content"] for doc in documents]
        embeddings = _get_embeddings(texts)

        # Step 4: Insert into Supabase
        rows = []
        for doc, embedding in zip(documents, embeddings):
            rows.append({
                "content": doc["content"],
                "metadata": doc["metadata"],
                "embedding": embedding,
            })

        result = supabase_client.table("documents").insert(rows).execute()
        count = len(result.data) if result.data else 0
        print(f"[VectorStore] Inserted {count} documents for lesson '{payload.title}' (id={payload.id})")
        return {"status": "ok", "inserted": count}

    except Exception as e:
        print(f"[VectorStore] Error inserting lesson {payload.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/vectorstore/lesson/{lesson_id}")
async def delete_lesson_from_vectorstore(lesson_id: int, _: str = Depends(_verify_service_key)):
    """Delete all vector store documents for a given lesson."""
    try:
        result = supabase_client.table("documents").delete().eq(
            "metadata->>lesson_id", str(lesson_id)
        ).execute()
        count = len(result.data) if result.data else 0
        print(f"[VectorStore] Deleted {count} documents for lesson_id={lesson_id}")
        return {"status": "ok", "deleted": count}
    except Exception as e:
        print(f"[VectorStore] Error deleting lesson {lesson_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend")
async def recommend_lessons(request: RecommendRequest, claims: dict = Depends(verify_jwt)):
    """Recommend lessons based on a query (e.g. completed lesson title + description)."""
    try:
        query_embedding = _get_embeddings([request.query])[0]

        result = supabase_client.rpc(
            "hybrid_search_filtered",
            {
                "query_text": request.query,
                "query_embedding": query_embedding,
                "match_count": request.count,
                "filter_type": "lesson",
                "full_text_weight": 1.0,
                "semantic_weight": 1.0,
            },
        ).execute()

        recommendations = []
        for doc in (result.data or []):
            metadata = doc.get("metadata", {})
            recommendations.append({
                "lesson_id": metadata.get("lesson_id"),
                "lesson_title": metadata.get("lesson_title"),
                "tags": metadata.get("tags", []),
                "content": doc.get("content"),
            })

        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    uvicorn.run(app, host="0.0.0.0", port=7860)
