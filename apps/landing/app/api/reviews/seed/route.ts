import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { ReviewStatus } from '@prisma/client';
import { Review } from '@/types/product';

// Product slugs based on your routes
const PRODUCT_SLUGS = [
  // 'ai-agent',
  // 'ai-chrome-extension',
  // 'ai-comment-generator',
  // 'ai-comment-generator-free',
  // 'ai-for-linkedin-post',
  // 'ai-hashtag-generator',
  // 'ai-post-generator',
  // 'ai-tools-for-social-media-managers',
  // 'automatic-blog-commenting',
  // 'automatic-commenter',
  // 'bluesky-comment-generator',
  // 'facebook-comment-generator',
  // 'hacker-news-ycombinator-comment-generator',
  // 'instagram-auto-commenter',
  // 'instagram-comment-generator',
  // 'linkedin-comment-generator',
  // 'measure-linkedin-engagement',
  // 'medium-comment-generator',
  // 'product-hunt-comment-generator',
  // 'quora-comment-generator',
  // 'reddit-comment-generator',
  // 'social-comments',
  // 'social-media-agent',
  // 'social-media-chrome-extension',
  // 'social-media-post-virality-score-calculator',
  // 'tiktok-comment-generator',
  // 'twitter-x-comment-generator',
  // 'virality-score-ai',
  // 'x-comment-generator',
  // 'youtube-comment-generator',

  'agi-agent',
  'ai-agent-for-seo',
  'ai-agent-for-social-media',
  'ai-agents-for-entrepreneurs',
  'ai-agents-for-founders',
  'ai-agents-for-growth',
  'ai-agents-for-marketeers',
  'ai-agents-for-productivity',
  'ai-agents-for-sales',
  'ai-agents-for-small-businesses',
  'ai-content-detector',
  'ai-course-image-generator',
  'ai-course-outline-generator',
  'ai-course-promotion-generator',
  'ai-course-reviews-generator',
  'ai-gift-suggester-free',
  'ai-insult-generator',
  'ai-journal-writer',
  'ai-niche-finder',
  'ai-pun-generator-free',
  'ai-rap-generator',
  'ai-review-generator',
  'ai-rizz-generator',
  'ai-roast-generator-free',
  'ai-script-generator',
  'auto-commenter-facebook',
  'auto-commenter-instagram',
  'auto-commenter-linkedin',
  'auto-commenter-x-twitter',
  'case-converter',
  'character-counter',
  'chrome-extension-for-entrepreneurs',
  'chrome-extension-for-marketeers',
  'chrome-extension-for-social-media-managers',
  'chrome-extension-logo-generator',
  'content-localizer',
  'discord-small-text',
  'discord-text-formatter',
  'email-signature-generator',
  'engagement-optimizer',
  'facebook',
  'fake-follower-check',
  'fancy-text-generator',
  'favicon-generator',
  'free-ai-logo-generator',
  'game-theory-simulator',
  'grammar-spell-checker',
  'hashtag-generator',
  'influencer-search',
  'instagram',
  'instagram-audit',
  'instagram-generator',
  'joke-generator',
  'line-breaker',
  'link-shortener',
  'linkedin-audit',
  'linkedin-headline-generator',
  'lorem-ipsum-generator-free',
  'meta-tag-generator',
  'password-generator',
  'png-to-ico-converter',
  'pomodoro-timer',
  'readability-tester',
  'report-card-generator',
  'robot-txt-generator',
  'sentiment-analyzer',
  'teleprompter',
  'tiktok-audit',
  'twitter-bio-generator',
  'username-lookup',
  'utm-parameter-builder',
  'viral-scorer',
  'word-counter',
  'x-twitter',
  'youtube-audit',
  'youtube-chapters-generator',
  'youtube-description-generator',
  'youtube-subscription-button-creator',
  'youtube-transcript-extractor',
  'instagram-comment-generator',
];
// Name generation components
const FIRST_NAMES = [
  // English names
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Emma', 'Olivia', 'Ava', 'Isabella',
  // Hispanic names
  'José', 'Juan', 'Miguel', 'Sofia', 'Isabella', 'Maria', 'Carlos', 'Luis', 'Ana', 'Elena',
  // Asian names
  'Wei', 'Li', 'Ming', 'Yuki', 'Hiroshi', 'Jin', 'Soo', 'Chen', 'Zhang', 'Kim',
  // African names
  'Kwame', 'Amir', 'Zara', 'Amara', 'Malik', 'Omar', 'Aaliyah', 'Zuri', 'Jabari', 'Imani',
  // Indian names
  'Arjun', 'Priya', 'Raj', 'Deepa', 'Arun', 'Neha', 'Amit', 'Anita', 'Rahul', 'Kiran'
];

