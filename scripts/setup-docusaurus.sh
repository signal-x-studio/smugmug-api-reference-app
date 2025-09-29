#!/bin/bash
# setup-docusaurus.sh - Quick setup script for Docusaurus documentation

set -e

echo "🚀 Setting up Docusaurus documentation site..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if docs-site already exists
if [ -d "docs-site" ]; then
    echo "⚠️  docs-site directory already exists"
    read -p "Remove existing docs-site and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf docs-site
    else
        echo "Exiting without changes"
        exit 0
    fi
fi

# Create Docusaurus site
echo "📦 Creating Docusaurus site with TypeScript..."
npx create-docusaurus@latest docs-site classic --typescript

# Navigate to docs-site
cd docs-site

# Install additional plugins
echo "🔌 Installing additional plugins..."
npm install --save @docusaurus/plugin-ideal-image
npm install --save @docusaurus/theme-search-algolia
npm install --save @docusaurus/plugin-google-gtag
npm install --save remark-math rehype-katex

# Install development dependencies
npm install --save-dev markdown-link-check

# Create basic package.json scripts for validation
echo "📝 Adding validation scripts..."
cat > scripts-addition.json << 'EOF'
{
  "validate:links": "markdown-link-check docs/**/*.md --config .markdown-link-check.json",
  "validate:examples": "node scripts/validate-examples.js",
  "validate:all": "npm run validate:links && npm run validate:examples"
}
EOF

# Add scripts to package.json (simple approach)
cp package.json package.json.backup
node -e "
const pkg = require('./package.json');
const addition = require('./scripts-addition.json');
pkg.scripts = { ...pkg.scripts, ...addition };
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
rm scripts-addition.json

# Create validation script directory
mkdir -p scripts

# Create basic validation script
cat > scripts/validate-examples.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('✅ Code example validation (basic implementation)');
console.log('TODO: Add TypeScript compilation checks');
console.log('TODO: Add API example validation');
console.log('For now, this is a placeholder that always passes');
EOF

# Create link checker config
cat > .markdown-link-check.json << 'EOF'
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    }
  ],
  "replacementPatterns": [
    {
      "pattern": "^/",
      "replacement": "https://signal-x-studio.github.io/smugmug-api-reference-app/"
    }
  ],
  "retryOn429": true,
  "retryCount": 3,
  "fallbackRetryDelay": "30s",
  "aliveStatusCodes": [200, 206]
}
EOF

# Update docusaurus.config.js with our configuration
cat > docusaurus.config.js << 'EOF'
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

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

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
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
          editUrl:
            'https://github.com/signal-x-studio/smugmug-api-reference-app/tree/main/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          remarkPlugins: [require('remark-math')],
          rehypePlugins: [require('rehype-katex')],
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/signal-x-studio/smugmug-api-reference-app/tree/main/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    '@docusaurus/plugin-ideal-image',
    // Uncomment and configure when you have Google Analytics
    // ['@docusaurus/plugin-google-gtag', {
    //   trackingID: 'G-XXXXXXXXXX',
    // }],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'SmugMug API Reference',
        logo: {
          alt: 'SmugMug API Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
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
                to: '/docs/getting-started',
              },
              {
                label: 'OAuth Guide',
                to: '/docs/oauth-implementation',
              },
              {
                label: 'AI Integration',
                to: '/docs/ai-integration',
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
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/signal-x-studio/smugmug-api-reference-app',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} SmugMug API Reference. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'python'],
      },
      
      // Uncomment and configure when you set up Algolia search
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_SEARCH_API_KEY',
      //   indexName: 'smugmug-api-reference',
      // },
    }),
};

module.exports = config;
EOF

# Create basic documentation structure
echo "📚 Creating documentation structure..."

# Remove default docs
rm -rf docs/* blog/*

# Create new documentation structure
mkdir -p docs/{getting-started,oauth-implementation,api-reference,ai-integration,examples,advanced}

# Create index file
cat > docs/index.md << 'EOF'
---
slug: /
sidebar_position: 1
---

# SmugMug API Reference

Welcome to the comprehensive SmugMug API integration guide! This documentation will help you build robust applications using the SmugMug API with OAuth 1.0a authentication and AI-powered features.

## What You'll Learn

🚀 **[Quick Start](./getting-started/quick-start)** - Get running in 5 minutes  
🔐 **[OAuth 1.0a Implementation](./oauth-implementation/oauth-overview)** - Secure authentication  
🤖 **[AI Integration](./ai-integration/ai-overview)** - Intelligent photo management  
📚 **[Complete API Reference](./api-reference/authentication)** - All endpoints and patterns  

## Why This Guide?

This isn't just documentation—it's a **complete reference implementation** showing:

- ✅ **Production-ready patterns** for OAuth 1.0a authentication
- ✅ **AI integration examples** with Google Gemini
- ✅ **Performance optimization** techniques with measurable results  
- ✅ **Security best practices** for API integration
- ✅ **Real code examples** you can copy and adapt

## Architecture Overview

```mermaid
graph TB
    A[Client App] --> B[OAuth Proxy Server]
    B --> C[SmugMug API]
    A --> D[AI Service]
    D --> E[Google Gemini]
    
    A --> F[Mock Service]
    F --> G[Development Data]
```

## Quick Navigation

import DocCardList from '@theme/DocCardList';

<DocCardList />
EOF

# Create quick start guide
cat > docs/getting-started/quick-start.md << 'EOF'
---
sidebar_position: 1
---

# Quick Start Guide

Get your SmugMug integration running in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- SmugMug account with API access  
- Google Gemini API key (optional, for AI features)

## Installation

```bash
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app
npm install
```

## Environment Setup

Create a `.env` file:

```env title=".env"
# Optional: For AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Development mode uses mock data
NODE_ENV=development
```

## Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## What's Next?

- 📖 [OAuth Implementation Guide](../oauth-implementation/oauth-overview)  
- 🤖 [AI Integration Guide](../ai-integration/ai-overview)
- 📚 [API Reference](../api-reference/authentication)

:::tip
This application uses mock data for development. For production, you'll need OAuth 1.0a with a backend proxy.
:::
EOF

# Go back to project root
cd ..

echo ""
echo "✅ Docusaurus setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. cd docs-site"
echo "2. npm start (to preview locally)"  
echo "3. Edit docs/index.md and other files to customize content"
echo "4. Run 'npm run validate:all' to check for issues"
echo "5. Deploy with GitHub Actions (see .github/workflows/docs-deploy.yml)"
echo ""
echo "🎯 Documentation will be available at:"
echo "   Local: http://localhost:3000"
echo "   Production: https://signal-x-studio.github.io/smugmug-api-reference-app/"
echo ""
echo "📖 See docs/meta/DOCUSAURUS-IMPLEMENTATION-GUIDE.md for detailed customization guide"