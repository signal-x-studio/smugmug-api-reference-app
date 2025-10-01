/**
 * E2E Runtime Error Detection: Photo Discovery Flow
 *
 * Tests error detection during photo search, filtering, and discovery workflows
 */

import { test, expect, Page } from '@playwright/test';

interface CapturedError {
  message: string;
  stack?: string;
  type: 'error' | 'uncaught' | 'unhandledrejection';
  timestamp: number;
}

/**
 * Helper function to capture all errors on a page
 */
async function captureErrors(page: Page, action: () => Promise<void>): Promise<CapturedError[]> {
  const errors: CapturedError[] = [];

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        message: msg.text(),
        type: 'error',
        timestamp: Date.now(),
      });
    }
  });

  // Capture uncaught exceptions
  page.on('pageerror', (error) => {
    errors.push({
      message: error.message,
      stack: error.stack,
      type: 'uncaught',
      timestamp: Date.now(),
    });
  });

  // Capture unhandled promise rejections
  await page.exposeFunction('captureRejection', (message: string) => {
    errors.push({
      message,
      type: 'unhandledrejection',
      timestamp: Date.now(),
    });
  });

  await page.evaluate(() => {
    window.addEventListener('unhandledrejection', (event) => {
      (window as any).captureRejection(event.reason?.message || String(event.reason));
    });
  });

  // Execute the action
  await action();

  return errors;
}

test.describe('Photo Discovery Flow - Runtime Errors', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize error capture before each test
    await page.goto('/');
  });

  test('should not have errors during initial page load', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      await page.waitForLoadState('networkidle');
    });

    expect(errors).toHaveLength(0);
  });

  test('should not have errors during photo search', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      // Wait for search interface to be available
      const searchInput = page.getByTestId('search-input').or(page.getByPlaceholder(/search/i));
      if (await searchInput.count() > 0) {
        await searchInput.fill('sunset photos');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    });

    // Filter out expected development warnings
    const criticalErrors = errors.filter(
      (e) => !e.message.includes('React DevTools') && !e.message.includes('Download the React')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should not have errors during filter operations', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      // Check if filter panel exists
      const addFilterBtn = page.getByTestId('add-filter').or(page.getByRole('button', { name: /add filter/i }));

      if (await addFilterBtn.count() > 0) {
        await addFilterBtn.click();

        // Select filter field if dropdown exists
        const filterField = page.getByTestId('filter-field');
        if (await filterField.count() > 0) {
          await filterField.selectOption('location');

          // Fill filter value
          const filterValue = page.getByTestId('filter-value');
          if (await filterValue.count() > 0) {
            await filterValue.fill('Paris');
          }

          // Apply filter
          const applyBtn = page.getByTestId('apply-filter').or(page.getByRole('button', { name: /apply/i }));
          if (await applyBtn.count() > 0) {
            await applyBtn.click();
          }
        }
      }

      await page.waitForTimeout(1000);
    });

    const criticalErrors = errors.filter(
      (e) => !e.message.includes('React DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle missing photo data gracefully', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      // Inject test scenario: empty photo grid
      await page.evaluate(() => {
        // Mock empty photo response
        const mockPhotos: any[] = [];
        window.localStorage.setItem('test-photos', JSON.stringify(mockPhotos));
      });

      await page.reload();
      await page.waitForTimeout(1000);
    });

    // Should show error UI, not crash with uncaught errors
    const uncaughtErrors = errors.filter((e) => e.type === 'uncaught');
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('should handle API failures without crashing', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      // Intercept API requests and simulate failure
      await page.route('**/api/v2/**', (route) => {
        route.abort('failed');
      });

      await page.reload();
      await page.waitForTimeout(3000);
    });

    // Should show error message, not have uncaught errors
    const uncaughtErrors = errors.filter((e) => e.type === 'uncaught');
    expect(uncaughtErrors).toHaveLength(0);

    // Check for error UI
    const errorMessage = await page.getByTestId('error-message').or(page.getByText(/unable to load/i)).count();
    expect(errorMessage).toBeGreaterThan(0);
  });
});
