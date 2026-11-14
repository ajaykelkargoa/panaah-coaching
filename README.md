# Panaah Coaching Tracker

Session tracker for the Leadership That Works India x Panaah Communities coaching programme
(1 Nov 2026 to 31 Mar 2027, 17 leaders, 9 coaches, 5 sessions each).

Built on the same pattern as the Acumen tracker: one HTML page, three small Vercel
functions, and `data/sessions.json` in this repo as the database.

## What it does

**Coaches** pick their name and see only their own coachees. For each coachee they record:

- Scheduled (date agreed)
- Completed
- Rescheduled with 24+ hours notice
- Late reschedule by coachee (less than 24 hours notice; counts as completed under the contract)
- No-show by coachee
- Cancelled by coach

A session slot can go through several entries (scheduled, then no-show, then scheduled again, then completed).
A slot is "done" once it has a Completed or Late reschedule entry. Coaches can remove their own entry within 24 hours.

**Hema** (password) sees every pair, with automatic flags:

- no first session recorded
- 1 no-show (amber), 2 or more no-shows (red: coach may end the engagement)
- a scheduled date has passed without an update
- waiting for a new date after a no-show or reschedule
- behind pace to finish 5 sessions by 31 March

Plus a one-click "Report for Shoeb" with counts only, a CSV download, and the ability to remove wrong entries.

Only dates, times and statuses are stored. Nothing about session content.

## Files

- `public/index.html`: the whole app
- `api/log.js`: a coach records an entry
- `api/sessions.js`: read entries (coach sees own, password sees all)
- `api/delete.js`: remove an entry
- `api/_mapping.js`: coach to coachee mapping (change here AND in the `CM` block at the top of the script in `index.html`)
- `data/sessions.json`: the data

## Vercel settings (Environment Variables)

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | a GitHub personal access token with permission to write to this repo |
| `GITHUB_OWNER` | `ajaykelkargoa` |
| `GITHUB_REPO` | `panaah-coaching` |
| `ADMIN_PASSWORD` | the password Hema will use |
