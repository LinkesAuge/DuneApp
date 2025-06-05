import React, { useState } from 'react';
import { createManagedImage, linkImageToPOI, getImagesForEntity, ImageType, ManagedImage } from '../../lib/api/unified-images';

interface TestResult {
  action: string;
  success: boolean;
  message: string;
  data?: any;
}

export default function UnifiedImageApiTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testPoiId, setTestPoiId] = useState('');

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Test 1: Create Managed Image
  const testCreateManagedImage = async () => {
    if (!selectedFile) {
      addResult({
        action: 'Create Managed Image',
        success: false,
        message: 'Please select a file first'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createManagedImage(selectedFile, 'poi_screenshot');
      
      addResult({
        action: 'Create Managed Image',
        success: result.success,
        message: result.success 
          ? `Image created successfully! ID: ${result.managedImage?.id}` 
          : `Failed: ${result.error}`,
        data: result.managedImage
      });
    } catch (error) {
      addResult({
        action: 'Create Managed Image',
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setIsLoading(false);
  };

  // Test 2: Link Image to POI (requires POI ID)
  const testLinkImageToPOI = async () => {
    if (!testPoiId) {
      addResult({
        action: 'Link Image to POI',
        success: false,
        message: 'Please enter a POI ID first'
      });
      return;
    }

    const lastImageResult = testResults
      .filter(r => r.action === 'Create Managed Image' && r.success && r.data)
      .pop();

    if (!lastImageResult?.data?.id) {
      addResult({
        action: 'Link Image to POI',
        success: false,
        message: 'No managed image available. Create an image first.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await linkImageToPOI({
        imageId: lastImageResult.data.id,
        entityId: testPoiId,
        displayOrder: 0
      });

      addResult({
        action: 'Link Image to POI',
        success,
        message: success 
          ? `Successfully linked image ${lastImageResult.data.id} to POI ${testPoiId}` 
          : 'Failed to link image to POI'
      });
    } catch (error) {
      addResult({
        action: 'Link Image to POI',
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setIsLoading(false);
  };

  // Test 3: Get Images for POI
  const testGetImagesForPOI = async () => {
    if (!testPoiId) {
      addResult({
        action: 'Get Images for POI',
        success: false,
        message: 'Please enter a POI ID first'
      });
      return;
    }

    setIsLoading(true);
    try {
      const images = await getImagesForEntity(testPoiId, 'poi');
      
      addResult({
        action: 'Get Images for POI',
        success: true,
        message: `Found ${images.length} images for POI ${testPoiId}`,
        data: images
      });
    } catch (error) {
      addResult({
        action: 'Get Images for POI',
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setIsLoading(false);
  };

  // Test 4: Full Workflow Test
  const testFullWorkflow = async () => {
    if (!selectedFile || !testPoiId) {
      addResult({
        action: 'Full Workflow Test',
        success: false,
        message: 'Please select a file and enter a POI ID'
      });
      return;
    }

    setIsLoading(true);
    clearResults();

    try {
      // Step 1: Create managed image
      addResult({
        action: 'Workflow Step 1',
        success: true,
        message: 'Creating managed image...'
      });

      const imageResult = await createManagedImage(selectedFile, 'poi_screenshot');
      if (!imageResult.success) {
        addResult({
          action: 'Full Workflow Test',
          success: false,
          message: `Failed at image creation: ${imageResult.error}`
        });
        setIsLoading(false);
        return;
      }

      addResult({
        action: 'Workflow Step 1',
        success: true,
        message: `✓ Image created: ${imageResult.managedImage?.id}`
      });

      // Step 2: Link to POI
      addResult({
        action: 'Workflow Step 2',
        success: true,
        message: 'Linking image to POI...'
      });

      const linkSuccess = await linkImageToPOI({
        imageId: imageResult.managedImage!.id,
        entityId: testPoiId,
        displayOrder: 0
      });

      if (!linkSuccess) {
        addResult({
          action: 'Full Workflow Test',
          success: false,
          message: 'Failed at image linking step'
        });
        setIsLoading(false);
        return;
      }

      addResult({
        action: 'Workflow Step 2',
        success: true,
        message: '✓ Image linked to POI successfully'
      });

      // Step 3: Verify retrieval
      addResult({
        action: 'Workflow Step 3',
        success: true,
        message: 'Retrieving images for POI...'
      });

      const retrievedImages = await getImagesForEntity(testPoiId, 'poi');
      const foundImage = retrievedImages.find(img => img.id === imageResult.managedImage!.id);

      addResult({
        action: 'Workflow Step 3',
        success: !!foundImage,
        message: foundImage 
          ? `✓ Image successfully retrieved from POI (${retrievedImages.length} total images)`
          : `✗ Image not found in POI images (${retrievedImages.length} total images found)`
      });

      // Final result
      addResult({
        action: 'Full Workflow Test',
        success: !!foundImage,
        message: foundImage 
          ? '🎉 Full workflow completed successfully!'
          : '❌ Workflow failed at verification step'
      });

    } catch (error) {
      addResult({
        action: 'Full Workflow Test',
        success: false,
        message: `Exception during workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-lg border rounded-lg p-4 max-h-96 overflow-auto z-50">
      <h3 className="font-bold text-lg mb-4">Unified Images API Test</h3>
      
      {/* File Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Test Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="w-full p-2 border rounded text-xs"
        />
        {selectedFile && (
          <p className="text-xs text-gray-600 mt-1">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* POI ID Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test POI ID:</label>
        <input
          type="text"
          value={testPoiId}
          onChange={(e) => setTestPoiId(e.target.value)}
          placeholder="Enter existing POI ID"
          className="w-full p-2 border rounded text-xs"
        />
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={testCreateManagedImage}
          disabled={isLoading || !selectedFile}
          className="px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          Create Image
        </button>
        <button
          onClick={testLinkImageToPOI}
          disabled={isLoading || !testPoiId}
          className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
        >
          Link to POI
        </button>
        <button
          onClick={testGetImagesForPOI}
          disabled={isLoading || !testPoiId}
          className="px-3 py-2 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50"
        >
          Get POI Images
        </button>
        <button
          onClick={testFullWorkflow}
          disabled={isLoading || !selectedFile || !testPoiId}
          className="px-3 py-2 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
        >
          Full Test
        </button>
      </div>

      <button
        onClick={clearResults}
        className="w-full px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 mb-3"
      >
        Clear Results
      </button>

      {/* Results */}
      <div className="space-y-2">
        {isLoading && (
          <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-xs">
            🔄 Running test...
          </div>
        )}
        
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-2 border-l-4 text-xs ${
              result.success
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <div className="font-medium">{result.action}</div>
            <div className="text-gray-600">{result.message}</div>
            {result.data && (
              <details className="mt-1">
                <summary className="cursor-pointer text-blue-600">View Data</summary>
                <pre className="text-xs bg-gray-100 p-1 mt-1 overflow-auto max-h-20">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 