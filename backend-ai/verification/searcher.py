from tavily import TavilyClient

from verification.config import TAVILY_API_KEY
from verification.models import Evidence, SearchResult


async def crawl_evidence(slang_term: str) -> SearchResult:
    """
    Full pipeline:
      1. Search Tavily for the slang term.
      2. Extract url, title, content from each result.
      3. Feed content to the evaluator to verify the slang term and definition.
    """
    print(f"[SEARCH] Searching Tavily for '{slang_term}'...")

    client = TavilyClient(TAVILY_API_KEY)
    response = client.search(query=slang_term, search_depth="advanced")
    results = response.get("results", [])

    if not results:
        print("[SEARCH] No results found.")
        return SearchResult(summary="", evidence=[])

    evidence: list[Evidence] = []
    summary_parts: list[str] = []

    for r in results:
        url = r.get("url", "")
        title = r.get("title", "")
        content = r.get("content", "").strip()

        if not content:
            continue

        print(f"[SEARCH]   {url} -> {len(content)} chars")
        summary_parts.append(f"### {title}\nSource: {url}\n\n{content}")
        evidence.append(Evidence(url=url, title=title, content=content))

    if not evidence:
        print("[SEARCH] No content found in results.")
        return SearchResult(summary="", evidence=[])

    summary = "\n\n---\n\n".join(summary_parts)
    print(f"[SEARCH] Done — {len(evidence)} source(s)")
    return SearchResult(summary=summary, evidence=evidence)
