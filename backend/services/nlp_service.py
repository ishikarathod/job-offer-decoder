from __future__ import annotations

import math
import re
from collections import Counter
from typing import Dict, List

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer


SKILL_PATTERNS = [
    "python",
    "sql",
    "react",
    "fastapi",
    "aws",
    "docker",
    "kubernetes",
    "machine learning",
    "data analysis",
    "project management",
    "communication",
    "leadership",
    "typescript",
    "javascript",
    "api design",
    "stakeholder management",
    "experimentation",
]

RED_FLAG_KEYWORDS: Dict[str, str] = {
    "fast-paced": "Language suggests a consistently high-pressure environment.",
    "wear many hats": "Role scope may be broad or underdefined.",
    "weekends": "Weekend work expectations are mentioned.",
    "after hours": "After-hours support could affect work-life balance.",
    "aggressive deadlines": "Timeline expectations may be intense.",
    "unlimited pto": "Unlimited PTO can be a benefit, but sometimes hides low usage norms.",
    "must thrive under pressure": "Sustained pressure is framed as a requirement.",
}

GREEN_FLAG_KEYWORDS: Dict[str, str] = {
    "mentorship": "The role highlights coaching or career support.",
    "learning budget": "Professional development support is mentioned.",
    "flexible hours": "Flexible scheduling suggests better autonomy.",
    "hybrid": "Hybrid work can improve balance for many candidates.",
    "remote": "Remote work flexibility is explicitly offered.",
    "career growth": "Growth paths are described.",
    "clear goals": "The description points to clearer expectations.",
    "benefits": "Benefits are explicitly discussed.",
}

HIGH_INTENSITY_TERMS = {
    "on-call",
    "urgent",
    "pressure",
    "deadline",
    "fast-paced",
    "late nights",
    "weekends",
    "always on",
}
LOW_INTENSITY_TERMS = {
    "flexible",
    "balanced",
    "remote",
    "hybrid",
    "wellbeing",
    "pto",
    "mental health",
    "supportive",
}


class JobDescriptionAnalyzer:
    def __init__(self) -> None:
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=30,
        )

    def analyze(self, text: str) -> dict:
        normalized_text = self._normalize(text)
        # We combine keyword heuristics with lightweight TF-IDF phrase extraction to keep inference fast and local.
        key_phrases = self._extract_key_phrases(text, normalized_text)
        work_life_balance = self._classify_work_life_balance(normalized_text)
        role_clarity_score = self._score_role_clarity(text, normalized_text)
        red_flags = self._collect_flags(normalized_text, RED_FLAG_KEYWORDS)
        green_flags = self._collect_flags(normalized_text, GREEN_FLAG_KEYWORDS)

        if not red_flags:
            red_flags = ["No major textual red flags detected from the current heuristics."]
        if not green_flags:
            green_flags = ["No strong green flags detected from the current heuristics."]

        return {
            "key_phrases": key_phrases,
            "work_life_balance": work_life_balance,
            "role_clarity_score": role_clarity_score,
            "red_flags": red_flags,
            "green_flags": green_flags,
        }

    def _normalize(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.strip().lower())

    def _extract_key_phrases(self, raw_text: str, normalized_text: str) -> List[str]:
        phrases: List[str] = []
        for skill in SKILL_PATTERNS:
            if skill in normalized_text:
                phrases.append(skill.title())

        try:
            matrix = self.vectorizer.fit_transform([raw_text])
            scores = zip(self.vectorizer.get_feature_names_out(), matrix.toarray()[0])
            ranked = sorted(scores, key=lambda item: item[1], reverse=True)
            for phrase, score in ranked:
                if score > 0 and phrase.lower() not in {p.lower() for p in phrases}:
                    phrases.append(phrase)
                if len(phrases) >= 8:
                    break
        except ValueError:
            pass

        if len(phrases) < 5:
            tokens = [
                token
                for token in re.findall(r"[a-zA-Z][a-zA-Z\-]+", normalized_text)
                if token not in ENGLISH_STOP_WORDS and len(token) > 3
            ]
            for token, _ in Counter(tokens).most_common(8):
                label = token.title()
                if label not in phrases:
                    phrases.append(label)
                if len(phrases) >= 8:
                    break

        return phrases[:8]

    def _classify_work_life_balance(self, text: str) -> str:
        high_score = sum(term in text for term in HIGH_INTENSITY_TERMS)
        low_score = sum(term in text for term in LOW_INTENSITY_TERMS)

        if high_score - low_score >= 2:
            return "low"
        if low_score > high_score:
            return "high"
        return "medium"

    def _score_role_clarity(self, raw_text: str, normalized_text: str) -> int:
        sections = 0
        for marker in ["responsibilities", "requirements", "qualifications", "benefits", "about the role"]:
            if marker in normalized_text:
                sections += 1

        bullets = len(re.findall(r"(^|\n)\s*[-*•]", raw_text))
        measurable = len(re.findall(r"\b\d+\+?\s+(years|yrs|months)\b", normalized_text))
        action_verbs = len(
            re.findall(
                r"\b(build|lead|design|manage|own|deliver|analyze|collaborate|improve|develop)\b",
                normalized_text,
            )
        )

        length_factor = min(len(normalized_text.split()) / 220.0, 1.0)
        raw_score = 35 + sections * 10 + min(bullets, 6) * 4 + min(measurable, 3) * 5 + min(action_verbs, 8) * 2
        adjusted = raw_score * (0.75 + 0.25 * length_factor)
        return max(0, min(100, math.floor(adjusted)))

    def _collect_flags(self, text: str, flag_map: Dict[str, str]) -> List[str]:
        return [message for keyword, message in flag_map.items() if keyword in text]


analyzer = JobDescriptionAnalyzer()
