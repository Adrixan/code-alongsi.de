# Session Handoff

*Updated: 2026-10-20*

## Trajectory
Audit against BRANDING.md, bot/AI readiness, scripted deploy to https://code-alongsi.de (US-2). Delivered, merged to `main`, and deployed at commit `daf4b4c`.

## State
- Live site == `main` at commit `daf4b4c` (checksum verified, smoke test green).
- Deploy: `npm run deploy:dry` then `npm run deploy` (see CLAUDE.md, final step of every update).
- Server: SSH alias `code-alongsi.de`, docroot `httpdocs` (shared with wp, meteo-rss, eztvxrss, imagecatcher), no rsync, backups in `~/.deploy-backups/`.

## Pending decisions (owner)
1. DONE 2026-10-20: legacy dev files were moved out of the docroot; owner approved permanent deletion and quarantined folder `.deploy-backups/legacy-20261013T142301Z/` was deleted over SSH.
2. APPROVED 2026-10-20: enable UTF-8 for `text/plain`. Still pending Plesk configuration: the SSH account exposes no Plesk CLI or domain-local nginx config, and nginx currently serves these files without a charset. Configure in Plesk (nginx: `charset utf-8; charset_types text/plain;`) and verify response headers. Avoid adding a docroot-wide `.htaccess` without checking effects on cohosted apps.
3. DONE 2026-10-20: feature branch fast-forwarded into `main` and pushed to origin.
4. CONFIRMED 2026-10-20: keep AI training crawlers allowed in `robots.txt`.
5. CONFIRMED 2026-10-20: legal references are accepted as-is; no legal copy change requested.
6. CONFIRMED 2026-10-20: leave the privacy notice unchanged; do not add the hoster name.

## Next steps
- Renew security.txt before 2027-09-30.
- Update sitemap.xml lastmod on every content change.
