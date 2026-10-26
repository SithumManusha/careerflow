import io
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pypdf

from app.models import (
    ATSScanRequest,
    ATSScanResponse,
    XYZRewriteRequest,
    XYZRewriteResponse,
    KeywordExtractionRequest,
    KeywordExtractionResponse,
    GenerateInterviewQuestionsRequest,
    GenerateInterviewQuestionsResponse,
    EvaluateInterviewAnswerRequest,
    EvaluateInterviewAnswerResponse
)
from app.rag_engine import analyze_resume_ats, extract_matched_keywords
from app.xyz_rewriter import rewrite_bullet_to_xyz
from app.interview_engine import generate_mock_interview_questions, evaluate_interview_answer
from app.gemini_engine import (
    is_gemini_active,
    rewrite_bullet_gemini,
    evaluate_interview_gemini
)

START_TIME = time.time()

app = FastAPI(
    title="CareerFlow Enterprise AI & RAG Worker",
    description="Microservice providing semantic ATS compatibility scoring, keyword extraction, and Google XYZ resume bullet rewriting.",
    version="1.1.0"
)

# Enable CORS for Next.js frontend (port 3000) and Spring Boot backend (port 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "CareerFlow Python RAG Worker",
        "version": "1.1.0",
        "ai_mode": "Hybrid (Google Gemini 1.5 Flash + Fallback)" if is_gemini_active() else "Deterministic (Scikit-Learn TF-IDF)",
        "gemini_active": is_gemini_active()
    }

@app.get("/api/metrics")
def get_metrics():
    """
    Production Observability Metric Endpoint
    Tracks uptime, AI engine operational mode, and service telemetry.
    """
    uptime = round(time.time() - START_TIME, 2)
    return {
        "status": "HEALTHY",
        "uptime_seconds": uptime,
        "service": "careerflow-worker-python",
        "runtime": "Python 3.12",
        "ai_engine": "Google Gemini 1.5 Flash (Active)" if is_gemini_active() else "Scikit-Learn TF-IDF (Deterministic Fallback)",
        "telemetry": {
            "nlp_vector_dimensions": 1000,
            "supported_categories": 6,
            "gemini_active": is_gemini_active(),
            "cache_enabled": True
        }
    }

@app.post("/api/rag/analyze-ats", response_model=ATSScanResponse)
def analyze_ats(request: ATSScanRequest):
    """
    Scans CV text against Job Description, generating:
    - Match score 0-100%
    - Matched vs Missing keywords
    - Categorized skills breakdown
    - Actionable recommendations
    """
    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Both resume_text and job_description must be non-empty."
        )
    return analyze_resume_ats(
        resume_text=request.resume_text,
        job_description=request.job_description,
        candidate_name=request.candidate_name or "Candidate",
        target_role=request.target_role or "Software Engineer Intern"
    )

@app.post("/api/rag/rewrite-xyz", response_model=XYZRewriteResponse)
def rewrite_bullet(request: XYZRewriteRequest):
    """
    Transforms weak resume bullet points into Google XYZ format:
    Accomplished [X] as measured by [Y], by doing [Z].
    Uses Gemini 1.5 Flash if available, with automatic fallback to Scikit-Learn rule-engine.
    """
    if not request.bullet_point.strip():
        raise HTTPException(
            status_code=400,
            detail="bullet_point cannot be empty."
        )

    # 1. Try Gemini GenAI First
    gemini_res = rewrite_bullet_gemini(
        bullet_point=request.bullet_point,
        target_role=request.target_role or "Software Engineer",
        target_skill=request.target_skill,
        metric_type=request.metric_type
    )
    if gemini_res is not None:
        return gemini_res

    # 2. Resilient Deterministic Fallback
    return rewrite_bullet_to_xyz(
        bullet_point=request.bullet_point,
        target_role=request.target_role,
        target_skill=request.target_skill,
        metric_type=request.metric_type
    )

@app.post("/api/rag/extract-keywords", response_model=KeywordExtractionResponse)
def extract_keywords(request: KeywordExtractionRequest):
    """
    Extracts categorized technical keywords from raw job description or CV.
    """
    categorized = extract_matched_keywords(request.text)
    all_kws = []
    for kws in categorized.values():
        all_kws.extend(kws)
    return KeywordExtractionResponse(
        keywords=sorted(list(set(all_kws))),
        categorized=categorized
    )

@app.post("/api/rag/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Directly extracts text from uploaded PDF file and triggers ATS analysis.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(content))
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
            
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract readable text from PDF.")
            
        res = analyze_resume_ats(
            resume_text=extracted_text,
            job_description=job_description,
            candidate_name=file.filename.replace(".pdf", "")
        )
        res.extracted_text = extracted_text
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction error: {str(e)}")

@app.post("/api/interview/generate-questions", response_model=GenerateInterviewQuestionsResponse)
def generate_questions(request: GenerateInterviewQuestionsRequest):
    """
    Generates 5 role-tailored technical & behavioral interview questions
    based on the target job profile and candidate context.
    """
    questions = generate_mock_interview_questions(
        role_title=request.role_title,
        job_description=request.job_description or "",
        candidate_resume=request.candidate_resume or "",
        mode=request.mode or "mixed"
    )
    return GenerateInterviewQuestionsResponse(
        role_title=request.role_title,
        total_questions=len(questions),
        questions=questions
    )

@app.post("/api/interview/evaluate-answer", response_model=EvaluateInterviewAnswerResponse)
def evaluate_answer(request: EvaluateInterviewAnswerRequest):
    """
    Evaluates candidate's interview answer, providing:
    - Score (0-100%)
    - Strengths identified
    - Missing key concepts
    - Senior Engineer Model Answer
    - Realistic Recruiter Follow-up Question
    Uses Gemini 1.5 Flash if available, with automatic fallback to Scikit-Learn STAR rubric.
    """
    if not request.user_answer.strip():
        raise HTTPException(status_code=400, detail="user_answer cannot be empty.")
    
    # 1. Try Gemini GenAI First
    gemini_eval = evaluate_interview_gemini(
        question_id=request.question_id,
        question=request.question,
        category=request.category,
        user_answer=request.user_answer,
        role_title=request.role_title or "Software Engineer"
    )
    if gemini_eval is not None:
        return gemini_eval

    # 2. Resilient Deterministic Fallback
    return evaluate_interview_answer(
        question_id=request.question_id,
        question=request.question,
        category=request.category,
        user_answer=request.user_answer,
        role_title=request.role_title or "Software Engineer"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
