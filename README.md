# Jones — QA Automation Exercise

A small Playwright automation submitted as part of a QA application for **Jones**.

The script drives the contact form at <https://test.netlify.app/>: it fills every
field, captures a screenshot, submits the form, and verifies that the **Thank You**
page is reached. It is written as a real check — it exits `0` on success and `1` on
failure, and captures an error screenshot if anything goes wrong.

> The written QA analysis (Part B of the exercise) lives in [`ANSWERS.md`](./ANSWERS.md).

---

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) **18 or newer**

## Setup

```bash
npm install                 # installs Playwright and downloads Chromium (via postinstall)
```

If the browser download did not run automatically:

```bash
npm run install-browsers    # playwright install chromium
```

## Run

```bash
npm start                   # or: npm test
```

A Chromium window opens and the flow runs slowly enough to watch. When it finishes,
the console reports success and the exit code reflects the result.

---

## What the script does

1. Opens <https://test.netlify.app/>.
2. Fills **Name, Email, Phone, Company, Website** — each value is read back and
   asserted, so a silently-failed fill is caught.
3. **Bonus:** changes **Number of Employees** from `1-10` to `51-500`.
4. Saves a full-page screenshot to `screenshots/before_submit_<timestamp>.png`.
5. Clicks **"Request a call back"**.
6. Verifies the Thank You page by asserting **both** the URL (matches `/thank-you/`)
   **and** the on-page "Thank You" text, then logs success.

On any failure it saves `screenshots/error_<timestamp>.png` and exits non-zero.

## Configuration

All inputs are grouped at the top of [`automation.js`](./automation.js):

| Object       | Purpose                                              |
| ------------ | --------------------------------------------------- |
| `CONFIG`     | URL, headless/slowMo, timeouts, screenshot location |
| `FORM_DATA`  | The values typed into each field                     |
| `SELECTORS`  | The page selectors used by the flow                  |

To run headless (e.g. in CI), set `headless: true` and `slowMo: 0` in `CONFIG`.

## Project structure

```
automation.js     # The automation script
ANSWERS.md        # Part B — written QA analysis of the billing widget
README.md         # This file
package.json      # Scripts and dependencies
screenshots/      # Screenshots produced at runtime (git-ignored)
```
