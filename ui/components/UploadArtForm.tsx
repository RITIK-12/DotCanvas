import React, { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { uploadFile, uploadMetadata } from '../ipfs';

interface UploadArtFormProps {
  onMintSuccess: () => void;
  nftContract: any;
  marketContract?: any;
}

interface FormData {
  name: string;
  description: string;
  price: string;
}

const UploadArtForm: React.FC<UploadArtFormProps> = ({ 
  onMintSuccess, 
  nftContract, 
  marketContract 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isMinting, setIsMinting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setUploadError(null);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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

    if (formData.price.trim()) {
      // If price is provided, validate it's a positive number
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        errors.price = 'Price must be a positive number';
      }
    }

    if (!selectedImage) {
      setUploadError('Please select an image to upload');
      return false;
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

    if (!selectedImage || !nftContract.connected) {
      return;
    }
    
    try {
      setIsMinting(true);
      
      // Upload image to IPFS
      const imageCid = await uploadFile(selectedImage);
      
      // Upload metadata to IPFS
      const metadataURI = await uploadMetadata({
        name: formData.name,
        description: formData.description,
        image: imageCid,
        attributes: [
          {
            trait_type: "Source",
            value: "User Uploaded"
          },
          {
            trait_type: "Price",
            value: formData.price ? `${formData.price} DOT` : "Not for sale"
          }
        ]
      });
      
      // Mint NFT
      const tokenId = await nftContract.mintNFT(metadataURI);
      
      // If a price was set and we successfully minted, auto-list the NFT
      if (tokenId !== null && formData.price.trim()) {
        try {
          // List the NFT on the marketplace
          console.log(`Listing NFT #${tokenId} for ${formData.price} DOT`);
          
          if (marketContract) {
            await marketContract.listNFT(tokenId, formData.price);
            console.log(`NFT #${tokenId} successfully listed for ${formData.price} DOT`);
          }
        } catch (listingError) {
          console.error('Error listing NFT:', listingError);
          // We don't throw here because the NFT was successfully minted
        }
      }
      
      // Reset form and state after successful mint
      if (tokenId !== null) {
        setFormData({
          name: '',
          description: '',
          price: ''
        });
        setSelectedImage(null);
        setImagePreviewUrl('');
        onMintSuccess();
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setUploadError('Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Mint Your Art</h3>
          <p className="text-sm text-gray-400 mb-4">
            Turn your AI-generated artwork into a blockchain NFT on Polkadot. Upload your image and mint it directly.
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Artwork Image
          </label>

          {!imagePreviewUrl ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Upload an image</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src={imagePreviewUrl}
                  alt="Preview"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreviewUrl('');
                }}
                className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {uploadError && (
            <p className="mt-1 text-sm text-red-500">{uploadError}</p>
          )}
        </div>

        {/* NFT Metadata */}
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
          <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
            List Price (DOT) <span className="text-xs text-gray-400">(Optional)</span>
          </label>
          <div className="flex items-center">
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="Set a price to automatically list your NFT"
              value={formData.price}
              onChange={handleChange}
            />
            <span className="ml-2 text-sm font-medium text-indigo-300">DOT</span>
          </div>
          {formErrors.price && (
            <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            If you set a price, your NFT will be automatically listed for sale after minting.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isMinting || !selectedImage}
            className="w-full btn-primary flex items-center justify-center"
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
      </form>
    </div>
  );
};

export default UploadArtForm; 