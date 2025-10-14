'use client'
import React, { useState, useEffect, useRef } from 'react';

interface FormDataInterface {
  url: string;
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCardType;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonical: string;
  robots: RobotsDirective;
  viewport: string;
}

type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';
type RobotsDirective = 'index, follow' | 'index, nofollow' | 'noindex, follow' | 'noindex, nofollow';
type TabType = 'basic' | 'social' | 'advanced';

interface PresetOption {
  label: string;
  value: string;
}

const MetaTagGenerator: React.FC = () => {
  // Use useRef to track whether the form data was updated by AI
  const updatedByAi = useRef<boolean>(false);
  
  const [formData, setFormData] = useState<FormDataInterface>({
    url: '',
    title: '',
    description: '',
    keywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonical: '',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0'
  });

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<boolean>(false);
  const [pageDescription, setPageDescription] = useState<string>('');

  // Manual generation of meta tags
  const generateMetaTags = (): void => {
    let code = '';
    
    // Basic meta tags
    if (formData.title) {
      code += `<title>${formData.title}</title>\n`;
      code += `<meta name="title" content="${formData.title}" />\n`;
    }
    
    if (formData.description) {
      code += `<meta name="description" content="${formData.description}" />\n`;
    }
    
    if (formData.keywords) {
      code += `<meta name="keywords" content="${formData.keywords}" />\n`;
    }
    
    if (formData.author) {
      code += `<meta name="author" content="${formData.author}" />\n`;
    }
    
    if (formData.robots) {
      code += `<meta name="robots" content="${formData.robots}" />\n`;
    }
    
    if (formData.viewport) {
      code += `<meta name="viewport" content="${formData.viewport}" />\n`;
    }
    
    // Open Graph tags
    if (formData.ogTitle || formData.title) {
      code += `<meta property="og:title" content="${formData.ogTitle || formData.title}" />\n`;
    }
    
    if (formData.ogDescription || formData.description) {
      code += `<meta property="og:description" content="${formData.ogDescription || formData.description}" />\n`;
    }
    
    if (formData.ogImage) {
      code += `<meta property="og:image" content="${formData.ogImage}" />\n`;
    }
    
    code += `<meta property="og:type" content="website" />\n`;
    
    if (formData.canonical) {
      code += `<meta property="og:url" content="${formData.canonical}" />\n`;
      code += `<link rel="canonical" href="${formData.canonical}" />\n`;
    }
    
    // Twitter tags
    if (formData.twitterCard) {
      code += `<meta name="twitter:card" content="${formData.twitterCard}" />\n`;
    }
    
    if (formData.twitterTitle || formData.ogTitle || formData.title) {
      code += `<meta name="twitter:title" content="${formData.twitterTitle || formData.ogTitle || formData.title}" />\n`;
    }
    
    if (formData.twitterDescription || formData.ogDescription || formData.description) {
      code += `<meta name="twitter:description" content="${formData.twitterDescription || formData.ogDescription || formData.description}" />\n`;
    }
    
    if (formData.twitterImage || formData.ogImage) {
      code += `<meta name="twitter:image" content="${formData.twitterImage || formData.ogImage}" />\n`;
    }
    
    setGeneratedCode(code);
  };

  // AI meta tag generation
  const generateAIMetaTags = async (): Promise<void> => {
    if (!pageDescription.trim()) {
      alert("Please enter a page description for AI to generate meta tags");
      return;
    }
  
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/tools/generate-meta-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: pageDescription,
          url: formData.url || null
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      
      // Extract the meta tags and HTML from the response
      const { metaTags, metaTagsHtml } = data;
      
      if (!metaTags || !metaTagsHtml) {
        throw new Error("No meta tag data received from the API");
      }

      // Flag that this update is from AI
      updatedByAi.current = true;
  
      // Update the form with the AI-generated values
      setFormData({
        ...formData,
        title: metaTags.title || '',
        description: metaTags.description || '',
        keywords: metaTags.keywords || '',
        ogTitle: metaTags.ogTitle || '',
        ogDescription: metaTags.ogDescription || '',
        twitterCard: metaTags.twitterCard as TwitterCardType || 'summary_large_image',
        twitterTitle: metaTags.twitterTitle || metaTags.ogTitle || '',
        twitterDescription: metaTags.twitterDescription || metaTags.ogDescription || '',
        viewport: metaTags.viewport || formData.viewport,
        robots: metaTags.robots as RobotsDirective || formData.robots
      });
  
      // Set the generated code directly from the HTML response
      setGeneratedCode(metaTagsHtml);
  
    } catch (error) {
      console.error("Error generating AI meta tags:", error);
      
      // Fallback to the simpler algorithm if the API fails
      try {
        const words = pageDescription.split(' ');
        const mainKeywords = words
          .filter(word => word.length > 3)
          .filter(word => !['with', 'that', 'this', 'from', 'about', 'have', 'will'].includes(word.toLowerCase()))
          .slice(0, 5);
  
        const aiTitle = mainKeywords
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
  
        let aiDescription = pageDescription.slice(0, 157) + (pageDescription.length > 157 ? '...' : '');
  
        const aiKeywords = mainKeywords.join(', ').toLowerCase();
  
        const ogPrefix = ["Discover", "Explore", "Learn About", "Check Out", "See Why"][Math.floor(Math.random() * 5)];
        const aiOgTitle = `${ogPrefix}: ${aiTitle}`;
  
        // Flag that this update is from AI
        updatedByAi.current = true;
        
        setFormData({
          ...formData,
          title: aiTitle,
          description: aiDescription,
          keywords: aiKeywords,
          ogTitle: aiOgTitle,
          ogDescription: aiDescription,
          twitterCard: 'summary_large_image',
          twitterTitle: aiOgTitle,
          twitterDescription: aiDescription
        });
        
        // Generate HTML for the fallback mode
        let fallbackHtml = '';
        if (aiTitle) {
          fallbackHtml += `<title>${aiTitle}</title>\n`;
          fallbackHtml += `<meta name="title" content="${aiTitle}" />\n`;
        }
        
        if (aiDescription) {
          fallbackHtml += `<meta name="description" content="${aiDescription}" />\n`;
        }
        
        if (aiKeywords) {
          fallbackHtml += `<meta name="keywords" content="${aiKeywords}" />\n`;
        }
        
        fallbackHtml += `<meta name="robots" content="index, follow" />\n`;
        fallbackHtml += `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n`;
        
        if (aiOgTitle) {
          fallbackHtml += `<meta property="og:title" content="${aiOgTitle}" />\n`;
        }
        
        if (aiDescription) {
          fallbackHtml += `<meta property="og:description" content="${aiDescription}" />\n`;
        }
        
        fallbackHtml += `<meta property="og:type" content="website" />\n`;
        
        fallbackHtml += `<meta name="twitter:card" content="summary_large_image" />\n`;
        
        if (aiOgTitle) {
          fallbackHtml += `<meta name="twitter:title" content="${aiOgTitle}" />\n`;
        }
        
        if (aiDescription) {
          fallbackHtml += `<meta name="twitter:description" content="${aiDescription}" />\n`;
        }
        
        setGeneratedCode(fallbackHtml);
        
        // Show a warning about using fallback mode
        alert("Using fallback mode to generate meta tags. For better results, try again later.");
      } catch (fallbackError) {
        alert("There was an error generating AI meta tags. Please try again or use manual mode.");
      }
    } finally {
      setIsGenerating(false);
      // Reset the AI flag after completion
      setTimeout(() => {
        updatedByAi.current = false;
      }, 100);
    }
  };

  // Modified useEffect to prevent infinite loops
  useEffect(() => {
    // Only generate meta tags in manual mode and if not updated by AI
    if (!aiMode && !updatedByAi.current) {
      generateMetaTags();
    }
  }, [formData, aiMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const presetOptions: PresetOption[] = [
    { label: 'Blog Article', value: 'blog' },
    { label: 'E-commerce Product', value: 'product' },
    { label: 'Landing Page', value: 'landing' },
    { label: 'Portfolio Page', value: 'portfolio' }
  ];

  const applyPreset = (preset: string): void => {
    switch(preset) {
      case 'blog':
        setFormData({
          ...formData,
          title: 'My Blog Article Title',
          description: 'A comprehensive guide about this subject with insights and analysis.',
          keywords: 'blog, article, guide, insights, analysis',
          robots: 'index, follow',
          ogTitle: 'Read Now: My Blog Article Title',
          twitterCard: 'summary_large_image'
        });
        break;
      case 'product':
        setFormData({
          ...formData,
          title: 'Product Name - Features & Specifications',
          description: 'Discover our premium product with amazing features. Fast shipping, satisfaction guaranteed.',
          keywords: 'product, features, buy, shop, purchase, specifications',
          robots: 'index, follow',
          ogTitle: 'Buy Now: Product Name',
          twitterCard: 'summary_large_image'
        });
        break;
      case 'landing':
        setFormData({
          ...formData,
          title: 'Service Name | Main Value Proposition',
          description: 'Transform your experience with our innovative service. Sign up today for exclusive benefits.',
          keywords: 'service, solution, sign up, benefits, free trial',
          robots: 'index, follow',
          ogTitle: 'Service Name - Start Today!',
          twitterCard: 'summary_large_image'
        });
        break;
      case 'portfolio':
        setFormData({
          ...formData,
          title: 'Full Name - Professional Title | Portfolio',
          description: 'Creative professional with expertise in key areas. View my portfolio showcasing my best work.',
          keywords: 'portfolio, professional, projects, work, expertise',
          robots: 'index, follow',
          ogTitle: 'Full Name - Professional Portfolio',
          twitterCard: 'summary'
        });
        break;
      default:
        break;
    }
  };

  // Updated mode toggle function to handle transition properly
  const toggleAiMode = (): void => {
    // When switching from AI to manual mode, we need to ensure the 
    // meta tags are generated once without causing a loop
    if (aiMode) {
      // First switch to manual mode
      setAiMode(false);
      // Then manually trigger meta tag generation
      setTimeout(() => generateMetaTags(), 0);
    } else {
      // Just switch to AI mode
      setAiMode(true);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* AI Mode Toggle Switch */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Meta Tag Generator</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Manual</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={aiMode} 
                onChange={toggleAiMode} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">AI Assist</span>
          </div>
        </div>

        {aiMode ? (
          /* AI Mode Content */
          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-700">
                In AI mode, describe your page content and let the AI generate optimized meta tags for you.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL (optional)
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="https://example.com/page"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Content Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={5}
                placeholder="Describe your page content in detail for better AI-generated meta tags..."
              ></textarea>
              <div className="text-xs text-gray-500 mt-1">
                Provide details about what your page is about, its purpose, target audience, and any important keywords.
              </div>
            </div>

            <button
              onClick={generateAIMetaTags}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-md bg-blue-600 text-white flex items-center justify-center ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Meta Tags...
                </>
              ) : (
                'Generate AI Meta Tags'
              )}
            </button>
          </div>
        ) : (
          /* Manual Mode Content */
          <div className="mb-6">
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 rounded-md ${activeTab === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Basic SEO
              </button>
              <button 
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-md ${activeTab === 'social' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Social Media
              </button>
              <button 
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 rounded-md ${activeTab === 'advanced' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Advanced
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Presets:</label>
              <div className="flex flex-wrap gap-2">
                {presetOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => applyPreset(option.value)}
                    className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Enter page title (50-60 characters)"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Characters: {formData.title.length}/60
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={3}
                    placeholder="Enter description (150-160 characters)"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    Characters: {formData.description.length}/160
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Page author"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Open Graph Title
                  </label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={formData.ogTitle}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Title for social media sharing"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Leave blank to use page title
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Open Graph Description
                  </label>
                  <textarea
                    name="ogDescription"
                    value={formData.ogDescription}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={2}
                    placeholder="Description for social media sharing"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    Leave blank to use meta description
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    name="ogImage"
                    value={formData.ogImage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter Card Type
                  </label>
                  <select
                    name="twitterCard"
                    value={formData.twitterCard}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter Title
                  </label>
                  <input
                    type="text"
                    name="twitterTitle"
                    value={formData.twitterTitle}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Twitter-specific title"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Leave blank to use OG or page title
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter Image URL
                  </label>
                  <input
                    type="text"
                    name="twitterImage"
                    value={formData.twitterImage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="https://example.com/twitter-image.jpg"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Leave blank to use OG image
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    name="canonical"
                    value={formData.canonical}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="https://example.com/page"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Robots
                  </label>
                  <select
                    name="robots"
                    value={formData.robots}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="index, follow">Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Viewport
                  </label>
                  <input
                    type="text"
                    name="viewport"
                    value={formData.viewport}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="width=device-width, initial-scale=1.0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Generated Meta Tags</h3>
            <button
              onClick={copyToClipboard}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
              {generatedCode || '<Add required information to generate meta tags>'}
            </pre>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">SEO Tips:</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
            <li>Keep title tags between 50-60 characters to avoid truncation in search results</li>
            <li>Meta descriptions should be 150-160 characters and include a call to action</li>
            <li>Use relevant keywords naturally in both title and description</li>
            <li>Ensure Open Graph tags are set up for better social media sharing</li>
            <li>Use a canonical URL to avoid duplicate content issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MetaTagGenerator;