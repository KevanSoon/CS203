import os

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

VERDICT_THRESHOLD = float(os.getenv("VERDICT_THRESHOLD", "0.7"))

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
