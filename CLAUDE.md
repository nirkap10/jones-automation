# jones_automation — Project Context

## What This Is

A QA/automation take-home exercise submitted for a job application at **Jones**. Two parts:

- **Part A**: A Playwright script that fills a contact form, screenshots it, submits, and verifies the Thank You page.
- **Part B**: Written QA analysis of a billing widget UI mockup (`ANSWERS.md`).

## Tech Stack

- **Runtime**: Node.js ≥18, plain JavaScript (CommonJS)
- **Browser automation**: Playwright 1.61.1, Chromium engine
- **No test framework** — the script runs directly via `node` and uses its own assertions + exit codes

## Project Structure

```
automation.js        # The only app code — Playwright script (config-driven)
ANSWERS.md           # Written submission (Part A description + Part B QA analysis)
README.md            # Setup / run / project overview
package.json         # npm scripts: start, test, install-browsers
screenshots/         # Runtime screenshot output (git-ignored; .gitkeep only)
.gitignore           # Ignores node_modules/, screenshots/*.png, etc.
```

## How to Run

```bash
npm install                 # installs Playwright; postinstall downloads Chromium
npm start                   # or: npm test  → runs node automation.js
```

## What automation.js Does

1. Reads config from three objects at the top: `CONFIG`, `FORM_DATA`, `SELECTORS`.
2. Launches visible Chromium (`headless: false`, `slowMo: 800`).
3. Navigates to `https://test.netlify.app/`.
4. Fills `#name`, `#email`, `#phone`, `#company`, `#website` via a `fillField` helper that asserts each value was applied.
5. Sets `#employees` to `51-500` (bonus), also asserted.
6. Screenshots to `screenshots/before_submit_<timestamp>.png`.
7. Clicks the `button:has-text("Request a call back")` submit button.
8. Verifies the Thank You page by asserting **both** the URL (`/thank-you.html`) and the body "Thank You" text.
9. On error: saves `screenshots/error_<timestamp>.png`.
10. Exits `0` on success, `1` on failure.

Note: the submit button has no `type` attribute (`<button class="primary button">`), so it is targeted by text, not `button[type=submit]`.

## ANSWERS.md Summary

- Part A: run instructions + script description.
- Part B: QA analysis of the billing mockup, organized by category to match the prompt's "Security, Usability, Performance, etc.":
  - **Security**: missing CVV (critical), card masking, HTTPS, sanitization, re-auth.
  - **Functional**: no currency on amount, expired-year risk, postal-code format.
  - **Usability**: "State or Province" vs "Select a state" mismatch, redundant Card Type, unclear "MI", no Cancel confirmation.
  - **Accessibility / Performance**: items to verify on the live form.
  - Findings separate "visible in mockup" from "needs live verification".
  - 3 test cases (TC-001…TC-003) and a product solution for the CVV bug with PCI-DSS framing (never store CVV).
