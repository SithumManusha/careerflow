from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class KeywordDetail(BaseModel):
    name: str
    category: str  # "Language", "Framework", "Cloud/DevOps", "Database", "Testing", "Concepts"
    frequency_in_jd: int = 1
    found_in_resume: bool = False

class KeywordFrequencyItem(BaseModel):
    name: str
    category: str
    frequency_in_jd: int = 1
    frequency_in_resume: int = 0
    status: str = "missing"  # "optimal", "under_represented", "missing"

class ActionVerbAudit(BaseModel):
    weak_verbs_found: List[str] = []
    power_suggestions: Dict[str, List[str]] = {}
    total_power_verbs: int = 0

class CategoryScore(BaseModel):
    category: str
    score: int  # 0 to 100
    matched_count: int
    total_count: int

class ContactAudit(BaseModel):
    has_email: bool = False
    email: Optional[str] = None
    has_phone: bool = False
    phone: Optional[str] = None
    has_linkedin: bool = False
    linkedin: Optional[str] = None
    has_github: bool = False
    github: Optional[str] = None

class SectionAudit(BaseModel):
    has_experience: bool = False
    has_education: bool = False
    has_skills: bool = False
    has_projects: bool = False
    detected_sections: List[str] = []
    missing_sections: List[str] = []

class FormattingAudit(BaseModel):
    word_count: int = 0
    word_count_status: str = "optimal"  # "optimal", "short", "long"
    is_single_column_safe: bool = True
    total_bullets: int = 0
    quantified_bullets: int = 0
    quantified_percentage: float = 0.0

class SystemTelemetry(BaseModel):
    latency_ms: float = 42.0
    parser_engine: str = "pypdf v4.3 + In-Memory Stream"
    vector_features: int = 1000
    algorithm: str = "TF-IDF (1-2 N-Grams) + Cosine Similarity"

class ATSScanRequest(BaseModel):
    resume_text: str = Field(..., description="Full text extracted from candidate CV/Resume")
    job_description: str = Field(..., description="Target Job Description text")
    candidate_name: Optional[str] = "Candidate"
    target_role: Optional[str] = "Software Engineer Intern"

class ATSScanResponse(BaseModel):
    ats_score: int  # 0 to 100
    match_percentage: float
    semantic_similarity: float
    candidate_name: str
    target_role: str
    summary: str
    matched_keywords: List[str]
    missing_keywords: List[str]
    critical_missing: List[str]
    category_scores: List[CategoryScore]
    actionable_recommendations: List[str]
    extracted_text: Optional[str] = None
    contact_audit: Optional[ContactAudit] = None
    section_audit: Optional[SectionAudit] = None
    formatting_audit: Optional[FormattingAudit] = None
    telemetry: Optional[SystemTelemetry] = None
    job_match_score: int = 85
    format_health_score: int = 90
    keyword_frequency_details: List[KeywordFrequencyItem] = []
    action_verb_audit: Optional[ActionVerbAudit] = None

class XYZRewriteRequest(BaseModel):
    bullet_point: str = Field(..., description="Original weak or unquantified resume bullet point")
    target_role: Optional[str] = "Software Engineer"
    target_skill: Optional[str] = None
    metric_type: Optional[str] = "latency_or_efficiency"  # or "user_growth", "test_coverage", "delivery_time"

class XYZRewriteResponse(BaseModel):
    original_bullet: str
    rewritten_bullet: str
    formula_x: str  # Accomplished [X]
    formula_y: str  # Measured by [Y]
    formula_z: str  # By doing [Z]
    impact_boost_score: int  # e.g., +45% impact
    alternative_variations: List[str]

class KeywordExtractionRequest(BaseModel):
    text: str
    max_keywords: Optional[int] = 30

class KeywordExtractionResponse(BaseModel):
    keywords: List[str]
    categorized: Dict[str, List[str]]

class InterviewQuestion(BaseModel):
    id: str
    category: str  # "Core Technical", "System Architecture", "Debugging & Resiliency", "Behavioral (STAR)"
    question: str
    recruiter_intent: str
    suggested_keywords: List[str] = []
    rubric: str

class GenerateInterviewQuestionsRequest(BaseModel):
    role_title: str = "Backend Engineer (Java / Cloud)"
    job_description: Optional[str] = ""
    candidate_resume: Optional[str] = ""
    difficulty: Optional[str] = "intern_junior"
    mode: Optional[str] = "mixed"

class GenerateInterviewQuestionsResponse(BaseModel):
    role_title: str
    total_questions: int
    questions: List[InterviewQuestion]

class EvaluateInterviewAnswerRequest(BaseModel):
    question_id: str
    question: str
    category: str
    user_answer: str
    role_title: Optional[str] = "Software Engineer"

class EvaluateInterviewAnswerResponse(BaseModel):
    question_id: str
    score: int  # 0 to 100
    strengths: List[str]
    missing_key_concepts: List[str]
    evaluation_breakdown: str
    model_answer: str
    follow_up_question: str

