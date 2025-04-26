from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
from PIL import Image
import torch
import os
from typing import Optional, List

# Initialize FastAPI app
app = FastAPI(title="DotCanvas AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if we have GPU support
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {DEVICE}")

# Model variables
model = None
pipe = None

class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "blurry, low quality, distorted, deformed, disfigured"
    width: Optional[int] = 512
    height: Optional[int] = 512
    steps: Optional[int] = 30
    cfgScale: Optional[float] = 7.0
    sampler: Optional[str] = "K_EULER_ANCESTRAL"
    samples: Optional[int] = 1

class GenerationResponse(BaseModel):
    image: str
    seed: int

def load_model():
    """Load the Stable Diffusion XL model."""
    global model, pipe
    
    if model is not None:
        return
    
    try:
        from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
        
        # Load SDXL-Lightning 2-step model for fast inference
        pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/sdxl-lightning",
            torch_dtype=torch.float16,
            variant="fp16",
        )
        
        # Use DPMSolver for faster generation
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            pipe.scheduler.config, 
            algorithm_type="sde-dpmsolver++",
            use_karras_sigmas=True
        )
        
        # Move to GPU if available
        pipe = pipe.to(DEVICE)
        
        # Optimize for memory
        if DEVICE == "cuda":
            pipe.enable_model_cpu_offload()
            
        model = pipe
        print("Model loaded successfully")
        
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

@app.get("/")
def read_root():
    return {"message": "DotCanvas AI Image Generation Service"}

@app.post("/generate", response_model=GenerationResponse)
async def generate_image(request: GenerationRequest, background_tasks: BackgroundTasks):
    # Load model in background if not already loaded
    if model is None:
        background_tasks.add_task(load_model)
        load_model()  # Blocking call for first request
    
    try:
        # Generate image
        result = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            width=request.width,
            height=request.height,
            num_inference_steps=request.steps,
            guidance_scale=request.cfgScale,
            num_images_per_prompt=request.samples,
        )
        
        # Get the image
        image = result.images[0]
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Return image as data URL
        return GenerationResponse(
            image=f"data:image/png;base64,{img_str}",
            seed=result.seed
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
