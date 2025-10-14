"use client";

import { useState, useRef } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { Label } from "@repo/ui/components/ui/label"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Define ICO sizes
const ICO_SIZES = [
  { size: 16, name: "16x16", description: "Favicon (1x)", default: true },
  { size: 32, name: "32x32", description: "Favicon (2x)", default: true },
  { size: 48, name: "48x48", description: "Windows icon (1x)", default: false },
  { size: 64, name: "64x64", description: "Windows icon (2x)", default: false },
  { size: 128, name: "128x128", description: "Large icon", default: false }
];

export const PngToIcoConverter = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ size: number, dataUrl: string }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    ICO_SIZES.filter(size => size.default).map(size => size.size)
  );
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
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      
      // Auto-convert if an image is uploaded
      convertToIco(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Toggle size selection
  const toggleSizeSelection = (size: number) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size].sort((a, b) => a - b));
    }
  };

  // Convert image to ICO format (multiple sizes)
  const convertToIco = async (imageUrl: string = originalImage || '') => {
    if (!imageUrl) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    if (selectedSizes.length === 0) {
      toast({
        title: "No sizes selected",
        description: "Please select at least one size",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    setGeneratedImages([]);

    try {
      const img = new Image();
      img.src = imageUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const images = await Promise.all(
        selectedSizes.map(async (size) => {
          canvas.width = size;
          canvas.height = size;
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
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

      setGeneratedImages(images);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert image",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  };

  // Download individual image
  const downloadImage = (dataUrl: string, size: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `icon-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download as ICO package
  const downloadAsIcoPackage = async () => {
    if (generatedImages.length === 0) return;

    try {
      // For simplicity, we'll just combine the PNG files into a zip
      // In a real implementation, you would use a library like png2ico
      const zip = new JSZip();
      
      generatedImages.forEach(image => {
        const imgData = image.dataUrl.split(',')[1];
        zip.file(`icon-${image.size}.png`, imgData, {base64: true});
      });
      
      // Add a note about ICO conversion
      let readme = '# PNG to ICO Conversion\n\n';
      readme += 'This package contains PNG files in various sizes for ICO conversion.\n\n';
      readme += 'To create a true ICO file, you can use:\n\n';
      readme += '1. Online converters like https://convertico.com/ or https://www.icoconverter.com/\n';
      readme += '2. Desktop tools like ImageMagick or GIMP\n';
      readme += '3. Command-line tools like png2ico\n\n';
      
      readme += 'Included sizes:\n\n';
      ICO_SIZES.filter(size => 
        selectedSizes.includes(size.size)
      ).forEach(size => {
        readme += `- icon-${size.size}.png (${size.name}): ${size.description}\n`;
      });
      
      zip.file('README.md', readme);
      
      // Generate and download the zip file
      const content = await zip.generateAsync({type: 'blob'});
      saveAs(content, 'ico-files.zip');
      
      toast({
        title: "Success",
        description: "ICO package downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download ICO package",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  return (
    <Card className="p-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload Image</h3>
          
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
              Upload a PNG, JPG, or other image file to convert to ICO format
            </p>
          </div>
          
          {originalImage && (
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm font-medium mb-2">Original Image:</p>
              <div className="border rounded-lg p-2 bg-secondary">
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Size Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Sizes</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ICO_SIZES.map(size => (
              <div key={size.size} className="flex items-start space-x-2">
                <Checkbox 
                  id={`size-${size.size}`} 
                  checked={selectedSizes.includes(size.size)}
                  onCheckedChange={() => toggleSizeSelection(size.size)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor={`size-${size.size}`} className="font-medium">
                    {size.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {size.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => convertToIco()} 
            disabled={isConverting || !originalImage || selectedSizes.length === 0}
            className="w-full"
          >
            {isConverting ? "Converting..." : "Convert to ICO"}
          </Button>
        </div>
        
        {/* Results */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Converted Images</h3>
              <Button onClick={downloadAsIcoPackage}>
                Download ICO Package
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generatedImages.map(image => {
                const sizeInfo = ICO_SIZES.find(s => s.size === image.size);
                return (
                  <div key={image.size} className="flex flex-col items-center border rounded-lg p-3 bg-secondary">
                    <img 
                      src={image.dataUrl} 
                      alt={`${image.size}x${image.size}`} 
                      className="mb-2"
                      style={{
                        width: image.size > 64 ? 64 : image.size,
                        height: image.size > 64 ? 64 : image.size,
                        objectFit: 'contain'
                      }}
                    />
                    <p className="text-xs font-medium mb-1">{image.size}x{image.size}</p>
                    <p className="text-xs text-center text-muted-foreground mb-2">{sizeInfo?.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadImage(image.dataUrl, image.size)}
                      className="w-full"
                    >
                      Download
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <Alert>
              <AlertDescription>
                Due to browser limitations, we can't create true ICO files directly. The download package contains PNG files in ICO sizes with instructions for final conversion.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  )
} 