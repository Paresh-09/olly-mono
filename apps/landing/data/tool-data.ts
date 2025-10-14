import { Tool } from "@/types/tools";

export const toolsData: Record<string, Tool> = {
  "facebook-engagement-calculator": {
    id: "facebook-engagement-calculator",
    name: "Facebook Engagement Calculator",
    description:
      "Calculate your Facebook engagement rate and optimize your page performance",
    features: [
      "Free forever",
      "Real-time engagement calculation",
      "Multiple engagement metrics",
      "Algorithm-friendly insights",
      "Page optimization tips",
      "Business performance tracking",
    ],
    howToUse: [
      "Enter your post metrics (likes, comments, shares, reactions)",
      "Input your current page followers count",
      "Click 'Calculate Facebook Engagement Rate'",
      "Review your engagement percentage and insights",
      "Get personalized recommendations for page growth",
    ],
    faqs: [
      {
        question: "What is a good Facebook engagement rate?",
        answer:
          "A good Facebook engagement rate typically ranges from 1-5% for most pages, with 2-3% being considered above average for business pages due to Facebook's algorithm changes.",
      },
      {
        question: "How is Facebook engagement rate calculated?",
        answer:
          "Engagement rate is calculated as (Likes + Comments + Shares + Reactions) ÷ Page Followers × 100. Our tool uses this standard formula for accurate Facebook metrics.",
      },
      {
        question: "Does Facebook's algorithm affect engagement rates?",
        answer:
          "Yes, Facebook's algorithm heavily impacts organic reach. The calculator helps you understand your actual engagement performance within the current algorithm constraints.",
      },
      {
        question: "Can I use this for Facebook Groups?",
        answer:
          "The calculator is designed for Facebook Pages, but can be adapted for Group content by using group member count instead of page followers.",
      },
      {
        question: "Is my Facebook data stored or shared?",
        answer:
          "No, all calculations are performed locally in your browser. We don't store or share any of your Facebook page data or metrics.",
      },
    ],
  },

  "youtube-engagement-calculator": {
    id: "youtube-engagement-calculator",
    name: "YouTube Engagement Calculator",
    description:
      "Calculate your YouTube engagement rate and improve your video performance",
    features: [
      "Free forever",
      "Real-time engagement calculation",
      "Video performance metrics",
      "Algorithm optimization insights",
      "Creator growth tips",
      "Channel analytics support",
    ],
    howToUse: [
      "Enter your video metrics (likes, comments, shares)",
      "Input your current subscriber count or video views",
      "Click 'Calculate YouTube Engagement Rate'",
      "Review your engagement percentage and performance grade",
      "Get personalized recommendations for channel growth",
    ],
    faqs: [
      {
        question: "What is a good YouTube engagement rate?",
        answer:
          "Good YouTube engagement rates vary by channel size: 4-8% for channels under 100K subscribers, 3-6% for 100K-1M subscribers, and 2-4% for channels over 1M subscribers.",
      },
      {
        question: "How is YouTube engagement rate calculated?",
        answer:
          "YouTube engagement rate can be calculated as (Likes + Comments + Shares) ÷ Total Views × 100, or using subscriber count as the denominator for channel engagement.",
      },
      {
        question: "Does this work for YouTube Shorts?",
        answer:
          "Yes! Our calculator works for all YouTube content including long-form videos, Shorts, live streams, and premieres.",
      },
      {
        question: "Should I track engagement by views or subscribers?",
        answer:
          "Both metrics are valuable. Engagement by views shows individual video performance, while engagement by subscribers indicates overall channel loyalty.",
      },
      {
        question: "Is my YouTube data stored or shared?",
        answer:
          "No, all calculations are performed locally in your browser. We don't store or share any of your YouTube channel data or metrics.",
      },
    ],
  },

  "tiktok-engagement-calculator": {
    id: "tiktok-engagement-calculator",
    name: "TikTok Engagement Calculator",
    description:
      "Calculate your TikTok engagement rate and viral content performance",
    features: [
      "Free forever",
      "Real-time engagement calculation",
      "Viral potential analysis",
      "For You Page optimization",
      "Trending content insights",
      "Creator growth strategies",
    ],
    howToUse: [
      "Enter your video metrics (likes, comments, shares, favorites)",
      "Input your current follower count",
      "Click 'Calculate TikTok Engagement Rate'",
      "Review your engagement percentage and viral potential",
      "Get personalized recommendations for TikTok growth",
    ],
    faqs: [
      {
        question: "What is a good TikTok engagement rate?",
        answer:
          "Good TikTok engagement rates are higher than other platforms: 5-15% for accounts under 100K followers, 3-10% for 100K-1M followers, and 2-7% for accounts over 1M followers.",
      },
      {
        question: "How is TikTok engagement rate calculated?",
        answer:
          "TikTok engagement rate is calculated as (Likes + Comments + Shares + Favorites) ÷ Followers × 100. Some also calculate it using video views as the denominator.",
      },
      {
        question:
          "Why are TikTok engagement rates higher than other platforms?",
        answer:
          "TikTok's algorithm and user behavior encourage more active engagement. The platform's design promotes liking, commenting, and sharing, leading to naturally higher rates.",
      },
      {
        question: "Does this work for TikTok Live streams?",
        answer:
          "Yes! Our calculator can be used for all TikTok content including regular videos, live streams, and TikTok ads when engagement metrics are available.",
      },
      {
        question: "Is my TikTok data stored or shared?",
        answer:
          "No, all calculations are performed locally in your browser. We don't store or share any of your TikTok account data or metrics.",
      },
    ],
  },

  "linkedin-engagement-calculator": {
    id: "linkedin-engagement-calculator",
    name: "LinkedIn Engagement Calculator",
    description:
      "Calculate your LinkedIn engagement rate and professional content performance",
    features: [
      "Free forever",
      "Real-time engagement calculation",
      "Professional networking metrics",
      "Thought leadership insights",
      "B2B content optimization",
      "Career growth tracking",
    ],
    howToUse: [
      "Enter your post metrics (likes, comments, shares, clicks)",
      "Input your current connection/follower count",
      "Click 'Calculate LinkedIn Engagement Rate'",
      "Review your engagement percentage and professional influence",
      "Get personalized recommendations for LinkedIn growth",
    ],
    faqs: [
      {
        question: "What is a good LinkedIn engagement rate?",
        answer:
          "Good LinkedIn engagement rates typically range from 1-4% for most professionals, with 2-3% being considered above average for business and thought leadership content.",
      },
      {
        question: "How is LinkedIn engagement rate calculated?",
        answer:
          "LinkedIn engagement rate is calculated as (Likes + Comments + Shares + Clicks) ÷ Connections/Followers × 100. This shows your professional network engagement level.",
      },
      {
        question: "Does this work for LinkedIn company pages?",
        answer:
          "Yes! Our calculator works for both personal LinkedIn profiles and company pages, helping track both individual and business performance.",
      },
      {
        question: "Should I use connections or followers as the denominator?",
        answer:
          "For personal profiles, use your total connections plus followers. For company pages, use your total follower count for the most accurate engagement rate.",
      },
      {
        question: "Is my LinkedIn data stored or shared?",
        answer:
          "No, all calculations are performed locally in your browser. We don't store or share any of your LinkedIn profile or company data.",
      },
    ],
  },
  "instagram-engagement-calculator": {
    id: "instagram-engagement-calculator",
    name: "Instagram Engagement Calculator",
    description:
      "Calculate your Instagram engagement rate and optimize your content performance",
    features: [
      "Free forever",
      "Real-time engagement calculation",
      "Multiple engagement metrics",
      "Performance benchmarking",
      "Content optimization tips",
      "Historical tracking support",
    ],
    howToUse: [
      "Enter your post metrics (likes, comments, shares)",
      "Input your current follower count",
      "Click 'Calculate Engagement Rate'",
      "Review your engagement percentage and insights",
      "Get personalized recommendations for improvement",
    ],
    faqs: [
      {
        question: "What is a good Instagram engagement rate?",
        answer:
          "A good engagement rate varies by follower count: 1-5% for accounts with 100K+ followers, 2-7% for 10K-100K followers, and 3-10% for accounts under 10K followers.",
      },
      {
        question: "How is Instagram engagement rate calculated?",
        answer:
          "Engagement rate is calculated as (Likes + Comments + Shares + Saves) ÷ Followers × 100. Our tool uses this standard formula for accurate results.",
      },
      {
        question: "Can I track multiple posts at once?",
        answer:
          "Yes, you can analyze individual posts or calculate average engagement across multiple posts to get a comprehensive view of your performance.",
      },
      {
        question: "Does the calculator work for Instagram Reels?",
        answer:
          "Absolutely! The calculator works for all Instagram content types including posts, Reels, carousels, and Stories (when metrics are available).",
      },
      {
        question: "Is my data stored or shared?",
        answer:
          "No, all calculations are performed locally in your browser. We don't store or share any of your Instagram data or metrics.",
      },
    ],
  },
  "ai-content-detector": {
    id: "ai-content-detector",
    name: "AI Content Detector",
    description: "Detect AI-generated content with high accuracy",
    features: [
      "Free forever",
      "99.9% accuracy",
      "Instant results",
      "No registration required",
      "Support for multiple languages",
    ],
    howToUse: [
      "Paste your content in the text area",
      "Click the 'Analyze' button",
      "Review the detailed analysis results",
      "Check the confidence score and highlighted sections",
    ],
    faqs: [
      {
        question: "How accurate is the AI detection?",
        answer:
          "Our tool achieves 99.9% accuracy through advanced machine learning algorithms and constant model updates.",
      },
      {
        question: "Is there a content length limit?",
        answer:
          "Yes, you can analyze up to 25,000 characters at once in the free version.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "Currently, we support English, Spanish, French, German, and Italian.",
      },
    ],
  },
  "ai-gift-suggester-free": {
    id: "ai-gift-suggester-free",
    name: "AI Gift Suggester",
    description:
      "Get personalized gift recommendations based on recipient preferences",
    features: [
      "Personalized gift recommendations",
      "Multiple occasion support",
      "Budget-based filtering",
      "Interest-based matching",
      "Save gift ideas for later",
      "Cultural sensitivity options",
      "Age-appropriate suggestions",
      "Local & online shopping links",
    ],
    howToUse: [
      "Enter recipient details and preferences",
      "Select the occasion and relationship",
      "Set your budget range",
      "Add interests and hobbies",
      "Review and save suggested gifts",
    ],
    faqs: [
      {
        question: "How does the gift matcher work?",
        answer:
          "Our AI analyzes the recipient's interests, age, occasion, and your budget to suggest thoughtful, personalized gifts using a vast database of products and ideas.",
      },
      {
        question: "Can I save gift ideas for later?",
        answer:
          "Yes! Sign in to save gift suggestions, create gift lists for different people, and set reminders for upcoming occasions.",
      },
      {
        question: "What occasions are supported?",
        answer:
          "We support all major occasions including birthdays, anniversaries, holidays, weddings, graduations, and more. You can also specify custom occasions.",
      },
      {
        question: "Is there a limit to how many suggestions I can get?",
        answer:
          "Free users can generate up to 5 gift suggestion lists per day. Sign in for unlimited suggestions and more features.",
      },
    ],
  },
  "free-youtube-transcript-extractor": {
    id: "youtube-transcript-extractor",
    name: "Free YouTube Transcript Extractor",
    description:
      "Extract and search through YouTube video transcripts with ease",
    features: [
      "Free transcript extraction",
      "Multiple download formats (.txt, .srt, .vtt)",
      "Instant copy to clipboard",
      "Searchable transcript content",
      "Timestamp navigation",
      "AI-powered summarization",
      "Playlist support",
      "No registration required",
    ],
    howToUse: [
      "Paste your YouTube video URL",
      "Click 'Get Transcript' to extract",
      "Search through the transcript content",
      "Copy or download in your preferred format",
      "Click timestamps to jump to video sections",
    ],
    faqs: [
      {
        question: "Is this tool completely free?",
        answer:
          "Yes! You can extract up to 3 transcripts per day for free. Sign in for unlimited extractions and additional features.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Currently, we support any public YouTube video that has captions available, including auto-generated captions.",
      },
      {
        question: "Can I extract transcripts from age-restricted videos?",
        answer:
          "No, our tool cannot extract transcripts from age-restricted or private YouTube videos due to platform limitations.",
      },
      {
        question: "What do I do if the extraction fails?",
        answer:
          "First, check if the video has captions available. If it does, try refreshing the page and extracting again. If the problem persists, please contact support.",
      },
    ],
  },
  "free-youtube-transcript-generator": {
    id: "youtube-transcript-extractor",
    name: "Free YouTube Transcript Generator",
    description:
      "Generate YouTube video transcripts easily. Search through captions and download in multiple formats.",
    features: [
      "Free transcript generation",
      "Multiple download formats (.txt, .srt, .vtt)",
      "Instant copy to clipboard",
      "Searchable transcript content",
      "Timestamp navigation",
      "AI-powered summarization",
      "Playlist support",
      "No registration required",
    ],
    howToUse: [
      "Paste your YouTube video URL",
      "Click 'Get Transcript' to extract",
      "Search through the transcript content",
      "Copy or download in your preferred format",
      "Click timestamps to jump to video sections",
    ],
    faqs: [
      {
        question: "Is this tool completely free?",
        answer:
          "Yes! You can extract up to 3 transcripts per day for free. Sign in for unlimited extractions and additional features.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Currently, we support any public YouTube video that has captions available, including auto-generated captions.",
      },
      {
        question: "Can I extract transcripts from age-restricted videos?",
        answer:
          "No, our tool cannot extract transcripts from age-restricted or private YouTube videos due to platform limitations.",
      },
      {
        question: "What do I do if the extraction fails?",
        answer:
          "First, check if the video has captions available. If it does, try refreshing the page and extracting again. If the problem persists, please contact support.",
      },
    ],
  },
  "free-youtube-ai-summarizer": {
    id: "youtube-transcript-extractor",
    name: "Free YouTube AI Summarizer",
    description:
      "Generate YouTube video summaries easily. Search through captions and download in multiple formats.",
    features: [
      "Free AI video summarizer",
      "Multiple download formats (.txt, .srt, .vtt)",
      "Instant copy to clipboard",
      "Searchable transcript content",
      "Timestamp navigation",
      "AI-powered summarization",
      "Playlist support",
      "No registration required",
    ],
    howToUse: [
      "Paste your YouTube video URL",
      "Click 'Get Transcript' to extract",
      "Search through the transcript content",
      "Copy or download in your preferred format",
      "Click timestamps to jump to video sections",
    ],
    faqs: [
      {
        question: "Is this tool completely free?",
        answer:
          "Yes! You can extract up to 3 transcripts per day for free. Sign in for unlimited extractions and additional features.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Currently, we support any public YouTube video that has captions available, including auto-generated captions.",
      },
      {
        question: "Can I extract transcripts from age-restricted videos?",
        answer:
          "No, our tool cannot extract transcripts from age-restricted or private YouTube videos due to platform limitations.",
      },
      {
        question: "What do I do if the extraction fails?",
        answer:
          "First, check if the video has captions available. If it does, try refreshing the page and extracting again. If the problem persists, please contact support.",
      },
    ],
  },
  "free-youtube-video-key-points-generator": {
    id: "youtube-transcript-extractor",
    name: "Free YouTube Video Key Points Generator",
    description:
      "Generate YouTube video key points easily. Search through captions and download in multiple formats.",
    features: [
      "Free AI video key points generator",
      "Multiple download formats (.txt, .srt, .vtt)",
      "Instant copy to clipboard",
      "Searchable transcript content",
      "Timestamp navigation",
      "AI-powered summarization",
      "Playlist support",
      "No registration required",
    ],
    howToUse: [
      "Paste your YouTube video URL",
      "Click 'Get Transcript' to extract",
      "Search through the transcript content",
      "Copy or download in your preferred format",
      "Click timestamps to jump to video sections",
    ],
    faqs: [
      {
        question: "Is this tool completely free?",
        answer:
          "Yes! You can extract up to 3 transcripts per day for free. Sign in for unlimited extractions and additional features.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Currently, we support any public YouTube video that has captions available, including auto-generated captions.",
      },
      {
        question: "Can I extract transcripts from age-restricted videos?",
        answer:
          "No, our tool cannot extract transcripts from age-restricted or private YouTube videos due to platform limitations.",
      },
      {
        question: "What do I do if the extraction fails?",
        answer:
          "First, check if the video has captions available. If it does, try refreshing the page and extracting again. If the problem persists, please contact support.",
      },
    ],
  },
  "free-youtube-video-virality-checker": {
    id: "youtube-transcript-extractor",
    name: "Free YouTube Video Virality Checker",
    description:
      "Check YouTube video virality easily. Search through captions and download in multiple formats.",
    features: [
      "Free AI video virality checker",
      "Multiple download formats (.txt, .srt, .vtt)",
      "Instant copy to clipboard",
      "Searchable transcript content",
      "Timestamp navigation",
      "AI-powered summarization",
      "Playlist support",
      "No registration required",
    ],
    howToUse: [
      "Paste your YouTube video URL",
      "Click 'Get Transcript' to extract",
      "Search through the transcript content",
      "Copy or download in your preferred format",
      "Click timestamps to jump to video sections",
    ],
    faqs: [
      {
        question: "Is this tool completely free?",
        answer:
          "Yes! You can extract up to 3 transcripts per day for free. Sign in for unlimited extractions and additional features.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Currently, we support any public YouTube video that has captions available, including auto-generated captions.",
      },
      {
        question: "Can I extract transcripts from age-restricted videos?",
        answer:
          "No, our tool cannot extract transcripts from age-restricted or private YouTube videos due to platform limitations.",
      },
      {
        question: "What do I do if the extraction fails?",
        answer:
          "First, check if the video has captions available. If it does, try refreshing the page and extracting again. If the problem persists, please contact support.",
      },
    ],
  },
  "ai-pun-generator-free": {
    id: "ai-pun-generator-free",
    name: "Free AI Pun Generator",
    description: "Generate clever puns and wordplay for any topic",
    features: [
      "Multiple pun styles",
      "Topic customization",
      "Adjustable complexity",
      "Word play variations",
      "Save favorite puns",
      "Topic suggestions",
    ],
    howToUse: [
      "Select a pun style and topic",
      "Add topic details and keywords",
      "Adjust complexity level",
      "Click 'Generate Puns'",
      "Save or copy your favorites",
    ],
    faqs: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes! You can generate up to 5 sets of puns per day for free. Sign up for unlimited generations and saving features.",
      },
      {
        question: "What types of puns can I generate?",
        answer:
          "We offer various styles including Dad Jokes, Word Play, Double Meaning, Rhyming, Pop Culture, Food Puns, Animal Puns, and Science Puns.",
      },
      {
        question: "Can I use these puns commercially?",
        answer:
          "Yes, all generated puns are free to use for any purpose, including commercial use.",
      },
      {
        question: "How do I make better puns?",
        answer:
          "Try using specific keywords, adjust the complexity level, and provide detailed topic descriptions. The more context you give, the better the puns will be!",
      },
    ],
  },
  "ai-roast-generator-free": {
    id: "ai-roast-generator-free",
    name: "Free AI Roast Generator",
    description: "Generate playful roasts and comebacks for any occasion",
    features: [
      "Multiple roast styles",
      "Context-aware generation",
      "Adjustable intensity",
      "Clean content filter",
      "Save favorite roasts",
      "Customizable targets",
    ],
    howToUse: [
      "Select a roast style and context",
      "Describe the relationship and situation",
      "Adjust intensity and clean levels",
      "Click 'Generate Roasts'",
      "Save or copy your favorites",
    ],
    faqs: [
      {
        question: "Are the roasts appropriate?",
        answer:
          "Yes! Our clean level slider ensures roasts remain playful and appropriate. The tool focuses on friendly banter rather than harmful content.",
      },
      {
        question: "How many roasts can I generate?",
        answer:
          "Free users can generate 5 sets of roasts per day. Sign up for unlimited generations and the ability to save your favorites.",
      },
      {
        question: "Can I customize the roasts?",
        answer:
          "Yes, you can choose different styles, provide context, set intensity levels, and even specify target names for personalized roasts.",
      },
      {
        question: "What makes a good roast?",
        answer:
          "Good roasts are context-aware, playful, and maintain good relationships. Provide detailed context and keep intensity moderate for best results.",
      },
    ],
  },
  "ai-insult-generator": {
    id: "ai-insult-generator",
    name: "AI Insult Generator",
    description: "Generate witty, clean insults and comebacks",
    features: [
      "Multiple insult styles",
      "Adjustable wit level",
      "Clean content filter",
      "Context-aware insults",
      "Save favorite insults",
      "Customizable targets",
    ],
    howToUse: [
      "Select an insult style and context",
      "Adjust wit and clean levels",
      "Add optional target name",
      "Click 'Generate Insult'",
      "Save or copy your favorites",
    ],
    faqs: [
      {
        question: "Are the insults appropriate?",
        answer:
          "Yes, our tool generates clean, witty insults suitable for friendly banter. The clean level slider ensures content appropriateness.",
      },
      {
        question: "Can I customize the insults?",
        answer:
          "Yes, you can choose from different styles, set context, target name, and adjust wit levels to customize your insults.",
      },
      {
        question: "How many insults can I generate?",
        answer:
          "Free users can generate 3 insults per day. Sign up for unlimited generations and the ability to save your favorites.",
      },
      {
        question: "What styles are available?",
        answer:
          "We offer various styles including Shakespearean, Sarcastic, Silly, Nerdy, Historical, Professional, Medieval, and Sci-Fi.",
      },
    ],
  },
  "character-counter": {
    id: "character-counter",
    name: "Character Counter",
    description: "Count characters, words, and paragraphs instantly",
    features: [
      "Free forever",
      "Real-time counting",
      "Word, character, and paragraph stats",
      "Social media length checker",
      "No ads",
    ],
    howToUse: [
      "Type or paste your text",
      "See real-time character count",
      "View detailed statistics",
      "Check social media limits",
    ],
    faqs: [
      {
        question: "Does it count spaces?",
        answer: "Yes, but we show both counts with and without spaces.",
      },
      {
        question: "Can I save my text?",
        answer: "No, we don't store any text to ensure your privacy.",
      },
    ],
  },
  "ai-niche-finder": {
    id: "ai-niche-finder",
    name: "AI Niche Finder",
    description:
      "Discover your perfect content creation niche using AI-powered analysis and personalized recommendations",
    features: [
      "AI-powered niche analysis",
      "Interactive assessment",
      "Visual insights and graphs",
      "Monetization potential score",
      "Personalized roadmap",
      "Market gap identification",
      "Skill-niche matching",
      "Trend analysis",
    ],
    howToUse: [
      "Complete the interactive assessment",
      "Rate your skills and interests",
      "Select content preferences",
      "Get personalized niche recommendations",
      "View detailed market analysis",
      "Explore monetization opportunities",
    ],
    faqs: [
      {
        question: "How does the AI determine my best niche?",
        answer:
          "Our AI analyzes multiple factors including your skills, interests, market demand, competition levels, and monetization potential to suggest the most suitable niches.",
      },
      {
        question: "Can I get multiple niche suggestions?",
        answer:
          "Yes, the tool provides multiple niche recommendations ranked by compatibility and market opportunity.",
      },
      {
        question: "Are the market trends up-to-date?",
        answer:
          "Yes, our AI continuously analyzes current market trends and updates recommendations accordingly.",
      },
      {
        question: "Can I save my results?",
        answer:
          "Yes, you can save your analysis results and return to them later for reference.",
      },
    ],
  },
  "ghibli-image-generator": {
    id: "ghibli-image-generator",
    name: "Ghibli Image Generator",
    description:
      "Generate unique, professional-quality images using Studio Ghibli's iconic art style",
    features: [
      "Free unlimited generations",
      "Multiple image sizes",
      "Customizable prompt",
      "Reference image support",
      "Export in multiple formats",
    ],
    howToUse: [
      "Enter your prompt",
      "Choose your preferred image size",
      "Add a reference image if desired",
      "Click 'Generate Image' and wait for results",
      "Edit and customize your image as needed",
    ],
    faqs: [
      {
        question: "What is the maximum image size?",
        answer: "We offer 1024x1024, 1024x1792, and 1792x1024 pixel sizes.",
      },
      {
        question: "Can I use the generated images commercially?",
        answer:
          "Yes, all generated images are royalty-free and available for commercial use.",
      },
      {
        question: "How unique are the generated images?",
        answer:
          "Each generation is unique and crafted using advanced AI to ensure originality.",
      },
      {
        question: "Can I save my generated images?",
        answer:
          "Yes, you can save, download, and export your images in various formats.",
      },
    ],
  },
  "ai-rap-generator": {
    id: "ai-rap-generator",
    name: "AI Rap Generator",
    description:
      "Create unique, professional-quality rap lyrics using advanced AI technology",
    features: [
      "Free unlimited generations",
      "Multiple rap styles and themes",
      "Rhyme scheme optimization",
      "Custom vocabulary options",
      "Export in multiple formats",
    ],
    howToUse: [
      "Choose your preferred rap style (Old School, Modern, etc.)",
      "Enter your topic or theme",
      "Specify desired length and mood",
      "Click 'Generate Rap' and wait for results",
      "Edit and customize your lyrics as needed",
    ],
    faqs: [
      {
        question: "Can I use the generated rap lyrics commercially?",
        answer:
          "Yes, all generated lyrics are royalty-free and available for commercial use.",
      },
      {
        question: "How unique are the generated lyrics?",
        answer:
          "Each generation is unique and crafted using advanced AI to ensure originality.",
      },
      {
        question: "Can I save my generated lyrics?",
        answer:
          "Yes, you can save, download, and export your lyrics in various formats.",
      },
    ],
  },
  "ai-rizz-generator": {
    id: "ai-rizz-generator",
    name: "AI Rizz Generator",
    description:
      "Generate smooth, witty, and engaging conversation starters and pickup lines",
    features: [
      "Free unlimited generations",
      "Multiple personality styles",
      "Context-aware responses",
      "Safe and respectful content",
      "Customizable tone settings",
    ],
    howToUse: [
      "Select your preferred conversation style",
      "Input any specific context or situation",
      "Choose the tone (funny, clever, casual)",
      "Generate your personalized rizz",
      "Copy and save your favorite lines",
    ],
    faqs: [
      {
        question: "Are the generated lines appropriate?",
        answer:
          "Yes, our AI ensures all content is respectful and appropriate for general use.",
      },
      {
        question: "How often is the content updated?",
        answer:
          "Our AI model is regularly updated with fresh, contemporary content and trends.",
      },
    ],
  },
  "case-converter": {
    id: "case-converter",
    name: "Case Converter",
    description:
      "Convert text between multiple case formats instantly - camelCase, snake_case, kebab-case, and more",
    features: [
      "Free unlimited conversions",
      "Multiple case format support",
      "Batch conversion capability",
      "Instant preview",
      "Keyboard shortcuts",
    ],
    howToUse: [
      "Paste your text into the input field",
      "Select your desired case format",
      "View instant preview of conversion",
      "Copy converted text with one click",
      "Use batch mode for multiple conversions",
    ],
    faqs: [
      {
        question: "What case formats are supported?",
        answer:
          "We support camelCase, PascalCase, snake_case, kebab-case, UPPER CASE, lower case, and Title Case.",
      },
      {
        question: "Is there a character limit?",
        answer:
          "No, our tool can handle texts of any length without limitations.",
      },
    ],
  },
  "letterhead-creator": {
    id: "letterhead-creator",
    name: "Company Letterhead Creator",
    description:
      "Create professional company letterheads with custom content for business communications",
    features: [
      "Customizable company header with logo and contact information",
      "Professional letterhead templates for various business needs",
      "Custom letter content editor with formatting options",
      "Save as PDF or print directly from browser",
      "Multiple layout and design options",
      "Instant preview as you customize",
      "Logo and branding color integration",
      "Downloadable and ready-to-use files",
    ],
    howToUse: [
      "Upload your company logo or choose from templates",
      "Add company name, address, and contact information",
      "Select a letterhead style that matches your brand",
      "Write or paste your letter content in the editor",
      "Format the content as needed for your communication",
      "Preview your letterhead with content",
      "Download as PDF or print directly",
    ],
    faqs: [
      {
        question: "Can I save my letterhead templates for future use?",
        answer:
          "Yes, you can save your custom letterhead templates and reuse them for future communications with different content.",
      },
      {
        question: "What file formats are supported for logo upload?",
        answer:
          "We support JPG, PNG, and SVG file formats for logo uploads to ensure high-quality display on your letterhead.",
      },
      {
        question: "How customizable is the letterhead design?",
        answer:
          "Our tool offers extensive customization options including layouts, fonts, colors, spacing, and placement of elements to match your brand identity perfectly.",
      },
      {
        question:
          "Can I edit the letter content after creating the letterhead?",
        answer:
          "Yes, you can edit both the letterhead design and letter content at any time before downloading or printing.",
      },
      {
        question: "What paper sizes are supported for printing?",
        answer:
          'The tool supports standard paper sizes including US Letter (8.5" x 11"), A4, Legal, and other common business formats.',
      },
    ],
  },
  "content-localizer": {
    id: "content-localizer",
    name: "Content Localizer",
    description:
      "Adapt your content for different regions and cultures with smart localization suggestions",
    features: [
      "Free localization checking",
      "Cultural sensitivity analysis",
      "Region-specific recommendations",
      "Multiple language support",
      "Export localization reports",
    ],
    howToUse: [
      "Enter your content in the text area",
      "Select target region/culture",
      "Review automated suggestions",
      "Apply recommended changes",
      "Export localization report",
    ],
    faqs: [
      {
        question: "Which regions are supported?",
        answer:
          "We support major regions including North America, Europe, Asia, and Australia with specific cultural contexts.",
      },
      {
        question: "Does it handle currency conversion?",
        answer:
          "Yes, we automatically suggest appropriate currency formats and conversions for target regions.",
      },
    ],
  },
  "discord-small-text": {
    id: "discord-small-text",
    name: "Discord Small Text Generator",
    description:
      "Convert normal text to small caps text perfect for Discord messages",
    features: [
      "Free unlimited conversions",
      "Real-time preview",
      "Copy with one click",
      "Multiple style options",
      "Mobile-friendly interface",
    ],
    howToUse: [
      "Type or paste your text",
      "Choose your preferred small text style",
      "Preview the conversion instantly",
      "Click to copy the formatted text",
      "Paste directly into Discord",
    ],
    faqs: [
      {
        question: "Will this work in all Discord channels?",
        answer:
          "Yes, our generated text is compatible with all Discord channels and servers.",
      },
      {
        question: "Is there a character limit?",
        answer:
          "No, but Discord has its own message length limits which apply to the converted text.",
      },
    ],
  },
  "discord-text-formatter": {
    id: "discord-text-formatter",
    name: "Discord Text Formatter",
    description:
      "Format your Discord messages with bold, italic, underline, and custom styling",
    features: [
      "Free unlimited formatting",
      "Multiple text styles",
      "Preview before sending",
      "Markdown support",
      "Custom style combinations",
    ],
    howToUse: [
      "Enter your text in the input field",
      "Select desired formatting options",
      "Preview your formatted text",
      "Copy with one click",
      "Paste into Discord",
    ],
    faqs: [
      {
        question: "What formatting options are available?",
        answer:
          "We support bold, italic, underline, strikethrough, spoiler tags, and code blocks.",
      },
      {
        question: "Can I combine different formats?",
        answer:
          "Yes, you can combine multiple formats like bold+italic or underline+spoiler.",
      },
    ],
  },
  "engagement-optimizer": {
    id: "engagement-optimizer",
    name: "Engagement Optimizer",
    description:
      "Analyze and optimize your content for maximum social media engagement",
    features: [
      "Free engagement analysis",
      "Platform-specific recommendations",
      "Hashtag suggestions",
      "Best posting time calculator",
      "Engagement metrics tracking",
    ],
    howToUse: [
      "Paste your content",
      "Select target platform(s)",
      "Review optimization suggestions",
      "Apply recommended changes",
      "Track engagement improvements",
    ],
    faqs: [
      {
        question: "Which platforms are supported?",
        answer:
          "We support Instagram, Twitter, Facebook, LinkedIn, and TikTok optimization.",
      },
      {
        question: "How accurate are the posting time suggestions?",
        answer:
          "Our recommendations are based on real-time platform analytics and are updated regularly.",
      },
    ],
  },
  "hashtag-generator": {
    id: "hashtag-generator",
    name: "Hashtag Generator",
    description:
      "Generate relevant, trending hashtags for your social media content",
    features: [
      "Free hashtag suggestions",
      "Trending hashtag analysis",
      "Platform-specific tags",
      "Engagement rate predictions",
      "Custom hashtag groups",
    ],
    howToUse: [
      "Enter your content topic or keywords",
      "Select target platform",
      "Choose hashtag quantity",
      "Generate relevant hashtags",
      "Copy and use in your posts",
    ],
    faqs: [
      {
        question: "How often are trending hashtags updated?",
        answer:
          "Our database updates hourly to ensure you get the most current trending hashtags.",
      },
      {
        question: "Can I save my favorite hashtag combinations?",
        answer:
          "Yes, you can create and save custom hashtag groups for future use.",
      },
    ],
  },
  "influencer-search": {
    id: "influencer-search",
    name: "Influencer Search",
    description: "Find and analyze social media influencers in your niche",
    features: [
      "Free influencer discovery",
      "Engagement rate calculator",
      "Niche categorization",
      "Audience demographics",
      "Contact information finder",
    ],
    howToUse: [
      "Enter your niche or keywords",
      "Set follower range criteria",
      "Filter by platform and location",
      "Review influencer profiles",
      "Export influencer data",
    ],
    faqs: [
      {
        question: "How accurate is the engagement data?",
        answer:
          "Our engagement metrics are calculated using real-time data from social platforms.",
      },
      {
        question: "Can I contact influencers through the tool?",
        answer:
          "We provide verified contact information where available, but messaging is handled externally.",
      },
    ],
  },
  "joke-generator": {
    id: "joke-generator",
    name: "Joke Generator",
    description: "Generate clean, funny jokes for any occasion",
    features: [
      "Free unlimited jokes",
      "Multiple joke categories",
      "Family-friendly content",
      "Save favorites",
      "Share directly to social media",
    ],
    howToUse: [
      "Select joke category",
      "Choose joke style preference",
      "Generate random joke",
      "Save or share favorites",
      "Rate jokes to improve suggestions",
    ],
    faqs: [
      {
        question: "Are the jokes appropriate for children?",
        answer:
          "Yes, all jokes are family-friendly and appropriate for all ages.",
      },
      {
        question: "How often is new content added?",
        answer:
          "Our joke database is updated weekly with fresh, original content.",
      },
    ],
  },
  "line-breaker": {
    id: "line-breaker",
    name: "Line Breaker",
    description: "Format text with custom line breaks for optimal readability",
    features: [
      "Free unlimited formatting",
      "Custom break patterns",
      "Multiple output formats",
      "Preserve formatting options",
      "Batch processing",
    ],
    howToUse: [
      "Paste your text content",
      "Select break pattern",
      "Choose output format",
      "Preview formatted text",
      "Copy or download result",
    ],
    faqs: [
      {
        question: "Can it handle different file formats?",
        answer: "Yes, we support TXT, MD, HTML, and other common text formats.",
      },
      {
        question: "Does it preserve existing formatting?",
        answer:
          "Yes, you can choose to preserve or override existing formatting.",
      },
    ],
  },
  "lorem-ipsum-generator-free": {
    id: "lorem-ipsum-generator-free",
    name: "Lorem Ipsum Generator",
    description:
      "Generate custom lorem ipsum placeholder text for your designs",
    features: [
      "Free unlimited generation",
      "Custom length options",
      "Multiple languages",
      "HTML/CSS ready format",
      "Copy with one click",
    ],
    howToUse: [
      "Select desired length",
      "Choose output format",
      "Generate placeholder text",
      "Preview generated content",
      "Copy or download text",
    ],
    faqs: [
      {
        question: "Can I generate paragraphs with headings?",
        answer:
          "Yes, you can generate structured content with headings and paragraphs.",
      },
      {
        question: "Is the text unique each time?",
        answer:
          "Yes, each generation creates unique combinations of placeholder text.",
      },
    ],
  },
  "password-generator": {
    id: "password-generator",
    name: "Password Generator",
    description: "Create strong, secure passwords with custom requirements",
    features: [
      "Free unlimited generations",
      "Custom length and complexity",
      "Special character options",
      "Password strength meter",
      "Secure generation algorithm",
    ],
    howToUse: [
      "Set password length",
      "Choose character types",
      "Set complexity requirements",
      "Generate secure password",
      "Copy with one click",
    ],
    faqs: [
      {
        question: "How secure are the generated passwords?",
        answer:
          "Our passwords meet the highest security standards and are generated using cryptographically secure methods.",
      },
      {
        question: "Are passwords stored anywhere?",
        answer:
          "No, passwords are generated client-side and never stored or transmitted.",
      },
    ],
  },
  "sentiment-analyzer": {
    id: "sentiment-analyzer",
    name: "Sentiment Analyzer",
    description: "Analyze text sentiment and emotional tone in content",
    features: [
      "Free sentiment analysis",
      "Multiple language support",
      "Emotional tone detection",
      "Batch processing",
      "Detailed sentiment reports",
    ],
    howToUse: [
      "Paste your text content",
      "Select analysis language",
      "Choose analysis depth",
      "Review sentiment results",
      "Export detailed report",
    ],
    faqs: [
      {
        question: "How accurate is the sentiment analysis?",
        answer:
          "Our tool achieves 90%+ accuracy using advanced natural language processing.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "We support sentiment analysis in 20+ major languages including English, Spanish, and Mandarin.",
      },
    ],
  },
  "username-lookup": {
    id: "username-lookup",
    name: "Username Lookup",
    description: "Check username availability across multiple platforms",
    features: [
      "Free username search",
      "Multi-platform checking",
      "Instant results",
      "Similar username suggestions",
      "Bulk username checking",
    ],
    howToUse: [
      "Enter desired username",
      "Select platforms to check",
      "View availability results",
      "Check alternative suggestions",
      "Save favorite usernames",
    ],
    faqs: [
      {
        question: "Which platforms are checked?",
        answer:
          "We check 50+ major platforms including social media, gaming, and developer communities.",
      },
      {
        question: "How current are the results?",
        answer:
          "Our results are real-time and updated instantly across all platforms.",
      },
    ],
  },
  "viral-scorer": {
    id: "viral-scorer",
    name: "Viral Scorer",
    description: "Analyze content's viral potential and get optimization tips",
    features: [
      "Free viral potential analysis",
      "Multi-platform scoring",
      "Trend alignment check",
      "Engagement predictions",
      "Optimization suggestions",
    ],
    howToUse: [
      "Paste your content",
      "Select target platform",
      "Run viral analysis",
      "Review detailed score",
      "Apply optimization tips",
    ],
    faqs: [
      {
        question: "How is the viral score calculated?",
        answer:
          "We analyze multiple factors including trend alignment, engagement patterns, and audience resonance.",
      },
      {
        question: "Can it predict viral success?",
        answer:
          "While we provide probability scores, viral success depends on many real-world factors.",
      },
    ],
  },
  "word-counter": {
    id: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and readability metrics",
    features: [
      "Free unlimited counting",
      "Real-time statistics",
      "Readability scoring",
      "SEO analysis",
      "Format cleaning options",
    ],
    howToUse: [
      "Paste your text",
      "View instant word count",
      "Check detailed statistics",
      "Review readability score",
      "Export detailed report",
    ],
    faqs: [
      {
        question: "What metrics are included?",
        answer:
          "We count words, characters, sentences, paragraphs, and provide readability scores.",
      },
      {
        question: "Can it ignore HTML tags?",
        answer:
          "Yes, you can choose to exclude HTML tags and other formatting from the count.",
      },
    ],
  },
  "workshop-group-organizer": {
    id: "workshop-group-organizer",
    name: "Workshop Group Organizer",
    description:
      "Organize workshop participants into balanced groups with color-coded assignments and task tracking",
    features: [
      "Automatic group formation",
      "Color-coded team assignments",
      "Shareable participant links",
      "Real-time team member visibility",
      "Task assignment and tracking",
      "Progress monitoring",
      "Group naming options",
      "No account required",
    ],
    howToUse: [
      "Enter total participants and desired group size",
      "Create your workshop and get color-coded groups",
      "Share participant links with attendees",
      "Add tasks for groups to complete",
      "Monitor task progress across all groups",
      "Track completion in real-time",
    ],
    faqs: [
      {
        question: "How many participants can I organize?",
        answer:
          "The tool supports workshops of any size, automatically creating the optimal number of balanced groups.",
      },
      {
        question: "Can participants see other groups?",
        answer:
          "No, participants only see members of their own group to maintain focus and improve collaboration.",
      },
      {
        question: "Do workshop participants need to create accounts?",
        answer:
          "No, participants simply open their unique link and enter their name to join their assigned group.",
      },
      {
        question: "Can I add or change tasks during the workshop?",
        answer:
          "Yes, you can add, remove, or modify tasks at any time, and all participants will see the updated information.",
      },
    ],
  },
  "youtube-chapters-generator": {
    id: "youtube-chapters-generator",
    name: "YouTube Chapters Generator",
    description: "Create professional YouTube chapter markers and timestamps",
    features: [
      "Free chapter generation",
      "Automatic timestamp detection",
      "Custom chapter naming",
      "Format validation",
      "One-click copying",
    ],
    howToUse: [
      "Enter video timestamps",
      "Add chapter titles",
      "Preview chapter format",
      "Validate YouTube compliance",
      "Copy to clipboard",
    ],
    faqs: [
      {
        question: "Are the chapters YouTube-compliant?",
        answer:
          "Yes, all generated chapters follow YouTube's official timestamp format and guidelines.",
      },
      {
        question: "Can I edit existing chapters?",
        answer:
          "Yes, you can import and edit existing chapter timestamps and titles.",
      },
    ],
  },
  "youtube-audit": {
    id: "youtube-audit",
    name: "YouTube Channel Audit",
    description:
      "Get a comprehensive analysis of your YouTube channel's performance, engagement, and growth opportunities",
    features: [
      "Detailed channel analytics",
      "Content performance metrics",
      "Audience engagement analysis",
      "SEO optimization tips",
      "Growth strategy recommendations",
      "Competitor benchmarking",
      "Monetization potential analysis",
      "Trend alignment scoring",
    ],
    howToUse: [
      "Enter your YouTube channel URL or handle",
      "Wait for the AI to analyze your channel",
      "Review comprehensive audit results",
      "Check detailed recommendations",
      "Download or share your audit report",
    ],
    faqs: [
      {
        question: "How long does the audit take?",
        answer:
          "Most audits are completed within 1-2 minutes, depending on channel size and content volume.",
      },
      {
        question: "What metrics are analyzed?",
        answer:
          "We analyze subscriber growth, view counts, engagement rates, content performance, SEO optimization, audience retention, and monetization metrics.",
      },
      {
        question: "How often should I run an audit?",
        answer:
          "We recommend running a channel audit monthly to track progress and adapt to platform changes.",
      },
      {
        question: "Can I audit private channels?",
        answer:
          "No, we can only audit public YouTube channels with visible metrics.",
      },
    ],
  },
  "instagram-audit": {
    id: "instagram-audit",
    name: "Instagram Profile Audit",
    description:
      "Analyze your Instagram profile's performance and get actionable insights for growth",
    features: [
      "Profile optimization score",
      "Engagement rate analysis",
      "Hashtag effectiveness",
      "Content strategy insights",
      "Best posting times",
      "Audience demographics",
      "Competitor comparison",
      "Growth recommendations",
    ],
    howToUse: [
      "Enter your Instagram handle or profile URL",
      "Allow AI to analyze your profile",
      "Review comprehensive audit results",
      "Check personalized recommendations",
      "Export detailed audit report",
    ],
    faqs: [
      {
        question: "What metrics are included in the audit?",
        answer:
          "We analyze follower growth, engagement rates, post performance, story views, hashtag effectiveness, and audience insights.",
      },
      {
        question: "Do I need to provide account access?",
        answer:
          "No, we only analyze publicly available data from your Instagram profile.",
      },
      {
        question: "How accurate are the insights?",
        answer:
          "Our analysis is based on real-time data and industry benchmarks, providing highly accurate insights.",
      },
      {
        question: "Can I track improvements over time?",
        answer:
          "Yes, save your audit reports to track progress and improvements across multiple audits.",
      },
    ],
  },
  "linkedin-audit": {
    id: "linkedin-audit",
    name: "LinkedIn Profile Audit",
    description:
      "Get professional insights and optimization recommendations for your LinkedIn presence",
    features: [
      "Profile completeness score",
      "Network quality analysis",
      "Content engagement metrics",
      "Professional branding review",
      "SEO optimization tips",
      "Industry positioning",
      "Connection growth insights",
      "Visibility recommendations",
    ],
    howToUse: [
      "Enter your LinkedIn profile URL",
      "Wait for AI analysis completion",
      "Review detailed audit results",
      "Check optimization suggestions",
      "Download professional report",
    ],
    faqs: [
      {
        question: "What aspects of my profile are analyzed?",
        answer:
          "We analyze your profile completeness, professional branding, content strategy, network quality, and engagement metrics.",
      },
      {
        question: "How can I improve my profile score?",
        answer:
          "Follow our detailed recommendations for optimizing your headline, summary, experience section, and content strategy.",
      },
      {
        question: "Is this suitable for company pages?",
        answer:
          "Yes, we offer analysis for both personal profiles and company pages on LinkedIn.",
      },
      {
        question: "How often should I update my profile?",
        answer:
          "We recommend monthly audits and updates to maintain an optimized LinkedIn presence.",
      },
    ],
  },
  "tiktok-audit": {
    id: "tiktok-audit",
    name: "TikTok Profile Audit",
    description:
      "Analyze your TikTok profile's performance and get viral growth strategies",
    features: [
      "Viral potential analysis",
      "Content performance metrics",
      "Trend alignment score",
      "Audience engagement rates",
      "Sound strategy review",
      "Hashtag effectiveness",
      "Growth recommendations",
      "Competitor benchmarking",
    ],
    howToUse: [
      "Enter your TikTok username or profile URL",
      "Allow AI to analyze your content",
      "Review comprehensive audit results",
      "Check viral optimization tips",
      "Export detailed performance report",
    ],
    faqs: [
      {
        question: "What metrics are analyzed?",
        answer:
          "We analyze view counts, engagement rates, follower growth, trending content alignment, hashtag performance, and viral potential.",
      },
      {
        question: "How can I improve my viral potential?",
        answer:
          "Our audit provides specific recommendations for content timing, trending sounds, hashtag usage, and engagement strategies.",
      },
      {
        question: "Do you analyze private accounts?",
        answer:
          "No, we can only audit public TikTok profiles with visible metrics.",
      },
      {
        question: "How often should I run an audit?",
        answer:
          "Given TikTok's fast-paced nature, we recommend bi-weekly audits to stay aligned with trends.",
      },
    ],
  },
  "report-card-generator": {
    id: "report-card-generator",
    name: "Report Card Generator",
    description:
      "Generate detailed academic report cards with personalized feedback and recommendations.",
    features: [
      "Comprehensive grade analysis",
      "Personalized strengths and improvements",
      "Actionable recommendations",
      "Detailed teacher comments",
      "Multiple subject support",
      "Grade-appropriate feedback",
      "Professional formatting",
    ],
    howToUse: [
      "Enter student name and grade level",
      "Select the subject and term",
      "Input performance data (test scores, assignments, participation, etc.)",
      "Click 'Generate Report Card'",
      "Review and use the generated report",
    ],
    faqs: [
      {
        question: "What information should I include in the performance data?",
        answer:
          "Include test scores, assignment grades, class participation, attendance, and any notable achievements or challenges.",
      },
      {
        question: "Can I edit the generated report card?",
        answer:
          "The tool provides a comprehensive report that you can use as a base. You can copy and modify the content as needed.",
      },
      {
        question: "Is the generated feedback personalized?",
        answer:
          "Yes, the AI analyzes the provided data to generate personalized feedback, strengths, and recommendations specific to the student.",
      },
    ],
  },
  "fake-follower-check": {
    id: "fake-follower-check",
    name: "Instagram Fake Follower Checker",
    description:
      "Check if your followers are fake or real with our advanced AI-powered tool.",
    features: [
      "Real-time follower verification",
      "Bulk checking",
      "Detailed analysis",
      "Export results",
      "Customizable filters",
    ],
    howToUse: [
      "Enter your Instagram username",
      "Select the timeframe for analysis",
      "Run the check",
      "Review detailed results",
      "Export your findings",
    ],
    faqs: [
      {
        question: "How does it work?",
        answer:
          "The tool uses advanced AI algorithms to analyze your follower data and detect fake followers based on engagement patterns, follower growth, and account activity.",
      },
      {
        question: "What metrics are used for analysis?",
        answer:
          "The tool analyzes follower growth, engagement rates, post performance, and account activity to identify fake followers.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes, your data is securely processed and stored. We do not share your information with third parties.",
      },
      {
        question: "How accurate is the analysis?",
        answer:
          "The tool uses advanced AI algorithms to analyze your follower data and detect fake followers based on engagement patterns, follower growth, and account activity.",
      },
      {
        question: "Can I use this tool for other platforms?",
        answer:
          "Currently, the tool is specifically designed for Instagram. We plan to expand support for other platforms in the future.",
      },
    ],
  },
  "pomodoro-timer": {
    id: "pomodoro-timer",
    name: "Pomodoro Timer",
    description: "Boost productivity with structured work and break intervals",
    features: [
      "Customizable work and break durations",
      "Automatic mode switching",
      "Session tracking",
      "Visual timer display",
      "No registration required",
    ],
    howToUse: [
      "Set your preferred work and break durations",
      "Click 'Start' to begin a focus session",
      "Work until the timer rings",
      "Take a short break when prompted",
      "Track your completed Pomodoro sessions",
    ],
    faqs: [
      {
        question: "What is the Pomodoro Technique?",
        answer:
          "The Pomodoro Technique is a time management method using 25-minute focused work sessions followed by short breaks to improve productivity and maintain concentration.",
      },
      {
        question: "Can I customize the timer durations?",
        answer:
          "Yes, you can adjust both work session and break durations to suit your personal productivity style and concentration levels.",
      },
      {
        question: "How many Pomodoro sessions should I do in a day?",
        answer:
          "The ideal number varies, but most people find 4-8 Pomodoro sessions per day effective. Listen to your body and adjust accordingly.",
      },
      {
        question: "What are the benefits of using a Pomodoro Timer?",
        answer:
          "Benefits include improved focus, reduced burnout, better time management, increased productivity, and structured breaks to maintain mental freshness.",
      },
    ],
  },
  "robot-txt-generator": {
    id: "robot-txt-generator",
    name: "Robots.txt Generator",
    description:
      "Create custom robots.txt files to optimize your website's search engine indexing",
    features: [
      "Easy-to-use interface for creating robots.txt",
      "Support for multiple user agents",
      "Allow and Disallow rule configurations",
      "Instant preview and generation",
      "One-click copy and download",
      "No registration required",
    ],
    howToUse: [
      "Enter your website URL (optional)",
      "Add crawling rules for specific paths",
      "Select user agents (Google, Bing, etc.)",
      "Choose Allow or Disallow for each rule",
      "Generate your robots.txt file",
      "Copy or download the generated file",
    ],
    faqs: [
      {
        question: "What is a robots.txt file?",
        answer:
          "A robots.txt file is a text file that tells search engine crawlers which pages or files on your website they can or cannot request, helping to manage your site's search engine indexing.",
      },
      {
        question: "Why do I need a robots.txt file?",
        answer:
          "Robots.txt helps control search engine crawling, protect sensitive areas of your site, prevent duplicate content issues, and optimize your website's search engine performance.",
      },
      {
        question: "Can I block all search engines with robots.txt?",
        answer:
          "You can attempt to block search engines, but compliance is voluntary. Some bots may ignore the robots.txt file, so it's not a foolproof method of preventing indexing.",
      },
      {
        question: "What's the difference between Allow and Disallow rules?",
        answer:
          "Disallow rules prevent search engines from crawling specific paths, while Allow rules explicitly permit crawling of paths that might otherwise be blocked by broader disallow rules.",
      },
      {
        question: "How do I add a sitemap to my robots.txt?",
        answer:
          "The tool automatically adds a sitemap reference if you provide your website URL. You can also manually add a Sitemap: line with the full URL to your sitemap.xml file.",
      },
    ],
  },
  "fancy-text-generator": {
    id: "fancy-text-generator",
    name: "Fancy Text Generator",
    description:
      "Transform ordinary text into stylish unicode text for social media, bio, and more",
    features: [
      "Multiple text styles including serif, sans-serif, script, and more",
      "Real-time text transformation as you type",
      "One-click copy to clipboard functionality",
      "Save favorite text styles for quick access",
      "Categorized text styles for easy browsing",
      "Works on all social media platforms and messaging apps",
    ],
    howToUse: [
      "Enter your text in the input field",
      "Browse through the generated text styles",
      "Click the star icon to save favorites",
      "Use the tabs to filter styles by category",
      "Click the copy button next to your preferred style",
      "Paste your stylish text wherever you want to use it",
    ],
    faqs: [
      {
        question: "Will this fancy text work on all platforms?",
        answer:
          "Most generated styles use unicode characters that are supported on major platforms including Facebook, Instagram, Twitter, TikTok, and messaging apps. However, some platforms may have restrictions on which characters can be used in usernames or bios.",
      },
      {
        question: "Why do some characters remain unchanged?",
        answer:
          "Not all characters have unicode equivalents in every style. Characters without a mapping will remain in their original form.",
      },
      {
        question: "Can I use this for my Instagram or Twitter bio?",
        answer:
          "Yes! These fancy text styles are perfect for making your social media profiles stand out with stylish text in bios, usernames (where allowed), and posts.",
      },
      {
        question: "Is there a limit to how much text I can convert?",
        answer:
          "There is no hard limit, but for best performance we recommend keeping your text to a reasonable length (under 1000 characters).",
      },
      {
        question: "Will my favorites be saved if I close the browser?",
        answer:
          "Yes, your favorite text styles are saved in your browser's local storage and will persist between sessions until you clear your browser data.",
      },
      {
        question: "Do I need to create an account to use this tool?",
        answer:
          "No, this tool is completely free to use without any registration or account creation required.",
      },
    ],
  },
  "email-signature-generator": {
    id: "email-signature-generator",
    name: "Email Signature Generator",
    description:
      "Create professional and customizable email signatures that leave a lasting impression",
    features: [
      "Four professionally designed signature templates (Professional, Minimal, Creative, Classic)",
      "Fully customizable colors, fonts, and sizing options",
      "Support for profile photos and company logos",
      "Social media integration with popular platforms",
      "Live preview as you customize your signature",
      "One-click HTML code copying for easy implementation",
      "Mobile-responsive design that works across devices",
      "No account or registration required",
    ],
    howToUse: [
      "Fill in your personal and contact information in the form",
      "Upload a profile photo and/or company logo (optional)",
      "Select your preferred template style",
      "Customize colors, fonts, and display options",
      "Preview your signature as you make changes",
      "Click 'Copy HTML Code' when you're satisfied with the design",
      "Follow the instructions to add the signature to your email client",
    ],
    faqs: [
      {
        question: "Will my email signature work in all email clients?",
        answer:
          "The signatures are designed to be compatible with major email clients including Gmail, Outlook, Apple Mail, and Yahoo Mail. However, some email clients may have limitations on HTML support, which could affect certain styling elements.",
      },
      {
        question: "How do I add the signature to my email client?",
        answer:
          "We provide detailed instructions for adding signatures to popular email clients like Gmail, Outlook, and Apple Mail. Generally, you'll need to copy the HTML code and paste it into your email client's signature settings.",
      },
      {
        question: "Can I use my own images in the signature?",
        answer:
          "Yes! You can upload both a profile photo and a company logo to include in your signature. For best results, we recommend using square images for profile photos and a transparent background for logos.",
      },
      {
        question: "Will my customizations be saved if I leave the page?",
        answer:
          "Currently, your signature customizations are not saved between sessions. We recommend completing your signature in one session and saving the HTML code for future reference.",
      },
      {
        question: "Are there size limits for the uploaded images?",
        answer:
          "While there are no strict size limits imposed by our tool, we recommend keeping your images under 200KB for optimal email delivery. Large images may cause your emails to be flagged as spam or slow down loading times.",
      },
      {
        question: "Can I create multiple signatures?",
        answer:
          "Yes, you can create as many different signatures as you need. Simply design one signature, copy the HTML code, and then start fresh to create another design.",
      },
      {
        question: "Is this tool free to use?",
        answer:
          "Yes, our Email Signature Generator is completely free to use with no hidden fees or subscriptions required.",
      },
    ],
  },
  "game-theory-simulator": {
    id: "game-theory-simulator",
    name: "Game Theory Simulator",
    description:
      "Create and test various game theory scenarios with our interactive simulator.",
    features: [
      "Multiple strategy options (Tit for Tat, Always Defect, Always Cooperate, etc.)",
      "Classic scenarios (Prisoner's Dilemma, Chicken Game, Stag Hunt, etc.)",
      "Customizable payoff matrices",
      "Visual result analytics",
      "Save and load simulations",
    ],
    howToUse: [
      "Add agents with different strategies",
      "Choose a game scenario or create your own",
      "Set the number of simulation rounds",
      "Run the simulation",
      "Analyze the results through charts and tables",
      "Save interesting simulations for future reference",
    ],
    faqs: [
      {
        question: "What is game theory?",
        answer:
          "Game theory is the study of mathematical models of strategic interactions between rational agents. It helps understand how decisions affect outcomes when multiple parties are involved.",
      },
      {
        question: "What are the common game theory strategies?",
        answer:
          "Common strategies include Tit for Tat (copy opponent's last move), Always Cooperate, Always Defect, Grudger (stop cooperating after being betrayed), and Pavlov (repeat successful actions).",
      },
      {
        question: "What is the Prisoner's Dilemma?",
        answer:
          "The Prisoner's Dilemma is a classic game theory scenario where two individuals acting in their own self-interest leads to a worse outcome for both compared to if they had cooperated.",
      },
      {
        question: "How can I interpret the results?",
        answer:
          "Results show how different strategies perform against each other through score charts, cooperation rates, and round-by-round analysis. Higher scores indicate more successful strategies in a given scenario.",
      },
      {
        question: "Can I create my own strategies?",
        answer:
          "Currently, the simulator includes preset strategies. We plan to add custom strategy creation in future updates.",
      },
    ],
  },
  teleprompter: {
    id: "teleprompter",
    name: "Teleprompter",
    description:
      "A professional teleprompter tool for smooth script reading and recording.",
    features: [
      "Customizable scrolling speed",
      "Adjustable text size and color",
      "Mirror text for professional setups",
      "Full-screen mode",
      "Save and load scripts",
    ],
    howToUse: [
      "Enter or paste your script in the editor",
      "Customize appearance settings if needed",
      "Click 'Start Teleprompter' to begin",
      "Control scrolling speed while reading",
      "Use spacebar to pause/resume scrolling",
    ],
    faqs: [
      {
        question: "Can I adjust the scrolling speed?",
        answer:
          "Yes, you can adjust the scrolling speed before starting the teleprompter and during playback using the controls or keyboard shortcuts.",
      },
      {
        question: "Can I save my scripts for later use?",
        answer:
          "Yes, you can save scripts to your browser's local storage and load them later. You can also export scripts as text files.",
      },
      {
        question: "How do I use this with a professional teleprompter setup?",
        answer:
          "You can enable mirror mode in the settings, which will flip the text horizontally for use with a beam-splitter teleprompter setup.",
      },
      {
        question: "Can I use keyboard shortcuts?",
        answer:
          "Yes, you can use spacebar to pause/resume, arrow up/down to adjust speed, and Escape to exit full-screen mode.",
      },
      {
        question: "Does this work on mobile devices?",
        answer:
          "Yes, the teleprompter is fully responsive and works on mobile devices, though a larger screen is recommended for better readability.",
      },
    ],
  },
  "meta-tag-generator": {
    id: "meta-tag-generator",
    name: "Meta Tag Generator",
    description:
      "Create optimized SEO meta tags for better search visibility and social media sharing",
    features: [
      "AI-assisted tag generation from content description",
      "Auto-optimization for search engine rankings",
      "Social media preview tags for Facebook, Twitter, and LinkedIn",
      "Custom presets for common page types (blog, product, etc.)",
      "Character counters to maintain optimal lengths",
      "Comprehensive SEO recommendations built-in",
      "One-click code copy for easy implementation",
    ],
    howToUse: [
      "Choose between manual entry or AI-assisted mode",
      "For AI mode: enter a description of your page content",
      "For manual mode: fill in the basic SEO information first",
      "Add social media tags for better sharing experience",
      "Configure advanced settings if needed",
      "Preview the generated meta tags",
      "Copy the code and paste it into your HTML <head> section",
    ],
    faqs: [
      {
        question: "Why are meta tags important for my website?",
        answer:
          "Meta tags provide search engines and social platforms with structured information about your web pages. Proper meta tags improve your visibility in search results, enhance click-through rates, and create better-looking social media shares, all of which contribute to more traffic and engagement.",
      },
      {
        question: "Which meta tags are most important for SEO?",
        answer:
          "The most critical meta tags for SEO are title tags and meta descriptions, as these directly influence how your page appears in search results. Other important tags include canonical URLs (to prevent duplicate content issues), robots directives (to control crawler behavior), and Open Graph/Twitter Card tags for social sharing.",
      },
      {
        question: "How accurate is the AI-generated content?",
        answer:
          "The AI analyzes your page description to generate relevant, optimized meta tags. While it provides excellent starting points based on SEO best practices, we recommend reviewing and fine-tuning the generated content to ensure it accurately represents your specific page content and goals.",
      },
      {
        question: "Do meta keywords still matter for SEO?",
        answer:
          "Major search engines like Google no longer use meta keywords as a ranking factor. However, some smaller search engines may still consider them, and they can help with your internal content organization. Our tool includes them for completeness, but focus your optimization efforts on titles and descriptions instead.",
      },
    ],
  },
  "social-media-image-resizer": {
    id: "social-media-image-resizer",
    name: "Social Media Image Resizer",
    description:
      "Instantly resize images to the perfect dimensions for all major social media platforms",
    features: [
      "Pre-configured dimensions for all major platforms",
      "Custom size options for specialized needs",
      "Maintains image quality during resizing",
      "Instant preview of resized images",
      "Batch processing for multiple platforms",
      "One-click download of optimized images",
      "No registration or watermarks",
    ],
    howToUse: [
      "Select your target social platform",
      "Choose the specific image type (post, profile, cover, etc.)",
      "Upload your original image",
      "Preview the resized result",
      "Adjust settings if needed",
      "Download your optimized image",
      "Use directly on your chosen platform",
    ],
    faqs: [
      {
        question: "Why are image dimensions important for social media?",
        answer:
          "Each social platform has specific recommended dimensions for different image types. Using the correct sizes ensures your content looks professional, displays properly without cropping, and creates better engagement with your audience.",
      },
      {
        question: "Will resizing affect my image quality?",
        answer:
          "Our tool uses high-quality resizing algorithms to maintain image clarity. However, if you're significantly enlarging a small image, some quality loss is unavoidable. For best results, start with high-resolution images.",
      },
      {
        question: "Which social media platforms are supported?",
        answer:
          "We support all major platforms including Facebook, Instagram, Twitter, LinkedIn, Pinterest, YouTube, TikTok, and more. Our dimensions are regularly updated to match current platform specifications.",
      },
      {
        question: "What file formats can I use and download?",
        answer:
          "You can upload JPG, PNG, GIF, and WebP formats. Downloads are provided as JPG files for maximum compatibility across all platforms.",
      },
    ],
  },
  "linkedin-headline-generator": {
    id: "linkedin-headline-generator",
    name: "LinkedIn Headline Generator",
    description:
      "Create powerful, attention-grabbing LinkedIn headlines tailored to your industry and experience",
    features: [
      "Industry-specific headline suggestions",
      "Multiple professional styles",
      "Keyword optimization for recruiters",
      "Customizable impact level",
      "Save and manage your favorite headlines",
    ],
    howToUse: [
      "Select your industry and headline style",
      "Enter your job title and experience details",
      "Adjust the impact level slider",
      "Generate personalized LinkedIn headlines",
      "Copy and save your favorites to use on your profile",
    ],
    faqs: [
      {
        question: "How long should my LinkedIn headline be?",
        answer:
          "LinkedIn headlines have a 220-character limit, but our generator creates concise headlines that balance impact with brevity.",
      },
      {
        question: "Will these headlines help with recruiter searches?",
        answer:
          "Yes, our headlines incorporate industry-specific keywords that improve your profile's visibility in recruiter searches.",
      },
      {
        question: "How often should I update my LinkedIn headline?",
        answer:
          "We recommend updating your headline when you change roles, gain significant new skills, or want to shift your professional focus.",
      },
    ],
  },
  "instagram-generator": {
    id: "instagram-generator",
    name: "Instagram Bio & Caption Generator",
    description:
      "Create engaging Instagram profile bios and captions tailored to your niche and style",
    features: [
      "Profile bio and caption generation",
      "Niche-specific content suggestions",
      "Multiple content styles",
      "Emoji and hashtag integration",
      "Customizable creativity level",
      "Save and manage your favorite content",
    ],
    howToUse: [
      "Choose between profile bio or caption generation",
      "Select your niche and content style",
      "Enter your profile details or caption topic",
      "Adjust the creativity level slider",
      "Generate personalized Instagram content",
      "Copy and save your favorites to use on Instagram",
    ],
    faqs: [
      {
        question: "How long can Instagram bios be?",
        answer:
          "Instagram bios have a 150-character limit. Our generator creates concise, impactful bios that fit within this constraint.",
      },
      {
        question: "Do the captions include hashtags?",
        answer:
          "Yes, our caption generator includes relevant hashtags grouped at the end of the caption to maximize discoverability.",
      },
      {
        question: "How can I make my Instagram profile stand out?",
        answer:
          "Use a clear, engaging bio that highlights your unique value, includes a call-to-action, and uses relevant emojis to break up text and add personality.",
      },
      {
        question: "What makes a good Instagram caption?",
        answer:
          "Effective captions are authentic, include a call-to-action or question to boost engagement, and use relevant hashtags to increase discoverability.",
      },
    ],
  },
  "youtube-description-generator": {
    id: "youtube-description-generator",
    name: "YouTube Channel Description Generator",
    description:
      "Create professional, SEO-optimized YouTube channel descriptions that attract subscribers",
    features: [
      "Category-specific description suggestions",
      "Multiple content styles",
      "SEO keyword optimization",
      "Call-to-action integration",
      "Customizable formality level",
      "Save and manage your favorite descriptions",
    ],
    howToUse: [
      "Select your channel category and description style",
      "Enter your channel name and details",
      "Adjust the formality level slider",
      "Generate personalized YouTube descriptions",
      "Copy and save your favorites to use on your channel",
    ],
    faqs: [
      {
        question: "How long should my YouTube channel description be?",
        answer:
          "YouTube allows up to 5,000 characters for channel descriptions, but our generator creates optimized descriptions between 500-1,000 characters for maximum impact.",
      },
      {
        question: "Will these descriptions help with YouTube SEO?",
        answer:
          "Yes, our descriptions incorporate relevant keywords and hashtags that can improve your channel's discoverability in YouTube search results.",
      },
      {
        question: "What should I include in my channel description?",
        answer:
          "An effective channel description should include what your channel is about, your upload schedule, a call-to-action to subscribe, and links to your social media or website.",
      },
      {
        question: "How often should I update my channel description?",
        answer:
          "We recommend updating your description whenever your channel focus changes, you add new content categories, or you want to highlight different aspects of your channel.",
      },
    ],
  },
  "twitter-bio-generator": {
    id: "twitter-bio-generator",
    name: "Twitter/X Bio Generator",
    description:
      "Create concise, attention-grabbing Twitter/X bios that showcase your personality",
    features: [
      "Category-specific bio suggestions",
      "Multiple bio styles",
      "Character count optimization",
      "Emoji integration",
      "Customizable conciseness level",
      "Save and manage your favorite bios",
    ],
    howToUse: [
      "Select your profile category and bio style",
      "Enter your display name and profile details",
      "Adjust the conciseness level slider",
      "Generate personalized Twitter/X bios",
      "Copy and save your favorites to use on your profile",
    ],
    faqs: [
      {
        question: "How long can Twitter/X bios be?",
        answer:
          "Twitter/X has a 160-character limit for bios. Our generator creates concise bios that fit within this constraint while maximizing impact.",
      },
      {
        question: "Should I use emojis in my Twitter bio?",
        answer:
          "Emojis can make your bio more visually appealing and help convey information quickly. Our generator includes relevant emojis where appropriate.",
      },
      {
        question: "How often should I update my Twitter/X bio?",
        answer:
          "We recommend updating your bio whenever you change your focus, start a new project, or want to highlight different aspects of your personality or brand.",
      },
      {
        question: "What makes a good Twitter/X bio?",
        answer:
          "A good Twitter/X bio is concise, authentic, and gives followers a clear idea of who you are and what you tweet about. It should be memorable and reflect your personality or brand voice.",
      },
    ],
  },
  "favicon-generator": {
    id: "favicon-generator",
    name: "Favicon Generator",
    description:
      "Generate favicons in all sizes needed for modern websites and apps",
    features: [
      "Multiple favicon sizes (16x16 to 512x512)",
      "Background color customization",
      "Size selection options",
      "Bulk download as ZIP package",
      "HTML code snippets included",
      "Manifest.json example for PWAs",
    ],
    howToUse: [
      "Upload a square image (PNG, JPG, or SVG)",
      "Select your preferred background color",
      "Choose which favicon sizes to generate",
      "Generate your favicon package",
      "Download individual icons or the complete package",
    ],
    faqs: [
      {
        question: "What image format should I upload?",
        answer:
          "For best results, upload a square PNG or SVG image with a transparent background. The image should be at least 512x512 pixels for optimal quality across all sizes.",
      },
      {
        question: "What sizes do I need for my website?",
        answer:
          "At minimum, you should include 16x16, 32x32, and 192x192 sizes. The 16x16 and 32x32 sizes are for browser tabs, while larger sizes are for bookmarks, mobile devices, and PWAs.",
      },
      {
        question: "How do I add these favicons to my website?",
        answer:
          "The downloaded ZIP file includes an HTML code snippet that you can copy and paste into the <head> section of your HTML. This will ensure your favicon displays correctly across all devices.",
      },
      {
        question: "What's included in the ZIP download?",
        answer:
          "The ZIP file contains all selected favicon sizes as PNG files, an HTML code snippet for implementation, and a manifest.json example for Progressive Web Apps.",
      },
    ],
  },
  "chrome-extension-logo-generator": {
    id: "chrome-extension-logo-generator",
    name: "Chrome Extension Logo Generator",
    description:
      "Generate all required logo sizes for Chrome extensions and the Chrome Web Store",
    features: [
      "All required Chrome extension icon sizes",
      "Background color customization",
      "Size selection options",
      "Bulk download as ZIP package",
      "Manifest.json example included",
      "Detailed usage instructions",
    ],
    howToUse: [
      "Upload a square image (PNG, JPG, or SVG)",
      "Select your preferred background color",
      "Choose which logo sizes to generate",
      "Generate your Chrome extension logos",
      "Download individual icons or the complete package",
    ],
    faqs: [
      {
        question: "What sizes do I need for my Chrome extension?",
        answer:
          "Chrome extensions require several icon sizes: 16x16 and 32x32 for browser action icons, 48x48 for the extensions page, and 128x128 for the Chrome Web Store. Our tool generates all these sizes plus additional recommended sizes.",
      },
      {
        question: "How do I use these icons in my extension?",
        answer:
          "The downloaded ZIP file includes a manifest.json example that shows how to reference the icons in your extension. You'll need to include the icons in your extension's directory and reference them in your manifest.json file.",
      },
      {
        question:
          "What's the difference between browser action and toolbar icons?",
        answer:
          "Browser action icons (16x16, 32x32) appear in the Chrome toolbar, while the extension management page uses the 48x48 icon. The 128x128 icon is used in the Chrome Web Store listing for your extension.",
      },
      {
        question: "What's included in the ZIP download?",
        answer:
          "The ZIP file contains all selected logo sizes as PNG files, a manifest.json example showing how to reference the icons, and a README file with detailed usage instructions.",
      },
    ],
  },
  "free-ai-logo-generator": {
    id: "free-ai-logo-generator",
    name: "Free AI Logo Generator",
    description:
      "Create beautiful logos using AI-generated designs with gradient backgrounds",
    features: [
      "AI-generated logo suggestions",
      "700+ Lucide icons to choose from",
      "10 beautiful gradient presets",
      "Multiple shape options (circle, square, rounded)",
      "Customizable icon size and padding",
      "Icon color customization",
      "Multiple export sizes (32px to 512px)",
      "Bulk download as ZIP package",
    ],
    howToUse: [
      "Browse AI-generated logo suggestions",
      "Customize any suggestion or create your own",
      "Select a Lucide icon from the library",
      "Choose your preferred shape and gradient",
      "Customize icon size, color, and padding",
      "Preview your logo design",
      "Generate and download your logos",
    ],
    faqs: [
      {
        question: "Are these logos really free?",
        answer:
          "Yes, all logos generated with this tool are completely free to use for both personal and commercial projects.",
      },
      {
        question: "What are Lucide icons?",
        answer:
          "Lucide is a community-developed icon library with over 700 open-source icons. It's a fork of Feather Icons, offering a wide variety of beautifully crafted, consistent icons for your projects.",
      },
      {
        question: "Can I use these logos commercially?",
        answer:
          "Yes, Lucide icons are licensed under the ISC License, which allows for both personal and commercial use. The logos you generate with this tool are yours to use as you wish.",
      },
      {
        question: "What sizes should I download?",
        answer:
          "For most web applications, the 32px, 64px, and 128px sizes are sufficient. For high-resolution displays or app icons, include the 256px and 512px sizes as well.",
      },
    ],
  },
  "png-to-ico-converter": {
    id: "png-to-ico-converter",
    name: "PNG to ICO Converter",
    description:
      "Convert PNG images to ICO format for favicons and desktop icons",
    features: [
      "Convert any image to ICO format",
      "Multiple size options (16x16 to 128x128)",
      "Optimized for favicons and desktop icons",
      "Individual file downloads",
      "Bulk download as ZIP package",
      "No watermarks or registration required",
    ],
    howToUse: [
      "Upload your PNG or other image file",
      "Select the icon sizes you need",
      "Click 'Convert to ICO'",
      "Download individual sizes or the complete package",
      "Follow the included instructions for final ICO conversion",
    ],
    faqs: [
      {
        question: "What image formats can I convert to ICO?",
        answer:
          "You can upload PNG, JPG, GIF, SVG, or any other web-supported image format. For best results, use a square PNG image with a transparent background.",
      },
      {
        question: "Why can't I download a direct ICO file?",
        answer:
          "Due to browser limitations, we can't create true ICO files directly in the browser. Instead, we provide PNG files in the correct sizes along with instructions for final conversion using online converters or desktop tools.",
      },
      {
        question: "What sizes should I use for favicons?",
        answer:
          "For basic favicons, 16x16 and 32x32 sizes are essential. For Windows desktop icons, include 48x48 and 64x64 sizes. The 128x128 size is useful for high-resolution displays.",
      },
      {
        question: "Is this service really free?",
        answer:
          "Yes, this tool is completely free to use with no hidden fees, watermarks, or registration requirements.",
      },
    ],
  },
  "grammar-spell-checker": {
    id: "grammar-checker",
    name: "Grammar Checker",
    description:
      "Enhance your writing with advanced AI-powered grammar and spelling correction",
    features: [
      "Advanced AI-driven error detection",
      "Multiple checking modes (comprehensive, academic, professional)",
      "Real-time grammar and spelling suggestions",
      "Detailed error explanations",
      "Readability score analysis",
      "Supports multiple document types",
      "Instant, comprehensive writing improvement",
    ],
    howToUse: [
      "Select your preferred checking mode",
      "Paste or type your text into the input area",
      "Click 'Check Grammar' button",
      "Review detailed error suggestions",
      "Examine side-by-side original and corrected text",
      "Understand readability insights",
      "Apply suggestions to improve your writing",
    ],
    faqs: [
      {
        question: "How accurate is the grammar checking?",
        answer:
          "Our AI is trained on extensive language data and provides highly precise suggestions. However, we recommend always reviewing recommendations carefully as context can vary.",
      },
      {
        question: "What languages are supported?",
        answer:
          "Currently, we support English comprehensively. Additional language support is planned for future updates. The tool works best with clear, standard English text.",
      },
      {
        question: "Is my text kept private?",
        answer:
          "Yes, your text is processed securely and not stored or shared. All grammar checking happens in real-time with complete privacy protection.",
      },
      {
        question: "What makes this grammar checker different?",
        answer:
          "Unlike basic spell-checkers, our AI provides context-aware suggestions, explains errors, offers multiple checking modes, and gives a readability score for comprehensive writing improvement.",
      },
    ],
  },
  "link-shortener": {
    id: "link-shortener",
    name: "Link Shortener",
    description:
      "Instantly create short, memorable links with powerful analytics tracking",
    features: [
      "Create custom short links",
      "Real-time click analytics",
      "Device and location tracking",
      "Customizable link aliases",
      "Link expiration options",
      "QR code generation",
      "Copy to clipboard with one click",
    ],
    howToUse: [
      "Enter your long URL in the input field",
      "Optionally add a custom alias",
      "Set expiration date if needed",
      "Click 'Shorten' button",
      "Copy and share your new short link",
      "Track link performance in analytics dashboard",
    ],
    faqs: [
      {
        question: "Are the shortened links permanent?",
        answer:
          "Links can be created with optional expiration dates. By default, they remain active indefinitely.",
      },
      {
        question: "Can I customize my short link?",
        answer:
          "Yes! You can create custom aliases for your links, making them more memorable and branded.",
      },
      {
        question: "What kind of analytics are provided?",
        answer:
          "We track total clicks, unique visitors, device types, geographic location, and referral sources.",
      },
      {
        question: "Is this service free?",
        answer:
          "Basic link shortening is free. Advanced analytics and custom features are available in premium plans.",
      },
    ],
  },
  "utm-parameter-builder": {
    id: "utm-parameter-builder",
    name: "UTM Parameter Builder",
    description: "Create trackable campaign URLs with UTM parameters",
    features: [
      "Build properly formatted UTM URLs with a simple interface",
      "Choose from common source and medium values or create custom ones",
      "Ensure all your UTM parameters follow best practices",
      "Easily copy your generated URL with one click",
      "No account required and your data stays in your browser",
    ],
    howToUse: [
      "Enter your destination URL including http:// or https://",
      "Select or enter a custom Campaign Source (required)",
      "Select or enter a custom Campaign Medium (required)",
      "Add optional Campaign Name, Term, and Content parameters",
      "Click 'Generate UTM URL' to create your tracking URL",
      "Copy the generated URL to use in your marketing campaigns",
    ],
    faqs: [
      {
        question: "What are UTM parameters?",
        answer:
          "UTM parameters are tags added to a URL that help track the effectiveness of online marketing campaigns across traffic sources and publishing media.",
      },
      {
        question: "Which UTM parameters are required?",
        answer:
          "Only utm_source and utm_medium are required, but using utm_campaign is highly recommended for better tracking.",
      },
      {
        question: "Do UTM parameters affect SEO?",
        answer:
          "No, UTM parameters don't negatively impact SEO as search engines ignore them when indexing pages.",
      },
      {
        question: "How do I view UTM data?",
        answer:
          "UTM data can be viewed in analytics platforms like Google Analytics under the Acquisition > Campaigns sections.",
      },
      {
        question: "Should UTM parameters be uppercase or lowercase?",
        answer:
          "It's best practice to use lowercase for UTM parameters as they are case-sensitive in some analytics tools.",
      },
    ],
  },
  "ai-course-outline-generator": {
    id: "ai-outline-generator",
    name: "AI Course Outline Generator",
    description: "Create structured, comprehensive course outlines in seconds",
    features: [
      "Instantly generate well-structured course outlines with learning objectives, weekly schedules, and assessment plans",
      "Tailor outlines to specific audiences, course durations, and learning objectives with intuitive controls",
      "Generate outlines with detailed weekly modules, learning activities, assessments, and resource recommendations",
      "Easily download or copy your generated course outlines for use in learning management systems or curriculum documents",
      "Reduce hours of planning to minutes with AI-assisted curriculum development that maintains educational best practices",
    ],
    howToUse: [
      "Enter your course topic in the required field",
      "Select your target audience from the dropdown menu",
      "Choose the course type that best fits your needs",
      "Adjust the course duration using the slider",
      "Add any additional information or specific requirements",
      "Click 'Generate Course Outline' to create your customized curriculum",
      "Review, copy, or download your generated outline",
    ],
    faqs: [
      {
        question: "What types of courses can I create outlines for?",
        answer:
          "You can generate outlines for virtually any subject or discipline, from technical topics like programming and data science to humanities, business, arts, and more.",
      },
      {
        question: "Can I edit the generated outline?",
        answer:
          "Yes, you can copy the generated outline and modify it in your preferred text editor. The tool provides a solid foundation that you can customize further.",
      },
      {
        question: "How detailed are the generated outlines?",
        answer:
          "Outlines include course descriptions, learning objectives, weekly modules with lectures and activities, assessment structures, and prerequisites. The depth varies based on your selected parameters.",
      },
      {
        question: "Are the outlines suitable for accredited courses?",
        answer:
          "The generator provides a solid foundation, but you should review and adapt the content to meet specific accreditation requirements for your institution or certification body.",
      },
      {
        question: "Can I save multiple course outlines?",
        answer:
          "Currently, you can download or copy outlines to save them externally. Generate and save as many as you need for different courses.",
      },
    ],
  },
  "ai-script-generator": {
    id: "ai-script-generator",
    name: "AI Script Generator",
    description:
      "Create professional scripts for videos, podcasts, and presentations",
    features: [
      "Generate professional scripts for videos, podcasts, presentations, and more",
      "Customize tone, duration, and style to match your specific needs",
      "Add attention-grabbing hooks and effective calls to action",
      "Download as Markdown or copy as HTML for easy integration with your workflow",
      "Save hours of writing time with AI-assisted script development",
    ],
    howToUse: [
      "Enter your script topic in the required field",
      "Select the desired tone for your script",
      "Choose the script type (video, podcast, commercial, etc.)",
      "Set the approximate duration in minutes",
      "Select any additional elements you want to include",
      "Add any specific requirements or information",
      "Click 'Generate Script' to create your customized content",
      "Copy or download your generated script",
    ],
    faqs: [
      {
        question: "What types of scripts can I create?",
        answer:
          "You can generate scripts for YouTube videos, podcasts, commercials, presentations, tutorials, and more. The tool adapts the format based on the script type you select.",
      },
      {
        question: "How long can the scripts be?",
        answer:
          "You can generate scripts ranging from 1 to 10 minutes in length. The tool estimates content volume based on average speaking rates.",
      },
      {
        question: "Can I customize the generated script?",
        answer:
          "Yes, you can download the Markdown file or copy the content and modify it in your preferred editor to further customize it for your specific needs.",
      },
      {
        question: "Will the script include technical directions?",
        answer:
          "Yes, depending on the script type you select, it will include appropriate cues such as [VISUAL CUES] for videos, [HOST/GUEST] indicators for podcasts, or [SLIDE X] for presentations.",
      },
      {
        question: "Do I need to create an account to use this tool?",
        answer:
          "No, this tool is completely free to use without registration or login. Generate as many scripts as you need.",
      },
    ],
  },
  "ai-course-reviews-generator": {
    id: "ai-course-reviews-generator",
    name: "AI Course Reviews Generator",
    description: "Create detailed, professional course reviews in seconds",
    features: [
      "Generate comprehensive course reviews with customizable tone and length",
      "Include pros, cons, and comparisons to similar courses",
      "Tailor reviews for different course levels and subject areas",
      "Download as Markdown or copy as HTML for easy publication",
      "Save hours of writing time with AI-assisted review generation",
    ],
    howToUse: [
      "Enter the course name in the required field",
      "Add optional details like subject area and instructor name",
      "Select the course level and set your star rating",
      "Choose review tone (positive, balanced, critical, etc.)",
      "Select review length and which sections to include",
      "Click 'Generate Review' to create your customized content",
      "Copy or download your generated review",
    ],
    faqs: [
      {
        question: "What kind of courses can I review with this tool?",
        answer:
          "You can generate reviews for any type of course, including online courses, bootcamps, university classes, workshops, and training programs across all subject areas.",
      },
      {
        question: "How accurate will the reviews be?",
        answer:
          "The generated reviews are based on the information you provide. For the most accurate and helpful reviews, include specific details about the course content, teaching style, and your experience.",
      },
      {
        question: "Can I customize the review after generation?",
        answer:
          "Yes, you can download the Markdown file or copy the content and modify it in your preferred editor to add your personal experiences or additional details.",
      },
      {
        question:
          "Will the review include specific course details I haven't provided?",
        answer:
          "The generator will create plausible content based on the course name, subject, and other details you provide, but for the most accurate review, it's best to include specific information about the course content.",
      },
      {
        question: "Do I need to create an account to use this tool?",
        answer:
          "No, this tool is completely free to use without registration or login. Generate as many course reviews as you need.",
      },
    ],
  },
  "ai-course-promotion-generator": {
    id: "ai-course-promotion-generator",
    name: "AI Course Promotion Generator",
    description:
      "Create compelling marketing content for online courses in seconds",
    features: [
      "Generate promotional content for multiple platforms",
      "Customize tone and style to match your course's unique value",
      "Create social media posts, email campaigns, and landing page copy",
      "Tailor content to specific target audiences",
      "Save time and resources with AI-powered marketing content generation",
    ],
    howToUse: [
      "Enter the course name in the required field",
      "Add optional details like course subject and target audience",
      "Specify unique selling points of your course",
      "Choose the promotion type (social media, email, landing page, etc.)",
      "Select the desired tone and content length",
      "Customize additional options like call-to-action and emojis",
      "Click 'Generate Promotion' to create your marketing content",
      "Copy or download your generated promotional material",
    ],
    faqs: [
      {
        question: "What types of promotional content can I generate?",
        answer:
          "You can create content for various platforms, including social media posts, email campaigns, landing page copy, advertising copy, and blog post introductions.",
      },
      {
        question: "How can I make the promotion more effective?",
        answer:
          "Provide specific details about your course, its unique value proposition, and target audience. The more information you include, the more tailored and compelling the promotional content will be.",
      },
      {
        question: "Can I adjust the generated promotional content?",
        answer:
          "Absolutely! You can download the generated content and further customize it in your preferred editor to add personal touches or specific details.",
      },
      {
        question: "Is the generated content suitable for all types of courses?",
        answer:
          "Yes, the tool is designed to be versatile and can generate promotional content for online courses across various subjects, skill levels, and industries.",
      },
      {
        question: "Do I need to create an account to use this tool?",
        answer:
          "No, this tool is completely free to use and requires no registration or login. Generate as many promotional materials as you need.",
      },
    ],
  },
  "ai-course-image-generator": {
    id: "ai-course-image-generator",
    name: "AI Course Image Generator",
    description:
      "Create professional, custom images for your online courses in seconds",
    features: [
      "Generate unique course images with AI technology",
      "Customize image style, aspect ratio, and color palette",
      "Create visuals for social media, landing pages, and course platforms",
      "Choose from multiple design styles and themes",
      "No design skills required - generate professional images instantly",
    ],
    howToUse: [
      "Enter the course name in the required field",
      "Add optional details like course subject",
      "Select your preferred image style",
      "Choose the aspect ratio and color palette",
      "Customize additional image options",
      "Click 'Generate Image' to create your visual",
      "Download or regenerate the image as needed",
    ],
    faqs: [
      {
        question: "What types of course images can I create?",
        answer:
          "You can generate images for various online courses, including professional training, academic subjects, technical skills, creative classes, and more.",
      },
      {
        question: "Can I customize the generated images?",
        answer:
          "Yes, you can customize the image style, aspect ratio, color palette, and add specific details to guide the image generation.",
      },
      {
        question: "What image sizes are available?",
        answer:
          "We offer multiple aspect ratios including landscape (16:9), square (1:1), portrait (9:16), and standard (4:3) to suit different platform requirements.",
      },
      {
        question: "How unique are the generated images?",
        answer:
          "Each image is uniquely generated by AI based on your specific inputs, ensuring a custom visual for your course.",
      },
      {
        question: "Do I need any design skills to use this tool?",
        answer:
          "No design experience is necessary. The AI handles the creative process, allowing you to generate professional images easily.",
      },
    ],
  },
  "readability-tester": {
    id: "readability-tester",
    name: "AI Readability Tester",
    description: "Advanced AI-powered text analysis and readability insights",
    features: [
      "AI-driven comprehensive text analysis",
      "Multiple readability algorithm scoring",
      "Intelligent insights and improvement suggestions",
      "Audience targeting recommendations",
      "Detailed writing style assessment",
      "Support for various content types",
    ],
    howToUse: [
      "Paste or type your text into the text area",
      "Select a readability algorithm",
      "Choose the content type (academic, technical, marketing, etc.)",
      "Click 'Analyze Readability' for AI-powered insights",
      "Review comprehensive analysis and recommendations",
      "Download or copy the detailed results",
    ],
    faqs: [
      {
        question: "How does AI improve readability analysis?",
        answer:
          "Our AI provides deep, contextual insights beyond traditional readability metrics, offering nuanced recommendations for improving text clarity and effectiveness.",
      },
      {
        question: "What kind of insights does the AI provide?",
        answer:
          "The AI analyzes sentence structure, vocabulary complexity, writing style, target audience suitability, and offers specific improvement suggestions.",
      },
      {
        question: "Is the analysis suitable for different types of writing?",
        answer:
          "Yes! The tool adapts its analysis to various content types, including academic papers, marketing copy, technical documents, and educational materials.",
      },
      {
        question: "How accurate are the AI-generated insights?",
        answer:
          "The AI uses advanced language models to provide contextually relevant and sophisticated analysis, complementing traditional readability metrics.",
      },
      {
        question: "Can I use this for professional writing?",
        answer:
          "Absolutely! The tool is designed to help professionals across industries improve their writing clarity, comprehension, and impact.",
      },
    ],
  },
  "youtube-subscription-button-creator": {
    id: "youtube-subscription-button-creator",
    name: "YouTube Subscription Button Creator",
    description:
      "Create customizable YouTube subscription buttons for your website",
    features: [
      "Official YouTube subscribe button integration",
      "Channel logo display option",
      "Multiple button styles and layouts",
      "Customizable colors and sizes",
      "HTML and React code generation",
      "Live preview",
      "Support for channel ID and username formats",
      "One-click copy to clipboard",
    ],
    howToUse: [
      "Enter your YouTube channel URL or username",
      "Choose your preferred button style and options",
      "Customize colors, size, and text as needed",
      "Toggle channel logo and subscriber count display",
      "Preview your button in real-time",
      "Copy the generated code to your website",
    ],
    faqs: [
      {
        question: "What YouTube channel URL formats are supported?",
        answer:
          "We support all YouTube channel URL formats including channel IDs (youtube.com/channel/UCrxaUCdOAT4sjsxYrUDaoZQ), usernames (youtube.com/@username), and user URLs (youtube.com/user/username).",
      },
      {
        question: "What's the difference between button styles?",
        answer:
          "The default style uses YouTube's official subscribe button with the YouTube API. The custom button style gives you more control over colors and appearance. The basic text link is the simplest option for minimal designs.",
      },
      {
        question: "Can I customize the button appearance?",
        answer:
          "Yes! You can choose from three button styles: the default YouTube button, a custom button with YouTube icon, or a basic text link. You can also customize colors, sizes, button text, and toggle channel logo display.",
      },
      {
        question: "Will the button work on any website?",
        answer:
          "Yes, the generated code can be added to any website that allows you to add custom HTML. This includes WordPress, Wix, Squarespace, and other website builders.",
      },
      {
        question: "Do I need to know coding to use this tool?",
        answer:
          "No coding knowledge is required. Simply generate the button, copy the code, and paste it into your website's HTML editor or custom code section.",
      },
    ],
  },
  "ai-invoice-generator": {
    id: "ai-invoice-generator",
    name: "AI Invoice Generator",
    description: "Create professional invoices with AI assistance",
    features: [
      "Generate professional invoices with customizable templates",
      "Add line items, quantities, prices, and discounts",
      "Select from multiple currency options",
      "Choose tax calculation options",
      "Customize invoice design with templates",
      "Download as PDF or copy as HTML",
      "Save time with automatic calculations",
    ],
    howToUse: [
      "Enter your business information",
      "Add line items with description, quantity, price, and discount",
      "Select currency and tax options",
      "Customize invoice design with templates",
      "Click 'Generate Invoice' to create your customized invoice",
      "Copy or download your generated invoice",
    ],
    faqs: [
      {
        question: "What types of invoices can I create?",
        answer:
          "You can create invoices for various types of businesses, including freelancers, small businesses, and large corporations. The tool supports multiple currencies and tax calculation options.",
      },
      {
        question: "Can I customize the invoice design?",
        answer:
          "Yes, you can customize the invoice design with templates and add your company logo and branding.",
      },
      {
        question: "Do I need any design skills to use this tool?",
        answer:
          "No design skills are required. The tool provides customizable templates and easy-to-use controls.",
      },
    ],
  },
  "bark-to-text": {
    id: "bark-to-text",
    name: "Bark to Text Converter",
    description:
      "Convert your dog's barks into text using advanced AI technology",
    features: [
      "Advanced AI bark analysis",
      "High accuracy speech recognition",
      "Multiple audio input options",
      "Real-time processing",
      "Detailed bark interpretation",
      "Emotion detection",
      "Easy-to-use interface",
      "Login required",
    ],
    howToUse: [
      "Record your dog's bark or upload an audio file",
      "Click 'Convert to Text' to process the audio",
      "Review the transcribed text interpretation",
      "Save or share the results",
    ],
    faqs: [
      {
        question: "How accurate is the bark recognition?",
        answer:
          "Our AI model has been trained on thousands of dog barks across different breeds to achieve high accuracy, though results may vary depending on audio quality and dog breed.",
      },
      {
        question: "What audio formats are supported?",
        answer:
          "We support common audio formats including WAV, MP3, M4A, and FLAC. Files should be under 10MB for optimal processing.",
      },
      {
        question: "Can it distinguish between different dogs?",
        answer:
          "The current version focuses on bark-to-text translation regardless of the specific dog. Future updates may include dog identification features.",
      },
      {
        question: "Does this work for all dog breeds?",
        answer:
          "Yes, the system is designed to work with all dog breeds, though accuracy may vary slightly between breeds with very distinctive bark patterns.",
      },
    ],
  },
  "text-to-bark": {
    id: "text-to-bark",
    name: "Text to Bark Converter",
    description:
      "Convert text into realistic dog bark sounds using advanced AI technology",
    features: [
      "AI-powered bark generation",
      "Multiple bark styles",
      "Instant processing",
      "High-quality audio output",
      "Easy download options",
      "Customizable settings",
      "Simple text input",
      "Login required",
    ],
    howToUse: [
      "Enter the text you want to convert",
      "Click 'Generate Bark' to process",
      "Listen to the generated bark sound",
      "Download the audio file if desired",
    ],
    faqs: [
      {
        question: "How realistic are the generated barks?",
        answer:
          "Our AI model produces highly realistic bark sounds that mimic actual dog vocalizations, though they may not be indistinguishable from real dogs to other dogs.",
      },
      {
        question: "What are some use cases for this tool?",
        answer:
          "The tool is great for creating sound effects for games, videos, apps, training materials, and educational content about dog communication.",
      },
      {
        question: "Can I customize the type of bark?",
        answer:
          "Currently, we offer a standard bark sound. Future updates will include different bark styles (small dog, large dog, playful, alert, etc.).",
      },
      {
        question: "What is the maximum text length I can convert?",
        answer:
          "The standard limit is 500 characters per conversion. This helps ensure optimal processing speed and quality.",
      },
    ],
  },
  "pregnancy-tracker": {
    id: "pregnancy-tracker",
    name: "Pregnancy Tracker",
    description:
      "Track your pregnancy journey week by week with accurate dates and baby size visualizations",
    features: [
      "Week-by-week pregnancy tracking",
      "Baby size visualizations with fruit comparisons",
      "Important pregnancy milestones",
      "Trimester breakdown",
      "Due date calculator",
    ],
    howToUse: [
      "Enter your Last Menstrual Period (LMP) date",
      "View your current pregnancy progress on the Overview tab",
      "Check upcoming milestones on the Timeline tab",
      "See all important dates on the Dates tab",
      "Update your LMP date anytime in Settings",
    ],
    faqs: [
      {
        question: "How is my due date calculated?",
        answer:
          "Your due date is calculated as 280 days (40 weeks) from the first day of your last menstrual period (LMP).",
      },
      {
        question: "Is my data saved between visits?",
        answer:
          "Yes, your last menstrual period date is saved locally on your device. Sign in for cloud backup of your data.",
      },
      {
        question: "How accurate are the pregnancy milestones?",
        answer:
          "The milestones provided are based on general pregnancy progression guidelines, but every pregnancy is unique. Always consult with your healthcare provider for personalized advice.",
      },
      {
        question: "Can I track multiple pregnancies?",
        answer:
          "Currently, the tracker supports monitoring one pregnancy at a time. We plan to add support for pregnancy history in future updates.",
      },
    ],
  },
  "screenshot-enhancer": {
    id: "screenshot-enhancer",
    name: "Screenshot Enhancer",
    description:
      "Transform your screenshots into eye-catching social media posts with custom formatting, backgrounds, text overlays, and more.",
    features: [
      "Easy screenshot upload",
      "Multiple social media platform dimensions",
      "Beautiful background options",
      "Custom text overlays",
      "Font and color customization",
      "One-click download",
      "No watermark for Pro users",
      "High-resolution export",
    ],
    howToUse: [
      "Upload your screenshot",
      "Select your preferred social media platform and dimensions",
      "Choose a background style or pattern",
      "Add custom text with your preferred font and color",
      "Position the text overlay as desired",
      "Download your enhanced screenshot",
    ],
    faqs: [
      {
        question: "What file formats are supported?",
        answer:
          "Our tool supports PNG, JPG/JPEG, and WebP images up to 10MB in size.",
      },
      {
        question:
          "Can I resize my screenshot for specific social media platforms?",
        answer:
          "Yes! You can choose from optimized dimensions for Twitter/X, Instagram, LinkedIn, Facebook, and more. You can also set custom dimensions.",
      },
      {
        question: "Will my screenshots have a watermark?",
        answer:
          "Free users will have a small 'Created with Olly' watermark. Upgrade to Pro to remove watermarks and access premium features.",
      },
      {
        question: "Can I add text to my screenshots?",
        answer:
          "Yes, you can add text overlays with customizable fonts, colors, sizes, and positions to highlight important parts of your screenshots.",
      },
    ],
  },
  "tweet-generator": {
    id: "tweet-generator",
    name: "Tweet Mockup Generator",
    description:
      "Create realistic tweet mockups for your content and presentations",
    features: [
      "Customizable profile details",
      "Engagement metrics",
      "Image upload support",
      "Verification badge option",
      "One-click download",
      "No registration required",
      "High-quality PNG export",
      "Modern Twitter UI",
    ],
    keywords: [
      "tweet",
      "mockup",
      "generator",
      "social media",
      "presentation",
      "content creation",
    ],
    howToUse: [
      "Enter the tweet content and profile details",
      "Customize engagement metrics",
      "Upload profile and tweet images (optional)",
      "Toggle verification badge if needed",
      "Click download to save as PNG",
    ],
    faqs: [
      {
        question: "What format are the downloads?",
        answer:
          "Downloads are in high-quality PNG format, perfect for presentations and mockups.",
      },
      {
        question: "Can I upload custom images?",
        answer: "Yes, you can upload both profile pictures and tweet images.",
      },
      {
        question: "Is there a character limit?",
        answer:
          "Yes, tweets are limited to 280 characters, just like real tweets.",
      },
      {
        question: "Can I customize engagement numbers?",
        answer:
          "Yes, you can set custom values for replies, retweets, likes, and impressions.",
      },
    ],
  },
  "blog-name-generator": {
    id: "blog-name-generator",
    name: "Blog Name Generator",
    description:
      "Find the perfect name for your blog based on your topic and style preferences.",
    features: [
      "Input for topic, keywords, or niche",
      "Options for different name styles (descriptive, creative, SEO-focused)",
      "Generate button for multiple name suggestions",
      "Display area with generated names and explanations",
      "Favorite and save functionality for preferred names",
    ],
    keywords: [
      "blog",
      "name generator",
      "blogging",
      "branding",
      "SEO",
      "creative names",
      "website names",
    ],
    howToUse: [
      "Enter your blog's topic, keywords, or niche in the input field.",
      "Select your preferred name style(s) from the options.",
      "Click the 'Generate' button to get name suggestions.",
      "Review the generated names and their explanations.",
      "Use the favorite/save feature to keep track of names you like.",
    ],
    faqs: [
      {
        question: "How does the generator come up with names?",
        answer:
          "The generator uses a combination of algorithms and dictionaries to suggest names based on your input and chosen style preferences.",
      },
      {
        question: "Can I mix different name styles?",
        answer:
          "Yes, you can often select multiple style options to get a diverse range of suggestions.",
      },
      {
        question:
          "Are the generated names guaranteed to be available as domains?",
        answer:
          "No, the generator provides name ideas. You will need to check the availability of domain names separately.",
      },
      {
        question: "Is there a limit to how many names I can generate?",
        answer:
          "Typically, you can generate multiple batches of names until you find one you like.",
      },
    ],
  },
  "introduction-writer": {
    id: "introduction-writer",
    name: "Introduction Writer",
    description:
      "Craft compelling introductions for articles, essays, and more with ease.",
    features: [
      "Text input area for keywords or topic",
      "Settings for tone (e.g., formal, casual, engaging)",
      "Option for SEO focus (incorporating keywords naturally)",
      "Copy option for the generated content",
      "Save and load functionality for previous introductions",
    ],
    keywords: [
      "introduction",
      "writing assistant",
      "content creation",
      "SEO writing",
      "writing tool",
    ],
    howToUse: [
      "Enter the main keywords or topic of your content in the input area.",
      "Adjust the settings for tone, length, and SEO focus according to your needs.",
      "Use the copy button to transfer the text.",
      "Save or load previous introductions using the respective options.",
    ],
    faqs: [
      {
        question: "What kind of content can this tool write introductions for?",
        answer:
          "It can generate introductions for various types of content, including blog posts, articles, essays, reports, and more.",
      },
      {
        question: "How accurate are the generated introductions?",
        answer:
          "The generator provides a starting point. You may need to review and edit the output to ensure it perfectly aligns with your specific content and voice.",
      },
      {
        question: "Does the SEO focus setting guarantee high rankings?",
        answer:
          "While the SEO focus setting helps incorporate keywords, high search rankings depend on many factors, including overall content quality, competition, and backlinking.",
      },
      {
        question: "Can I edit the generated introduction within the tool?",
        answer:
          "The primary function is generation and copying. For significant editing, it's recommended to copy the text into a dedicated text editor.",
      },
    ],
  },
  "podcast-name-generator": {
    id: "podcast-name-generator",
    name: "Podcast Name Generator",
    description:
      "Generate catchy, unique, and memorable names for your podcast in seconds",
    features: [
      "10+ unique name suggestions per generation",
      "Format-specific name ideas",
      "Target audience customization",
      "Save favorite names to your collection",
      "Supports all podcast niches and topics",
    ],
    howToUse: [
      "Enter your podcast theme, topic, or niche",
      "Select your preferred podcast format",
      "Specify your target audience (optional)",
      "Add any additional stylistic preferences",
      "Click 'Generate Names' to see your options",
    ],
    faqs: [
      {
        question: "How many podcast name ideas will I get?",
        answer:
          "Each generation provides 10 unique podcast name ideas tailored to your specifications.",
      },
      {
        question: "Can I save names I like for later?",
        answer:
          "Yes! Authenticated users can save unlimited name ideas to their collection for future reference.",
      },
      {
        question: "What if I don't like any of the suggested names?",
        answer:
          "You can easily regenerate a new set of names with the same parameters, or adjust your inputs to get different style suggestions.",
      },
      {
        question: "How do I know if a podcast name is already taken?",
        answer:
          "While our tool generates unique creative names, we recommend checking major podcast directories and doing a web search to verify availability before finalizing your choice.",
      },
      {
        question: "Can I generate names for specific podcast formats?",
        answer:
          "Absolutely! Our tool lets you select from interview, conversational, solo, documentary, panel, and educational formats to generate more relevant name suggestions.",
      },
    ],
  },
  "youtube-tag-generator": {
    id: "youtube-tag-generator",
    name: "YouTube Tag Generator",
    description:
      "Generate SEO-optimized tags to help your videos get more views",
    features: [
      "Creates 15-20 relevant tags per video",
      "Category-specific optimization",
      "Competition level adjustment",
      "Trending tag inclusion option",
      "Character count monitoring",
      "One-click copy functionality",
      "Save tag sets for future use",
    ],
    howToUse: [
      "Enter your video title (required)",
      "Add a brief description for more targeted tags",
      "Select your video category",
      "Choose your competition level",
      "Toggle trending tag inclusion if desired",
      "Click 'Generate Tags' to create your tag set",
      "Copy the entire set with one click",
    ],
    faqs: [
      {
        question: "How many tags should I use for my YouTube videos?",
        answer:
          "While YouTube allows up to 500 characters for tags, quality is more important than quantity. Our tool generates 15-20 highly relevant tags that balance specificity and search volume for optimal results.",
      },
      {
        question: "What's the difference between competition levels?",
        answer:
          "Low competition focuses on long-tail, niche-specific keywords that are easier to rank for but have lower search volume. High competition includes more popular terms with higher search volume but more difficult ranking. Medium balances between the two approaches.",
      },
      {
        question: "Do YouTube tags still matter for SEO?",
        answer:
          "Yes! While tags are just one factor in YouTube's algorithm, they help categorize your content and provide context to the platform about what your video covers. Well-optimized tags can improve your visibility in search results and suggested videos.",
      },
      {
        question: "What are trending tags and should I include them?",
        answer:
          "Trending tags are popular search terms related to your topic that currently have high search volume. Including them can help your video get discovered through trending searches, but they should still be relevant to your content.",
      },
      {
        question: "Can I edit the generated tags?",
        answer:
          "Yes! After generating tags, you can copy them to your clipboard and make any edits you want before adding them to your YouTube video.",
      },
    ],
  },
  "faq-generator": {
    id: "faq-generator",
    name: "FAQ Generator",
    description:
      "Create comprehensive, SEO-friendly FAQ sections with schema markup",
    features: [
      "Customizable question count (5-15)",
      "Multiple FAQ types (product, website, e-commerce, etc.)",
      "Tone selection for brand consistency",
      "Automatic JSON-LD schema markup",
      "Custom question inclusion",
      "HTML and text export options",
      "Save and reuse FAQ sets",
    ],
    howToUse: [
      "Enter your product/topic name and description",
      "Select the FAQ type and tone that fits your brand",
      "Choose the number of questions you need",
      "Add any specific questions you want included",
      "Generate your comprehensive FAQ set",
      "Copy the HTML, text, or schema markup as needed",
      "Save your FAQ set for future use or editing",
    ],
    faqs: [
      {
        question: "How does the FAQ Generator improve my website's SEO?",
        answer:
          "Our FAQ Generator creates SEO-friendly questions and answers plus JSON-LD schema markup that helps search engines understand and feature your content in rich results. This can improve visibility in search results and potentially increase click-through rates through featured snippets.",
      },
      {
        question: "Can I customize the generated FAQs?",
        answer:
          "Yes! You can specify the number of questions, add your own specific questions to include, select the tone, and choose the FAQ type. After generation, you can also edit any questions or answers before saving or exporting them.",
      },
      {
        question: "What's the difference between the various FAQ types?",
        answer:
          "Each FAQ type is optimized for different contexts. For example, 'Product/Service' focuses on features, benefits, and usage. 'E-commerce' emphasizes shipping, returns, and purchasing information. 'Technical Support' covers troubleshooting and compatibility questions. Selecting the right type ensures the most relevant questions for your specific needs.",
      },
      {
        question: "What is schema markup and why is it important?",
        answer:
          "Schema markup is a standardized format of structured data that helps search engines understand the content of your page. For FAQs, the FAQPage schema tells search engines exactly what questions and answers your page contains. This can result in enhanced search listings with expandable questions directly in search results, increasing visibility and user engagement.",
      },
      {
        question: "How do I add the generated FAQs to my website?",
        answer:
          "You can copy the HTML version and paste it directly into your website's HTML editor. If you prefer to use your own styling, use the text-only version and format it according to your design. For the schema markup, add it to the <head> section of your page or use Google Tag Manager to implement it.",
      },
    ],
  },
  "acronym-generator": {
    id: "acronym-generator",
    name: "Acronym Generator",
    description:
      "Create memorable, creative acronyms from any phrase with full word expansions",
    features: [
      "Multiple acronym suggestions per generation",
      "Full word expansion for each letter",
      "Optional catchy taglines",
      "Different acronym styles (professional, creative, fun, etc.)",
      "Preferred letter inclusion",
      "Copy and save functionality",
      "Audience-targeted suggestions",
    ],
    howToUse: [
      "Enter the full phrase you want to create an acronym for",
      "Select your preferred acronym type (professional, creative, etc.)",
      "Choose your text style formatting",
      "Enable tagline generation if desired",
      "Add any preferred letters you'd like to include",
      "Specify your target audience (optional)",
      "Click 'Generate Acronyms' to see your suggestions",
    ],
    faqs: [
      {
        question: "What types of acronyms can I create?",
        answer:
          "You can create five different types of acronyms: Creative & Memorable (unique and catchy), Professional & Formal (business-appropriate), Simple & Clear (straightforward, easy to understand), Technical & Industry-specific (using specialized terminology), and Fun & Playful (lighthearted and amusing).",
      },
      {
        question:
          "Can I specify which letters I want to include in my acronym?",
        answer:
          "Yes! The 'Preferred Letters' field allows you to list specific letters you'd like to prioritize in your acronym. Just provide comma-separated letters, and the generator will try to incorporate them when possible.",
      },
      {
        question: "What is a 'tagline' in this context?",
        answer:
          "A tagline is a short, catchy phrase that complements your acronym and can be used alongside it in branding materials. For example, if your acronym is 'FAST', a tagline might be 'Delivering results at speed.' You can enable tagline generation with the toggle switch.",
      },
      {
        question: "How does the 'Target Audience' field affect my results?",
        answer:
          "Specifying your target audience helps generate acronyms that will resonate with that specific group. For example, acronyms for technical professionals might use more specialized terminology, while those for a general audience would be more accessible.",
      },
      {
        question: "Can I save my favorite acronyms?",
        answer:
          "Yes! Authenticated users can save unlimited acronyms to their collection for future reference. Simply click the save icon next to any acronym you want to keep.",
      },
    ],
  },
};
