# UPESSC Assistant Professor Physics Score Portal

## Files
- `index.html` — public student submission page
- `admin.html` — private statistics dashboard
- `Code.gs` — Google Apps Script backend

## 1. Create the Google Sheet
1. Create a new Google Sheet, e.g. `UPESSC Physics Score Responses`.
2. Open **Extensions → Apps Script**.
3. Replace the editor contents with `Code.gs` from this folder.
4. In `Code.gs`, change `INITIAL_ADMIN_KEY` to a long private password (letters, numbers, symbols).
5. Save. Select `setup` in the function dropdown and click **Run**. Authorize the requested Google permissions.
6. Confirm that a tab named `Student Responses` exists.

## 2. Deploy Apps Script
1. Click **Deploy → New deployment**.
2. Select type **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone** (student submissions need public access).
5. Click Deploy, authorize if asked, and copy the Web app URL ending in `/exec`.
6. Keep this URL; it is the backend endpoint. Do not share your Admin Key.

## 3. Connect the two pages
1. Open `index.html` in a code editor.
2. Find `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` and replace it with your `/exec` URL. Keep the quotes.
3. Do the same replacement in `admin.html`.
4. Save both files.

## 4. Publish on GitHub Pages
For an existing GitHub Pages website:
1. Open your repository (the one publishing Physics by Radheshyam).
2. Create a folder named `upessc-score` in the published site root.
3. Upload `index.html` and `admin.html` into that folder.
4. Commit/push the changes and wait for GitHub Pages to publish.

Student link:
`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/upessc-score/`

Admin link:
`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/upessc-score/admin.html`

If your repository is a user/organization site (not a project site), the URL path may differ. Use the exact URL shown by GitHub Pages settings.

## 5. Test before sharing
1. Open the student link on your phone.
2. Submit one test entry with clearly marked test data.
3. Confirm a new row appears in `Student Responses`.
4. Open the admin link, enter your private Admin Key, and check the stats/table.
5. Delete the test row from Google Sheets before sharing publicly.

## Important notes
- The form records name (optional), shift, correct, wrong, unattempted, marks and timestamp.
- The current exam total is configured as 120 questions and marks are validated from 0 to 120. If the official maximum marks or question count differs, update `TOTAL_QUESTIONS` in `Code.gs` and `TOTAL_QUESTIONS` plus the marks validation in `index.html`.
- Marks are entered by students; the site does not calculate the official marking scheme. This avoids assuming a negative-marking rule.
- Anyone with the public student URL can submit. The Admin Dashboard requires the private key. Do not put the key into `index.html`, GitHub, or a YouTube description.
- Apps Script web apps set to "Anyone" are public endpoints. Basic validation and duplicate-request protection are included, but this is not an anti-spam system. If the link receives heavy spam, pause the Apps Script deployment or add a stronger verification/rate-limit layer.
- If you change Apps Script code after deployment, use **Deploy → Manage deployments → Edit → New version → Deploy**.
