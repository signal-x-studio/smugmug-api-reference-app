import { GoogleGenAI, Type } from "@google/genai";
import { AiData, Photo, AlbumStory } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function urlToGenerativePart(url: string, mimeType: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
  return {
    inlineData: {
      mimeType,
      data: base64,
    },
  };
}


export async function generatePhotoMetadata(
  imageUrl: string, 
  customInstructions?: string,
  keywordDenylist?: string,
  keywordPreferredlist?: string
): Promise<AiData> {
  const model = 'gemini-2.5-flash';
  
  let userInstructions = '';

  if (customInstructions && customInstructions.trim() !== '') {
    userInstructions += `Overall Style Guide:\n${customInstructions.trim()}\n\n`;
  }
  if (keywordDenylist && keywordDenylist.trim() !== '') {
    userInstructions += `Keyword Denylist: NEVER use any of the following keywords in the 'keywords' array: ${keywordDenylist.trim()}.\n\n`;
  }
  if (keywordPreferredlist && keywordPreferredlist.trim() !== '') {
    userInstructions += `Preferred Keywords: If relevant to the image content, please prioritize including some of the following keywords: ${keywordPreferredlist.trim()}.\n\n`;
  }

  let promptText = `Analyze this image and generate metadata for a photo-sharing site like SmugMug. Provide a creative but concise title, a detailed description, and a list of relevant keywords. Keywords should include objects, concepts, colors, and potential categories.`;

  if (userInstructions) {
    promptText = `IMPORTANT: Follow these user-provided instructions for generating the metadata:\n---\n${userInstructions}---\n\nBased on the instructions above, perform the following task:\n${promptText}`;
  }

  const textPart = {
    text: promptText,
  };

  const imagePart = await urlToGenerativePart(imageUrl, "image/jpeg");

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A creative yet concise title for the photograph (around 5-10 words)."
      },
      description: {
        type: Type.STRING,
        description: "A detailed description of the image content, including the scene, subjects, mood, and any notable visual elements."
      },
      keywords: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "An array of relevant keywords or tags for the image, covering objects, themes, colors, and concepts."
      }
    },
    required: ["title", "description", "keywords"],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.title || !parsedData.description || !Array.isArray(parsedData.keywords)) {
      throw new Error("Invalid data structure received from AI.");
    }
    
    return parsedData as AiData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate metadata from Gemini API.");
  }
}

export async function doesImageMatchPrompt(
    imageUrl: string,
    userPrompt: string
): Promise<boolean> {
    const model = 'gemini-2.5-flash';
    
    const promptText = `You are an AI photo curator. The user wants to find photos that match a specific theme. Based on the user's request, does this image fit? Respond with only a boolean in JSON format. User Request: "${userPrompt}"`;

    const textPart = { text: promptText };
    const imagePart = await urlToGenerativePart(imageUrl, "image/jpeg");

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            match: {
                type: Type.BOOLEAN,
                description: "Whether the image matches the user's description."
            }
        },
        required: ["match"],
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        return parsedData.match === true;
    } catch (error) {
        console.error("Error in doesImageMatchPrompt:", error);
        // Default to false in case of an error to avoid incorrect inclusions.
        return false;
    }
}


export async function generateAlbumStory(photos: Photo[]): Promise<AlbumStory> {
  const model = 'gemini-2.5-flash';

  const promptText = `You are a professional photo curator and storyteller for the SmugMug platform. Your task is to analyze a collection of images from a single album and create a cohesive narrative and marketing copy for it.
  
Based on all the images provided, generate the following:
1.  **title**: An engaging, SEO-friendly title for the album.
2.  **description**: A compelling story-driven description for a blog post or gallery page. It should weave a narrative that connects the photos, describes the overall mood, theme, and location or subject matter.
3.  **keywords**: A list of 5-10 high-level keywords that represent the entire collection for SEO purposes.`;

  const textPart = { text: promptText };
  // Limit to the first 15 images to avoid overly large requests
  const imageParts = await Promise.all(
    photos.slice(0, 15).map(p => urlToGenerativePart(p.imageUrl, "image/jpeg"))
  );
  
  if(imageParts.length === 0) {
      throw new Error("Cannot generate a story for an empty album.");
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The engaging, SEO-friendly title for the entire album."
      },
      description: {
        type: Type.STRING,
        description: "The compelling, story-driven description for the album, suitable for a blog post."
      },
      keywords: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "An array of 5-10 high-level keywords representing the entire collection."
      }
    },
    required: ["title", "description", "keywords"],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, ...imageParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    return parsedData as AlbumStory;

  } catch (error) {
    console.error("Error calling Gemini API for album story:", error);
    throw new Error("Failed to generate album story from Gemini API.");
  }
}