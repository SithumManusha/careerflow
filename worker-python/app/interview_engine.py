import re
from typing import List, Dict, Any
from app.models import InterviewQuestion, EvaluateInterviewAnswerResponse

ROLE_QUESTION_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "backend": [
        {
            "id": "java-be-1",
            "category": "Core Technical & JVM",
            "question": "How does the JVM handle Garbage Collection (e.g., generational heap with Young vs Old generation), and how would you diagnose and resolve an OutOfMemoryError in a Spring Boot service?",
            "recruiter_intent": "Tests deep understanding of JVM memory architecture, memory leak detection (heap dumps/VisualVM), and heap allocation sizing.",
            "suggested_keywords": ["Young generation", "Old generation", "Eden", "Survivor", "Heap dump", "VisualVM", "Garbage Collection", "G1GC"],
            "rubric": "High score explains generational hypothesis, difference between Heap and Metaspace, and tools for profiling heap dumps."
        },
        {
            "id": "java-be-2",
            "category": "Architecture & Distributed Systems",
            "question": "How would you design a distributed rate-limiting mechanism across multiple Spring Boot microservice instances using Redis? What happens if Redis temporarily goes down?",
            "recruiter_intent": "Evaluates knowledge of token-bucket or sliding-window algorithms, Redis atomic operations (Lua scripts/INCR), and graceful degradation/fallback.",
            "suggested_keywords": ["Token-bucket", "Redis", "Atomic CAS", "Sliding window", "Circuit breaker", "Fallback", "Graceful degradation"],
            "rubric": "Evaluates concurrency control, atomicity with Redis, and resiliency fallback when cache is unreachable."
        },
        {
            "id": "java-be-3",
            "category": "Databases & ORM Optimization",
            "question": "What causes the N+1 query problem in Spring Data JPA / Hibernate, and what are two effective architectural approaches (e.g., JOIN FETCH, EntityGraph) to eliminate it?",
            "recruiter_intent": "Checks production database query optimization skills, lazy loading traps, and awareness of relational database traffic.",
            "suggested_keywords": ["Lazy loading", "JOIN FETCH", "EntityGraph", "N+1 problem", "Batch fetching", "Hibernate", "Index"],
            "rubric": "Must explain why lazy-loaded relationships trigger N additional queries and how eager join or entity graph batching solves it."
        },
        {
            "id": "java-be-4",
            "category": "Resiliency & Fault Tolerance",
            "question": "If an external downstream microservice starts timing out with 504 Gateway Timeouts under heavy load, how do you implement circuit breakers and retries without causing a cascading failure?",
            "recruiter_intent": "Assesses distributed systems stability, Resilience4j / Hystrix principles, exponential backoff, and bulkhead isolation.",
            "suggested_keywords": ["Circuit breaker", "Resilience4j", "Exponential backoff", "Jitter", "Fallback cache", "Bulkhead", "Cascading failure"],
            "rubric": "Looks for open/closed/half-open circuit states, exponential backoff with jitter, and stale-cache fallback."
        },
        {
            "id": "java-be-5",
            "category": "Behavioral (STAR Method)",
            "question": "Tell me about a time you encountered a critical production incident or an unexpected technical blocker close to a deadline. Walk me through your Situation, Task, Action, and Result.",
            "recruiter_intent": "Evaluates composure under pressure, root-cause troubleshooting methodology, clear communication, and post-mortem ownership.",
            "suggested_keywords": ["Situation", "Task", "Action", "Result", "Metric", "Root cause", "Post-mortem", "Communication"],
            "rubric": "Requires clear STAR structure with measurable outcome (e.g., restored service in 20 minutes, added alerts)."
        }
    ],
    "fullstack": [
        {
            "id": "fs-1",
            "category": "Modern Frontend Architecture",
            "question": "In Next.js 14 App Router, what is the architectural difference between React Server Components (RSC) and Client Components? When should you strictly avoid adding 'use client'?",
            "recruiter_intent": "Tests understanding of server-side data fetching, zero-bundle-size React components, and avoiding hydration overhead.",
            "suggested_keywords": ["Server Components", "Client Components", "use client", "Hydration", "Bundle size", "Security", "Data fetching"],
            "rubric": "Must explain that RSCs execute only on server with zero client JS bundle, while 'use client' is for interactivity/hooks."
        },
        {
            "id": "fs-2",
            "category": "API Integration & State Management",
            "question": "How do you design a reliable API synchronization layer in React with optimistic UI updates, background revalidation, and graceful rollback on network failure?",
            "recruiter_intent": "Evaluates user experience design, state management (TanStack Query / SWR / optimistic state), and network error handling.",
            "suggested_keywords": ["Optimistic UI", "Rollback", "TanStack Query", "SWR", "Cache invalidation", "Error boundary"],
            "rubric": "Should cover updating local state immediately for snappy UX and reverting state if the HTTP request returns an error."
        },
        {
            "id": "fs-3",
            "category": "Full-Stack Security & Authentication",
            "question": "How do you securely handle user authentication between a Next.js frontend and a Java Spring Boot backend? Why are HttpOnly cookies preferred over localStorage for JWT tokens?",
            "recruiter_intent": "Checks security best practices, XSS defense, CSRF mitigation, and stateless JWT token rotation.",
            "suggested_keywords": ["HttpOnly", "XSS", "CSRF", "JWT", "SameSite", "LocalStorage vulnerability", "Refresh token"],
            "rubric": "Must articulate that localStorage is readable by malicious XSS scripts, while HttpOnly cookies cannot be accessed by client JavaScript."
        },
        {
            "id": "fs-4",
            "category": "Web Performance & Core Vitals",
            "question": "How do you diagnose and improve Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) in a high-traffic web application?",
            "recruiter_intent": "Assesses performance profiling, image optimization, dynamic imports, skeleton loaders, and web vitals metrics.",
            "suggested_keywords": ["LCP", "CLS", "Next/Image", "Web Vitals", "Code splitting", "Skeleton loader", "Layout shift"],
            "rubric": "Looks for image preloading/priority, reserving dimension slots for dynamic content, and code splitting."
        },
        {
            "id": "fs-5",
            "category": "Behavioral (STAR Method)",
            "question": "Describe a project where you had to negotiate technical trade-offs with a designer or product manager due to performance or timeline limits. How did you handle it?",
            "recruiter_intent": "Evaluates cross-functional communication, empathy for product goals, and pragmatic engineering trade-offs.",
            "suggested_keywords": ["Trade-off", "Communication", "Phased rollout", "MVP", "Stakeholder", "STAR", "Outcome"],
            "rubric": "Requires a structured STAR narrative detailing the conflict, proposed compromise, and successful delivery."
        }
    ],
    "cloud": [
        {
            "id": "cloud-1",
            "category": "Python & Async Architecture",
            "question": "How does Python's asyncio event loop in FastAPI work under the hood, and what happens if a developer runs a blocking CPU-heavy calculation inside an 'async def' route?",
            "recruiter_intent": "Tests fundamental concurrency knowledge, event loop starvation, thread pool offloading (run_in_threadpool), and Celery/background workers.",
            "suggested_keywords": ["Asyncio", "Event loop", "Blocking I/O", "Thread pool", "Worker", "FastAPI", "Uvicorn"],
            "rubric": "Must explain that blocking code stalls the single event loop, freezing all concurrent requests, requiring ThreadPoolExecutor."
        },
        {
            "id": "cloud-2",
            "category": "Containerization & Multi-Stage Builds",
            "question": "What techniques do you use to write an enterprise-grade production Dockerfile for Python or Java, ensuring minimal image size and maximum container security?",
            "recruiter_intent": "Evaluates Docker best practices: multi-stage builds, non-root user, caching dependency layers, and omitting build tools.",
            "suggested_keywords": ["Multi-stage build", "Non-root user", "Alpine/Distroless", "Layer caching", "Secrets", "Image footprint"],
            "rubric": "Should highlight separating build environment from slim runtime environment and running as non-root."
        },
        {
            "id": "cloud-3",
            "category": "Microservice Architecture & REST vs gRPC",
            "question": "Compare REST APIs with gRPC for internal service-to-service communication. When is HTTP/JSON preferred, and when does Protocol Buffers over HTTP/2 win?",
            "recruiter_intent": "Assesses distributed systems communication protocols, serialization overhead, schema evolution, and debugging ease.",
            "suggested_keywords": ["gRPC", "Protocol Buffers", "HTTP/2", "Multiplexing", "Serialization", "REST", "Binary payload"],
            "rubric": "Evaluates trade-offs: gRPC is faster and type-safe for internal high-throughput streams; REST is simpler for public client integration."
        },
        {
            "id": "cloud-4",
            "category": "Data Architecture & Vector Search",
            "question": "Explain the difference between lexical keyword matching (like TF-IDF or BM25) and dense vector embeddings with cosine similarity. How would a hybrid search combine both?",
            "recruiter_intent": "Evaluates modern AI/RAG knowledge, inverted index vs semantic vector space, and reciprocal rank fusion.",
            "suggested_keywords": ["TF-IDF", "Vector embeddings", "Cosine similarity", "Hybrid search", "Semantic", "Sparse vs Dense", "RAG"],
            "rubric": "Should contrast exact keyword precision (TF-IDF) with conceptual semantic similarity (embeddings), noting hybrid search covers both."
        },
        {
            "id": "cloud-5",
            "category": "Behavioral (STAR Method)",
            "question": "Tell me about a time you identified an architectural flaw or scalability bottleneck in a project. How did you convince your team to address it?",
            "recruiter_intent": "Assesses technical leadership, data-driven persuasion (benchmarks, latency spikes), and execution.",
            "suggested_keywords": ["Benchmarking", "Latency", "Bottleneck", "Data-driven", "Team alignment", "STAR", "Resolution"],
            "rubric": "Strong answer shows benchmarking evidence used to gain team buy-in, followed by measurable performance gains."
        }
    ]
}

