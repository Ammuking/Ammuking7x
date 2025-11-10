import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateImageFromText = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `4K, photorealistic, ultra-detailed: ${prompt}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image generated from text prompt.");
    }
  } catch (error) {
    console.error("Error generating image from text:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const generateImageWithReference = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image generated with reference.");
  } catch (error) {
    console.error("Error generating image with reference:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const upscaleImage = async (imageUrl: string): Promise<string> => {
  try {
    const [header, imageBase64] = imageUrl.split(',');
    if (!header || !imageBase64) {
        throw new Error("Invalid image URL format for upscaling.");
    }
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Could not determine MIME type from image URL.");
    }
    const mimeType = mimeTypeMatch[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Upscale this image to 4K ultra-high resolution. Enhance details, sharpness, and clarity without altering the original composition or subject.",
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No upscaled image was generated.");
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw new Error("Failed to upscale image. Please try again.");
  }
};