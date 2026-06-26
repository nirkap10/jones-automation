/**
 * Jones QA Exercise — Part A
 * Playwright automation for https://test.netlify.app/
 *
 * Flow:
 *   1. Open the landing page.
 *   2. Fill Name, Email, Phone, Company and Website (each fill is verified).
 *   3. Bonus: change "Number of Employees" from 1-10 to 51-500.
 *   4. Take a screenshot before submitting.
 *   5. Click "Request a call back".
 *   6. Verify the Thank You page is reached, and log it to the console.
 *
 * The script exits with code 0 on success and 1 on any failure, so it can be
 * used as a smoke check in a pipeline. On failure it captures an error
 * screenshot for debugging.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CONFIG = {
  url: 'https://test.netlify.app/',
  headless: false, // run visibly so the flow can be observed
  slowMo: 800, // ms between actions, for a human-watchable demo
  actionTimeout: 15000,
  screenshotDir: path.join(__dirname, 'screenshots'),
};

// Data typed into the form.
const FORM_DATA = {
  name: 'Nir Kaplan',
  email: 'kaplanir24@gmail.com',
  phone: '+972501234567',
  company: 'Jones Test Co.',
  website: 'https://www.jones-test.com',
  employees: '51-500', // bonus task
};

// Field selectors, kept in one place so the test data and the page contract
// are easy to maintain.
const SELECTORS = {
  name: '#name',
  email: '#email',
  phone: '#phone',
  company: '#company',
  website: '#website',
  employees: '#employees',
  submit: 'button:has-text("Request a call back")',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const log = {
  step: (m) => console.log(`\n➡️  ${m}`),
  pass: (m) => console.log(`✅ ${m}`),
  warn: (m) => console.log(`⚠️  ${m}`),
  fail: (m) => console.error(`❌ ${m}`),
  done: (m) => console.log(`\n🎉 ${m}`),
};

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

/** Fill a text input and assert the value was actually applied. */
async function fillField(page, selector, value, label) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, value);
  const actual = await page.inputValue(selector);
  if (actual !== value) {
    throw new Error(`${label} not set correctly — expected "${value}", got "${actual}"`);
  }
  log.pass(`${label}: "${actual}"`);
}

/** Select a dropdown option and assert it was applied. */
async function selectField(page, selector, value, label) {
  await page.waitForSelector(selector, { state: 'visible' });
  // The #employees <option>s carry no value="" attribute, so their implicit
  // value equals their visible text. Match on label explicitly rather than
  // relying on that coincidence (a bare string would match value OR label).
  await page.selectOption(selector, { label: value });
  const actual = await page.inputValue(selector);
  if (actual !== value) {
    throw new Error(`${label} not set correctly — expected "${value}", got "${actual}"`);
  }
  log.pass(`${label}: "${actual}"`);
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------
async function run() {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  const ts = timestamp();

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(CONFIG.actionTimeout);

  try {
    log.step(`Opening ${CONFIG.url}`);
    await page.goto(CONFIG.url, { waitUntil: 'domcontentloaded' });
    log.pass('Page loaded');

    log.step('Filling in the contact form');
    await fillField(page, SELECTORS.name, FORM_DATA.name, 'Name');
    await fillField(page, SELECTORS.email, FORM_DATA.email, 'Email');
    await fillField(page, SELECTORS.phone, FORM_DATA.phone, 'Phone');
    await fillField(page, SELECTORS.company, FORM_DATA.company, 'Company');
    await fillField(page, SELECTORS.website, FORM_DATA.website, 'Website');

    log.step('Bonus: setting Number of Employees to 51-500');
    await selectField(page, SELECTORS.employees, FORM_DATA.employees, 'Number of Employees');

    log.step('Capturing screenshot before submit');
    const beforePath = path.join(CONFIG.screenshotDir, `before_submit_${ts}.png`);
    await page.screenshot({ path: beforePath, fullPage: true });
    log.pass(`Screenshot saved: ${path.relative(__dirname, beforePath)}`);

    log.step('Clicking "Request a call back"');
    await page.click(SELECTORS.submit);

    log.step('Verifying the Thank You page');
    // The form navigates to /thank-you.html. Assert both the URL and the
    // on-page text so a partial/regressed page still fails the check.
    await page.waitForURL(/thank-you/i, { timeout: CONFIG.actionTimeout });
    const bodyText = await page.textContent('body');
    if (!/thank\s*you/i.test(bodyText)) {
      throw new Error(`Reached ${page.url()} but no "Thank You" text was found on the page`);
    }
    log.pass(`Thank You page confirmed: ${page.url()}`);
    log.done('SUCCESS — automation completed and Thank You page reached');
  } catch (error) {
    log.fail(`Automation failed: ${error.message}`);
    const errorPath = path.join(CONFIG.screenshotDir, `error_${ts}.png`);
    await page.screenshot({ path: errorPath, fullPage: true }).catch(() => {});
    log.warn(`Error screenshot saved: ${path.relative(__dirname, errorPath)}`);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// On success, let the process exit naturally (exit code 0) so buffered stdout
// is fully flushed. Only force a non-zero exit on failure for CI/smoke use.
run().catch(() => process.exit(1));