const LAST_NAMES = [
  // English/American surnames
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson',
  // Hispanic surnames
  'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez',
  // Asian surnames
  'Wang', 'Li', 'Zhang', 'Chen', 'Liu', 'Yang', 'Kim', 'Park', 'Lee', 'Nguyen',
  // Indian surnames
  'Patel', 'Kumar', 'Singh', 'Shah', 'Sharma', 'Verma', 'Gupta', 'Malhotra',
  // Various European surnames
  'Mueller', 'Schmidt', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffman',
  // African surnames
  'Okafor', 'Mensah', 'Osei', 'Diallo', 'Mbeki', 'Adebayo', 'Okoro', 'Kone'
];

// Review templates to generate realistic-looking reviews
const REVIEW_TEMPLATES = [
  {
    positive: [
      "This tool has completely transformed how I manage my social media presence. The {feature} is particularly impressive.",
      "I've tried many similar products, but this one stands out. {feature} makes it worth every penny.",
      "Incredible tool that delivers exactly what it promises. The {feature} exceeded my expectations.",
      "Very intuitive and user-friendly. {feature} works flawlessly.",
      "Great value for money. The {feature} alone justifies the purchase.",
      "A game-changer for my workflow. The {feature} saves me hours every week.",
      "Finally found what I was looking for. The {feature} is exactly what I needed.",
      "Exceptional performance, especially with the {feature}.",
      "This has become an essential part of my toolkit. The {feature} is outstanding.",
      "Brilliant solution that keeps getting better. Love the {feature}."
    ],
    neutral: [
      "Decent tool with some room for improvement. {feature} works well but could be better.",
      "Does the job, but there's room for enhancement in the {feature}.",
      "Good foundation, though the {feature} needs some refinement.",
      "Useful tool overall, but the {feature} could use some updates.",
      "Satisfactory performance, particularly with the {feature}.",
      "Middle-of-the-road solution. The {feature} is adequate.",
      "Gets the basics right, but the {feature} could be more polished.",
      "Fair value, though the {feature} needs some work.",
      "Reasonable tool with potential. The {feature} is functional but basic.",
      "Average performance overall. The {feature} meets minimum expectations."
    ],
    negative: [
      "Has potential but needs work. The {feature} could be more robust.",
      "Expected more from the {feature}. Needs improvement.",
      "Basic functionality works, but the {feature} falls short of expectations.",
      "Some good ideas but implementation needs work, especially the {feature}.",
      "Room for improvement in the {feature} department.",
      "Disappointed with the {feature}. Not worth the current price.",
      "The {feature} needs significant updates to be useful.",
      "Found the {feature} to be frustrating to use.",
      "Below average performance, particularly the {feature}.",
      "Not impressed with the {feature}. Looking for alternatives."
    ]
  }
];

