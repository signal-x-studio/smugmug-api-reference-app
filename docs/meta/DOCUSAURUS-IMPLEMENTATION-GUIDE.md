# Docusaurus Implementation Guide

> **Step-by-step guide to implement world-class documentation using Docusaurus**  
> **Leveraging proven solutions for maximum impact with minimal custom development**

## 🎯 Why Docusaurus is Perfect for This Project

### **Alignment with Our Goals**
- ✅ **End-user developers** get fast, searchable, mobile-optimized documentation
- ✅ **Engineering excellence** showcased through modern React architecture and performance
- ✅ **Self-maintaining** through automated validation, deployment, and community contributions
- ✅ **Professional positioning** with enterprise-grade documentation platform

### **Technical Advantages**
- ✅ **React integration** - Can embed our existing components directly
- ✅ **TypeScript support** - Full type safety in documentation
- ✅ **Performance** - Server-side rendering, code splitting, optimized bundles
- ✅ **SEO optimized** - Better discoverability for developers searching for SmugMug solutions

---

## 📋 Implementation Checklist

### Phase 1: **Foundation Setup** (1-2 days)

#### ✅ 1.1 Initialize Docusaurus Project
```bash
# In project root, create documentation site
npx create-docusaurus@latest docs-site classic --typescript

# Navigate to docs site
cd docs-site

# Install additional essential plugins
npm install --save @docusaurus/plugin-ideal-image
npm install --save @docusaurus/theme-search-algolia
npm install --save @docusaurus/plugin-google-gtag
npm install --save plugin-image-zoom
npm install --save remark-math rehype-katex
```

#### ✅ 1.2 Configure for SmugMug API Reference
```javascript
// docs-site/docusaurus.config.js
const config = {
  title: 'SmugMug API Reference',
  tagline: 'Complete OAuth 1.0a & AI Integration Guide for Developers',
  favicon: 'img/favicon.ico',
  url: 'https://signal-x-studio.github.io',
  baseUrl: '/smugmug-api-reference-app/',
  
  organizationName: 'signal-x-studio',
  projectName: 'smugmug-api-reference-app',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  presets: [
    ['classic', {
      docs: {
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/signal-x-studio/smugmug-api-reference-app/tree/main/docs-site/',
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
        remarkPlugins: [require('remark-math')],
        rehypePlugins: [require('rehype-katex')],
      },
      blog: {
        showReadingTime: true,
        editUrl: 'https://github.com/signal-x-studio/smugmug-api-reference-app/tree/main/docs-site/',
      },
      theme: {
        customCss: require.resolve('./src/css/custom.css'),
      },
    }],
  ],

  plugins: [
    '@docusaurus/plugin-ideal-image',
    'plugin-image-zoom',
    ['@docusaurus/plugin-google-gtag', { trackingID: 'G-XXXXXXXXXX' }],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
};
```

#### ✅ 1.3 Content Structure Migration
```
docs-site/
├── docs/
│   ├── index.md                    # Documentation home
│   ├── getting-started/
│   │   ├── quick-start.md          # 5-minute setup
│   │   ├── installation.md         # Detailed installation
│   │   └── first-integration.md    # First SmugMug API call
│   ├── oauth-implementation/
│   │   ├── oauth-overview.md       # OAuth 1.0a concepts
│   │   ├── client-side-demo.md     # Development patterns
│   │   ├── server-side-proxy.md    # Production implementation
│   │   └── security-best-practices.md
│   ├── api-reference/
│   │   ├── authentication.md       # Auth patterns
│   │   ├── albums-api.md          # Albums management
│   │   ├── photos-api.md          # Photo operations
│   │   ├── batch-operations.md    # Bulk operations
│   │   └── error-handling.md      # Error patterns
│   ├── ai-integration/
│   │   ├── ai-overview.md         # AI integration concepts
│   │   ├── gemini-setup.md        # Google Gemini setup
│   │   ├── metadata-generation.md # AI metadata patterns
│   │   ├── batch-processing.md    # AI batch operations
│   │   └── prompt-engineering.md  # Effective prompting
│   ├── examples/
│   │   ├── complete-integration.md # Full integration example
│   │   ├── react-components.md    # React component examples
│   │   ├── node-backend.md        # Node.js backend example
│   │   └── python-backend.md      # Python backend example
│   └── advanced/
│       ├── performance-optimization.md
│       ├── production-deployment.md
│       ├── monitoring-logging.md
│       └── troubleshooting.md
├── blog/                          # Development updates & insights
├── src/
│   ├── components/               # Interactive components
│   ├── pages/                   # Custom pages
│   └── css/                     # Custom styling
└── static/                      # Images, downloads, etc.
```

