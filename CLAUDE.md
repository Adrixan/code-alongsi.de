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
