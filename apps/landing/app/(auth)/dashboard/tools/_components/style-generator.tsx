'use client'

import React, { useState, useEffect } from 'react';
import { ImagePlus, X, RefreshCw, Sparkles, Check, AlertCircle, Download, Plus, Info } from 'lucide-react';

// Define available styles
const AVAILABLE_STYLES = [
  { id: 'ghibli', name: 'Studio Ghibli', description: 'Magical, whimsical anime style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, dreamy painting style' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic, neon-lit aesthetic' },
  { id: 'vintage', name: 'Vintage', description: 'Nostalgic, retro film look' },
  { id: 'comic', name: 'Comic Book', description: 'Bold lines and vibrant colors' },
  { id: 'custom', name: 'Custom Style', description: 'Define your own style' },
];

// Image size options
const SIZE_OPTIONS = [
  { value: '1024x1024', label: '1:1 Square' },
  { value: '1024x1536', label: '2:3 Portrait' },
  { value: '1536x1024', label: '3:2 Landscape' },
];

// Quality options with credit costs
const QUALITY_CREDIT_COSTS = {
  high: 10,
  medium: 7,
  low: 5,
  auto: 7
};

const QUALITY_OPTIONS = [
  { value: 'low', label: `Low (${QUALITY_CREDIT_COSTS.low} credits)` },
  { value: 'medium', label: `Medium (${QUALITY_CREDIT_COSTS.medium} credits)` },
  { value: 'high', label: `High (${QUALITY_CREDIT_COSTS.high} credits)` },
  { value: 'auto', label: `Auto (${QUALITY_CREDIT_COSTS.auto} credits)` },
];

interface ImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface GeneratedImage {
  id: string;
  originalImageId?: string;
  originalImageUrl: string;
  originalImageName?: string;
  generatedImageUrl: string;
  prompt: string;
}

interface StyleGeneratorProps {
  onGenerationComplete?: (images: GeneratedImage[], creditsRemaining: number) => void;
  initialCreditBalance?: number;
}

const StyleGenerator: React.FC<StyleGeneratorProps> = ({ 
  onGenerationComplete,
  initialCreditBalance
}) => {
  // State
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('ghibli');
  const [customStyleDescription, setCustomStyleDescription] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [imageSize, setImageSize] = useState<string>('1024x1024');
  const [imageQuality, setImageQuality] = useState<string>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(initialCreditBalance || null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Calculate cost per image based on quality
  const costPerImage = QUALITY_CREDIT_COSTS[imageQuality as keyof typeof QUALITY_CREDIT_COSTS] || QUALITY_CREDIT_COSTS.medium;
  const totalCost = images.length * costPerImage;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length !== newFiles.length) {
        setUploadStatus(`${newFiles.length - validFiles.length} file(s) were skipped because they are not images.`);
      }
      
      const newPreviews = validFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newPreviews]);
      
      if (validFiles.length > 0) {
        setUploadStatus(null);
      }
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.previewUrl);
      }
      return filtered;
    });
  };

  // Clear all images
  const clearAllImages = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.previewUrl);
    });
    setImages([]);
  };

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length !== newFiles.length) {
        setUploadStatus(`${newFiles.length - validFiles.length} file(s) were skipped because they are not images.`);
      }
      
      const newPreviews = validFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newPreviews]);
      
      if (validFiles.length > 0) {
        setUploadStatus(null);
      }
    }
  };

  // Generate images in selected style
  const generateImages = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions.');
      return;
    }

    if (selectedStyle === 'custom' && customStyleDescription.trim() === '') {
      setError('Please describe your custom style.');
      return;
    }

    const totalCreditsNeeded = images.length * costPerImage;
    if (creditsRemaining !== null && creditsRemaining < totalCreditsNeeded) {
      setError(`Insufficient credits. You need ${totalCreditsNeeded} credits for this operation with ${imageQuality} quality.`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedImages([]);

    try {
      const totalSteps = images.length * 2 + 1;
      let completedSteps = 0;
      
      const formData = new FormData();
      formData.append('style', selectedStyle);
      
      if (selectedStyle === 'custom') {
        formData.append('customStyleDescription', customStyleDescription);
      }
      
      formData.append('prompt', customPrompt);
      formData.append('size', imageSize);
      formData.append('quality', imageQuality);
      
      images.forEach((img, index) => {
        formData.append(`image${index}`, img.file);
        completedSteps++;
        setProgress((completedSteps / totalSteps) * 100);
      });

      setProgress(50);

      const response = await fetch('/api/tools/picasso', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Image generation failed');
      }

      const data = await response.json();
      setGeneratedImages(data.results);
      setCreditsRemaining(data.creditsRemaining);
      setProgress(100);
      
      if (onGenerationComplete) {
        onGenerationComplete(data.results, data.creditsRemaining);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred during image generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate if user has enough credits
  const hasEnoughCredits = creditsRemaining === null || creditsRemaining >= totalCost;

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Legal Notice */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-sm">
        <div className="flex items-start">
          <p className="text-sm text-blue-700">
            Images containing celebrities, public figures, or copyrighted content are prohibited. 
            Use only images you have the rights to transform.
          </p>
        </div>
      </div>

      {/* Style Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Choose a Style</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_STYLES.map(style => (
            <div
              key={style.id}
              className={`border-l-4 p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedStyle === style.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-transparent border-l-gray-200'
              }`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">{style.name}</h3>
                {selectedStyle === style.id && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Style Description */}
      {selectedStyle === 'custom' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium text-gray-800">Custom Style Description</h2>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <textarea
            className="w-full border rounded p-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
            rows={2}
            placeholder="Describe the artistic style (e.g., 'Neon-colored psychedelic art with swirling patterns')"
            value={customStyleDescription}
            onChange={e => setCustomStyleDescription(e.target.value)}
          />
        </div>
      )}

      {/* Custom Prompt (Optional) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-medium text-gray-800">Additional Instructions (Optional)</h2>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
        <textarea
          className="w-full border rounded p-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
          rows={2}
          placeholder="E.g., 'Add magical elements' or 'Set in a forest'"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
        />
      </div>

      {/* Settings - Simplified in one row */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Size</label>
          <select
            className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
            value={imageSize}
            onChange={e => setImageSize(e.target.value)}
          >
            {SIZE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
          <select
            className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
            value={imageQuality}
            onChange={e => setImageQuality(e.target.value)}
          >
            {QUALITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-gray-800">Upload Images</h2>
          {images.length > 0 && (
            <button 
              className="text-sm text-red-600 hover:text-red-800 transition underline"
              onClick={clearAllImages}
            >
              Clear all
            </button>
          )}
        </div>
        <div
          className={`border-2 border-dashed rounded p-5 text-center transition-colors ${
            images.length === 0 ? 'border-gray-300 hover:border-purple-300 bg-white' : 'border-gray-200 bg-white'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {images.length === 0 ? (
            <div className="flex flex-col items-center">
              <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-3">Drag & drop images or click to browse</p>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer transition">
                Select Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.previewUrl}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded shadow-sm"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(img.id)}
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded"></div>
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add more</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              {uploadStatus && (
                <p className="text-amber-600 text-xs mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  {uploadStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms Agreement - Simplified */}
      <div className="mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 mt-1"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700">
            I confirm I have the rights to use these images and they don't contain celebrities, 
            public figures, or copyrighted content.
          </span>
        </label>
      </div>

      {/* Credit Warning */}
      {!hasEnoughCredits && images.length > 0 && (
        <div className="mb-6 p-3 border-l-4 border-amber-500 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
            <p className="text-sm text-amber-700">
              You need {totalCost} credits to generate these images with {imageQuality} quality, but you only have {creditsRemaining}. 
              <a href="/credits" className="ml-1 text-purple-600 underline">Get more credits</a>
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="mb-6">
        <button
          className={`w-full py-3 rounded flex items-center justify-center font-medium transition ${
            isGenerating || !hasEnoughCredits || images.length === 0 || !termsAccepted || (selectedStyle === 'custom' && customStyleDescription.trim() === '')
              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
          onClick={generateImages}
          disabled={isGenerating || !hasEnoughCredits || images.length === 0 || !termsAccepted || (selectedStyle === 'custom' && customStyleDescription.trim() === '')}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating... ({Math.round(progress)}%)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Uses {totalCost} credits ({images.length} images × {costPerImage} credits for {imageQuality} quality)
          {creditsRemaining !== null && ` • ${creditsRemaining} credits remaining`}
        </p>
      </div>

      {/* Results Display - Simplified */}
      {generatedImages.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Generated Images</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map(image => (
              <div key={image.id} className="border-b border-l border-gray-200 hover:border-purple-200 bg-white transition-colors">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Original</p>
                    <img 
                      src={image.originalImageUrl} 
                      alt="Original" 
                      className="w-full h-28 object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Generated</p>
                    <img 
                      src={image.generatedImageUrl} 
                      alt="Generated" 
                      className="w-full h-28 object-cover"
                    />
                  </div>
                </div>
                <div className="px-2 py-2 flex justify-end">
                  <a 
                    href={image.generatedImageUrl}
                    download
                    className="text-purple-600 hover:text-purple-800 text-xs flex items-center transition"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleGenerator;