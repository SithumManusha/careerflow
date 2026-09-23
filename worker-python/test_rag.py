import pytest
from app.rag_engine import analyze_resume_ats, extract_matched_keywords, compute_semantic_similarity
from app.xyz_rewriter import rewrite_bullet_to_xyz

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
