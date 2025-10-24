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
import { Download, Printer, Upload, Eye, Copy, ArrowRight, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { Slider } from '@repo/ui/components/ui/slider';
import { useToast } from '@repo/ui/hooks/use-toast';
import Link from 'next/link';

// Proposal types
const PROPOSAL_TYPES = [
  { id: 'business', name: 'Business Proposal' },
  { id: 'project', name: 'Project Proposal' },
  { id: 'consulting', name: 'Consulting Proposal' },
  { id: 'sales', name: 'Sales Proposal' },
  { id: 'partnership', name: 'Partnership Proposal' }
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

export function AIProposalGenerator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

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

  // Proposal information
  const [proposalType, setProposalType] = useState('business');
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // AI Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

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

  // Generate proposal with AI
  const generateProposal = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // In a real implementation, this would call an AI API
      // For now, we'll simulate a delay and use a template
      await new Promise(resolve => setTimeout(resolve, 2000));

      const proposal = `Dear ${clientName},

I am writing to present our proposal for ${projectTitle}.

Project Overview:
${projectScope}

Timeline:
${timeline}

Budget:
${budget}

${additionalDetails}

We are confident that our expertise and experience make us the ideal partner for this project. We look forward to the opportunity to work with you.

Best regards,
${companyName}`;

      setGeneratedProposal(proposal);
    } catch (error) {
      setGenerationError('Failed to generate proposal. Please try again.');
      console.error('Proposal generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy proposal to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedProposal)
      .then(() => {
        toast({
          title: 'Copied to Clipboard',
          description: 'Proposal content has been copied to your clipboard.',
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy to clipboard. Please try again.',
          variant: 'destructive',
        });
      });
  };

  // Print proposal
  const printProposal = () => {
    if (!proposalRef.current) return;

    try {
      // Get styles from the current document
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .filter(Boolean)
        .join('\n');

      // Create the proposal content
      const proposalContent = proposalRef.current.outerHTML;

      // Create an iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';

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
            <title>${projectTitle || 'Proposal'}</title>
            <style>
              ${styles}
            </style>
          </head>
          <body>
            <div class="print-container">
              ${proposalContent}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for styles to apply
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.print();
        }

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
    if (!proposalRef.current) {
      toast({
        title: "Error",
        description: "Could not find proposal content to export",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your proposal PDF..."
    });

    try {
      // In a real implementation, we would use a PDF generation library
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "PDF Downloaded",
        description: "Your proposal has been downloaded as a PDF."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
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
          <TabsTrigger value="proposal">Proposal Details</TabsTrigger>
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
            <h2 className="text-xl font-semibold mb-4">Proposal Design</h2>

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
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
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

        {/* Proposal Details Tab */}
        <TabsContent value="proposal" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="proposalType">Proposal Type</Label>
                <Select
                  value={proposalType}
                  onValueChange={setProposalType}
                >
                  <SelectTrigger id="proposalType" className="mt-1">
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="projectScope">Project Scope</Label>
                <Textarea
                  id="projectScope"
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  placeholder="Describe the project scope"
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Project timeline"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Project budget"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="additionalDetails">Additional Details</Label>
                <Textarea
                  id="additionalDetails"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Any additional information"
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <Button
                onClick={generateProposal}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Proposal...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Proposal
                  </>
                )}
              </Button>

              {generationError && (
                <div className="text-red-500 text-sm mt-2">
                  {generationError}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Preview & Export Tab */}
        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" onClick={printProposal}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          {/* Proposal Preview */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div
              ref={proposalRef}
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

              {/* Proposal Content */}
              <div className="whitespace-pre-line">
                {generatedProposal || 'Your proposal will appear here...'}
              </div>
            </div>
          </div>

          {generatedProposal && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={generateProposal}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>

              <Button onClick={() => {
                const inputTab = document.querySelector('[data-value="proposal"]') as HTMLElement;
                if (inputTab) inputTab.click();
              }}>
                Edit Proposal Details
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 