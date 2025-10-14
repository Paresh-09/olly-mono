"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Label } from '@repo/ui/components/ui/label';
import { Card } from '@repo/ui/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Download, Printer, Upload, Eye } from 'lucide-react';
import { Slider } from '@repo/ui/components/ui/slider';
import { useToast } from '@repo/ui/hooks/use-toast';

// Letterhead templates
const TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'professional', name: 'Professional' }
];

// Paper sizes
const PAPER_SIZES = [
  { id: 'letter', name: 'US Letter (8.5" x 11")' },
  { id: 'a4', name: 'A4 (210 x 297mm)' },
  { id: 'legal', name: 'Legal (8.5" x 14")' }
];

// Registration fields by country
const REGISTRATION_FIELDS = {
  india: [
    { id: 'cin', name: 'CIN (Corporate Identity Number)', placeholder: 'e.g., L12345AB6789CDE012345' },
    { id: 'gst', name: 'GSTIN', placeholder: 'e.g., 22AAAAA0000A1Z5' },
    { id: 'pan', name: 'PAN', placeholder: 'e.g., ABCDE1234F' }
  ],
  usa: [
    { id: 'ein', name: 'EIN (Employer Identification Number)', placeholder: 'e.g., 12-3456789' },
    { id: 'duns', name: 'DUNS Number', placeholder: 'e.g., 123456789' }
  ],
  uk: [
    { id: 'company_number', name: 'Company Number', placeholder: 'e.g., 12345678' },
    { id: 'vat', name: 'VAT Number', placeholder: 'e.g., GB123456789' }
  ],
  australia: [
    { id: 'abn', name: 'ABN (Australian Business Number)', placeholder: 'e.g., 12 345 678 901' },
    { id: 'acn', name: 'ACN (Australian Company Number)', placeholder: 'e.g., 123 456 789' }
  ]
};

