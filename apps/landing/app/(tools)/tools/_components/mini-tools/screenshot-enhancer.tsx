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
import { Slider } from "@repo/ui/components/ui/slider";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Upload,
  Download,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Wand2,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@repo/ui/components/ui/dialog";

type SocialMediaPlatform = {
  name: string;
  dimensions: { width: number; height: number }[];
  dimensionLabels: string[];
};

const platforms: SocialMediaPlatform[] = [
  {
    name: "Twitter/X",
    dimensions: [
      { width: 1200, height: 675 },
      { width: 1600, height: 900 },
      { width: 1200, height: 1200 },
    ],
    dimensionLabels: ["Post (16:9)", "Large (16:9)", "Square (1:1)"],
  },
  {
    name: "Instagram",
    dimensions: [
      { width: 1080, height: 1080 },
      { width: 1080, height: 1350 },
      { width: 1080, height: 608 },
    ],
    dimensionLabels: ["Square (1:1)", "Portrait (4:5)", "Landscape (1.91:1)"],
  },
  {
    name: "LinkedIn",
    dimensions: [
      { width: 1200, height: 627 },
      { width: 1200, height: 1200 },
    ],
    dimensionLabels: ["Post (1.91:1)", "Square (1:1)"],
  },
  {
    name: "Facebook",
    dimensions: [
      { width: 1200, height: 630 },
      { width: 1080, height: 1080 },
    ],
    dimensionLabels: ["Post (1.91:1)", "Square (1:1)"],
  },
  {
    name: "Custom",
    dimensions: [
      { width: 1200, height: 800 },
      { width: 1920, height: 1080 },
      { width: 800, height: 1200 },
    ],
    dimensionLabels: ["Custom (3:2)", "Custom (16:9)", "Custom (2:3)"],
  },
];

const backgroundOptions = [
  "Gradient 1",
  "Gradient 2",
  "Gradient 3",
  "Solid Blue",
  "Solid Green",
  "Solid Purple",
  "Carbon Fiber",
  "Dots",
  "Lines",
  "None"
];

const fontOptions = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Courier New",
  "Impact"
];

// Remove session dependency and use a simple boolean flag instead
const isUserLoggedIn = false; // Default to false for all users

// Sample designs with images to show as examples
const sampleImages = [
  {
    id: 1,
    src: "/features/twitter-main.png",
    title: "Twitter Analytics",
    style: "Gradient 1",
    platform: "Twitter/X",
    effects: {
      background: "Gradient 1",
      textColor: "#ffffff",
      textFont: "Arial",
      textSize: 36,
      textPosition: { x: 50, y: 85 },
      showBorder: true
    }
  },
  {
    id: 2,
    src: "/results/followers.png",
    title: "Follower Growth",
    style: "Solid Blue",
    platform: "LinkedIn",
    effects: {
      background: "Solid Blue",
      textColor: "#ffffff",
      textFont: "Helvetica",
      textSize: 28,
      textPosition: { x: 50, y: 20 },
      showBorder: true
    }
  },
  {
    id: 3,
    src: "/results/profile-views.png",
    title: "Profile Analytics",
    style: "Gradient 3",
    platform: "Instagram",
    effects: {
      background: "Gradient 3",
      textColor: "#ffffff",
      textFont: "Georgia",
      textSize: 32,
      textPosition: { x: 50, y: 15 },
      showBorder: false
    }
  }
];

