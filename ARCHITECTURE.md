# 🏛️ CareerFlow System Architecture & Design

This document describes the architectural principles, data flows, concurrency controls, and security boundaries implemented in **CareerFlow**.

---

## 🏗️ 1. High-Level Decoupled Microservices Architecture

CareerFlow is engineered on a distributed, microservices-oriented topology designed for high availability, low latency, and clear separation of concerns.

```mermaid
flowchart TD
    Client["User Browser / Client<br/>(Desktop & Mobile)"]

    subgraph Presentation_Tier["Presentation Tier (Port 3000)"]
        FE["Next.js 14 App Router<br/>(React 18, Tailwind CSS, Lucide Icons)"]
        A4["Deterministic Single-Column A4 Budgeting<br/>(Real-time Canvas & Pixel Math)"]
        FE --- A4
    end

    subgraph Gateway_Tier["Core Gateway & Enterprise Backend (Port 8080)"]
        SB["Spring Boot 3 + Java 21 REST API"]
        RL["Token-Bucket Rate Limiter<br/>(Lock-free Atomic CAS Concurrency)"]
        AUTH["Cryptographic Salted Hashing & Bearer Sessions"]
        TENANT["Multi-Tenant Candidate Isolation Service"]
        FALLBACK["Resilient Fallback Engine"]
        
        SB --- RL
        SB --- AUTH
        SB --- TENANT
        SB --- FALLBACK
    end

    subgraph Intelligence_Tier["AI & NLP Worker Tier (Port 8000)"]
        FA["FastAPI Python 3.12 Microservice"]
        GEMINI["Google Gemini 1.5 Flash<br/>(GenAI Contextual Rewriter & STAR Evaluator)"]
        TFIDF["Scikit-Learn NLP Engine<br/>(TF-IDF Vectorizer + Cosine Similarity)"]
        RUBRIC["Google XYZ & STAR Behavioral Rubrics"]
        
        FA --> GEMINI
        FA --> TFIDF
        FA --- RUBRIC
    end

    subgraph Persistence_Tier["Persistence & Cache Tier"]
        DB[("PostgreSQL / H2<br/>Relational Database")]
        REDIS[("Redis Cache<br/>Distributed Tokens")]
    end

    Client <-->|"HTTPS / REST"| FE
    FE <-->|"JSON over HTTP"| SB
    SB <-->|"Internal HTTP"| FA
    SB <-->|"JPA / Hibernate"| DB
    SB <-->|"Lettuce Client"| REDIS
```

---

## ⚡ 2. End-to-End Candidate Intelligence Flow

The sequence diagram below traces an ATS resume scan and bullet point optimization request across all tiers:

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Frontend as Next.js 14 Frontend
    participant Gateway as Spring Boot 3 Gateway
    participant RateLimiter as Atomic Token-Bucket Limiter
    participant Worker as FastAPI NLP Worker
    participant Gemini as Google Gemini 1.5 Flash
    participant Fallback as Scikit-Learn TF-IDF Fallback
    participant DB as PostgreSQL Database

    Candidate->>Frontend: Submits Resume Text + Target Job Description
    Frontend->>Gateway: POST /api/ats/scan (with Bearer Token)
    Gateway->>RateLimiter: tryConsume(clientIp)
    alt Rate Limit Exceeded (>10 req/min)
        RateLimiter-->>Frontend: 429 Too Many Requests
    else Token Acquired
        Gateway->>Worker: POST /api/rag/analyze-ats
        alt Gemini API Active
            Worker->>Gemini: Stream Contextual Analysis
            Gemini-->>Worker: Deep Semantic Feedback
        else Quota Exceeded / Fallback
            Worker->>Fallback: TF-IDF Vectorization & Cosine Similarity
            Fallback-->>Worker: Deterministic Scores (75% Keyword + 25% Cosine)
        end
        Worker-->>Gateway: ATSScanResponseDTO
        Gateway->>DB: Persist Audit Record (Scoped to userId)
        Gateway-->>Frontend: Return Scan Matrix & Dual Gauges (68% / 72%)
        Frontend-->>Candidate: Render Real-time Score Gauges & Actionable Recommendations
    end
```

---

## 🧮 3. Algorithmic Deep Dives

### A. Two-Tier ATS Composite Scoring Algorithm
The ATS scanner evaluates resumes across technical job relevance and Taleo/Workday structural health:

1. **TF-IDF Semantic Vectorization:**
   $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D|}{1 + |\{d \in D : t \in d\}|}\right)$$
2. **Cosine Similarity:**
   $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$
3. **Blended Composite Score:**
   $$\text{raw\_job\_match} = (0.75 \times \text{keyword\_match\_pct}) + (0.25 \times \text{semantic\_sim})$$
   $$\text{overall\_ats\_score} = (0.70 \times \text{job\_match\_score}) + (0.30 \times \text{format\_health\_score})$$

### B. Lock-Free Atomic CAS Rate Limiter
To eliminate lock contention and thread starvation under high concurrent traffic, the rate limiter utilizes `AtomicInteger` and `AtomicLong` with Compare-And-Swap (CAS) loops:

```java
// Thread-safe lock-free consumption in RateLimiterService.java
int currentTokens = bucket.tokens.get();
while (currentTokens > 0) {
    if (bucket.tokens.compareAndSet(currentTokens, currentTokens - 1)) {
        return true; // Successfully acquired token without lock bottlenecks
    }
    currentTokens = bucket.tokens.get();
}
return false; // Rate limit exceeded (10 requests/min window)
```

---

## 🔒 4. Enterprise Security & Multi-Tenant Data Isolation

1. **Cryptographic Salted Hashing:**
   Candidate passwords are never stored in plaintext. Each account generates a cryptographically secure 16-byte random salt using `SecureRandom`, concatenated and hashed via SHA-256 / Bcrypt.
2. **IDOR & BOLA Prevention:**
   All candidate data queries (saved CV drafts, historic scan records) enforce strict tenant boundaries:
   ```sql
   SELECT c FROM UserCVDraft c WHERE c.user.id = :authenticatedUserId
   ```
   Cross-user data leakage is mathematically impossible at the database query layer.
3. **Information Disclosure Prevention:**
   Actuator and SQL properties in `application.yml` suppress internal schema and infrastructure metadata (`show-details: never`, `show-sql: false`).
