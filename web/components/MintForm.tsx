import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { generateImage } from '../lib/ai';
import { dataURLtoFile, uploadImage, uploadMetadata } from '../lib/ipfs';
import useContracts from '../hooks/useContracts';
import { MintFormData } from '../types';

export default function MintForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<MintFormData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [mintedNFT, setMintedNFT] = useState<{tokenId: string, txHash: string} | null>(null);
  const [showRoyalty, setShowRoyalty] = useState(false);
  
  const { mintNFT, setTokenRoyalty, isCorrectNetwork, switchToCorrectNetwork, isLoading, error } = useContracts();
  
  // Watch form values
  const formValues = watch();
  
  // Generate image from prompt
  const handleGenerateImage = async () => {
    if (!formValues.prompt) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGeneratedImage(null);
      
      const imageDataUrl = await generateImage({ prompt: formValues.prompt });
      setGeneratedImage(imageDataUrl);
      
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Reset the form
  const handleReset = () => {
    reset();
    setGeneratedImage(null);
    setMintedNFT(null);
    setShowRoyalty(false);
  };
  
  // Handle form submission
  const onSubmit = async (data: MintFormData) => {
    // Check network
    if (!isCorrectNetwork) {
      const switched = await switchToCorrectNetwork();
      if (!switched) {
        toast.error('Please connect to Polkadot Asset Hub Westend network');
        return;
      }
    }
    
    // Check if image was generated
    if (!generatedImage) {
      toast.error('Please generate an image first');
      return;
    }
    
    try {
      // Step 1: Upload image to IPFS
      setIsUploading(true);
      const imageFile = dataURLtoFile(generatedImage, 'dotcanvas.png');
      const imageCid = await uploadImage(imageFile);
      
      // Step 2: Upload metadata to IPFS
      const metadataCid = await uploadMetadata(
        data.name,
        data.description,
        imageCid,
        data.prompt
      );
      setIsUploading(false);
      
      // Step 3: Mint NFT
      setIsMinting(true);
      const tokenURI = `ipfs://${metadataCid}`;
      const result = await mintNFT(tokenURI);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to mint NFT');
      }
      
      // Set royalty if specified
      if (data.royaltyPercentage && data.royaltyPercentage > 0 && result.tokenId) {
        const royaltyResult = await setTokenRoyalty(
          result.tokenId,
          data.royaltyPercentage
        );
        
        if (!royaltyResult.success) {
          toast.error(`NFT minted, but failed to set royalty: ${royaltyResult.error}`);
        }
      }
      
      setMintedNFT({
        tokenId: result.tokenId || '',
        txHash: result.txHash || ''
      });
      
      toast.success('NFT minted successfully!');
      
      // Reset form but keep the image
      reset({
        prompt: '',
        name: '',
        description: '',
        royaltyPercentage: 0
      });
      
    } catch (error: any) {
      console.error('Error in mint process:', error);
      toast.error(error.message || 'Failed to mint NFT');
    } finally {
      setIsUploading(false);
      setIsMinting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Display error if any */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="p-8">
        <h3 className="text-2xl font-semibold mb-6">Create AI Artwork</h3>
        
        {/* Success message when NFT is minted */}
        {mintedNFT && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800">NFT Minted Successfully!</h4>
            <p className="text-sm text-green-700 mt-1">Token ID: {mintedNFT.tokenId}</p>
            <p className="text-sm text-green-700 mt-1">
              Transaction: {mintedNFT.txHash.slice(0, 10)}...{mintedNFT.txHash.slice(-8)}
            </p>
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-2 bg-white border border-green-500 text-green-600 rounded-md hover:bg-green-50"
            >
              Create Another
            </button>
          </div>
        )}
        
        {!mintedNFT && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Prompt for image generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Prompt
              </label>
              <div className="flex items-start space-x-2">
                <div className="flex-grow">
                  <textarea
                    {...register('prompt', { 
                      required: 'Prompt is required',
                      minLength: { value: 10, message: 'Prompt must be at least 10 characters' }
                    })}
                    placeholder="Describe the artwork you want to generate..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    disabled={isGenerating || isUploading || isMinting || isLoading}
                  />
                  {errors.prompt && (
                    <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isGenerating || isUploading || isMinting || isLoading}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : "Generate"}
                </button>
              </div>
            </div>
            
            {/* Display generated image */}
            {generatedImage && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Image</h4>
                <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage} 
                    alt="Generated artwork" 
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              </div>
            )}
            
            {/* NFT Details */}
            {generatedImage && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NFT Name
                  </label>
                  <input
                    {...register('name', { 
                      required: 'Name is required' 
                    })}
                    placeholder="Give your artwork a name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUploading || isMinting || isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' }
                    })}
                    placeholder="Describe your artwork"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    disabled={isUploading || isMinting || isLoading}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                
                {/* Royalty toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRoyalty"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={showRoyalty}
                    onChange={() => setShowRoyalty(!showRoyalty)}
                    disabled={isUploading || isMinting || isLoading}
                  />
                  <label htmlFor="enableRoyalty" className="ml-2 block text-sm text-gray-700">
                    Set royalty percentage (you'll receive this % on secondary sales)
                  </label>
                </div>
                
                {/* Royalty input */}
                {showRoyalty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Royalty Percentage (0-10%)
                    </label>
                    <input
                      type="number"
                      {...register('royaltyPercentage', { 
                        min: { value: 0, message: 'Minimum royalty is 0%' },
                        max: { value: 10, message: 'Maximum royalty is 10%' },
                        valueAsNumber: true
                      })}
                      placeholder="e.g. 5 for 5%"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isUploading || isMinting || isLoading}
                    />
                    {errors.royaltyPercentage && (
                      <p className="mt-1 text-sm text-red-600">{errors.royaltyPercentage.message}</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isUploading || isMinting || isLoading}
                  >
                    {isUploading ? 'Uploading to IPFS...' : 
                     isMinting ? 'Minting NFT...' : 
                     isLoading ? 'Processing...' : 'Mint NFT'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isUploading || isMinting || isLoading}
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
