import { test, expect } from '@playwright/test';

test('unauthenticated user redirected to login', async ({ page }) => {
  // Try to access protected route
  await page.goto('/app/calls');
  
  // Should be redirected to login page
  await expect(page).toHaveURL('/login');
});

test('home page loads', async ({ page }) => {
  await page.goto('/');
  
  // Should load without redirect
  await expect(page).toHaveURL('/');
});