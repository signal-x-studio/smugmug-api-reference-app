import React from 'react';
import { IconFileText, IconX } from './Icons';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-3xl font-bold text-white mt-8 mb-4 border-b border-slate-700 pb-2">{children}</h2>;
const DocSubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-2xl font-semibold text-cyan-400 mt-6 mb-3">{children}</h3>;
const DocParagraph: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>;
const DocCode: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-slate-700 text-cyan-300 text-sm p-1 rounded-md font-mono">{children}</code>;
const DocCodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => <pre className="bg-slate-900 text-sm p-4 rounded-lg overflow-x-auto border border-slate-700"><code className="font-mono text-slate-300">{children}</code></pre>;
const DocListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <li className="text-slate-300 mb-2 ml-4">{children}</li>;


export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-title"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <IconFileText className="w-7 h-7 text-cyan-400" />
                <h2 id="docs-title" className="text-2xl font-bold text-white">Developer Documentation</h2>
            </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close Documentation">
            <IconX className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <DocHeader>Introduction</DocHeader>
            <DocParagraph>
                Welcome to the SmugMug API Reference App! This application serves as a practical, hands-on guide for developers looking to build powerful applications on top of the SmugMug platform. It demonstrates key API patterns, from data fetching and manipulation to advanced AI integration using the Google Gemini API.
            </DocParagraph>
            <DocParagraph>
                The goal is to provide a solid foundation and inspiration for your own projects by showcasing what's possible and providing clear, referenceable code for common workflows.
            </DocParagraph>

            <DocHeader>Core Concepts: SmugMug API</DocHeader>
            <DocSubHeader>Authentication: The OAuth 1.0a Requirement</DocSubHeader>
            <DocParagraph>
                The most critical concept to understand is that the SmugMug API uses OAuth 1.0a for authentication. This is a secure protocol that requires API requests to be "signed" using a combination of your app's keys and the user's access tokens.
            </DocParagraph>
            <DocParagraph>
                Crucially, this signing process requires a <DocCode>Client Secret</DocCode> and an <DocCode>Access Token Secret</DocCode>, which **must never be exposed in a client-side application**. Therefore, any production application must have a **server-side backend** that acts as a proxy.
            </DocParagraph>
            <ul className="list-disc space-y-2">
                <DocListItem>The client (this React app) makes a request to your backend.</DocListItem>
                <DocListItem>Your backend receives the request, adds the necessary OAuth parameters, signs it with the secrets, and forwards it to the SmugMug API.</DocListItem>
                <DocListItem>The backend receives the response from SmugMug and passes it back to the client.</DocListItem>
            </ul>
             <DocParagraph>
                This application uses <DocCode>services/mockSmugMugService.ts</DocCode> to simulate API calls for easy development. However, <DocCode>services/smugmugService.ts</DocCode> contains a complete, client-side implementation of the OAuth 1.0a signing logic, which you can adapt for your server (e.g., in Node.js, Python, or Go).
            </DocParagraph>
            
            <DocSubHeader>Nodes vs. Content</DocSubHeader>
            <DocParagraph>
                The SmugMug API uses a "Node" system to represent the user's organizational hierarchy (folders and albums). You interact with <DocCode>/api/v2/node/...</DocCode> to fetch this structure. To interact with the *content* (images, videos, metadata) within an album, you use the specific URI for that Album or Image, such as <DocCode>/api/v2/album/...</DocCode> or <DocCode>/api/v2/image/...</DocCode>.
            </DocParagraph>


            <DocHeader>Application Architecture</DocHeader>
            <DocParagraph>
                The application follows a standard React functional component structure with a clear separation of concerns.
            </DocParagraph>
            <DocSubHeader>The `services/` Directory</DocSubHeader>
            <DocParagraph>
                This is the heart of the application's logic, responsible for all external communication.
            </DocParagraph>
            <ul className="list-disc">
                <DocListItem><DocCode>mockSmugMugService.ts</DocCode>: Simulates SmugMug API responses with a slight delay. This is the default service used for this reference app, allowing it to run without a backend.</DocListItem>
                <DocListItem><DocCode>smugmugService.ts</DocCode>: A blueprint for a real implementation. It contains the logic for making signed API calls. In a real app, this logic would live on your server.</DocListItem>
                <DocListItem><DocCode>geminiService.ts</DocCode>: Handles all communication with the Google Gemini API for AI-powered features.</DocListItem>
            </ul>
            
            <DocSubHeader>The `components/` Directory</DocSubHeader>
            <DocParagraph>Contains all the reusable UI components, from simple buttons (<DocCode>Icons.tsx</DocCode>) to complex modals (<DocCode>PhotoDetailModal.tsx</DocCode>).</DocParagraph>

            <DocSubHeader>`App.tsx`</DocSubHeader>
            <DocParagraph>The main application component. It is responsible for orchestrating all state management using React hooks (<DocCode>useState</DocCode>, <DocCode>useCallback</DocCode>, etc.), fetching data via the services, and passing data down to the child components.</DocParagraph>
            
            <DocHeader>Feature Deep Dive: AI Integration</DocHeader>
            <DocParagraph>
                This application showcases three distinct and powerful patterns for integrating vision AI.
            </DocParagraph>
            
            <DocSubHeader>1. Single Photo Analysis (Structured Data)</DocSubHeader>
            <DocParagraph>
                The most common use case: analyzing a single photo to generate a title, description, and keywords. The key to making this reliable is forcing the AI to return a specific JSON structure. This is achieved using the Gemini API's <DocCode>responseSchema</DocCode> feature.
            </DocParagraph>
            <DocCodeBlock>
{`// In services/geminiService.ts -> generatePhotoMetadata()

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    }
  },
  required: ["title", "description", "keywords"],
};

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: { parts: [textPart, imagePart] },
  config: {
    responseMimeType: "application/json",
    responseSchema: responseSchema, // This is the key!
  },
});

const parsedData = JSON.parse(response.text.trim());`}
            </DocCodeBlock>

            <DocSubHeader>2. Image Classification for Smart Albums</DocSubHeader>
            <DocParagraph>
                The "Smart Album" feature uses a different AI pattern: classification. Instead of asking for creative text, we ask a simple yes/no question: "Does this image match the user's prompt?". Again, we use a <DocCode>responseSchema</DocCode> to ensure we get a clean boolean response.
            </DocParagraph>
             <DocCodeBlock>
{`// In services/geminiService.ts -> doesImageMatchPrompt()

const promptText = \`...does this image fit? Respond with only a boolean in JSON format. User Request: "\${userPrompt}"\`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        match: { type: Type.BOOLEAN }
    },
    required: ["match"],
};
// ... API call ...
const parsedData = JSON.parse(response.text.trim());
return parsedData.match === true;`}
            </DocCodeBlock>
            <DocParagraph>The application then iterates through all user photos, calls this function for each one, and collects the URIs of the matching photos into a new album.</DocParagraph>

            <DocSubHeader>3. Multi-Image Analysis for Album Storytelling</DocSubHeader>
            <DocParagraph>
                The "AI Album Storyteller" is the most advanced pattern. It sends multiple images (up to 15 in this implementation) in a single API call. The prompt asks the AI to act as a curator, analyzing the entire collection to find a cohesive theme and narrative. This demonstrates how to move beyond single-asset analysis to understand context across a collection.
            </DocParagraph>
             <DocCodeBlock>
{`// In services/geminiService.ts -> generateAlbumStory()

const promptText = \`You are a professional photo curator... analyze a collection of images from a single album and create a cohesive narrative...\`;

// Send multiple image parts in one call
const imageParts = await Promise.all(
  photos.slice(0, 15).map(p => urlToGenerativePart(p.imageUrl, "image/jpeg"))
);

const response = await ai.models.generateContent({
  model: model,
  contents: { parts: [textPart, ...imageParts] }, // Note the array of images
  config: { ... }
});`}
            </DocCodeBlock>
            
            <DocHeader>How to Extend This App</DocHeader>
            <DocParagraph>
                This app is just the beginning. The SmugMug API offers many more capabilities. Here are some ideas for new features you could build:
            </DocParagraph>
            <ul className="list-disc">
                <DocListItem><strong>Client Proofing Dashboard:</strong> Use the <DocCode>!hearts</DocCode> expansion on an image to see which clients have "favorited" photos in a proofing gallery.</DocListItem>
                <DocListItem><strong>E-commerce Analytics:</strong> Use the <DocCode>/api/v2/user/...!orders</DocCode> endpoint to build a dashboard that tracks print and digital sales.</DocListItem>
                <DocListItem><strong>Bulk Security Manager:</strong> Fetch all albums in a folder and use <DocCode>PATCH</DocCode> requests to apply consistent security settings (passwords, visibility) or watermarks.</DocListItem>
                <DocListItem><strong>Interactive Photo Map:</strong> Read GPS data from photos using the <DocCode>!gps</DocCode> expansion and display them on a map. You could even feed the coordinates to an AI to automatically tag the location!</DocListItem>
            </ul>
        </div>
      </div>
    </div>
  );
};
