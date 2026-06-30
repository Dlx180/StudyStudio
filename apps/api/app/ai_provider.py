"""AI provider boundary for StudyStudio terminal commands."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Protocol


class AIProviderError(RuntimeError):
    """Raised when a configured AI provider cannot return an answer."""


class AIProvider(Protocol):
    name: str

    def answer_question(self, *, question: str, context: dict) -> str:
        """Answer a learner question from bounded StudyStudio context."""


class FakeAIProvider:
    """Deterministic provider used by tests and local development."""

    name = "fake"

    def answer_question(self, *, question: str, context: dict) -> str:
        active_unit = context.get("active_unit") or {}
        page_context = context.get("page_context") or []
        evidence = context.get("recent_evidence") or []
        page_hint = f"page {page_context[0]['page']}" if page_context else "no page text"
        unit_hint = active_unit.get("title", "current unit")
        evidence_hint = f", {len(evidence)} recent evidence event(s)" if evidence else ""
        return f"Fake answer for '{question}' using {unit_hint}, {page_hint}{evidence_hint}."


class DeepSeekAIProvider:
    """DeepSeek chat-completions provider using an OpenAI-compatible HTTP API."""

    name = "deepseek"

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = "https://api.deepseek.com",
        model: str = "deepseek-v4-flash",
        max_tokens: int = 800,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.max_tokens = max_tokens

    def answer_question(self, *, question: str, context: dict) -> str:
        prompt = (
            "You are StudyStudio, an interactive learning IDE assistant. "
            "Answer only from the bounded context. If the context is insufficient, say what is missing."
        )
        user_content = json.dumps({"question": question, "context": context}, ensure_ascii=False)
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
            "max_tokens": self.max_tokens,
        }
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise AIProviderError("DeepSeek provider request failed.") from exc

        try:
            return response_payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise AIProviderError("DeepSeek provider returned an invalid response.") from exc


def get_ai_provider() -> AIProvider:
    """Return the configured AI provider, defaulting to a deterministic fake."""
    provider_name = os.environ.get("STUDYSTUDIO_AI_PROVIDER", "fake").strip().lower()
    if provider_name in {"", "fake", "mock"}:
        return FakeAIProvider()

    if provider_name == "deepseek":
        api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
        if not api_key:
            raise AIProviderError("DEEPSEEK_API_KEY is required when STUDYSTUDIO_AI_PROVIDER=deepseek.")
        return DeepSeekAIProvider(
            api_key=api_key,
            base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
            model=os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash"),
            max_tokens=int(os.environ.get("DEEPSEEK_MAX_TOKENS", "800")),
        )

    raise AIProviderError(f"Unknown AI provider: {provider_name}")
