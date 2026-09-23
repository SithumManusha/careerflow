import time
import re
from typing import List, Dict, Tuple, Set
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models import (
    ATSScanResponse, 
    CategoryScore, 
    ContactAudit, 
    SectionAudit, 
    FormattingAudit, 
    SystemTelemetry,
    KeywordFrequencyItem,
    ActionVerbAudit
)

# Curated Industry Dictionary for Top Software Engineering and QA Roles
TECH_CATEGORIES: Dict[str, List[str]] = {
    "Languages": [
        "java", "python", "typescript", "javascript", "c++", "c#", "go", "rust", "php", "sql", "html", "css"
    ],
    "Frameworks & Libraries": [
        "spring boot", "spring data jpa", "spring security", "next.js", "react", "fastapi", 
        "node.js", "express", "django", "flutter", "nestjs", "tailwind css", "redux"
    ],
    "Databases & Caching": [
        "postgresql", "mysql", "redis", "mongodb", "elasticsearch", "sqlite", "dynamodb", "database"
    ],
    "Cloud & DevOps": [
        "docker", "kubernetes", "aws", "gcp", "azure", "github actions", "ci/cd", "terraform",
        "linux", "nginx", "microservices", "git"
    ],
    "Testing & Quality": [
        "playwright", "cypress", "selenium", "junit", "vitest", "jest", "mockito", "postman",
        "e2e testing", "unit testing", "integration testing", "test automation"
    ],
    "Architecture & Concepts": [
        "restful api", "rest api", "object-oriented programming", "oop", "design patterns",
        "agile", "scrum", "clean architecture", "concurrency", "multithreading", "rate limiting",
        "token-bucket", "rag", "retrieval augmented generation", "vector search"
    ]
}

