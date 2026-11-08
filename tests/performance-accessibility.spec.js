const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

const APP_PAGES = [
  '/apps/',
  '/apps/datenschutz.html',
  '/apps/nutzungsbedingungen.html',
  '/apps/en/privacy.html',
  '/apps/en/terms.html',
];
const PAGES = ['/', '/impressum.html', '/datenschutz.html', ...APP_PAGES];
const pageLang = (path) => (path.startsWith('/apps/en/') ? 'en' : 'de');
const ORIGIN = 'https://code-alongsi.de';

test.describe('Content and behaviour', () => {

  test('hero badge and headline are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero__badge')).toHaveText('K.I. & IT-Sicherheit? Aber sicher. Mit Code-Alongside');
    await expect(page.locator('h1')).toHaveText('Cybersicherheit & KI für den heimischen Mittelstand');
  });

  test('six service cards with four bullets each, secure AI first', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.service-card');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('#service-1-title')).toHaveText('Sichere KI-Integration ohne Sorgen');
    for (let i = 0; i < 6; i++) {
      await expect(cards.nth(i).locator('.service-card__list li')).toHaveCount(4);
    }
  });

  test('mobile menu opens, closes and toggles inert', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuToggle = page.locator('.header__menu-toggle');
    const mainNav = page.locator('.header__nav');

    await expect(menuToggle).toBeVisible();
    await expect(mainNav).toHaveAttribute('inert', '');

    await menuToggle.click();
    await expect(mainNav).not.toHaveAttribute('inert');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    await menuToggle.click();
    await expect(mainNav).toHaveAttribute('inert', '');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('all internal links and anchors resolve', async ({ page, request }) => {
    await page.goto('/');
    const indexIds = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));

    for (const path of PAGES) {
      await page.goto(path);
      const pageIds = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
      for (const href of hrefs) {
        if (/^(mailto:|tel:|https?:)/.test(href)) continue;
        // Relative links would resolve differently below /apps/; the site uses root-absolute paths only.
        expect(href.startsWith('/') || href.startsWith('#'), `${path} -> ${href} must be root-absolute`).toBe(true);
        const [file, hash] = href.split('#');
        if (file && file !== '/') {
          const res = await request.get(file);
          expect(res.status(), `${path} -> ${href}`).toBe(200);
        }
        if (hash) {
          // '#x' points into the current page, '/#x' into the home page.
          const ids = file === '' ? pageIds : (file === '/' ? indexIds : null);
          if (ids) expect(ids, `${path} -> ${href}`).toContain(hash);
        }
      }
    }
  });

});

test.describe('Styleguide "Bioluminescent Night"', () => {

  test('design tokens match the brand palette', async ({ page }) => {
    await page.goto('/');
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      const get = (n) => s.getPropertyValue(n).trim().toUpperCase();
      return {
        void: get('--color-void'), slate: get('--color-slate'), starlight: get('--color-starlight'),
        fern: get('--color-fern'), mint: get('--color-mint'), amber: get('--color-amber'),
      };
    });
    expect(tokens).toEqual({
      void: '#121212', slate: '#1E1E1E', starlight: '#E0E0E0',
      fern: '#4ADE80', mint: '#A7F3D0', amber: '#F59E0B',
    });
  });

  test('dark background, starlight text, brand typefaces', async ({ page }) => {
    await page.goto('/');
    const body = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return { bg: s.backgroundColor, color: s.color, family: s.fontFamily };
    });
    expect(body.bg).toBe('rgb(18, 18, 18)');
    expect(body.color).toBe('rgb(224, 224, 224)');
    expect(body.family).toMatch(/^"?Inter"?/);

    const h1 = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
    expect(h1).toMatch(/^"?Space Grotesk"?/);
  });

  test('brand fonts are self-hosted and actually load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    expect(loaded).toContain('Inter');
    expect(loaded).toContain('Space Grotesk');
  });

});

test.describe('Security and privacy', () => {

  for (const path of PAGES) {
    test(`CSP is strict and ${path} makes no third-party requests`, async ({ page, baseURL }) => {
      const external = [];
      page.on('request', (req) => {
        const url = new URL(req.url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname) && url.protocol.startsWith('http')) {
          external.push(req.url());
        }
      });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).not.toMatch(/https?:\/\//);
      expect(csp).not.toContain('unsafe-inline');
      expect(external).toEqual([]);
    });
  }

});

