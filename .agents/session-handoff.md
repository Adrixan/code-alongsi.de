# Session Handoff

*Updated: 2026-11-08*

## Trajectory
2026-11-08: `/apps/` section with the legal pages of the seven Android apps (approved by Peter on 2026-11-08), built, merged and deployed. Earlier: US-2 (styleguide, bot/AI readiness, scripted deploy), live since 2026-10-20.

## State
- Live site == `main` at `bf9db3b` (deploy 2026-11-08 16:31 UTC, 12 files uploaded, all 27 checksums match, smoke test green incl. the five apps pages). Server backup: `.deploy-backups/20261108T163139Z.tar`.
- Pages: `/apps/` (overview), `/apps/datenschutz.html`, `/apps/nutzungsbedingungen.html`, `/apps/en/privacy.html`, `/apps/en/terms.html`. Footer link "Apps" (group "Unternehmen") on every page; not in the main navigation. Play listings will point to these URLs: never rename them.
- Tests: 46 (CSP and third-party requests, axe, metadata, sitemap, llms.txt, footer-only link, controller address, root-absolute links, no em dashes, English menu labels).
- `scripts/deploy.sh` now picks the newest cached Chromium (`chrome-linux*`). Chromium 141 (build 1194) fails to decode CSS-loaded web fonts in this environment and renders such text with zero width (also on the live site); Chromium 156 renders correctly. Whether real Chrome 141 users are affected is unverified.
- The pages were generated once from a scratch script (`.scratch/build_apps.py`, not tracked); edit the HTML directly from now on.

## Pending decisions (owner)
1. Impressum correction (Austrian ECG/MedienG instead of TMG/RStV, ODR link removal, app business purpose): pending Peter's separate approval. impressum.html and datenschutz.html content untouched (only the footer link was added).
2. Lawyer review of the app terms and privacy policy (clause list in the 2026-11-08 report to the coordinator): Google Commerce Limited as contracting party, update commitment, licence scope incl. teaching use, liability clause, choice of law.
3. Public contact for the trader status: pages use peter@code-alongsi.de; `apps@code-alongsi.de` was proposed but not approved.
4. Per-app feature list in section 9 of the privacy policy reflects the planned features; check it against each app before its release.
5. Earlier open item: UTF-8 charset for `text/plain` in Plesk.

## Next steps
- When an app ships with features or permissions that differ from the privacy policy, update both language versions, the "Stand" date and sitemap lastmod, then deploy.
- Renew security.txt before 2027-09-30.