export default function ScreenshotEnhancer() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Twitter/X");
  const [selectedDimension, setSelectedDimension] = useState<number>(0);
  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);

  // Design options
  const [selectedBackground, setSelectedBackground] = useState<string>("Gradient 1");
  const [overlayText, setOverlayText] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textFont, setTextFont] = useState<string>("Arial");
  const [textSize, setTextSize] = useState<number>(32);
  const [textPosition, setTextPosition] = useState<{ x: number, y: number }>({ x: 50, y: 50 });
  const [addWatermark, setAddWatermark] = useState<boolean>(true); // Default to true (free version)

  // Canvas refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenshotRef = useRef<HTMLImageElement | null>(null);

  // Dialog controls
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [showDesignOptions, setShowDesignOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [showFinalImage, setShowFinalImage] = useState(false);
  const [enhancementDialogOpen, setEnhancementDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<typeof sampleImages[0] | null>(null);

  // Sample parameters
  const [platform, setPlatform] = useState<string>("twitter");
  const [dimensionIndex, setDimensionIndex] = useState<number>(0);
  const [backgroundType, setBackgroundType] = useState<string>("gradient");
  const [solidColor, setSolidColor] = useState<string>("#1E40AF");
  const [gradientColors, setGradientColors] = useState<string[]>(["#4B79A1", "#283E51"]);
  const [padding, setPadding] = useState<number>(30);
  const [addShadow, setAddShadow] = useState<boolean>(true);
  const [roundedCorners, setRoundedCorners] = useState<boolean>(true);
  const [inputImage, setInputImage] = useState<string | null>(null);

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (enhancedImageUrl) {
        URL.revokeObjectURL(enhancedImageUrl);
      }
    };
  }, []);

  // Add a missing image handler for the logo
  useEffect(() => {
    // No longer needed since we're not using a logo
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setSelectedDimension(0);
    setIsProcessing(true);
    setTimeout(() => {
      updateCanvas();
      setIsProcessing(false);
    }, 50);
  };

  const handleDimensionChange = (index: number) => {
    setSelectedDimension(index);
    setIsProcessing(true);
    setTimeout(() => {
      updateCanvas();
      setIsProcessing(false);
    }, 50);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setIsProcessing(true);

    const files = e.target.files;
    if (!files || files.length === 0) {
      setError("No file selected");
      setIsProcessing(false);
      return;
    }

    const file = files[0];

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      setIsProcessing(false);
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && typeof event.target.result === "string") {
        setScreenshotPreview(event.target.result);

        // Create image element for the canvas
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          screenshotRef.current = img;
          setScreenshotUploaded(true);
          if (event.target) {  // Additional null check
            setInputImage(event.target.result as string);
          }
          // Open enhancement modal after upload
          setEnhancementDialogOpen(true);
          // Force immediate canvas update
          setTimeout(() => {
            updateCanvas();
            setIsProcessing(false);
          }, 100);
        };
        img.onerror = () => {
          setError("Failed to load image");
          setIsProcessing(false);
        };
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const updateCanvas = () => {
    if (!canvasRef.current || !screenshotRef.current) {
      console.log("Canvas or screenshot ref not available yet");
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      // Get dimensions based on selected platform
      let width, height;

      if (selectedPlatform === "Custom") {
        width = customWidth;
        height = customHeight;
      } else {
        const platform = platforms.find(p => p.name === selectedPlatform);
        if (!platform) {
          console.error("Selected platform not found");
          return;
        }

        width = platform.dimensions[selectedDimension].width;
        height = platform.dimensions[selectedDimension].height;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      if (selectedBackground !== "None") {
        if (selectedBackground.startsWith("Gradient")) {
          let gradient;
          if (selectedBackground === "Gradient 1") {
            gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "#4158D0");
            gradient.addColorStop(0.5, "#C850C0");
            gradient.addColorStop(1, "#FFCC70");
          } else if (selectedBackground === "Gradient 2") {
            gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#0093E9");
            gradient.addColorStop(1, "#80D0C7");
          } else {
            gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, "#8EC5FC");
            gradient.addColorStop(1, "#E0C3FC");
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        } else if (selectedBackground.startsWith("Solid")) {
          if (selectedBackground === "Solid Blue") {
            ctx.fillStyle = "#3b82f6";
          } else if (selectedBackground === "Solid Green") {
            ctx.fillStyle = "#10b981";
          } else {
            ctx.fillStyle = "#8b5cf6";
          }
          ctx.fillRect(0, 0, width, height);
        } else if (selectedBackground === "Carbon Fiber") {
          ctx.fillStyle = "#222";
          ctx.fillRect(0, 0, width, height);

          // Draw carbon fiber pattern
          ctx.save();
          for (let i = 0; i < width; i += 20) {
            for (let j = 0; j < height; j += 20) {
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.fillRect(i, j, 10, 10);
              ctx.fillRect(i + 10, j + 10, 10, 10);
            }
          }
          ctx.restore();
        } else if (selectedBackground === "Dots") {
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, width, height);

          // Draw dots pattern
          ctx.save();
          for (let i = 0; i < width; i += 20) {
            for (let j = 0; j < height; j += 20) {
              ctx.fillStyle = "#cbd5e1";
              ctx.beginPath();
              ctx.arc(i, j, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        } else if (selectedBackground === "Lines") {
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, width, height);

          // Draw lines pattern
          ctx.save();
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1;
          for (let i = 0; i < width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
          }
          for (let j = 0; j < height; j += 20) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(width, j);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Calculate screenshot position and dimensions to maintain aspect ratio
      const imgWidth = screenshotRef.current.width;
      const imgHeight = screenshotRef.current.height;

      const ratio = Math.min(
        (width * 0.8) / imgWidth,
        (height * 0.8) / imgHeight
      );

      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;

      const x = (width - newWidth) / 2;
      const y = (height - newHeight) / 2;

      // Draw the screenshot
      ctx.drawImage(screenshotRef.current, x, y, newWidth, newHeight);

      // Add border to screenshot
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, newWidth, newHeight);

      // Add text overlay - ensure it's on top of the image
      if (overlayText) {
        // Save context before modifying for text
        ctx.save();

        // Calculate text position based on screenshot position/dimensions
        const textX = width * (textPosition.x / 100);
        const textY = height * (textPosition.y / 100);

        // Optional: Add a semi-transparent background behind text for better visibility
        ctx.font = `${textSize}px ${textFont}`;
        const textWidth = ctx.measureText(overlayText).width;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(textX - textWidth / 2 - 10, textY - textSize / 2 - 5, textWidth + 20, textSize + 10);

        // Draw text overlay
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Add text shadow for better visibility
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw text
        ctx.fillText(overlayText, textX, textY);
        ctx.restore();
      }

      // Add watermark if watermark is enabled (free version)
      if (addWatermark) {
        ctx.save();
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "end";
        ctx.textBaseline = "bottom";
        ctx.fillText("Created with AI", width - 20, height - 20);

        // Just update the preview URL without logo
        setEnhancedImageUrl(canvas.toDataURL("image/png"));

        ctx.restore();
      } else {
        // Paid version without watermark
        toast.info("Using without a watermark will use credits.", {
          id: "watermark-notice",
          duration: 3000
        });

        // Update the preview URL
        setEnhancedImageUrl(canvas.toDataURL("image/png"));
      }

    } catch (err) {
      console.error("Error updating canvas:", err);
      setError("Error rendering image");
    }
  };

  // Make sure we show the canvas content right after the component mounts if we have a screenshot
  useEffect(() => {
    const timer = setTimeout(() => {
      if (screenshotUploaded && screenshotRef.current && canvasRef.current) {
        console.log("Initial canvas render after mount");
        updateCanvas();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Ensure canvas is updated immediately after image loads 
  useEffect(() => {
    if (screenshotUploaded && screenshotRef.current) {
      console.log("Screenshot ref ready - updating canvas");
      const timer = setTimeout(() => {
        updateCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [screenshotUploaded]);

  // Update canvas when design options change
  useEffect(() => {
    if (screenshotUploaded) {
      setIsProcessing(true);
      setTimeout(() => {
        updateCanvas();
        setIsProcessing(false);
      }, 50);
    }
  }, [
    selectedBackground,
    overlayText,
    textColor,
    textFont,
    textSize,
    textPosition,
    addWatermark,
    customWidth,
    customHeight,
    selectedPlatform,
    selectedDimension
  ]);

  const handleTextPositionChange = (axis: 'x' | 'y', value: number) => {
    setTextPosition(prev => ({
      ...prev,
      [axis]: value
    }));
  };

  const downloadImage = () => {
    if (!enhancedImageUrl) return;

    // Create download link
    const a = document.createElement("a");
    a.href = enhancedImageUrl;
    a.download = `enhanced-screenshot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show success message
    setShowSuccess(true);
    toast.success("Screenshot downloaded successfully!");
    setTimeout(() => setShowSuccess(false), 3000);

    // Close the enhancement dialog after download
    setEnhancementDialogOpen(false);
  };

  // Component for the file upload step
  const UploadStep = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className="flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100"
        onClick={triggerFileInput}
      >
        {screenshotUploaded ? (
          <>
            <img
              src={screenshotPreview}
              alt="Screenshot preview"
              className="max-h-64 max-w-full object-contain"
            />
            <p className="mt-2 text-sm text-gray-500">
              Click to upload a different screenshot
            </p>
          </>
        ) : (
          <>
            {isProcessing ? (
              <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            <p className="mt-2 text-sm font-medium text-gray-700">
              {isProcessing ? "Processing image..." : "Click to upload a screenshot"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP up to 10MB
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>

      {error && (
        <div className="w-full rounded-md bg-red-50 p-3 text-sm text-red-500">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );

  // We now render sample previews directly in JSX with CSS
  // This simplified function just applies the design to user's image
  const applySampleDesignToUserImage = (sample: typeof sampleImages[0]) => {
    if (!screenshotUploaded) {
      toast.error("Please upload a screenshot first!");
      return;
    }

    // Apply the sample's styling to the current image
    setSelectedPlatform(sample.platform);
    setSelectedBackground(sample.effects.background);
    setOverlayText(""); // Default empty string since textOverlay doesn't exist
    setTextColor(sample.effects.textColor);
    setTextFont(sample.effects.textFont);
    setTextSize(sample.effects.textSize);
    setTextPosition(sample.effects.textPosition);

    // Open enhancement dialog with these settings
    setEnhancementDialogOpen(true);
    setSampleDialogOpen(false);
  };

  // Opens the sample dialog with preview
  const openSamplePreview = async (sample: typeof sampleImages[0]) => {
    setSelectedSample(sample);
    setSampleDialogOpen(true);
  };

  // Function to apply a sample design to user's uploaded image
  const applySampleDesign = (sample: typeof sampleImages[0]) => {
    if (!screenshotUploaded) {
      toast.error("Please upload a screenshot first!");
      return;
    }

    // Apply the sample's styling to the current image
    setSelectedPlatform(sample.platform);
    setSelectedBackground(sample.effects.background);
    setOverlayText(""); // Default empty string since textOverlay doesn't exist
    setTextColor(sample.effects.textColor);
    setTextFont(sample.effects.textFont);
    setTextSize(sample.effects.textSize);
    setTextPosition(sample.effects.textPosition);

    // Open enhancement dialog with these settings
    setEnhancementDialogOpen(true);
    setSampleDialogOpen(false);
  };

  return (
    <Card className="w-full p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Ultimate Screenshot Enhancer - Create Fancy Screenshots for X, LinkedIn & Instagram
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          The best free social media screenshot generator for build in public, fancy screenshots for X/Twitter,
          LinkedIn posts, Instagram stories, Facebook content, and professional presentations. Enhance your
          social media presence with beautiful styled screenshots.
        </p>

        {/* Always show the upload section at the top */}
        <div className="mb-8 border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <ImageIcon className="mr-2 h-5 w-5" />
            Step 1: Upload Your Screenshot
          </h3>
          <UploadStep />
        </div>

        {/* Sample Before/After Gallery - Showing examples */}
        <div className="mt-10 mb-8">
          <h3 className="text-lg font-medium mb-6 flex items-center justify-between">
            <span className="flex items-center">
              <Wand2 className="mr-2 h-5 w-5" />
              See How Screenshots Look Before & After Enhancement
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSampleDialogOpen(true)}
              disabled={!screenshotUploaded}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Apply Sample Design
            </Button>
          </h3>

          <div className="space-y-6">
            {sampleImages.map((sample) => (
              <div
                key={sample.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-4"
                onClick={() => openSamplePreview(sample)}
              >
                <h4 className="font-medium text-base mb-2">{sample.title}</h4>
                <p className="text-xs text-gray-500 mb-4">{sample.platform} • {sample.style}</p>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Before image */}
                  <div className="w-full md:w-1/2">
                    <div className="aspect-video relative rounded-md overflow-hidden border">
                      <img
                        src={sample.src}
                        alt={`${sample.title} before`}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                  </div>

                  {/* Arrow between */}
                  <div className="hidden md:flex -mx-4">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* After image - with effects */}
                  <div className="w-full md:w-1/2">
                    <div className="aspect-video relative rounded-md overflow-hidden border">
                      {/* We'll use the real sample.src but display it with stylings applied via CSS */}
                      <div
                        className="w-full h-full relative"
                        style={{
                          background: sample.effects.background === "Solid Blue" ? "#3b82f6" :
                            sample.effects.background === "Solid Green" ? "#10b981" :
                              sample.effects.background === "Solid Purple" ? "#8b5cf6" :
                                sample.effects.background === "Gradient 1" ? "linear-gradient(135deg, #4158D0, #C850C0, #FFCC70)" :
                                  sample.effects.background === "Gradient 2" ? "linear-gradient(180deg, #0093E9, #80D0C7)" :
                                    sample.effects.background === "Gradient 3" ? "linear-gradient(90deg, #8EC5FC, #E0C3FC)" :
                                      "#f8fafc"
                        }}
                      >
                        {/* Image positioned in center */}
                        <div className="absolute" style={{
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '70%',
                          height: '70%',
                          border: sample.effects.showBorder ? '2px solid white' : 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          overflow: 'hidden',
                          borderRadius: '4px'
                        }}>
                          <img
                            src={sample.src}
                            alt={`${sample.title} styled`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Add text overlay */}
                        <div className="absolute p-2 text-center" style={{
                          top: `${sample.effects.textPosition.y}%`,
                          left: `${sample.effects.textPosition.x}%`,
                          transform: 'translate(-50%, -50%)',
                          color: sample.effects.textColor,
                          fontFamily: sample.effects.textFont,
                          fontSize: `${Math.min(sample.effects.textSize, 24)}px`,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {sample.title}
                        </div>

                        {/* Watermark */}
                        <div className="absolute bottom-2 right-2 text-white text-xs opacity-70">
                          Created with AI
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      applySampleDesign(sample);
                    }}
                    disabled={!screenshotUploaded}
                    className="text-xs"
                  >
                    Apply This Style To Your Image
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhancement Dialog - Moved Step 2 into this dialog */}
        <Dialog open={enhancementDialogOpen} onOpenChange={setEnhancementDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Step 2: Enhance Your Screenshot</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Social Media Platform</Label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={handlePlatformChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.name} value={platform.name}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimension">Dimensions</Label>
                  <Select
                    value={selectedDimension.toString()}
                    onValueChange={(value) => handleDimensionChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms
                        .find((p) => p.name === selectedPlatform)
                        ?.dimensionLabels.map((label, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlatform === "Custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        min={100}
                        max={3000}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        min={100}
                        max={3000}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="background">Background Style</Label>
                  <Select
                    value={selectedBackground}
                    onValueChange={setSelectedBackground}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select background" />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundOptions.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Text Overlay</Label>
                  <Textarea
                    id="text"
                    placeholder="Add text to your screenshot..."
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                  />
                </div>

                {overlayText && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="textFont">Font</Label>
                      <Select
                        value={textFont}
                        onValueChange={setTextFont}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded border"
                          style={{ backgroundColor: textColor }}
                        />
                        <Input
                          id="textColor"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textSize">Text Size: {textSize}px</Label>
                      <Slider
                        id="textSize"
                        min={12}
                        max={72}
                        step={1}
                        value={[textSize]}
                        onValueChange={(values) => setTextSize(values[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Position</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="textPositionX" className="text-xs">Horizontal: {textPosition.x}%</Label>
                          <Slider
                            id="textPositionX"
                            min={0}
                            max={100}
                            step={1}
                            value={[textPosition.x]}
                            onValueChange={(values) => handleTextPositionChange('x', values[0])}
                          />
                        </div>
                        <div>
                          <Label htmlFor="textPositionY" className="text-xs">Vertical: {textPosition.y}%</Label>
                          <Slider
                            id="textPositionY"
                            min={0}
                            max={100}
                            step={1}
                            value={[textPosition.y]}
                            onValueChange={(values) => handleTextPositionChange('y', values[0])}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="watermark"
                    checked={addWatermark}
                    onCheckedChange={setAddWatermark}
                  />
                  <Label htmlFor="watermark" className="flex items-center">
                    Add Olly watermark
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Free</span>
                  </Label>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <h3 className="font-medium self-start mb-2">Preview</h3>
                <div className="relative w-full overflow-hidden rounded-lg border bg-gray-100">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[400px] w-full object-contain"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/30">
                      <RefreshCw className="h-8 w-8 animate-spin text-white" />
                      <p className="mt-2 text-sm text-white">Processing image...</p>
                    </div>
                  )}
                </div>

                <Button
                  className="mt-4 w-full"
                  size="lg"
                  onClick={downloadImage}
                  disabled={!enhancedImageUrl || isProcessing}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Enhanced Screenshot
                </Button>

                {showSuccess && (
                  <div className="flex items-center rounded-md bg-green-50 p-3 text-sm text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Screenshot downloaded successfully!
                  </div>
                )}

                <p className="mt-4 text-center text-sm text-gray-500">
                  <a href="/sign-in" className="font-medium text-blue-600 hover:underline">
                    Sign in
                  </a>{" "}
                  or{" "}
                  <a href="/#pricing" className="font-medium text-blue-600 hover:underline">
                    upgrade to Pro
                  </a>{" "}
                  to remove watermarks without using credits.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sample Gallery Dialog */}
        <Dialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sample Screenshot Designs</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {sampleImages.map((sample) => (
                <div
                  key={sample.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => applySampleDesign(sample)}
                >
                  <h4 className="font-medium text-base mb-2">{sample.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{sample.platform} • {sample.style}</p>

                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Before image */}
                    <div className="w-full md:w-1/2">
                      <div className="aspect-video relative rounded-md overflow-hidden border">
                        <img
                          src={sample.src}
                          alt={`${sample.title} before`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Before
                        </div>
                      </div>
                    </div>

                    {/* Arrow between */}
                    <div className="hidden md:flex -mx-4">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* After image - with effects */}
                    <div className="w-full md:w-1/2">
                      <div className="aspect-video relative rounded-md overflow-hidden border">
                        {/* Styled version with effects */}
                        <div
                          className="w-full h-full relative"
                          style={{
                            background: sample.effects.background === "Solid Blue" ? "#3b82f6" :
                              sample.effects.background === "Solid Green" ? "#10b981" :
                                sample.effects.background === "Solid Purple" ? "#8b5cf6" :
                                  sample.effects.background === "Gradient 1" ? "linear-gradient(135deg, #4158D0, #C850C0, #FFCC70)" :
                                    sample.effects.background === "Gradient 2" ? "linear-gradient(180deg, #0093E9, #80D0C7)" :
                                      sample.effects.background === "Gradient 3" ? "linear-gradient(90deg, #8EC5FC, #E0C3FC)" :
                                        "#f8fafc"
                          }}
                        >
                          {/* Image positioned in center */}
                          <div className="absolute" style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '70%',
                            height: '70%',
                            border: sample.effects.showBorder ? '2px solid white' : 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            borderRadius: '4px'
                          }}>
                            <img
                              src={sample.src}
                              alt={`${sample.title} styled`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Add text overlay */}
                          <div className="absolute p-2 text-center" style={{
                            top: `${sample.effects.textPosition.y}%`,
                            left: `${sample.effects.textPosition.x}%`,
                            transform: 'translate(-50%, -50%)',
                            color: sample.effects.textColor,
                            fontFamily: sample.effects.textFont,
                            fontSize: `${Math.min(sample.effects.textSize, 24)}px`,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {sample.title}
                          </div>

                          {/* Watermark */}
                          <div className="absolute bottom-2 right-2 text-white text-xs opacity-70">
                            Created with AI
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          After
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        applySampleDesign(sample);
                        setSampleDialogOpen(false);
                      }}
                      disabled={!screenshotUploaded}
                    >
                      Apply This Style
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {screenshotUploaded && (
                <Button onClick={() => {
                  setEnhancementDialogOpen(true);
                  setSampleDialogOpen(false);
                }}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create Custom Design
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* SEO-friendly content section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            Create Stunning Social Media Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium mb-2">Perfect for:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Build in public screenshots for Twitter/X</li>
                <li>Professional LinkedIn post screenshots</li>
                <li>Instagram story content creation</li>
                <li>Facebook post engagement boosting</li>
                <li>Startup founder content marketing</li>
                <li>Product launch announcements</li>
                <li>SaaS marketing materials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key features:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Beautiful pre-made templates</li>
                <li>Customizable dimensions for all platforms</li>
                <li>Professionally designed gradients</li>
                <li>Automatic image enhancement</li>
                <li>Text overlay capabilities</li>
                <li>One-click download</li>
                <li>No design skills needed</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Elevate your social media presence with professionally styled screenshots. Our free screenshot generator
            helps founders, creators, and marketers create beautiful visual content for Twitter/X, LinkedIn,
            Instagram, and Facebook without design skills.
          </p>
        </div>
      </div>
    </Card>
  );
}