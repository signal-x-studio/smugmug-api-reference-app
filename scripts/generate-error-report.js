#!/usr/bin/env node

/**
 * Generate Runtime Error Detection Report
 *
 * Usage:
 *   node scripts/generate-error-report.js
 *   node scripts/generate-error-report.js --format=html
 *   node scripts/generate-error-report.js --format=json,markdown
 *   node scripts/generate-error-report.js --output=custom/path
 */

import { reportGenerator } from '../src/testing/runtime-errors/reporters/ReportGenerator.ts';
import { errorCaptureManager } from '../src/testing/runtime-errors/ErrorCaptureManager.ts';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  formats: ['html', 'json', 'markdown'],
  outputDir: 'test-results/runtime-errors',
};

args.forEach((arg) => {
  if (arg.startsWith('--format=')) {
    const formats = arg.split('=')[1].split(',');
    options.formats = formats;
  }
  if (arg.startsWith('--output=')) {
    options.outputDir = arg.split('=')[1];
  }
});

console.log('🔍 Generating runtime error detection report...\n');
console.log(`Output directory: ${options.outputDir}`);
console.log(`Formats: ${options.formats.join(', ')}\n`);

// Initialize error capture (in case it's not already initialized)
try {
  errorCaptureManager.initialize();
} catch (error) {
  // Already initialized, that's fine
}

// Generate report
const generator = new reportGenerator.constructor({
  outputDir: options.outputDir,
  reporters: options.formats,
});

generator
  .generateAndWriteAll()
  .then((outputPaths) => {
    console.log('✅ Reports generated successfully:\n');
    outputPaths.forEach((path) => {
      console.log(`   📄 ${path}`);
    });
    console.log('\n📊 Report Statistics:');

    const stats = errorCaptureManager.getStats();
    console.log(`   Total Errors: ${stats.total}`);
    console.log(`   Critical: ${stats.bySeverity.critical || 0}`);
    console.log(`   High: ${stats.bySeverity.high || 0}`);
    console.log(`   Medium: ${stats.bySeverity.medium || 0}`);
    console.log(`   Low: ${stats.bySeverity.low || 0}`);

    if (stats.total === 0) {
      console.log('\n✨ No errors detected! Great job!');
    } else if ((stats.bySeverity.critical || 0) > 0) {
      console.log('\n⚠️  Critical errors found! Please review immediately.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  });
