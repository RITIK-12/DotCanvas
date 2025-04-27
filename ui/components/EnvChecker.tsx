import React, { useEffect, useState } from 'react';
import { AI_CONFIG, STORAGE_CONFIG } from '../config';

interface KeyStatus {
  exists: boolean;
  isValid: boolean;
  details: string;
}

const EnvChecker: React.FC = () => {
  const [envStatus, setEnvStatus] = useState<{
    aiKey: KeyStatus;
    storageKey: KeyStatus;
  }>({
    aiKey: { exists: false, isValid: false, details: '' },
    storageKey: { exists: false, isValid: false, details: '' }
  });
  const [nftUploadTested, setNftUploadTested] = useState(false);
  const [nftUploadWorking, setNftUploadWorking] = useState(false);

  useEffect(() => {
    // Validate Stability AI Key
    const aiKey = AI_CONFIG.apiKey;
    const aiKeyStatus: KeyStatus = {
      exists: Boolean(aiKey),
      isValid: Boolean(aiKey && aiKey.length > 20 && aiKey.startsWith('sk-')),
      details: aiKey 
        ? `${aiKey.substring(0, 5)}...${aiKey.substring(aiKey.length - 5)} (${aiKey.length} chars)`
        : 'Key not found'
    };

    // Validate NFT.Storage Key
    const storageKey = STORAGE_CONFIG.apiKey;
    const storageKeyStatus: KeyStatus = {
      exists: Boolean(storageKey),
      // Any key with reasonable length is considered potentially valid
      isValid: Boolean(storageKey && storageKey.length >= 10),
      details: storageKey 
        ? `${storageKey.substring(0, 5)}...${storageKey.substring(storageKey.length - 5)} (${storageKey.length} chars)`
        : 'Key not found'
    };

    setEnvStatus({
      aiKey: aiKeyStatus,
      storageKey: storageKeyStatus
    });
    
    // Test NFT.Storage API if key exists
    if (storageKey && !nftUploadTested) {
      testNftStorageUpload(storageKey);
    }
  }, [nftUploadTested]);
  
  const testNftStorageUpload = async (apiKey: string) => {
    setNftUploadTested(true);
    
    try {
      // Create a small test file
      const testFile = new File(
        [JSON.stringify({test: 'This is a test upload'})], 
        'test-upload.json', 
        { type: 'application/json' }
      );
      
      // Create form data
      const formData = new FormData();
      formData.append('file', testFile);
      
      // Log key information without revealing full key
      console.log('Testing upload with API key starting with:', apiKey.substring(0, 5));
      console.log('API key length:', apiKey.length);
      
      // Try direct upload to test API key - only basic functionality
      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful! CID:', data.value.cid);
        setNftUploadWorking(true);
      } else {
        const errorData = await response.json();
        console.error('NFT.Storage test upload failed:', errorData);
        setNftUploadWorking(false);
      }
    } catch (error) {
      console.error('Error testing NFT.Storage upload:', error);
      setNftUploadWorking(false);
    }
  };

  // Check if both keys are valid
  const allKeysValid = envStatus.aiKey.isValid && envStatus.storageKey.isValid && nftUploadWorking;

  if (allKeysValid) {
    return null; // Don't render anything if all is well
  }

  return (
    <div className="mb-4 p-4 bg-yellow-800/50 border border-yellow-600 rounded-md">
      <h3 className="text-md font-semibold text-yellow-300 mb-2">Environment Check</h3>
      <ul className="list-disc list-inside text-sm space-y-2">
        <li className={envStatus.aiKey.isValid ? 'text-green-400' : 'text-yellow-300'}>
          <div className="flex flex-col">
            <div>
              Stability AI Key: {envStatus.aiKey.isValid ? '✅ Valid' : envStatus.aiKey.exists ? '⚠️ Malformed' : '❌ Missing'}
            </div>
            <div className="text-xs ml-5 text-gray-400">
              {envStatus.aiKey.details}
            </div>
            {!envStatus.aiKey.isValid && (
              <div className="text-xs ml-5 text-yellow-400">
                Expected format: starts with "sk-", length &gt; 20 characters
              </div>
            )}
          </div>
        </li>
        <li className={envStatus.storageKey.isValid && nftUploadWorking ? 'text-green-400' : 'text-yellow-300'}>
          <div className="flex flex-col">
            <div>
              NFT.Storage Key: {
                nftUploadWorking ? '✅ Working' : 
                (envStatus.storageKey.isValid ? '⚠️ Key found but not working' : 
                (envStatus.storageKey.exists ? '⚠️ Malformed' : '❌ Missing'))
              }
            </div>
            <div className="text-xs ml-5 text-gray-400">
              {envStatus.storageKey.details}
            </div>
            {!nftUploadWorking && envStatus.storageKey.exists && (
              <div className="text-xs ml-5 text-yellow-400">
                Key format issue: NFT.Storage API is rejecting this key. Please ensure you're using a valid API key from NFT.Storage.
              </div>
            )}
            {!envStatus.storageKey.exists && (
              <div className="text-xs ml-5 text-yellow-400">
                You need to add your NFT.Storage API key to the .env file
              </div>
            )}
          </div>
        </li>
      </ul>
      <p className="text-xs text-yellow-400 mt-3">
        Make sure your .env file in the root folder contains valid API keys:
      </p>
      <pre className="bg-gray-900 p-2 mt-1 text-xs text-gray-300 rounded">
        DREAMSTUDIO_API_KEY=sk-your-key-here<br/>
        NFT_STORAGE_KEY=eyJhbGciOiJIUzI1NiIsIn...
      </pre>
      {!nftUploadWorking && envStatus.storageKey.exists && (
        <div className="mt-3 p-2 bg-gray-700 rounded-md">
          <p className="text-xs text-white">
            <strong>How to fix NFT.Storage API key issues:</strong>
          </p>
          <ol className="list-decimal list-inside text-xs text-gray-300 mt-1">
            <li>Visit <a href="https://nft.storage" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">nft.storage</a> and sign in to your account</li>
            <li>Go to API Keys in your account settings</li>
            <li>Create a new API key if needed</li>
            <li>Copy the entire key exactly as provided (including any periods or special characters)</li>
            <li>Replace your current key in the .env file</li>
            <li>Make sure there are no spaces or quotes around the key</li>
            <li>Your .env file should have: NFT_STORAGE_KEY=yourkey</li>
            <li>Restart the development server</li>
          </ol>
          <p className="text-xs text-yellow-300 mt-2">
            Note: NFT.Storage API keys might contain periods (.) or other special characters. Make sure to copy the entire key without any modifications.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnvChecker; 