/**
 * Report Generator
 *
 * Orchestrates generation of runtime error detection reports
 * in multiple formats (HTML, JSON, Markdown).
 */

import type { SmugMugErrorReport, ErrorReporter } from '../types';
import { errorCaptureManager } from '../ErrorCaptureManager';
import { ErrorClassifier } from '../ErrorClassifier';
import { htmlReporter } from './HTMLReporter';
import { jsonReporter } from './JSONReporter';
import { markdownReporter } from './MarkdownReporter';

export interface ReportGeneratorOptions {
  outputDir?: string;
  reporters?: ('html' | 'json' | 'markdown')[];
  includeStackTraces?: boolean;
  maxErrorsPerCategory?: number;
}

export class ReportGenerator {
  private options: Required<ReportGeneratorOptions>;

  constructor(options: ReportGeneratorOptions = {}) {
    this.options = {
      outputDir: options.outputDir || 'test-results/runtime-errors',
      reporters: options.reporters || ['html', 'json', 'markdown'],
      includeStackTraces: options.includeStackTraces !== false,
      maxErrorsPerCategory: options.maxErrorsPerCategory || 100,
    };
  }

  /**
   * Generate comprehensive error report
   */
  async generateReport(): Promise<SmugMugErrorReport> {
    const allErrors = errorCaptureManager.getAllErrors();
    const stats = errorCaptureManager.getStats();
    const errorsByCategory = errorCaptureManager.getErrorsByCategory();

    // Get critical and high priority errors
    const criticalErrors = errorCaptureManager.getCriticalErrors();
    const highPriorityErrors = errorCaptureManager.getHighPriorityErrors();

    // Generate fix suggestions for errors
    const fixSuggestions = criticalErrors
      .concat(highPriorityErrors.slice(0, 10))
      .flatMap((error) => ErrorClassifier.generateFixSuggestions(error));

    // Build report
    const report: SmugMugErrorReport = {
      summary: {
        totalErrors: allErrors.length,
        byCategory: stats.byCategory as Record<string, number>,
        bySeverity: stats.bySeverity as Record<string, number>,
        passRate: this.calculatePassRate(allErrors.length),
        newErrors: 0, // Would need historical comparison
        resolvedErrors: 0, // Would need historical comparison
      },

      criticalErrors: criticalErrors.slice(0, this.options.maxErrorsPerCategory),
      highPriorityErrors: highPriorityErrors.slice(0, this.options.maxErrorsPerCategory),

      agentNativeIssues: {
        missingInterfaces: this.extractMissingInterfaces(errorsByCategory['agent-native']),
        missingActions: this.extractMissingActions(errorsByCategory['agent-native']),
        schemaValidationErrors: [],
        dualInterfaceViolations: [],
      },

      apiIssues: {
        smugmugFailures: [],
        geminiFailures: [],
        networkTimeouts: errorsByCategory['network-error']?.slice(0, 10) || [],
      },

      componentIssues: {
        byComponent: this.groupByComponent(errorsByCategory['component-error'] || []),
        nullSafetyViolations: errorsByCategory['data-error'] || [],
        hookDependencyIssues: errorsByCategory['hook-error'] || [],
        cleanupMissing: [],
      },

      fixSuggestions,

      testCoverage: {
        criticalFlowsCovered: 0, // Would be populated by test runner
        criticalFlowsTotal: 0,
        agentActionsCovered: 0,
        agentActionsTotal: 0,
        componentsCovered: 0,
        componentsTotal: 0,
        apiEndpointsCovered: 0,
        apiEndpointsTotal: 0,
      },

      generatedAt: Date.now(),
      reportVersion: '1.0.0',
    };

    return report;
  }

  /**
   * Generate and write all reports
   */
  async generateAndWriteAll(report?: SmugMugErrorReport): Promise<string[]> {
    const generatedReport = report || (await this.generateReport());
    const outputPaths: string[] = [];

    for (const reporterType of this.options.reporters) {
      let content: string;
      let filename: string;

      switch (reporterType) {
        case 'html':
          content = await htmlReporter.generate(generatedReport);
          filename = `${this.options.outputDir}/report.html`;
          await htmlReporter.write(content, filename);
          break;

        case 'json':
          content = await jsonReporter.generate(generatedReport);
          filename = `${this.options.outputDir}/report.json`;
          await jsonReporter.write(content, filename);
          break;

        case 'markdown':
          content = await markdownReporter.generate(generatedReport);
          filename = `${this.options.outputDir}/report.md`;
          await markdownReporter.write(content, filename);
          break;
      }

      outputPaths.push(filename);
    }

    return outputPaths;
  }

  /**
   * Calculate pass rate based on error count
   */
  private calculatePassRate(totalErrors: number): number {
    // Simple heuristic: fewer errors = higher pass rate
    if (totalErrors === 0) return 100;
    if (totalErrors <= 5) return 95;
    if (totalErrors <= 10) return 85;
    if (totalErrors <= 20) return 70;
    if (totalErrors <= 50) return 50;
    return 30;
  }

  /**
   * Extract missing interfaces from agent-native errors
   */
  private extractMissingInterfaces(errors: any[] = []): string[] {
    return errors
      .filter((e) => e.message.toLowerCase().includes('interface'))
      .map((e) => e.componentName || 'unknown')
      .filter((name, index, self) => self.indexOf(name) === index);
  }

  /**
   * Extract missing actions from agent-native errors
   */
  private extractMissingActions(errors: any[] = []): string[] {
    return errors
      .filter((e) => e.message.toLowerCase().includes('action'))
      .map((e) => {
        const match = e.message.match(/action\s+'([^']+)'/i);
        return match ? match[1] : 'unknown';
      })
      .filter((name, index, self) => self.indexOf(name) === index);
  }

  /**
   * Group errors by component
   */
  private groupByComponent(errors: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};

    errors.forEach((error) => {
      const component = error.componentName || 'Unknown';

      if (!grouped[component]) {
        grouped[component] = {
          componentName: component,
          errorCount: 0,
          nullSafetyViolations: 0,
          hookIssues: 0,
          renderErrors: 0,
        };
      }

      grouped[component].errorCount++;

      if (error.message.toLowerCase().includes('null') || error.message.toLowerCase().includes('undefined')) {
        grouped[component].nullSafetyViolations++;
      }

      if (error.message.toLowerCase().includes('hook')) {
        grouped[component].hookIssues++;
      }

      if (error.message.toLowerCase().includes('render')) {
        grouped[component].renderErrors++;
      }
    });

    return grouped;
  }
}

export const reportGenerator = new ReportGenerator();
