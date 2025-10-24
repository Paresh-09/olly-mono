"use client";

import { useState, useRef, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
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

// Define favicon sizes needed for modern web projects
const FAVICON_SIZES = [
  { size: 16, name: "16x16", description: "Classic favicon size" },
  { size: 32, name: "32x32", description: "Standard favicon size" },
  { size: 48, name: "48x48", description: "Windows site icons" },
  { size: 57, name: "57x57", description: "iOS Safari" },
  { size: 60, name: "60x60", description: "iOS Safari" },
  { size: 72, name: "72x72", description: "iPad icons" },
  { size: 76, name: "76x76", description: "iPad icons" },
  { size: 96, name: "96x96", description: "Google TV icon" },
  { size: 114, name: "114x114", description: "iOS retina touch" },
  { size: 120, name: "120x120", description: "iPhone retina touch" },
  { size: 144, name: "144x144", description: "IE10 Metro tile" },
  { size: 152, name: "152x152", description: "iPad retina touch" },
  { size: 180, name: "180x180", description: "iPhone 6 retina touch" },
  { size: 192, name: "192x192", description: "Android Chrome" },
  { size: 512, name: "512x512", description: "PWA icon" }
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

export const FaviconGenerator = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedFavicons, setGeneratedFavicons] = useState<{ size: number, dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [selectedSizes, setSelectedSizes] = useState<number[]>(FAVICON_SIZES.map(size => size.size));
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

  // Generate favicons in different sizes
  const generateFavicons = async () => {
    if (!originalImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedFavicons([]);

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

      const favicons = await Promise.all(
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

      setGeneratedFavicons(favicons);
      setActiveTab("download");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate favicons",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download individual favicon
  const downloadFavicon = (dataUrl: string, size: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `favicon-${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download favicon as ICO
  const downloadFaviconAsIco = async () => {
    if (generatedFavicons.length === 0) return;

    try {
      // We'll use the 16x16 and 32x32 sizes for the ICO file
      const sizes = [16, 32];
      const icoFavicons = generatedFavicons.filter(favicon => sizes.includes(favicon.size));

      if (icoFavicons.length === 0) {
        toast({
          title: "Error",
          description: "16x16 and 32x32 sizes are required for ICO format",
          variant: "destructive"
        });
        return;
      }

      // Create a FormData object to send to the server
      const formData = new FormData();

      // Add each favicon to the FormData
      icoFavicons.forEach(favicon => {
        // Convert data URL to Blob
        const byteString = atob(favicon.dataUrl.split(',')[1]);
        const mimeType = favicon.dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: mimeType });
        formData.append(`favicon-${favicon.size}`, blob, `favicon-${favicon.size}.png`);
      });

      // Use a client-side library to create the ICO file
      // For simplicity, we'll just combine the PNG files into a zip
      // In a real implementation, you would use a library like png2ico
      const zip = new JSZip();

      icoFavicons.forEach(favicon => {
        const imgData = favicon.dataUrl.split(',')[1];
        zip.file(`favicon-${favicon.size}.png`, imgData, { base64: true });
      });

      // Add a note about ICO conversion
      zip.file('README.txt', 'For true ICO conversion, please use an online converter like https://convertico.com/ or a desktop tool like ImageMagick.');

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'favicon-ico-files.zip');

      toast({
        title: "Success",
        description: "Favicon PNG files for ICO conversion downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download ICO files",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Download all favicons as a zip file
  const downloadAllFavicons = async () => {
    if (generatedFavicons.length === 0) return;

    try {
      const zip = new JSZip();

      // Add each favicon to the zip
      generatedFavicons.forEach(favicon => {
        const imgData = favicon.dataUrl.split(',')[1];
        zip.file(`favicon-${favicon.size}x${favicon.size}.png`, imgData, { base64: true });
      });

      // Generate HTML code for favicon links
      let htmlCode = '<!-- Favicon links for your HTML head section -->\n';
      htmlCode += '<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">\n';
      htmlCode += '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">\n';
      htmlCode += '<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="57x57" href="favicon-57x57.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="60x60" href="favicon-60x60.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="72x72" href="favicon-72x72.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="76x76" href="favicon-76x76.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="114x114" href="favicon-114x114.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="120x120" href="favicon-120x120.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="144x144" href="favicon-144x144.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="152x152" href="favicon-152x152.png">\n';
      htmlCode += '<link rel="apple-touch-icon" sizes="180x180" href="favicon-180x180.png">\n';
      htmlCode += '<link rel="icon" type="image/png" sizes="192x192" href="favicon-192x192.png">\n';
      htmlCode += '<link rel="icon" type="image/png" sizes="512x512" href="favicon-512x512.png">\n';
      htmlCode += '<meta name="msapplication-TileImage" content="favicon-144x144.png">\n';
      htmlCode += '<meta name="msapplication-TileColor" content="#ffffff">\n';

      // Add manifest.json example
      let manifestJson = '{\n';
      manifestJson += '  "icons": [\n';
      manifestJson += '    { "src": "favicon-192x192.png", "sizes": "192x192", "type": "image/png" },\n';
      manifestJson += '    { "src": "favicon-512x512.png", "sizes": "512x512", "type": "image/png" }\n';
      manifestJson += '  ]\n';
      manifestJson += '}\n';

      // Add the HTML and manifest files to the zip
      zip.file('favicon-html-code.txt', htmlCode);
      zip.file('manifest-icons-example.json', manifestJson);

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'favicons.zip');

      toast({
        title: "Success",
        description: "Favicons downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download favicons",
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
      setSelectedSizes(FAVICON_SIZES.map(size => size.size));
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
          <TabsTrigger value="download" disabled={generatedFavicons.length === 0}>Download</TabsTrigger>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {FAVICON_SIZES.map(size => (
                        <Button
                          key={size.size}
                          variant={selectedSizes.includes(size.size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSizeSelection(size.size)}
                          className="justify-start"
                        >
                          {size.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateFavicons}
                disabled={isGenerating || selectedSizes.length === 0}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Favicons"}
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="download" className="space-y-4 mt-4">
          {generatedFavicons.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Generated Favicons</h3>
                <div className="space-x-2">
                  <Button onClick={downloadFaviconAsIco} variant="outline">
                    Download as ICO
                  </Button>
                  <Button onClick={downloadAllFavicons}>
                    Download All (.zip)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedFavicons.map(favicon => (
                  <div key={favicon.size} className="flex flex-col items-center border rounded-lg p-3 bg-secondary">
                    <img
                      src={favicon.dataUrl}
                      alt={`${favicon.size}x${favicon.size}`}
                      className="mb-2"
                      style={{
                        width: favicon.size > 64 ? 64 : favicon.size,
                        height: favicon.size > 64 ? 64 : favicon.size,
                        objectFit: 'contain'
                      }}
                    />
                    <p className="text-xs font-medium mb-1">{favicon.size}x{favicon.size}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFavicon(favicon.dataUrl, favicon.size)}
                      className="w-full"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <AlertDescription>
                  A zip file containing all favicons, HTML code snippets, and a manifest.json example will be downloaded when you click "Download All".
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 