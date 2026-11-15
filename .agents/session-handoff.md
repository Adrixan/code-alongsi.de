# Session Handoff

*Updated: 2026-11-15*

## Trajectory
2026-11-15 (web-modernize timer, unattended): Modern Web Guidance legacy-scan of `index.html`, `datenschutz.html`, `impressum.html`, `css/`, `js/`, `apps/`: 0 findings (35 rules, 33 guides). Scanner validated with a throw-away probe outside the repo (2 findings), so the result is real. No code change, no deploy; live stays `547070a`. Report: `~/sync/ai/web-modernize/2026-11-15/code-alongsi.de.md`. From now on the AGENTS.md "Web platform" rule applies to all web work here.

2026-11-14 (evening): brief from the Greeter via `rc code --brief` with Peter's decisions D21 A and D22 A from `~/Obsidian/Adrixan/Open tasks.md` (saved 18:24; copy `~/code/.scratch/open-tasks-peter-2026-11-14-1824.md`). Done:
- Line 472 check: `e1639d3` (Buchstabenfährte, Themetrail) was already live; the 2026-11-13 handoff's "live = 2d9054a" was stale. SHA-256 of all seven changed files matched HEAD on the server before this deploy.
- D22 A, live at `547070a` (deploy 2026-11-14 17:40 UTC, 8 files uploaded, 27/27 checksums match, smoke test green, server backup `~/.deploy-backups/20261114T174001Z.tar`): terms § 2 neutral contracting party; § 3 licence for private use plus teaching, tutoring and learning support, one purchase per Google account; § 6 withdrawal waiver collected by Google Play, voluntary later refund; § 7 update promise "zusätzlich und freiwillig", does not limit statutory rights (five years kept); privacy § 3 § 165 Abs. 3 TKG 2021 sentence; GISA name "Dipl.-Ing. Dipl.-Ing. Peter Wilhelm Aufner, BSc" in all legal identity blocks (Impressum incl. § 25 MedienG line, website privacy, app terms and privacy DE/EN, llms.txt). "Stand" 14 November 2026 on the four app legal pages, "November 2026" on the website privacy page; sitemap lastmod 2026-11-14 for six pages. Tests 53 (3 new). Commit `51f0810`, merge `547070a`.
- D21 A: draft `~/Obsidian/Adrixan/Research/Reports/2026-11-05-android-apps-from-the-lernspiel/notes/ch-seller-exception-draft.md` (terms § 2 insert, new § 14 "Käufe in der Schweiz", privacy § 10 first sentence and legal basis; lawyer questions L1 to L7; Steuerberater Q8). Marked DRAFT, pending lawyer check; NOT published. Pointers added in that report's `manual-steps.md` line 75 and `notes/launch-tax.md` (Q8). Liechtenstein checked: on Google's merchant-of-record list (EEA), no exception needed.
- Standing decisions recorded in `AGENTS.md` ("Legal pages: standing decisions").

Earlier: 2026-11-13 Nextcloud playground task (see `~/code/.agents/session-handoff.md`); 2026-11-09 app terms and privacy aligned with the consumer-law research; 2026-11-08 `/apps/` section.

## State
- Live site == `main` at `547070a` (later commits touch only `AGENTS.md` and `.agents/`).
- Privacy § 10 still says "Verkäufer und Vertragspartner beim Kauf ist Google" without a CH exception. Harmless until the first production release with CH on the country list; the CH draft replaces it.
- Local tests need `PLAYWRIGHT_CHROMIUM_PATH=$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome | sort -V | tail -1)` (the installed @playwright/test expects headless shell 1223, not cached); `npm run deploy` sets it itself.

## Needs Peter
1. **Lawyer (D21 A):** take `ch-seller-exception-draft.md` (questions L1 to L7) to the lawyer appointment; relay the answer to this role, which then publishes the CH wording (DE/EN, Stand, sitemap, tests, deploy). Before the first production release that lists CH; fallback: remove CH from the country lists.
2. **Steuerberater:** send Q8 (CH sales) with the existing list in `notes/launch-tax.md` section 8.
3. **Privacy § 11 netcup sentence** (unchanged): confirm (a) netcup data centre in the EU and the AVV concluded in the CCP, (b) no forwarding of the mailbox to a non-EEA provider, (c) order exports kept out of the OneDrive mirror or stored encrypted. Then this role publishes the drafted sentence.
4. Low, still open: GISA-Zahl display (37227111) in the Impressum, public contact address (`apps@` not approved), UTF-8 for `text/plain` in Plesk, permanent removal of the quarantined legacy dev files in `~/.deploy-backups/legacy-20261013T142301Z/` (already outside the docroot since 2026-10-13).

## Next steps
- When an app ships with features or permissions that differ from the privacy policy, update both language versions, the "Stand" date and sitemap lastmod, then deploy.
- February 2027: after Google's amended DDA and Play Terms (marketplace model from 2027-03-01) revisit terms §§ 2, 6, 7, 13 and the CH section.
- Renew security.txt before 2027-09-30.
