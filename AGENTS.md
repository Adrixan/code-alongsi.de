# Code-Alongside website

Static site (HTML, CSS, vanilla JS), live at https://code-alongsi.de.
Docroot: `httpdocs` on the SSH host alias `code-alongsi.de` (see `~/.ssh/config`).
Brand and style: `~/.config/ai/BRANDING.md` ("Bioluminescent Night", Space Grotesk / Inter, no third-party requests).

## Definition of done for every update: the deploy is the final step

1. Change the site. New top-level page or directory: add it to `PATHS` in `scripts/deploy.sh`, to `sitemap.xml` and to `llms.txt`.
2. `npm test` (styleguide, privacy, accessibility, bot/AI readiness). Fix failures, do not skip.
3. Update `lastmod` in `sitemap.xml` for every page that changed.
4. Commit (Conventional Commits) and push on a feature branch, never directly on `main`.
5. `npm run deploy:dry`, then `npm run deploy`. The script re-runs the tests, backs up replaced files on the server, uploads, verifies SHA-256 checksums and smoke-tests https://code-alongsi.de.
6. Report the deploy result (changed files, checksum and smoke test outcome) to the user.

## Rules

- Deploys ship `HEAD` restricted to the allow-list in `scripts/deploy.sh`. Uncommitted changes are not deployed.
- The server docroot is shared with other apps (wp, meteo-rss, eztvxrss, imagecatcher). Never mirror or `--delete` it. The server has no rsync.
- No external hosts: CSP is `default-src 'self'`; fonts are self-hosted in `media/fonts` (OFL-1.1). The Datenschutz page promises no external tools.
- Rollback: backups are in `~/.deploy-backups/<UTC timestamp>.tar` on the server (newest 10 kept); restore with `ssh code-alongsi.de "tar -C httpdocs -xf .deploy-backups/<ts>.tar"`.
- Legacy dev files (package.json, tests/, .github/, ...) from an earlier git-based deploy were moved out of the docroot on 2026-10-13 to `~/.deploy-backups/legacy-20261013T142301Z/`. Never deploy dev files again; the allow-list prevents it. Permanent removal of that folder is left to the owner.
- `.well-known/security.txt` expires 2027-09-30. Renew it before then (the deploy warns 30 days ahead).
- Local test browser: if Playwright's Chromium build is missing, set `PLAYWRIGHT_CHROMIUM_PATH` (the deploy script auto-detects a cached one).
- `/apps/` (approved by Peter 2026-11-08): self-contained section with the legal pages of the Android apps (overview, `datenschutz.html`, `nutzungsbedingungen.html`, English in `apps/en/`). Linked only from the footer ("Unternehmen" > "Apps"), never from the main navigation. Google Play listings point to these URLs: never rename or move them. Links inside the site are root-absolute (`/apps/...`), which the link test enforces. When an app's features, permissions or data handling change, update both privacy pages and the "Stand" date before that app version ships.

## Legal pages: standing decisions (Peter, 2026-11-14)
- Name form (D22 A): every legal identity block (Impressum address and § 25 MedienG line, website privacy controller, `/apps/` terms and privacy DE/EN, `llms.txt` address) names the trader as on GISA, D&B and Play: "Dipl.-Ing. Dipl.-Ing. Peter Wilhelm Aufner, BSc", with "Code-Alongside" as addition. Copyright lines, prose and JSON-LD keep "Peter Aufner". The tests enforce the GISA form.
- App terms §§ 2, 3, 6, 7 and privacy § 3 carry the approved drafts of the launch consumer-law note (D22 A, live since 2026-11-14). Revisit §§ 2, 6, 7, 13 in February 2027 (Google marketplace model from 2027-03-01).
- Switzerland (D21 A): Google is not merchant of record in CH, Peter is. The CH exception for terms § 2 (plus a new § 14) and privacy § 10 is a draft pending the lawyer's check: `~/Obsidian/Adrixan/Research/Reports/2026-11-05-android-apps-from-the-lernspiel/notes/ch-seller-exception-draft.md`. Publish it only after Peter relays the lawyer's answer, and before the first production release that lists CH. Liechtenstein needs no exception (EEA, on Google's list).
- Privacy § 11 netcup sentence: still waits for Peter's three confirmations (see `.agents/session-handoff.md`).

## Web platform (Peter, 2026-11-11)
- New or changed HTML, CSS and client-side JS start from skill `modern-web-guidance` (installed CLI `modern-web-guidance`, not `npx`) and are checked in the browser with the `chrome-devtools` MCP.
- One-off modernization: `web-modernize` (2026-11-15, list `~/sync/ai/web-projects.txt`) runs `legacy-scan`, applies only verified behaviour-preserving fixes through this file's test and publish rules, and files larger changes in `.agents/to-do.md`; after that the rule above is the standard for all web work here.
