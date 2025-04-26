/**
 * This module handles the AI image generation functionality
 * It supports both a local server option and external API (Stability.ai) 
 */

// Utility function to convert ArrayBuffer to base64 string (browser-compatible)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

type GenerationOptions = {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
};

/**
 * Generate an AI image using Stable Diffusion
 * This will either call a local server or use Stability.ai API based on environment config
 * 
 * @param options Generation options including prompt, size, etc.
 * @returns Promise resolving to a data URL of the generated image
 */
export async function generateImage(options: GenerationOptions): Promise<string> {
  // Default values
  const defaults = {
    width: 512,
    height: 512,
    steps: 30,
    cfgScale: 7,
    negativePrompt: "blurry, bad anatomy, extra limbs, poorly drawn face, distorted, ugly"
  };
  
  // Merge options with defaults
  const params = { ...defaults, ...options };

  // Check if we should use local GPU or external API
  const useLocalGpu = process.env.LOCAL_GPU === 'true';

  if (useLocalGpu) {
    return generateImageLocally(params);
  } else {
    return generateImageWithStabilityApi(params);
  }
}

/**
 * Generate image using local Stable Diffusion server
 */
async function generateImageLocally(params: Required<GenerationOptions>): Promise<string> {
  try {
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        width: params.width,
        height: params.height,
        num_inference_steps: params.steps,
        guidance_scale: params.cfgScale,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.detail || response.statusText}`);
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error('Error generating image locally:', error);
    throw new Error('Failed to generate image on local server');
  }
}

/**
 * Generate image using Stability.ai API
 */
async function generateImageWithStabilityApi(params: Required<GenerationOptions>): Promise<string> {
  // Get the API key from environment variable
  const apiKey = process.env.DREAMSTUDIO_API_KEY;
  
  if (!apiKey) {
    throw new Error('Stability API key not found in environment variables. Please set DREAMSTUDIO_API_KEY in your .env file.');
  }
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('prompt', params.prompt);
    formData.append('output_format', 'webp');
    
    // Optional parameters
    if (params.width && params.height) {
      formData.append('size', `${params.width}x${params.height}`);
    }
    
    // Stability.ai v2beta API endpoint
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Convert the binary response to a base64 string
    const imageBuffer = await response.arrayBuffer();
    const base64Image = arrayBufferToBase64(imageBuffer);
    
    // Return as data URL with appropriate mime type
    return `data:image/webp;base64,${base64Image}`;
  } catch (error) {
    console.error('Error generating image with Stability API:', error);
    throw new Error('Failed to generate image with Stability API');
  }
}
