import { test, expect } from '@playwright/test';

const TEST_RESUME_INPUT = `
Jane Developer - Software Engineer Intern
Undergraduate in Software Engineering
Email: jane.dev@example.com | Phone: +94 71 234 5678
Skills: Java, Spring Boot, Spring Data JPA, Next.js, React, TypeScript, PostgreSQL, Redis, Docker, Git, CI/CD.
Projects:
- Distributed Task Engine: Built enterprise microservice in Java Spring Boot with Redis rate-limiting and Playwright tests.
- CareerFlow: Developed full-stack ATS optimizer in Next.js and Python FastAPI with 45ms latency.
`;

test.describe('CareerFlow Enterprise E2E Test Suite', () => {

  test('Homepage loads with enterprise hero metrics', async ({ page }) => {
    await page.goto('/');
    
    // Verify title and main heading
    await expect(page).toHaveTitle(/CareerFlow Enterprise/);
    await expect(page.locator('h1')).toContainText('Land More Tech Interviews');

    // Verify key metrics with exact match
    await expect(page.getByText('0–100%', { exact: true })).toBeVisible();
    await expect(page.getByText('< 1 sec', { exact: true })).toBeVisible();
    await expect(page.getByText('200+', { exact: true })).toBeVisible();
  });

  test('ATS Scanner performs resume analysis against job description', async ({ page }) => {
    await page.goto('/ats-checker');

    // Check header
    await expect(page.locator('h1')).toContainText('ATS Resume Compatibility Scanner');

    // Paste resume text directly
    await page.locator('textarea').first().fill(TEST_RESUME_INPUT);

    // Select backend job benchmark preset
    await page.getByRole('button', { name: /Backend \(Java/i }).click();

    // Trigger Scan
    const scanButton = page.getByRole('button', { name: /Run ATS Compatibility Scan/i });
    await expect(async () => {
      await scanButton.click();
      await expect(page.getByText('ATS Audit Complete')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    // Verify audit results appear
    await expect(page.getByText('Executive ATS Compatibility Report')).toBeVisible();
    await expect(page.getByText(/Matched Enterprise Keywords/i)).toBeVisible();
  });

  test('Google XYZ Bullet Point Optimizer generates high-impact bullet', async ({ page }) => {
    await page.goto('/');

    // Locate optimizer
    const optimizerHeading = page.getByText('Google XYZ Bullet Point Optimizer');
    await expect(optimizerHeading).toBeVisible();

    // Fill in bullet point and skill directly
    await page.locator('textarea').fill("Created backend APIs using Spring Boot and handled database queries for user management.");
    await page.locator('input[placeholder*="Redis"]').fill("Spring Boot 3 & Redis");

    // Click Generate with hydration retry
    const generateBtn = page.getByRole('button', { name: /Generate Google XYZ Bullet/i });
    await expect(async () => {
      await generateBtn.click();
      await expect(page.getByText(/Optimized Bullet Point/i)).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    // Verify output shows Accomplished [X], Measured [Y], By doing [Z]
    await expect(page.getByText('[X] Accomplished:')).toBeVisible();
    await expect(page.getByText('[Y] Measured by:')).toBeVisible();
    await expect(page.getByText('[Z] By doing:')).toBeVisible();
  });

  test('Candidate profile route safely redirects to ATS scanner', async ({ page }) => {
    await page.goto('/p/sample-candidate');

    // Verify automatic client redirect to ATS checker
    await expect(page).toHaveURL(/.*ats-checker/);
    await expect(page.locator('h1')).toContainText('ATS Resume Compatibility Scanner');
  });

  test('Clever 1000 health audits and Architecture Decisions (ADR) modal render correctly', async ({ page }) => {
    await page.goto('/ats-checker');

    // Paste resume text & select backend preset
    await page.locator('textarea').first().fill(TEST_RESUME_INPUT);
    await page.getByRole('button', { name: /Backend \(Java/i }).click();

    const scanButton = page.getByRole('button', { name: /Run ATS Compatibility Scan/i });
    await expect(async () => {
      await scanButton.click();
      await expect(page.getByText('ATS Audit Complete')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    // Verify Clever 1000 3-pillar health audit cards
    await expect(page.getByText('Contact Details Audit')).toBeVisible();
    await expect(page.getByText('Section Headings Audit')).toBeVisible();
    await expect(page.getByText('Impact & Formatting')).toBeVisible();
    await expect(page.getByText(/Microservice Telemetry:/i)).toBeVisible();

    // Verify human engineering credit and open ADR modal
    const adrBtn = page.getByRole('button', { name: /Architecture Decisions \(ADR\)/i });
    await adrBtn.click();

    // Verify ADR modal content and author credit
    await expect(page.getByText('System Architecture Decisions (ADR)')).toBeVisible();
    await expect(page.getByText(/Authored by Core Engineering Team/i)).toBeVisible();
    await expect(page.getByText(/ADR 01: Decoupled Polyglot Microservices/i)).toBeVisible();
    await expect(page.getByText(/ADR 02: Thread-Safe Redis Token-Bucket/i)).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close Architecture Log' }).click();
    await expect(page.getByText('System Architecture Decisions (ADR)')).not.toBeVisible();
  });

  test('Dual-score system, Keyword Frequency table, Action Verb audit, and PDF export verify Jobscan commercial parity', async ({ page }) => {
    await page.goto('/ats-checker');

    // Paste resume text & select full-stack preset
    await page.locator('textarea').first().fill(TEST_RESUME_INPUT);
    await page.getByRole('button', { name: /Full-Stack/i }).click();

    const scanButton = page.getByRole('button', { name: /Run ATS Compatibility Scan/i });
    await expect(async () => {
      await scanButton.click();
      await expect(page.getByText('ATS Audit Complete')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    // 1. Dual-score system assertions
    await expect(page.getByText('Blended Overall Score')).toBeVisible();
    await expect(page.getByText('Target Job Match')).toBeVisible();
    await expect(page.getByText('ATS Format & Structure Health')).toBeVisible();

    // 2. Keyword Frequency & Density table assertions
    await expect(page.getByText('Keyword Frequency & Density Analysis')).toBeVisible();
    await expect(page.getByRole('button', { name: /^All \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Optimal \(/ })).toBeVisible();

    // 3. Action Verb & Executive Tone audit assertions
    await expect(page.getByText('Action Verb & Executive Tone Audit')).toBeVisible();
    await expect(page.getByText(/High-Impact Power Verbs Detected/i)).toBeVisible();

    // 4. Download PDF button assertion
    const downloadPdfBtn = page.getByRole('button', { name: /Download Audit Report \(PDF\)/i });
    await expect(downloadPdfBtn).toBeVisible();
  });

  test('1-Click Auto-Transfer bridges ATS scanner findings into 1-Page CV Builder with injected skills', async ({ page }) => {
    await page.goto('/ats-checker');

    // Input resume and select backend preset
    await page.locator('textarea').first().fill(TEST_RESUME_INPUT);
    await page.getByRole('button', { name: /Backend \(Java/i }).click();

    // Trigger Scan
    const scanButton = page.getByRole('button', { name: /Run ATS Compatibility Scan/i });
    await expect(async () => {
      await scanButton.click();
      await expect(page.getByText('ATS Audit Complete')).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    // Click "Transfer to 1-Page CV Builder" button
    const transferBtn = page.getByRole('button', { name: /Transfer to 1-Page CV Builder/i });
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();

    // Verify navigation to /cv-builder?fromScan=1
    await expect(page).toHaveURL(/.*cv-builder\?fromScan=1/);

    // Verify import notification banner appears
    await expect(page.getByText(/Imported from ATS Compatibility Scan/i)).toBeVisible();
  });

  test('ATS Pre-flight Readiness Checklist dynamically evaluates CV compliance and readiness', async ({ page }) => {
    await page.goto('/cv-builder');

    // Verify Pre-flight Checklist widget renders
    await expect(page.getByText('ATS Pre-flight Readiness Checklist')).toBeVisible();
    await expect(page.getByText(/Checks Passed/i)).toBeVisible();

    // Verify individual preflight checks are visible
    await expect(page.getByText('Single-Column Architecture')).toBeVisible();
    await expect(page.getByText('1-Page A4 Height Budget')).toBeVisible();
    await expect(page.getByText('Core Tech Skill Density')).toBeVisible();
  });

  test('AI Mock Interview Studio generates tailored questions and evaluates responses with model answers', async ({ page }) => {
    await page.goto('/interview-prep');

    // Verify main heading
    await expect(page.locator('h1')).toContainText('Interactive AI Mock Interview Practice');

    // Click "Launch AI Mock Interview Session"
    const launchBtn = page.getByRole('button', { name: /Launch AI Mock Interview Session/i });
    await expect(launchBtn).toBeVisible();
    await launchBtn.click();

    // Verify question canvas renders
    await expect(page.getByText('Round #1')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/What the Hiring Team is Evaluating:/i)).toBeVisible();

    // Type a candidate answer
    const answerInput = page.locator('textarea');
    await answerInput.fill('In an enterprise distributed system, I implement distributed token-bucket rate limiting using Redis and Lua scripts for atomic CAS execution. If Redis is down, we use in-memory fallback and Resilience4j circuit breakers.');

    // Click "Evaluate Answer"
    const evalBtn = page.getByRole('button', { name: /Evaluate Answer/i });
    await evalBtn.click();

    // Verify live AI evaluation renders
    await expect(page.getByText(/Evaluation Result/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Senior Staff Model Answer:/i)).toBeVisible();
    await expect(page.getByText(/Recruiter Follow-up Question:/i)).toBeVisible();
  });

  test('User Account & Dashboard flow: 1-Click Demo Sign-In, Scan History, and Cloud Drafts', async ({ page }) => {
    await page.goto('/');

    // 1. Click "Sign In" in Navbar
    const signInBtn = page.getByRole('button', { name: /Sign In/i });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // 2. AuthModal renders with 1-Click Demo button
    await expect(page.getByText('CareerFlow Account')).toBeVisible();
    const demoBtn = page.getByRole('button', { name: /1-Click Demo Sign-In/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 3. AuthModal closes, User is logged in, Dashboard link is visible
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible({ timeout: 5000 });

    // 4. Navigate to /dashboard
    await page.goto('/dashboard');
    await expect(page.getByText('Candidate Account')).toBeVisible();
    await expect(page.getByText(/ATS Scan History/i)).toBeVisible();

    // 5. Verify sample pre-seeded scans
    await expect(page.getByText('Lead Backend Engineer')).toBeVisible();

    // 6. Switch to Saved Cloud CVs tab
    const draftsTab = page.getByRole('button', { name: /Saved Cloud CVs/i });
    await draftsTab.click();
    await expect(page.getByText('Backend Cloud Standard 2026')).toBeVisible();

    // 7. Click "Open in CV Builder"
    const openBuilderBtn = page.getByRole('button', { name: /Open in CV Builder/i });
    await openBuilderBtn.click();
    await page.waitForURL(/cv-builder/);
    await expect(page.getByText(/Cloud draft loaded successfully!/i)).toBeVisible({ timeout: 5000 });
  });

});
