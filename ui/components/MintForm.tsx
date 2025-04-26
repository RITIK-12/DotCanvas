import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { generateImage, blobToFile } from '../ai';
import { uploadImage, uploadMetadata } from '../ipfs';

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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);
      // Generate image using AI
      const imageBlob = await generateImage({
        prompt: data.prompt,
      });
      setGeneratedImage(imageBlob);
      
      // Create a preview URL for the blob
      const previewUrl = URL.createObjectURL(imageBlob);
      setImagePreviewUrl(previewUrl);
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
    }
  };

  // Handle minting
  const handleMint = async (data: FormData) => {
    if (!generatedImage || !nftContract.connected) return;
    
    try {
      setIsMinting(true);
      
      // Convert blob to file
      const imageFile = blobToFile(generatedImage, `${data.name.replace(/\s+/g, '-')}.png`);
      
      // Upload image to IPFS
      const imageCid = await uploadImage(imageFile);
      
      // Upload metadata to IPFS
      const metadataURI = await uploadMetadata({
        name: data.name,
        description: data.description,
        image: imageCid,
        attributes: [
          {
            trait_type: 'Prompt',
            value: data.prompt
          }
        ]
      });
      
      // Mint NFT
      const tokenId = await nftContract.mintNFT(metadataURI);
      
      if (tokenId !== null) {
        // Reset form and state
        reset();
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
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg">
      {!generatedImage ? (
        /* Image Generation Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="NFT Name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="form-input"
              placeholder="Describe your NFT"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
              AI Prompt
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="form-input"
              placeholder="Describe the image you want to generate"
              {...register('prompt', { required: 'Prompt is required' })}
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-red-500">{errors.prompt.message}</p>
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
                <p className="text-white">{(useForm().getValues() as any).name}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400">Description</h4>
                <p className="text-white">{(useForm().getValues() as any).description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">AI Prompt</h4>
                <p className="text-white">{(useForm().getValues() as any).prompt}</p>
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
              onClick={handleSubmit(handleMint)}
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