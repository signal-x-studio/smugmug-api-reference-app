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
      ],
    },
    {
      type: 'category', 
      label: 'AI Development',
      items: [
        'ai-development/multi-agent-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Implementation',
      items: [
        'implementation/ai-integration',
        'implementation/react-patterns',
        'implementation/service-layer',
      ],
    },
    // Sections to be added as content is created
    /*
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/react-components',
        'examples/service-patterns',
        'examples/ai-prompts',
      ],
    },
    */
  ],
};

module.exports = sidebars;