# Session Handoff

*Updated: 2026-11-13*

## Trajectory
2026-11-13: this role handled a non-website task from the Greeter and Peter: Nextcloud playground (playground.code-alongsi.de) updated to 35.0.3 with all apps; read-only calendar subscription `julia` (1 h refresh); schema drift aligned; temp dir, phone region, server ID, log level, AppAPI off; HSTS via the new `HTACCESS_EXTRA` setting of `~/code/update-nextcloud.sh`; 50 leftover tables of removed apps dropped (dumps in `/nextcloud-releases/manual-*`). Memory limit, OPcache, APCu and 2FA enforcement are closed as not fixable (Peter). Full state: `~/code/.agents/session-handoff.md` and the knowledge-map details (Machines). Mistake: a cleanup deleted this project's whole `.scratch/` (gitignored temp files from the 2026-11-08/09 deploys: screenshots, logs, helper scripts); not recoverable, nothing tracked was lost. The website itself was not touched.
2026-11-09 (afternoon): app terms and privacy policy aligned with the launch consumer-law research, five-year support period, CRA security contact (handed over by the lernspiele-android-kit coordinator under Peter's go of about 15:45; wording from `~/Obsidian/Adrixan/Research/Reports/2026-11-05-android-apps-from-the-lernspiel/notes/launch-consumer-law.md`). 2026-11-09 (morning): Impressum corrected to Austrian law. 2026-11-08: `/apps/` section with the legal pages of the seven Android apps. Earlier: US-2 (styleguide, bot/AI readiness, scripted deploy), live since 2026-10-20.

## State
- Live site == `main` at `2d9054a` (deploy 2026-11-09 16:11 UTC, 8 files uploaded: the five `/apps/` pages, llms.txt, sitemap.xml, `.well-known/security.txt`; all 27 checksums match; smoke test green). Server backup: `.deploy-backups/20261109T161112Z.tar`. Later commits on `main` touch only `.agents/`.
- Terms DE/EN ("Stand" 2026-11-09):
  - § 7: updates (and support answers) for the reasonably expected period, at least five years from the release of each app on Google Play; the VGG two-year warranty sentence is unchanged.
  - § 8: security reports to peter@code-alongsi.de, acknowledgement within five working days.
  - § 9: liability with a definition of "wesentliche Vertragspflichten" and the product-liability carve-out including data loss; the lost-saves exclusion is gone.
  - § 13: Internet Ombudsstelle and Schlichtung für Verbrauchergeschäfte named (both URLs checked live with a desktop UA, HTTP 200), participation decided case by case, answer within three working days.
  - The English terms carry an unnumbered section "Reporting security vulnerabilities" (`#security`) after § 13, because there is no English overview page.
- Privacy DE/EN ("Stand" 2026-11-09): § 8 and § 9 name LinguaFusion's install-time permissions (RECEIVE_BOOT_COMPLETED, WAKE_LOCK); § 10 order data on Art. 6(1)(c) and (f), Google named as source, independent controllers, and a neutral security line (only the developer has access; Art. 32 measures). The drafted netcup sentence ("EU servers, no non-EEA transfer, stored encrypted") was NOT published: its preconditions are unconfirmed (see decision 1).
- `/apps/` overview: new section "Sicherheitslücken melden" (`#sicherheit`): email, five working days, fix via Google Play update, coordinated-disclosure request, five-year security updates, link to security.txt, English pointer to the terms section.
- security.txt: added `Policy: https://code-alongsi.de/apps/#sicherheit`; Expires 2027-09-30 unchanged (no renewal needed yet).
- Tests: 50 (new: terms wording DE/EN, privacy wording DE/EN, security contact; the link test now checks anchors into other pages).
- Kit in-app privacy text (`lernspiele-android-kit/src/ui/privacy.ts`, 0.6.0): still accurate; one narrower purpose phrase ("Bestelldaten, die für Abrechnung und Steuer nötig sind") reported to the kit session.

## Pending decisions (owner)
1. Privacy § 11 netcup sentence: publish "E-Mails speichert netcup GmbH (Deutschland) als Auftragsverarbeiter auf Servern in der EU; keine Übermittlung außerhalb des EWR; Bestell- und Support-Daten verschlüsselt gespeichert" only after Peter confirms (a) netcup data centre in the EU and the processing agreement concluded in the CCP, (b) no forwarding of the mailbox to a non-EEA provider, (c) order exports kept out of the OneDrive mirror or stored encrypted.
2. Switzerland: the launch report says Google is not the merchant of record in CH (and the US, now dropped). Terms § 2 and privacy § 10 still say "Verkäufer ist Google" without exception; with CH and LI in the country list this may be wrong for Swiss buyers. Needs Peter or a lawyer before the first CH sale.
3. Other drafted but not approved changes from the note: terms §§ 2, 3, 6 (contracting party neutral, teachers' licence, withdrawal attribution) and privacy § 3 (§ 165 Abs. 3 TKG sentence). Not applied, since the go covered only the four changes.
4. Name form (GISA "Dipl.-Ing. Dipl.-Ing. Peter Wilhelm Aufner, BSc" vs "Peter Aufner") everywhere; GISA-Zahl display; Handelsgewerbe question (the launch report says the IT Gewerbe covers it); lawyer review (narrowed to the 2027 marketplace model and the liability/update clauses); public contact address (`apps@` not approved); per-app feature list in privacy § 9 against each release; UTF-8 charset for `text/plain` in Plesk.

## Next steps
- When an app ships with features or permissions that differ from the privacy policy, update both language versions, the "Stand" date and sitemap lastmod, then deploy.
- February 2027: after Google's amended DDA and Play Terms (marketplace model from 2027-03-01) revisit terms §§ 2, 6, 7, 13.
- Renew security.txt before 2027-09-30.