### Phase 2: **Interactive Components** (2-3 days)

#### ✅ 2.1 SmugMug API Explorer Component
```typescript
// src/components/SmugMugAPIExplorer/index.tsx
import React, { useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

interface APIExplorerProps {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters?: Parameter[];
  exampleResponse?: string;
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export default function SmugMugAPIExplorer({ 
  endpoint, 
  method, 
  description, 
  parameters = [],
  exampleResponse 
}: APIExplorerProps) {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateCurlExample = () => {
    return `curl -X ${method} \\
  -H "Authorization: OAuth oauth_consumer_key=\\"YOUR_API_KEY\\", oauth_signature=\\"...\\"" \\
  "https://api.smugmug.com${endpoint}"`;
  };

  const generateTypeScriptExample = () => {
    return `// TypeScript example
const response = await smugmugService.request({
  method: '${method}',
  endpoint: '${endpoint}',
  // Add parameters as needed
});`;
  };

  const handleTryDemo = async () => {
    setIsLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      setResponse(exampleResponse || '{"status": "success", "data": "Mock response"}');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="api-explorer">
      <div className="api-header">
        <span className={`badge badge--${method.toLowerCase()}`}>{method}</span>
        <code className="api-endpoint">{endpoint}</code>
      </div>
      
      <p>{description}</p>

      {parameters.length > 0 && (
        <div className="parameters">
          <h4>Parameters</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param) => (
                <tr key={param.name}>
                  <td><code>{param.name}</code></td>
                  <td>{param.type}</td>
                  <td>{param.required ? '✅' : '❌'}</td>
                  <td>{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Tabs>
        <TabItem value="curl" label="cURL">
          <CodeBlock language="bash">{generateCurlExample()}</CodeBlock>
        </TabItem>
        <TabItem value="typescript" label="TypeScript">
          <CodeBlock language="typescript">{generateTypeScriptExample()}</CodeBlock>
        </TabItem>
        <TabItem value="response" label="Example Response">
          <CodeBlock language="json">{exampleResponse || '{"message": "Example response"}'}</CodeBlock>
        </TabItem>
      </Tabs>

      <button 
        className="button button--primary" 
        onClick={handleTryDemo}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Try Demo'}
      </button>

      {response && (
        <div className="response-section">
          <h4>Demo Response</h4>
          <CodeBlock language="json">{response}</CodeBlock>
        </div>
      )}
    </div>
  );
}
```