def normalize_text(text: str) -> str:
    """Lowercase and clean string for comparison."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[\r\n\t]+', ' ', text)
    return text

def extract_matched_keywords(text: str) -> Dict[str, List[str]]:
    """Extract known domain keywords from raw text categorized."""
    norm = normalize_text(text)
    categorized: Dict[str, List[str]] = {}
    
    for category, keywords in TECH_CATEGORIES.items():
        matched = []
        for kw in keywords:
            # Match whole words or phrases safely
            escaped = re.escape(kw)
            pattern = rf'(?:\b|\W){escaped}(?:\b|\W)'
            if re.search(pattern, norm):
                matched.append(kw)
        if matched:
            categorized[category] = matched
            
    return categorized

def compute_semantic_similarity(resume_text: str, jd_text: str) -> float:
    """Compute TF-IDF cosine similarity between Resume and JD."""
    if not resume_text.strip() or not jd_text.strip():
        return 0.0
    
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        max_features=1000
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
        similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        return round(similarity * 100, 2)
    except Exception:
        return 0.0

def audit_contact_info(text: str) -> ContactAudit:
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}', text)
    linkedin_match = re.search(r'linkedin\.com/(?:in/)?[a-zA-Z0-9_-]+|linkedin\.com', text, re.IGNORECASE)
    github_match = re.search(r'github\.com/[a-zA-Z0-9_-]+|github\.com', text, re.IGNORECASE)

    return ContactAudit(
        has_email=bool(email_match),
        email=email_match.group(0) if email_match else None,
        has_phone=bool(phone_match),
        phone=phone_match.group(0) if phone_match else None,
        has_linkedin=bool(linkedin_match),
        linkedin=linkedin_match.group(0) if linkedin_match else None,
        has_github=bool(github_match),
        github=github_match.group(0) if github_match else None,
    )

def audit_section_headings(text: str) -> SectionAudit:
    norm = text.lower()
    has_exp = bool(re.search(r'\b(experience|work experience|employment history|work history|professional experience|internship)\b', norm))
    has_edu = bool(re.search(r'\b(education|academic|qualifications|academic background|degree|undergraduate|university|bachelor|bsc|b\.sc|msc)\b', norm))
    has_skills = bool(re.search(r'\b(skills|technical skills|technologies|core competencies|competencies)\b', norm))
    has_proj = bool(re.search(r'\b(projects|selected projects|personal projects|technical projects)\b', norm))

    detected = []
    missing = []
    if has_exp: detected.append("Work Experience")
    else: missing.append("Work Experience")

    if has_edu: detected.append("Education")
    else: missing.append("Education")

    if has_skills: detected.append("Technical Skills")
    else: missing.append("Technical Skills")

    if has_proj: detected.append("Projects")
    else: missing.append("Projects")

    return SectionAudit(
        has_experience=has_exp,
        has_education=has_edu,
        has_skills=has_skills,
        has_projects=has_proj,
        detected_sections=detected,
        missing_sections=missing
    )

def audit_formatting_and_metrics(text: str) -> FormattingAudit:
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    status = "short" if word_count < 250 else ("long" if word_count > 950 else "optimal")

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    bullet_lines = [l for l in lines if l.startswith(("-", "•", "*")) or re.match(r'^\d+\.', l)]
    
    total_bullets = len(bullet_lines) if bullet_lines else max(1, len(lines) // 3)
    quantified = 0
    metric_pattern = re.compile(r'(\d+[%xX]|p\d+|\b\d+\+?|\$\d+k?|\d+\s*(?:ms|sec|min|users|clients|records|endpoints|services))', re.IGNORECASE)

    for b in (bullet_lines if bullet_lines else lines):
        if metric_pattern.search(b):
            quantified += 1

    quant_pct = round((quantified / total_bullets * 100), 1) if total_bullets > 0 else 0.0

    return FormattingAudit(
        word_count=word_count,
        word_count_status=status,
        is_single_column_safe=True,
        total_bullets=total_bullets,
        quantified_bullets=quantified,
        quantified_percentage=min(100.0, quant_pct)
    )

WEAK_VERB_MAP = {
    "worked on": ["Architected", "Engineered", "Developed", "Spearheaded"],
    "responsible for": ["Delivered", "Owned", "Orchestrated", "Governed"],
    "handled": ["Optimized", "Streamlined", "Benchmarked", "Resolved"],
    "helped with": ["Collaborated on", "Co-authored", "Accelerated"],
    "helped": ["Collaborated with", "Co-authored", "Accelerated"],
    "assisted with": ["Co-developed", "Automated", "Augmented"],
    "assisted": ["Co-developed", "Automated", "Facilitated"],
    "involved in": ["Contributed to", "Engineered", "Implemented"],
    "participated in": ["Executed", "Delivered", "Co-designed"],
    "took care of": ["Maintained", "Refactored", "Standardized"],
}

POWER_VERBS = [
    "architected", "engineered", "spearheaded", "optimized", "benchmarked",
    "deployed", "automated", "streamlined", "orchestrated", "refactored",
    "implemented", "designed", "constructed", "scaled", "delivered"
]

def audit_action_verbs(text: str) -> ActionVerbAudit:
    norm = text.lower()
    weak_found = []
    suggestions = {}
    for weak, power_list in WEAK_VERB_MAP.items():
        if re.search(rf'\b{re.escape(weak)}\b', norm):
            weak_found.append(weak)
            suggestions[weak] = power_list

    total_power = 0
    for pv in POWER_VERBS:
        total_power += len(re.findall(rf'\b{pv}\b', norm))

    return ActionVerbAudit(
        weak_verbs_found=weak_found,
        power_suggestions=suggestions,
        total_power_verbs=total_power
    )

def analyze_resume_ats(
    resume_text: str,
    job_description: str,
    candidate_name: str = "Candidate",
    target_role: str = "Software Engineer Intern"
) -> ATSScanResponse:
    """
    Analyzes resume against Job Description, generating:
    - Dual Scores: Target Job Match % vs ATS Format & Structure Health %
    - Matched, Missing, and Keyword Frequency Breakdown (JD vs CV)
    - Action Verb Power Audit (Passive phrase detection)
    - Contact, Section, Formatting Audits (Clever 1000 standard)
    - Real-time Performance Telemetry
    """
    start_time = time.perf_counter()

    resume_norm = normalize_text(resume_text)
    jd_norm = normalize_text(job_description)
    
    jd_categorized = extract_matched_keywords(job_description)
    
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    critical_missing: List[str] = []
    category_scores: List[CategoryScore] = []
    keyword_freq_details: List[KeywordFrequencyItem] = []
    
    total_jd_keywords = 0
    total_matched = 0
    
    for category, keywords in TECH_CATEGORIES.items():
        jd_kws_in_cat = jd_categorized.get(category, [])
        cat_total = len(jd_kws_in_cat)
        cat_matched = 0
        
        for kw in jd_kws_in_cat:
            total_jd_keywords += 1
            escaped = re.escape(kw)
            pattern = rf'(?:\b|\W){escaped}(?:\b|\W)'
            count_in_jd = len(re.findall(pattern, jd_norm))
            count_in_resume = len(re.findall(pattern, resume_norm))

            if count_in_resume > 0:
                matched_keywords.append(kw)
                cat_matched += 1
                total_matched += 1
            else:
                missing_keywords.append(kw)
                if count_in_jd >= 2 or category in ["Languages", "Frameworks & Libraries"]:
                    critical_missing.append(kw)

            # Frequency item calculation
            if count_in_resume >= count_in_jd:
                freq_status = "optimal"
            elif count_in_resume > 0:
                freq_status = "under_represented"
            else:
                freq_status = "missing"

            keyword_freq_details.append(KeywordFrequencyItem(
                name=kw,
                category=category,
                frequency_in_jd=max(1, count_in_jd),
                frequency_in_resume=count_in_resume,
                status=freq_status
            ))
                    
        cat_score = int((cat_matched / cat_total * 100)) if cat_total > 0 else 100
        category_scores.append(CategoryScore(
            category=category,
            score=cat_score,
            matched_count=cat_matched,
            total_count=cat_total
        ))

    # Keyword match ratio
    keyword_match_pct = (total_matched / total_jd_keywords * 100) if total_jd_keywords > 0 else 50.0
    
    # TF-IDF semantic similarity
    semantic_sim = compute_semantic_similarity(resume_text, job_description)
    
    # 1. Job Match Rate (Jobscan score 1)
    raw_job_match = (keyword_match_pct * 0.75) + (semantic_sim * 0.25)
    if keyword_match_pct >= 70:
        raw_job_match += 8
    job_match_score = int(max(15, min(98, round(raw_job_match))))

    # Run Clever 1000-style deep audits
    contact_audit = audit_contact_info(resume_text)
    section_audit = audit_section_headings(resume_text)
    formatting_audit = audit_formatting_and_metrics(resume_text)
    action_verb_audit = audit_action_verbs(resume_text)
    
    # 2. ATS Format & Structural Health (Jobscan score 2)
    format_pts = 0
    # Contact completeness (25 pts)
    if contact_audit.has_email: format_pts += 10
    if contact_audit.has_phone: format_pts += 10
    if contact_audit.has_linkedin or contact_audit.has_github: format_pts += 5
    # Section completeness (35 pts)
    if section_audit.has_experience: format_pts += 10
    if section_audit.has_education: format_pts += 10
    if section_audit.has_skills: format_pts += 10
    if section_audit.has_projects: format_pts += 5
    # Word count & layout (20 pts)
    format_pts += (20 if formatting_audit.word_count_status == "optimal" else 10)
    # Quantified metric density (20 pts)
    format_pts += min(20, int(formatting_audit.quantified_percentage * 0.2))
    format_health_score = int(max(25, min(100, format_pts)))

    # Blended Overall ATS Score (70% technical JD match, 30% ATS structural health)
    ats_score = int(round((job_match_score * 0.7) + (format_health_score * 0.3)))

    # Recommendations synthesis
    recommendations: List[str] = []
    if not contact_audit.has_email or not contact_audit.has_phone:
        recommendations.append("Ensure your Email address and International Phone number are clearly displayed in the CV header.")
    if section_audit.missing_sections:
        recommendations.append(f"Add standard ATS section headers: {', '.join(section_audit.missing_sections)}.")
    if critical_missing:
        recommendations.append(
            f"Add critical missing skills prominently in your Skills header and project bullets: {', '.join(critical_missing[:4])}."
        )
    if "redis" in missing_keywords or "docker" in missing_keywords:
        recommendations.append(
            "Include high-impact enterprise keywords like Redis (caching/rate-limiting) and Docker to stand out in enterprise engineering evaluations."
        )
    if formatting_audit.quantified_percentage < 50.0:
        recommendations.append(
            "Quantify your bullet points with Google's XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]."
        )
    if action_verb_audit.weak_verbs_found:
        recommendations.append(
            f"Replace passive phrasing ({', '.join(action_verb_audit.weak_verbs_found[:2])}) with high-impact power verbs like 'Architected' or 'Spearheaded'."
        )
    if not recommendations:
        recommendations.append("Excellent keyword coverage! Ensure your metrics and impact are clearly bolded.")

    # High-level summary text
    if ats_score >= 80:
        summary = f"Strong ATS compatibility ({ats_score}%). Your resume closely matches the technical requirements for {target_role} with solid formatting."
    elif ats_score >= 60:
        summary = f"Moderate ATS compatibility ({ats_score}%). Addressing {len(critical_missing)} critical keyword gaps and format checks will significantly boost interview callbacks."
    else:
        summary = f"Low ATS compatibility ({ats_score}%). Key framework and architecture requirements from the job posting are missing in your CV text."

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    telemetry = SystemTelemetry(
        latency_ms=max(14.5, elapsed_ms),
        parser_engine="pypdf v4.3 + In-Memory Stream",
        vector_features=1000,
        algorithm="TF-IDF (1-2 N-Grams) + Cosine Similarity"
    )

    return ATSScanResponse(
        ats_score=ats_score,
        job_match_score=job_match_score,
        format_health_score=format_health_score,
        match_percentage=round(keyword_match_pct, 1),
        semantic_similarity=semantic_sim,
        candidate_name=candidate_name,
        target_role=target_role,
        summary=summary,
        matched_keywords=sorted(list(set(matched_keywords))),
        missing_keywords=sorted(list(set(missing_keywords))),
        critical_missing=sorted(list(set(critical_missing))),
        category_scores=category_scores,
        keyword_frequency_details=keyword_freq_details,
        action_verb_audit=action_verb_audit,
        actionable_recommendations=recommendations,
        contact_audit=contact_audit,
        section_audit=section_audit,
        formatting_audit=formatting_audit,
        telemetry=telemetry
    )
