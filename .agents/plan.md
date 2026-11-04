# Product Backlog & Plan

## User Stories

### US-1: Neue Dienstleistung "Sichere KI-Integration" (Secure AI Integration)
**Format:** As a business owner, I want to see an offering for integrating AI securely and in compliance with DSGVO/AI Act, so that I can safely adopt AI without regulatory or security issues.
- **Priority:** Must
- **Estimate:** 2 points
- **Status:** Done
- **Acceptance Criteria:**
  1. Draft comprehensive German copy for the new offering covering security, compliance, architecture, and workshops. (Delivered)
  2. The text fits Peter Aufner's brand strategy ("Sustainable Sovereignty", professional, minimalist). (Delivered)
  3. Integrate the new service card into `index.html` under the "Leistungen" (Services) section. (Delivered)
  4. Ensure the layout remains responsive, aligned, and visually premium (consistent with the other service cards). (Delivered, responsive grid updated)
  5. The card includes a proper SVG icon fitting the secure AI/compliance theme. (Delivered, shield + key/brain combination)
  6. Accessibility: Keyboard navigable, semantic HTML, WCAG 2.1 AA compliant. (Delivered, pre-existing footer headings fixed)
  7. Security: Strictly follow the Content Security Policy (CSP) set in the headers. (Delivered, CSP verified)

### US-2: Styleguide-Konformität, Bot-/KI-Freundlichkeit, Deployment
**Format:** As the site owner, I want the site to follow the Bioluminescent Night styleguide, be easy for crawlers and AI agents to consume, and be deployed to https://code-alongsi.de by a repeatable script as the last step of every update.
- **Priority:** Must
- **Estimate:** 5 points
- **Status:** Done (deploy executed, see project-state.md session log)
- **Acceptance Criteria:**
  1. Palette, typefaces and dark mode verified by tests. (Delivered)
  2. No third-party requests, strict CSP, fonts self-hosted. (Delivered)
  3. Legal pages consistent with index (nav, footer, heading order, dead anchors). (Delivered)
  4. robots.txt, sitemap.xml, llms.txt, security.txt, JSON-LD, Open Graph. (Delivered)
  5. `scripts/deploy.sh` with dry run, backup, checksum verification, smoke test. (Delivered)
  6. Deploy as final step of every update recorded in CLAUDE.md. (Delivered)
