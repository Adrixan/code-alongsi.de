# Session Handoff

*Updated: 2026-11-09*

## Trajectory
2026-11-09: Impressum corrected to Austrian law (handed over by the lernspiele-android-kit coordinator under Peter's blanket go of 2026-11-09), merged and deployed. 2026-11-08: `/apps/` section with the legal pages of the seven Android apps. Earlier: US-2 (styleguide, bot/AI readiness, scripted deploy), live since 2026-10-20.

## State
- Live site == `main` at `ad18405` (deploy 2026-11-09 11:44 UTC, 3 files uploaded: impressum.html, llms.txt, sitemap.xml; all 27 checksums match; smoke test green). Server backup: `.deploy-backups/20261109T114413Z.tar`.
- Impressum now: § 5 ECG and § 25 MedienG (RIS NOR40025801, NOR40134353); Gewerbe "Dienstleistungen in der automatischen Datenverarbeitung und Informationstechnik", Gewerbebehörde Magistrat der Stadt Graz, WKO Steiermark Fachgruppe UBIT, GewO 1994 linked in RIS (Gesetzesnummer 10007517); UID without the German "§ 27 a UStG"; ODR link removed (Reg. (EU) 2024/3228 repealed Reg. 524/2013 from 2025-07-20); ADR wording per AStG; liability and copyright paragraphs without TMG or German law; Unternehmensgegenstand adds software development and sale of Android apps via Google Play. Source of the trade data: public WKO Firmen A-Z entry (GISA-Zahl 37227111, since 2024-06-04).
- `/apps/` pages unchanged: same name, address, phone and email as the Impressum.
- Tests: 47 (new: Impressum follows Austrian law, no TMG/RStV/ODR). Local runs need `PLAYWRIGHT_CHROMIUM_PATH` set to the newest cached Chromium (the deploy script does this itself).

## Pending decisions (owner)
1. Name: GISA/WKO list "Dipl.-Ing. Dipl.-Ing. Peter Wilhelm Aufner, BSc"; the site shows "Peter Aufner". Play trader name, D&B record and payments profile must match exactly: decide which form to use everywhere (changing it touches the Impressum, all /apps/ pages and the controller test).
2. GISA-Zahl 37227111 is not shown (not required by § 5 ECG); add it if wanted.
3. Whether selling own apps is fully covered by the IT Gewerbe or needs a trade (Handelsgewerbe) entry: not verified; ask WKO Steiermark if unsure.
4. AStG § 19 Abs. 3: when a consumer dispute about an app cannot be settled, the trader must name the competent AS-Stelle on a durable medium and say whether he takes part. The app terms (section 13) still say "Verbraucherschlichtungsstelle"; align on the next terms update (needs new "Stand" date).
5. Lawyer review of the app terms and privacy policy (clause list in the 2026-11-08 report to the coordinator).
6. Public contact for the trader status: pages use peter@code-alongsi.de; `apps@code-alongsi.de` was proposed but not approved.
7. Per-app feature list in section 9 of the privacy policy reflects the planned features; check it against each app before its release.
8. Earlier open item: UTF-8 charset for `text/plain` in Plesk.

## Next steps
- When an app ships with features or permissions that differ from the privacy policy, update both language versions, the "Stand" date and sitemap lastmod, then deploy.
- Renew security.txt before 2027-09-30.
