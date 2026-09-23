export interface CandidateProfileData {
  username: string;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: string[];
  experienceSummary: string;
  education: {
    institution: string;
    degree: string;
    duration: string;
    gpa?: string;
  };
  projects: {
    name: string;
    description: string;
    technologies: string[];
    metrics: string;
    githubLink?: string;
    liveLink?: string;
  }[];
}

export const SAMPLE_PROFILE: CandidateProfileData = {
  username: "sample-candidate",
  fullName: "Sample Candidate",
  title: "Software Engineer Intern",
  bio: "Full-stack and backend software engineering candidate passionate about architecting scalable microservices, resilient token-bucket rate limiting, and intelligent RAG-driven document workflows.",
  email: "candidate@example.com",
  phone: "+94 71 000 0000",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  portfolioUrl: "https://careerflow.app/p/sample-candidate",
  education: {
    institution: "University Faculty of Information Technology",
    degree: "B.Sc. (Hons) in Information Technology",
    duration: "2023 - Present",
    gpa: "First Class"
  },
  skills: [
    "Java 21", "Spring Boot 3", "Spring Data JPA", "PostgreSQL", "Redis",
    "Python 3.12", "FastAPI", "RAG & Vector Search", "TF-IDF NLP",
    "Next.js 14", "React 18", "TypeScript", "Tailwind CSS",
    "Docker", "Docker Compose", "GitHub Actions CI/CD", "Playwright E2E", "JUnit 5", "RESTful APIs"
  ],
  experienceSummary: "Engineered production-grade enterprise software including microservices with automated test coverage, token-bucket rate limiting, and distributed cache integration.",
  projects: [
    {
      name: "CareerFlow Enterprise",
      description: "Distributed enterprise ATS resume optimizer and candidate showcase platform. Leverages Java Spring Boot 3 core with Redis token-bucket rate limiting, a Python FastAPI RAG worker for semantic TF-IDF keyword extraction, and Next.js frontend.",
      technologies: ["Java 21", "Spring Boot 3", "Python FastAPI", "Next.js", "Redis", "PostgreSQL", "Playwright", "Docker"],
      metrics: "Sub-200ms semantic ATS scoring, 100% test pass rate with Playwright E2E, and zero-compromise microservice resilience.",
      githubLink: "https://github.com",
      liveLink: "https://careerflow.app"
    },
    {
      name: "Distributed Event Scheduler",
      description: "High-throughput asynchronous task scheduling and event dispatching service engineered with strict reliability guarantees.",
      technologies: ["Java", "Spring Boot", "Redis", "PostgreSQL", "Docker"],
      metrics: "Sub-50ms task execution latency, 99.99% scheduling accuracy.",
      githubLink: "https://github.com"
    }
  ]
};

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    roleTitle: "Backend (Java / Cloud)",
    role: "Software Engineer Intern (Java Core / Cloud)",
    location: "Remote / Hybrid",
    text: `Role: Software Engineer Intern (Java Core / Cloud)
Location: Remote / Hybrid
We are seeking high-caliber undergraduate engineering students to join our core backend engineering teams.
Requirements:
- Strong proficiency in Core Java (OOP, multithreading, collections) and Spring Boot framework.
- Experience with relational databases like PostgreSQL, handling schema design and SQL query optimization.
- Familiarity with caching systems (Redis) and Docker containerization.
- Knowledge of modern frontend frameworks (React, Next.js, TypeScript).
- Understanding of automated testing (JUnit, Playwright) and CI/CD pipelines is an added advantage.`
  },
  {
    roleTitle: "Full-Stack (React / Java)",
    role: "Associate Software Engineer / Intern",
    location: "Hybrid",
    text: `Role: Associate Software Engineer Intern (Full-Stack)
Location: Hybrid
Hiring software engineering interns to build scalable enterprise cloud technologies.
Requirements:
- Strong foundational knowledge of Object-Oriented Programming (Java or Python) and data structures.
- Hands-on project experience with Spring Boot or FastAPI microservices.
- Experience building RESTful APIs consumed by modern frontend frameworks (React or Next.js).
- Familiarity with containerization (Docker) and relational databases (PostgreSQL/MySQL).
- Exposure to automated testing suites (Playwright, Jest, or JUnit) and Git version control.`
  },
  {
    roleTitle: "Cloud & APIs (Next.js / Python)",
    role: "Software Engineer Intern - Cloud & Full-Stack",
    location: "Remote",
    text: `Role: Software Engineer Intern - Cloud & Full-Stack
Location: Remote
Building enterprise digital products with modern cloud and microservices technologies.
Requirements:
- Passion for clean code, SOLID principles, and scalable system design.
- Hands-on experience with TypeScript, React/Next.js, and Java Spring Boot or Python FastAPI.
- Database design skills with PostgreSQL and performance caching via Redis.
- Knowledge of containerization with Docker and automated testing practices.`
  }
];

export const DEMO_RESUME_TEXT = `CANDIDATE NAME
Software Engineer Intern
University Faculty of Information Technology | +94 71 000 0000 | candidate@example.com
GitHub: github.com | LinkedIn: linkedin.com

TECHNICAL SKILLS
- Languages: Java 21, TypeScript, Python 3.12, SQL, JavaScript, HTML5/CSS3
- Frameworks & Libraries: Spring Boot 3, Spring Data JPA, Next.js 14, React 18, FastAPI, Tailwind CSS
- Databases & Caching: PostgreSQL, Redis (Token-Bucket Rate Limiting), MySQL
- Cloud, DevOps & Testing: Docker, Docker Compose, GitHub Actions CI/CD, Playwright E2E, JUnit 5, Git
- Architecture: Microservices, RESTful APIs, RAG (Retrieval-Augmented Generation), Clean Architecture

SELECTED PROJECTS
1. CareerFlow Enterprise | Java 21, Spring Boot 3, Python FastAPI, Next.js, Redis, PostgreSQL, Playwright
- Architected enterprise ATS resume optimizer microservices serving sub-200ms semantic scans.
- Implemented thread-safe token-bucket rate limiter in Java Spring Boot with Redis to prevent API abuse.
- Integrated Python RAG worker utilizing TF-IDF cosine similarity for automated keyword extraction.
- Authored Playwright E2E and JUnit test suites running automatically on GitHub Actions CI/CD.

2. Distributed Event Scheduler | Java, Spring Boot, Redis, PostgreSQL, Docker
- Built a high-throughput asynchronous task scheduling microservice with strict execution guarantees.
- Authored automated unit and integration tests with high branch coverage.
- Optimized query execution performance by 48% through composite indexing in PostgreSQL.

EDUCATION
- B.Sc. (Hons) in Information Technology (2023 - Present)
`;
