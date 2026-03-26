from deepeval.test_case import LLMTestCase

from verification.config import VERDICT_THRESHOLD
from verification.models import VerifyRequest, VerifyResponse
from verification.searcher import crawl_evidence
from verification.evaluator import create_slang_verifier


def _score_to_verdict(score: float) -> str:
    if score >= VERDICT_THRESHOLD:
        return "real"
    if score >= 0.4:
        return "likely_real"
    if score >= 0.2:
        return "unverified"
    return "ai_slop"


async def verify_content(request: VerifyRequest) -> VerifyResponse:
    """
    End-to-end slang verification:
    1. Search credible news sources for evidence
    2. Judge authenticity with DeepEval GEval + ChatOllama
    3. Return verdict with evidence and reasoning
    """
    print(f"\n[VERIFY] === Starting verification for '{request.question}' ===")
    print(f"[VERIFY] Definition: {request.content}")

    # Step 1: Search news sources
    print("[VERIFY] Step 1: Searching credible news sources...")
    search_result = await crawl_evidence(f"{request.question} {request.content}")

    # Step 2: Build DeepEval test case — use the full summary as retrieval context
    retrieval_context = [search_result.summary] if search_result.summary.strip() else ["No news articles found for this slang term."]

    test_case = LLMTestCase(
        input=f"Slang term: {request.question}. Definition: {request.content}.",
        actual_output=request.content,
        retrieval_context=retrieval_context,
    )

    # Step 3: Evaluate with GEval
    print(f"[VERIFY] Step 2: Evaluating with DeepEval GEval ({len(retrieval_context)} context items)...")
    metric = create_slang_verifier()
    await metric.a_measure(test_case)

    score = metric.score
    verdict = _score_to_verdict(score)

    print(f"[VERIFY] Step 3: Results")
    print(f"[VERIFY]   Score:    {score}")
    print(f"[VERIFY]   Verdict:  {verdict}")
    print(f"[VERIFY]   Reason:   {metric.reason}")
    print(f"[VERIFY] === Verification complete ===\n")

    return VerifyResponse(
        slang_term=request.question,
        verdict=verdict,
        confidence=score,
        evidence=search_result.evidence,
        reasoning=metric.reason or "",
    )
