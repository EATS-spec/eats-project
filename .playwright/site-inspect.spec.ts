import { test } from '@playwright/test';

test('capture homepage snapshot', async ({ page }) => {
  await page.goto('https://eats-frontend.vercel.app', { waitUntil: 'networkidle' });
  const navTexts = await page.$$eval('header nav a', els => els.map(el => el.textContent?.trim()).filter(Boolean));
  const heroHeading = await page.$eval('main h1', el => el.textContent?.trim()).catch(() => null);
  const heroCopy = await page.$eval('main h1 + p', el => el.textContent?.trim()).catch(() => null);
  const featuredTitles = await page.$$eval('[data-testid="featured-recipes"] article h3', els => els.slice(0, 6).map(el => el.textContent?.trim()).filter(Boolean));
  const latestTitles = await page.$$eval('[data-testid="latest-recipes"] article h3', els => els.slice(0, 6).map(el => el.textContent?.trim()).filter(Boolean));
  const sections = await page.$$eval('main section', sections => sections.map(section => {
    const heading = section.querySelector('h2, h3, h4');
    return heading ? heading.textContent?.trim() : null;
  }).filter(Boolean));

  console.log(JSON.stringify({ navTexts, heroHeading, heroCopy, featuredTitles, latestTitles, sections }, null, 2));
});
