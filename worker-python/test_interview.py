import pytest
from app.interview_engine import generate_mock_interview_questions, evaluate_interview_answer

def test_generate_interview_questions_backend():
    questions = generate_mock_interview_questions("Backend Engineer (Java / Cloud)")
    assert len(questions) == 5
    categories = [q.category for q in questions]
    assert any("Core Technical" in c for c in categories)
    assert any("Architecture" in c for c in categories)
    assert any("Behavioral" in c for c in categories)
    assert questions[0].question is not None

def test_generate_interview_questions_fullstack():
    questions = generate_mock_interview_questions("Full-Stack Developer (React / Java)")
    assert len(questions) == 5
    assert any("Next.js" in q.question or "Frontend" in q.category for q in questions)

def test_generate_interview_questions_cloud():
    questions = generate_mock_interview_questions("Cloud & APIs Engineer (Next.js / Python)")
    assert len(questions) == 5
    assert any("asyncio" in q.question or "Python" in q.category or "Docker" in q.question for q in questions)

def test_evaluate_interview_answer_strong():
    res = evaluate_interview_answer(
        question_id="java-be-2",
        question="How would you implement distributed rate limiting with Redis?",
        category="Architecture & Distributed Systems",
        user_answer="I implemented a distributed token-bucket rate limiter using Redis and atomic Lua scripts. It limits requests to 10 per minute per client key to protect database throughput and prevent latency spikes. When Redis is down, we use in-memory fallback with Resilience4j circuit breakers."
    )
    assert res.score >= 75
    assert len(res.strengths) > 0
    assert len(res.model_answer) > 50
    assert len(res.follow_up_question) > 10

def test_evaluate_interview_answer_brief():
    res = evaluate_interview_answer(
        question_id="java-be-2",
        question="How would you implement rate limiting?",
        category="Architecture",
        user_answer="I used Redis for rate limiting."
    )
    assert res.score < 60
    assert len(res.missing_key_concepts) > 0
