# Jones Automation Exercise — Written Answers

**Candidate:** Nir Kaplan
**Date:** June 2026

---

## Part A — Playwright Automation

The automation lives in [`automation.js`](./automation.js). Setup and run
instructions are in the [`README.md`](./README.md); in short:

```bash
npm install      # installs Playwright + Chromium
npm start        # runs the automation
```

**What it does**

1. Opens <https://test.netlify.app/>.
2. Fills **Name, Email, Phone, Company, Website** — each value is read back and
   asserted, so a field that silently fails to fill is caught immediately.
3. **(Bonus)** Changes **Number of Employees** from `1-10` to `51-500`.
4. Saves a full-page screenshot to `screenshots/before_submit_<timestamp>.png`
   before submitting.
5. Clicks **"Request a call back"**.
6. Verifies the Thank You page by asserting **both** the resulting URL
   (`/thank-you.html`) **and** the on-page "Thank You" text, then logs success.

The script is written as a genuine check rather than a one-shot script: it exits
`0` on success and `1` on failure, and on any error it captures
`screenshots/error_<timestamp>.png` for debugging.

---

## Part B — UI Mock-up Analysis: Account Information / Billing Widget

The prompt asks me to consider all functional aspects — **Security, Usability,
Performance, etc.** — so the findings below are grouped by category, each with a
severity. I separate what is **visible in the static mock-up** from what **must be
verified against the live implementation**, because a screenshot cannot reveal
runtime behavior.

### a. Problems Found

#### 🔒 Security

| Sev.       | Issue                          | Why it matters                                                                                                                                                                                  |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 **Critical** | **No CVV / CVC field**         | Card networks require the CVV to authorize a card-not-present transaction. Without it the form cannot complete a payment — this is a functional **and** security blocker, visible in the design. |
| 🟠 High *(verify)* | **Card number masking**        | Does the field mask the number after entry (e.g. `•••• •••• •••• 4242`)? Unmasked PANs are exposed to shoulder-surfing and screenshots. Not visible in a mock-up — must be tested live.          |
| 🟠 High *(verify)* | **Transport security (HTTPS)** | Payment pages must be served over TLS. Cannot be confirmed from an image; verify the live page and that the form posts to an HTTPS endpoint.                                                     |
| 🟡 Medium *(verify)* | **Input sanitization / XSS**   | Free-text fields (name, address) must safely escape input. Verify a payload such as `<script>alert(1)</script>` is neutralized.                                                                 |
| 🟡 Medium *(verify)* | **Re-authentication**          | When *editing* saved billing details, is the user re-prompted for a password? Protects against account takeover. Not shown in this single screen.                                              |

#### ⚙️ Functional / Validation

| Sev.      | Issue                                              | Why it matters                                                                                                                                              |
| --------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟠 High   | **No currency on "Payment Amount: 30.00"**         | The user cannot tell if they are charged USD, EUR, etc. For a *global* SaaS this is a real risk — display the currency (e.g. `$30.00 USD`).                |
| 🟡 Medium *(verify)* | **Expiration year may allow past years**           | If "Select year" lists years already elapsed, an expired card can be submitted. Verify the dropdown only offers the current year and forward.              |
| 🟡 Medium *(verify)* | **Postal code "(no dashes)" vs. global addresses** | The hint and "no dashes" rule suit US ZIPs but break Canadian/UK codes (`M5V 3L9`). Verify the field accepts international formats for a global product.    |

#### 🧭 Usability

| Sev.      | Issue                                                   | Why it matters                                                                                                                       |
| --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 🟠 High   | **Label vs. control mismatch: "State or Province" → "Select a state"** | The label promises international support but the dropdown says "Select a state" — confusing/blocking for non-US users.               |
| 🟡 Medium | **Redundant "Card Type" dropdown**                      | Card type can be auto-detected from the card-number prefix (Visa `4`, Mastercard `5`…). Manual selection adds friction and error.    |
| 🟡 Medium | **"MI" abbreviation is unclear**                        | "MI" (middle initial) is US-centric and not obvious internationally. Use a clear label or drop it.                                  |
| 🟢 Low    | **"Cancel" has no confirmation**                        | Clicking Cancel after filling the form could discard all input with no warning. Confirm before discarding.                          |

#### ♿ Accessibility *(verify)*

