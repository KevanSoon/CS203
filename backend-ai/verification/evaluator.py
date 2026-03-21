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
            "Examine the retrieval_context which contains crawled content from web sources discovered via open-web search for the slang term.",
            "Check whether the slang term from the input is defined or described in the retrieval_context.",
            "Compare the definition in actual_output against how the slang term is defined in the retrieval_context.",
            "Score 1.0 if the retrieval_context explicitly defines the slang term and the definition in actual_output closely matches or aligns with it.",
            "Score 0.7 if the retrieval_context mentions the slang term and the actual_output definition is broadly consistent, even if worded differently.",
            "Score 0.3 if the slang term appears in the retrieval_context but the actual_output definition is inconsistent or only partially correct.",
            "Score 0.0 if the slang term is not found in any retrieval_context source, or if the actual_output definition contradicts what the sources say.",
        ],
        threshold=VERDICT_THRESHOLD,
    )
