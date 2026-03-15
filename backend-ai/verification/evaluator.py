from deepeval.models import DeepEvalBaseLLM
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCaseParams
from langchain_ollama import ChatOllama

from verification.config import (
    OLLAMA_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_API_KEY,
    VERDICT_THRESHOLD,
)


class OllamaJudgeLLM(DeepEvalBaseLLM):
    """Wraps ChatOllama so DeepEval can use it as the judge LLM."""

    def __init__(self):
        self._model = self._create_model()

    def _create_model(self) -> ChatOllama:
        kwargs = {"model": OLLAMA_MODEL, "base_url": OLLAMA_BASE_URL}
        if OLLAMA_API_KEY:
            kwargs["client_kwargs"] = {
                "headers": {"Authorization": f"Bearer {OLLAMA_API_KEY}"}
            }
        return ChatOllama(**kwargs)

    def load_model(self):
        return self._model

    def generate(self, prompt: str) -> str:
        response = self._model.invoke(prompt)
        return response.content

    async def a_generate(self, prompt: str) -> str:
        response = await self._model.ainvoke(prompt)
        return response.content

    def get_model_name(self) -> str:
        return OLLAMA_MODEL or "ollama"


def create_slang_verifier() -> GEval:
    """Create a GEval metric that judges whether slang content is real or AI slop."""
    return GEval(
        name="SlangAuthenticity",
        model=OllamaJudgeLLM(),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.RETRIEVAL_CONTEXT,
        ],
        evaluation_steps=[
            "Examine the retrieval_context which contains news article excerpts from credible sources such as The Guardian, Straits Times, BBC, NYT, Reuters, and CNA.",
            "Determine if the slang term and definition provided in the input are corroborated by any of the news articles.",
            "A slang term is 'real' if at least one credible news source discusses it with a matching or similar definition.",
            "A slang term is 'AI slop' if no credible source mentions it, or if sources contradict the given definition.",
            "Score 1.0 if strongly corroborated by multiple sources, 0.5 if partially mentioned or only one weak reference, 0.0 if no evidence or contradicted.",
        ],
        threshold=VERDICT_THRESHOLD,
    )
