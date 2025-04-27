import React, { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { generateImage, blobToFile } from '../ai';
import { uploadImage, uploadMetadata } from '../ipfs';
import { AI_CONFIG, STORAGE_CONFIG } from '../config';
import EnvChecker from './EnvChecker';

interface MintFormProps {
  onMintSuccess: () => void;
  nftContract: any;
}

interface FormData {
  name: string;
  description: string;
  prompt: string;
}

const MintForm: React.FC<MintFormProps> = ({ onMintSuccess, nftContract }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    prompt: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.prompt.trim()) {
      errors.prompt = 'Prompt is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationProgress(10); // Initial progress indicator
      
      // Simulate progress steps while waiting for the API
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 5;
          // Cap at 90% until we get actual response
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Generate image using AI
      const imageBlob = await generateImage({
        prompt: formData.prompt,
      });
      
      clearInterval(progressInterval);
      setGenerationProgress(100); // Complete progress
      
      setGeneratedImage(imageBlob);
      
      // Create a preview URL for the blob
      const previewUrl = URL.createObjectURL(imageBlob);
      setImagePreviewUrl(previewUrl);
      
      setTimeout(() => {
        setIsGenerating(false);
      }, 500); // Slight delay to show 100% progress
    } catch (error) {
      console.error('Error generating image:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate image. Please try again.');
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Handle minting
  const handleMint = async () => {
    if (!generatedImage || !nftContract.connected) return;
    
    try {
      setIsMinting(true);
      
      // Generate a unique temporary ID for this minting process
      // This will be replaced by the actual token ID after minting
      const tempTokenId = `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Convert blob to file
      const imageFile = blobToFile(generatedImage, `${formData.name.replace(/\s+/g, '-')}.png`);
      
      // Upload image to IPFS with temp token ID
      const imageCid = await uploadImage(imageFile, tempTokenId);
      
      // Upload metadata to IPFS with temp token ID
      const metadataURI = await uploadMetadata({
        name: formData.name,
        description: formData.description,
        image: imageCid,
        attributes: [
          {
            trait_type: 'Prompt',
            value: formData.prompt
          }
        ]
      }, tempTokenId);
      
      // Mint NFT
      const tokenId = await nftContract.mintNFT(metadataURI);
      
      // If we got a valid token ID back, we could update the collection
      // with the actual token ID, but this is optional since the temp ID works fine
      
      if (tokenId !== null) {
        // Reset form and state
        setFormData({
          name: '',
          description: '',
          prompt: ''
        });
        setGeneratedImage(null);
        setImagePreviewUrl('');
        onMintSuccess();
      }
      
      setIsMinting(false);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setIsMinting(false);
    }
  };

  const handleCancel = () => {
    setGeneratedImage(null);
    setImagePreviewUrl('');
    setGenerationError(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prompt: ''
    });
    setFormErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Environment Variable Checker */}
      <EnvChecker />
      
      {!generatedImage ? (
        /* Image Generation Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="NFT Name"
              value={formData.name}
              onChange={handleChange}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form-input"
              placeholder="Describe your NFT"
              value={formData.description}
              onChange={handleChange}
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
              AI Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={4}
              className="form-input"
              placeholder="Describe the image you want to generate"
              value={formData.prompt}
              onChange={handleChange}
            />
            {formErrors.prompt && (
              <p className="mt-1 text-sm text-red-500">{formErrors.prompt}</p>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>
          
          {/* Generation Progress Bar */}
          {isGenerating && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-300">Generating Image</span>
                <span className="text-sm font-medium text-blue-300">{generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Please wait while we create your artwork...</p>
            </div>
          )}
          
          {/* Error Message */}
          {generationError && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-sm text-red-300">
                <span className="font-bold">Error:</span> {generationError}
              </p>
              <p className="text-xs text-red-400 mt-1">
                Please check your connection or try a different prompt.
              </p>
            </div>
          )}
        </form>
      ) : (
        /* Preview and Mint Form */
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Preview Your NFT</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Preview */}
            <div className="relative h-64 w-64 mx-auto md:mx-0 rounded-lg overflow-hidden">
              {imagePreviewUrl && (
                <Image
                  src={imagePreviewUrl}
                  alt="Generated artwork"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
            
            {/* NFT Details */}
            <div className="flex-1">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400">Name</h4>
                <p className="text-white">{formData.name}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400">Description</h4>
                <p className="text-white">{formData.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">AI Prompt</h4>
                <p className="text-white">{formData.prompt}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={isMinting}
              className="flex-1 btn-secondary"
            >
              Generate New Image
            </button>
            <button
              onClick={handleMint}
              disabled={isMinting}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {isMinting ? (
                <>
                  <div className="mr-2 animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Minting...
                </>
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintForm; 