export function LetterheadCreator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letterheadRef = useRef<HTMLDivElement>(null);
  
  // Company information
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  // Company registration information
  const [country, setCountry] = useState('india');
  const [registrationFields, setRegistrationFields] = useState<Record<string, string>>({});
  
  // Design options
  const [template, setTemplate] = useState('modern');
  const [paperSize, setPaperSize] = useState('letter');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e3a8a');
  const [logo, setLogo] = useState<string | null>(null);
  
  // Letter content
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [signatory, setSignatory] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');

  // Initialize registration fields
  useEffect(() => {
    const initialFields: Record<string, string> = {};
    REGISTRATION_FIELDS[country as keyof typeof REGISTRATION_FIELDS].forEach(field => {
      initialFields[field.id] = '';
    });
    setRegistrationFields(initialFields);
  }, [country]);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Update registration field value
  const updateRegistrationField = (fieldId: string, value: string) => {
    setRegistrationFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Print letterhead
  const printLetterhead = () => {
    if (!letterheadRef.current) return;
    
    try {
      // Get styles from the current document
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            // Cross-origin style sheets cannot be accessed
            return '';
          }
        })
        .filter(Boolean)
        .join('\n');
      
      // Create the letterhead content
      const letterheadContent = letterheadRef.current.outerHTML;
      
      // Create an iframe (this has better print behavior than a new window)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      
      // Add the iframe to the document and access its document
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }
      
      // Write the content to the iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${companyName || 'Company'} Letterhead</title>
            <style>
              /* Basic reset */
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              
              /* Critical print styles */
              @page {
                size: ${paperSize === 'a4' ? 'A4' : paperSize === 'legal' ? 'legal' : 'letter'};
                margin: 0mm !important;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                background-color: white !important;
              }
              
              /* Container for the letterhead */
              .print-container {
                width: ${paperSize === 'a4' ? '210mm' : '8.5in'};
                margin: 0 auto;
                padding: 0;
                background-color: white;
                position: relative;
              }
              
              /* Import specific styling for the letterhead elements */
              ${styles}
              
              /* Override any problematic styles */
              .bg-white {
                background-color: white !important;
              }
              
              /* Border styles */
              .border-t-4 { border-top-width: 4px !important; border-top-style: solid !important; }
              .border-t-8 { border-top-width: 8px !important; border-top-style: solid !important; }
              .border-b-8 { border-bottom-width: 8px !important; border-bottom-style: solid !important; }
              .border-l-8 { border-left-width: 8px !important; border-left-style: solid !important; }
              .border-t-12 { border-top-width: 12px !important; border-top-style: solid !important; }
              .border-2 { border-width: 2px !important; border-style: solid !important; }
              .border-t { border-top-width: 1px !important; border-top-style: solid !important; }
              
              /* Layout */
              .flex { display: flex !important; }
              .justify-between { justify-content: space-between !important; }
              .items-start { align-items: flex-start !important; }
              .items-center { align-items: center !important; }
              
              /* Spacing */
              .p-8 { padding: 2rem !important; }
              .mb-8 { margin-bottom: 2rem !important; }
              .mb-12 { margin-bottom: 3rem !important; }
              .mb-6 { margin-bottom: 1.5rem !important; }
              .mb-1 { margin-bottom: 0.25rem !important; }
              .mr-4 { margin-right: 1rem !important; }
              .pt-2 { padding-top: 0.5rem !important; }
              
              /* Typography */
              .text-2xl { font-size: 1.5rem !important; }
              .font-bold { font-weight: 700 !important; }
              .text-sm { font-size: 0.875rem !important; }
              .text-xs { font-size: 0.75rem !important; }
              .text-right { text-align: right !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-500 { color: #6b7280 !important; }
              .whitespace-pre-line { white-space: pre-line !important; }
              .font-semibold { font-weight: 600 !important; }
              
              /* Misc */
              .rounded-md { border-radius: 0.375rem !important; }
              .rounded-t-md { border-radius: 0.375rem 0.375rem 0 0 !important; }
              .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important; }
              .min-h-\\[200px\\] { min-height: 200px !important; }
              
              img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
              }
              
              /* Force color printing */
              * {
                color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">${letterheadContent}</div>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait a bit for styles to apply
      setTimeout(() => {
        // Print and then remove the iframe
        if (iframe.contentWindow) {
          iframe.contentWindow.print();
        }
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "There was a problem preparing the document for printing. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!letterheadRef.current) {
      toast({
        title: "Error",
        description: "Could not find letterhead content to export",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your letterhead PDF..."
    });
    
    try {
      // In a real implementation, we would load these libraries properly
      // with proper imports, but for this demo we'll load them dynamically
      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };
      
      // Load html2canvas and jsPDF from CDN
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      // Generate the PDF once libraries are loaded
      const fileName = `${companyName || 'Company'}_Letterhead.pdf`;
      
      // Use the loaded libraries (now available on window)
      const html2canvas = (window as any).html2canvas;
      const jspdf = (window as any).jspdf;
      
      if (!html2canvas || !jspdf) {
        throw new Error("Required libraries could not be loaded");
      }
      
      // Create a clone of the letterhead element to avoid modifying the original
      const element = letterheadRef.current.cloneNode(true) as HTMLElement;
      
      // Add letterhead to a container with fixed dimensions for pdf generation
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = paperSize === 'a4' ? '210mm' : '8.5in';
      document.body.appendChild(container);
      container.appendChild(element);
      
      // Generate canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF with proper dimensions
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: paperSize === 'a4' ? 'a4' : 'letter'
      });
      
      // Add the canvas as an image
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(container);
      
      toast({
        title: "PDF Downloaded",
        description: "Your letterhead has been downloaded as a PDF."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again. If the problem persists, try the text download instead.",
        variant: "destructive"
      });
      
      // Fallback to text download if PDF generation fails
      try {
        const fileName = `${companyName || 'Company'}_Letterhead.txt`;
        
        // Create letterhead content in text format
        let textContent = `${companyName || 'Company Name'}\n`;
        textContent += `${address || 'Company Address'}\n`;
        if (phone) textContent += `Phone: ${phone}\n`;
        if (email) textContent += `Email: ${email}\n`;
        if (website) textContent += `Web: ${website}\n\n`;
        
        // Add registration details
        const regDetails = Object.entries(registrationFields)
          .filter(([_, value]) => value)
          .map(([key, value]) => {
            const field = REGISTRATION_FIELDS[country as keyof typeof REGISTRATION_FIELDS].find(f => f.id === key);
            return `${field?.name}: ${value}`;
          });
          
        if (regDetails.length > 0) {
          textContent += regDetails.join('\n') + '\n\n';
        }
        
        // Add letter content
        textContent += `Date: ${date}\n\n`;
        textContent += `${recipient || 'Recipient'}\n\n`;
        if (subject) textContent += `Subject: ${subject}\n\n`;
        textContent += `${content || 'Letter content'}\n\n`;
        textContent += `Sincerely,\n`;
        textContent += `${signatory || 'Your Name'}\n`;
        textContent += `${signatureTitle || 'Your Title'}\n`;
        
        // Create a blob with the text content
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Text File Downloaded",
          description: "PDF generation failed, but we've downloaded your letterhead as a text file instead."
        });
      } catch (fallbackError) {
        console.error("Text fallback error:", fallbackError);
      }
    }
  };

  // Get template class
  const getTemplateClass = () => {
    switch (template) {
      case 'classic':
        return 'border-t-8 border-b-8';
      case 'minimalist':
        return 'border-l-8';
      case 'corporate':
        return 'border-t-12 rounded-t-md';
      case 'professional':
        return 'border-2 rounded-md';
      default: // modern
        return 'border-t-4';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="content">Letter Content</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>
        
        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center mt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={triggerFileInput}
                    className="flex items-center"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  {logo && (
                    <div className="ml-4 w-16 h-16">
                      <img 
                        src={logo} 
                        alt="Company Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter company address"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Website URL"
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Company Registration Information */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Company Registration Details</h3>
                
                <div className="mb-3">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={country}
                    onValueChange={setCountry}
                  >
                    <SelectTrigger id="country" className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REGISTRATION_FIELDS[country as keyof typeof REGISTRATION_FIELDS].map(field => (
                    <div key={field.id}>
                      <Label htmlFor={field.id}>{field.name}</Label>
                      <Input
                        id={field.id}
                        value={registrationFields[field.id] || ''}
                        onChange={(e) => updateRegistrationField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Letterhead Design</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Template Style</Label>
                <Select
                  value={template}
                  onValueChange={setTemplate}
                >
                  <SelectTrigger id="template" className="mt-1">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(tmpl => (
                      <SelectItem key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="paperSize">Paper Size</Label>
                <Select
                  value={paperSize}
                  onValueChange={setPaperSize}
                >
                  <SelectTrigger id="paperSize" className="mt-1">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_SIZES.map(size => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center mt-1">
                    <div 
                      className="h-8 w-8 rounded-md mr-2"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#000000"
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center mt-1">
                    <div 
                      className="h-8 w-8 rounded-md mr-2"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <Input
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#000000"
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Letter Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Letter Content</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Textarea
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Recipient name and address"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Letter subject"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Letter Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your letter content here..."
                  className="mt-1 min-h-[200px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signatory">Signatory Name</Label>
                  <Input
                    id="signatory"
                    value={signatory}
                    onChange={(e) => setSignatory(e.target.value)}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signatureTitle">Title/Position</Label>
                  <Input
                    id="signatureTitle"
                    value={signatureTitle}
                    onChange={(e) => setSignatureTitle(e.target.value)}
                    placeholder="Your position"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Preview & Export Tab */}
        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="outline" onClick={printLetterhead}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          {/* Letterhead Preview */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div
              ref={letterheadRef}
              className={`bg-white shadow-lg mx-auto p-8 ${getTemplateClass()} print:shadow-none`}
              style={{
                borderColor: primaryColor,
                width: paperSize === 'a4' ? '210mm' : '8.5in',
                minHeight: paperSize === 'legal' ? '14in' : paperSize === 'a4' ? '297mm' : '11in',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8" style={{ borderColor: primaryColor }}>
                <div className="flex items-center">
                  {logo && (
                    <div className="mr-4 w-16 h-16">
                      <img 
                        src={logo} 
                        alt="Company Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>{companyName || 'Company Name'}</h1>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{address || 'Company Address'}</p>
                  </div>
                </div>
                <div className="text-sm text-right text-gray-600">
                  <p>{phone && `Phone: ${phone}`}</p>
                  <p>{email && `Email: ${email}`}</p>
                  <p>{website && `Web: ${website}`}</p>
                </div>
              </div>
              
              {/* Registration Details */}
              {Object.keys(registrationFields).some(key => registrationFields[key]) && (
                <div className="text-xs text-gray-500 mb-8 border-t pt-2" style={{ borderColor: secondaryColor }}>
                  {Object.entries(registrationFields).map(([key, value]) => {
                    if (!value) return null;
                    const field = REGISTRATION_FIELDS[country as keyof typeof REGISTRATION_FIELDS].find(f => f.id === key);
                    return (
                      <span key={key} className="mr-4">
                        {field?.name}: {value}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* Date */}
              <div className="mb-8">
                <p>{date}</p>
              </div>
              
              {/* Recipient */}
              <div className="mb-8 whitespace-pre-line">
                <p>{recipient || 'Recipient details'}</p>
              </div>
              
              {/* Subject */}
              {subject && (
                <div className="mb-6">
                  <p className="font-semibold">Subject: {subject}</p>
                </div>
              )}
              
              {/* Content */}
              <div className="mb-12 whitespace-pre-line min-h-[200px]">
                <p>{content || 'Your letter content will appear here...'}</p>
              </div>
              
              {/* Signature */}
              <div>
                <p className="mb-1">Sincerely,</p>
                <p className="font-semibold">{signatory || 'Your Name'}</p>
                <p>{signatureTitle || 'Your Title'}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 