const FEATURES = {
  'ai-agent': ['AI assistance', 'automated responses', 'smart scheduling', 'personalization', 'learning capabilities', 'response accuracy'],
  'ai-chrome-extension': ['browser integration', 'quick access', 'easy installation', 'performance', 'memory usage', 'startup time'],
  'agi-agent': ['adaptive learning', 'multi-domain problem solving', 'human-like reasoning', 'cognitive assistance', 'enterprise integration', 'decision support'],
  'ai-agent-for-seo': ['keyword research', 'content optimization', 'backlink analysis', 'performance tracking', 'search ranking improvement', 'organic traffic growth'],
  'ai-agent-for-social-media': ['content creation', 'comment generation', 'engagement analysis', 'trend monitoring', 'audience growth features', 'cross-platform management'],
  'ai-agents-for-entrepreneurs': ['networking automation', 'business development tools', 'content creation', 'opportunity analysis', 'time-saving features', 'scaling capabilities'],
  'ai-agents-for-founders': ['investor outreach', 'market research', 'competitive analysis', 'strategic planning', 'resource management', 'time optimization'],
  'ai-agents-for-growth': ['lead generation', 'customer acquisition', 'retention strategies', 'growth analytics', 'scaling automation', 'conversion optimization'],
  'ai-agents-for-marketeers': ['campaign creation', 'content generation', 'audience analysis', 'performance tracking', 'marketing insights', 'strategic recommendations'],
  'ai-agents-for-productivity': ['task management', 'scheduling automation', 'email handling', 'workflow optimization', 'time-saving features', 'productivity analytics'],
  'ai-agents-for-sales': ['lead qualification', 'outreach automation', 'follow-up management', 'sales analytics', 'conversion optimization', 'pipeline management'],
  'ai-agents-for-small-businesses': ['customer service automation', 'local marketing tools', 'inventory management', 'business analytics', 'cost-effectiveness', 'competitive edge features'],
  'ai-comment-generator': ['personalized interactions', 'time-saving commenting', 'engagement enhancement', 'cross-platform support', 'audience growth tools', 'viral content insights'],
  'ai-comment-generator-free': ['basic comment generation', 'platform compatibility', 'simple interface', 'engagement suggestions', 'time-saving features', 'starter analytics'],
  'ai-content-detector': ['AI content identification', 'accuracy rating', 'detailed analysis reports', 'originality verification', 'plagiarism detection', 'content authentication'],
  'ai-course-image-generator': ['course thumbnail creation', 'professional design templates', 'customization options', 'high-resolution output', 'branding consistency', 'time-saving design'],
  'ai-course-outline-generator': ['structured course planning', 'comprehensive outlines', 'curriculum organization', 'learning objective mapping', 'module suggestion', 'educational framework'],
  'ai-course-promotion-generator': ['marketing content creation', 'promotional strategy', 'audience targeting', 'conversion copywriting', 'course value highlighting', 'enrollment optimization'],
  'ai-course-reviews-generator': ['detailed review creation', 'balanced feedback generation', 'course improvement insights', 'student perspective simulation', 'credibility enhancement', 'social proof elements'],
  'ai-for-linkedin-post': ['professional content creation', 'network engagement', 'brand consistency', 'content strategy', 'posting schedule management', 'professional tone adaptation'],
  'ai-gift-suggester-free': ['personalized recommendations', 'occasion matching', 'budget consideration', 'interest-based suggestions', 'gift idea variety', 'recipient preference analysis'],
  'ai-hashtag-generator': ['relevant tag creation', 'trending hashtag analysis', 'platform-specific suggestions', 'engagement optimization', 'discovery enhancement', 'reach maximization'],
  'ai-insult-generator': ['creative wordplay', 'comedic timing', 'roast customization', 'audience-appropriate content', 'humor calibration', 'entertainment value'],
  'ai-journal-writer': ['thoughtful prompts', 'reflection assistance', 'consistent journaling support', 'idea expansion', 'personal growth focus', 'writing structure'],
  'ai-niche-finder': ['market gap analysis', 'personalized recommendations', 'profitability assessment', 'trend identification', 'skill matching', 'competition analysis'],
  'ai-post-generator': ['content creation automation', 'platform optimization', 'engagement prediction', 'virality scoring', 'content strategy', 'audience targeting'],
  'ai-pun-generator-free': ['wordplay creation', 'humor calibration', 'topic customization', 'complexity adjustment', 'creative suggestions', 'instant generation'],
  'ai-rap-generator': ['lyric creation', 'rhyme scheme optimization', 'style customization', 'flow variation', 'theme development', 'beat compatibility'],
  'ai-review-generator': ['authentic feedback creation', 'balanced perspective', 'detailed product assessment', 'credible tone', 'feature highlighting', 'experience simulation'],
  'ai-rizz-generator': ['conversation starters', 'pickup line creation', 'personality customization', 'context awareness', 'response suggestions', 'engagement optimization'],
  'ai-roast-generator-free': ['playful comebacks', 'customized roasting', 'humor calibration', 'clean content filtering', 'occasion appropriateness', 'entertainment value'],
  'ai-script-generator': ['dialogue creation', 'narrative structure', 'format compliance', 'pacing optimization', 'character development', 'audience engagement'],
  'ai-tools-for-social-media-managers': ['cross-platform management', 'content calendar', 'performance analytics', 'audience insights', 'engagement tools', 'workflow optimization'],
  'auto-commenter-facebook': ['Facebook-specific engagement', 'comment automation', 'page growth', 'community building', 'visibility enhancement', 'time-saving engagement'],
  'auto-commenter-instagram': ['Instagram engagement automation', 'follower growth', 'content interaction', 'hashtag optimization', 'audience building', 'profile visibility'],
  'auto-commenter-linkedin': ['professional commenting', 'network expansion', 'business relationship building', 'industry relevance', 'professional tone', 'career opportunity engagement'],
  'auto-commenter-x-twitter': ['Twitter engagement automation', 'viral potential', 'trending topic interaction', 'follower growth', 'brand visibility', 'conversation participation'],
  'automatic-blog-commenting': ['blog engagement', 'backlink creation', 'community participation', 'content promotion', 'reader interaction', 'website traffic growth'],
  'automatic-commenter': ['cross-platform commenting', 'engagement automation', 'time optimization', 'brand voice consistency', 'community building', 'digital presence'],
  'bluesky-comment-generator': ['Bluesky-specific content', 'early platform adoption', 'community building', 'engagement optimization', 'platform-specific features', 'decentralized social insights'],
  'case-converter': ['text transformation', 'multiple format support', 'batch processing', 'developer workflow', 'coding efficiency', 'instant conversion'],
  'character-counter': ['real-time counting', 'multi-metric analysis', 'social media length checking', 'content optimization', 'space efficiency', 'format compliance'],
  'chrome-extension-for-entrepreneurs': ['browser-integrated tools', 'market research', 'competitor analysis', 'networking features', 'content creation', 'business development'],
  'chrome-extension-for-marketeers': ['content analysis', 'audience insights', 'campaign metrics', 'browser integration', 'marketing workflow', 'data accessibility'],
  'chrome-extension-for-social-media-managers': ['comment generation', 'content analysis', 'engagement metrics', 'cross-platform management', 'browser workflow', 'time optimization'],
  'chrome-extension-logo-generator': ['Chrome store compliance', 'multiple size generation', 'design consistency', 'developer toolkit', 'brand alignment', 'publication readiness'],
  'content-localizer': ['cultural adaptation', 'regional customization', 'sensitivity analysis', 'market-specific recommendations', 'global audience reach', 'localization efficiency'],
  'discord-small-text': ['Discord formatting', 'message styling', 'community engagement', 'visual differentiation', 'server customization', 'text presentation'],
  'discord-text-formatter': ['multiple style options', 'preview functionality', 'server-friendly formatting', 'communication enhancement', 'message customization', 'community engagement'],
  'email-signature-generator': ['professional design', 'brand consistency', 'contact information formatting', 'social media integration', 'responsive layout', 'customization options'],
  'engagement-optimizer': ['content analysis', 'platform-specific recommendations', 'hashtag suggestions', 'posting time optimization', 'engagement prediction', 'audience targeting'],
  'facebook': ['page management', 'community building', 'content strategy', 'engagement automation', 'audience growth', 'Facebook-specific optimization'],
  'facebook-comment-generator': ['Facebook-specific engagement', 'page interaction', 'community building', 'content relevance', 'audience growth', 'viral potential'],
  'fake-follower-check': ['authenticity verification', 'engagement analysis', 'bot detection', 'audience quality assessment', 'follower audit', 'marketing effectiveness'],
  'fancy-text-generator': ['unicode styling', 'multiple font options', 'social media optimization', 'profile customization', 'visual differentiation', 'creative expression'],
  'favicon-generator': ['website icon creation', 'multi-device compatibility', 'brand consistency', 'design simplification', 'web standard compliance', 'visual identity'],
  'free-ai-logo-generator': ['brand identity creation', 'design customization', 'gradient styling', 'professional appearance', 'startup branding', 'visual identity'],
  'game-theory-simulator': ['scenario modeling', 'decision analysis', 'strategy testing', 'outcome prediction', 'interactive simulation', 'educational framework'],
  'grammar-spell-checker': ['error detection', 'correction suggestions', 'writing enhancement', 'professional communication', 'readability improvement', 'language optimization'],
  'hacker-news-ycombinator-comment-generator': ['tech community engagement', 'startup discussion', 'technical accuracy', 'intellectual depth', 'industry relevance', 'community-appropriate tone'],
  'hashtag-generator': ['discovery optimization', 'trend analysis', 'platform-specific tags', 'engagement improvement', 'reach expansion', 'content categorization'],
  'influencer-search': ['niche-relevant creators', 'engagement analysis', 'audience demographics', 'contact information', 'collaboration potential', 'marketing fit'],
  'instagram': ['visual content optimization', 'hashtag strategy', 'engagement growth', 'follower acquisition', 'content planning', 'profile enhancement'],
  'instagram-audit': ['performance analysis', 'growth strategy', 'content effectiveness', 'hashtag analysis', 'engagement metrics', 'competitor comparison'],
  'instagram-auto-commenter': ['automated engagement', 'follower growth', 'content interaction', 'visibility enhancement', 'time optimization', 'consistent presence'],
  'instagram-comment-generator': ['post-specific engagement', 'follower interaction', 'community building', 'brand voice consistency', 'engagement strategy', 'audience growth'],
  'instagram-generator': ['bio optimization', 'caption creation', 'profile enhancement', 'niche targeting', 'engagement improvement', 'brand consistency'],
  'joke-generator': ['humor creation', 'category selection', 'audience appropriateness', 'clean content', 'entertainment value', 'situational relevance'],
  'line-breaker': ['text formatting', 'readability enhancement', 'platform optimization', 'output customization', 'batch processing', 'formatting consistency'],
  'link-shortener': ['URL compression', 'analytics tracking', 'click monitoring', 'branded links', 'sharing optimization', 'destination management'],
  'linkedin-audit': ['professional profile analysis', 'network quality assessment', 'visibility recommendations', 'career optimization', 'professional branding', 'connection strategy'],
  'linkedin-comment-generator': ['professional engagement', 'network building', 'industry-relevant interaction', 'career opportunity engagement', 'professional tone', 'thought leadership'],
  'linkedin-headline-generator': ['professional branding', 'career positioning', 'industry relevance', 'attention-grabbing copy', 'profile optimization', 'job seeker enhancement'],
  'lorem-ipsum-generator-free': ['placeholder text creation', 'design mockups', 'layout testing', 'multilingual options', 'length customization', 'format readiness'],
  'measure-linkedin-engagement': ['performance metrics', 'content analysis', 'audience insights', 'engagement tracking', 'strategy optimization', 'professional growth'],
  'medium-comment-generator': ['thoughtful responses', 'writer engagement', 'community building', 'article interaction', 'reader connection', 'thought leadership'],
  'meta-tag-generator': ['SEO optimization', 'search visibility', 'social sharing enhancement', 'webpage metadata', 'click-through improvement', 'SERP presentation'],
  'password-generator': ['security enhancement', 'complexity options', 'customized requirements', 'breach protection', 'credential management', 'vulnerability reduction'],
  'png-to-ico-converter': ['favicon creation', 'format conversion', 'website enhancement', 'visual identity', 'browser compatibility', 'web standard compliance'],
  'pomodoro-timer': ['productivity enhancement', 'focus intervals', 'break management', 'work efficiency', 'time tracking', 'task completion'],
  'product-hunt-comment-generator': ['launch support', 'maker feedback', 'product discussion', 'tech community engagement', 'feature highlighting', 'user perspective'],
  'quora-comment-generator': ['knowledge sharing', 'question answering', 'expert positioning', 'community engagement', 'thoughtful responses', 'credibility building'],
  'readability-tester': ['content analysis', 'reading level assessment', 'clarity improvement', 'audience appropriateness', 'writing enhancement', 'communication effectiveness'],
  'reddit-comment-generator': ['subreddit-specific engagement', 'community participation', 'discussion contribution', 'karma optimization', 'audience-appropriate tone', 'platform understanding'],
  'report-card-generator': ['academic assessment', 'personalized feedback', 'student evaluation', 'progress tracking', 'improvement recommendations', 'performance analysis'],
  'robot-txt-generator': ['crawler control', 'indexing management', 'search optimization', 'website access rules', 'SEO enhancement', 'privacy configuration'],
  'sentiment-analyzer': ['emotional tone detection', 'content analysis', 'audience reaction prediction', 'brand perception', 'feedback assessment', 'communication strategy'],
  'social-comments': ['cross-platform engagement', 'automated interaction', 'community building', 'brand voice consistency', 'audience growth', 'time optimization'],
  'social-media-agent': ['comprehensive management', 'cross-platform strategy', 'engagement automation', 'content optimization', 'audience growth', 'performance analytics'],
  'social-media-chrome-extension': ['browser-integrated tools', 'quick access features', 'workflow optimization', 'cross-platform management', 'time-saving functionality', 'engagement tools'],
  'social-media-image-resizer': ['platform-specific dimensions', 'batch processing', 'quality preservation', 'visual optimization', 'cross-platform compatibility', 'time-saving editing'],
  'social-media-post-virality-score-calculator': ['engagement prediction', 'content analysis', 'viral potential', 'performance metrics', 'strategy optimization', 'content enhancement'],
  'teleprompter': ['script reading', 'presentation support', 'recording assistance', 'speed control', 'professional delivery', 'content timing'],
  'tiktok-audit': ['performance analysis', 'viral potential', 'content strategy', 'trend alignment', 'growth recommendations', 'audience insights'],
  'tiktok-comment-generator': ['platform-specific engagement', 'trend participation', 'creator interaction', 'community building', 'visibility enhancement', 'audience growth'],
  'twitter-bio-generator': ['character optimization', 'personality showcase', 'professional branding', 'attention-grabbing copy', 'profile enhancement', 'follower acquisition'],
  'twitter-x-comment-generator': ['platform-specific engagement', 'viral potential', 'brevity optimization', 'conversation participation', 'trend engagement', 'visibility enhancement'],
  'username-lookup': ['availability checking', 'brand consistency', 'cross-platform verification', 'identity management', 'alternative suggestions', 'digital presence'],
  'utm-parameter-builder': ['campaign tracking', 'analytics enhancement', 'marketing attribution', 'link management', 'conversion tracking', 'performance measurement'],
  'viral-scorer': ['content potential', 'platform-specific analysis', 'trend alignment', 'engagement prediction', 'optimization recommendations', 'audience targeting'],
  'virality-score-ai': ['content analysis', 'sharing potential', 'engagement prediction', 'algorithmic assessment', 'trend alignment', 'optimization suggestions'],
  'word-counter': ['content metrics', 'writing analytics', 'length verification', 'readability assessment', 'SEO optimization', 'content planning'],
  'x-comment-generator': ['X-specific engagement', 'concise messaging', 'trend participation', 'visibility enhancement', 'follower interaction', 'platform optimization'],
  'x-twitter': ['platform management', 'engagement automation', 'audience growth', 'content strategy', 'trend participation', 'visibility enhancement'],
  'youtube-audit': ['channel analysis', 'content performance', 'audience insights', 'growth strategy', 'optimization recommendations', 'competitive positioning'],
  'youtube-chapters-generator': ['video navigation', 'timestamp creation', 'viewer experience', 'retention improvement', 'content organization', 'searchability enhancement'],
  'youtube-comment-generator': ['video engagement', 'creator interaction', 'community building', 'subscription growth', 'audience retention', 'channel promotion'],
  'youtube-description-generator': ['SEO optimization', 'content summarization', 'keyword integration', 'metadata enhancement', 'discoverability improvement', 'viewer information'],
  'youtube-subscription-button-creator': ['channel growth', 'website integration', 'audience acquisition', 'cross-platform promotion', 'subscriber conversion', 'brand consistency'],
  'youtube-transcript-extractor': ['content repurposing', 'research assistance', 'accessibility enhancement', 'content analysis', 'searchable text', 'video navigation'],
  'default': ['user interface', 'automation features', 'customization options', 'response quality', 'ease of use', 'reliability']
};

