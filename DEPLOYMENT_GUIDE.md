# CareerFlow Production & Cloud Deployment Guide

This guide provides step-by-step instructions for deploying the complete CareerFlow platform to free-tier cloud infrastructure, as well as running it locally via Docker Compose.

---

## 1. Architecture Deployment Overview

```
                          [ Client Browser ]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          [ Frontend (Next.js 14) ]       [ Direct Scanner Calls ]
             Hosted on Vercel              (Client-side fallback)
                    │                             │
                    ▼                             │
       [ Java Spring Boot 3 Backend ]             │
           Hosted on Render Web Svc               │
           ┌────────┴────────┬────────┐           │
           ▼                 ▼        ▼           ▼
   [ Neon PostgreSQL ]   [ Upstash ]   [ Python FastAPI Worker ]
      (Audit Logs)        (Redis)       (PyMuPDF + TF-IDF RAG)
                                        Hosted on Render Web Svc
```

---

## 2. Free Cloud Services Stack

| Component | Platform | Plan | Key Features |
|---|---|---|---|
| **Frontend** | **Vercel** | Free Hobby | Edge network, automatic SSL, Next.js optimization |
| **Backend** | **Render** | Free Web Service | Java 17 / Docker container support |
| **Worker** | **Render** | Free Web Service | Python FastAPI, Uvicorn, PyMuPDF engine |
| **Database** | **Neon** | Free Serverless | PostgreSQL 16, auto-scaling to zero |
| **Cache** | **Upstash** | Free Serverless | Redis REST/TCP caching |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Database & Cache Setup

#### A. Managed PostgreSQL (Neon)
1. Go to [neon.tech](https://neon.tech) and create a free project named `careerflow`.
2. Copy your PostgreSQL connection string:
   ```
   jdbc:postgresql://ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Note your username, password, and database host.

#### B. Managed Redis (Upstash)
1. Go to [upstash.com](https://upstash.com) and create a free Redis database named `careerflow-cache`.
2. Select your closest region (e.g., US-East or Frankfurt).
3. Copy the **Endpoint** (host), **Port** (e.g., 6379), and **Password**.

---

### Step 2: Deploy Python FastAPI Worker (Render)

1. Connect your GitHub repository to [render.com](https://render.com).
2. Create a new **Web Service**:
   - **Root Directory:** `worker-python`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `PORT`: `8000`
   - `GEMINI_API_KEY`: *(Optional - rule-based engine activates automatically if absent)*
4. Once deployed, note your service URL (e.g., `https://careerflow-worker.onrender.com`).

---

### Step 3: Deploy Java Spring Boot Backend (Render)

1. On Render, create another **Web Service**:
   - **Root Directory:** `backend-java`
   - **Environment:** `Docker` (or Java with Maven)
2. Add Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<neon-host>/<neon-db>?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<neon-username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<neon-password>`
   - `SPRING_DATA_REDIS_HOST`: `<upstash-redis-host>`
   - `SPRING_DATA_REDIS_PORT`: `6379`
   - `SPRING_DATA_REDIS_PASSWORD`: `<upstash-redis-password>`
   - `WORKER_PYTHON_URL`: `https://careerflow-worker.onrender.com`
   - `PORT`: `8080`
3. Once deployed, verify Swagger UI at:
   `https://careerflow-backend.onrender.com/swagger-ui.html`

---

### Step 4: Deploy Next.js Frontend (Vercel)

1. Import your GitHub repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://careerflow-backend.onrender.com`
   - `NEXT_PUBLIC_WORKER_URL`: `https://careerflow-worker.onrender.com`
4. Deploy! Your production application will be live at:
   `https://careerflow.vercel.app`

---

## 4. Local 1-Command Startup via Docker Compose

To test the entire containerized production topology locally on your machine:

```bash
# Clone the repository
git clone https://github.com/your-username/careerflow.git
cd careerflow

# Launch all 5 containers (Postgres, Redis, Java backend, Python worker, Next.js frontend)
docker compose up --build
```

### Container Endpoints:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Spring Boot API:** [http://localhost:8080](http://localhost:8080)
- **Swagger Documentation:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Python NLP Worker:** [http://localhost:8000](http://localhost:8000)
- **Worker Health:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 5. Production Health Checks & Verification

Run these health verification commands against your deployment:

```bash
# 1. Check Python worker status
curl https://careerflow-worker.onrender.com/health
# Response: {"status":"healthy","engine":"PyMuPDF+TF-IDF"}

# 2. Check Java backend status
curl https://careerflow-backend.onrender.com/actuator/health
# Response: {"status":"UP"}

# 3. Check Swagger OpenAPI spec
curl https://careerflow-backend.onrender.com/v3/api-docs
```