def generate_mock_interview_questions(
    role_title: str,
    job_description: str = "",
    candidate_resume: str = "",
    mode: str = "mixed"
) -> List[InterviewQuestion]:
    """
    Generates 5 tailored technical & behavioral interview questions.
    """
    role_lower = role_title.lower() if role_title else ""
    if "full" in role_lower:
        raw_list = ROLE_QUESTION_BANKS["fullstack"]
    elif "backend" in role_lower:
        raw_list = ROLE_QUESTION_BANKS["backend"]
    elif "cloud" in role_lower or "python" in role_lower:
        raw_list = ROLE_QUESTION_BANKS["cloud"]
    else:
        raw_list = ROLE_QUESTION_BANKS["backend"]

    # Filter based on mode if requested
    if mode == "technical":
        filtered = [q for q in raw_list if "Behavioral" not in q["category"]]
    elif mode == "behavioral":
        filtered = [q for q in raw_list if "Behavioral" in q["category"]]
    else:
        filtered = raw_list

    # Ensure 5 questions
    if len(filtered) < 5:
        filtered = raw_list

    return [
        InterviewQuestion(
            id=item["id"],
            category=item["category"],
            question=item["question"],
            recruiter_intent=item["recruiter_intent"],
            suggested_keywords=item.get("suggested_keywords", []),
            rubric=item["rubric"]
        )
        for item in filtered[:5]
    ]

