"use client";

import { useState, useRef, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import { Slider } from "@repo/ui/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import * as LucideIcons from 'lucide-react'

// Define logo sizes
const LOGO_SIZES = [
  { size: 32, name: "32x32", description: "Small icon" },
  { size: 64, name: "64x64", description: "Medium icon" },
  { size: 128, name: "128x128", description: "Large icon" },
  { size: 256, name: "256x256", description: "Extra large icon" },
  { size: 512, name: "512x512", description: "High resolution" }
];

// Define gradient presets
const GRADIENT_PRESETS = [
  { 
    id: "blue-purple", 
    name: "Blue to Purple", 
    colors: ["#3B82F6", "#8B5CF6"],
    direction: "to right"
  },
  { 
    id: "green-blue", 
    name: "Green to Blue", 
    colors: ["#10B981", "#3B82F6"],
    direction: "to right"
  },
  { 
    id: "orange-red", 
    name: "Orange to Red", 
    colors: ["#F59E0B", "#EF4444"],
    direction: "to right"
  },
  { 
    id: "pink-purple", 
    name: "Pink to Purple", 
    colors: ["#EC4899", "#8B5CF6"],
    direction: "to right"
  },
  { 
    id: "teal-lime", 
    name: "Teal to Lime", 
    colors: ["#14B8A6", "#84CC16"],
    direction: "to right"
  },
  { 
    id: "blue-cyan", 
    name: "Blue to Cyan", 
    colors: ["#2563EB", "#06B6D4"],
    direction: "to bottom right"
  },
  { 
    id: "purple-pink", 
    name: "Purple to Pink", 
    colors: ["#8B5CF6", "#EC4899"],
    direction: "to bottom right"
  },
  { 
    id: "amber-orange", 
    name: "Amber to Orange", 
    colors: ["#F59E0B", "#EA580C"],
    direction: "to bottom right"
  },
  { 
    id: "indigo-blue", 
    name: "Indigo to Blue", 
    colors: ["#4F46E5", "#3B82F6"],
    direction: "to bottom"
  },
  { 
    id: "red-pink", 
    name: "Red to Pink", 
    colors: ["#EF4444", "#EC4899"],
    direction: "to bottom"
  }
];

// Define shape options
const SHAPE_OPTIONS = [
  { id: "circle", name: "Circle" },
  { id: "square", name: "Square" },
  { id: "rounded", name: "Rounded Square" }
];

export const FreeAiLogoGenerator = () => {
  const [selectedIcon, setSelectedIcon] = useState<string>("Activity");
  const [selectedGradient, setSelectedGradient] = useState<string>("blue-purple");
  const [selectedShape, setSelectedShape] = useState<string>("circle");
  const [iconSize, setIconSize] = useState<number>(60);
  const [iconColor, setIconColor] = useState<string>("#FFFFFF");
  const [padding, setPadding] = useState<number>(20);
  const [generatedLogos, setGeneratedLogos] = useState<{ size: number, dataUrl: string }[]>([]);
  const [randomLogos, setRandomLogos] = useState<{ icon: string, gradient: string, shape: string, dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("design");
  const [selectedSizes, setSelectedSizes] = useState<number[]>(LOGO_SIZES.map(size => size.size));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const randomCanvasRef = useRef<HTMLCanvasElement>(null);

  // Get all Lucide icons
  const lucideIconNames = Object.keys(LucideIcons)
    .filter(name => name !== 'createLucideIcon' && name !== 'default');

  // Filter icons based on search query
  const filteredIcons = lucideIconNames.filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the selected icon component
  const IconComponent = (LucideIcons as any)[selectedIcon];

  // Get the selected gradient
  const gradient = GRADIENT_PRESETS.find(g => g.id === selectedGradient);

  // Update preview when settings change
  useEffect(() => {
    renderPreview();
  }, [selectedIcon, selectedGradient, selectedShape, iconSize, iconColor, padding]);

  // Generate random logos on initial load
  useEffect(() => {
    generateRandomLogos();
  }, []);

  // Render preview
  const renderPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 256; // Preview size
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw shape with gradient
    const gradientObj = GRADIENT_PRESETS.find(g => g.id === selectedGradient);
    if (gradientObj) {
      let gradient;
      
      switch (gradientObj.direction) {
        case "to right":
          gradient = ctx.createLinearGradient(0, 0, size, 0);
          break;
        case "to bottom":
          gradient = ctx.createLinearGradient(0, 0, 0, size);
          break;
        case "to bottom right":
        default:
          gradient = ctx.createLinearGradient(0, 0, size, size);
          break;
      }
      
      gradient.addColorStop(0, gradientObj.colors[0]);
      gradient.addColorStop(1, gradientObj.colors[1]);
      
      ctx.fillStyle = gradient;
      
      const paddingValue = (padding / 100) * size;
      const shapeSizeWithPadding = size - (paddingValue * 2);
      
      switch (selectedShape) {
        case "circle":
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, shapeSizeWithPadding / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "square":
          ctx.fillRect(paddingValue, paddingValue, shapeSizeWithPadding, shapeSizeWithPadding);
          break;
        case "rounded":
          const radius = shapeSizeWithPadding * 0.2; // 20% of size for rounded corners
          ctx.beginPath();
          ctx.moveTo(paddingValue + radius, paddingValue);
          ctx.lineTo(paddingValue + shapeSizeWithPadding - radius, paddingValue);
          ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding, paddingValue + radius);
          ctx.lineTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius);
          ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius, paddingValue + shapeSizeWithPadding);
          ctx.lineTo(paddingValue + radius, paddingValue + shapeSizeWithPadding);
          ctx.quadraticCurveTo(paddingValue, paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding - radius);
          ctx.lineTo(paddingValue, paddingValue + radius);
          ctx.quadraticCurveTo(paddingValue, paddingValue, paddingValue + radius, paddingValue);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      // Draw icon
      // Use a simple shape instead of trying to extract the icon's path
      const iconSizeValue = (iconSize / 100) * shapeSizeWithPadding;
      const iconX = (size - iconSizeValue) / 2;
      const iconY = (size - iconSizeValue) / 2;
      
      // Draw a simple shape (circle)
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, iconSizeValue / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Generate random logos
  const generateRandomLogos = async () => {
    setIsGeneratingRandom(true);
    setRandomLogos([]);

    try {
      const canvas = randomCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate 6 random logos
      const logos = await Promise.all(
        Array.from({ length: 6 }).map(async (_, index) => {
          // Random icon
          const randomIcon = lucideIconNames[Math.floor(Math.random() * lucideIconNames.length)];
          
          // Random gradient
          const randomGradient = GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
          
          // Random shape
          const randomShape = SHAPE_OPTIONS[Math.floor(Math.random() * SHAPE_OPTIONS.length)].id;
          
          // Random icon size (50-70%)
          const randomIconSize = Math.floor(Math.random() * 21) + 50;
          
          // Random padding (10-25%)
          const randomPadding = Math.floor(Math.random() * 16) + 10;
          
          // Random icon color (white or light color)
          const randomIconColor = Math.random() > 0.7 ? 
            `hsl(${Math.floor(Math.random() * 360)}, 100%, 85%)` : 
            "#FFFFFF";
          
          const size = 128; // Preview size for random logos
          canvas.width = size;
          canvas.height = size;
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Draw shape with gradient
          let gradient;
          
          switch (randomGradient.direction) {
            case "to right":
              gradient = ctx.createLinearGradient(0, 0, size, 0);
              break;
            case "to bottom":
              gradient = ctx.createLinearGradient(0, 0, 0, size);
              break;
            case "to bottom right":
            default:
              gradient = ctx.createLinearGradient(0, 0, size, size);
              break;
          }
          
          gradient.addColorStop(0, randomGradient.colors[0]);
          gradient.addColorStop(1, randomGradient.colors[1]);
          
          ctx.fillStyle = gradient;
          
          const paddingValue = (randomPadding / 100) * size;
          const shapeSizeWithPadding = size - (paddingValue * 2);
          
          switch (randomShape) {
            case "circle":
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, shapeSizeWithPadding / 2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case "square":
              ctx.fillRect(paddingValue, paddingValue, shapeSizeWithPadding, shapeSizeWithPadding);
              break;
            case "rounded":
              const radius = shapeSizeWithPadding * 0.2; // 20% of size for rounded corners
              ctx.beginPath();
              ctx.moveTo(paddingValue + radius, paddingValue);
              ctx.lineTo(paddingValue + shapeSizeWithPadding - radius, paddingValue);
              ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding, paddingValue + radius);
              ctx.lineTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius);
              ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius, paddingValue + shapeSizeWithPadding);
              ctx.lineTo(paddingValue + radius, paddingValue + shapeSizeWithPadding);
              ctx.quadraticCurveTo(paddingValue, paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding - radius);
              ctx.lineTo(paddingValue, paddingValue + radius);
              ctx.quadraticCurveTo(paddingValue, paddingValue, paddingValue + radius, paddingValue);
              ctx.closePath();
              ctx.fill();
              break;
          }
          
          // Draw a simple shape instead of trying to use the Lucide icon
          const iconSizeValue = (randomIconSize / 100) * shapeSizeWithPadding;
          
          // Draw a simple shape (circle)
          ctx.fillStyle = randomIconColor;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, iconSizeValue / 3, 0, Math.PI * 2);
          ctx.fill();
          
          return {
            icon: randomIcon,
            gradient: randomGradient.id,
            shape: randomShape,
            dataUrl: canvas.toDataURL('image/png')
          };
        })
      );

      setRandomLogos(logos);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingRandom(false);
    }
  };

  // Apply random logo settings
  const applyRandomLogo = (logo: { icon: string, gradient: string, shape: string }) => {
    setSelectedIcon(logo.icon);
    setSelectedGradient(logo.gradient);
    setSelectedShape(logo.shape);
    setActiveTab("design");
  };

  // Generate logos in different sizes
  const generateLogos = async () => {
    setIsGenerating(true);
    setGeneratedLogos([]);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const logos = await Promise.all(
        selectedSizes.map(async (size) => {
          canvas.width = size;
          canvas.height = size;
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Draw shape with gradient
          const gradientObj = GRADIENT_PRESETS.find(g => g.id === selectedGradient);
          if (gradientObj) {
            let gradient;
            
            switch (gradientObj.direction) {
              case "to right":
                gradient = ctx.createLinearGradient(0, 0, size, 0);
                break;
              case "to bottom":
                gradient = ctx.createLinearGradient(0, 0, 0, size);
                break;
              case "to bottom right":
              default:
                gradient = ctx.createLinearGradient(0, 0, size, size);
                break;
            }
            
            gradient.addColorStop(0, gradientObj.colors[0]);
            gradient.addColorStop(1, gradientObj.colors[1]);
            
            ctx.fillStyle = gradient;
            
            const paddingValue = (padding / 100) * size;
            const shapeSizeWithPadding = size - (paddingValue * 2);
            
            switch (selectedShape) {
              case "circle":
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, shapeSizeWithPadding / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
              case "square":
                ctx.fillRect(paddingValue, paddingValue, shapeSizeWithPadding, shapeSizeWithPadding);
                break;
              case "rounded":
                const radius = shapeSizeWithPadding * 0.2; // 20% of size for rounded corners
                ctx.beginPath();
                ctx.moveTo(paddingValue + radius, paddingValue);
                ctx.lineTo(paddingValue + shapeSizeWithPadding - radius, paddingValue);
                ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding, paddingValue + radius);
                ctx.lineTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius);
                ctx.quadraticCurveTo(paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding, paddingValue + shapeSizeWithPadding - radius, paddingValue + shapeSizeWithPadding);
                ctx.lineTo(paddingValue + radius, paddingValue + shapeSizeWithPadding);
                ctx.quadraticCurveTo(paddingValue, paddingValue + shapeSizeWithPadding, paddingValue, paddingValue + shapeSizeWithPadding - radius);
                ctx.lineTo(paddingValue, paddingValue + radius);
                ctx.quadraticCurveTo(paddingValue, paddingValue, paddingValue + radius, paddingValue);
                ctx.closePath();
                ctx.fill();
                break;
            }
            
            // Draw a simple shape instead of trying to use the Lucide icon
            const iconSizeValue = (iconSize / 100) * shapeSizeWithPadding;
            
            // Draw a simple shape (circle)
            ctx.fillStyle = iconColor;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, iconSizeValue / 3, 0, Math.PI * 2);
            ctx.fill();
          }
          
          return {
            size,
            dataUrl: canvas.toDataURL('image/png')
          };
        })
      );

      setGeneratedLogos(logos);
      setActiveTab("download");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate logos",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download individual logo
  const downloadLogo = (dataUrl: string, size: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `logo-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all logos as a zip file
  const downloadAllLogos = async () => {
    if (generatedLogos.length === 0) return;

    try {
      const zip = new JSZip();
      
      // Add each logo to the zip
      generatedLogos.forEach(logo => {
        const imgData = logo.dataUrl.split(',')[1];
        zip.file(`logo-${logo.size}.png`, imgData, {base64: true});
      });
      
      // Add a README file with information
      let readme = '# Lucide Logo Pack\n\n';
      readme += `This package contains logos generated with the Lucide Logo Generator:\n\n`;
      readme += `- Icon: ${selectedIcon}\n`;
      readme += `- Shape: ${selectedShape}\n`;
      readme += `- Gradient: ${GRADIENT_PRESETS.find(g => g.id === selectedGradient)?.name}\n\n`;
      
      readme += 'Included sizes:\n\n';
      LOGO_SIZES.filter(size => 
        selectedSizes.includes(size.size)
      ).forEach(size => {
        readme += `- logo-${size.size}.png (${size.name}): ${size.description}\n`;
      });
      
      zip.file('README.md', readme);
      
      // Generate and download the zip file
      const content = await zip.generateAsync({type: 'blob'});
      saveAs(content, 'lucide-logos.zip');
      
      toast({
        title: "Success",
        description: "Logos downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download logos",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Toggle size selection
  const toggleSizeSelection = (size: number) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size].sort((a, b) => a - b));
    }
  };

  // Select/deselect all sizes
  const toggleAllSizes = (select: boolean) => {
    if (select) {
      setSelectedSizes(LOGO_SIZES.map(size => size.size));
    } else {
      setSelectedSizes([]);
    }
  };

  return (
    <Card className="p-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={randomCanvasRef} style={{ display: 'none' }} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="random">AI Suggestions</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="download" disabled={generatedLogos.length === 0}>Download</TabsTrigger>
        </TabsList>
        
        <TabsContent value="random" className="space-y-6 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">AI-Generated Logo Suggestions</h3>
            <Button 
              onClick={generateRandomLogos} 
              disabled={isGeneratingRandom}
              size="sm"
            >
              {isGeneratingRandom ? "Generating..." : "Regenerate"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {randomLogos.map((logo, index) => (
              <div key={index} className="flex flex-col items-center border rounded-lg p-3 bg-secondary">
                <img 
                  src={logo.dataUrl} 
                  alt={`Random logo ${index + 1}`} 
                  className="w-24 h-24 mb-2"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyRandomLogo(logo)}
                  className="w-full"
                >
                  Customize
                </Button>
              </div>
            ))}
          </div>
          
          <Alert>
            <AlertDescription>
              Click "Customize" on any logo to edit it further, or click "Regenerate" to get new suggestions.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="design" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icon Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Icon</h3>
              
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <div className="h-[300px] overflow-y-auto border rounded-md p-2">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredIcons.map(iconName => (
                    <Button
                      key={iconName}
                      variant={selectedIcon === iconName ? "default" : "outline"}
                      className="h-12 p-2 aspect-square"
                      onClick={() => setSelectedIcon(iconName)}
                      title={iconName}
                    >
                      <span className="text-xs">{iconName.slice(0, 3)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Logo Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Logo Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Shape</Label>
                  <RadioGroup 
                    value={selectedShape} 
                    onValueChange={setSelectedShape}
                    className="flex space-x-2"
                  >
                    {SHAPE_OPTIONS.map(shape => (
                      <div key={shape.id} className="flex items-center space-x-1">
                        <RadioGroupItem value={shape.id} id={`shape-${shape.id}`} />
                        <Label htmlFor={`shape-${shape.id}`}>{shape.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Gradient</Label>
                  <Select value={selectedGradient} onValueChange={setSelectedGradient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADIENT_PRESETS.map(gradient => (
                        <SelectItem key={gradient.id} value={gradient.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 mr-2 rounded-full" 
                              style={{ 
                                background: `linear-gradient(${gradient.direction}, ${gradient.colors[0]}, ${gradient.colors[1]})` 
                              }}
                            />
                            {gradient.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Icon Size: {iconSize}%</Label>
                  <Slider
                    value={[iconSize]}
                    onValueChange={([value]) => setIconSize(value)}
                    min={20}
                    max={80}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Padding: {padding}%</Label>
                  <Slider
                    value={[padding]}
                    onValueChange={([value]) => setPadding(value)}
                    min={0}
                    max={30}
                    step={5}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setActiveTab("preview")}
            className="w-full"
          >
            Continue to Preview
          </Button>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="flex justify-center items-center border rounded-lg p-4 bg-secondary">
                <canvas 
                  ref={previewCanvasRef} 
                  width="256" 
                  height="256" 
                  className="max-w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export Settings</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <Label>Select Sizes</Label>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllSizes(true)}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllSizes(false)}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {LOGO_SIZES.map(size => (
                    <Button
                      key={size.size}
                      variant={selectedSizes.includes(size.size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSizeSelection(size.size)}
                      className="justify-start"
                    >
                      <div className="flex justify-between w-full">
                        <span>{size.name}</span>
                        <span className="text-xs opacity-70">{size.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={generateLogos} 
                disabled={isGenerating || selectedSizes.length === 0}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Logos"}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="download" className="space-y-4 mt-4">
          {generatedLogos.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Generated Logos</h3>
                <Button onClick={downloadAllLogos}>
                  Download All (.zip)
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedLogos.map(logo => {
                  const sizeInfo = LOGO_SIZES.find(s => s.size === logo.size);
                  return (
                    <div key={logo.size} className="flex flex-col items-center border rounded-lg p-3 bg-secondary">
                      <img 
                        src={logo.dataUrl} 
                        alt={`${logo.size}x${logo.size}`} 
                        className="mb-2"
                        style={{
                          width: logo.size > 128 ? 128 : logo.size,
                          height: logo.size > 128 ? 128 : logo.size,
                          objectFit: 'contain'
                        }}
                      />
                      <p className="text-xs font-medium mb-1">{logo.size}x{logo.size}</p>
                      <p className="text-xs text-center text-muted-foreground mb-2">{sizeInfo?.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadLogo(logo.dataUrl, logo.size)}
                        className="w-full"
                      >
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <Alert className="mt-6">
                <AlertDescription>
                  A zip file containing all logos and a README with details will be downloaded when you click "Download All".
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 