/**
 * JSON Reporter for Runtime Error Detection
 *
 * Generates machine-readable JSON reports for CI/CD integration,
 * historical analysis, and automated processing.
 */

import type { SmugMugErrorReport } from '../types';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

export class JSONReporter {
  name = 'json';

  /**
   * Generate JSON report
   */
  async generate(report: SmugMugErrorReport): Promise<string> {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Write JSON report to file
   */
  async write(content: string, outputPath: string): Promise<void> {
    // Ensure directory exists
    await mkdir(dirname(outputPath), { recursive: true });

    // Write JSON file
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * Generate compact JSON (no formatting)
   */
  generateCompact(report: SmugMugErrorReport): string {
    return JSON.stringify(report);
  }

  /**
   * Generate summary-only JSON (smaller file size)
   */
  generateSummary(report: SmugMugErrorReport): string {
    const summary = {
      timestamp: report.generatedAt,
      reportVersion: report.reportVersion,
      summary: report.summary,
      criticalErrorCount: report.criticalErrors.length,
      highPriorityErrorCount: report.highPriorityErrors.length,
      agentNativeIssues: {
        missingInterfaces: report.agentNativeIssues.missingInterfaces.length,
        missingActions: report.agentNativeIssues.missingActions.length,
        schemaValidationErrors: report.agentNativeIssues.schemaValidationErrors.length,
        dualInterfaceViolations: report.agentNativeIssues.dualInterfaceViolations.length,
      },
      apiIssues: {
        smugmugFailureCount: report.apiIssues.smugmugFailures.length,
        geminiFailureCount: report.apiIssues.geminiFailures.length,
        networkTimeoutCount: report.apiIssues.networkTimeouts.length,
      },
      testCoverage: report.testCoverage,
    };

    return JSON.stringify(summary, null, 2);
  }

  /**
   * Generate comparison report between two reports
   */
  generateComparison(
    previousReport: SmugMugErrorReport,
    currentReport: SmugMugErrorReport
  ): string {
    const comparison = {
      timeRange: {
        from: previousReport.generatedAt,
        to: currentReport.generatedAt,
      },
      changes: {
        totalErrors: {
          previous: previousReport.summary.totalErrors,
          current: currentReport.summary.totalErrors,
          delta: currentReport.summary.totalErrors - previousReport.summary.totalErrors,
        },
        criticalErrors: {
          previous: previousReport.summary.bySeverity.critical || 0,
          current: currentReport.summary.bySeverity.critical || 0,
          delta:
            (currentReport.summary.bySeverity.critical || 0) -
            (previousReport.summary.bySeverity.critical || 0),
        },
        newErrors: currentReport.summary.newErrors,
        resolvedErrors: currentReport.summary.resolvedErrors,
      },
      categoryChanges: this.compareCategoryCounts(
        previousReport.summary.byCategory,
        currentReport.summary.byCategory
      ),
    };

    return JSON.stringify(comparison, null, 2);
  }

  /**
   * Compare category counts between reports
   */
  private compareCategoryCounts(
    previous: Record<string, number>,
    current: Record<string, number>
  ): Record<string, { previous: number; current: number; delta: number }> {
    const allCategories = new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
    ]);

    const comparison: Record<string, { previous: number; current: number; delta: number }> = {};

    allCategories.forEach((category) => {
      const prevCount = previous[category] || 0;
      const currCount = current[category] || 0;

      comparison[category] = {
        previous: prevCount,
        current: currCount,
        delta: currCount - prevCount,
      };
    });

    return comparison;
  }
}

export const jsonReporter = new JSONReporter();
