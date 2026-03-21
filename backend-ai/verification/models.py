from pydantic import BaseModel


class VerifyRequest(BaseModel):
    slang_term: str
    definition: str


class Evidence(BaseModel):
    url: str
    title: str
    content: str


class SearchResult(BaseModel):
    summary: str 
    evidence: list[Evidence]  # individual source citations


class VerifyResponse(BaseModel):
    slang_term: str
    verdict: str  # "real", "likely_real", "unverified", "ai_slop"
    confidence: float
    evidence: list[Evidence]
    reasoning: str
