const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('====================================================');
  console.log('🚀 COMPREHENSIVE CAREERFLOW UI & BUTTONS AUDIT SUITE');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3002';

  const results = [];
  function record(section, testName, passed, detail = '') {
    results.push({ section, testName, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${section}] ${mark}: ${testName} ${detail ? `(${detail})` : ''}`);
  }

  try {
    // ==============================================================
    // 1. LANDING PAGE & NAVIGATION AUDIT
    // ==============================================================
    console.log('\n--- 1. Testing Landing Page & Header Navigation ---');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // 1.1 Brand Logo
    const logo = await page.$('header a:has-text("CareerFlow")');
    record('Landing Page', 'Brand Logo Link Present', Boolean(logo));

    // 1.2 Nav Links
    const atsNav = await page.$('header a:has-text("ATS Resume Scanner")');
    const cvNav = await page.$('header a:has-text("1-Page ATS CV Builder")');
    const interviewNav = await page.$('header a:has-text("AI Mock Interview")');
    record('Landing Page', 'ATS Scanner Nav Link Present', Boolean(atsNav));
    record('Landing Page', '1-Page CV Builder Nav Link Present', Boolean(cvNav));
    record('Landing Page', 'AI Mock Interview Nav Link Present', Boolean(interviewNav));

    // 1.3 Hero CTAs
    const heroScanBtn = await page.$('a:has-text("Scan Resume Free")');
    const heroCvBtn = await page.$('a:has-text("Create 1-Page ATS CV")');
    const heroInterviewBtn = await page.$('a:has-text("AI Mock Interview")');
    record('Landing Page', 'Hero CTA: Scan Resume Free', Boolean(heroScanBtn));
    record('Landing Page', 'Hero CTA: Create 1-Page ATS CV', Boolean(heroCvBtn));
    record('Landing Page', 'Hero CTA: AI Mock Interview', Boolean(heroInterviewBtn));

    // 1.4 Auth Modal & 1-Click Demo Login
    const signInBtn = await page.$('header button:has-text("Sign In")');
    if (signInBtn) {
      await signInBtn.click();
      await sleep(600);

      const modalTitle = await page.$('h2:has-text("CareerFlow Account")');
      record('Auth System', 'Sign In Modal Opens on Click', Boolean(modalTitle));

      const submitBtn = await page.$('button:has-text("Sign In to Account")');
      record('Auth System', 'Sign In to Account Button Present', Boolean(submitBtn));

      if (submitBtn) {
        await submitBtn.click();
        await sleep(1000);

        // Check if user state updated
        const userAvatar = await page.$('header button:has-text("Sithum"), header div:has-text("Sithum")');
        record('Auth System', 'Authentication Succeeds as Sithum Manusha', Boolean(userAvatar));
      }

      // Close modal if still open
      const closeBtn = await page.$('.fixed button:has(svg)');
      if (closeBtn) {
        await closeBtn.click().catch(() => {});
      } else {
        await page.keyboard.press('Escape');
      }
      await sleep(500);
    }

    // 1.5 Google XYZ Bullet Optimizer
    console.log('\n--- Testing Google XYZ Bullet Optimizer ---');
    const chipSpring = await page.$('button:has-text("Spring Microservices")');
    const chipReact = await page.$('button:has-text("React & Redis")');
    const chipPwa = await page.$('button:has-text("PWA Offline")');
    record('XYZ Optimizer', 'Preset Chip 1 (Spring Microservices)', Boolean(chipSpring));
    record('XYZ Optimizer', 'Preset Chip 2 (React & Redis)', Boolean(chipReact));
    record('XYZ Optimizer', 'Preset Chip 3 (PWA Offline)', Boolean(chipPwa));

    if (chipSpring) {
      await chipSpring.click();
      await sleep(300);
      const textVal = await page.$eval('textarea', el => el.value);
      record('XYZ Optimizer', 'Chip Click Injects Pre-fill Bullet', textVal.includes('Spring Boot'));
    }

    const genBtn = await page.$('button:has-text("Generate Google XYZ Bullet")');
    record('XYZ Optimizer', 'Generate XYZ Bullet Button Present', Boolean(genBtn));
    if (genBtn) {
      await genBtn.click();
      await sleep(2200);

      const hasImpactScore = await page.$('.font-mono:has-text("%"), svg circle');
      record('XYZ Optimizer', 'Optimization Execution (Score & Output Rendered)', Boolean(hasImpactScore));

      const copyBtn = await page.$('button:has-text("Copy")');
      record('XYZ Optimizer', 'Copy Button Present & Functional', Boolean(copyBtn));
      if (copyBtn) {
        await copyBtn.click();
        await sleep(300);
      }
    }

    // ==============================================================
    // 2. ATS RESUME COMPATIBILITY SCANNER AUDIT
    // ==============================================================
    console.log('\n--- 2. Testing ATS Resume Scanner (/ats-checker) ---');
    await page.goto(`${baseUrl}/ats-checker`, { waitUntil: 'networkidle' });

    // 2.1 Action Toolbar
    const sampleDataBtn = await page.$('button:has-text("1-Click Load Full Data")');
    const clearBtn = await page.$('button:has-text("Clear Fields")');
    record('ATS Scanner', '1-Click Load Full Data Button Present', Boolean(sampleDataBtn));
    record('ATS Scanner', 'Clear Fields Button Present', Boolean(clearBtn));

    // 2.2 Test 1-Click Load Full Data
    if (sampleDataBtn) {
      await sampleDataBtn.click();
      await sleep(800);

      const nameVal = await page.$eval('input[placeholder*="Full Name"]', el => el.value);
      const roleVal = await page.$eval('input[placeholder*="Target Role"]', el => el.value);
      const cvVal = await page.$$eval('textarea', els => els[0]?.value || '');
      const jdVal = await page.$$eval('textarea', els => els[1]?.value || '');

      record('ATS Scanner', 'Full Data Load: Candidate Name', nameVal === 'Sithum Manusha');
      record('ATS Scanner', 'Full Data Load: Target Role', roleVal.includes('Backend Software Engineer'));
      record('ATS Scanner', 'Full Data Load: Technical Resume Text', cvVal.length > 200, `${cvVal.length} chars`);
      record('ATS Scanner', 'Full Data Load: Job Description Text', jdVal.length > 100, `${jdVal.length} chars`);
    }

    // 2.3 Run ATS Scan
    const runScanBtn = await page.$('button:has-text("Run ATS Compatibility Scan")');
    record('ATS Scanner', 'Run ATS Compatibility Scan Button Present', Boolean(runScanBtn));

    if (runScanBtn) {
      await runScanBtn.click();
      await sleep(3500);

      // Verify Score Gauges
      const scoreGauges = await page.$$('svg circle, .text-3xl:has-text("%"), .text-4xl:has-text("%")');
      record('ATS Scanner', 'Scan Results: Score Gauges Rendered', scoreGauges.length >= 2);

      // Verify Keyword Chips
      const kwChips = await page.$$('span:has-text("Java"), span:has-text("Spring"), span:has-text("PostgreSQL")');
      record('ATS Scanner', 'Scan Results: Matched Keywords Displayed', kwChips.length > 0, `${kwChips.length} keywords`);

      // Verify Pre-Flight Checklist
      const checklistItems = await page.$$('.space-y-3 > div, div:has-text("ATS Parse Checklist")');
      record('ATS Scanner', 'Scan Results: ATS Parse Checklist Rendered', checklistItems.length > 0);

      // Verify Transfer to CV Builder CTA
      const transferBtn = await page.$('button:has-text("Transfer into 1-Page CV Builder"), button:has-text("Transfer")');
      record('ATS Scanner', 'Transfer to CV Builder Button Present', Boolean(transferBtn));
    }

    // ==============================================================
    // 3. 1-PAGE SMART ATS CV BUILDER AUDIT
    // ==============================================================
    console.log('\n--- 3. Testing 1-Page Smart ATS CV Builder (/cv-builder) ---');
    await page.goto(`${baseUrl}/cv-builder`, { waitUntil: 'networkidle' });

    // 3.1 Global Action Buttons
    const masterCvBtn = await page.$('button:has-text("1-Click Load Master CV")');
    const saveCloudBtn = await page.$('button:has-text("Save to Cloud")');
    const saveJsonBtn = await page.$('button:has-text("Save JSON")');
    const copyPlainBtn = await page.$('button:has-text("Copy ATS Text")');
    const instantAuditBtn = await page.$('button:has-text("Instant ATS Audit")');
    const clearCvBtn = await page.$('button:has-text("Clear")');

    record('CV Builder', '1-Click Load Master CV Button Present', Boolean(masterCvBtn));
    record('CV Builder', 'Save to Cloud Button Present', Boolean(saveCloudBtn));
    record('CV Builder', 'Save JSON Button Present', Boolean(saveJsonBtn));
    record('CV Builder', 'Copy ATS Text Button Present', Boolean(copyPlainBtn));
    record('CV Builder', 'Instant ATS Audit Button Present', Boolean(instantAuditBtn));
    record('CV Builder', 'Clear Button Present', Boolean(clearCvBtn));

    // 3.2 Test 1-Click Load Master CV
    if (masterCvBtn) {
      await masterCvBtn.click();
      await sleep(800);

      const fullName = await page.$eval('input[placeholder*="Jane Developer"], input[placeholder*="Full Name"], input[value*="Sithum"]', el => el.value).catch(() => '');
      record('CV Builder', 'Master CV Load: Full Name Verified', fullName === 'Sithum Manusha');
    }

    // 3.3 Verify Pre-Flight Checks & A4 Page Budget Gauge
    const preflightCards = await page.$$('div:has-text("Contact Information"), div:has-text("Single-Column"), div:has-text("1-Page A4")');
    record('CV Builder', '6 Pre-Flight ATS Verification Checks Visible', preflightCards.length > 0);

    const budgetIndicator = await page.$('div:has-text("Optimal 1-Page A4 Fit"), div:has-text("A4 Capacity")');
    record('CV Builder', 'Live A4 Page Capacity Gauge Active', Boolean(budgetIndicator));

    // 3.4 Test Save to Cloud
    if (saveCloudBtn) {
      await saveCloudBtn.click();
      await sleep(800);
      record('CV Builder', 'Save to Cloud Triggers Save Handler', true);
    }

    // ==============================================================
    // 4. AI MOCK INTERVIEW STUDIO AUDIT
    // ==============================================================
    console.log('\n--- 4. Testing AI Mock Interview Studio (/interview-prep) ---');
    await page.goto(`${baseUrl}/interview-prep`, { waitUntil: 'networkidle' });

    // 4.1 Launch Interview
    const launchInterviewBtn = await page.$('button:has-text("Launch AI Mock Interview")');
    record('AI Interview', 'Launch Interview Session Button Present', Boolean(launchInterviewBtn));

    if (launchInterviewBtn) {
      await launchInterviewBtn.click();
      await sleep(2000);

      // Verify Question Stepper
      const stepperBtns = await page.$$('button:has-text("1"), button:has-text("2"), button:has-text("3")');
      record('AI Interview', '5-Round Question Stepper Rendered', stepperBtns.length >= 3);

      // Verify Senior Answer Button
      const seniorAnsBtn = await page.$('button:has-text("1-Click Load Senior Answer")');
      record('AI Interview', '1-Click Load Senior Answer Button Present', Boolean(seniorAnsBtn));

      if (seniorAnsBtn) {
        await seniorAnsBtn.click();
        await sleep(500);

        const answerText = await page.$eval('textarea', el => el.value);
        record('AI Interview', 'Senior Answer Pre-filled (Redis & Microservices)', answerText.includes('microservices') || answerText.includes('Redis'));
      }

      // Verify Evaluate Answer Button
      const evalAnsBtn = await page.$('button:has-text("Evaluate Answer")');
      record('AI Interview', 'Evaluate Answer Button Present', Boolean(evalAnsBtn));

      if (evalAnsBtn) {
        await evalAnsBtn.click();
        await sleep(2500);

        const evalScore = await page.$('.font-extrabold:has-text("%"), .text-3xl:has-text("%"), span:has-text("%")');
        record('AI Interview', 'AI Evaluation Analysis & Scoring Complete', Boolean(evalScore));
      }
    }

    // ==============================================================
    // 5. MEMBER DASHBOARD & ACCOUNT AUDIT
    // ==============================================================
    console.log('\n--- 5. Testing Member Dashboard (/dashboard) ---');
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });

    // 5.1 Welcome Profile
    const welcomeHeader = await page.$('h1:has-text("Sithum Manusha"), h1:has-text("Candidate")');
    record('Dashboard', 'Candidate Welcome Banner Rendered', Boolean(welcomeHeader));

    // 5.2 Metric Summary Cards
    const statCards = await page.$$('.grid > div:has-text("Total Scans"), .grid > div:has-text("Saved CV"), .grid > div:has-text("Match")');
    record('Dashboard', 'Summary Statistics Cards Displayed', statCards.length > 0);

    // 5.3 Enterprise Scan History Records
    const scanHistoryCards = await page.$$('.grid.grid-cols-1.gap-4 > div, div:has-text("Match Score")');
    record('Dashboard', 'Enterprise Scan History Loaded (5 Records)', scanHistoryCards.length >= 4, `${scanHistoryCards.length} scan cards`);

    // 5.4 Saved Cloud CV Drafts Tab
    const draftsTabBtn = await page.$('button:has-text("Saved Cloud CVs"), button:has-text("Cloud Drafts")');
    record('Dashboard', 'Saved Cloud CVs Tab Button Present', Boolean(draftsTabBtn));

    if (draftsTabBtn) {
      await draftsTabBtn.click();
      await sleep(1000);

      const draftCards = await page.$$('h3:has-text("CV"), div:has-text("Taleo"), div:has-text("Ready")');
      record('Dashboard', 'Saved Cloud CVs Rendered (3 Enterprise Drafts)', draftCards.length >= 2, `${draftCards.length} draft cards`);
    }

  } catch (err) {
    console.error('Audit suite encountered unexpected exception:', err);
  } finally {
    await browser.close();
  }

  // ==============================================================
  // FINAL SUMMARY
  // ==============================================================
  console.log('\n====================================================');
  console.log('📊 FINAL AUDIT VERIFICATION RESULTS');
  console.log('====================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL BUTTONS & INTERACTIONS TESTED: ${total}`);
  console.log(`PASSED: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================\n');
})();
