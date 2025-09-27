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

<details>
<summary>📋 Click to copy installation commands</summary>

```bash
# Clone the repository
git clone https://github.com/signal-x-studio/smugmug-api-reference-app
cd smugmug-api-reference-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

</details>

## Configuration

Add your Google Gemini API key to `.env`:

<details>
<summary>🔑 Environment Configuration</summary>

```bash
# .env
API_KEY="your_google_gemini_api_key_here"
```

:::tip Get Your API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account  
3. Click "Create API Key"
4. Copy the generated key into your `.env` file
:::

</details>

:::warning Security Note
Never commit your `.env` file to version control. The API key should remain secret.
:::

## Start Development

<details>
<summary>🚀 Development Commands</summary>

```bash
# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

You should see the application interface with photo upload capabilities.

</details>

## Interactive Demo

Try these features in the running application:

### 🖼️ **Single Photo Analysis**
1. Click the file input to upload a photo
2. Watch as Gemini Vision analyzes the image
3. See structured metadata generated with titles, descriptions, and keywords

### 📸 **Batch Processing** 
1. Upload multiple photos using the batch upload feature
2. Enable automation mode for continuous processing
3. Monitor progress with the activity feed

### 🎯 **Smart Album Matching**
1. Create a custom album prompt (e.g., "outdoor landscapes")  
2. Upload photos to test smart categorization
3. See confidence scores and reasoning

### ⚙️ **Custom Instructions**
1. Open settings and add custom instructions
2. Try prompts like "Focus on artistic composition" 
3. Compare results with default analysis

## Understanding the Architecture

The application uses several key patterns that make AI integration reliable:

<details>
<summary>📚 Core Architecture Patterns</summary>

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

</details>

## Next Steps

<div className="row">
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>🤖 Learn the Workflow</h3>
      </div>
      <div className="card__body">
        <p>Discover how this was built using multi-agent development patterns</p>
      </div>
      <div className="card__footer">
        <a href="../ai-development/multi-agent-workflow" className="button button--primary">Multi-Agent Development →</a>
      </div>
    </div>
  </div>
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>⚛️ Explore Patterns</h3>
      </div>
      <div className="card__body">
        <p>Understand structured AI integration and React architecture</p>
      </div>
      <div className="card__footer">
        <a href="../implementation/ai-integration" className="button button--primary">Implementation Patterns →</a>
      </div>
    </div>
  </div>
</div>

## Live Demo Features Summary

| Feature | Description | Try It |
|---------|-------------|---------|
| **Photo Analysis** | AI-powered metadata generation | Upload any image |
| **Batch Processing** | Automated multi-photo handling | Upload 3+ photos |
| **Smart Matching** | Album categorization with confidence | Create album prompt |
| **Custom Instructions** | Personalized AI behavior | Modify settings |
| **Mock Service** | Development without API dependencies | Works offline |

---

**Ready to dive deeper?** Explore the multi-agent development workflow that created this application.