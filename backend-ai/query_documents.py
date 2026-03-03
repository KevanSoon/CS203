import os
import sys
import json
import requests
from dotenv import load_dotenv
from supabase import create_client, Client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EMBEDDING_API_URL = os.getenv("EMBEDDING_API_URL")
HF_TOKEN = os.getenv("HF_TOKEN")

#setup supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_embedding(text: str) -> list[float]:
    """
    Get a single embedding for the query text.
    """
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
    data = response.json()
    return data["embeddings"][0]




# Call the hybrid_search Postgres function via Supabase RPC.

# Args:
#     query: The user's search query string
#     match_count: Number of results to return (max 30)
#     full_text_weight: Weight for keyword search (default 1.0)
#     semantic_weight: Weight for semantic search (default 1.0)

# Returns:
# List of matching documents

def hybrid_search(
    query: str,
    match_count: int = 5,
    full_text_weight: float = 1.0,
    semantic_weight: float = 1.0,
) -> list[dict]:
    
    # Step 1: Generate embedding for the query
    print(f"Generating embedding for: '{query}'")
    query_embedding = get_embedding(query)

    # Step 2: Call hybrid_search function via RPC
    print(f"Running hybrid search...")
    result = supabase.rpc(
        "hybrid_search",
        {
            "query_text": query,
            "query_embedding": query_embedding,
            "match_count": match_count,
            "full_text_weight": full_text_weight,
            "semantic_weight": semantic_weight,
        },
    ).execute()

    return result.data


def display_results(results: list[dict], query: str) -> None:
    """Pretty print the search results."""

    print(f"\n{'='*60}")
    print(f"Query: '{query}'")
    print(f"Results: {len(results)} documents found")
    print(f"{'='*60}\n")

    if not results:
        print("No matching documents found.")
        return

    for i, doc in enumerate(results, 1):
        print(f"--- Result {i} ---")
        print(f"ID:       {doc['id']}")
        print(f"Content:  {doc['content']}")

        if doc.get("metadata"):
            metadata = doc["metadata"]
            if isinstance(metadata, str):
                metadata = json.loads(metadata)
            print(f"Metadata: {json.dumps(metadata, indent=2)}")

        print(f"Created:  {doc.get('created_at', 'N/A')}")
        print()


# Example usage
if __name__ == "__main__":
    # Use command line argument as query, or default
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "Explain to me skibidi in singlish"

    # --- Example 1: Default hybrid search (equal weights) ---
    results = hybrid_search(query, match_count=5)
    display_results(results, query)

    # --- Example 2: Favor keyword search ---
    # Uncomment to try:
    # print("\n>>> Keyword-heavy search:")
    # results = hybrid_search(query, match_count=5, full_text_weight=2.0, semantic_weight=0.5)
    # display_results(results, query)

    # --- Example 3: Favor semantic search ---
    # Uncomment to try:
    # print("\n>>> Semantic-heavy search:")
    # results = hybrid_search(query, match_count=5, full_text_weight=0.5, semantic_weight=2.0)
    # display_results(results, query)

    # --- Example 4: Use results for RAG context ---
    # context = "\n\n".join([doc["content"] for doc in results])
    # print(f"RAG Context:\n{context}")