import os
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


#calls cloud hosted embedding model to convert text to embeddings
def get_embeddings(texts: list[str]) -> list[list[float]]:
    response = requests.post(
        EMBEDDING_API_URL,
        json={"texts": texts},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HF_TOKEN}",
        },
        timeout=120,  # embedding can take a while on free tier
    )
    response.raise_for_status()
    data = response.json()

    print(f"Got {len(data['embeddings'])} embeddings, dimension: {data['dimension']}")
    return data["embeddings"]

#insert document to supbase, content is required, metadata is optional
def insert_documents(documents: list[dict]) -> None:

    # Extract all content texts for batch embedding
    texts = [doc["content"] for doc in documents]

    # Get embeddings in one batch call
    embeddings = get_embeddings(texts)

    # Prepare rows for insertion
    rows = []
    for doc, embedding in zip(documents, embeddings):
        rows.append({
            "content": doc["content"],
            "metadata": doc.get("metadata", {}),
            "embedding": embedding,
        })

    # Insert into Supabase
    result = supabase.table("documents").insert(rows).execute()
    print(f"Inserted {len(result.data)} documents successfully!")

    return result.data


# Example usage
if __name__ == "__main__":
    # Sample documents to insert
    sample_documents = [
        {
            "content": "What does \"slay\" mean?\tIt means to do something really well or look amazing.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"bet\" mean?\tIt means \"okay\" or \"sure.\"",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"rizz\" mean?\tIt means charm or flirting skills.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"cap\" mean?\tIt means a lie.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"cook\" mean (Gen Alpha version)?\tIt means someone is doing something extremely well.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"you ate\" mean?\tIt means you did an amazing job.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"mid\" mean?\tSomething average, not bad but not good.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"goofy\" mean?\tIt means silly or ridiculous in a playful way.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"skibidi\" mean?\tA playful nonsense term often used humorously online.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"get real\" mean?\tIt's said when someone is being unrealistic or dramatic.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"rizz god arc\" mean?\tA time period when someone's flirting skills suddenly become super strong.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"main character energy\" mean?\tActing confident like you're the star of the story.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"sigma grindset\" mean?\tA mindset focused on self-improvement and independence.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"chronically online\" mean?\tSomeone who spends so much time on the internet that they act like it.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"ratioed\" mean?\tWhen someone gets more negative responses or replies than likes online.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"soft launch\" mean?\tPosting a subtle hint about something new (like a relationship) without fully announcing it.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
        {
            "content": "What does \"hard launch\" mean?\tFully revealing something big, like posting a full photo of your partner.",
            "metadata": {"source": "slang", "category": "gen_alpha"},
        },
    ]

    print("Inserting documents...")
    insert_documents(sample_documents)
    print("Done!")