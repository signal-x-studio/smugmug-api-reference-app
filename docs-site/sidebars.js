/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'index',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/first-integration',
      ],
    },
    {
      type: 'category', 
      label: 'OAuth Implementation',
      items: [
        'oauth-implementation/oauth-overview',
        'oauth-implementation/client-side-demo',
        'oauth-implementation/server-side-proxy',
        'oauth-implementation/security-best-practices',
      ],
    },
    {
      type: 'category',
      label: 'AI Integration',
      items: [
        'ai-integration/ai-overview',
        'ai-integration/gemini-setup',
        'ai-integration/metadata-generation',
        'ai-integration/batch-processing',
        'ai-integration/prompt-engineering',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/authentication',
        'api-reference/albums-api',
        'api-reference/photos-api',
        'api-reference/batch-operations',
        'api-reference/error-handling',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/complete-integration',
        'examples/react-components',
        'examples/node-backend',
        'examples/python-backend',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/performance-optimization',
        'advanced/production-deployment',
        'advanced/monitoring-logging',
        'advanced/troubleshooting',
      ],
    },
  ],
};

module.exports = sidebars;