type ReviewCreationData = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;

function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateReview(productSlug: string, sentiment: 'positive' | 'neutral' | 'negative'): Pick<ReviewCreationData, 'rating' | 'reviewBody' | 'authorName'> {
  const features = FEATURES[productSlug as keyof typeof FEATURES] || FEATURES.default;
  const template = getRandomElement(REVIEW_TEMPLATES[0][sentiment]);
  const feature = getRandomElement(features);
  const reviewBody = template.replace('{feature}', feature);
  const authorName = generateRandomName();
  
  const ratingRanges = {
    positive: [4, 5],
    neutral: [3],
    negative: [1, 2]
  };
  
  const rating = getRandomElement(ratingRanges[sentiment]);
  
  return {
    rating,
    reviewBody,
    authorName
  };
}

export async function POST(req: Request) {
  try {
    const reviews: ReviewCreationData[] = [];
    
    for (const productSlug of PRODUCT_SLUGS) {
      // Generate 10 reviews for each product
      for (let i = 0; i < 10; i++) {
        // Determine sentiment distribution: 60% positive, 30% neutral, 10% negative
        const rand = Math.random();
        const sentiment = rand < 0.6 ? 'positive' : (rand < 0.9 ? 'neutral' : 'negative');
        
        const review = generateReview(productSlug, sentiment);
        
        reviews.push({
          productSlug,
          ...review,
          status: ReviewStatus.APPROVED,
          isVerified: true,
          authorId: null,
        });
      }
    }
    
    // Insert all reviews in a single transaction
    const result = await prismadb.$transaction(async (tx) => {
      return await tx.productReview.createMany({
        data: reviews
      });
    });

    return NextResponse.json({
      message: `Successfully created ${result.count} reviews`,
      count: result.count
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating dummy reviews:', error);
    return NextResponse.json({ error: 'Failed to create dummy reviews' }, { status: 500 });
  }
}