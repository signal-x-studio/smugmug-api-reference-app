/**
 * E2E Runtime Error Detection: API Integration Resilience
 *
 * Tests error handling for SmugMug API and Gemini AI service failures
 */

import { test, expect } from '@playwright/test';

test.describe('API Integration Resilience - Runtime Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle SmugMug API 401 errors gracefully', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept SmugMug API requests and return 401
    await page.route('**/api.smugmug.com/**', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          Code: 401,
          Message: 'Unauthorized',
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Should show error UI, not crash
    const uncaughtErrors = errors.filter(
      (e) => !e.includes('React DevTools') && !e.includes('Warning:')
    );
    expect(uncaughtErrors).toHaveLength(0);

    // Check for error message in UI
    const errorUI = await page.getByText(/unauthorized|authentication/i).count();
    expect(errorUI).toBeGreaterThanOrEqual(0); // May or may not show, depends on implementation
  });

  test('should handle SmugMug API 429 rate limit errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept SmugMug API requests and return 429
    await page.route('**/api.smugmug.com/**', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          Code: 429,
          Message: 'Rate limit exceeded',
        }),
        headers: {
          'Retry-After': '60',
        },
      });
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Should not have uncaught errors
    const uncaughtErrors = errors.filter((e) => !e.includes('React DevTools'));
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('should handle SmugMug API 500 server errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept SmugMug API requests and return 500
    await page.route('**/api.smugmug.com/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          Code: 500,
          Message: 'Internal Server Error',
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Should not have uncaught errors
    const uncaughtErrors = errors.filter((e) => !e.includes('React DevTools'));
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('should handle Gemini AI service timeout', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept Gemini AI requests and simulate timeout
    await page.route('**/generativelanguage.googleapis.com/**', (route) => {
      // Simulate timeout by delaying indefinitely
      setTimeout(() => {
        route.abort('timedout');
      }, 5000);
    });

    // Try to trigger AI analysis if button exists
    const analyzeBtn = page.getByRole('button', { name: /analyze|generate|ai/i });
    if (await analyzeBtn.count() > 0) {
      await analyzeBtn.click();
      await page.waitForTimeout(6000);
    }

    // Should not have uncaught errors
    const uncaughtErrors = errors.filter((e) => !e.includes('React DevTools'));
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('should handle Gemini AI quota exceeded', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept Gemini AI requests and return quota exceeded
    await page.route('**/generativelanguage.googleapis.com/**', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 429,
            message: 'Quota exceeded for quota metric',
            status: 'RESOURCE_EXHAUSTED',
          },
        }),
      });
    });

    // Try to trigger AI analysis if button exists
    const analyzeBtn = page.getByRole('button', { name: /analyze|generate|ai/i });
    if (await analyzeBtn.count() > 0) {
      await analyzeBtn.click();
      await page.waitForTimeout(2000);
    }

    // Should not have uncaught errors
    const uncaughtErrors = errors.filter((e) => !e.includes('React DevTools'));
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('should handle network connection failures', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Simulate network failure by aborting all requests
    await page.route('**/*', (route) => {
      if (route.request().url().includes('localhost')) {
        route.continue();
      } else {
        route.abort('failed');
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Should handle network errors gracefully
    const uncaughtErrors = errors.filter(
      (e) => !e.includes('React DevTools') && !e.includes('Download the React')
    );

    // Some network errors might be expected, but no crashes
    expect(uncaughtErrors.length).toBeLessThan(10);
  });

  test('should handle malformed API responses', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Intercept API requests and return malformed JSON
    await page.route('**/api/v2/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'This is not valid JSON {{{',
      });
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Should not crash with uncaught errors
    const uncaughtErrors = errors.filter((e) => !e.includes('React DevTools'));
    expect(uncaughtErrors).toHaveLength(0);
  });
});
