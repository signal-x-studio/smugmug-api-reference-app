---
sidebar_position: 2
---

# Installation & Setup

Complete setup guide for the AI development showcase application, including environment configuration and development tools.

## System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Recommended Development Environment

- **VS Code** with GitHub Copilot extension (for optimal AI-assisted development)
- **Terminal/Command Prompt** with color support
- **Google Chrome DevTools** for debugging and performance analysis

## Step 1: Clone the Repository

```bash
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- **React 19** - Modern UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **@google/genai** - Google Gemini AI integration

## Step 3: Environment Configuration

### Create Environment File

```bash
cp .env.example .env
```

### Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Configure Environment Variables

Edit your `.env` file:

```bash
# .env
API_KEY="your_google_gemini_api_key_here"
```

:::warning Important Security Notes
- Never commit your `.env` file to version control
- Keep your API key secure and don't share it
- The application will not function without a valid API key
:::

## Step 4: Verify Installation

### Start Development Server

```bash
npm run dev
```

You should see output similar to:
```
  VITE v5.4.10  ready in 200 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Test the Application

1. Open http://localhost:5173 in your browser
2. You should see the SmugMug API Reference App interface
3. Try uploading a photo to test AI functionality

## Development Scripts

The project includes several npm scripts for development:

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type checking (TypeScript)
npx tsc --noEmit
```

## Project Structure

After installation, your project structure will look like this:

```
smugmug-api-reference-app/
├── components/           # React UI components
│   ├── PhotoCard.tsx    # Individual photo display
│   ├── ImageGrid.tsx    # Photo grid layout
│   ├── AlbumList.tsx    # Album navigation
│   └── ...              # More components
├── services/            # API integration layer
│   ├── geminiService.ts # AI/Gemini integration
│   ├── mockSmugMugService.ts # Development mock service
│   └── smugmugService.ts # OAuth reference implementation
├── docs/                # Comprehensive documentation
├── docs-site/           # Docusaurus documentation site
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── .env                 # Environment variables (you create this)
└── package.json         # Project configuration
```

## Troubleshooting

### Common Issues

**Issue**: `npm install` fails with permission errors
```bash
# Solution: Use npx or fix npm permissions
npx npm install
```

**Issue**: "API_KEY is not defined" error
```bash
# Solution: Ensure .env file exists and contains valid API key
echo 'API_KEY="your_key_here"' > .env
```

**Issue**: TypeScript errors in development
```bash
# Solution: Check TypeScript configuration
npx tsc --noEmit
```

**Issue**: Vite dev server won't start
```bash
# Solution: Check if port 5173 is available, or use different port
npm run dev -- --port 3000
```

### Development Tools Setup

For the best development experience with AI agents:

1. **Install VS Code Extensions**:
   - GitHub Copilot
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

2. **Configure Git** (if not already done):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Optional: Install Gemini CLI** for advanced AI development:
   ```bash
   # This requires additional setup - see AI Development section
   ```

## Next Steps

Once installation is complete:

1. **[Quick Start Guide](./quick-start)** - Get running immediately
2. **[AI Integration Patterns](../implementation/ai-integration)** - Learn the system design
3. **[Multi-Agent Development](../ai-development/multi-agent-workflow)** - See how this was built with AI

---

**Installation complete!** You're ready to explore AI-assisted development patterns and structured AI integration.