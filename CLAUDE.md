# jones_automation — Project Context

## What This Is

A QA/automation take-home exercise submitted for a job application at **Jones**. The exercise had two parts:

- **Part A**: Playwright browser automation script that fills a contact form, takes a screenshot, submits it, and verifies the Thank You page.
- **Part B**: Written QA analysis of a billing widget UI mockup (`ANSWERS.md`).

## Tech Stack

- **Runtime**: Node.js ≥18, plain JavaScript (CommonJS)
- **Browser automation**: Playwright 1.61.1, Chromium engine
- **No test framework** — script runs directly via `node`
- **No TypeScript, no linting, no CI**

## Project Structure

```
automation.js        # The only app code — Playwright IIFE script
ANSWERS.md           # Written submission (Part A description + Part B QA analysis)
package.json         # npm scripts: start, install-browsers
screenshots/         # Output dir for PNG screenshots (written at runtime)
```

## How to Run

```bash
npm install                          # install playwright
npx playwright install chromium     # download browser binary
npm start                            # runs node automation.js
```

## What automation.js Does

1. Launches visible Chromium with `slowMo: 800ms`
2. Navigates to `https://test.netlify.app/`
3. Fills `#name`, `#email`, `#phone`, `#company`, `#website` by CSS ID
4. Sets `#employees` dropdown to `51-500` (bonus task)
5. Screenshots to `screenshots/screenshot_before_submit.png`
6. Clicks the "Request a call back" submit button
7. Verifies Thank You page via case-insensitive regex on body text
8. On error: saves `screenshots/screenshot_error.png`, logs message

All parameters (URL, test data, paths) are hardcoded in the script.

## ANSWERS.md Summary

- Part A: install/run instructions + script description
- Part B: QA analysis of a billing UI mockup
  - 6 high-severity bugs (missing CVV, no card format feedback, expired-year risk, label inconsistency, no currency indicator, no Cancel confirmation)
  - 3 medium usability issues
  - 6 "needs verification" runtime items
  - 3 structured test cases (TC-001 to TC-003)
  - Product recommendation for CVV bug with PCI-DSS framing
