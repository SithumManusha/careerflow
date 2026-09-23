@echo off
title CareerFlow Enterprise Launcher
cls
echo =====================================================================
echo           CAREERFLOW ENTERPRISE - LOCAL RUNNER
echo    Enterprise ATS Resume Optimizer & Candidate Showcase SaaS
echo =====================================================================
echo.
echo [0] Start All Services (Native Windows - Next.js + Spring Boot + Python)
echo [1] Start All Services with Docker Compose (Recommended)
echo [2] Start Python RAG Worker (FastAPI on Port 8000)
echo [3] Start Java Spring Boot 3 Backend (Port 8080)
echo [4] Start Next.js Frontend (Port 3000)
echo [5] Run Playwright E2E Test Suite
echo [6] Run Python RAG Tests
echo [7] Exit
echo.
set /p choice="Select an option (0-7): "

if "%choice%"=="0" (
    echo Launching Python Worker in new window...
    start "CareerFlow Python Worker (Port 8000)" cmd /k "cd worker-python && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    echo Launching Java Backend in new window...
    start "CareerFlow Java Backend (Port 8080)" cmd /k "cd backend-java && java -jar target\careerflow-backend-1.0.0.jar"
    echo Launching Next.js Frontend in new window...
    start "CareerFlow Next.js Frontend (Port 3000)" cmd /k "cd frontend && npm start"
    echo All services started! Opening browser at http://localhost:3000...
    timeout /t 5 >nul
    start http://localhost:3000
    goto end
)
    echo Starting Docker Compose...
    docker-compose up --build
    goto end
)

if "%choice%"=="2" (
    echo Starting Python RAG Worker on port 8000...
    cd worker-python
    python -m pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    goto end
)

if "%choice%"=="3" (
    echo Starting Spring Boot 3 Core Backend on port 8080...
    cd backend-java
    mvn spring-boot:run
    goto end
)

if "%choice%"=="4" (
    echo Starting Next.js Frontend on port 3000...
    cd frontend
    npm run dev
    goto end
)

if "%choice%"=="5" (
    echo Running Playwright E2E Tests...
    cd e2e-tests
    npx playwright test
    goto end
)

if "%choice%"=="6" (
    echo Running Python RAG Tests...
    cd worker-python
    pytest test_rag.py -v
    goto end
)

:end
pause
