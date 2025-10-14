export interface UseCase {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  keywords: string[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  benefits: {
    title: string;
    description: string;
    stats?: string;
  }[];
  testimonials: {
    quote: string;
    author: string;
    image?: string;
  }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export const useCases: UseCase[] = [
  {
    slug: "social-media-engagement",
    title: "Boost Social Media Engagement with AI-Powered Interactions",
    subtitle: "Personalized Comments and Virality Insights at Your Fingertips",
    description:
      "Olly's AI tools revolutionize social media engagement by generating personalized comments, assessing virality scores, and providing actionable insights. Enhance your online presence with tailored interactions and smarter engagement strategies.",
    heroImage: "/images/use-cases/social-engagement-hero.jpg",
    keywords: [
      "social media engagement",
      "AI-powered comments",
      "virality insights",
      "personalized interactions",
      "social media assistant",
      "content engagement",
      "audience growth",
    ],
    features: [
      {
        title: "AI-Powered Comments",
        description:
          "Generate dynamic, personalized comments to engage your audience effectively.",
        icon: "MessageCircleIcon",
      },
      {
        title: "Virality Scoring",
        description:
          "Assess the potential virality of posts to prioritize high-impact content.",
        icon: "TrendingUpIcon",
      },
      {
        title: "Custom Interaction Styles",
        description:
          "Tailor your commenting style to match your brand voice or personality.",
        icon: "UserIcon",
      },
    ],
    benefits: [
      {
        title: "Increased Engagement",
        description: "Boost audience interactions with AI-driven strategies.",
        stats: "+75%",
      },
      {
        title: "Faster Growth",
        description:
          "Accelerate follower growth with optimized engagement techniques.",
        stats: "+50%",
      },
      {
        title: "Time Savings",
        description: "Reduce time spent on manual commenting and engagement.",
        stats: "-60%",
      },
    ],
    testimonials: [
      {
        quote:
          "Olly has transformed our social media strategy. The personalized comments and insights have significantly boosted our engagement rates.",
        author: "Sophia Lee",
        image: "/images/testimonials/sophia-lee.jpg",
      },
      {
        quote:
          "Actually, a very useful product for those who do active social media marketing. Congratulations on the launch!",
        author: "Alex Egorov",
        image:
          "https://ph-avatars.imgix.net/3695082/53ef7bc8-b0d2-40c0-96df-1873caf289d9.gif",
      },
      {
        quote:
          "Congratulations, @goyashy! The virality score feature caught my eye. I envision this tool as a valuable resource to enhance the quality of written posts, making it essential for content creators.",
        author: "Chirag",
        image:
          "https://ph-avatars.imgix.net/6429993/c24d940d-c5c0-4ca9-903f-0e5e91a2b8ea.png",
      },
    ],
    ctaTitle: "Ready to Amplify Your Social Media Presence?",
    ctaDescription:
      "Join top brands using Olly to elevate their social media engagement.",
    ctaButtonText: "Try Now",
    ctaButtonLink: "https://www.olly.social/signup",
  },






  {
    slug: "content-creation-optimization",
    title: "Optimize Content Creation with AI-Driven Suggestions",
    subtitle: "Create High-Impact Posts that Resonate with Your Audience",
    description:
      "Use Olly's AI-powered content tools to generate compelling posts, optimize for virality, and align with audience preferences. Streamline your content creation process and maximize your reach across platforms.",
    heroImage: "/images/use-cases/content-optimization-hero.jpg",
    keywords: [
      "content optimization tools",
      "social media content strategy",
      "engagement analytics",
      "AI-driven insights",
      "content performance tracking",
      "audience targeting",
      "social media ROI",
    ],
    features: [
      {
        title: "AI Content Suggestions",
        description:
          "Get AI-powered recommendations for improving content impact.",
        icon: "LightbulbIcon",
      },
      {
        title: "Performance Analytics",
        description:
          "Detailed metrics on content reach, engagement, and conversions.",
        icon: "BarChartIcon",
      },
      {
        title: "Audience Targeting Insights",
        description:
          "Understand your audience better with demographic and behavioral data.",
        icon: "UserIcon",
      },
    ],
    benefits: [
      {
        title: "Higher Engagement Rates",
        description:
          "Boost content engagement through data-driven optimization.",
        stats: "+65%",
      },
      {
        title: "Improved ROI",
        description: "Maximize returns on social media investments.",
        stats: "+40%",
      },
      {
        title: "Time Efficiency",
        description: "Save time by automating performance analysis.",
        stats: "-70%",
      },
    ],
    testimonials: [
      {
        quote:
          "Congratulations on the launch. Just got myself a lifetime subscription. It's helping me summarize the post better for now, whereas I am keeping my own views.",
        author: "Aman Sharma",

        image:
          "https://ph-avatars.imgix.net/2179893/0b68c40a-0596-4222-bb92-03b99c41bb4e.png",
      },
      {
        quote:
          "Congratulations on the launch! This tool could be a gamechanger for any SMM agency or any business looking to boost their engagement with users/audience online without having to allocate limited time and resources to it.",
        author: "Roberto Perez",
        image:
          "https://ph-avatars.imgix.net/6212118/e65b8927-e1df-4197-a6ea-c75f1c20ee6f.gif",
      },
      {
        quote:
          "Love the pay what you use business model, as a user. Not sure how scalable that will turn out to be from a business perspective ... but that's not my problem I guess! Great work team, hope you make it to the top.",
        author: "Florian Myter",

        image:
          "https://ph-avatars.imgix.net/5413468/c0037336-08b0-4570-9375-0ea68c9b2563.png",
      },
    ],
    ctaTitle: "Ready to Elevate Your Content Strategy?",
    ctaDescription:
      "Join leading brands using Olly to optimize their content creation.",
    ctaButtonText: "Start Free Trial",
    ctaButtonLink: "https://www.olly.social/signup",
  },







  {
    slug: "multi-platform-management",
    title: "Simplify Multi-Platform Social Media Management",
    subtitle: "A Unified Dashboard for All Your Social Media Accounts",
    description:
      "Manage all your social media platforms seamlessly with Olly's centralized dashboard. Schedule posts, track performance, and engage effectively across LinkedIn, Twitter, Facebook, Instagram, and more.",
    heroImage: "/images/use-cases/multi-platform-hero.jpg",
    keywords: [
      "multi-platform management",
      "social media dashboard",
      "post scheduling",
      "performance tracking",
      "cross-platform engagement",
      "social media integration",
    ],
    features: [
      {
        title: "Unified Dashboard",
        description:
          "Manage multiple social media accounts from a single interface.",
        icon: "GridIcon",
      },
      {
        title: "Post Scheduling",
        description:
          "Schedule posts in advance to maintain a consistent content flow.",
        icon: "CalendarIcon",
      },
      {
        title: "Cross-Platform Insights",
        description: "Track performance and engagement across all platforms.",
        icon: "BarChartIcon",
      },
    ],
    benefits: [
      {
        title: "Increased Efficiency",
        description: "Streamline social media management tasks.",
        stats: "+80%",
      },
      {
        title: "Consistent Branding",
        description: "Maintain a consistent brand voice across platforms.",
        stats: "100%",
      },
      {
        title: "Time Savings",
        description: "Reduce time spent on managing multiple accounts.",
        stats: "-75%",
      },
    ],
    testimonials: [
      {
        quote:
          "'Olly's multi-platform management has simplified our workflow, allowing us to focus on strategy rather than logistics.'",
        author: "'Emily Chen'",
        image: "/images/testimonials/emily-chen.jpg",
      },
    ],
    ctaTitle: "Ready to Simplify Your Social Media Management?",
    ctaDescription:
      "Join top brands using Olly to streamline their multi-platform strategy.",
    ctaButtonText: "Try Now",
    ctaButtonLink: "https://www.olly.social/signup",
  },





  {
    slug: "analytics-and-reporting",
    title: "Track Social Media Performance with Advanced Analytics",
    subtitle: "Detailed Metrics to Refine Your Strategy",
    description:
      "Olly provides in-depth analytics and reporting tools to monitor engagement, reach, and follower growth. Use actionable data to optimize your social media campaigns and achieve measurable results.",
    heroImage: "/images/use-cases/analytics-hero.jpg",
    keywords: [
      "social media analytics",
      "performance tracking",
      "engagement metrics",
      "reach analysis",
      "follower growth",
      "data-driven insights",
    ],
    features: [
      {
        title: "Engagement Metrics",
        description:
          "Track likes, comments, shares, and other engagement metrics.",
        icon: "HeartIcon",
      },
      {
        title: "Reach and Impressions",
        description: "Monitor how many people see your content.",
        icon: "EyeIcon",
      },
      {
        title: "Follower Growth Insights",
        description: "Analyze changes in your follower base over time.",
        icon: "UserPlusIcon",
      },
    ],
    benefits: [
      {
        title: "Data-Driven Decisions",
        description: "Make informed decisions based on detailed analytics.",
        stats: "100%",
      },
      {
        title: "Improved ROI",
        description: "Maximize returns on social media investments.",
        stats: "+30%",
      },
      {
        title: "Time Efficiency",
        description: "Save time by automating performance analysis.",
        stats: "-60%",
      },
    ],
    testimonials: [
      {
        quote:
          "'Olly's analytics have given us the insights we need to refine our social media strategy and improve our campaign effectiveness.'",
        author: "'David Kim'",
        image: "/images/testimonials/david-kim.jpg",
      },
    ],
    ctaTitle: "Ready to Unlock the Power of Social Media Analytics?",
    ctaDescription:
      "Join leading brands using Olly to optimize their social media performance.",
    ctaButtonText: "Try Now",
    ctaButtonLink: "https://www.olly.social/signup",
  },







  {
    slug: "automated-responses",
    title: "Enhance Efficiency with Automated Social Media Responses",
    subtitle: "Timely Engagement Without the Manual Effort",
    description:
      "Automate responses to common queries and interactions using Olly's AI-driven tools. Ensure consistent engagement while saving time and resources.",
    heroImage: "/images/use-cases/automated-responses-hero.jpg",
    keywords: [
      "automated social media responses",
      "AI-powered chatbots",
      "timely engagement",
      "consistent branding",
      "resource efficiency",
    ],
    features: [
      {
        title: "AI-Powered Chatbots",
        description:
          "Automate responses to frequent queries with AI-driven chatbots.",
        icon: "RobotIcon",
      },
      {
        title: "Customizable Responses",
        description: "Tailor automated responses to match your brand voice.",
        icon: "PencilIcon",
      },
      {
        title: "24/7 Engagement",
        description:
          "Ensure timely engagement with automated responses available around the clock.",
        icon: "ClockIcon",
      },
    ],
    benefits: [
      {
        title: "Increased Efficiency",
        description: "Reduce manual effort spent on responding to queries.",
        stats: "+80%",
      },
      {
        title: "Consistent Engagement",
        description: "Maintain consistent engagement levels at all times.",
        stats: "100%",
      },
      {
        title: "Cost Savings",
        description: "Save resources by automating routine interactions.",
        stats: "-50%",
      },
    ],
    testimonials: [
      {
        quote:
          "'Olly's automated responses have streamlined our customer service process, allowing us to focus on more complex queries.'",
        author: "'Rachel Brown'",
        image: "/images/testimonials/rachel-brown.jpg",
      },
    ],
    ctaTitle: "Ready to Automate Your Social Media Responses?",
    ctaDescription:
      "Join top brands using Olly to enhance their customer engagement.",
    ctaButtonText: "Try Now",
    ctaButtonLink: "https://www.olly.social/signup",
  },



  
];
