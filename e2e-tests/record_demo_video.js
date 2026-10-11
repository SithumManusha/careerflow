const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, steps = 25) {
  try {
    await page.evaluate(async ({ targetY, steps }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      for (let i = 1; i <= steps; i++) {
        window.scrollTo(0, startY + (diff * (i / steps)));
        await new Promise(r => setTimeout(r, 20));
      }
    }, { targetY, steps });
    await sleep(400);
  } catch (e) {}
}

(async () => {
  const outputDir = path.join(__dirname, 'output_videos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium for video recording...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  const baseUrl = 'https://careerflow-app.onrender.com';

  console.log('Navigating to Live App:', baseUrl);
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(2000);

  // ==========================================
  // SCENE 1: Landing Page Hero & Metrics
  // ==========================================
  console.log('Scene 1: Landing Page Hero & Metrics');
  try {
    await page.mouse.move(640, 260, { steps: 20 });
    await sleep(1000);

    // Hover over metric cards
    const cards = await page.$$('.grid.grid-cols-2 > div');
    for (const card of cards) {
      const box = await card.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
        await sleep(250);
      }
    }
    await sleep(1000);
  } catch (e) {
    console.warn('Scene 1 non-critical error:', e.message);
  }

  // ==========================================
  // SCENE 2: 1-Click Demo Login
  // ==========================================
  console.log('Scene 2: 1-Click Demo Login');
  try {
    const signInBtn = await page.$('button:has-text("Sign In")');
    if (signInBtn) {
      await signInBtn.click();
      await sleep(1200);

      const demoBtn = await page.$('button:has-text("1-Click Demo")');
      if (demoBtn) {
        await demoBtn.click();
        await sleep(2000);
      }

      // Ensure modal is closed
      await page.keyboard.press('Escape');
      await sleep(800);
    }
  } catch (e) {
    console.warn('Scene 2 non-critical error:', e.message);
    await page.keyboard.press('Escape');
  }

  // ==========================================
  // SCENE 3: Google XYZ Bullet Point Optimizer
  // ==========================================
  console.log('Scene 3: Google XYZ Bullet Point Optimizer');
  try {
    await smoothScroll(page, 950);
    await sleep(800);

    // Check for sample chips or type directly into textarea
    const chip = await page.$('button:has-text("Spring Microservices")');
    if (chip) {
      await chip.click();
      await sleep(600);
    } else {
      const textarea = await page.$('textarea[placeholder*="Developed API"]');
      if (textarea) {
        await textarea.fill('Developed API endpoints with Spring Boot and improved response speed');
        await sleep(400);
      }
      const skillInput = await page.$('input[placeholder*="Java 21"]');
      if (skillInput) {
        await skillInput.fill('Spring Boot 3');
        await sleep(400);
      }
    }

    const genBtn = await page.$('button:has-text("Generate Google XYZ Bullet")');
    if (genBtn) {
      await genBtn.click();
      await sleep(2000);
    }

    const copyBtn = await page.$('button:has-text("Copy")');
    if (copyBtn) {
      await copyBtn.click();
      await sleep(1000);
    }
  } catch (e) {
    console.warn('Scene 3 non-critical error:', e.message);
  }

  // ==========================================
  // SCENE 4: ATS Resume Compatibility Scanner
  // ==========================================
  console.log('Scene 4: ATS Resume Compatibility Scanner');
  try {
    await smoothScroll(page, 0);
    await sleep(500);

    await page.click('header a:has-text("ATS Resume Scanner")');
    await page.waitForLoadState('networkidle');
    await sleep(1500);

    const nameInput = await page.$('input[placeholder*="Full Name"]');
    if (nameInput) await nameInput.fill('Sithum Manusha');

    const roleInput = await page.$('input[placeholder*="Target Role"]');
    if (roleInput) await roleInput.fill('Backend Software Engineer (Java / Cloud)');

    const resumeArea = await page.$('textarea[placeholder*="Paste your CV"]');
    if (resumeArea) {
      await resumeArea.fill(`Sithum Manusha | Software Engineer
sithum.manusha@careerflow.dev | linkedin.com/in/sithummanusha | github.com/SithumManusha

TECHNICAL SKILLS:
- Languages & Core: Java 21, TypeScript, Python, SQL
- Backend & Frameworks: Spring Boot 3, Next.js 14, React 18, FastAPI, Prisma ORM
- Cloud & Infrastructure: PostgreSQL ACID, Redis, Docker, Kubernetes, Git, CI/CD
- Systems Architecture: Microservices, REST APIs, Offline-First PWA, Rate Limiting

EXPERIENCE:
Software Engineer Intern
- Architected multi-branch supermarket retail POS & ERP with offline-first IndexedDB background sync.
- Engineered 12+ RESTful microservices in Spring Boot 3 with PostgreSQL and Redis token-bucket rate limiting.
- Built personal finance platform with 11-category budgeting and automated currency conversions.`);
    }

    const jdArea = await page.$('textarea[placeholder*="Paste any target Job Description"]');
    if (jdArea) {
      await jdArea.fill(`Senior / Associate Backend Engineer (Java & Cloud Systems)
Requirements:
- Strong hands-on experience in Java 21 and Spring Boot 3 microservices.
- Relational database schema design and optimization in PostgreSQL.
- Distributed caching using Redis and asynchronous messaging with Apache Kafka.
- Containerization and cloud deployment with Docker and Kubernetes.
- Automated testing with JUnit 5, Pytest, and Playwright.`);
    }

    await sleep(800);
    const scanBtn = await page.$('button:has-text("Run ATS Compatibility Scan")');
    if (scanBtn) {
      await scanBtn.click();
      await sleep(3000);
    }

    // Scroll down to display dual gauges and missing skills
    await smoothScroll(page, 700);
    await sleep(2500);
    await smoothScroll(page, 1150);
    await sleep(2000);
  } catch (e) {
    console.warn('Scene 4 non-critical error:', e.message);
  }

  // ==========================================
  // SCENE 5: 1-Page Smart ATS CV Builder
  // ==========================================
  console.log('Scene 5: 1-Page Smart ATS CV Builder');
  try {
    await smoothScroll(page, 0);
    await sleep(500);

    await page.click('header a:has-text("1-Page ATS CV Builder")');
    await page.waitForLoadState('networkidle');
    await sleep(1500);

    // Scroll through the builder layout and live A4 budget gauge
    await smoothScroll(page, 450);
    await sleep(2500);
  } catch (e) {
    console.warn('Scene 5 non-critical error:', e.message);
  }

  // ==========================================
  // SCENE 6: AI Mock Interview Studio
  // ==========================================
  console.log('Scene 6: AI Mock Interview Studio');
  try {
    await smoothScroll(page, 0);
    await sleep(500);

    await page.click('header a:has-text("AI Mock Interview")');
    await page.waitForLoadState('networkidle');
    await sleep(1500);

    const launchBtn = await page.$('button:has-text("Launch AI Mock Interview")');
    if (launchBtn) {
      await launchBtn.click();
      await sleep(2500);

      await smoothScroll(page, 450);
      await sleep(2500);
    }
  } catch (e) {
    console.warn('Scene 6 non-critical error:', e.message);
  }

  // ==========================================
  // SCENE 7: Member Dashboard
  // ==========================================
  console.log('Scene 7: Member Dashboard');
  try {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await sleep(1800);

    await smoothScroll(page, 300);
    await sleep(2500);

    const draftsTab = await page.$('button:has-text("Saved Cloud CVs")');
    if (draftsTab) {
      await draftsTab.click();
      await sleep(2500);
    }
  } catch (e) {
    console.warn('Scene 7 non-critical error:', e.message);
  }

  console.log('Finalizing and closing browser context...');
  await sleep(1000);
  await page.close();

  const video = page.video();
  let videoPath = null;
  if (video) {
    videoPath = await video.path();
    console.log('Playwright Raw Video saved to:', videoPath);
  }

  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const finalWebm = path.join(outputDir, 'careerflow_linkedin_demo.webm');
    fs.copyFileSync(videoPath, finalWebm);
    console.log('FINAL_VIDEO_READY:' + finalWebm);
  }
})();
