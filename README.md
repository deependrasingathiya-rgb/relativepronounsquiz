# Relative Pronouns — Quick Quiz
A single-page mobile-first quiz for students. Students enter name → take quiz → get immediate auto-graded score. Teacher can capture results into a Google Sheet via Google Apps Script.

---

## Files included
- `index.html` — front-end quiz (single-file HTML/CSS/JS).
- `Code.gs` — Google Apps Script backend (doPost to append rows; doGet to return JSON).
- `teacher_dashboard.html` — optional teacher dashboard to view sortable submissions.
- This `README.md`.

---

## Quick setup (5–10 minutes)

### A. Create the Google Sheet
1. Create a new Google Sheet in your Google Drive.
2. Rename the first sheet tab to `Submissions` (or change `SHEET_NAME` in `Code.gs` to match).
3. (Optional) Add header row manually: `Timestamp | Name | Class | <question columns auto-appended> | TotalScore | Percent`
   - The Apps Script will create headers automatically if the sheet/tab doesn't exist.

### B. Create Apps Script project and paste `Code.gs`
1. In the Google Sheet, go to **Extensions → Apps Script**.
2. Delete any default code and paste the contents of `Code.gs`.
3. Save the project (give it a name like "RP Quiz Backend").

### C. Deploy Apps Script as Web App
1. In Apps Script, click **Deploy → New deployment**.
2. Choose **"Web app"**.
   - Description: e.g., "RP Quiz backend".
   - Execute as: **Me (your account)**
   - Who has access: **Anyone** (to allow students without Google sign-in) OR choose a more restricted option if required.
3. Click **Deploy**. Grant required permissions.
4. Copy the **Web app URL** (it will look like `https://script.google.com/macros/s/ABCDE/exec`).

**Security note**: Setting "Who has access" to **Anyone, even anonymous** allows submissions from students without signing in, but the endpoint is public. If you want to restrict to your Google Workspace domain, choose that option — students will need to sign in.

### D. Configure front-end
1. Open `index.html` in a text editor.
2. Find the line near top: `const BACKEND_URL = ""`.
3. Paste your Apps Script Web App URL between the quotes.
4. Save.

### E. Host `index.html` (shareable link)
You can host the front-end on GitHub Pages or Netlify (both free and simple).

#### Option 1 — GitHub Pages (recommended)
1. Create a new GitHub repository.
2. Add `index.html` to the repo root and commit.
3. In the repo settings → Pages, set the source to the `main` branch root. Save.
4. GitHub will provide a URL like `https://yourusername.github.io/repo-name/`. Share this on WhatsApp.

#### Option 2 — Netlify (one-click)
1. Create a Netlify account.
2. Drag-and-drop the `index.html` into the Netlify "Sites" area or connect your GitHub repo.
3. Netlify publishes a URL you can share.

**If you do not deploy a backend** (leave `BACKEND_URL` empty), the app will save submissions to each student's device `localStorage` only — results won't be visible to the teacher until a backend is configured.

---

## Teacher dashboard
- Use `teacher_dashboard.html`. Paste the same Apps Script Web App URL into the input and click **Load**. This will call `doGet` and return a JSON of sheet rows.
- The dashboard provides basic sorting by clicking column headers.

---

## How it works (technical summary)
- Front-end auto-grades based on the answer key embedded in `index.html`.
- Normalization: trim, lowercase, collapse spaces, remove leading/trailing punctuation.
- Free-text sentences:
  - Exact normalized match to canonical or alternatives → correct.
  - Else: keyword matching (requires all keywords for full credit).
  - If neither matches → marked incorrect and can be manually regraded.
- After grading, the front-end POSTs a JSON payload to your Apps Script `doPost`. The Apps Script appends a new row to the Google Sheet.
- If backend is unavailable or not configured, the front-end saves submissions to `localStorage` and shows a prominent notice.

---

## Where to change content / answers
- The complete answer key lives in `index.html` in the `ANSWER_KEY` JavaScript object near the top. You can edit questions, allowed answers, keywords, or points there.

---

## Deployment: Troubleshooting & notes
- If `doPost` returns an error, ensure your Apps Script deployment has "Execute as: Me" and the correct access level.
- If `doGet` returns "No sheet found", ensure the `SHEET_NAME` in `Code.gs` matches the sheet tab name exactly.
- Students do not need Google accounts if you set the web app access to "Anyone".

---

## Test plan — Acceptance tests (5)
1. **Student submission saved to Sheet**
   - Enter `Riya Patel` as name, fill sample answers (mix correct/incorrect), click Submit.
   - Confirm immediate score shown.
   - Open Google Sheet → a new row appears with timestamp, name, answers, and score.

2. **Local fallback when backend not configured**
   - Leave `BACKEND_URL` blank in `index.html`.
   - Submit a sample quiz.
   - Observe "Saved locally" notice and verify localStorage key `rp_quiz_submissions` contains entry.

3. **Variant acceptable answers**
   - For B4, try `that` and `which` — both accepted.
   - For C2, choose MC alternative `This is the book that I bought yesterday.` (if teacher MC enabled), ensure auto-grade marks correct.

4. **Keyword-based acceptance**
   - For C3 (singer whose voice...), type a combined sentence that doesn't exactly match but includes keywords like `singer whose voice everyone loves` (or words singer, whose, voice, loves). Should be awarded full points.

5. **Teacher dashboard**
   - Open `teacher_dashboard.html`, paste Apps Script URL, click Load.
   - Confirm table shows submissions and clicking column headers sorts entries.

---

## Security & Privacy
- The app collects: student `name`, optional `class`, answers, timestamp, and numeric score. Avoid collecting emails, phone numbers, or other sensitive data.
- Deploying the Apps Script as **Anyone, even anonymous** is easiest for classes with students who don't sign in but means anyone with the URL can POST to your sheet. To reduce risk:
  - Keep the Web App URL private.
  - Use domain-restricted access (requires sign-in) if your students have Google Workspace accounts.
- The front-end fallback localStorage is stored only on the student's device.

---

## Developer notes / future improvements
- You can add server-side validation in Apps Script to re-check grading server-side if desirable.
- To allow teacher editing of accepted alternatives, create a separate admin UI to update the `ANSWER_KEY` (requires hosting or Google Apps Script UI).
- The teacher can add a simple Google Sheet filter/sort or use built-in Google Sheets features for analysis.

---

## Support
If you want, paste your Apps Script URL here and I can verify your front-end configuration (I cannot run or deploy for you, but I can review and suggest edits).

Good luck — share the `index.html` link on WhatsApp and your students can start immediately. 😊