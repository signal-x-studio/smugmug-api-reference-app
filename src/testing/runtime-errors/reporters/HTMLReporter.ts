/**
 * HTML Reporter for Runtime Error Detection
 *
 * Generates interactive HTML dashboard with charts, filterable tables,
 * and visual error analysis.
 */

import type { SmugMugErrorReport, SmugMugAppError } from '../types';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

export class HTMLReporter {
  name = 'html';

  /**
   * Generate HTML report
   */
  async generate(report: SmugMugErrorReport): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runtime Error Detection Report - SmugMug API Reference App</title>
    <style>
        ${this.getCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader(report)}
        ${this.generateSummary(report)}
        ${this.generateCharts(report)}
        ${this.generateErrorTables(report)}
        ${this.generateAgentNativeSection(report)}
        ${this.generateAPIIssuesSection(report)}
        ${this.generateFixSuggestions(report)}
        ${this.generateTestCoverage(report)}
    </div>
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;
  }

  /**
   * Write report to file
   */
  async write(content: string, outputPath: string): Promise<void> {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content, 'utf-8');
  }

  /**
   * Generate CSS styles
   */
  private getCSS(): string {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background: #f5f7fa; color: #2c3e50; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .meta { opacity: 0.9; font-size: 0.9em; }
        .card { background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
        .card h2 { color: #667eea; margin-bottom: 20px; font-size: 1.5em; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .stat-card .label { opacity: 0.9; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #f8f9fa; font-weight: 600; color: #667eea; }
        tr:hover { background: #f8f9fa; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
        .badge-critical { background: #fee; color: #c00; }
        .badge-high { background: #ffd; color: #d60; }
        .badge-medium { background: #ffe; color: #cc0; }
        .badge-low { background: #efe; color: #060; }
        .error-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
        .code-block { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9em; margin: 10px 0; }
        .filter-bar { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; }
        .filter-bar select, .filter-bar input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; }
        .chart-container { height: 300px; margin: 20px 0; }
        .progress-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s ease; }
        .tab-nav { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
        .tab-nav button { background: none; border: none; padding: 12px 20px; cursor: pointer; font-size: 1em; color: #666; border-bottom: 3px solid transparent; transition: all 0.3s; }
        .tab-nav button:hover { color: #667eea; }
        .tab-nav button.active { color: #667eea; border-bottom-color: #667eea; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        @media print { .filter-bar, .tab-nav { display: none; } }
    `;
  }

  /**
   * Generate JavaScript for interactivity
   */
  private getJavaScript(): string {
    return `
        // Tab navigation
        document.querySelectorAll('.tab-nav button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                document.querySelectorAll('.tab-nav button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        });

        // Error filtering
        function filterErrors() {
            const category = document.getElementById('category-filter').value;
            const severity = document.getElementById('severity-filter').value;
            const search = document.getElementById('search-filter').value.toLowerCase();

            document.querySelectorAll('.error-row').forEach(row => {
                const matchesCategory = !category || row.dataset.category === category;
                const matchesSeverity = !severity || row.dataset.severity === severity;
                const matchesSearch = !search || row.textContent.toLowerCase().includes(search);

                row.style.display = (matchesCategory && matchesSeverity && matchesSearch) ? '' : 'none';
            });
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', () => {
            const firstTab = document.querySelector('.tab-nav button');
            if (firstTab) firstTab.click();
        });
    `;
  }

  /**
   * Generate header section
   */
  private generateHeader(report: SmugMugErrorReport): string {
    const date = new Date(report.generatedAt).toLocaleString();
    const passRate = report.summary.passRate;
    const status = passRate >= 90 ? '✅ GOOD' : passRate >= 70 ? '⚠️ WARNING' : '❌ NEEDS ATTENTION';

    return `
        <header>
            <h1>Runtime Error Detection Report</h1>
            <div class="meta">
                <strong>Generated:</strong> ${date} |
                <strong>Status:</strong> ${status} |
                <strong>Pass Rate:</strong> ${passRate.toFixed(1)}%
            </div>
        </header>
    `;
  }

  /**
   * Generate summary cards
   */
  private generateSummary(report: SmugMugErrorReport): string {
    const { summary } = report;

    return `
        <div class="card">
            <h2>📊 Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">Total Errors</div>
                    <div class="value">${summary.totalErrors}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Critical</div>
                    <div class="value">${summary.bySeverity.critical || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="label">High Priority</div>
                    <div class="value">${summary.bySeverity.high || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Pass Rate</div>
                    <div class="value">${summary.passRate.toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate charts section (placeholder - could add actual chart library)
   */
  private generateCharts(report: SmugMugErrorReport): string {
    const { summary } = report;

    return `
        <div class="card">
            <h2>📈 Error Distribution</h2>
            <div class="chart-container">
                ${this.generateCategoryChart(summary.byCategory)}
            </div>
        </div>
    `;
  }

  /**
   * Generate simple bar chart with CSS
   */
  private generateCategoryChart(byCategory: Record<string, number>): string {
    const max = Math.max(...Object.values(byCategory));
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

    Object.entries(byCategory).forEach(([category, count]) => {
      const width = max > 0 ? (count / max) * 100 : 0;
      html += `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 150px; font-weight: 500;">${category}</div>
                    <div class="progress-bar" style="flex: 1;">
                        <div class="progress-fill" style="width: ${width}%"></div>
                    </div>
                    <div style="width: 50px; text-align: right;">${count}</div>
                </div>
            `;
    });

    html += '</div>';
    return html;
  }

  /**
   * Generate error tables with filtering
   */
  private generateErrorTables(report: SmugMugErrorReport): string {
    return `
        <div class="card">
            <h2>🔍 Errors</h2>
            <div class="filter-bar">
                <select id="category-filter" onchange="filterErrors()">
                    <option value="">All Categories</option>
                    ${this.getCategoryOptions(report)}
                </select>
                <select id="severity-filter" onchange="filterErrors()">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <input type="text" id="search-filter" placeholder="Search errors..." onkeyup="filterErrors()">
            </div>
            ${this.generateErrorTable(report.criticalErrors, 'Critical')}
            ${this.generateErrorTable(report.highPriorityErrors, 'High Priority')}
        </div>
    `;
  }

  /**
   * Generate category filter options
   */
  private getCategoryOptions(report: SmugMugErrorReport): string {
    const categories = Object.keys(report.summary.byCategory);
    return categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }

  /**
   * Generate error table
   */
  private generateErrorTable(errors: SmugMugAppError[], title: string): string {
    if (errors.length === 0) return '';

    let html = `<h3>${title} Errors (${errors.length})</h3><table><thead><tr>`;
    html += '<th>Message</th><th>Category</th><th>Severity</th><th>Component</th></tr></thead><tbody>';

    errors.forEach(error => {
      html += `<tr class="error-row" data-category="${error.category}" data-severity="${error.severity}">`;
      html += `<td>${this.escapeHtml(error.message)}</td>`;
      html += `<td>${error.category}</td>`;
      html += `<td><span class="badge badge-${error.severity}">${error.severity}</span></td>`;
      html += `<td>${error.componentName || 'N/A'}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate agent-native section
   */
  private generateAgentNativeSection(report: SmugMugErrorReport): string {
    const { agentNativeIssues } = report;
    const hasIssues = agentNativeIssues.missingInterfaces.length > 0 ||
                      agentNativeIssues.missingActions.length > 0 ||
                      agentNativeIssues.schemaValidationErrors.length > 0;

    if (!hasIssues) return '';

    return `
        <div class="card">
            <h2>🤖 Agent-Native Issues</h2>
            ${agentNativeIssues.missingInterfaces.length > 0 ? `
                <h3>Missing Interfaces</h3>
                <ul>${agentNativeIssues.missingInterfaces.map(i => `<li><code>${i}</code></li>`).join('')}</ul>
            ` : ''}
            ${agentNativeIssues.missingActions.length > 0 ? `
                <h3>Missing Actions</h3>
                <ul>${agentNativeIssues.missingActions.map(a => `<li><code>${a}</code></li>`).join('')}</ul>
            ` : ''}
        </div>
    `;
  }

  /**
   * Generate API issues section
   */
  private generateAPIIssuesSection(report: SmugMugErrorReport): string {
    const { apiIssues } = report;
    const hasIssues = apiIssues.smugmugFailures.length > 0 || apiIssues.geminiFailures.length > 0;

    if (!hasIssues) return '';

    return `
        <div class="card">
            <h2>🌐 API Issues</h2>
            ${apiIssues.smugmugFailures.length > 0 ? `
                <h3>SmugMug API Failures</h3>
                <p>${apiIssues.smugmugFailures.length} endpoint(s) experiencing issues</p>
            ` : ''}
            ${apiIssues.geminiFailures.length > 0 ? `
                <h3>Gemini AI Failures</h3>
                <p>${apiIssues.geminiFailures.length} endpoint(s) experiencing issues</p>
            ` : ''}
        </div>
    `;
  }

  /**
   * Generate fix suggestions section
   */
  private generateFixSuggestions(report: SmugMugErrorReport): string {
    if (report.fixSuggestions.length === 0) return '';

    let html = '<div class="card"><h2>💡 Fix Suggestions</h2>';

    report.fixSuggestions.slice(0, 10).forEach((suggestion, index) => {
      html += `
                <div class="error-details">
                    <h4>${index + 1}. ${this.escapeHtml(suggestion.title)}</h4>
                    <p>${this.escapeHtml(suggestion.description)}</p>
                    ${suggestion.codeExample ? `<div class="code-block">${this.escapeHtml(suggestion.codeExample)}</div>` : ''}
                    ${suggestion.automaticFix ? '<p>✅ Can be automatically fixed</p>' : ''}
                </div>
            `;
    });

    html += '</div>';
    return html;
  }

  /**
   * Generate test coverage section
   */
  private generateTestCoverage(report: SmugMugErrorReport): string {
    const { testCoverage } = report;

    return `
        <div class="card">
            <h2>📊 Test Coverage</h2>
            ${this.generateCoverageBar('Critical Flows', testCoverage.criticalFlowsCovered, testCoverage.criticalFlowsTotal)}
            ${this.generateCoverageBar('Agent Actions', testCoverage.agentActionsCovered, testCoverage.agentActionsTotal)}
            ${this.generateCoverageBar('Components', testCoverage.componentsCovered, testCoverage.componentsTotal)}
            ${this.generateCoverageBar('API Endpoints', testCoverage.apiEndpointsCovered, testCoverage.apiEndpointsTotal)}
        </div>
    `;
  }

  /**
   * Generate coverage bar
   */
  private generateCoverageBar(label: string, covered: number, total: number): string {
    const percentage = total > 0 ? (covered / total) * 100 : 0;

    return `
        <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${label}</strong>
                <span>${covered}/${total} (${percentage.toFixed(1)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
  }

  /**
   * Helper: Escape HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export const htmlReporter = new HTMLReporter();
