'use client'
import React, { useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Input } from '@repo/ui/components/ui/input';

interface QRCodeGeneratorProps {
  url: string;
  shortCode?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, shortCode }) => {
  const [qrSize, setQrSize] = useState<number>(200);
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [qrLevel, setQrLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [activeTab, setActiveTab] = useState<string>("customize");
  
  const downloadQRCodeAsPNG = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = shortCode ? `qrcode-${shortCode}.png` : 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  const downloadQRCodeAsSVG = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.download = shortCode ? `qrcode-${shortCode}.svg` : 'qrcode.svg';
    link.href = svgUrl;
    link.click();
    
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">QR Code Generator</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="customize" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customize" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">QR Code Size</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="10"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{qrSize}px</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">QR Code Color</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-10 h-10 p-1"
                    />
                    <Input 
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-10 h-10 p-1"
                    />
                    <Input 
                      type="text"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Error Correction Level</label>
                <Select value={qrLevel} onValueChange={(value) => setQrLevel(value as "L" | "M" | "Q" | "H")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher correction levels make QR codes more resistant to damage but increase complexity.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-white p-4 rounded-md shadow-md inline-block mb-4">
                <QRCodeCanvas
                  id="qr-canvas"
                  value={url}
                  size={qrSize}
                  level={qrLevel}
                  fgColor={qrColor}
                  bgColor={qrBgColor}
                  includeMargin={true}
                />
                
                {/* Hidden SVG for SVG download */}
                <div className="hidden">
                  <QRCodeSVG
                    id="qr-svg"
                    value={url}
                    size={qrSize}
                    level={qrLevel}
                    fgColor={qrColor}
                    bgColor={qrBgColor}
                    includeMargin={true}
                  />
                </div>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 break-all">{url}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setActiveTab("customize")}>
          Edit QR Code
        </Button>
        <Button onClick={downloadQRCodeAsPNG}>
          Download PNG
        </Button>
        <Button variant="secondary" onClick={downloadQRCodeAsSVG}>
          Download SVG
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator;