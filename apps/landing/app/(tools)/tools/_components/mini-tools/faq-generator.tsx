"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { Switch } from "@repo/ui/components/ui/switch";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import AuthPopup from "../authentication";
import {
  Loader2,
  Copy,
  Save,
  RefreshCw,
  HelpCircle,
  FileText,
  Bookmark,
  Download,
  Edit,
  Trash2,
  Plus,
  PlusCircle,
  MessageSquare,
  FolderOpen,
  Check,
  ArrowUpDown,
} from "lucide-react";

// Define types
type FaqType = {
  value: string;
  label: string;
};

type FaqTone = {
  value: string;
  label: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type SavedFaqSet = {
  id: string;
  title: string;
  type: string;
  faqs: FaqItem[];
  date: string;
};

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

interface UsageTracking {
  count: number;
  date: string;
}

export function FaqGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("generator");
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [faqType, setFaqType] = useState<string>("product");
  const [faqTone, setFaqTone] = useState<string>("professional");
  const [desiredQuestionCount, setDesiredQuestionCount] = useState<string>("8");
  const [includeSchemaMarkup, setIncludeSchemaMarkup] = useState<boolean>(true);
  const [specificQuestions, setSpecificQuestions] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedFaqs, setGeneratedFaqs] = useState<FaqItem[]>([]);
  const [schemaMarkup, setSchemaMarkup] = useState<string>("");
  const [savedFaqs, setSavedFaqs] = useState<SavedFaqSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false);
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({
    count: 0,
    date: "",
  });

  const DAILY_FREE_LIMIT = 3;

  // Define available FAQ types
  const faqTypes: FaqType[] = [
    { value: "product", label: "Product/Service" },
    { value: "website", label: "Website/General" },
    { value: "ecommerce", label: "E-commerce/Shopping" },
    { value: "technical", label: "Technical Support" },
    { value: "company", label: "Company/Business" },
    { value: "educational", label: "Educational/Course" },
    { value: "event", label: "Event/Webinar" },
    { value: "legal", label: "Legal/Policy" },
  ];

  // Define available tone options
  const faqTones: FaqTone[] = [
    { value: "professional", label: "Professional" },
    { value: "conversational", label: "Conversational" },
    { value: "friendly", label: "Friendly & Approachable" },
    { value: "technical", label: "Technical & Detailed" },
    { value: "simple", label: "Simple & Clear" },
  ];

  // Define question count options
  const questionCountOptions = ["5", "8", "10", "12", "15"];

  // Load saved FAQs from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem("savedFaqs");
    if (savedItems) {
      setSavedFaqs(JSON.parse(savedItems));
    }

    checkAuthStatus();
    loadDailyUsage();
  }, []);

  // Check user authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/user/auth");
      const data: AuthCheckResponse = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  // Load daily usage from localStorage
  const loadDailyUsage = () => {
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem("faqGenerator_dailyUsage");

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage);
      if (usage.date === today) {
        setDailyUsage(usage);
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today };
        setDailyUsage(newUsage);
        localStorage.setItem(
          "faqGenerator_dailyUsage",
          JSON.stringify(newUsage)
        );
      }
    } else {
      const newUsage = { count: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem("faqGenerator_dailyUsage", JSON.stringify(newUsage));
    }
  };

  // Increment daily usage counter
  const incrementDailyUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today,
    };
    setDailyUsage(newUsage);
    localStorage.setItem("faqGenerator_dailyUsage", JSON.stringify(newUsage));
  };

  // Check if user can generate (auth check or increment usage)
  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) {
      // Authenticated users have unlimited access
      return true;
    }

    if (dailyUsage.count >= DAILY_FREE_LIMIT) {
      setShowAuthPopup(true);
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free generations. Please sign in for unlimited access.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle successful authentication
  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
    setShowAuthPopup(false);
    // User is now authenticated, they can continue using the tool
  };

  // Get FAQ type label
  const getFaqTypeLabel = (): string => {
    const found = faqTypes.find((opt) => opt.value === faqType);
    return found ? found.label : "Product/Service";
  };

  // Get tone label
  const getToneLabel = (): string => {
    const found = faqTones.find((opt) => opt.value === faqTone);
    return found ? found.label : "Professional";
  };

  // Generate FAQs
  const generateFaqs = async (): Promise<void> => {
    if (!productName) {
      toast({
        title: "Missing information",
        description:
          "Please enter at least a product/topic name to generate FAQs.",
        variant: "destructive",
      });
      return;
    }

    // Check usage limits for free users
    if (!checkUsageLimit()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API endpoint
      const response = await fetch("/api/tools/faq-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productDescription,
          faqType,
          faqTone,
          desiredQuestionCount: parseInt(desiredQuestionCount),
          includeSchemaMarkup,
          specificQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate FAQs");
      }

      setGeneratedFaqs(data.faqs);
      if (data.schemaMarkup) {
        setSchemaMarkup(data.schemaMarkup);
      }

      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }

      toast({
        title: "FAQs generated",
        description: `Successfully generated ${data.faqs.length} questions and answers.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy FAQs to clipboard (HTML format)
  const copyFaqsAsHtml = (): void => {
    if (generatedFaqs.length === 0) return;

    let htmlContent = '<div class="faq-section">\n';

    generatedFaqs.forEach((faq) => {
      htmlContent += `  <div class="faq-item">\n`;
      htmlContent += `    <h3 class="faq-question">${faq.question}</h3>\n`;
      htmlContent += `    <div class="faq-answer">\n      <p>${faq.answer}</p>\n    </div>\n`;
      htmlContent += `  </div>\n`;
    });

    htmlContent += "</div>";

    navigator.clipboard.writeText(htmlContent);
    toast({
      title: "HTML copied to clipboard",
      description: "FAQs have been copied in HTML format.",
    });
  };

  // Copy FAQs to clipboard (Text format)
  const copyFaqsAsText = (): void => {
    if (generatedFaqs.length === 0) return;

    let textContent = "";

    generatedFaqs.forEach((faq, index) => {
      textContent += `Q: ${faq.question}\n\n`;
      textContent += `A: ${faq.answer}\n\n`;
      if (index < generatedFaqs.length - 1) {
        textContent += "---\n\n";
      }
    });

    navigator.clipboard.writeText(textContent);
    toast({
      title: "Text copied to clipboard",
      description: "FAQs have been copied in text format.",
    });
  };

  // Copy schema markup to clipboard
  const copySchemaMarkup = (): void => {
    if (!schemaMarkup) return;

    navigator.clipboard.writeText(schemaMarkup);
    toast({
      title: "Schema markup copied",
      description: "JSON-LD schema markup has been copied to clipboard.",
    });
  };

  // Save FAQs to collection
  const saveFaqs = (): void => {
    if (generatedFaqs.length === 0) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save FAQ sets",
        variant: "destructive",
      });
      setShowAuthPopup(true);
      return;
    }

    const newId = Date.now().toString();
    const newSaved: SavedFaqSet = {
      id: newId,
      title: productName,
      type: faqType,
      faqs: generatedFaqs,
      date: new Date().toLocaleDateString(),
    };

    const updatedSaved = [...savedFaqs, newSaved];
    setSavedFaqs(updatedSaved);
    localStorage.setItem("savedFaqs", JSON.stringify(updatedSaved));

    toast({
      title: "FAQs saved",
      description: "Your FAQ set has been saved to your collection.",
    });
  };

  // Delete a saved FAQ set
  const deleteFaqSet = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent triggering the parent click handler

    const updatedSaved = savedFaqs.filter((item) => item.id !== id);
    setSavedFaqs(updatedSaved);
    localStorage.setItem("savedFaqs", JSON.stringify(updatedSaved));

    toast({
      title: "FAQ set deleted",
      description: "The saved FAQ set has been removed.",
    });
  };

  // Load a saved FAQ set
  const loadFaqSet = (faqSet: SavedFaqSet): void => {
    setGeneratedFaqs(faqSet.faqs);
    setProductName(faqSet.title);
    setFaqType(faqSet.type);
    setActiveTab("generator");

    // Generate schema markup again if needed
    if (includeSchemaMarkup) {
      generateSchemaMarkup(faqSet.faqs, faqSet.title);
    }

    toast({
      title: "FAQ set loaded",
      description: "The selected FAQ set has been loaded.",
    });
  };

  // Generate schema markup for a set of FAQs
  const generateSchemaMarkup = (faqs: FaqItem[], title: string): void => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    setSchemaMarkup(JSON.stringify(schema, null, 2));
  };

  // Reset form
  const resetForm = (): void => {
    setProductName("");
    setProductDescription("");
    setFaqType("product");
    setFaqTone("professional");
    setDesiredQuestionCount("8");
    setIncludeSchemaMarkup(true);
    setSpecificQuestions("");
    setGeneratedFaqs([]);
    setSchemaMarkup("");
    setError(null);
  };

  // Download FAQs as HTML
  const downloadFaqsAsHtml = (): void => {
    if (generatedFaqs.length === 0) return;

    let htmlContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    htmlContent += '  <meta charset="UTF-8">\n';
    htmlContent += `  <title>FAQ: ${productName}</title>\n`;
    htmlContent += "  <style>\n";
    htmlContent +=
      "    .faq-section { max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; }\n";
    htmlContent +=
      "    .faq-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }\n";
    htmlContent +=
      "    .faq-question { font-size: 18px; margin-bottom: 10px; color: #333; }\n";
    htmlContent += "    .faq-answer { line-height: 1.5; color: #555; }\n";
    htmlContent += "  </style>\n";

    // Add schema markup if included
    if (schemaMarkup) {
      htmlContent += '  <script type="application/ld+json">\n';
      htmlContent += schemaMarkup + "\n";
      htmlContent += "  </script>\n";
    }

    htmlContent += "</head>\n<body>\n";
    htmlContent += '  <div class="faq-section">\n';
    htmlContent += `    <h1>Frequently Asked Questions: ${productName}</h1>\n\n`;

    generatedFaqs.forEach((faq) => {
      htmlContent += '    <div class="faq-item">\n';
      htmlContent += `      <h3 class="faq-question">${faq.question}</h3>\n`;
      htmlContent += `      <div class="faq-answer">\n        <p>${faq.answer}</p>\n      </div>\n`;
      htmlContent += "    </div>\n\n";
    });

    htmlContent += "  </div>\n</body>\n</html>";

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-faq.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto max-w-6xl">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free generations
            remaining today. Sign in for unlimited access and to save your FAQ
            sets.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted rounded-lg p-1 mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <span className="flex items-center justify-center">
                <HelpCircle className="h-4 w-4 mr-2" /> Generate FAQs
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <span className="flex items-center justify-center">
                <Bookmark className="h-4 w-4 mr-2" /> Saved FAQs (
                {savedFaqs.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Generator Tab */}
        <TabsContent value="generator" className="mt-0">
          <div className="grid gap-8 md:grid-cols-12">
            <Card className="col-span-12 md:col-span-5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  FAQ Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="productName" className="text-base">
                      Product/Topic Name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Online Course Platform, Fitness App, Web Hosting"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productDescription" className="text-base">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Describe your product, website, or topic in more detail"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      More details help generate better, more specific FAQs
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faqType" className="text-base">
                        FAQ Type
                      </Label>
                      <Select value={faqType} onValueChange={setFaqType}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select FAQ type" />
                        </SelectTrigger>
                        <SelectContent>
                          {faqTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="faqTone" className="text-base">
                        Tone
                      </Label>
                      <Select value={faqTone} onValueChange={setFaqTone}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {faqTones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="desiredQuestionCount"
                        className="text-base"
                      >
                        Number of Questions
                      </Label>
                      <Select
                        value={desiredQuestionCount}
                        onValueChange={setDesiredQuestionCount}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionCountOptions.map((count) => (
                            <SelectItem key={count} value={count}>
                              {count} Questions
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center mt-8">
                      <Switch
                        id="includeSchemaMarkup"
                        checked={includeSchemaMarkup}
                        onCheckedChange={setIncludeSchemaMarkup}
                      />
                      <Label
                        htmlFor="includeSchemaMarkup"
                        className="text-base ml-2"
                      >
                        Include Schema Markup
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specificQuestions" className="text-base">
                      Specific Questions (Optional)
                    </Label>
                    <Textarea
                      id="specificQuestions"
                      placeholder="Add any specific questions you want to include (one per line)"
                      value={specificQuestions}
                      onChange={(e) => setSpecificQuestions(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter one question per line
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={generateFaqs}
                  disabled={
                    loading ||
                    (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)
                  }
                  className="px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Generate FAQs
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-12 md:col-span-7">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Generated FAQs
                  </div>

                  {generatedFaqs.length > 0 && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadFaqsAsHtml}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download HTML
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveFaqs}
                        disabled={!isAuthenticated}
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Generating comprehensive FAQs...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a few seconds
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[400px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating FAQs</p>
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={resetForm}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : generatedFaqs.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyFaqsAsHtml}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy HTML
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyFaqsAsText}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy Text
                      </Button>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {generatedFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {schemaMarkup && (
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-medium">
                            Schema Markup (JSON-LD)
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copySchemaMarkup}
                          >
                            <Copy className="h-4 w-4 mr-1" /> Copy Markup
                          </Button>
                        </div>
                        <div className="bg-muted p-3 rounded-md max-h-56 overflow-y-auto">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">
                            {schemaMarkup}
                          </pre>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Add this markup to your page's HTML to improve search
                          engine visibility with FAQ schema.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[400px] flex items-center justify-center p-6">
                    <div>
                      <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        No FAQs Generated Yet
                      </p>
                      <p className="text-sm max-w-md mx-auto">
                        Fill in your product/topic details and click "Generate
                        FAQs" to create a comprehensive FAQ section.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved FAQs Tab */}
        <TabsContent value="saved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Bookmark className="mr-2 h-5 w-5 text-primary" />
                Saved FAQ Sets
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Authentication Required
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your FAQ sets.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAuthPopup(true)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedFaqs.length === 0 ? (
                <div className="text-center p-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Saved FAQ Sets
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate and save FAQ sets to access them later for your
                    products or website.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("generator")}
                  >
                    Generate FAQs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedFaqs.map((faqSet) => (
                    <div
                      key={faqSet.id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-base font-medium">
                            {faqSet.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getFaqTypeLabel()}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {faqSet.faqs.length} questions • Saved on{" "}
                              {faqSet.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadFaqSet(faqSet)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => deleteFaqSet(faqSet.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="preview">
                          <AccordionTrigger className="text-sm text-muted-foreground py-2">
                            Preview Questions
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="pl-5 list-disc space-y-1">
                              {faqSet.faqs.slice(0, 3).map((faq, idx) => (
                                <li key={idx} className="text-sm">
                                  {faq.question}
                                </li>
                              ))}
                              {faqSet.faqs.length > 3 && (
                                <li className="text-sm text-muted-foreground">
                                  + {faqSet.faqs.length - 3} more questions
                                </li>
                              )}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </div>
  );
}
