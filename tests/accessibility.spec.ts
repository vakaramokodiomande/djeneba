import { test, expect } from '@playwright/test';

const pages = ['/', '/catalogue', '/connexion', '/inscription'];

for (const path of pages) {
  test(`Accessibility check for ${path}`, async ({ page }) => {
    await page.goto(`http://localhost:3000${path}`);

    // Inject axe-core from CDN
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.3/axe.min.js' });

    const result = await page.evaluate(async () => {
      // @ts-ignore
      return await (window as any).axe.run();
    });

    if (result.violations && result.violations.length > 0) {
      console.log(`Found ${result.violations.length} accessibility violations on ${path}:`);
      for (const v of result.violations) {
        console.log(`${v.id} - ${v.help}: ${v.helpUrl}`);
        for (const node of v.nodes) {
          console.log(`  Target: ${node.target.join(', ')}`);
        }
      }
    }

    expect(result.violations.length, `Accessibility violations on ${path}`).toBe(0);
  });
}
