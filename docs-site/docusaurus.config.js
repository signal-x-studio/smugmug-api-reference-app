// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes: prismThemes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SmugMug API Reference',
  tagline: 'Complete OAuth 1.0a & AI Integration Guide for Developers',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://signal-x-studio.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/smugmug-api-reference-app/',

  // GitHub pages deployment config
  organizationName: 'signal-x-studio',
  projectName: 'smugmug-api-reference-app',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/signal-x-studio/smugmug-api-reference-app/tree/main/docs-site/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          routeBasePath: '/',
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'SmugMug API Reference',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/signal-x-studio/smugmug-api-reference-app',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Quick Start',
                to: '/getting-started/quick-start',
              },
              {
                label: 'OAuth Guide',
                to: '/oauth-implementation/oauth-overview',
              },
              {
                label: 'AI Integration',
                to: '/ai-integration/ai-overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/signal-x-studio/smugmug-api-reference-app/discussions',
              },
              {
                label: 'Issues',
                href: 'https://github.com/signal-x-studio/smugmug-api-reference-app/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} SmugMug API Reference. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python'],
      },
    }),
};

module.exports = config;