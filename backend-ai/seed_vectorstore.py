"""
Seed the vectorstore with all approved, non-deleted lessons from data.sql.

Replicates the logic in app.py::insert_lesson_to_vectorstore:
  - Deletes existing docs for the lesson (idempotent)
  - Builds lesson / chapter / card documents
  - Batch-embeds and inserts into Supabase `documents` table

Usage:
    python seed_vectorstore.py
"""

import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EMBEDDING_API_URL = os.getenv("EMBEDDING_API_URL")
HF_TOKEN = os.getenv("HF_TOKEN")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_embeddings(texts: list[str]) -> list[list[float]]:
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
    data = response.json()
    print(f"  Got {len(data['embeddings'])} embeddings, dimension: {data['dimension']}")
    return data["embeddings"]


# ---------------------------------------------------------------------------
# Data extracted from data.sql
# Only includes: status='approved' AND deleted_at IS NULL
# ---------------------------------------------------------------------------

LESSONS = [
    {
        "id": 1,
        "title": "Intro to Gen-Alpha",
        "description": "Learn about Gen-Alpha slang and how deeply it can impact your daily life. This highly informative course explores the origins, usage, and cultural significance of modern slang, providing real-life examples and practical applications for all ages.",
        "tags": ["Slang for Beginners", "Culture", "67"],
        "chapters": [
            {
                "id": 1,
                "title": "Chapter 1",
                "description": "Beginner Knowledge of Gen-Alpha",
                "cards": [
                    {"id": 1,  "front": 'What does "skibidi" mean?',             "back": "A playful nonsense term often used humorously online."},
                    {"id": 2,  "front": 'What does "rizz" mean?',                "back": "It means charm or flirting skills."},
                    {"id": 3,  "front": 'What does "cook" mean (Gen Alpha version)?', "back": "It means someone is doing something extremely well."},
                    {"id": 4,  "front": 'What does "slay" mean?',                "back": "It means to do something really well or look amazing."},
                    {"id": 5,  "front": 'What does "bet" mean?',                 "back": 'It means "okay" or "sure."'},
                    {"id": 6,  "front": 'What does "cap" mean?',                 "back": "It means a lie."},
                ],
            },
            {
                "id": 2,
                "title": "Chapter 2",
                "description": "Intermediate Knowledge of Gen-Alpha",
                "cards": [
                    {"id": 7,  "front": 'What does "you ate" mean?',             "back": "It means you did an amazing job."},
                    {"id": 8,  "front": 'What does "get real" mean?',            "back": "It\u2019s said when someone is being unrealistic or dramatic."},
                    {"id": 9,  "front": 'What does "ratioed" mean?',             "back": "When someone gets more negative responses or replies than likes online."},
                    {"id": 10, "front": 'What does "rizz god arc" mean?',        "back": "A time period when someone\u2019s flirting skills suddenly become super strong."},
                ],
            },
            {
                "id": 3,
                "title": "Chapter 3",
                "description": "Applied uses of Gen-Alpha",
                "cards": [
                    {"id": 11, "front": 'How to use "cook"',  "back": "Tom said to his colleagues. Let me work in silence, I'm cooking."},
                    {"id": 12, "front": 'How to use "cap"',   "back": '"I actually am best friends with Iswaran" - Tom\n "That\'s cap" - Tim'},
                    {"id": 13, "front": 'How to use "rizz"',  "back": "Damn bro, you rizzed her up"},
                ],
            },
        ],
    },
    {
        "id": 2,
        "title": "The Sigma Mindset",
        "description": "Discover how to be the most Alpha Sigma around by mastering the Sigma mindset. This lesson delves into the psychology of independence, self-improvement, and nonconformity, offering actionable strategies and real-world scenarios to help you stand out.",
        "tags": ["Gen-Alpha", "Highly Advanced Lesson for Skibidi Sigma", "Advanced", "Skibidi", "Sigma"],
        "chapters": [
            {
                "id": 4,
                "title": "Beginners of the Sigma",
                "description": "Beginner's guide to be Sigma",
                "cards": [
                    {"id": 14, "front": 'What does "sigma grindset" mean?',      "back": "A mindset focused on self-improvement and independence."},
                    {"id": 15, "front": 'What does "main character energy" mean?',"back": "Acting confident like you\u2019re the star of the story."},
                    {"id": 16, "front": 'What does "soft launch" mean?',          "back": "Posting a subtle hint about something new (like a relationship) without fully announcing it."},
                    {"id": 17, "front": 'What does "hard launch" mean?',          "back": "Fully revealing something big, like posting a full photo of your partner."},
                ],
            },
            {
                "id": 5,
                "title": "One with the Sigma",
                "description": "To be or not to be",
                "cards": [
                    {"id": 18, "front": 'What is "Flex"?',          "back": "Showing off."},
                    {"id": 19, "front": 'What does "No Cap" mean?', "back": "No lie / serious."},
                    {"id": 20, "front": 'What does "Delulu" mean?', "back": "Delusional but in a funny way."},
                ],
            },
        ],
    },
    {
        "id": 3,
        "title": "The Chill & Reactive Personality",
        "description": "Learn slang used by laid-back, observant, and reactive personalities\u2014people who comment on situations rather than lead them. This lesson covers the nuances of chill communication, social observation, and how to navigate group dynamics with ease.",
        "tags": ["Gaming", "Multiplayer Games", "Child-Friendly"],
        "chapters": [
            {
                "id": 6,
                "title": "Lowkey Vibes",
                "description": None,
                "cards": [
                    {"id": 21, "front": "Meaning of Mid / Average", "back": "not impressive"},
                    {"id": 22, "front": "Meaning of Sus",            "back": "Suspicious"},
                    {"id": 23, "front": "Meaning of Lowkey",         "back": "secretly / slightly doing something"},
                    {"id": 24, "front": "No Cap",                    "back": "No lie / serious"},
                    {"id": 25, "front": "Poggers",                   "back": "Excitement or hype"},
                ],
            },
        ],
    },
    {
        "id": 4,
        "title": "Competitive & Toxic Gamer Personality",
        "description": "Learn slang used in competitive gaming environments, including teamwork, trash talk, and high-pressure situations. Explore the language of esports, the psychology behind competitive banter, and how to thrive in both friendly and intense matches.",
        "tags": ["Gaming", "Multiplayer Games"],
        "chapters": [
            {
                "id": 7,
                "title": "Ranked Grind Mentality",
                "description": "",
                "cards": [
                    {"id": 26, "front": "Tryhard", "back": "Someone who is overly serious or sweating the game"},
                    {"id": 27, "front": "Tilted",  "back": "Frustrated and playing worse because of it"},
                    {"id": 28, "front": "Throwing", "back": "Intentionally or carelessly losing"},
                ],
            },
        ],
    },
    {
        "id": 5,
        "title": "Gaming Slang & Culture",
        "description": "Learn slang commonly used in gaming communities, especially in competitive and online multiplayer environments. This lesson covers the evolution of gaming language, its impact on player identity, and how to communicate effectively with fellow gamers.",
        "tags": ["Gaming", "Multiplayer Games", "Child-Friendly"],
        "chapters": [
            {
                "id": 8,
                "title": "Gamer Talk",
                "description": None,
                "cards": [
                    {"id": 29, "front": "GG",      "back": "Said at the end of a match Good Game"},
                    {"id": 30, "front": "Clutch",  "back": "Winning in a critical moment"},
                    {"id": 31, "front": "EZ",      "back": "Used when something is easy (can be toxic)"},
                    {"id": 32, "front": "Noob",    "back": "Beginner / inexperienced player"},
                    {"id": 33, "front": "Sweaty",  "back": "Very skilled but playing intensely"},
                ],
            },
        ],
    },
    {
        "id": 6,
        "title": "Streaming & Online Gamer Personality",
        "description": "Learn slang used in livestreams, gaming communities, and chat culture (e.g., Twitch, Discord, TikTok streams). Understand the fast-paced world of online interaction, meme culture, and how digital slang shapes the way we connect and entertain audiences.",
        "tags": ["Gaming", "Multiplayer Games"],
        "chapters": [
            {
                "id": 9,
                "title": "Chat Is Watching",
                "description": None,
                "cards": [
                    {"id": 34, "front": "Spam",           "back": "Repeating messages in chat"},
                    {"id": 35, "front": "Clip",           "back": "Something worth saving/highlighting"},
                    {"id": 36, "front": "Stream Sniping", "back": "Watching a streamer\u2019s stream to gain advantage"},
                ],
            },
        ],
    },
    {
        "id": 10,
        "title": "NSFW Content Here",
        "description": "This lesson explores NSFW content and the reasons why certain slang terms are considered inappropriate.",
        "tags": ["Slang for Beginners", "Boomer Curated"],
        "chapters": [
            {
                "id": 13,
                "title": "KNNBCCBWTFSMLJDLLM",
                "description": "KNNBCCBWTFSMLJDLLM",
                "cards": [
                    {"id": 40, "front": "M*therF****", "back": "What The F***"},
                ],
            },
        ],
    },
    {
        "id": 11,
        "title": "F*** C**** D***",
        "description": "This lesson investigates the use of explicit and censored language in modern slang, analyzing why such terms gain popularity.",
        "tags": [],
        "chapters": [
            {
                "id": 14,
                "title": "***",
                "description": "***",
                "cards": [
                    {"id": 41, "front": "M*therF****", "back": "What The F***"},
                ],
            },
        ],
    },
]


