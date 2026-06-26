# Jones Automation Exercise — Written Answers
**Candidate:** Nir Kaplan
**Date:** June 2026

---

## Part A — Playwright Automation

See `automation.js` in this submission.

**How to run:**
```bash
npm install
npx playwright install chromium
npm start
```

The script will:
1. Open https://test.netlify.app/ in a Chromium browser.
2. Fill in Name, Email, Phone, Company, and Website.
3. **(Bonus)** Change Number of Employees from 1–10 to 51–500.
4. Take a full-page screenshot saved as `screenshot_before_submit_<timestamp>.png` (e.g. `screenshot_before_submit_2026-06-25_14-30-05.png`) in the same directory as the script, so each run produces a uniquely named file and no `screenshots/` folder is required.
5. Click "Request a call back".
6. Log a success message to the console when the Thank You page is reached.

---

## Part B — UI Mock-up Analysis: Account Information / Billing Widget

### a. Problems Found

#### 🟠 HIGH — Functional / Validation

| # | Issue | Details |
|---|-------|---------|
| 1 | **CVV / CVC field is missing from the form** | The mockup clearly shows no CVV field. Payment processors require CVV to authorize a transaction — without it, the form cannot successfully process payments. This is a functional blocker visible directly in the design. |
| 2 | **"State or Province" label vs. "Select a state" dropdown — inconsistent** | The label suggests international support but the dropdown says "Select a state" — this is a visible inconsistency in the design that will break the experience for non-US users. |
| 3 | **Payment Amount has no currency symbol** | The amount shown is `30.00` with no indication of currency (USD? EUR?). Users cannot confirm what they are actually being charged. |


#### 🟡 MEDIUM — Usability

| # | Issue | Details |
|---|-------|---------|
| 4 | **Card Type dropdown is redundant** | Most modern billing forms auto-detect the card type from the card number prefix (Visa starts with 4, Mastercard with 5, etc.). Requiring manual selection introduces human error. |


#### 🔍 NEEDS VERIFICATION — Cannot confirm from mockup alone

These are risks that are not visible in a static mockup but must be tested and confirmed during implementation:

| # | Risk | What to verify |
|---|------|----------------|
| 5 | **Card number masking** | Does the field mask the number after input (e.g. ●●●● ●●●● ●●●● 4242)? A mockup cannot show runtime behavior — this must be tested in the live form. |
| 6 | **HTTPS / SSL** | Is the page served over HTTPS? This cannot be determined from a mockup. Must be confirmed in the actual environment. |
| 7 | **Re-authentication before changing payment info** | Does the flow require the user to confirm their password before updating billing details? Not visible in this mockup — needs confirmation in the full user flow. |
| 8 | **Postal Code format restrictions** | Does the field only accept numeric input? International postal codes contain letters (e.g. Canadian `M5V 3L9`). Needs to be tested with non-US inputs. |

---

### b. Sample Test Cases

---

**Test Case 1 — Card Number Validation**

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-001 |
| **Title** | Card number field rejects invalid formats |
| **Priority** | High |
| **Precondition** | User is on the Account Information billing form |

**Steps:**

1. Leave the Card Number field empty → Click Continue.
   - **Expected:** Required field error shown, form does not submit.
2. Enter `1234-5678-9012-3456` (with dashes) → Click Continue.
   - **Expected:** Validation error: "No dashes or spaces allowed."
3. Enter `1234 5678 9012 3456` (with spaces) → Click Continue.
   - **Expected:** Validation error: "No dashes or spaces allowed."
4. Enter a 15-digit number → Click Continue.
   - **Expected:** Validation error: card number must be 16 digits.
5. Enter a valid 16-digit Visa number (`4111111111111111`) → Click Continue.
   - **Expected:** Form proceeds to the next step.

---

**Test Case 2 — Full Form Submission with Valid Data**

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-002 |
| **Title** | Successful payment form submission end-to-end |
| **Priority** | Critical |
| **Precondition** | User has a valid test Visa card (e.g. Stripe test card `4242424242424242`) |

**Steps:**

1. Select Card Type: Visa.
2. Enter Card Number: `4242424242424242`, then click or tab to the next field.
   - **Expected:** The card number is masked to show only the last 4 digits (e.g. `●●●● ●●●● ●●●● 4242`).
3. Enter First Name: `Test`, MI: `Q`, Last Name: `User`.
4. Enter Billing Street Address: `123 Main St`.
5. Enter City: `New York`, State: `New York`, Postal Code: `10001`.
6. Select Expiration Month: `12`, Year: one year in the future.
7. Click **Continue**.

**Expected Results:**
- Form submits without errors.
- User is navigated to a confirmation/summary page.
- Payment Amount of **30.00** (with currency clearly shown) is confirmed.

---

**Test Case 3 — Negative Testing: Wrong Input Types**

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-003 |
| **Title** | Form fields reject invalid input types |
| **Priority** | High |
| **Precondition** | User is on the Account Information billing form |

**Steps:**

1. Enter numbers only (`12345`) in the First Name field → Click Continue.
   - **Expected:** Validation error: name fields should not accept numbers.
2. Enter letters only (`abcdefg`) in the Card Number field → Click Continue.
   - **Expected:** Validation error: card number must contain digits only.
3. Enter a negative number (`-30`) in the Postal Code field → Click Continue.
   - **Expected:** Validation error: postal code cannot be negative.
4. Enter special characters (`<script>alert(1)</script>`) in the Cardholder Name field → Click Continue.
   - **Expected:** Input is rejected or safely escaped — no script executes, no error crashes the page.

---

### c. Suggested Product Solution for the Most Severe Bug

**Most Severe Bug: No CVV / CVC field (Item #1)**

The CVV field is visibly missing from the design. Payment processors require CVV as part of the authorization flow — without it, the form is functionally broken and payments will be declined. This is the most critical issue because it blocks the entire purpose of the widget.

**Recommended Solution:**

1. **Add a CVV/CVC field** (required, 3–4 digits, never stored server-side) next to the Expiration date, which is the standard placement users expect.

2. **Mask the card number after entry** — show only the last 4 digits once the user moves to the next field (e.g. `●●●● ●●●● ●●●● 4242`). This prevents shoulder-surfing and screenshot exposure, and should be verified during implementation.

3. **Display a visible HTTPS / trust indicator** (padlock icon + "Secured by [Payment Provider]") above the form to build user trust at the moment of payment.

> These changes combined bring the widget into PCI-DSS compliance and protect both the business and its customers from financial fraud and regulatory penalties.
