import os

CREDIBLE_SOURCES = [
    "theguardian.com",
    "straitstimes.com",
    "bbc.com",
    "nytimes.com",
    "reuters.com",
    "channelnewsasia.com",
]

VERDICT_THRESHOLD = float(os.getenv("VERDICT_THRESHOLD", "0.7"))
OPENAI_SEARCH_MODEL = os.getenv("OPENAI_SEARCH_MODEL", "gpt-4o-mini")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