#### ✅ 2.2 Interactive OAuth Flow Diagram
```typescript
// src/components/OAuthFlowDiagram/index.tsx
import React, { useState } from 'react';

export default function OAuthFlowDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: 'Request Token', description: 'Get temporary request token' },
    { title: 'User Authorization', description: 'Redirect user to SmugMug' },
    { title: 'Authorization Callback', description: 'User grants permission' },
    { title: 'Access Token', description: 'Exchange for access token' },
    { title: 'Authenticated Requests', description: 'Make signed API calls' },
  ];

  return (
    <div className="oauth-flow-diagram">
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index <= currentStep ? 'active' : ''}`}
            onClick={() => setCurrentStep(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="step-controls">
        <button 
          className="button button--secondary"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button 
          className="button button--primary"
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Phase 3: **Enhanced Content Creation** (2-3 days)

#### ✅ 3.1 Getting Started Guide
```markdown
---
sidebar_position: 1
---

# Quick Start Guide

Get your SmugMug integration running in under 5 minutes with this step-by-step guide.

## Prerequisites

- Node.js 18+ installed
- SmugMug account with API access
- Google Gemini API key (optional, for AI features)

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app
npm install
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app
yarn install
```

</TabItem>
</Tabs>

## Environment Setup

Create a `.env` file in the project root:

```env title=".env"
# Required for AI features (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Development mode uses mock data by default
NODE_ENV=development
```

:::tip Getting Your Gemini API Key
Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your free Gemini API key for AI-powered metadata generation.
:::

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## Your First API Integration

import SmugMugAPIExplorer from '@site/src/components/SmugMugAPIExplorer';

<SmugMugAPIExplorer
  method="GET"
  endpoint="/api/v2/user/me"
  description="Get authenticated user information"
  exampleResponse={`{
  "Response": {
    "User": {
      "NickName": "johndoe",
      "Name": "John Doe",
      "Plan": "Pro"
    }
  }
}`}
/>

## Next Steps

- 📖 [OAuth Implementation Guide](./oauth-implementation/oauth-overview) - Learn secure authentication
- 🤖 [AI Integration Guide](./ai-integration/ai-overview) - Add intelligent features
- 📚 [Complete API Reference](./api-reference/authentication) - Explore all endpoints
- 🚀 [Production Deployment](./advanced/production-deployment) - Deploy securely

:::info Development vs Production
This quick start uses mock data for immediate development. For production use, you'll need to implement OAuth 1.0a with a backend proxy. See our [Production Deployment Guide](./advanced/production-deployment) for details.
:::
```

#### ✅ 3.2 Interactive OAuth Guide
```markdown
---
sidebar_position: 2
---

# OAuth 1.0a Implementation Guide

Learn how to implement secure SmugMug authentication with OAuth 1.0a.

## Understanding OAuth 1.0a Flow

import OAuthFlowDiagram from '@site/src/components/OAuthFlowDiagram';

<OAuthFlowDiagram />

## Why OAuth 1.0a?

SmugMug uses OAuth 1.0a for security and compatibility. While more complex than OAuth 2.0, it provides:

- ✅ **No client secret exposure** - Secrets never leave your server
- ✅ **Request signing** - Every request is cryptographically signed  
- ✅ **Replay protection** - Timestamps and nonces prevent replay attacks
- ✅ **No bearer tokens** - More secure than simple bearer token systems

:::warning Production Requirement
OAuth 1.0a requires server-side implementation. You **cannot** securely implement OAuth 1.0a entirely in client-side JavaScript.
:::

## Development vs Production

### Development Mode (This App)
```typescript
// Mock service for development and learning
const mockCredentials = {
  apiKey: 'mock-key',
  apiSecret: 'mock-secret', 
  accessToken: 'mock-token',
  accessTokenSecret: 'mock-token-secret'
};
```

### Production Implementation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="nodejs" label="Node.js Backend" default>

```typescript
// server/oauth-proxy.ts
import crypto from 'crypto';
import { Request, Response } from 'express';

export class SmugMugOAuthProxy {
  constructor(
    private apiKey: string,
    private apiSecret: string,
    private accessToken: string,
    private accessTokenSecret: string
  ) {}

  async signedRequest(endpoint: string, method: string, params: any = {}) {
    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0',
    };

    // Create signature base string
    const allParams = { ...params, ...oauthParams };
    const signature = this.generateSignature(method, endpoint, allParams);
    
    oauthParams.oauth_signature = signature;
    
    return this.makeRequest(endpoint, method, oauthParams, params);
  }

  private generateSignature(method: string, url: string, params: any): string {
    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;
    
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
      
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    
    return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  }
}
```

</TabItem>
<TabItem value="python" label="Python Backend">

```python
# server/oauth_proxy.py
import hashlib
import hmac
import base64
import urllib.parse
import time
import secrets
from typing import Dict, Any

class SmugMugOAuthProxy:
    def __init__(self, api_key: str, api_secret: str, access_token: str, access_token_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.access_token_secret = access_token_secret
    
    def signed_request(self, endpoint: str, method: str, params: Dict[str, Any] = None) -> Dict:
        if params is None:
            params = {}
            
        oauth_params = {
            'oauth_consumer_key': self.api_key,
            'oauth_token': self.access_token,
            'oauth_signature_method': 'HMAC-SHA1',
            'oauth_timestamp': str(int(time.time())),
            'oauth_nonce': secrets.token_hex(16),
            'oauth_version': '1.0',
        }
        
        all_params = {**params, **oauth_params}
        signature = self._generate_signature(method, endpoint, all_params)
        oauth_params['oauth_signature'] = signature
        
        return self._make_request(endpoint, method, oauth_params, params)
    
    def _generate_signature(self, method: str, url: str, params: Dict[str, Any]) -> str:
        signing_key = f"{urllib.parse.quote(self.api_secret)}&{urllib.parse.quote(self.access_token_secret)}"
        
        param_string = '&'.join([
            f"{urllib.parse.quote(str(k))}={urllib.parse.quote(str(v))}"
            for k, v in sorted(params.items())
        ])
        
        base_string = f"{method}&{urllib.parse.quote(url)}&{urllib.parse.quote(param_string)}"
        
        signature = hmac.new(
            signing_key.encode(),
            base_string.encode(),
            hashlib.sha1
        ).digest()
        
        return base64.b64encode(signature).decode()
```

</TabItem>
</Tabs>

## Security Best Practices

:::tip Credential Management
- Store credentials in environment variables or secure key management
- Use HTTPS for all OAuth callbacks and API communications  
- Implement proper session management for user tokens
- Rotate credentials regularly and monitor for unauthorized access
:::

:::danger Never Do This
```javascript
// ❌ NEVER expose secrets in client-side code
const apiSecret = 'your-secret-here'; // Visible to all users!

// ❌ NEVER store secrets in localStorage or cookies
localStorage.setItem('oauth_secret', secret);

// ❌ NEVER commit secrets to version control
git add .env.production # Contains real secrets
```
:::

## Testing Your Implementation

Use our interactive API explorer to test your OAuth implementation:

import SmugMugAPIExplorer from '@site/src/components/SmugMugAPIExplorer';

<SmugMugAPIExplorer
  method="GET"
  endpoint="/api/v2/user/me"
  description="Test authenticated request to get user profile"
  parameters={[
    { name: 'oauth_consumer_key', type: 'string', required: true, description: 'Your API key' },
    { name: 'oauth_signature', type: 'string', required: true, description: 'Generated signature' },
    { name: 'oauth_timestamp', type: 'string', required: true, description: 'Current timestamp' },
    { name: 'oauth_nonce', type: 'string', required: true, description: 'Unique request identifier' }
  ]}
  exampleResponse={`{
  "Response": {
    "User": {
      "NickName": "johndoe",
      "Name": "John Doe",
      "Plan": "Pro",
      "AccountStatus": "Active"
    }
  }
}`}
/>

## Next Steps

- 🏗️ [Set up your backend proxy](../examples/node-backend) - Production-ready examples
- 🔐 [Security implementation guide](./security-best-practices) - Advanced security patterns  
- 📱 [Mobile app integration](../examples/mobile-integration) - OAuth for mobile apps
- 🚀 [Deploy to production](../advanced/production-deployment) - Complete deployment guide
```

### Phase 4: **Automation & Self-Maintenance** (1-2 days)

#### ✅ 4.1 GitHub Actions Workflow
```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths: ['docs-site/**', 'docs/**', 'README.md']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build Docusaurus
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: docs-site/package-lock.json

      - name: Install dependencies
        run: |
          cd docs-site
          npm ci

      - name: Validate documentation
        run: |
          cd docs-site
          npm run validate:links
          npm run validate:examples

      - name: Build website
        run: |
          cd docs-site
          npm run build

      - name: Upload Build Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs-site/build

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### ✅ 4.2 Content Validation Scripts
```javascript
// docs-site/scripts/validate-links.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function validateInternalLinks() {
  const markdownFiles = glob.sync('docs/**/*.md');
  const errors = [];

  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const linkMatches = content.match(/\[.*?\]\((.*?)\)/g) || [];
    
    for (const link of linkMatches) {
      const url = link.match(/\((.*?)\)/)[1];
      if (url.startsWith('./') || url.startsWith('../')) {
        const linkPath = path.resolve(path.dirname(file), url);
        if (!fs.existsSync(linkPath)) {
          errors.push(`Broken link in ${file}: ${url}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('❌ Broken links found:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  }
  
  console.log('✅ All internal links validated successfully');
}

validateInternalLinks();
```

---

## 🚀 **Expected Results**

### **Developer Experience Improvements**
- ⚡ **Fast, searchable documentation** with instant results
- 📱 **Mobile-optimized** reading experience  
- 🖱️ **Interactive examples** with copy-paste code snippets
- 🎯 **Progressive disclosure** from beginner to advanced topics

### **Engineering Excellence Showcase**
- 🏗️ **Modern architecture** using React, TypeScript, and proven tooling
- 🔄 **Automated maintenance** with link validation and content checking
- 📊 **Performance optimized** with SSR, code splitting, and caching
- 🔍 **SEO excellence** for maximum discoverability

### **Self-Maintenance Features**
- ✅ **Automated deployment** on every commit to main branch
- 🔗 **Link validation** prevents broken internal/external links  
- 📝 **Content freshness** monitoring and automated updates
- 🤝 **Community contributions** through GitHub integration

This implementation leverages Docusaurus's proven architecture while showcasing sophisticated engineering practices across multiple disciplines - exactly what you're aiming for! 🎯