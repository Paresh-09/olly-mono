'use client';
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";
import {
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

type SocialMediaSize = {
  width: number;
  height: number;
  label: string;
  icon?: string;
};

type SocialMediaSizes = {
  [key: string]: SocialMediaSize;
};

type Platform = {
  name: string;
  sizes: { [key: string]: SocialMediaSize };
};

const platforms: Platform[] = [
  {
    name: "Facebook",
    sizes: {
      "facebook-post": { width: 1200, height: 630, label: "Post" },
      "facebook-profile": { width: 170, height: 170, label: "Profile" },
      "facebook-cover": { width: 820, height: 312, label: "Cover" },
      "facebook-event": { width: 1920, height: 1080, label: "Event" },
    },
  },
  {
    name: "Instagram",
    sizes: {
      "instagram-post": { width: 1080, height: 1080, label: "Post" },
      "instagram-story": { width: 1080, height: 1920, label: "Story" },
      "instagram-profile": { width: 320, height: 320, label: "Profile" },
      "instagram-landscape": { width: 1080, height: 608, label: "Landscape" },
    },
  },
  {
    name: "Twitter",
    sizes: {
      "twitter-post": { width: 1200, height: 675, label: "Post" },
      "twitter-header": { width: 1500, height: 500, label: "Header" },
      "twitter-profile": { width: 400, height: 400, label: "Profile" },
    },
  },
  {
    name: "LinkedIn",
    sizes: {
      "linkedin-post": { width: 1200, height: 627, label: "Post" },
      "linkedin-profile": { width: 400, height: 400, label: "Profile" },
      "linkedin-cover": { width: 1584, height: 396, label: "Cover" },
      "linkedin-company": { width: 1128, height: 191, label: "Company" },
    },
  },
  {
    name: "Pinterest",
    sizes: {
      "pinterest-pin": { width: 1000, height: 1500, label: "Pin" },
      "pinterest-profile": { width: 165, height: 165, label: "Profile" },
      "pinterest-board": { width: 800, height: 800, label: "Board Cover" },
    },
  },
  {
    name: "YouTube",
    sizes: {
      "youtube-thumbnail": { width: 1280, height: 720, label: "Thumbnail" },
      "youtube-channel": { width: 2560, height: 1440, label: "Channel Art" },
      "youtube-profile": { width: 800, height: 800, label: "Profile" },
    },
  },
  {
    name: "Custom",
    sizes: {
      custom: { width: 800, height: 600, label: "Custom Size" },
    },
  },
];

// Flatten all sizes for the selector
const allSocialMediaSizes: SocialMediaSizes = platforms.reduce(
  (acc, platform) => {
    return { ...acc, ...platform.sizes };
  },
  {}
);

export default function SocialMediaImageResizer() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Facebook");
  const [selectedSize, setSelectedSize] = useState<string>("facebook-post");
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(600);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [resizedImageUrl, setResizedImageUrl] = useState<string>("");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewSize, setPreviewSize] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up URLs when component unmounts or when new ones are created
  useEffect(() => {
    return () => {
      if (resizedImageUrl) {
        URL.revokeObjectURL(resizedImageUrl);
      }
    };
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    // Set the first size option for the selected platform
    const firstSizeKey = Object.keys(
      platforms.find((p) => p.name === platform)?.sizes || {}
    )[0];
    if (firstSizeKey) {
      setSelectedSize(firstSizeKey);
    }
  };

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    if (value === "custom") {
      setCustomWidth(800);
      setCustomHeight(600);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const files = e.target.files;
    if (!files || files.length === 0) {
      setError("No file selected");
      return;
    }

    const file = files[0];

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && typeof event.target.result === "string") {
        setImagePreview(event.target.result);
        setImageUploaded(true);
        setResizedImageUrl("");

        // Clear any previous resized image URL
        if (resizedImageUrl) {
          URL.revokeObjectURL(resizedImageUrl);
          setResizedImageUrl("");
        }

        // Automatically move to the resize tab after a delay
        const timer = setTimeout(() => {
          setActiveTab("resize");
        }, 500);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateCustomDimensions = (): boolean => {
    setError(null);

    if (selectedSize !== "custom") {
      return true;
    }

    if (customWidth < 50) {
      setError("Width must be at least 50px");
      return false;
    }

    if (customWidth > 5000) {
      setError("Width cannot exceed 5000px");
      return false;
    }

    if (customHeight < 50) {
      setError("Height must be at least 50px");
      return false;
    }

    if (customHeight > 5000) {
      setError("Height cannot exceed 5000px");
      return false;
    }

    return true;
  };

  const generateQuickPreview = (sizeKey: string) => {
    if (!imageUploaded) return;
    
    setPreviewSize(sizeKey);
    setShowPreview(true);
  };

  const resizeImage = () => {
    // Reset error state
    setError(null);

    if (!imageUploaded) {
      setError("Please upload an image first");
      return;
    }

    // Validate custom dimensions
    if (!validateCustomDimensions()) {
      return;
    }

    setIsResizing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("Failed to create canvas context");
      setIsResizing(false);
      return;
    }

    const img = new Image();

    img.onerror = () => {
      setError("Failed to load image");
      setIsResizing(false);
    };

    img.onload = () => {
      try {
        // Set canvas dimensions to target size
        const targetWidth =
          selectedSize === "custom"
            ? customWidth
            : allSocialMediaSizes[selectedSize].width;
        const targetHeight =
          selectedSize === "custom"
            ? customHeight
            : allSocialMediaSizes[selectedSize].height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw image on canvas with resizing
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Clean up previous object URL if exists
        if (resizedImageUrl) {
          URL.revokeObjectURL(resizedImageUrl);
        }

        // Convert canvas to blob and create download URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("Failed to create image blob");
              setIsResizing(false);
              return;
            }

            const url = URL.createObjectURL(blob);
            setResizedImageUrl(url);
            setIsResizing(false);

            // Automatically move to the download tab after a delay
            setTimeout(() => {
              setActiveTab("download");
            }, 500);
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during resizing"
        );
        setIsResizing(false);
      }
    };

    img.src = imagePreview;
  };

  const downloadImage = () => {
    setError(null);

    if (!resizedImageUrl) {
      setError("No resized image available to download");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = resizedImageUrl;
      link.download = `${selectedPlatform.toLowerCase()}-${
        selectedSize.split("-")[1] || "custom"
      }.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Failed to download image");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload">1. Upload</TabsTrigger>
          <TabsTrigger value="resize" disabled={!imageUploaded}>
            2. Resize
          </TabsTrigger>
          <TabsTrigger value="download" disabled={!resizedImageUrl}>
            3. Download
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Upload Your Image</h3>
            <div
              className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
              onClick={triggerFileInput}
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                SVG, PNG, JPG or GIF (max. 10MB)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent's onClick
                  triggerFileInput();
                }}
                className="mt-4"
                variant="outline"
              >
                Select File
              </Button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                <p>{error}</p>
              </div>
            )}

            {imageUploaded && (
              <div className="mt-6 flex flex-col gap-4">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="aspect-video relative bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <Button
                  onClick={() => setActiveTab("resize")}
                  className="w-full"
                >
                  Next: Choose Size
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="resize">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Choose Platform & Size</h3>
            
            {/* Image preview at the top */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Original Image</h4>
              <div className="aspect-video relative bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            <div className="mb-6">
              <Label className="mb-2 block">Select Platform</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedPlatform === platform.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handlePlatformChange(platform.name)}
                  >
                    <div className="w-10 h-10 mb-2 flex items-center justify-center">
                      {/* Platform icon would go here */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {platform.name.charAt(0)}
                      </div>
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Label className="mb-2 block">Select Image Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(
                  platforms.find((p) => p.name === selectedPlatform)?.sizes ||
                    {}
                ).map(([key, size]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedSize === key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleSizeChange(key)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium">{size.label}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateQuickPreview(key);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {size.width} × {size.height}px
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Preview Modal */}
            {showPreview && previewSize && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      Preview: {allSocialMediaSizes[previewSize].label} ({allSocialMediaSizes[previewSize].width} × {allSocialMediaSizes[previewSize].height}px)
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <div 
                    className="aspect-video relative bg-slate-100 rounded-md overflow-hidden flex items-center justify-center mb-4"
                    style={{
                      maxWidth: '100%',
                      width: allSocialMediaSizes[previewSize].width > 800 ? '100%' : allSocialMediaSizes[previewSize].width,
                      height: allSocialMediaSizes[previewSize].height > 600 ? 'auto' : allSocialMediaSizes[previewSize].height,
                      aspectRatio: `${allSocialMediaSizes[previewSize].width} / ${allSocialMediaSizes[previewSize].height}`
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none"></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        handleSizeChange(previewSize);
                        setShowPreview(false);
                      }}
                    >
                      Select This Size
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedSize === "custom" && (
              <div className="mb-6">
                <Label className="mb-2 block">Custom Dimensions</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="customWidth">Width (px)</Label>
                    <input
                      id="customWidth"
                      type="number"
                      min="50"
                      max="5000"
                      value={customWidth}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        // Validate within reasonable range
                        if (value >= 50 && value <= 5000) {
                          setCustomWidth(value);
                        }
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="customHeight">Height (px)</Label>
                    <input
                      id="customHeight"
                      type="number"
                      min="50"
                      max="5000"
                      value={customHeight}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        // Validate within reasonable range
                        if (value >= 50 && value <= 5000) {
                          setCustomHeight(value);
                        }
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setActiveTab("upload")}
                className="flex-1"
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={resizeImage}
                className="flex-1"
                disabled={isResizing}
              >
                {isResizing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resizing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Resize Image
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="download">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Your Resized Image</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Original</h4>
                <div className="aspect-video relative bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Resized for {selectedPlatform}{" "}
                  {allSocialMediaSizes[selectedSize].label}
                </h4>
                <div className="aspect-video relative bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={resizedImageUrl}
                    alt="Resized"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {selectedSize === "custom"
                      ? `${customWidth}x${customHeight}`
                      : `${allSocialMediaSizes[selectedSize].width}×${allSocialMediaSizes[selectedSize].height}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                <p>{error}</p>
              </div>
            )}

            <div className="mt-6">
              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => setActiveTab("resize")}
                  className="flex-1"
                  variant="outline"
                >
                  Back to Resize
                </Button>

                <Button onClick={downloadImage} className="flex-1 relative">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                  {showSuccess && (
                    <span className="absolute right-4 flex items-center text-green-100">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Success!
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
                <p>
                  Your image has been resized to the perfect dimensions for{" "}
                  {selectedPlatform} {allSocialMediaSizes[selectedSize].label}.
                </p>
              </div>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => {
                    setImageUploaded(false);
                    setImagePreview("");
                    setResizedImageUrl("");
                    setActiveTab("upload");
                  }}
                  variant="link"
                >
                  Start Over with New Image
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>


      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Quick Tips</h4>
          <ul className="text-sm space-y-2">
            <li>• Use high-resolution images for best results</li>
            <li>• PNG format works best for graphics with text</li>
            <li>• Keep important content centered to avoid cropping</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Recent Updates</h4>
          <p className="text-sm text-gray-600">
            We've added new sizes for TikTok and updated Instagram dimensions to
            match their latest requirements.
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600 mb-2">
            Check our FAQ or contact support for assistance.
          </p>
          <Button variant="link" className="p-0 h-auto text-sm">
            View FAQ
          </Button>
        </Card>
      </div>
    </div>
  );
}