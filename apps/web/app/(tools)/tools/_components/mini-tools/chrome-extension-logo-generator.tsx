"use client";

import { useState, useRef } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Define Chrome extension logo sizes
const CHROME_LOGO_SIZES = [
  { size: 16, name: "16x16", description: "Browser action icon (1x)" },
  { size: 19, name: "19x19", description: "Toolbar icon (1x)" },
  { size: 32, name: "32x32", description: "Browser action icon (2x)" },
  { size: 38, name: "38x38", description: "Toolbar icon (2x)" },
  { size: 48, name: "48x48", description: "Extension management page (1x)" },
  { size: 96, name: "96x96", description: "Extension management page (2x)" },
  { size: 128, name: "128x128", description: "Chrome Web Store icon" }
];

// Background color options
const BACKGROUND_COLORS = [
  { value: "transparent", label: "Transparent" },
  { value: "#FFFFFF", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#0F172A", label: "Navy" },
  { value: "#EF4444", label: "Red" },
  { value: "#22C55E", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#A855F7", label: "Purple" },
  { value: "#F59E0B", label: "Orange" }
];

export const ChromeExtensionLogoGenerator = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<{ size: number, dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [selectedSizes, setSelectedSizes] = useState<number[]>(CHROME_LOGO_SIZES.map(size => size.size));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      setActiveTab("generate");
    };
    reader.readAsDataURL(file);
  };

  // Generate logos in different sizes
  const generateLogos = async () => {
    if (!originalImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedLogos([]);

    try {
      const img = new Image();
      img.src = originalImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const logos = await Promise.all(
        selectedSizes.map(async (size) => {
          canvas.width = size;
          canvas.height = size;
          
          // Fill background if not transparent
          if (backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, size, size);
          } else {
            ctx.clearRect(0, 0, size, size);
          }
          
          // Draw image centered and scaled to fit
          const scale = Math.min(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
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
    link.download = `icon-${size}.png`;
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
        zip.file(`icon-${logo.size}.png`, imgData, {base64: true});
      });
      
      // Generate manifest.json example
      let manifestJson = '{\n';
      manifestJson += '  "manifest_version": 3,\n';
      manifestJson += '  "name": "My Chrome Extension",\n';
      manifestJson += '  "version": "1.0",\n';
      manifestJson += '  "description": "Description of my Chrome extension",\n';
      manifestJson += '  "icons": {\n';
      
      // Add icon entries to manifest
      CHROME_LOGO_SIZES.filter(size => 
        selectedSizes.includes(size.size) && 
        [16, 32, 48, 128].includes(size.size)
      ).forEach((size, index, array) => {
        manifestJson += `    "${size.size}": "icon-${size.size}.png"${index < array.length - 1 ? ',' : ''}\n`;
      });
      
      manifestJson += '  },\n';
      manifestJson += '  "action": {\n';
      manifestJson += '    "default_icon": {\n';
      
      // Add action icon entries
      CHROME_LOGO_SIZES.filter(size => 
        selectedSizes.includes(size.size) && 
        [16, 32].includes(size.size)
      ).forEach((size, index, array) => {
        manifestJson += `      "${size.size}": "icon-${size.size}.png"${index < array.length - 1 ? ',' : ''}\n`;
      });
      
      manifestJson += '    }\n';
      manifestJson += '  }\n';
      manifestJson += '}\n';
      
      // Add the manifest file to the zip
      zip.file('manifest.json', manifestJson);
      
      // Add a README file with instructions
      let readme = '# Chrome Extension Icons\n\n';
      readme += 'This package contains icons for your Chrome extension in various sizes:\n\n';
      
      CHROME_LOGO_SIZES.filter(size => 
        selectedSizes.includes(size.size)
      ).forEach(size => {
        readme += `- icon-${size.size}.png (${size.name}): ${size.description}\n`;
      });
      
      readme += '\n## Usage\n\n';
      readme += 'These icons are referenced in the included manifest.json example.\n';
      readme += 'For more information on Chrome extension icons, visit:\n';
      readme += 'https://developer.chrome.com/docs/extensions/mv3/manifest/icons/\n';
      
      zip.file('README.md', readme);
      
      // Generate and download the zip file
      const content = await zip.generateAsync({type: 'blob'});
      saveAs(content, 'chrome-extension-icons.zip');
      
      toast({
        title: "Success",
        description: "Chrome extension logos downloaded successfully"
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
      setSelectedSizes(CHROME_LOGO_SIZES.map(size => size.size));
    } else {
      setSelectedSizes([]);
    }
  };

  return (
    <Card className="p-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate" disabled={!originalImage}>Generate</TabsTrigger>
          <TabsTrigger value="download" disabled={generatedLogos.length === 0}>Download</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4 mt-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-4"
            >
              Select Image
            </Button>
            <p className="text-sm text-muted-foreground">
              Upload a square image (PNG, JPG, SVG) for best results
            </p>
          </div>
          
          {originalImage && (
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="border rounded-lg p-2 bg-secondary">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="generate" className="space-y-4 mt-4">
          {originalImage && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-1/2">
                  <p className="text-sm font-medium mb-2">Original Image:</p>
                  <div className="border rounded-lg p-2 bg-secondary flex items-center justify-center">
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="max-w-full max-h-[200px] object-contain"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Background Color:</p>
                    <Select 
                      value={backgroundColor} 
                      onValueChange={setBackgroundColor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select background color" />
                      </SelectTrigger>
                      <SelectContent>
                        {BACKGROUND_COLORS.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 mr-2 rounded-full border" 
                                style={{ 
                                  backgroundColor: color.value,
                                  backgroundImage: color.value === 'transparent' ? 
                                    'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 
                                    'none',
                                  backgroundSize: '6px 6px',
                                  backgroundPosition: '0 0, 3px 3px'
                                }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Select Sizes:</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {CHROME_LOGO_SIZES.map(size => (
                        <Button
                          key={size.size}
                          variant={selectedSizes.includes(size.size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSizeSelection(size.size)}
                          className="justify-start text-left"
                        >
                          <div>
                            <div>{size.name}</div>
                            <div className="text-xs opacity-70">{size.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={generateLogos} 
                disabled={isGenerating || selectedSizes.length === 0}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Chrome Extension Logos"}
              </Button>
            </>
          )}
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {generatedLogos.map(logo => {
                  const sizeInfo = CHROME_LOGO_SIZES.find(s => s.size === logo.size);
                  return (
                    <div key={logo.size} className="flex flex-col items-center border rounded-lg p-3 bg-secondary">
                      <img 
                        src={logo.dataUrl} 
                        alt={`${logo.size}x${logo.size}`} 
                        className="mb-2"
                        style={{
                          width: logo.size > 64 ? 64 : logo.size,
                          height: logo.size > 64 ? 64 : logo.size,
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
                  A zip file containing all logos, a manifest.json example, and a README with usage instructions will be downloaded when you click "Download All".
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 