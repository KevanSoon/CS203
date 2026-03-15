from openai import AsyncOpenAI

from verification.config import CREDIBLE_SOURCES, OPENAI_SEARCH_MODEL
from verification.models import Evidence, SearchResult


async def search_news_evidence(slang_term: str, definition: str) -> SearchResult:
    """
    Use OpenAI Responses API with web_search_preview to find evidence
    of a slang term in credible news sources.
    """
    client = AsyncOpenAI()  # uses OPENAI_API_KEY env var

    site_filter = " OR ".join(f"site:{s}" for s in CREDIBLE_SOURCES)
    query = f'"{slang_term}" Gen Alpha slang ({site_filter})'

    print(f"[SEARCH] Querying OpenAI web search: {query}")

    response = await client.responses.create(
        model=OPENAI_SEARCH_MODEL,
        tools=[{"type": "web_search_preview"}],
        input=query,
    )

    result = _parse_response(response)
    print(f"[SEARCH] Found {len(result.evidence)} source citations")
    print(f"[SEARCH] Summary: {result.summary[:200]}...")
    for i, e in enumerate(result.evidence, 1):
        print(f"[SEARCH]   {i}. {e.title} — {e.url}")

    return result


def _parse_response(response) -> SearchResult:
    """Extract full summary text and source citations from OpenAI Responses API output."""
    evidence: list[Evidence] = []
    seen_urls: set[str] = set()
    summary_parts: list[str] = []

    for item in response.output:
        if item.type == "message":
            for content_block in item.content:
                if content_block.type != "output_text":
                    continue
                full_text = content_block.text or ""
                if full_text:
                    summary_parts.append(full_text)
                for annotation in getattr(content_block, "annotations", []):
                    if annotation.type != "url_citation":
                        continue
                    url = annotation.url
                    if url in seen_urls:
                        continue
                    seen_urls.add(url)
                    evidence.append(
                        Evidence(
                            url=url,
                            title=annotation.title or "",
                            snippet="",
                        )
                    )

    return SearchResult(
        summary="\n".join(summary_parts),
        evidence=evidence,
    )