def build_documents(lesson: dict) -> list[dict]:
    """Build the same document structure as insert_lesson_to_vectorstore in app.py."""
    documents = []

    # Lesson-level document
    tags_str = ", ".join(lesson["tags"]) if lesson["tags"] else ""
    lesson_content = f"Lesson: {lesson['title']}\nDescription: {lesson['description'] or ''}"
    if tags_str:
        lesson_content += f"\nTags: {tags_str}"
    documents.append({
        "content": lesson_content,
        "metadata": {
            "type": "lesson",
            "lesson_id": lesson["id"],
            "lesson_title": lesson["title"],
            "tags": lesson["tags"],
        },
    })

    for chapter in lesson["chapters"]:
        # Chapter-level document
        documents.append({
            "content": f"Chapter: {chapter['title']}\nDescription: {chapter['description'] or ''}\nLesson: {lesson['title']}",
            "metadata": {
                "type": "chapter",
                "lesson_id": lesson["id"],
                "chapter_id": chapter["id"],
                "lesson_title": lesson["title"],
            },
        })

        # Card-level documents
        for card in chapter["cards"]:
            documents.append({
                "content": f"Card Front: {card['front']}\nCard Back: {card['back']}",
                "metadata": {
                    "type": "card",
                    "lesson_id": lesson["id"],
                    "chapter_id": chapter["id"],
                    "card_id": card["id"],
                    "chapter_title": chapter["title"],
                    "lesson_title": lesson["title"],
                },
            })

    return documents


def seed_lesson(lesson: dict) -> None:
    lesson_id = lesson["id"]
    lesson_title = lesson["title"]
    print(f"\n[Lesson {lesson_id}] {lesson_title}")

    # Delete existing docs for this lesson (idempotent)
    supabase.table("documents").delete().eq(
        "metadata->>lesson_id", str(lesson_id)
    ).execute()
    print(f"  Deleted existing documents for lesson_id={lesson_id}")

    documents = build_documents(lesson)
    texts = [doc["content"] for doc in documents]

    print(f"  Embedding {len(texts)} documents...")
    embeddings = get_embeddings(texts)

    rows = [
        {
            "content": doc["content"],
            "metadata": doc["metadata"],
            "embedding": embedding,
        }
        for doc, embedding in zip(documents, embeddings)
    ]

    result = supabase.table("documents").insert(rows).execute()
    count = len(result.data) if result.data else 0
    print(f"  Inserted {count} documents.")


if __name__ == "__main__":
    print(f"Seeding vectorstore with {len(LESSONS)} lessons...")
    for lesson in LESSONS:
        seed_lesson(lesson)
    print("\nDone!")
