---
sidebar_position: 1
---

# Quick Start

Get the AI-powered photo metadata application running in 5 minutes. This project showcases advanced AI-assisted development patterns and multi-agent collaboration workflows.

## What You're Building

This application demonstrates:
- **Multi-agent development workflow** with GitHub Copilot, Claude, and Gemini
- **AI-powered photo metadata generation** using Google Gemini Vision
- **Structured AI integration** with schema-enforced JSON responses
- **Modern React patterns** with TypeScript and Tailwind CSS
- **Service layer architecture** for clean API abstractions

## Prerequisites

- **Node.js 18+** and npm
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Code editor** (VS Code recommended for best AI agent integration)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/smugmug-api-reference-app
cd smugmug-api-reference-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## Configuration

Add your Google Gemini API key to `.env`:

```bash
# .env
API_KEY="your_google_gemini_api_key_here"
```

:::warning Security Note
Never commit your `.env` file to version control. The API key should remain secret.
:::

## Start Development

```bash
# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

## First Steps

1. **Upload a photo** using the file input
2. **Generate AI metadata** - watch as Gemini Vision analyzes the image
3. **Explore the code** - see how structured AI responses work
4. **Try batch processing** - upload multiple photos for automated tagging

## Understanding the Architecture

The application uses several key patterns that make AI integration reliable:

### Service Layer Pattern
```typescript
// All AI calls go through services/geminiService.ts
export const generatePhotoMetadata = async (
  image: File,
  customInstructions: string,
  apiKey: string
): Promise<ImageMetadata> => {
  // Structured response with schema enforcement
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text(); // Already validated JSON
};
```

### Schema-Enforced Responses
```typescript
const responseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    // ... more properties
  },
  required: ["title", "description", "keywords"]
};
```

This ensures the AI always returns predictable, parseable data.

## Next Steps

- **[Development Workflow](../ai-development/multi-agent-workflow)** - Learn the multi-agent development process
- **[AI Integration Patterns](../implementation/ai-integration)** - Understand structured AI responses  
- **[Component Architecture](../implementation/react-patterns)** - Explore the React + TypeScript patterns
- **[Service Layer Design](../implementation/service-layer)** - See how to abstract AI APIs

## Live Demo Features

Try these features in the running application:

- **Single Photo Analysis** - Upload and analyze individual photos
- **Batch Processing** - Automated metadata for multiple photos
- **Smart Album Matching** - AI-powered photo categorization
- **Custom Instructions** - Personalize AI behavior with prompts
- **Keyword Management** - Allow/deny lists for consistent tagging

---

**Ready to dive deeper?** Explore the multi-agent development workflow that created this application.