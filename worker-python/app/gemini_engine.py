import os
import json
import logging
from typing import Optional, List
from app.models import XYZRewriteResponse, EvaluateInterviewAnswerResponse

logger = logging.getLogger("gemini_engine")

# Check if google-generativeai is installed
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-generativeai SDK not installed. Running in deterministic fallback mode.")

def get_gemini_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

def is_gemini_active() -> bool:
    api_key = get_gemini_api_key()
    return bool(GENAI_AVAILABLE and api_key and api_key.strip() and not api_key.startswith("your_"))

def get_gemini_model():
    if not is_gemini_active():
        return None
    api_key = get_gemini_api_key()
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

def rewrite_bullet_gemini(
    bullet_point: str,
    target_role: str = "Software Engineer",
    target_skill: Optional[str] = None,
    metric_type: Optional[str] = "latency_or_efficiency"
) -> Optional[XYZRewriteResponse]:
    """
    Transforms weak resume bullets using Gemini 1.5 Flash into Google XYZ format:
    Accomplished [X] as measured by [Y], by doing [Z].
    Returns None on API failure/missing key to trigger deterministic fallback.
    """
    if not is_gemini_active():
        return None

    try:
        model = get_gemini_model()
        if not model:
            return None

        prompt = f"""
You are an expert Silicon Valley Staff Software Engineer and Senior Technical Recruiter.
Transform this candidate resume bullet point into the strict Google XYZ formula:
"Accomplished [X] as measured by [Y], by doing [Z]"

Target Role: {target_role}
Target Skill / Tech: {target_skill or 'Modern Software Architecture'}
Metric Type Focus: {metric_type or 'latency_or_efficiency'}
Original Bullet: "{bullet_point}"

Respond ONLY with valid JSON strictly conforming to this schema (no extra markdown formatting):
{{
  "original_bullet": "{bullet_point}",
  "formula_x": "Action verb + accomplishment (Accomplished [X])",
  "formula_y": "Quantified metric percentage or dollar impact (as measured by [Y])",
  "formula_z": "Technical tools, architecture, and method used (by doing [Z])",
  "rewritten_bullet": "Complete Google XYZ formatted single sentence bullet point.",
  "impact_boost_score": 45,
  "alternative_variations": [
    "Alternative variation 1 emphasizing system scale",
    "Alternative variation 2 emphasizing developer velocity and CI/CD"
  ]
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean potential markdown wrapping ```json ... ```
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        data = json.loads(text)
        return XYZRewriteResponse(
            original_bullet=bullet_point,
            formula_x=data.get("formula_x", "Accomplished core system optimization"),
            formula_y=data.get("formula_y", "improving throughput by 35%"),
            formula_z=data.get("formula_z", f"by architecting microservices with {target_skill or 'clean architecture'}"),
            rewritten_bullet=data.get("rewritten_bullet", ""),
            impact_boost_score=int(data.get("impact_boost_score", 45)),
            alternative_variations=data.get("alternative_variations", [])
        )
    except Exception as ex:
        logger.warning(f"Gemini API bullet rewrite failed ({ex}). Falling back to deterministic engine.")
        return None

def evaluate_interview_gemini(
    question_id: str,
    question: str,
    category: str,
    user_answer: str,
    role_title: str = "Software Engineer"
) -> Optional[EvaluateInterviewAnswerResponse]:
    """
    Evaluates mock interview answer using Gemini 1.5 Flash against Google STAR rubric.
    Returns None on failure/missing key to trigger deterministic fallback.
    """
    if not is_gemini_active():
        return None

    try:
        model = get_gemini_model()
        if not model:
            return None

        prompt = f"""
You are a Principal Engineering Hiring Manager at a Tier-1 tech company interviewing a candidate.
Evaluate the candidate's interview answer rigorously against the STAR method (Situation, Task, Action, Result)
and deep technical accuracy.

Role: {role_title}
Interview Category: {category}
Question: "{question}"
Candidate Answer: "{user_answer}"

Respond ONLY with valid JSON conforming to this schema (no extra markdown):
{{
  "score": 85,
  "strengths": [
    "Specific technical strength 1",
    "Specific technical strength 2"
  ],
  "missing_key_concepts": [
    "Missing architectural or technical depth concept 1",
    "Missing trade-off or metric 2"
  ],
  "evaluation_breakdown": "Detailed critique explaining how well they structured their answer and technical accuracy.",
  "model_answer": "Senior/Staff Engineer benchmark model answer demonstrating depth, metrics, and trade-offs.",
  "follow_up_question": "Tough technical follow-up question digging deeper into edge cases or failure modes."
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        data = json.loads(text)
        return EvaluateInterviewAnswerResponse(
            question_id=question_id,
            score=max(0, min(100, int(data.get("score", 75)))),
            strengths=data.get("strengths", ["Demonstrated foundational knowledge of the topic"]),
            missing_key_concepts=data.get("missing_key_concepts", ["Quantifiable operational metrics", "Failure recovery strategies"]),
            evaluation_breakdown=data.get("evaluation_breakdown", "Answer covers key areas with good clarity."),
            model_answer=data.get("model_answer", "Architected distributed services with high availability and fault isolation."),
            follow_up_question=data.get("follow_up_question", "How would you handle network partitions in this architecture?")
        )
    except Exception as ex:
        logger.warning(f"Gemini API interview evaluation failed ({ex}). Falling back to deterministic engine.")
        return None
