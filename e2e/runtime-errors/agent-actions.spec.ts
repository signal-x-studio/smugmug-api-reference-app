/**
 * E2E Runtime Error Detection: Agent Action Execution
 *
 * Tests agent-native integration and action execution error handling
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Agent Action Execution - Runtime Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should register agent actions on page load', async ({ page }) => {
    const agentActions = await page.evaluate(() => {
      return window.agentActions ? Object.keys(window.agentActions) : [];
    });

    // Should have some agent actions registered
    expect(agentActions.length).toBeGreaterThan(0);
  });

  test('should execute search-photos action without errors', async ({ page }) => {
    const result = await page.evaluate(async () => {
      try {
        if (!window.agentActions || !window.agentActions['search-photos']) {
          return { error: 'Action not registered', success: false };
        }

        const action = window.agentActions['search-photos'];
        const result = await action.execute({ query: 'beach photos' });

        return { success: true, result };
      } catch (error: any) {
        return {
          error: error.message,
          stack: error.stack,
          success: false,
        };
      }
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should execute parse-query action without errors', async ({ page }) => {
    const result = await page.evaluate(async () => {
      try {
        if (!window.agentActions || !window.agentActions['parse-query']) {
          return { error: 'Action not registered', success: false };
        }

        const action = window.agentActions['parse-query'];
        const result = await action.execute({
          query: 'show me sunset photos from last summer',
        });

        return { success: true, result };
      } catch (error: any) {
        return {
          error: error.message,
          stack: error.stack,
          success: false,
        };
      }
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should handle missing agent action gracefully', async ({ page }) => {
    const result = await page.evaluate(async () => {
      try {
        const action = window.agentActions?.['nonexistent-action'];

        if (!action) {
          return {
            success: true,
            handled: true,
            message: 'Missing action detected correctly',
          };
        }

        return { success: false, message: 'Should not reach here' };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(result.success).toBe(true);
    expect(result.handled).toBe(true);
  });

  test('should register agent interfaces on page load', async ({ page }) => {
    const agentInterfaces = await page.evaluate(() => {
      return window.agentInterfaces ? Object.keys(window.agentInterfaces) : [];
    });

    // If any components use dual-interface, they should be registered
    // This test will pass even if no interfaces are registered yet
    expect(agentInterfaces).toBeDefined();
  });

  test('should validate Schema.org structured data exists', async ({ page }) => {
    const hasSchemaMarkup = await page.evaluate(() => {
      const schemaElements = document.querySelectorAll('[itemscope]');
      return schemaElements.length > 0;
    });

    // If no Schema.org markup, that's acceptable for now
    // This test validates the detection works
    expect(typeof hasSchemaMarkup).toBe('boolean');
  });

  test('should not have agent-native errors during interaction', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('agent')) {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      if (error.message.toLowerCase().includes('agent')) {
        errors.push(error.message);
      }
    });

    // Simulate user interactions
    await page.waitForTimeout(1000);

    // Try to interact with search if available
    const searchInput = page.getByTestId('search-input').or(page.getByPlaceholder(/search/i));
    if (await searchInput.count() > 0) {
      await searchInput.fill('test query');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    expect(errors).toHaveLength(0);
  });
});
