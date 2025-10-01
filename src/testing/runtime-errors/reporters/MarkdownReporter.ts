/**
 * Markdown Reporter for Runtime Error Detection
 *
 * Generates GitHub-friendly Markdown reports with formatted tables,
 * code blocks, and links for easy PR integration.
 */

import type { SmugMugErrorReport, SmugMugAppError, FixSuggestion } from '../types';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export class MarkdownReporter {
  name = 'markdown';

  /**
   * Generate full Markdown report
   */
  async generate(report: SmugMugErrorReport): Promise<string> {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader(report));

    // Summary
    sections.push(this.generateSummary(report));

    // Critical Errors
    if (report.criticalErrors.length > 0) {
      sections.push(this.generateCriticalErrors(report.criticalErrors));
    }

    // Agent-Native Issues
    if (this.hasAgentNativeIssues(report)) {
      sections.push(this.generateAgentNativeIssues(report));
    }

    // API Issues
    if (this.hasAPIIssues(report)) {
      sections.push(this.generateAPIIssues(report));
    }

    // Component Issues
    if (this.hasComponentIssues(report)) {
      sections.push(this.generateComponentIssues(report));
    }

    // Fix Suggestions
    if (report.fixSuggestions.length > 0) {
      sections.push(this.generateFixSuggestions(report.fixSuggestions));
    }

    // Test Coverage
    sections.push(this.generateTestCoverage(report));

    return sections.join('\n\n---\n\n');
  }

  /**
   * Write report to file
   */
  async write(content: string, outputPath: string): Promise<void> {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * Generate header section
   */
  private generateHeader(report: SmugMugErrorReport): string {
    const date = new Date(report.generatedAt).toLocaleString();

    return `# Runtime Error Detection Report

**Generated:** ${date}
**Version:** ${report.reportVersion}
**Total Errors:** ${report.summary.totalErrors}
**Pass Rate:** ${report.summary.passRate.toFixed(1)}%`;
  }

  /**
   * Generate summary section
   */
  private generateSummary(report: SmugMugErrorReport): string {
    const { summary } = report;

    let md = '## Summary\n\n';

    // Overall statistics
    md += '### Overall Statistics\n\n';
    md += `- **Total Errors:** ${summary.totalErrors}\n`;
    md += `- **Pass Rate:** ${summary.passRate.toFixed(1)}%\n`;
    md += `- **New Errors:** ${summary.newErrors}\n`;
    md += `- **Resolved Errors:** ${summary.resolvedErrors}\n\n`;

    // By Severity
    md += '### Errors by Severity\n\n';
    md += '| Severity | Count |\n';
    md += '|----------|-------|\n';
    Object.entries(summary.bySeverity).forEach(([severity, count]) => {
      const icon = this.getSeverityIcon(severity as any);
      md += `| ${icon} ${severity} | ${count} |\n`;
    });
    md += '\n';

    // By Category
    md += '### Errors by Category\n\n';
    md += '| Category | Count |\n';
    md += '|----------|-------|\n';
    Object.entries(summary.byCategory).forEach(([category, count]) => {
      md += `| ${category} | ${count} |\n`;
    });

    return md;
  }

  /**
   * Generate critical errors section
   */
  private generateCriticalErrors(errors: SmugMugAppError[]): string {
    let md = '## 🚨 Critical Errors\n\n';

    md += `Found ${errors.length} critical error(s) that require immediate attention:\n\n`;

    errors.forEach((error, index) => {
      md += `### ${index + 1}. ${error.message}\n\n`;
      md += `- **Error ID:** \`${error.errorId}\`\n`;
      md += `- **Category:** ${error.category}\n`;
      md += `- **Severity:** ${this.getSeverityIcon(error.severity)} ${error.severity}\n`;

      if (error.componentName) {
        md += `- **Component:** \`${error.componentName}\`\n`;
      }

      if (error.routePath) {
        md += `- **Route:** \`${error.routePath}\`\n`;
      }

      if (error.fixSuggestion) {
        md += `- **Fix Suggestion:** ${error.fixSuggestion}\n`;
      }

      if (error.stack) {
        md += '\n**Stack Trace:**\n```\n';
        md += error.stack.split('\n').slice(0, 5).join('\n');
        md += '\n```\n';
      }

      md += '\n';
    });

    return md;
  }

  /**
   * Generate agent-native issues section
   */
  private generateAgentNativeIssues(report: SmugMugErrorReport): string {
    const { agentNativeIssues } = report;
    let md = '## 🤖 Agent-Native Issues\n\n';

    if (agentNativeIssues.missingInterfaces.length > 0) {
      md += '### Missing Agent Interfaces\n\n';
      agentNativeIssues.missingInterfaces.forEach((interfaceId) => {
        md += `- \`${interfaceId}\`\n`;
      });
      md += '\n';
    }

    if (agentNativeIssues.missingActions.length > 0) {
      md += '### Missing Agent Actions\n\n';
      agentNativeIssues.missingActions.forEach((actionId) => {
        md += `- \`${actionId}\`\n`;
      });
      md += '\n';
    }

    if (agentNativeIssues.schemaValidationErrors.length > 0) {
      md += '### Schema.org Validation Errors\n\n';
      md += '| Component | Schema Type | Missing Properties |\n';
      md += '|-----------|-------------|--------------------|\n';
      agentNativeIssues.schemaValidationErrors.forEach((error) => {
        md += `| ${error.componentName} | ${error.schemaType} | ${error.missingProperties.join(', ')} |\n`;
      });
      md += '\n';
    }

    if (agentNativeIssues.dualInterfaceViolations.length > 0) {
      md += '### Dual-Interface Violations\n\n';
      agentNativeIssues.dualInterfaceViolations.forEach((violation) => {
        md += `- **${violation.componentName}:** ${violation.issue} - ${violation.details}\n`;
      });
      md += '\n';
    }

    return md;
  }

  /**
   * Generate API issues section
   */
  private generateAPIIssues(report: SmugMugErrorReport): string {
    const { apiIssues } = report;
    let md = '## 🌐 API Integration Issues\n\n';

    if (apiIssues.smugmugFailures.length > 0) {
      md += '### SmugMug API Failures\n\n';
      md += '| Endpoint | Method | Status | Error Count | Avg Response Time |\n';
      md += '|----------|--------|--------|-------------|-------------------|\n';
      apiIssues.smugmugFailures.forEach((failure) => {
        const statusCodes = Object.keys(failure.statusCodes).join(', ');
        md += `| ${failure.endpoint} | ${failure.method} | ${statusCodes} | ${failure.errorCount} | ${failure.averageResponseTime}ms |\n`;
      });
      md += '\n';
    }

    if (apiIssues.geminiFailures.length > 0) {
      md += '### Gemini AI Service Failures\n\n';
      md += '| Endpoint | Method | Status | Error Count |\n';
      md += '|----------|--------|--------|-------------|\n';
      apiIssues.geminiFailures.forEach((failure) => {
        const statusCodes = Object.keys(failure.statusCodes).join(', ');
        md += `| ${failure.endpoint} | ${failure.method} | ${statusCodes} | ${failure.errorCount} |\n`;
      });
      md += '\n';
    }

    if (apiIssues.networkTimeouts.length > 0) {
      md += '### Network Timeouts\n\n';
      md += `Found ${apiIssues.networkTimeouts.length} network timeout error(s).\n\n`;
    }

    return md;
  }

  /**
   * Generate component issues section
   */
  private generateComponentIssues(report: SmugMugErrorReport): string {
    const { componentIssues } = report;
    let md = '## 🧩 Component Issues\n\n';

    if (Object.keys(componentIssues.byComponent).length > 0) {
      md += '### Errors by Component\n\n';
      md += '| Component | Total Errors | Null Safety | Hook Issues | Render Errors |\n';
      md += '|-----------|--------------|-------------|-------------|---------------|\n';

      Object.entries(componentIssues.byComponent).forEach(([componentName, summary]) => {
        md += `| ${componentName} | ${summary.errorCount} | ${summary.nullSafetyViolations} | ${summary.hookIssues} | ${summary.renderErrors} |\n`;
      });
      md += '\n';
    }

    return md;
  }

  /**
   * Generate fix suggestions section
   */
  private generateFixSuggestions(suggestions: FixSuggestion[]): string {
    let md = '## 💡 Fix Suggestions\n\n';

    suggestions.slice(0, 10).forEach((suggestion, index) => {
      md += `### ${index + 1}. ${suggestion.title}\n\n`;
      md += `**Category:** ${suggestion.category}  \n`;
      md += `**Description:** ${suggestion.description}\n\n`;

      if (suggestion.files.length > 0) {
        md += `**Affected Files:**\n`;
        suggestion.files.forEach((file) => {
          md += `- \`${file}\`\n`;
        });
        md += '\n';
      }

      if (suggestion.codeExample) {
        md += '**Code Example:**\n```typescript\n';
        md += suggestion.codeExample;
        md += '\n```\n\n';
      }

      if (suggestion.automaticFix) {
        md += '✅ *This issue can be automatically fixed.*\n\n';
      }
    });

    if (suggestions.length > 10) {
      md += `\n*...and ${suggestions.length - 10} more suggestion(s)*\n`;
    }

    return md;
  }

  /**
   * Generate test coverage section
   */
  private generateTestCoverage(report: SmugMugErrorReport): string {
    const { testCoverage } = report;

    let md = '## 📊 Test Coverage\n\n';

    md += '| Metric | Covered | Total | Percentage |\n';
    md += '|--------|---------|-------|------------|\n';

    const metrics = [
      {
        name: 'Critical Flows',
        covered: testCoverage.criticalFlowsCovered,
        total: testCoverage.criticalFlowsTotal,
      },
      {
        name: 'Agent Actions',
        covered: testCoverage.agentActionsCovered,
        total: testCoverage.agentActionsTotal,
      },
      {
        name: 'Components',
        covered: testCoverage.componentsCovered,
        total: testCoverage.componentsTotal,
      },
      {
        name: 'API Endpoints',
        covered: testCoverage.apiEndpointsCovered,
        total: testCoverage.apiEndpointsTotal,
      },
    ];

    metrics.forEach((metric) => {
      const percentage = metric.total > 0 ? (metric.covered / metric.total) * 100 : 0;
      md += `| ${metric.name} | ${metric.covered} | ${metric.total} | ${percentage.toFixed(1)}% |\n`;
    });

    return md;
  }

  /**
   * Helper: Check if report has agent-native issues
   */
  private hasAgentNativeIssues(report: SmugMugErrorReport): boolean {
    const { agentNativeIssues } = report;
    return (
      agentNativeIssues.missingInterfaces.length > 0 ||
      agentNativeIssues.missingActions.length > 0 ||
      agentNativeIssues.schemaValidationErrors.length > 0 ||
      agentNativeIssues.dualInterfaceViolations.length > 0
    );
  }

  /**
   * Helper: Check if report has API issues
   */
  private hasAPIIssues(report: SmugMugErrorReport): boolean {
    const { apiIssues } = report;
    return (
      apiIssues.smugmugFailures.length > 0 ||
      apiIssues.geminiFailures.length > 0 ||
      apiIssues.networkTimeouts.length > 0
    );
  }

  /**
   * Helper: Check if report has component issues
   */
  private hasComponentIssues(report: SmugMugErrorReport): boolean {
    return Object.keys(report.componentIssues.byComponent).length > 0;
  }

  /**
   * Helper: Get severity icon
   */
  private getSeverityIcon(severity: 'critical' | 'high' | 'medium' | 'low'): string {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return icons[severity] || '⚪';
  }
}

export const markdownReporter = new MarkdownReporter();