| Sev.      | Issue                          | Why it matters                                                                                                                  |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 🟡 Medium | **Label association & errors** | Verify every input has a programmatic `<label>`, the required `*` is announced (not color-only), and errors are screen-reader accessible. |

#### ⚡ Performance *(verify)*

| Sev.   | Issue                | Why it matters                                                                                                            |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 🟢 Low | **Page/asset load**  | Not measurable from a mock-up. On the live form, verify load time, that dropdowns (year/state) populate without lag, and that submit gives prompt feedback (spinner/disabled button) so users don't double-submit. |

---

### b. Sample Test Cases

**TC-001 — Card Number validation**

| Field        | Value                                                |
| ------------ | ---------------------------------------------------- |
| **ID**       | TC-001                                               |
| **Priority** | High                                                 |
| **Precondition** | User is on the Account Information billing form |

| # | Step                                       | Expected result                                          |
| - | ------------------------------------------ | -------------------------------------------------------- |
| 1 | Leave Card Number empty, click **Continue** | Required-field error; form does not submit.              |
| 2 | Enter `1234-5678-9012-3456` (dashes)        | Validation error — "no dashes or spaces" per the hint.   |
| 3 | Enter `1234 5678 9012 3456` (spaces)        | Validation error — "no dashes or spaces".                |
| 4 | Enter a 15-digit number                     | Validation error — card number must be 16 digits.        |
| 5 | Enter valid Visa `4111111111111111`         | Accepted; form proceeds.                                 |

---

**TC-002 — Successful end-to-end submission**

| Field        | Value                                                       |
| ------------ | ---------------------------------------------------------- |
| **ID**       | TC-002                                                      |
| **Priority** | Critical                                                   |
| **Precondition** | User has a valid test card (e.g. Stripe `4242 4242 4242 4242`) |

| # | Step                                                                  | Expected result                                                  |
| - | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1 | Select Card Type **Visa**; enter card number `4242424242424242`        | (Verify) number masks to last 4 after blur.                     |
| 2 | First Name `Test`, MI `Q`, Last Name `User`                            | Accepted.                                                       |
| 3 | Street `123 Main St`; City `New York`; State `New York`; Postal `10001` | Accepted.                                                       |
| 4 | Expiration Month `12`, Year = current year + 1                          | Accepted (future date).                                         |
| 5 | Click **Continue**                                                     | Submits with no errors; navigates to a confirmation page showing the amount **with currency**. |

---

**TC-003 — Negative / boundary input**

| Field        | Value                                                |
| ------------ | ---------------------------------------------------- |
| **ID**       | TC-003                                               |
| **Priority** | High                                                 |
| **Precondition** | User is on the Account Information billing form |

| # | Step                                                            | Expected result                                          |
| - | --------------------------------------------------------------- | -------------------------------------------------------- |
| 1 | First Name = `12345` (digits only)                              | Validation error — name should not be all numbers.       |
| 2 | Card Number = `abcdefg` (letters)                               | Validation error — digits only.                          |
| 3 | Expiration Year = a past year (if selectable)                   | Validation error — card is expired. *(See bug above.)*   |
| 4 | Cardholder Name = `<script>alert(1)</script>`                   | Input is escaped/rejected; no script executes, no crash. |

---

### c. Suggested Product Solution for the Most Severe Bug

**Most severe bug: the missing CVV / CVC field (Security — Critical).**

It is the most severe because it both **blocks the core function** (no payment can
be authorized without a CVV) **and** is a security gap, and it is plainly visible in
the design rather than a maybe.

**Recommendation**

1. **Add a required CVV/CVC field** (3–4 digits) next to the Expiration date — the
   placement users expect. Validate length against the selected card type
   (Amex = 4, others = 3).
2. **Never store the CVV.** PCI-DSS explicitly **prohibits storing CVV after
   authorization** — pass it straight to the payment processor and discard it. This
   is the key compliance point: collect it, use it once, never persist it.
3. **Mask the card number** after the field loses focus (show only the last 4) and
   **serve the page over HTTPS** with a visible trust indicator
   ("🔒 Secured by [provider]") near the submit button.

Together these bring the widget in line with PCI-DSS and protect both the business
and its customers from declined payments, fraud, and regulatory penalties — while
removing the blocker that currently prevents the form from working at all.
