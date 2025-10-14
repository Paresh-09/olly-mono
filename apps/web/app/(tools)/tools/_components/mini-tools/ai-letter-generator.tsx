"use client";

import { useState, useRef } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Label } from '@repo/ui/components/ui/label';
import { Card } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/ui/select';
import { Slider } from '@repo/ui/components/ui/slider';
import { Switch } from '@repo/ui/components/ui/switch';
import { useToast } from '@repo/ui/hooks/use-toast';
import { Download, Copy, Wand2, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Letter types
const LETTER_TYPES = [
  { id: 'inquiry', name: 'Business Inquiry' },
  { id: 'cover', name: 'Cover Letter' },
  { id: 'recommendation', name: 'Recommendation Letter' },
  { id: 'complaint', name: 'Complaint Letter' },
  { id: 'thank_you', name: 'Thank You Letter' },
  { id: 'sales', name: 'Sales Letter' },
  { id: 'apology', name: 'Apology Letter' },
  { id: 'invitation', name: 'Invitation Letter' },
  { id: 'introduction', name: 'Introduction Letter' },
  { id: 'resignation', name: 'Resignation Letter' },
  { id: 'request', name: 'Request Letter' },
  { id: 'followup', name: 'Follow-up Letter' }
];

// Language options
const LANGUAGES = [
  { id: 'en', name: 'English (US)' },
  { id: 'en-gb', name: 'English (UK)' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' }
];

// Sample letter templates
const SAMPLE_LETTERS: Record<string, string> = {
  inquiry: `Dear [Recipient],

I am writing to inquire about [specific product/service] that your company offers. Our organization, [Your Company Name], is currently looking for [specific need] and I believe your solutions might be a good fit for our requirements.

Could you please provide more information regarding your [product/service], including pricing, availability, and specifications? Additionally, I would appreciate if you could address the following questions:
1. [Question 1]
2. [Question 2]
3. [Question 3]

I look forward to your response and the possibility of doing business together.

Sincerely,
[Your Name]
[Your Position]
[Your Contact Information]`,

  cover: `Dear [Hiring Manager],

I am writing to express my interest in the [Job Title] position at [Company Name], as advertised on [Job Platform]. With [X years] of experience in [relevant field] and a proven track record of [key achievement], I am confident in my ability to make a valuable contribution to your team.

My professional background includes:
• [Relevant experience 1]
• [Relevant experience 2]
• [Relevant experience 3]

What particularly attracts me to this position is [specific aspect of the role or company]. My [specific skills/qualifications] align perfectly with the requirements in your job description.

I welcome the opportunity to discuss how my background, skills, and achievements would benefit [Company Name]. Thank you for considering my application.

Sincerely,
[Your Name]
[Your Contact Information]`,

  thank_you: `Dear [Recipient],

I wanted to express my sincere appreciation for [reason for thank you - meeting, gift, opportunity, etc.]. It was truly [positive adjective - thoughtful, generous, helpful, etc.].

[Additional details about why you're thankful and the impact it had]

[Optional: mention of future interaction or ongoing relationship]

Thank you again for your [kindness, generosity, support, etc.]. It means a great deal to me.

Warm regards,
[Your Name]`
};

export function AILetterGenerator() {
  const { toast } = useToast();
  
  // Form state
  const [letterType, setLetterType] = useState('inquiry');
  const [purpose, setPurpose] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [recipientPosition, setRecipientPosition] = useState('');
  const [yourName, setYourName] = useState('');
  const [yourCompany, setYourCompany] = useState('');
  const [yourPosition, setYourPosition] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  // Style options
  const [language, setLanguage] = useState('en');
  const [formalityLevel, setFormalityLevel] = useState(75);
  const [length, setLength] = useState(50);
  const [includeBulletPoints, setIncludeBulletPoints] = useState(true);
  
  // Generated letter
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate letter
  const generateLetter = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // that would use AI to generate the letter content
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For this demo, we'll create a mock response
      const formality = formalityLevel > 75 ? "formal" : formalityLevel > 40 ? "neutral" : "casual";
      const letterLength = length > 75 ? "detailed" : length > 40 ? "standard" : "brief";
      
      // Get template and personalize it
      let template = SAMPLE_LETTERS[letterType] || SAMPLE_LETTERS.inquiry;
      
      // Replace placeholders
      template = template.replace(/\[Recipient\]/g, recipientName || 'Recipient');
      template = template.replace(/\[Hiring Manager\]/g, recipientName || 'Hiring Manager');
      template = template.replace(/\[Your Company Name\]/g, yourCompany || 'Our Company');
      template = template.replace(/\[Your Name\]/g, yourName || 'Your Name');
      template = template.replace(/\[Your Position\]/g, yourPosition || 'Your Position');
      template = template.replace(/\[Company Name\]/g, recipientCompany || 'Company Name');
      
      // Add purpose if provided
      if (purpose) {
        template = template.replace(/\[specific product\/service\]/g, purpose);
        template = template.replace(/\[specific need\]/g, purpose);
        template = template.replace(/\[Job Title\]/g, purpose);
      }
      
      // Add additional details if provided
      if (additionalDetails) {
        const details = additionalDetails.split('\n').filter(d => d.trim());
        if (details.length > 0 && includeBulletPoints) {
          // Replace generic questions with actual details
          const bulletPointsSection = details.map(d => `• ${d}`).join('\n');
          template = template.replace(/1\. \[Question 1\]\n2\. \[Question 2\]\n3\. \[Question 3\]/g, bulletPointsSection);
          template = template.replace(/• \[Relevant experience 1\]\n• \[Relevant experience 2\]\n• \[Relevant experience 3\]/g, bulletPointsSection);
        }
      }
      
      setGeneratedLetter(template);
      
      toast({
        title: 'Letter Generated!',
        description: 'Your professional letter has been created successfully.',
      });
    } catch (error) {
      console.error('Error generating letter:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was a problem generating your letter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setPurpose('');
    setRecipientName('');
    setRecipientCompany('');
    setRecipientPosition('');
    setYourName('');
    setYourCompany('');
    setYourPosition('');
    setAdditionalDetails('');
    setFormalityLevel(75);
    setLength(50);
    setIncludeBulletPoints(true);
    setGeneratedLetter('');
  };
  
  // Copy letter to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter)
      .then(() => {
        toast({
          title: 'Copied to Clipboard',
          description: 'Letter content has been copied to your clipboard.',
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
  
  // Export to letterhead creator
  const exportToLetterhead = () => {
    // In a real implementation, this would:
    // 1. Save the letter content to localStorage or a state manager
    // 2. Redirect to the letterhead creator
    // 3. The letterhead creator would then load this content
    
    // For this demo, we'll just show a toast
    toast({
      title: 'Ready to Export',
      description: 'In a production environment, this would export directly to the letterhead creator tool.'
    });
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="input">Letter Details</TabsTrigger>
          <TabsTrigger value="output" disabled={!generatedLetter}>Generated Letter</TabsTrigger>
        </TabsList>
        
        {/* Input Form */}
        <TabsContent value="input" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Letter Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="letterType">Letter Type</Label>
                <Select
                  value={letterType}
                  onValueChange={setLetterType}
                >
                  <SelectTrigger id="letterType" className="mt-1">
                    <SelectValue placeholder="Select letter type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LETTER_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="purpose">Letter Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Job application, Product inquiry, Service request"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h3 className="text-md font-medium mb-2">Recipient Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="recipientName">Name</Label>
                      <Input
                        id="recipientName"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Recipient's name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recipientCompany">Company</Label>
                      <Input
                        id="recipientCompany"
                        value={recipientCompany}
                        onChange={(e) => setRecipientCompany(e.target.value)}
                        placeholder="Recipient's company"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recipientPosition">Position</Label>
                      <Input
                        id="recipientPosition"
                        value={recipientPosition}
                        onChange={(e) => setRecipientPosition(e.target.value)}
                        placeholder="Recipient's position"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">Your Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="yourName">Name</Label>
                      <Input
                        id="yourName"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yourCompany">Company</Label>
                      <Input
                        id="yourCompany"
                        value={yourCompany}
                        onChange={(e) => setYourCompany(e.target.value)}
                        placeholder="Your company"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yourPosition">Position</Label>
                      <Input
                        id="yourPosition"
                        value={yourPosition}
                        onChange={(e) => setYourPosition(e.target.value)}
                        placeholder="Your position"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="additionalDetails">Additional Details</Label>
                <Textarea
                  id="additionalDetails"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Key points to include in your letter (one per line)"
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">Enter important points one per line. These will be incorporated into your letter.</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Letter Style</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger id="language" className="mt-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="formality">Formality Level</Label>
                  <span className="text-sm text-gray-500">
                    {formalityLevel < 33 ? 'Casual' : formalityLevel < 66 ? 'Neutral' : 'Formal'}
                  </span>
                </div>
                <Slider 
                  id="formality"
                  min={0} 
                  max={100} 
                  step={1}
                  value={[formalityLevel]} 
                  onValueChange={(values) => setFormalityLevel(values[0])}
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="length">Letter Length</Label>
                  <span className="text-sm text-gray-500">
                    {length < 33 ? 'Brief' : length < 66 ? 'Standard' : 'Detailed'}
                  </span>
                </div>
                <Slider 
                  id="length"
                  min={0} 
                  max={100} 
                  step={1}
                  value={[length]} 
                  onValueChange={(values) => setLength(values[0])}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="bulletPoints"
                  checked={includeBulletPoints}
                  onCheckedChange={setIncludeBulletPoints}
                />
                <Label htmlFor="bulletPoints">Include bullet points for key information</Label>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={isGenerating}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Form
              </Button>
              
              <Button 
                onClick={generateLetter}
                disabled={isGenerating}
                className="min-w-[150px]"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Letter
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        {/* Output Content */}
        <TabsContent value="output" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Letter</h2>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                
                <Button variant="outline" size="sm" onClick={exportToLetterhead}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Export to Letterhead
                </Button>
                
                <Link href="/tools/letterhead-creator">
                  <Button variant="default" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Letterhead
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-md whitespace-pre-line min-h-[400px] border">
              {generatedLetter}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => generateLetter()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              
              <Button onClick={() => {
                const inputTab = document.querySelector('[data-value="input"]') as HTMLElement;
                if (inputTab) inputTab.click();
              }}>
                Edit Letter Details
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 