def evaluate_interview_answer(
    question_id: str,
    question: str,
    category: str,
    user_answer: str,
    role_title: str = "Software Engineer"
) -> EvaluateInterviewAnswerResponse:
    """
    Evaluates a candidate's answer with deterministic scoring, strengths,
    missing concepts, model answers, and realistic recruiter follow-ups.
    """
    cleaned_answer = user_answer.strip()
    words = cleaned_answer.split()
    word_count = len(words)

    # Base score calculation based on depth and technical density
    score = 50
    strengths: List[str] = []
    missing_key_concepts: List[str] = []
    
    # 1. Depth & Length evaluation
    if word_count < 25:
        score = max(35, min(50, word_count * 2))
        missing_key_concepts.append("Answer is too brief for an enterprise interview. Aim for 70–150 words with concrete technical explanations.")
    elif word_count < 60:
        score = 65
        strengths.append("Direct answer that introduces core principles.")
        missing_key_concepts.append("Could elaborate on edge cases, failure scenarios, and performance trade-offs.")
    else:
        score = 80
        strengths.append(f"Comprehensive technical depth ({word_count} words) with thorough explanations.")

    # 2. Check for technical impact markers
    technical_markers = [
        "latency", "throughput", "cache", "redis", "index", "concurrency", "thread",
        "lock", "asynchronous", "event loop", "memory", "heap", "isolation", "transaction",
        "circuit breaker", "docker", "pipeline", "http", "rest", "metric", "scale", "trade-off"
    ]
    detected_markers = [m for m in technical_markers if re.search(rf"\b{m}\b", cleaned_answer, re.IGNORECASE)]
    
    if len(detected_markers) >= 3:
        score = min(96, score + 12)
        strengths.append(f"Strong engineering vocabulary: applied key terminology ({', '.join(detected_markers[:4])}).")
    elif len(detected_markers) == 0:
        score = max(40, score - 10)
        missing_key_concepts.append("Lacks specific technical terminology or concrete architectural concepts.")

    # 3. Behavioral STAR analysis if behavioral question
    is_behavioral = "behavioral" in category.lower() or "star" in question.lower()
    if is_behavioral:
        has_situation = bool(re.search(r"\b(situation|context|project|problem|when|was)\b", cleaned_answer, re.IGNORECASE))
        has_action = bool(re.search(r"\b(action|i decided|i implemented|i investigated|i designed|i built)\b", cleaned_answer, re.IGNORECASE))
        has_result = bool(re.search(r"\b(result|outcome|improved|reduced|increased|delivered|learned|%)\b", cleaned_answer, re.IGNORECASE))
        
        star_points = sum([has_situation, has_action, has_result])
        if star_points == 3:
            score = min(98, score + 10)
            strengths.append("Well-structured STAR narrative: clearly establishes Context, Personal Action, and Measurable Outcome.")
        elif not has_result:
            missing_key_concepts.append("Missing the 'Result' in STAR: specify what business impact or metric improvement occurred.")

    # Cap score
    final_score = min(98, max(30, score))

    # Generate Model Answer & Follow-up Question dynamically
    if "rate-limit" in question.lower() or "redis" in question.lower():
        model_answer = (
            "In an enterprise microservice architecture, I implement distributed rate limiting using Redis and the Token-Bucket algorithm. "
            "Each API client has a bucket key in Redis with a token capacity and refill rate. When a request arrives, we execute an atomic Lua script "
            "to check and decrement tokens in a single round-trip, preventing race conditions across multiple application replicas. "
            "If Redis experiences downtime, we employ a local in-memory fallback (e.g., Bucket4j / Guava) and log a telemetry alert, "
            "ensuring legitimate traffic is not abruptly dropped while defending backend services against cascading failure."
        )
        follow_up = "How would you differentiate rate limits between unauthenticated public endpoints and tiered enterprise subscription API keys?"
    elif "garbage" in question.lower() or "jvm" in question.lower() or "memory" in question.lower():
        model_answer = (
            "The JVM utilizes a generational heap architecture divided into Young Generation (Eden and two Survivor spaces) and Old Generation. "
            "Short-lived objects are allocated in Eden and cleared during lightweight Minor GCs. Objects surviving multiple cycles are promoted to the Old Generation, "
            "collected by algorithms like G1GC or ZGC to minimize Stop-the-World pauses. "
            "To diagnose an OutOfMemoryError, I configure `-XX:+HeapDumpOnOutOfMemoryError`, extract the `.hprof` snapshot, and analyze it in Eclipse Memory Analyzer (MAT) "
            "or VisualVM to identify unreleased static references, unclosed database connection pools, or bloated cache collections."
        )
        follow_up = "What is the difference between a heap space OutOfMemoryError and a Metaspace OutOfMemoryError, and how do you resolve the latter?"
    elif "n+1" in question.lower() or "jpa" in question.lower() or "hibernate" in question.lower():
        model_answer = (
            "The N+1 problem occurs when Hibernate executes 1 query to fetch parent records and subsequently executes N separate queries to fetch each parent's lazy-loaded child collection. "
            "To eliminate this, I use a JOIN FETCH query in JPQL (`SELECT p FROM Parent p JOIN FETCH p.children`) to retrieve both entities in a single SQL query. "
            "Alternatively, I configure a `@NamedEntityGraph` on the repository method, or set `hibernate.default_batch_fetch_size: 25` to fetch children in batches via SQL `WHERE id IN (...)`."
        )
        follow_up = "When using JOIN FETCH with multiple `@OneToMany` collections, how do you prevent Cartesian product issues in Hibernate?"
    elif is_behavioral:
        model_answer = (
            "Situation: During the release phase of an enterprise web portal, our payment gateway microservice exhibited intermittent 504 timeouts under peak traffic.\n"
            "Task: As the backend engineer, I was responsible for isolating the bottleneck and stabilizing throughput before the client demo.\n"
            "Action: I analyzed p95 database query logs and discovered missing compound indexes causing full-table locks. I added indexing migrations, integrated Redis caching for repeated reads, and configured Resilience4j circuit breakers.\n"
            "Result: p95 latency plummeted from 1,850ms to 42ms, eliminating all 504 errors and ensuring a seamless deployment."
        )
        follow_up = "If you had to do that project over again, what architectural safeguards would you introduce during the design phase to catch the issue earlier?"
    else:
        model_answer = (
            "A senior engineering answer should directly address the core technical mechanism, analyze architectural trade-offs (e.g., latency vs consistency in CAP theorem), "
            "explain production failure modes, and provide quantifiable metrics illustrating real-world application."
        )
        follow_up = "Can you describe how this design would scale if the system experienced a 10x traffic surge over the next 6 months?"

    breakdown = (
        f"Candidate scored {final_score}% based on technical terminology density, completeness ({word_count} words), "
        f"and structured problem breakdown."
    )

    return EvaluateInterviewAnswerResponse(
        question_id=question_id,
        score=final_score,
        strengths=strengths if strengths else ["Clear initial answer attempted."],
        missing_key_concepts=missing_key_concepts if missing_key_concepts else ["Good coverage of primary concepts."],
        evaluation_breakdown=breakdown,
        model_answer=model_answer,
        follow_up_question=follow_up
    )
