// data/tool-data.ts
import { Tool } from "../../types/tools-usecases";

export const tools: Tool[] = [
  {
    id: 'ai-comment-generator',
    name: 'AI Comment Generator',
    description: 'Generate personalized, dynamic comments in seconds with AI. Customize your commenting style to match your voice or brand tone and engage effectively on social media.',
    platform: 'General',
    category: 'content-generation',
    component: 'AICommentGenerator',
    image: '/images/tool-images/ai-comment-generator.jpg',
    ctaText: 'Generate Comments',
    features: [
      'Dynamic comment generation',
      'Customizable commenting style',
      'Supports multiple platforms',
      'Time-efficient engagement',
      'Learns from past comments'
    ],
    keyFeatures: [
      {
        title: 'Personalized Comments',
        description: 'Create comments that reflect your unique voice or brand tone.',
        icon: 'user'
      },
      {
        title: 'Quick Engagement',
        description: 'Generate comments instantly for faster social media interactions.',
        icon: 'clock'
      },
      {
        title: 'Multi-Platform Support',
        description: 'Works across LinkedIn, Twitter, Instagram, Facebook, and more.',
        icon: 'globe'
      },
      {
        title: 'AI Learning',
        description: 'Improves comment quality over time by learning from previous interactions.',
        icon: 'brain'
      }
    ],
    useCase: [
      {
        title: 'For Influencers',
        description: 'Boost engagement by crafting personalized responses to followers.',
        examples: [
          'Reply to comments on Instagram posts',
          'Engage with your audience on LinkedIn'
        ]
      },
      {
        title: 'For Businesses',
        description: 'Enhance brand presence with tailored interactions.',
        examples: [
          'Respond to customer queries on Facebook',
          'Participate in trending discussions on Twitter'
        ]
      }
    ],
    targetAudience: [
      'Social Media Influencers',
      'Digital Marketers',
      'Small Business Owners',
      'Content Creators'
    ],
    benefits: [
      'Saves time on social media engagement',
      'Enhances personalization in interactions',
      'Increases audience engagement rates'
    ],
    faq: [
      {
        question: 'What platforms does the AI Comment Generator support?',
        answer: 'It supports platforms like LinkedIn, Twitter, Instagram, Facebook, and more.'
      },
      {
        question: 'Can I customize the tone of the comments?',
        answer: 'Yes, you can set a commenting style that matches your voice or brand tone.'
      },
      {
        question: "Does it learn from my past comments?",
        answer: "Yes, the tool improves over time by analyzing your previous interactions."
      }
    ]
  },
  {
    id: 'virality-scorer',
    name: 'Virality Scorer',
    description: "Analyze your content's potential to go viral with AI-powered virality scores. Optimize your posts for maximum reach and engagement.",
    platform: 'General',
    category: 'content-analysis',
    component: 'ViralityScorer',
    image: '/images/tool-images/virality-scorer.jpg',
    ctaText: "Check Virality",
    features: [
      "AI-powered virality predictions",
      "Insights into audience preferences",
      "Content optimization tips",
      "Real-time scoring"
    ],
    keyFeatures: [
      {
        title: "Predict Viral Potential",
        description: "Get instant feedback on how likely your content is to go viral.",
        icon: "chart-line"
      },
      {
        title: "Optimize Posts",
        description: "Receive actionable tips to improve your content's reach and resonance.",
        icon: "lightbulb"
      },
      {
        title: "Audience Insights",
        description: "Understand what makes content resonate with your target audience.",
        icon: "target"
      }
    ],
    useCase: [
      {
        title: "For Content Creators",
        description: "Maximize reach by tailoring content based on insights.",
        examples: [
          "Adjust post timing for peak engagement",
          "Use trending hashtags effectively"
        ]
      },
      {
        title: "For Marketers",
        description: "Enhance campaign effectiveness with data-driven content strategies.",
        examples: [
          "Identify viral trends early",
          "Optimize ad content for better ROI"
        ]
      }
    ],
    targetAudience: [
      "Content Creators",
      "Digital Marketers",
      "Social Media Managers",
      "Influencers"
    ],
    benefits: [
      "Increases content engagement",
      "Provides actionable insights",
      "Enhances campaign ROI"
    ],
    faq: [
      {
        question: "How does the Virality Scorer work?",
        answer: "It uses AI algorithms to analyze content and predict its viral potential based on past trends and audience behavior."
      },
      {
        question: "Can I use it for any type of content?",
        answer: "Yes, it supports various content types, including videos, images, and text posts."
      },
      {
        question: "Is the scoring real-time?",
        answer: "Yes, the tool provides real-time scores as you input your content details."
      }
    ]
  },
  {
    id: 'ai-pun-generator',
    name: 'AI Pun Generator',
    description: "Generate clever puns and wordplay instantly with AI. Enhance your content with humor and creativity.",
    platform: 'General',
    category: 'content-generation',
    component: 'AIPunGenerator',
    image: '/images/tool-images/ai-pun-generator.jpg',
    ctaText: 'Generate Puns',
    features: [
      'Instant pun generation',
      'Customizable topics',
      'Humorous content creation',
      'Engaging social media posts'
    ],
    keyFeatures: [
      {
        title: 'Quick Humor',
        description: 'Create funny puns in seconds to lighten up any conversation.',
        icon: 'smile'
      },
      {
        title: 'Customizable',
        description: 'Choose topics or themes for puns tailored to your audience.',
        icon: 'settings'
      },
      {
        title: 'Social Media Ready',
        description: 'Use generated puns to craft engaging social media posts.',
        icon: 'share'
      }
    ],
    useCase: [
      {
        title: 'For Social Media',
        description: 'Boost engagement with humorous posts.',
        examples: [
          'Create funny tweets',
          'Craft engaging Instagram captions'
        ]
      },
      {
        title: 'For Content Writers',
        description: 'Add humor to articles and blog posts.',
        examples: [
          'Use puns in headlines',
          'Enhance storytelling with witty remarks'
        ]
      }
    ],
    targetAudience: [
      'Social Media Managers',
      'Content Writers',
      'Comedians',
      'Marketing Teams'
    ],
    benefits: [
      'Enhances content creativity',
      'Increases audience engagement',
      'Saves time in content creation'
    ],
    faq: [
      {
        question: 'How does the AI Pun Generator work?',
        answer: 'It uses AI algorithms to create puns based on wordplay and linguistic patterns.'
      },
      {
        question: 'Can I customize the pun topics?',
        answer: 'Yes, you can choose specific topics or themes for the puns.'
      },
      {
        question: 'Is it suitable for professional content?',
        answer: 'Yes, it can be used to add humor to professional content, but ensure it fits your brand tone.'
      }
    ]
  },
  {
    id: 'ai-rap-generator',
    name: 'AI Rap Generator',
    description: "Create unique, professional-quality rap lyrics with AI. Generate verses, choruses, and full songs in minutes.",
    platform: 'General',
    category: 'content-generation',
    component: 'AIRapGenerator',
    image: '/images/tool-images/ai-rap-generator.jpg',
    ctaText: 'Generate Rap Lyrics',
    features: [
      'Instant rap lyrics generation',
      'Customizable themes and styles',
      'Professional-quality output',
      'Supports full song creation'
    ],
    keyFeatures: [
      {
        title: 'Quick Creativity',
        description: 'Generate rap lyrics instantly to fuel your creativity.',
        icon: 'music'
      },
      {
        title: 'Customizable',
        description: 'Choose themes, styles, or moods for personalized rap lyrics.',
        icon: 'palette'
      },
      {
        title: 'Professional Output',
        description: 'Produce high-quality rap verses and choruses.',
        icon: 'star'
      }
    ],
    useCase: [
      {
        title: 'For Rappers',
        description: 'Boost creativity and productivity in songwriting.',
        examples: [
          'Generate new verse ideas',
          'Create full songs quickly'
        ]
      },
      {
        title: 'For Music Producers',
        description: 'Collaborate with AI to enhance songwriting processes.',
        examples: [
          'Use AI-generated lyrics as inspiration',
          'Experiment with different styles'
        ]
      }
    ],
    targetAudience: [
      'Rappers',
      'Music Producers',
      'Songwriters',
      'Music Enthusiasts'
    ],
    benefits: [
      'Enhances creativity',
      'Saves time in songwriting',
      'Provides diverse lyrical ideas'
    ],
    faq: [
      {
        question: 'How does the AI Rap Generator work?',
        answer: 'It uses AI algorithms to create rap lyrics based on linguistic patterns and musical styles.'
      },
      {
        question: 'Can I customize the rap style?',
        answer: 'Yes, you can choose specific themes, styles, or moods for the rap lyrics.'
      },
      {
        question: 'Is it suitable for professional music production?',
        answer: 'Yes, it can be used to generate professional-quality rap lyrics for music production.'
      }
    ]
  },
  {
  id: 'ai-roast-generator',
  name: 'AI Roast Generator',
  description: "Create playful roasts and comebacks with AI. Enhance your humor and wit in social interactions.",
  platform: 'General',
  category: 'content-generation',
  component: 'AIRoastGenerator',
  image: '/images/tool-images/ai-roast-generator.jpg',
  ctaText: 'Generate Roasts',
  features: [
    'Instant roast generation',
    'Customizable topics',
    'Humorous content creation',
    'Engaging social media posts'
  ],
  keyFeatures: [
    {
      title: 'Quick Wit',
      description: 'Create funny roasts in seconds to lighten up any conversation.',
      icon: 'smile'
    },
    {
      title: 'Customizable',
      description: 'Choose topics or themes for roasts tailored to your audience.',
      icon: 'settings'
    },
    {
      title: 'Social Media Ready',
      description: 'Use generated roasts to craft engaging social media posts.',
      icon: 'share'
    }
  ],
  useCase: [
    {
      title: 'For Social Media',
      description: 'Boost engagement with humorous posts.',
      examples: [
        'Create funny tweets',
        'Craft engaging Instagram captions'
      ]
    },
    {
      title: 'For Comedians',
      description: 'Enhance stand-up routines with witty roasts.',
      examples: [
        'Use AI-generated roasts as inspiration',
        'Experiment with different styles'
      ]
    }
  ],
  targetAudience: [
    'Social Media Managers',
    'Comedians',
    'Content Writers',
    'Marketing Teams'
  ],
  benefits: [
    'Enhances content creativity',
    'Increases audience engagement',
    'Saves time in content creation'
  ],
  faq: [
    {
      question: 'How does the AI Roast Generator work?',
      answer: 'It uses AI algorithms to create roasts based on wordplay and linguistic patterns.'
    },
    {
      question: 'Can I customize the roast topics?',
      answer: 'Yes, you can choose specific topics or themes for the roasts.'
    },
    {
      question: 'Is it suitable for professional content?',
      answer: 'Yes, it can be used to add humor to professional content, but ensure it fits your brand tone.'
    }
  ]
},
{
  id: 'hashtag-generator',
  name: 'Hashtag Generator',
  description: "Generate relevant, trending hashtags for your social media posts with AI. Increase post visibility and engagement.",
  platform: 'General',
  category: 'content-optimization',
  component: 'HashtagGenerator',
  image: '/images/tool-images/hashtag-generator.jpg',
  ctaText: 'Generate Hashtags',
  features: [
    'Instant hashtag generation',
    'Trending hashtag suggestions',
    'Customizable topics',
    'Increased post visibility'
  ],
  keyFeatures: [
    {
      title: 'Boost Visibility',
      description: 'Use AI-generated hashtags to increase your post reach.',
      icon: 'eye'
    },
    {
      title: 'Trending Insights',
      description: 'Stay updated with the latest trending hashtags.',
      icon: 'chart-line'
    },
    {
      title: 'Customizable',
      description: 'Choose topics or themes for hashtags tailored to your content.',
      icon: 'settings'
    }
  ],
  useCase: [
    {
      title: 'For Social Media Managers',
      description: 'Enhance post engagement with relevant hashtags.',
      examples: [
        'Increase Instagram post visibility',
        'Improve Twitter engagement'
      ]
    },
    {
      title: 'For Influencers',
      description: 'Maximize audience reach by using trending hashtags.',
      examples: [
        'Use AI-generated hashtags in Instagram stories',
        'Optimize TikTok videos with hashtags'
      ]
    }
  ],
  targetAudience: [
    'Social Media Managers',
    'Influencers',
    'Content Creators',
    'Digital Marketers'
  ],
  benefits: [
    'Increases post visibility',
    'Enhances engagement rates',
    'Saves time in hashtag research'
  ],
  faq: [
    {
      question: 'How does the Hashtag Generator work?',
      answer: 'It uses AI algorithms to analyze trending hashtags and suggest relevant ones based on your content.'
    },
    {
      question: 'Can I customize the hashtag topics?',
      answer: 'Yes, you can choose specific topics or themes for the hashtags.'
    },
    {
      question: 'Is it suitable for professional social media management?',
      answer: 'Yes, it can be used to optimize professional social media posts.'
    }
  ]
},

{
  id: 'sentiment-analyzer',
  name: 'Sentiment Analyzer',
  description: "Analyze the emotional tone and sentiment of text with AI. Understand audience reactions and improve content resonance.",
  platform: 'General',
  category: 'content-analysis',
  component: 'SentimentAnalyzer',
  image: '/images/tool-images/sentiment-analyzer.jpg',
  ctaText: 'Analyze Sentiment',
  features: [
    'Instant sentiment analysis',
    'Emotional tone detection',
    'Customizable analysis',
    'Improved content resonance'
  ],
  keyFeatures: [
    {
      title: 'Emotional Insights',
      description: 'Understand the emotional tone of your content or feedback.',
      icon: 'heart'
    },
    {
      title: 'Customizable',
      description: 'Choose specific aspects of sentiment to analyze.',
      icon: 'settings'
    },
    {
      title: 'Content Optimization',
      description: 'Use insights to improve content resonance with your audience.',
      icon: 'lightbulb'
    }
  ],
  useCase: [
    {
      title: 'For Content Creators',
      description: 'Enhance content engagement by understanding audience sentiment.',
      examples: [
        'Analyze feedback on social media posts',
        'Improve blog post resonance'
      ]
    },
    {
      title: 'For Customer Service',
      description: 'Monitor customer sentiment to improve service quality.',
      examples: [
        'Analyze customer reviews',
        'Respond to negative feedback effectively'
      ]
    }
  ],
  targetAudience: [
    'Content Creators',
    'Customer Service Teams',
    'Digital Marketers',
    'Business Analysts'
  ],
  benefits: [
    'Enhances content engagement',
    'Improves customer satisfaction',
    'Provides actionable insights'
  ],
  faq: [
    {
      question: 'How does the Sentiment Analyzer work?',
      answer: 'It uses AI algorithms to detect emotional tone and sentiment in text.'
    },
    {
      question: 'Can I customize the analysis?',
      answer: 'Yes, you can choose specific aspects of sentiment to analyze.'
    },
    {
      question: 'Is it suitable for professional content analysis?',
      answer: 'Yes, it can be used to analyze professional content and feedback.'
    }
  ]
},
{
  id: 'influencer-search',
  name: 'Influencer Search',
  description: "Find and analyze social media influencers with AI. Discover the right influencers for your brand collaborations.",
  platform: 'General',
  category: 'influencer-marketing',
  component: 'InfluencerSearch',
  image: '/images/tool-images/influencer-search.jpg',
  ctaText: 'Find Influencers',
  features: [
    'Instant influencer discovery',
    'In-depth influencer analysis',
    'Customizable search criteria',
    'Enhanced brand collaborations'
  ],
  keyFeatures: [
    {
      title: 'Quick Discovery',
      description: 'Find relevant influencers in minutes.',
      icon: 'magnifying-glass'
    },
    {
      title: 'In-Depth Analysis',
      description: 'Get detailed insights into influencer performance and audience demographics.',
      icon: 'chart-bar'
    },
    {
      title: 'Customizable Search',
      description: 'Choose specific criteria for influencers tailored to your brand needs.',
      icon: 'settings'
    }
  ],
  useCase: [
    {
      title: 'For Brands',
      description: 'Enhance marketing campaigns with the right influencers.',
      examples: [
        'Collaborate with influencers for product launches',
        'Increase brand awareness through influencer partnerships'
      ]
    },
    {
      title: 'For Marketing Agencies',
      description: 'Streamline influencer research for client campaigns.',
      examples: [
        'Identify niche influencers for targeted marketing',
        'Analyze influencer engagement metrics'
      ]
    }
  ],
  targetAudience: [
    'Brands',
    'Marketing Agencies',
    'Influencer Marketing Teams',
    'PR Professionals'
  ],
  benefits: [
    'Saves time in influencer research',
    'Enhances campaign effectiveness',
    'Provides actionable insights'
  ],
  faq: [
    {
      question: 'How does the Influencer Search work?',
      answer: 'It uses AI algorithms to analyze influencer performance and audience data.'
    },
    {
      question: 'Can I customize the search criteria?',
      answer: 'Yes, you can choose specific criteria for influencers tailored to your brand needs.'
    },
    {
      question: 'Is it suitable for professional influencer marketing?',
      answer: 'Yes, it can be used to optimize professional influencer marketing campaigns.'
    }
  ]
},
{
  id: 'youtube-chapters-generator',
  name: 'YouTube Chapters Generator',
  description: "Automate the creation of YouTube chapter markers with AI. Enhance video navigation and viewer engagement.",
  platform: 'YouTube',
  category: 'video-optimization',
  component: 'YouTubeChaptersGenerator',
  image: '/images/tool-images/youtube-chapters-generator.jpg',
  ctaText: 'Generate Chapters',
  features: [
    'Instant chapter marker creation',
    'AI-driven timestamp detection',
    'Improved video navigation',
    'Enhanced viewer engagement'
  ],
  keyFeatures: [
    {
      title: 'Efficient Navigation',
      description: 'Automate chapter creation to make videos easier to navigate.',
      icon: 'list'
    },
    {
      title: 'AI-Driven Accuracy',
      description: 'Use AI to accurately detect timestamps for chapter markers.',
      icon: 'robot'
    },
    {
      title: 'Increased Engagement',
      description: 'Boost viewer engagement by making content more accessible.',
      icon: 'heart'
    }
  ],
  useCase: [
    {
      title: 'For YouTubers',
      description: 'Enhance video engagement by making content more accessible.',
      examples: [
        'Create chapters for educational videos',
        'Improve navigation in long-form content'
      ]
    },
    {
      title: 'For Video Producers',
      description: 'Streamline video editing processes with automated chapter creation.',
      examples: [
        'Use AI-generated chapters in video editing software',
        'Enhance video SEO with chapter markers'
      ]
    }
  ],
  targetAudience: [
    'YouTubers',
    'Video Producers',
    'Content Creators',
    'Educational Institutions'
  ],
  benefits: [
    'Saves time in video editing',
    'Improves viewer engagement',
    'Enhances video accessibility'
  ],
  faq: [
    {
      question: 'How does the YouTube Chapters Generator work?',
      answer: 'It uses AI algorithms to detect timestamps and create chapter markers.'
    },
    {
      question: 'Can I customize the chapter titles?',
      answer: 'Yes, you can edit chapter titles after generation.'
    },
    {
      question: 'Is it suitable for professional video production?',
      answer: 'Yes, it can be used to optimize professional YouTube videos.'
    }
  ]
},
{
  id: 'youtube-chapters-generator',
  name: 'YouTube Chapters Generator',
  description: "Automate the creation of YouTube chapter markers with AI. Enhance video navigation and viewer engagement.",
  platform: 'YouTube',
  category: 'video-optimization',
  component: 'YouTubeChaptersGenerator',
  image: '/images/tool-images/youtube-chapters-generator.jpg',
  ctaText: 'Generate Chapters',
  features: [
    'Instant chapter marker creation',
    'AI-driven timestamp detection',
    'Improved video navigation',
    'Enhanced viewer engagement'
  ],
  keyFeatures: [
    {
      title: 'Efficient Navigation',
      description: 'Automate chapter creation to make videos easier to navigate.',
      icon: 'list'
    },
    {
      title: 'AI-Driven Accuracy',
      description: 'Use AI to accurately detect timestamps for chapter markers.',
      icon: 'robot'
    },
    {
      title: 'Increased Engagement',
      description: 'Boost viewer engagement by making content more accessible.',
      icon: 'heart'
    }
  ],
  useCase: [
    {
      title: 'For YouTubers',
      description: 'Enhance video engagement by making content more accessible.',
      examples: [
        'Create chapters for educational videos',
        'Improve navigation in long-form content'
      ]
    },
    {
      title: 'For Video Producers',
      description: 'Streamline video editing processes with automated chapter creation.',
      examples: [
        'Use AI-generated chapters in video editing software',
        'Enhance video SEO with chapter markers'
      ]
    }
  ],
  targetAudience: [
    'YouTubers',
    'Video Producers',
    'Content Creators',
    'Educational Institutions'
  ],
  benefits: [
    'Saves time in video editing',
    'Improves viewer engagement',
    'Enhances video accessibility'
  ],
  faq: [
    {
      question: 'How does the YouTube Chapters Generator work?',
      answer: 'It uses AI algorithms to detect timestamps and create chapter markers.'
    },
    {
      question: 'Can I customize the chapter titles?',
      answer: 'Yes, you can edit chapter titles after generation.'
    },
    {
      question: 'Is it suitable for professional video production?',
      answer: 'Yes, it can be used to optimize professional YouTube videos.'
    }
  ]
},


{
  id: 'youtube-channel-audit',
  name: 'YouTube Channel Audit',
  description: "Analyze your YouTube channel's performance with AI. Get insights into engagement, audience growth, and content strategy.",
  platform: 'YouTube',
  category: 'channel-analysis',
  component: 'YouTubeChannelAudit',
  image: '/images/tool-images/youtube-channel-audit.jpg',
  ctaText: 'Audit Channel',
  features: [
    'Comprehensive channel analysis',
    'Engagement metrics',
    'Audience growth insights',
    'Content strategy recommendations'
  ],
  keyFeatures: [
    {
      title: 'In-Depth Insights',
      description: 'Get detailed analysis of your channel\'s performance metrics.',
      icon: 'chart-bar'
    },
    {
      title: 'Engagement Analysis',
      description: 'Understand how your audience interacts with your content.',
      icon: 'heart'
    },
    {
      title: 'Growth Strategies',
      description: 'Receive actionable tips to boost audience growth and engagement.',
      icon: 'rocket'
    }
  ],
  useCase: [
    {
      title: 'For YouTubers',
      description: 'Optimize channel performance and grow your audience.',
      examples: [
        'Analyze video engagement metrics',
        'Identify top-performing content'
      ]
    },
    {
      title: 'For Marketing Teams',
      description: 'Use data-driven insights to enhance YouTube marketing strategies.',
      examples: [
        'Monitor brand channel performance',
        'Optimize video content for better engagement'
      ]
    }
  ],
  targetAudience: [
    'YouTubers',
    'Marketing Teams',
    'Content Creators',
    'Brand Managers'
  ],
  benefits: [
    'Improves channel performance',
    'Enhances audience engagement',
    'Provides actionable insights'
  ],
  faq: [
    {
      question: 'How does the YouTube Channel Audit work?',
      answer: 'It uses AI algorithms to analyze channel metrics and provide insights.'
    },
    {
      question: 'Can I customize the analysis?',
      answer: 'Yes, you can focus on specific metrics or time frames.'
    },
    {
      question: 'Is it suitable for professional channel management?',
      answer: 'Yes, it can be used to optimize professional YouTube channels.'
    }
  ]
},
{
  id: 'instagram-profile-audit',
  name: 'Instagram Profile Audit',
  description: "Analyze your Instagram profile's performance with AI. Get insights into engagement, audience growth, and content strategy.",
  platform: 'Instagram',
  category: 'profile-analysis',
  component: 'InstagramProfileAudit',
  image: '/images/tool-images/instagram-profile-audit.jpg',
  ctaText: 'Audit Profile',
  features: [
    'Comprehensive profile analysis',
    'Engagement metrics',
    'Audience growth insights',
    'Content strategy recommendations'
  ],
  keyFeatures: [
    {
      title: 'In-Depth Insights',
      description: 'Get detailed analysis of your profile\'s performance metrics.',
      icon: 'chart-bar'
    },
    {
      title: 'Engagement Analysis',
      description: 'Understand how your audience interacts with your content.',
      icon: 'heart'
    },
    {
      title: 'Growth Strategies',
      description: 'Receive actionable tips to boost audience growth and engagement.',
      icon: 'rocket'
    }
  ],
  useCase: [
    {
      title: 'For Influencers',
      description: 'Optimize profile performance and grow your audience.',
      examples: [
        'Analyze post engagement metrics',
        'Identify top-performing content'
      ]
    },
    {
      title: 'For Marketing Teams',
      description: 'Use data-driven insights to enhance Instagram marketing strategies.',
      examples: [
        'Monitor brand profile performance',
        'Optimize content for better engagement'
      ]
    }
  ],
  targetAudience: [
    'Influencers',
    'Marketing Teams',
    'Content Creators',
    'Brand Managers'
  ],
  benefits: [
    'Improves profile performance',
    'Enhances audience engagement',
    'Provides actionable insights'
  ],
  faq: [
    {
      question: 'How does the Instagram Profile Audit work?',
      answer: 'It uses AI algorithms to analyze profile metrics and provide insights.'
    },
    {
      question: 'Can I customize the analysis?',
      answer: 'Yes, you can focus on specific metrics or time frames.'
    },
    {
      question: 'Is it suitable for professional profile management?',
      answer: 'Yes, it can be used to optimize professional Instagram profiles.'
    }
  ]
},
{
  id: 'tiktok-profile-audit',
  name: 'TikTok Profile Audit',
  description: "Analyze your TikTok profile's performance with AI. Get insights into engagement, audience growth, and content strategy.",
  platform: 'TikTok',
  category: 'profile-analysis',
  component: 'TikTokProfileAudit',
  image: '/images/tool-images/tiktok-profile-audit.jpg',
  ctaText: 'Audit Profile',
  features: [
    'Comprehensive profile analysis',
    'Engagement metrics',
    'Audience growth insights',
    'Content strategy recommendations'
  ],
  keyFeatures: [
    {
      title: 'In-Depth Insights',
      description: 'Get detailed analysis of your profile\'s performance metrics.',
      icon: 'chart-bar'
    },
    {
      title: 'Engagement Analysis',
      description: 'Understand how your audience interacts with your content.',
      icon: 'heart'
    },
    {
      title: 'Growth Strategies',
      description: 'Receive actionable tips to boost audience growth and engagement.',
      icon: 'rocket'
    }
  ],
  useCase: [
    {
      title: 'For Creators',
      description: 'Optimize profile performance and grow your audience.',
      examples: [
        'Analyze video engagement metrics',
        'Identify top-performing content'
      ]
    },
    {
      title: 'For Marketing Teams',
      description: 'Use data-driven insights to enhance TikTok marketing strategies.',
      examples: [
        'Monitor brand profile performance',
        'Optimize content for better engagement'
      ]
    }
  ],
  targetAudience: [
    'TikTok Creators',
    'Marketing Teams',
    'Content Creators',
    'Brand Managers'
  ],
  benefits: [
    'Improves profile performance',
    'Enhances audience engagement',
    'Provides actionable insights'
  ],
  faq: [
    {
      question: 'How does the TikTok Profile Audit work?',
      answer: 'It uses AI algorithms to analyze profile metrics and provide insights.'
    },
    {
      question: 'Can I customize the analysis?',
      answer: 'Yes, you can focus on specific metrics or time frames.'
    },
    {
      question: 'Is it suitable for professional profile management?',
      answer: 'Yes, it can be used to optimize professional TikTok profiles.'
    }
  ]
},
{
  id: 'ai-gift-suggester',
  name: 'AI Gift Suggester',
  description: "Get personalized gift recommendations with AI. Find the perfect gift for friends, family, or colleagues.",
  platform: 'General',
  category: 'gift-suggestions',
  component: 'AIGiftSuggester',
  image: '/images/tool-images/ai-gift-suggester.jpg',
  ctaText: 'Suggest Gifts',
  features: [
    'Instant gift suggestions',
    'Personalized recommendations',
    'Customizable preferences',
    'Unique gift ideas'
  ],
  keyFeatures: [
    {
      title: 'Personalized Recommendations',
      description: 'Get gift suggestions tailored to the recipient\'s interests.',
      icon: 'heart'
    },
    {
      title: 'Customizable Preferences',
      description: 'Choose specific preferences or interests for more accurate suggestions.',
      icon: 'settings'
    },
    {
      title: 'Unique Ideas',
      description: 'Discover unique gift ideas that stand out from the usual options.',
      icon: 'lightbulb'
    }
  ],
  useCase: [
    {
      title: 'For Personal Use',
      description: 'Find the perfect gift for friends and family.',
      examples: [
        'Get ideas for birthdays',
        'Suggest gifts for anniversaries'
      ]
    },
    {
      title: 'For Businesses',
      description: 'Enhance corporate gifting with personalized suggestions.',
      examples: [
        'Use AI for client gift ideas',
        'Optimize employee recognition gifts'
      ]
    }
  ],
  targetAudience: [
    'Individuals',
    'Businesses',
    'Marketing Teams',
    'Event Planners'
  ],
  benefits: [
    'Saves time in gift searching',
    'Enhances gift-giving experience',
    'Provides unique ideas'
  ],
  faq: [
    {
      question: 'How does the AI Gift Suggester work?',
      answer: 'It uses AI algorithms to analyze preferences and provide personalized gift suggestions.'
    },
    {
      question: 'Can I customize the suggestions?',
      answer: 'Yes, you can input specific preferences or interests for more accurate suggestions.'
    },
    {
      question: 'Is it suitable for professional gifting?',
      answer: 'Yes, it can be used to optimize corporate gifting strategies.'
    }
  ]
},
{
  id: 'youtube-transcript-extractor',
  name: 'YouTube Transcript Extractor',
  description: "Extract and search YouTube transcripts with AI. Enhance video analysis and content creation.",
  platform: 'YouTube',
  category: 'transcript-extraction',
  component: 'YouTubeTranscriptExtractor',
  image: '/images/tool-images/youtube-transcript-extractor.jpg',
  ctaText: 'Extract Transcripts',
  features: [
    'Instant transcript extraction',
    'Searchable transcripts',
    'Customizable output',
    'Enhanced video analysis'
  ],
  keyFeatures: [
    {
      title: 'Efficient Extraction',
      description: 'Automate transcript extraction to save time.',
      icon: 'clock'
    },
    {
      title: 'Searchable Transcripts',
      description: 'Easily search for specific keywords or phrases within transcripts.',
      icon: 'magnifying-glass'
    },
    {
      title: 'Customizable Output',
      description: 'Choose the format of the extracted transcripts.',
      icon: 'settings'
    }
  ],
  useCase: [
    {
      title: 'For Content Creators',
      description: 'Enhance content creation by analyzing video transcripts.',
      examples: [
        'Use transcripts for blog posts',
        'Create subtitles for videos'
      ]
    },
    {
      title: 'For Researchers',
      description: 'Streamline research processes with searchable transcripts.',
      examples: [
        'Analyze video content for research papers',
        'Extract quotes from interviews'
      ]
    }
  ],
  targetAudience: [
    'Content Creators',
    'Researchers',
    'Video Producers',
    'Educational Institutions'
  ],
  benefits: [
    'Saves time in transcript extraction',
    'Enhances content analysis',
    'Provides customizable output'
  ],
  faq: [
    {
      question: 'How does the YouTube Transcript Extractor work?',
      answer: 'It uses AI algorithms to extract and process video transcripts.'
    },
    {
      question: 'Can I customize the output format?',
      answer: 'Yes, you can choose the format of the extracted transcripts.'
    },
    {
      question: 'Is it suitable for professional content creation?',
      answer: 'Yes, it can be used to optimize professional video content.'
    }
  ]
},
{
  id: 'character-counter',
  name: 'Character Counter',
  description: "Count characters, words, and paragraphs in text with AI. Optimize content for social media and writing projects.",
  platform: 'General',
  category: 'text-analysis',
  component: 'CharacterCounter',
  image: '/images/tool-images/character-counter.jpg',
  ctaText: 'Count Characters',
  features: [
    'Instant character counting',
    'Word and paragraph counting',
    'Customizable output',
    'Enhanced content optimization'
  ],
  keyFeatures: [
    {
      title: 'Quick Counting',
      description: 'Get instant counts of characters, words, and paragraphs.',
      icon: 'clock'
    },
    {
      title: 'Customizable Output',
      description: 'Choose the metrics you need for your content optimization.',
      icon: 'settings'
    },
    {
      title: 'Content Optimization',
      description: 'Use counts to optimize content for social media and writing projects.',
      icon: 'lightbulb'
    }
  ],
  useCase: [
    {
      title: 'For Social Media Managers',
      description: 'Optimize social media posts with precise character counts.',
      examples: [
        'Ensure Twitter posts fit within character limits',
        'Optimize Instagram captions'
      ]
    },
    {
      title: 'For Writers',
      description: 'Streamline writing processes with accurate word and paragraph counts.',
      examples: [
        'Monitor article length',
        'Optimize blog post readability'
      ]
    }
  ],
  targetAudience: [
    'Social Media Managers',
    'Writers',
    'Content Creators',
    'Marketing Teams'
  ],
  benefits: [
    'Saves time in content optimization',
    'Enhances content readability',
    'Provides accurate counts'
  ],
  faq: [
    {
      question: 'How does the Character Counter work?',
      answer: 'It uses AI algorithms to count characters, words, and paragraphs in text.'
    },
    {
      question: 'Can I customize the output metrics?',
      answer: 'Yes, you can choose which metrics to display.'
    },
    {
      question: 'Is it suitable for professional content creation?',
      answer: 'Yes, it can be used to optimize professional content.'
    }
  ]
},


{
  id: 'case-converter',
  name: 'Case Converter',
  description: "Convert text between multiple case formats with AI. Enhance content readability and consistency.",
  platform: 'General',
  category: 'text-formatting',
  component: 'CaseConverter',
  image: '/images/tool-images/case-converter.jpg',
  ctaText: 'Convert Case',
  features: [
    'Instant case conversion',
    'Multiple case formats',
    'Customizable output',
    'Improved content readability'
  ],
  keyFeatures: [
    {
      title: 'Efficient Conversion',
      description: 'Convert text to various case formats instantly.',
      icon: 'clock'
    },
    {
      title: 'Multiple Formats',
      description: 'Choose from uppercase, lowercase, title case, and more.',
      icon: 'format-text'
    },
    {
      title: 'Customizable Output',
      description: 'Select the case format that suits your content needs.',
      icon: 'settings'
    }
  ],
  useCase: [
    {
      title: 'For Content Creators',
      description: 'Enhance content readability with consistent case formatting.',
      examples: [
        'Format article titles',
        'Optimize social media post captions'
      ]
    },
    {
      title: 'For Writers',
      description: 'Streamline writing processes with easy case conversion.',
      examples: [
        'Convert manuscript text',
        'Format headings and subheadings'
      ]
    }
  ],
  targetAudience: [
    'Content Creators',
    'Writers',
    'Marketing Teams',
    'Publishers'
  ],
  benefits: [
    'Saves time in text formatting',
    'Enhances content consistency',
    'Improves readability'
  ],
  faq: [
    {
      question: 'How does the Case Converter work?',
      answer: 'It uses AI algorithms to convert text between different case formats.'
    },
    {
      question: 'Can I customize the output format?',
      answer: 'Yes, you can choose from various case formats.'
    },
    {
      question: 'Is it suitable for professional content creation?',
      answer: 'Yes, it can be used to optimize professional content.'
    }
  ]
},
{
  id: 'discord-small-text',
  name: 'Discord Small Text Generator',
  description: "Convert text to small caps for Discord with AI. Enhance your Discord messages with unique formatting.",
  platform: 'Discord',
  category: 'text-formatting',
  component: 'DiscordSmallTextGenerator',
  image: '/images/tool-images/discord-small-text-generator.jpg',
  ctaText: 'Generate Small Text',
  features: [
    'Instant small text conversion',
    'Customizable output',
    'Enhanced Discord messaging',
    'Unique text formatting'
  ],
  keyFeatures: [
    {
      title: 'Efficient Conversion',
      description: 'Convert text to small caps instantly for Discord.',
      icon: 'clock'
    },
    {
      title: 'Customizable Output',
      description: 'Select the formatting that suits your Discord messaging needs.',
      icon: 'settings'
    },
    {
      title: 'Unique Formatting',
      description: 'Stand out in Discord channels with unique small text formatting.',
      icon: 'format-text'
    }
  ],
  useCase: [
    {
      title: 'For Discord Users',
      description: 'Enhance Discord messages with unique small text formatting.',
      examples: [
        'Format chat messages',
        'Create visually appealing announcements'
      ]
    },
    {
      title: 'For Community Managers',
      description: 'Streamline community engagement with consistent text formatting.',
      examples: [
        'Use small text for community guidelines',
        'Format event announcements'
      ]
    }
  ],
  targetAudience: [
    'Discord Users',
    'Community Managers',
    'Gaming Communities',
    'Social Media Teams'
  ],
  benefits: [
    'Saves time in text formatting',
    'Enhances Discord messaging',
    'Provides unique formatting options'
  ],
  faq: [
    {
      question: 'How does the Discord Small Text Generator work?',
      answer: 'It uses AI algorithms to convert text to small caps for Discord.'
    },
    {
      question: 'Can I customize the output?',
      answer: 'Yes, you can select the formatting style.'
    },
    {
      question: 'Is it suitable for professional Discord communities?',
      answer: 'Yes, it can be used to enhance professional Discord channels.'
    }
  ]
},
{
  id: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum Generator',
  description: "Generate placeholder text with AI. Enhance content design and development with realistic text samples.",
  platform: 'General',
  category: 'placeholder-text',
  component: 'LoremIpsumGenerator',
  image: '/images/tool-images/lorem-ipsum-generator.jpg',
  ctaText: 'Generate Text',
  features: [
    'Instant placeholder text generation',
    'Customizable text length',
    'Realistic text samples',
    'Enhanced design and development'
  ],
  keyFeatures: [
    {
      title: 'Efficient Generation',
      description: 'Generate placeholder text instantly for design and development purposes.',
      icon: 'clock'
    },
    {
      title: 'Customizable Length',
      description: 'Choose the length of the placeholder text to fit your needs.',
      icon: 'settings'
    },
    {
      title: 'Realistic Samples',
      description: 'Use realistic text samples to enhance design mockups and prototypes.',
      icon: 'format-text'
    }
  ],
  useCase: [
    {
      title: 'For Designers',
      description: 'Enhance design mockups with realistic placeholder text.',
      examples: [
        'Use in UI/UX design',
        'Create visually appealing prototypes'
      ]
    },
    {
      title: 'For Developers',
      description: 'Streamline development processes with placeholder text.',
      examples: [
        'Test website layouts',
        'Optimize content rendering'
      ]
    }
  ],
  targetAudience: [
    'Designers',
    'Developers',
    'Marketing Teams',
    'Publishers'
  ],
  benefits: [
    'Saves time in content creation',
    'Enhances design and development',
    'Provides realistic text samples'
  ],
  faq: [
    {
      question: 'How does the Lorem Ipsum Generator work?',
      answer: 'It uses AI algorithms to generate placeholder text.'
    },
    {
      question: 'Can I customize the text length?',
      answer: 'Yes, you can choose the length of the generated text.'
    },
    {
      question: 'Is it suitable for professional design and development?',
      answer: 'Yes, it can be used to optimize professional design mockups and prototypes.'
    }
  ]
},

];

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};