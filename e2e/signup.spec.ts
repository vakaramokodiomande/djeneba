import { test, expect } from '@playwright/test';

function uniqueEmail(prefix = 'test') {
  return `${prefix}.${Date.now()}@example.com`;
}

test.describe('Signup flow', () => {
  test('transporteur signup and redirect to connexion', async ({ page, baseURL }) => {
    await page.goto('/inscription?type=transporteur');

    await page.fill('input[name="name"]', 'E2E Transporteur');
    await page.fill('input[name="email"]', uniqueEmail('transporteur'));
    await page.fill('input[name="password"]', 'Secret123!');
    await page.fill('input[name="confirmPassword"]', 'Secret123!');

    // Transporteur specific
    await page.fill('input[name="companyName"]', 'E2E TransCo');
    await page.selectOption('select[name="vehicleType"]', 'camion_moyen');
    await page.fill('input[name="vehicleCapacity"]', '5');
    await page.fill('input[name="vehiclePlate"]', 'E2E-1234');
    await page.fill('input[name="coverageZones"]', 'Bamako, Sikasso');

    await page.click('button[type="submit"]');

    // Expect a redirect to connexion with success
    await expect(page).toHaveURL(/\/connexion\?success=inscription/);
  });

  test('producteur signup', async ({ page }) => {
    await page.goto('/inscription?type=producteur');
    await page.fill('input[name="name"]', 'E2E Producteur');
    await page.fill('input[name="email"]', uniqueEmail('producteur'));
    await page.fill('input[name="password"]', 'Secret123!');
    await page.fill('input[name="confirmPassword"]', 'Secret123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/connexion\?success=inscription/);
  });
});