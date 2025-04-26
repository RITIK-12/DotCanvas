// AI service utilities for DotCanvas
import { AI_CONFIG, DEFAULT_IMAGE_PARAMS } from './config';

// Interface for image generation parameters
export interface ImageGenerationParams {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
  samples?: number;
}

/**
 * Generates an image using Stable Diffusion XL
 * @param params - The image generation parameters
 * @returns A blob of the generated image
 */
export async function generateImage(params: ImageGenerationParams): Promise<Blob> {
  try {
    const apiKey = AI_CONFIG.apiKey;
    if (!apiKey) {
      throw new Error('API key not configured for image generation');
    }
    
    // Merge default parameters with provided parameters
    const generationParams = {
      prompt: params.prompt,
      width: params.width || DEFAULT_IMAGE_PARAMS.width,
      height: params.height || DEFAULT_IMAGE_PARAMS.height,
      steps: params.steps || DEFAULT_IMAGE_PARAMS.steps,
      cfg_scale: params.cfgScale || DEFAULT_IMAGE_PARAMS.cfgScale,
      samples: params.samples || DEFAULT_IMAGE_PARAMS.samples,
    };
    
    // If using local service
    if (AI_CONFIG.localService) {
      return generateImageLocal(generationParams);
    }
    
    // If using Stability AI API
    return generateImageStabilityAI(generationParams, apiKey);
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generates an image using a local AI service
 * @param params - The image generation parameters
 * @returns A blob of the generated image
 */
async function generateImageLocal(params: any): Promise<Blob> {
  try {
    const response = await fetch(AI_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    
    // The local API returns the image directly as a blob
    return await response.blob();
  } catch (error) {
    console.error('Error generating image locally:', error);
    throw error;
  }
}

/**
 * Generates an image using Stability AI's API
 * @param params - The image generation parameters
 * @param apiKey - The Stability AI API key
 * @returns A blob of the generated image
 */
async function generateImageStabilityAI(params: any, apiKey: string): Promise<Blob> {
  try {
    const body = {
      text_prompts: [
        {
          text: params.prompt,
          weight: 1
        }
      ],
      cfg_scale: params.cfg_scale,
      height: params.height,
      width: params.width,
      samples: params.samples,
      steps: params.steps,
    };
    
    const response = await fetch(AI_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Stability AI request failed: ${errorData.message || response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract the base64 image from the response
    const base64Image = responseData.artifacts[0].base64;
    const byteCharacters = atob(base64Image);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: 'image/png' });
  } catch (error) {
    console.error('Error generating image with Stability AI:', error);
    throw error;
  }
}

/**
 * Converts a Blob to a File object
 * @param blob - The blob to convert
 * @param filename - The filename to use
 * @returns A File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
} 