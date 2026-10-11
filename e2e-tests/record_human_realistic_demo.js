const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let currentCursorX = 960;
let currentCursorY = 540;

async function humanMoveTo(page, targetX, targetY, durationSteps = 24) {
  try {
    const startX = currentCursorX;
    const startY = currentCursorY;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);

    // Natural perpendicular curvature for human hand motion
    const arcMagnitude = Math.min(45, dist * 0.14) * (Math.random() > 0.5 ? 1 : -1);

    for (let i = 1; i <= durationSteps; i++) {
      const t = i / durationSteps;
      // Smooth cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      const arc = Math.sin(t * Math.PI) * arcMagnitude;
      const curX = Math.round(startX + dx * ease - (dy / (dist || 1)) * arc);
      const curY = Math.round(startY + dy * ease + (dx / (dist || 1)) * arc);

      await page.evaluate(({ x, y }) => {
        if (window.__updateCursorPos) window.__updateCursorPos(x, y);
      }, { x: curX, y: curY }).catch(() => {});

      await page.mouse.move(curX, curY);
      await sleep(12 + Math.floor(Math.random() * 6));
    }

    currentCursorX = targetX;
    currentCursorY = targetY;
    await page.evaluate(({ x, y }) => {
      if (window.__updateCursorPos) window.__updateCursorPos(x, y);
    }, { x: targetX, y: targetY }).catch(() => {});
    await sleep(70 + Math.floor(Math.random() * 40));
  } catch (e) {}
}

async function humanClickElement(page, selector, steps = 20) {
  try {
    const el = await page.$(selector);
    if (!el) {
      console.warn('Element not found:', selector);
      return false;
    }
    const box = await el.boundingBox();
    if (!box) {
      await el.click().catch(() => {});
      return true;
    }

    const targetX = Math.round(box.x + box.width / 2 + (Math.random() * 6 - 3));
    const targetY = Math.round(box.y + box.height / 2 + (Math.random() * 4 - 2));

    await humanMoveTo(page, targetX, targetY, steps);
    await sleep(150 + Math.floor(Math.random() * 70)); // Visual focus reaction delay

    // Trigger visual cursor ripple
    await page.evaluate(() => {
      if (window.__triggerCursorClick) window.__triggerCursorClick();
    }).catch(() => {});

    await page.mouse.down();
    await sleep(75 + Math.floor(Math.random() * 25));
    await page.mouse.up();
    await el.click().catch(() => {});
    await sleep(300 + Math.floor(Math.random() * 100));
    return true;
  } catch (e) {
    return false;
  }
}

async function humanType(page, selector, text) {
  try {
    await humanClickElement(page, selector, 16);
    await sleep(150);
    // Clear field first
    await page.fill(selector, '');
    await sleep(100);
    for (const char of text) {
      await page.keyboard.type(char, { delay: 28 + Math.floor(Math.random() * 32) });
      if (Math.random() < 0.08) {
        await sleep(100); // Natural human word boundary pause
      }
    }
    await sleep(250);
  } catch (e) {}
}

async function humanSmoothScroll(page, targetY, durationSteps = 22) {
  try {
    await page.evaluate(async ({ targetY, durationSteps }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      for (let i = 1; i <= durationSteps; i++) {
        const t = i / durationSteps;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        window.scrollTo(0, startY + diff * ease);
        await new Promise(r => setTimeout(r, 20));
      }
    }, { targetY, durationSteps });
    await sleep(350);
  } catch (e) {}
}