test.describe('Accessibility (WCAG 2.1 AA)', () => {

  for (const path of PAGES) {
    test(`axe audit ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await injectAxe(page);
      await checkA11y(page, null, {
        axeOptions: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } },
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  }

});

test.describe('Bot and AI readiness', () => {

  test('robots.txt allows crawlers, names AI agents and points to the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-agent: \*\s+Allow: \//);
    for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
      expect(body).toContain(`User-agent: ${agent}`);
    }
    expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(body).not.toMatch(/^Disallow:\s*\//m);
  });

  test('sitemap.xml lists every page with canonical absolute URLs', async ({ request, page }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(PAGES.map((p) => `${ORIGIN}${p}`));
    expect([...body.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)]).toHaveLength(PAGES.length);

    for (const path of PAGES) {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(locs).toContain(canonical);
    }
  });

  test('llms.txt follows the llmstxt.org structure and its site links exist', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    const lines = body.split('\n');
    expect(lines[0]).toBe('# Code-Alongside');
    expect(body).toMatch(/^> .+/m);
    expect(body).toMatch(/^## Seiten$/m);
    expect(body).toMatch(/^## Leistungen$/m);
    expect(body).toMatch(/^## Kontakt$/m);
    expect(body).toMatch(/^## Apps$/m);

    const siteLinks = [...body.matchAll(/\]\((https:\/\/code-alongsi\.de[^)#]*)/g)].map((m) => m[1]);
    expect(siteLinks.length).toBeGreaterThan(0);
    for (const url of new Set(siteLinks)) {
      const local = url.replace(ORIGIN, '') || '/';
      const r = await request.get(local);
      expect(r.status(), url).toBe(200);
    }
  });

  test('security.txt has a contact and a future expiry date', async ({ request }) => {
    const res = await request.get('/.well-known/security.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/^Contact: mailto:peter@code-alongsi\.de$/m);
    const expires = body.match(/^Expires: (.+)$/m)[1];
    expect(new Date(expires).getTime()).toBeGreaterThan(Date.now());
  });

  test('home page exposes valid JSON-LD for the organisation and its services', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw);
    const graph = data['@graph'];
    const org = graph.find((n) => n['@type'] === 'ProfessionalService');
    expect(org.name).toBe('Code-Alongside');
    expect(org.address.addressLocality).toBe('Graz');
    expect(org.hasOfferCatalog.itemListElement).toHaveLength(6);
    expect(graph.find((n) => n['@type'] === 'WebSite').url).toBe(`${ORIGIN}/`);
  });

  for (const path of PAGES) {
    test(`${path} has the metadata crawlers and link previews need`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', pageLang(path));
      await expect(page.locator('title')).not.toBeEmpty();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/code-alongsi\.de\//);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('llms.txt lists every page of the site', async ({ request }) => {
    const body = await (await request.get('/llms.txt')).text();
    for (const path of PAGES) {
      expect(body, path).toContain(`](${ORIGIN}${path})`);
    }
  });

  test('content is fully present in the static HTML without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8080/');
    await expect(page.locator('.service-card')).toHaveCount(6);
    await expect(page.locator('a[href^="mailto:peter@code-alongsi.de"]')).toBeVisible();
    await context.close();
  });

});

test.describe('Apps section (/apps/)', () => {

  const APPS = ['Sudoku Grove', 'Lernspiele Kids', 'Lernspiele Teens', 'Venomous Snake',
    'In Memoriam Pascal', 'LinguaFusion', 'The Knots of Alderwick'];

  test('every page links to /apps/ in the footer, never in the main navigation', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator('.footer a[href="/apps/"]'), path).toHaveCount(1);
      await expect(page.locator('#main-nav a[href^="/apps"]'), path).toHaveCount(0);
    }
  });

  test('overview lists the seven apps, support contact and all legal pages', async ({ page }) => {
    await page.goto('/apps/');
    await expect(page.locator('h1')).toHaveText('Apps von Prof. Aufner');
    await expect(page.locator('.app-list__name')).toHaveText(APPS);
    await expect(page.locator('main a[href="mailto:peter@code-alongsi.de"]').first()).toBeVisible();
    for (const href of ['/apps/datenschutz.html', '/apps/nutzungsbedingungen.html', '/apps/en/privacy.html', '/apps/en/terms.html']) {
      await expect(page.locator(`main a[href="${href}"]`).first(), href).toBeVisible();
    }
    // Apps are not published yet: no store links and no prices.
    await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(/EUR|€/);
  });

  for (const path of APP_PAGES.slice(1)) {
    test(`${path} names the controller exactly as the Impressum, the date and the language alternate`, async ({ page }) => {
      await page.goto(path);
      const address = page.locator('main address');
      for (const line of ['Code-Alongside', 'Peter Aufner', 'Sandgasse 25/8', '8010 Graz', '+43 676 3838915', 'peter@code-alongsi.de']) {
        await expect(address, line).toContainText(line);
      }
      await expect(page.locator('.legal-section__updated')).toContainText(/8\. November 2026|8 November 2026/);
      await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      for (const app of APPS) await expect(page.locator('main'), app).toContainText(app);
    });
  }

  test('no page of the site contains an em dash', async ({ request }) => {
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      expect(html.includes('\u2014'), path).toBe(false);
    }
  });

  test('English pages label the menu button in English', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/apps/en/privacy.html');
    const toggle = page.locator('.header__menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Close menu');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Open menu');
  });

});
