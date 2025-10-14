"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Download, Printer, Upload, Plus, Trash, FileText, Eye } from 'lucide-react';
import { useToast } from '@repo/ui/hooks/use-toast';
import { Switch } from '@repo/ui/components/ui/switch';
import { Separator } from '@repo/ui/components/ui/separator';
import { Pacifico, Dancing_Script, Great_Vibes, Alex_Brush } from 'next/font/google';

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing-script'
});

const pacifico = Pacifico({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico'
});

const greatVibes = Great_Vibes({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes'
});

const alexBrush = Alex_Brush({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alex-brush'
});

// Currency options
const CURRENCIES = [
  { id: 'usd', name: 'USD ($)', symbol: '$' },
  { id: 'eur', name: 'EUR (€)', symbol: '€' },
  { id: 'gbp', name: 'GBP (£)', symbol: '£' },
  { id: 'inr', name: 'INR (₹)', symbol: '₹' },
  { id: 'aud', name: 'AUD (A$)', symbol: 'A$' },
  { id: 'cad', name: 'CAD (C$)', symbol: 'C$' },
  { id: 'jpy', name: 'JPY (¥)', symbol: '¥' },
] as const;

// Invoice templates
const TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'professional', name: 'Professional' },
  { id: 'corporate', name: 'Corporate' },
] as const;

// Tax presets by country
const TAX_PRESETS = {
  us: [
    { id: 'none', name: 'No Tax', value: 0 },
    { id: 'sales', name: 'Sales Tax', value: 8.5 },
  ],
  eu: [
    { id: 'none', name: 'No VAT', value: 0 },
    { id: 'reduced', name: 'Reduced VAT', value: 10 },
    { id: 'standard', name: 'Standard VAT', value: 20 },
  ],
  uk: [
    { id: 'none', name: 'No VAT', value: 0 },
    { id: 'reduced', name: 'Reduced VAT', value: 5 },
    { id: 'standard', name: 'Standard VAT', value: 20 },
  ],
  india: [
    { id: 'none', name: 'No GST', value: 0 },
    { id: 'gst5', name: 'GST 5%', value: 5 },
    { id: 'gst12', name: 'GST 12%', value: 12 },
    { id: 'gst18', name: 'GST 18%', value: 18 },
    { id: 'gst28', name: 'GST 28%', value: 28 },
  ],
} as const;

// Signature fonts
const SIGNATURE_FONTS = [
  { id: 'dancing-script', name: 'Dancing Script', className: 'font-dancing-script' },
  { id: 'pacifico', name: 'Pacifico', className: 'font-pacifico' },
  { id: 'great-vibes', name: 'Great Vibes', className: 'font-great-vibes' },
  { id: 'alex-brush', name: 'Alex Brush', className: 'font-alex-brush' },
] as const;

// Storage key
const STORAGE_KEY = 'ai-invoice-generator-settings';

// Types
interface SignatureState {
  type: 'draw' | 'text' | null;
  value: string | null;
}

interface StoredSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  businessLogo: string | null;
  taxRegNumber: string;
  template: string;
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;
  paymentTerms: string;
  paymentInstructions: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankIBAN: string;
  bankSwiftCode: string;
}

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