(async () => {
  const outputDir = path.join(__dirname, 'output_videos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium for Full HD 1080p human-realistic demo recording...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1920x1080 Full HD Viewport - Perfectly balanced widescreen showing both columns side-by-side
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    },
    deviceScaleFactor: 1
  });

  // Inject High-Definition Animated Cursor Overlay + Clean Balanced Zoom
  await context.addInitScript(() => {
    function injectCursor() {
      // Zoom out slightly (90%) so both sides/columns of each UI fit cleanly on screen
      if (document.body) {
        document.body.style.zoom = '92%';
      }

      if (document.getElementById('playwright-human-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'playwright-human-cursor';
      cursor.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)); transform: rotate(-3deg);">
          <path d="M5.5 3.5L18.5 11L12.5 13L10.5 19L5.5 3.5Z" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M7.2 6.2L15.8 11.2L12 12.6L10.4 16.6L7.2 6.2Z" fill="#3B82F6"/>
        </svg>
        <div id="cursor-ripple" style="
          position: absolute;
          top: 3px;
          left: 3px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2.5px solid #2563EB;
          background: rgba(37, 99, 235, 0.4);
          box-shadow: 0 0 16px rgba(37, 99, 235, 0.8);
          opacity: 0;
          transform: translate(-12px, -12px) scale(0.3);
          pointer-events: none;
        "></div>
      `;
      cursor.style.position = 'fixed';
      cursor.style.top = '0px';
      cursor.style.left = '0px';
      cursor.style.zIndex = '2147483647';
      cursor.style.pointerEvents = 'none';
      cursor.style.transform = 'translate(960px, 540px)';
      cursor.style.transition = 'transform 0.03s linear';
      document.body.appendChild(cursor);
    }

    window.addEventListener('DOMContentLoaded', injectCursor);
    if (document.body) injectCursor();

    window.__updateCursorPos = (x, y) => {
      const el = document.getElementById('playwright-human-cursor');
      if (el) el.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.__triggerCursorClick = () => {
      const ripple = document.getElementById('cursor-ripple');
      if (ripple) {
        ripple.style.transition = 'none';
        ripple.style.opacity = '1';
        ripple.style.transform = 'translate(-12px, -12px) scale(0.4)';
        requestAnimationFrame(() => {
          ripple.style.transition = 'transform 0.38s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.38s ease-out';
          ripple.style.transform = 'translate(-12px, -12px) scale(2.6)';
          ripple.style.opacity = '0';
        });
      }
    };
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:3002';

  console.log('Navigating to CareerFlow App:', baseUrl);
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(1500);

  // ==============================================================
  // SCENE 1: Landing Page Hero & Metrics Inspection
  // ==============================================================
  console.log('--- SCENE 1: Landing Page Hero & Metrics ---');
  await humanMoveTo(page, 960, 320, 22);
  await sleep(1000);

  // Hover across Hero Action Buttons
  const scanCta = await page.$('a:has-text("Scan Resume Free")');
  if (scanCta) {
    const box = await scanCta.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 16);
      await sleep(600);
    }
  }

  // Hover over metric cards with human pacing
  const cards = await page.$$('.grid.grid-cols-2 > div, .grid-cols-4 > div');
  for (const card of cards.slice(0, 3)) {
    const box = await card.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 15);
      await sleep(400);
    }
  }

  // ==============================================================
  // SCENE 2: Realistic Candidate Sign-In
  // ==============================================================
  console.log('--- SCENE 2: Realistic Candidate Sign-In ---');
  // Move smoothly to top right "Sign In" button in header
  const signInBtn = await page.$('header button:has-text("Sign In")');
  if (signInBtn) {
    await humanClickElement(page, 'header button:has-text("Sign In")', 20);
    await sleep(1000);

    // Realistic modal appears with authentic credentials: sithum.manusha@careerflow.dev
    // User clicks "Sign In to Account"
    const submitBtn = await page.$('button:has-text("Sign In to Account")');
    if (submitBtn) {
      await humanClickElement(page, 'button:has-text("Sign In to Account")', 18);
      await sleep(1400);
    }

    // Modal closes automatically, user avatar updates
    await page.keyboard.press('Escape');
    await sleep(500);
  }

  // Human hovers over user badge showing "Sithum Manusha"
  const userBadge = await page.$('header button:has-text("Sithum"), header div:has-text("Sithum")');
  if (userBadge) {
    const box = await userBadge.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 16);
      await sleep(800);
    }
  }

  // ==============================================================
  // SCENE 3: Google XYZ Bullet Point Optimizer
  // ==============================================================
  console.log('--- SCENE 3: Google XYZ Bullet Point Optimizer ---');
  await humanSmoothScroll(page, 720);
  await sleep(800);

  // Human types custom unquantified bullet point into textarea
  await humanType(page, 'textarea[placeholder*="Developed API"]', 'Engineered 12+ RESTful microservices in Spring Boot 3 with Redis caching and PostgreSQL.');
  await sleep(400);

  // Human types target skill
  await humanType(page, 'input[placeholder*="Java 21"]', 'Spring Boot 3 & Redis');
  await sleep(400);

  // Human clicks "Generate Google XYZ Bullet"
  await humanClickElement(page, 'button:has-text("Generate Google XYZ Bullet")', 18);
  await sleep(2400);

  // Human inspects the result ScoreGauge and Before vs After
  const scoreGauge = await page.$('svg circle, .font-mono:has-text("%")');
  if (scoreGauge) {
    const box = await scoreGauge.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await sleep(1000);
    }
  }

  // Human clicks "Copy" button
  const copyBtn = await page.$('button:has-text("Copy")');
  if (copyBtn) {
    await humanClickElement(page, 'button:has-text("Copy")', 16);
    await sleep(1000);
  }

  // ==============================================================
  // SCENE 4: ATS Resume Compatibility Scanner (Side-by-Side Widescreen)
  // ==============================================================
  console.log('--- SCENE 4: ATS Resume Compatibility Scanner ---');
  await humanSmoothScroll(page, 0);
  await sleep(500);

  // Move cursor to header link and click
  const navAts = await page.$('header a:has-text("ATS Resume Scanner")');
  if (navAts) {
    const box = await navAts.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.evaluate(() => { if (window.__triggerCursorClick) window.__triggerCursorClick(); });
    }
  }
  await page.goto(`${baseUrl}/ats-checker`, { waitUntil: 'networkidle' });
  await sleep(1200);

  // Human clicks "⚡ 1-Click Load Full Data"
  await humanClickElement(page, 'button:has-text("1-Click Load Full Data")', 20);
  await sleep(1200);

  // In 1080p, both columns (Candidate Resume & Target JD) are visible side-by-side!
  // Human moves cursor smoothly between Candidate CV and Job Description
  await humanMoveTo(page, 480, 520, 16);
  await sleep(600);
  await humanMoveTo(page, 1440, 520, 16);
  await sleep(600);

  // Human clicks "Run ATS Compatibility Scan"
  await humanSmoothScroll(page, 380);
  await sleep(500);

  await humanClickElement(page, 'button:has-text("Run ATS Compatibility Scan")', 18);
  await sleep(2800);

  // Human inspects the Match Scores (92% Match Score, 96% ATS Health)
  await humanSmoothScroll(page, 580);
  await sleep(1000);

  await humanMoveTo(page, 620, 480, 18); // Left gauge
  await sleep(700);
  await humanMoveTo(page, 1300, 480, 18); // Right gauge
  await sleep(700);

  // Human scrolls down to review Matched Keywords & Recommendations
  await humanSmoothScroll(page, 950);
  await sleep(1200);

  // Human hovers over keyword badges
  const keywords = await page.$$('span:has-text("Java"), span:has-text("Spring Boot"), span:has-text("PostgreSQL")');
  for (const kw of keywords.slice(0, 4)) {
    const box = await kw.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 14);
      await sleep(350);
    }
  }
  await sleep(800);

  // ==============================================================
  // SCENE 5: 1-Page Smart ATS CV Builder (Left Editor + Right Live A4 Preview)
  // ==============================================================
  console.log('--- SCENE 5: 1-Page Smart ATS CV Builder ---');
  await humanSmoothScroll(page, 0);
  await sleep(500);

  // Move cursor to header link and click
  const navCv = await page.$('header a:has-text("1-Page ATS CV Builder")');
  if (navCv) {
    const box = await navCv.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.evaluate(() => { if (window.__triggerCursorClick) window.__triggerCursorClick(); });
    }
  }
  await page.goto(`${baseUrl}/cv-builder`, { waitUntil: 'networkidle' });
  await sleep(1200);

  // Human clicks "⚡ 1-Click Load Master CV"
  await humanClickElement(page, 'button:has-text("1-Click Load Master CV")', 18);
  await sleep(1400);

  // In 1080p, the left form AND the entire right Live A4 preview are both visible side-by-side!
  // Human hovers over the Live A4 Document preview on the right
  await humanMoveTo(page, 1380, 480, 20);
  await sleep(1000);

  // Human moves cursor over Pre-Flight checks on the right side (all 6 green checks)
  const preflightBox = await page.$('div:has-text("ATS 1-Page Pre-Flight Checklist")');
  if (preflightBox) {
    const box = await preflightBox.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + 40, 18);
      await sleep(900);
    }
  }

  // Human hovers over live A4 Page Budget Gauge
  const budgetGauge = await page.$('div:has-text("A4 Capacity"), span:has-text("Optimal 1-Page")');
  if (budgetGauge) {
    const box = await budgetGauge.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 16);
      await sleep(800);
    }
  }

  // Human clicks "Save to Cloud"
  await humanClickElement(page, 'button:has-text("Save to Cloud")', 16);
  await sleep(1000);

  // ==============================================================
  // SCENE 6: AI Mock Interview Studio
  // ==============================================================
  console.log('--- SCENE 6: AI Mock Interview Studio ---');
  await humanSmoothScroll(page, 0);
  await sleep(500);

  // Move cursor to header link and click
  const navInterview = await page.$('header a:has-text("AI Mock Interview")');
  if (navInterview) {
    const box = await navInterview.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.evaluate(() => { if (window.__triggerCursorClick) window.__triggerCursorClick(); });
    }
  }
  await page.goto(`${baseUrl}/interview-prep`, { waitUntil: 'networkidle' });
  await sleep(1200);

  // Human clicks "Launch AI Mock Interview Session"
  await humanClickElement(page, 'button:has-text("Launch AI Mock Interview")', 18);
  await sleep(2200);

  // Human smoothly scrolls to the Question card
  await humanSmoothScroll(page, 320);
  await sleep(900);

  // Human clicks "⚡ 1-Click Load Senior Answer"
  await humanClickElement(page, 'button:has-text("1-Click Load Senior Answer")', 18);
  await sleep(1200);

  // Human moves to submit button and clicks "Evaluate Answer"
  await humanClickElement(page, 'button:has-text("Evaluate Answer")', 18);
  await sleep(2800);

  // Human scrolls down to review AI Evaluation & Strengths
  await humanSmoothScroll(page, 560);
  await sleep(1400);

  // Human moves cursor over the score badge
  const scoreCard = await page.$('.font-extrabold:has-text("%"), .text-3xl:has-text("%")');
  if (scoreCard) {
    const box = await scoreCard.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 16);
      await sleep(1000);
    }
  }

  // ==============================================================
  // SCENE 7: Member Dashboard & Account Analytics
  // ==============================================================
  console.log('--- SCENE 7: Member Dashboard & Account Analytics ---');
  await humanSmoothScroll(page, 0);
  await sleep(500);

  // Human moves cursor to header link and clicks Dashboard
  const dashNav = await page.$('header a:has-text("Dashboard")');
  if (dashNav) {
    const box = await dashNav.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await page.evaluate(() => { if (window.__triggerCursorClick) window.__triggerCursorClick(); });
    }
  }
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1400);

  // In 1080p, all 3 metric cards are clearly visible in a single row
  const statCards = await page.$$('.grid.grid-cols-1.md\\:grid-cols-3 > div, .grid > div');
  for (const card of statCards.slice(0, 3)) {
    const box = await card.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 15);
      await sleep(400);
    }
  }

  // Human scrolls down to view Enterprise Scan History
  await humanSmoothScroll(page, 380);
  await sleep(1200);

  // Human hovers over scan cards
  const scanRows = await page.$$('.grid.grid-cols-1.gap-4 > div, div:has-text("Match Score")');
  for (const row of scanRows.slice(0, 3)) {
    const box = await row.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + 250, box.y + box.height / 2, 15);
      await sleep(450);
    }
  }

  // Human clicks "Saved Cloud CVs" tab
  await humanClickElement(page, 'button:has-text("Saved Cloud CVs")', 18);
  await sleep(1500);

  // Human hovers over saved CV drafts
  const draftCards = await page.$$('.grid > div');
  for (const draft of draftCards.slice(0, 3)) {
    const box = await draft.boundingBox();
    if (box) {
      await humanMoveTo(page, box.x + box.width / 2, box.y + box.height / 2, 15);
      await sleep(500);
    }
  }

  // Smooth scroll back to top and hold
  await humanSmoothScroll(page, 0);
  await humanMoveTo(page, 960, 480, 20);
  await sleep(1800);

  console.log('Recording complete! Finalizing Full HD 1080p video context...');
  await page.close();

  const video = page.video();
  let videoPath = null;
  if (video) {
    videoPath = await video.path();
    console.log('Playwright Raw 1080p WebM Video saved to:', videoPath);
  }

  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const finalWebm = path.join(outputDir, 'careerflow_human_demo.webm');
    fs.copyFileSync(videoPath, finalWebm);
    console.log('RAW_HUMAN_WEBM_READY:' + finalWebm);
  }
})();
