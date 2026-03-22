import os
import requests
from langchain_core.tools import tool
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EMBEDDING_API_URL = os.getenv("EMBEDDING_API_URL")
HF_TOKEN = os.getenv("HF_TOKEN")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def _get_embedding(text: str) -> list[float]:
    response = requests.post(
        EMBEDDING_API_URL,
        json={"texts": [text]},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HF_TOKEN}",
        },
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["embeddings"][0]


@tool
def rag_search(query: str) -> str:
    """Search the knowledge base for relevant documents about Singlish slang and culture.
    Use this tool when the user asks about Singlish terms, slang, or cultural references
    that you don't already know the answer to."""
    print(f"[RAG] rag_search called with query: '{query}'")
    query_embedding = _get_embedding(query)

    result = supabase.rpc(
        "hybrid_search_filtered",
        {
            "query_text": query,
            "query_embedding": query_embedding,
            "match_count": 5,
            "filter_type": "card",
            "full_text_weight": 1.0,
            "semantic_weight": 1.0,
        },
    ).execute()

    if not result.data:
        print("[RAG] No documents found.")
        return "No relevant documents found."

    print(f"[RAG] Found {len(result.data)} documents.")
    docs = []
    for i, doc in enumerate(result.data, 1):
        print(f"[RAG] --- Result {i} ---")
        print(f"[RAG] ID:      {doc['id']}")
        print(f"[RAG] Content:  {doc['content']}")
        docs.append(doc["content"])

    return "\n\n---\n\n".join(docs)