export function AIInvoiceGenerator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Hook to manage local storage
  const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
    const readValue = () => {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue = (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    };

    return [storedValue, setValue];
  };

  // Load stored settings
  const [storedSettings, setStoredSettings] = useLocalStorage<StoredSettings>(STORAGE_KEY, {
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessLogo: null,
    taxRegNumber: '',
    template: 'modern',
    primaryColor: '#3b82f6',
    accentColor: '#1e3a8a',
    showLogo: true,
    paymentTerms: 'Payment due within 30 days',
    paymentInstructions: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankIBAN: '',
    bankSwiftCode: '',
  });

  // Move all state declarations here
  const [signatureType, setSignatureType] = useState<'draw' | 'text'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [signatureFont, setSignatureFont] = useState('dancing-script');
  const [signatureTitle, setSignatureTitle] = useState('');
  const [signature, setSignature] = useState<SignatureState>({ type: null, value: null });
  const [isDrawing, setIsDrawing] = useState(false);

  // Business information
  const [businessName, setBusinessName] = useState(storedSettings.businessName);
  const [businessAddress, setBusinessAddress] = useState(storedSettings.businessAddress);
  const [businessPhone, setBusinessPhone] = useState(storedSettings.businessPhone);
  const [businessEmail, setBusinessEmail] = useState(storedSettings.businessEmail);
  const [businessWebsite, setBusinessWebsite] = useState(storedSettings.businessWebsite);
  const [businessLogo, setBusinessLogo] = useState<string | null>(storedSettings.businessLogo);
  const [taxRegNumber, setTaxRegNumber] = useState(storedSettings.taxRegNumber);
  
  // Client information
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Invoice details
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-001`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<string>('usd');
  const [taxCountry, setTaxCountry] = useState<keyof typeof TAX_PRESETS>('us');
  const [taxType, setTaxType] = useState('none');
  const [taxRate, setTaxRate] = useState(0);
  const [customTaxRate, setCustomTaxRate] = useState(0);
  const [isCustomTaxRate, setIsCustomTaxRate] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState(storedSettings.paymentTerms);
  const [paymentInstructions, setPaymentInstructions] = useState(storedSettings.paymentInstructions);
  
  // Bank details
  const [bankName, setBankName] = useState(storedSettings.bankName);
  const [bankAccountName, setBankAccountName] = useState(storedSettings.bankAccountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(storedSettings.bankAccountNumber);
  const [bankRoutingNumber, setBankRoutingNumber] = useState(storedSettings.bankRoutingNumber);
  const [bankIBAN, setBankIBAN] = useState(storedSettings.bankIBAN);
  const [bankSwiftCode, setBankSwiftCode] = useState(storedSettings.bankSwiftCode);
  
  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }
  ]);
  
  // Design options
  const [template, setTemplate] = useState(storedSettings.template);
  const [primaryColor, setPrimaryColor] = useState(storedSettings.primaryColor);
  const [accentColor, setAccentColor] = useState(storedSettings.accentColor);
  const [showLogo, setShowLogo] = useState(storedSettings.showLogo);
  
  // Tax name
  const [taxName, setTaxName] = useState('Tax');
  
  // Utility functions
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Memoize the storage update function
  const debouncedSetStoredSettings = useCallback(
    debounce((newSettings: StoredSettings) => {
      setStoredSettings(newSettings);
    }, 500),
    [setStoredSettings]
  );
  
  // Calculate line item amount
  const calculateItemAmount = useCallback((quantity: number, unitPrice: number, discount = 0): number => {
    return (quantity * unitPrice) * (1 - discount / 100);
  }, []);
  
  // Update line item
  const updateItem = useCallback((id: number, field: keyof LineItem, value: string | number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate amount when quantity, unit price, or discount changes
          if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            updatedItem.amount = calculateItemAmount(
              field === 'quantity' ? Number(value) : item.quantity,
              field === 'unitPrice' ? Number(value) : item.unitPrice,
              field === 'discount' ? Number(value) : item.discount
            );
          }
          return updatedItem;
        }
        return item;
      });
    });
  }, [calculateItemAmount]);
  
  // Add new line item
  const addItem = () => {
    const newId = Math.max(0, ...items.map(item => item.id)) + 1;
    setItems([...items, { id: newId, description: '', quantity: 1, unitPrice: 0, discount: 0, amount: 0 }]);
  };
  
  // Remove line item
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast({
        title: "Cannot Remove",
        description: "You need at least one line item in your invoice.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate subtotal
  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };
  
  // Calculate tax amount
  const calculateTaxAmount = (subtotal: number): number => {
    const rate = isCustomTaxRate ? customTaxRate : taxRate;
    return subtotal * (rate / 100);
  };
  
  // Calculate total
  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount(subtotal);
    return subtotal + taxAmount;
  };
  
  // Format currency
  const getCurrencySymbol = (currencyId: string): string => {
    const currency = CURRENCIES.find(c => c.id === currencyId);
    return currency ? currency.symbol : '$';
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setBusinessLogo(reader.result as string);
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
  
  // Update tax rate when tax type changes
  useEffect(() => {
    if (!isCustomTaxRate && taxType !== 'custom') {
      const selectedTax = TAX_PRESETS[taxCountry].find(tax => tax.id === taxType);
      setTaxRate(selectedTax ? selectedTax.value : 0);
    }
  }, [taxType, taxCountry, isCustomTaxRate]);
  
  // Update tax presets when country changes
  useEffect(() => {
    // Reset to first tax type when country changes
    setTaxType(TAX_PRESETS[taxCountry][0].id);
  }, [taxCountry]);
  
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
  
  // Print invoice
  const printInvoice = () => {
    if (!invoiceRef.current) return;
    
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
      
      // Create the invoice content
      const invoiceContent = invoiceRef.current.outerHTML;
      
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
            <title>${businessName || 'Business'} Invoice</title>
            <style>
              /* Basic reset */
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              
              /* Critical print styles */
              @page {
                size: letter;
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
              
              /* Import specific styling for the invoice elements */
              ${styles}
              
              /* Force color printing */
              * {
                color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Table styles for printing */
              table {
                width: 100%;
                border-collapse: collapse;
              }
              
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              
              th {
                background-color: #f8f9fa !important;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="print-container" style="max-width: 8.5in; margin: 0 auto;">${invoiceContent}</div>
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

  // Add these functions near other utility functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (signatureCanvasRef.current) {
      setSignature({ type: 'draw', value: signatureCanvasRef.current.toDataURL() });
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature({ type: null, value: null });
  };

  // Update the generatePDF function to optimize PDF size
  const generatePDF = async () => {
    if (!invoiceRef.current) {
      toast({
        title: "Error",
        description: "Could not find invoice content to export",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your invoice PDF..."
    });
    
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const html2canvas = window.html2canvas;
      const jspdf = window.jspdf;
      
      if (!html2canvas || !jspdf) {
        throw new Error("Required libraries could not be loaded");
      }
      
      const element = invoiceRef.current.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '8.5in';
      document.body.appendChild(container);
      container.appendChild(element);
      
      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced from 2 to optimize size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        onclone: (clonedDoc: Document) => {
          // Optimize any images in the cloned document
          const images = Array.from(clonedDoc.getElementsByTagName('img'));
          for (const img of images) {
            img.style.maxWidth = '600px'; // Limit image size
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality
      
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      pdf.save(`Invoice_${invoiceNumber.replace(/\s+/g, '-')}.pdf`);
      
      document.body.removeChild(container);
      
      toast({
        title: "PDF Downloaded",
        description: "Your invoice has been downloaded as a PDF."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again or use the print option instead.",
        variant: "destructive"
      });
    }
  };

  // Save settings when they change
  useEffect(() => {
    debouncedSetStoredSettings({
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessLogo,
      taxRegNumber,
      template,
      primaryColor,
      accentColor,
      showLogo,
      paymentTerms,
      paymentInstructions,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankRoutingNumber,
      bankIBAN,
      bankSwiftCode,
    });
  }, [
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    businessWebsite,
    businessLogo,
    taxRegNumber,
    template,
    primaryColor,
    accentColor,
    showLogo,
    paymentTerms,
    paymentInstructions,
    debouncedSetStoredSettings,
    bankName,
    bankAccountName,
    bankAccountNumber,
    bankRoutingNumber,
    bankIBAN,
    bankSwiftCode,
  ]);

  // Add this with other utility functions inside the component
  const formatCurrency = (amount: number, currencyId = currency): string => {
    const symbol = getCurrencySymbol(currencyId);
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${dancingScript.variable} ${pacifico.variable} ${greatVibes.variable} ${alexBrush.variable}`}>
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="client">Client Info</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>
        
        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Business Logo</Label>
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
                  {businessLogo && (
                    <div className="ml-4 w-16 h-16">
                      <img 
                        src={businessLogo} 
                        alt="Business Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter business name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="businessAddress">Address</Label>
                <Textarea
                  id="businessAddress"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Enter business address"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input
                    id="businessPhone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="Email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    placeholder="Website URL"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="taxRegNumber">Tax/Registration Number</Label>
                <Input
                  id="taxRegNumber"
                  value={taxRegNumber}
                  onChange={(e) => setTaxRegNumber(e.target.value)}
                  placeholder="VAT/GST/EIN number"
                  className="mt-1"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankAccountName">Account Holder Name</Label>
                    <Input
                      id="bankAccountName"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                    <Input
                      id="bankRoutingNumber"
                      value={bankRoutingNumber}
                      onChange={(e) => setBankRoutingNumber(e.target.value)}
                      placeholder="Enter routing/sort code"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankIBAN">IBAN</Label>
                    <Input
                      id="bankIBAN"
                      value={bankIBAN}
                      onChange={(e) => setBankIBAN(e.target.value)}
                      placeholder="Enter IBAN (International)"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankSwiftCode">SWIFT/BIC Code</Label>
                    <Input
                      id="bankSwiftCode"
                      value={bankSwiftCode}
                      onChange={(e) => setBankSwiftCode(e.target.value)}
                      placeholder="Enter SWIFT/BIC code"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Invoice Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g., INV-2023-001"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Client Information Tab */}
        <TabsContent value="client" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            
            <div className="space-y-4">
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
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Enter client address"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Client phone number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g., Payment due within 30 days"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="e.g., Please make payment via bank transfer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes to include on the invoice"
                  className="mt-1"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankAccountName">Account Holder Name</Label>
                    <Input
                      id="bankAccountName"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                    <Input
                      id="bankRoutingNumber"
                      value={bankRoutingNumber}
                      onChange={(e) => setBankRoutingNumber(e.target.value)}
                      placeholder="Enter routing/sort code"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankIBAN">IBAN</Label>
                    <Input
                      id="bankIBAN"
                      value={bankIBAN}
                      onChange={(e) => setBankIBAN(e.target.value)}
                      placeholder="Enter IBAN (International)"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankSwiftCode">SWIFT/BIC Code</Label>
                    <Input
                      id="bankSwiftCode"
                      value={bankSwiftCode}
                      onChange={(e) => setBankSwiftCode(e.target.value)}
                      placeholder="Enter SWIFT/BIC code"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Line Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
            
            <div className="space-y-4">
              <div className="mb-3">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger id="currency" className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(curr => (
                      <SelectItem key={curr.id} value={curr.id}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Discount %</div>
                  <div className="col-span-1">Actions</div>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={addItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4 mt-8 border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Tax Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxCountry">Tax Region</Label>
                    <Select
                      value={taxCountry}
                      onValueChange={(value: keyof typeof TAX_PRESETS) => setTaxCountry(value)}
                    >
                      <SelectTrigger id="taxCountry" className="mt-1">
                        <SelectValue placeholder="Select tax region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="eu">European Union</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="taxName">Tax Name</Label>
                    <Input
                      id="taxName"
                      value={taxName}
                      onChange={(e) => setTaxName(e.target.value)}
                      placeholder="e.g., GST, VAT, Sales Tax"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="customTaxRate"
                    checked={isCustomTaxRate}
                    onCheckedChange={setIsCustomTaxRate}
                  />
                  <Label htmlFor="customTaxRate">Use custom tax rate</Label>
                </div>
                
                {isCustomTaxRate && (
                  <div>
                    <Label htmlFor="customTaxRate">Custom Tax Rate (%)</Label>
                    <Input
                      id="customTaxRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customTaxRate}
                      onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Design Options</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Template Style</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger id="template" className="mt-1">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(temp => (
                      <SelectItem key={temp.id} value={temp.id}>
                        {temp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLogo"
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                />
                <Label htmlFor="showLogo">Show Business Logo</Label>
              </div>
            </div>

            <div className="space-y-4 mt-8 border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Signature</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={signatureType === 'draw' ? 'default' : 'outline'}
                    onClick={() => setSignatureType('draw')}
                  >
                    Draw Signature
                  </Button>
                  <Button
                    variant={signatureType === 'text' ? 'default' : 'outline'}
                    onClick={() => setSignatureType('text')}
                  >
                    Text Signature
                  </Button>
                </div>

                {signatureType === 'draw' ? (
                  <div className="space-y-2">
                    <div className="border rounded-lg p-2">
                      <canvas
                        ref={signatureCanvasRef}
                        width={400}
                        height={150}
                        className="border border-gray-200 rounded w-full touch-none"
                        style={{ backgroundColor: '#fff' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                    <Button variant="outline" onClick={clearSignature}>
                      Clear Signature
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signatureText">Signature Text</Label>
                      <Input
                        id="signatureText"
                        value={signatureText}
                        onChange={(e) => {
                          setSignatureText(e.target.value);
                          setSignature({ type: 'text', value: e.target.value });
                        }}
                        placeholder="Enter your name or title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signatureTitle">Title/Position</Label>
                      <Input
                        id="signatureTitle"
                        value={signatureTitle}
                        onChange={(e) => setSignatureTitle(e.target.value)}
                        placeholder="e.g., CEO, Director, Manager"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signatureFont">Signature Style</Label>
                      <Select
                        value={signatureFont}
                        onValueChange={(value) => {
                          setSignatureFont(value);
                          setSignature({ type: 'text', value: signatureText });
                        }}
                      >
                        <SelectTrigger id="signatureFont" className="mt-1">
                          <SelectValue placeholder="Select font style" />
                        </SelectTrigger>
                        <SelectContent>
                          {SIGNATURE_FONTS.map(font => (
                            <SelectItem key={font.id} value={font.id}>
                              <span className={font.className}>{font.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      {signatureText && (
                        <p className={`text-3xl ${SIGNATURE_FONTS.find(f => f.id === signatureFont)?.className}`}>
                          {signatureText}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preview & Export Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview & Export</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={printInvoice}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={generatePDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div 
              ref={invoiceRef} 
              className={`bg-white p-8 rounded-lg shadow-lg ${getTemplateClass()}`}
              style={{ borderColor: primaryColor }}
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  {showLogo && businessLogo && (
                    <img 
                      src={businessLogo} 
                      alt="Business Logo" 
                      className="max-w-[200px] max-h-[100px] mb-4"
                    />
                  )}
                  <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {businessName}
                  </h1>
                  <div className="mt-2 text-gray-600">
                    <p>{businessAddress}</p>
                    <p>{businessPhone}</p>
                    <p>{businessEmail}</p>
                    <p>{businessWebsite}</p>
                    {taxRegNumber && <p>Tax/Reg No: {taxRegNumber}</p>}
                  </div>
                </div>
                
                <div className="text-right">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: accentColor }}>
                    INVOICE
                  </h2>
                  <div className="text-gray-600">
                    <p>Invoice #: {invoiceNumber}</p>
                    <p>Date: {new Date(invoiceDate).toLocaleDateString()}</p>
                    <p>Due Date: {new Date(dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
                  Bill To:
                </h3>
                <div className="text-gray-600">
                  <p className="font-semibold">{clientName}</p>
                  <p>{clientAddress}</p>
                  <p>{clientEmail}</p>
                  <p>{clientPhone}</p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    {items.some(item => item.discount > 0) && (
                      <th className="text-right py-2">Discount</th>
                    )}
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                      {items.some(item => item.discount > 0) && (
                        <td className="text-right py-2">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                      )}
                      <td className="text-right py-2">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>{taxName} ({isCustomTaxRate ? customTaxRate : taxRate}%):</span>
                    <span>{formatCurrency(calculateTaxAmount(calculateSubtotal()))}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="space-y-4 text-sm text-gray-600">
                {notes && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>Notes:</h4>
                    <p>{notes}</p>
                  </div>
                )}
                {paymentTerms && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>Payment Terms:</h4>
                    <p>{paymentTerms}</p>
                  </div>
                )}
                {paymentInstructions && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>Payment Instructions:</h4>
                    <p>{paymentInstructions}</p>
                  </div>
                )}
                
                {/* Bank Details */}
                {(bankName || bankAccountName || bankAccountNumber || bankRoutingNumber || bankIBAN || bankSwiftCode) && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>Bank Details:</h4>
                    <div className="space-y-1">
                      {bankName && <p>Bank: {bankName}</p>}
                      {bankAccountName && <p>Account Name: {bankAccountName}</p>}
                      {bankAccountNumber && <p>Account Number: {bankAccountNumber}</p>}
                      {bankRoutingNumber && <p>Routing Number: {bankRoutingNumber}</p>}
                      {bankIBAN && <p>IBAN: {bankIBAN}</p>}
                      {bankSwiftCode && <p>SWIFT/BIC: {bankSwiftCode}</p>}
                    </div>
                  </div>
                )}
              </div>

              {signature.value && (
                <div className="mb-8">
                  <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>Authorized Signature:</h4>
                  {signature.type === 'text' ? (
                    <div>
                      <p className={`text-3xl ${SIGNATURE_FONTS.find(f => f.id === signatureFont)?.className}`}>
                        {signature.value}
                      </p>
                      {signatureTitle && (
                        <p className="text-sm text-gray-600 mt-1">{signatureTitle}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <img src={signature.value} alt="Signature" className="max-h-[100px]" />
                      {signatureTitle && (
                        <p className="text-sm text-gray-600 mt-1">{signatureTitle}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


