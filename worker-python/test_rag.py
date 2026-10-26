import pytest
from app.rag_engine import analyze_resume_ats, extract_matched_keywords, compute_semantic_similarity
from app.xyz_rewriter import rewrite_bullet_to_xyz
from app.gemini_engine import is_gemini_active, rewrite_bullet_gemini, evaluate_interview_gemini
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = """
Jane Developer - Software Engineer Intern
Undergraduate in Software Engineering
Skills: Java, Spring Boot, Spring Data JPA, Next.js, React, TypeScript, PostgreSQL, Redis, Docker, Git, CI/CD.
Projects:
- Enterprise Task Scheduler: Built enterprise microservice in Java Spring Boot with Redis rate-limiting and automated test suite.
- CareerFlow: Developed full-stack ATS optimizer in Next.js 16 and Python FastAPI.
"""

SAMPLE_JD = """
Software Engineer Intern (Enterprise Cloud)
Requirements:
- Strong knowledge of Java, Spring Boot, and RESTful APIs.
- Experience with relational databases such as PostgreSQL or MySQL.
- Familiarity with Redis caching and Docker containerization.
- Knowledge of modern frontend frameworks like React or Next.js with TypeScript.
- Exposure to Playwright or JUnit automated testing is a plus.
"""

def test_extract_matched_keywords():
    categories = extract_matched_keywords(SAMPLE_RESUME)
    assert "Languages" in categories
    assert "java" in categories["Languages"]
    assert "Frameworks & Libraries" in categories
    assert "spring boot" in categories["Frameworks & Libraries"]
    assert "Databases & Caching" in categories
    assert "redis" in categories["Databases & Caching"]

def test_compute_semantic_similarity():
    sim = compute_semantic_similarity(SAMPLE_RESUME, SAMPLE_JD)
    assert sim > 0.0
    assert sim <= 100.0

def test_analyze_resume_ats():
    response = analyze_resume_ats(
        resume_text=SAMPLE_RESUME,
        job_description=SAMPLE_JD,
        candidate_name="Jane Developer",
        target_role="Software Engineer Intern"
    )
    # Validate structure
    assert 0 <= response.ats_score <= 100
    assert response.ats_score >= 60  # Strong stack should score high
    assert "java" in response.matched_keywords
    assert "spring boot" in response.matched_keywords
    assert "redis" in response.matched_keywords
    assert len(response.category_scores) > 0
    assert len(response.actionable_recommendations) > 0

def test_rewrite_bullet_to_xyz():
    input_bullet = "Created REST APIs using Spring Boot and handled database."
    res = rewrite_bullet_to_xyz(
        bullet_point=input_bullet,
        target_role="Software Engineer Intern",
        target_skill="Spring Boot 3"
    )
    assert res.rewritten_bullet is not None
    assert "leveraging" in res.formula_z.lower() or "implementing" in res.formula_z.lower()
    assert res.impact_boost_score > 0

def test_empty_edge_cases():
    res = analyze_resume_ats("", "")
    assert res.ats_score >= 0

def test_gemini_resilient_fallback():
    """Verify that when Gemini API key is absent, functions return None gracefully without raising exceptions."""
    # When no key is set, functions return None to allow deterministic fallback
    if not is_gemini_active():
        assert rewrite_bullet_gemini("test bullet") is None
        assert evaluate_interview_gemini("1", "question", "tech", "answer") is None

def test_observability_metrics_endpoint():
    """Verify production observability /api/metrics and /health endpoints."""
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "UP"

    metrics_res = client.get("/api/metrics")
    assert metrics_res.status_code == 200
    data = metrics_res.json()
    assert data["status"] == "HEALTHY"
    assert "uptime_seconds" in data
    assert "ai_engine" in data
    assert data["service"] == "careerflow-worker-python"
