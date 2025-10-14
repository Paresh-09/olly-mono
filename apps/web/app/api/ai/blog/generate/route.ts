import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample blog to use as a reference for the model
const SAMPLE_BLOG = `
# 5 Star Google Review Generator: AI Tools Transforming Business Reputation

In today's digital landscape, online reviews significantly influence consumer decisions, with Google Reviews being a cornerstone of business reputation. The emergence of AI-powered 5 star Google review generators has sparked both interest and controversy in the business community. This comprehensive guide explores these tools, their implications, and the ethical considerations surrounding their use in reputation management.

## Outline

1. Introduction
2. Understanding Google Review Generators
   2.1. What are AI Review Generators?
   2.2. How They Work
   2.3. Key Features and Capabilities
3. Benefits and Applications
   3.1. Time and Resource Efficiency
   3.2. Consistency in Review Generation
   3.3. Multilingual Capabilities
   3.4. Template Customization
4. Best Practices and Ethical Considerations
   4.1. Maintaining Authenticity
   4.2. Compliance with Guidelines
   4.3. Avoiding Fake Reviews
5. Implementation Strategies
   5.1. Setting Up Review Templates
   5.2. Customization Options
   5.3. Integration with Existing Systems
6. Future of Review Generation
7. Conclusion

## Introduction

In an era where 93% of consumers read online reviews before making a purchase, maintaining a strong Google review profile has become crucial for business success. AI-powered review generators have emerged as tools to help businesses streamline their review management process, but their use requires careful consideration of both practical and ethical implications.

## Understanding Google Review Generators

### 2.1. What are AI Review Generators?

AI review generators are sophisticated tools that use natural language processing and machine learning algorithms to create human-like review content based on specific business attributes and customer experiences. These tools can analyze existing reviews, understand patterns, and generate authentic-sounding feedback that reflects real customer experiences.

### 2.2. How They Work

The technology behind review generators combines several AI components:
- Natural Language Processing (NLP) for understanding context
- Machine Learning for pattern recognition
- Language Models for coherent text generation
- Sentiment Analysis for appropriate tone matching

### 2.3. Key Features and Capabilities

Modern review generators offer:
- Customizable templates
- Sentiment variation
- Multiple language support
- Industry-specific terminology
- Authentic tone matching

## Benefits and Applications

### 3.1. Time and Resource Efficiency

Businesses can save significant time by automating the review generation process while maintaining quality and authenticity. This efficiency allows teams to focus on addressing actual customer feedback and improving services.

### 3.2. Consistency in Review Generation

AI tools ensure consistent quality across generated reviews while maintaining natural variation in language and structure. This balance helps maintain credibility while scaling review management efforts.

### 3.3. Multilingual Capabilities

Advanced generators can create reviews in multiple languages, helping businesses reach diverse customer bases and maintain consistent reputation across different regions.

## Best Practices and Ethical Considerations

### 4.1. Maintaining Authenticity

While generators can create convincing reviews, it's crucial to:
- Use them as templates only
- Incorporate real customer feedback
- Maintain genuine customer interactions
- Avoid completely automated review posting

### 4.2. Compliance with Guidelines

Businesses must adhere to:
- Google's review policies
- FTC guidelines on testimonials
- Local advertising laws
- Platform-specific requirements

## Implementation Strategies

### 5.1. Setting Up Review Templates

Effective template creation involves:
- Identifying key service aspects
- Including common customer experiences
- Maintaining natural language variation
- Incorporating industry-specific terminology

### 5.2. Customization Options

Successful implementation requires:
- Adapting templates to business specifics
- Regular updates based on services
- Integration with customer feedback
- Continuous refinement of generated content

## Future of Review Generation

The future of review generation technology points toward:
- Enhanced natural language processing
- Better understanding of customer sentiment
- Improved authenticity detection
- Integration with customer experience platforms
- Real-time feedback incorporation

## Conclusion

While 5 star Google review generators offer powerful capabilities for business reputation management, their effective use requires a balanced approach. Success lies in combining these tools with authentic customer engagement, ethical practices, and genuine service improvement efforts. As the technology evolves, businesses must stay informed about best practices and regulatory requirements while maintaining focus on delivering genuine value to customers.

Remember that the most valuable reviews will always come from satisfied customers who voluntarily share their positive experiences. Use generation tools responsibly as aids in managing and scaling review processes, not as replacements for authentic customer feedback and engagement.
`;

// Function to generate blog writing guidelines based on language and topic
function getBlogWritingGuidelines(language: string, title: string, extraContext: string): string {
  const languageGuidelines: Record<string, string> = {
    en: "Write in clear, professional English with proper grammar and punctuation.",
    es: "Write in fluent Spanish (Español) with proper grammar, accents, and punctuation.",
    fr: "Write in fluent French (Français) with proper grammar, accents, and punctuation.",
    de: "Write in fluent German (Deutsch) with proper grammar, umlauts, and punctuation.",
    it: "Write in fluent Italian (Italiano) with proper grammar, accents, and punctuation.",
    hi: "Write in fluent Hindi (हिन्दी) with proper grammar and punctuation.",
    ar: "Write in fluent Arabic (العربية) with proper grammar and punctuation. Ensure right-to-left formatting.",
    "zh-cn": "Write in fluent Simplified Chinese with proper grammar and punctuation.",
    ja: "Write in fluent Japanese (日本語) with proper grammar and punctuation.",
    ko: "Write in fluent Korean (한국어) with proper grammar and punctuation.",
    nl: "Write in fluent Dutch (Nederlands) with proper grammar and punctuation.",
    ru: "Write in fluent Russian (Русский) with proper grammar and punctuation."
  };

  return `
    Blog Writing Guidelines:
    - ${languageGuidelines[language] || languageGuidelines.en}
    - Create engaging, informative content that provides value to readers
    - Structure the blog with clear headings and subheadings
    - Include an introduction that hooks the reader and outlines what they'll learn
    - Develop the main points with examples, data, or case studies when appropriate
    - Conclude with a summary and actionable takeaways
    - Maintain a consistent tone throughout the article
    - Focus on the topic: "${title}"
    - Consider this additional context: "${extraContext}"
    - Aim for depth and comprehensiveness while maintaining readability
  `;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return OPTIONS(request);
  }

  try {
    const body = await request.json();
    const {
      title,
      language = "en",
      extraContext = "",
    } = body;

    if (!title) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Title is required",
        }),
        { status: 400 }
      );
    }

    const blogWritingGuidelines = getBlogWritingGuidelines(language, title, extraContext);

    // First, generate the blog content
    const contentMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert blog writer specializing in creating high-quality, engaging blog content. ${blogWritingGuidelines}`
      },
      {
        role: "user",
        content: `I need you to write a comprehensive blog post about "${title}". ${extraContext ? `Additional context: ${extraContext}` : ''}

Here's a sample blog post format to follow as a reference:

${SAMPLE_BLOG}

Please write a well-structured blog post with proper headings, subheadings, and paragraphs. Focus on providing valuable information and insights. Do NOT include any metadata at the top of the content.`
      }
    ];

    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: contentMessages,
      temperature: 0.7,
      max_tokens: 2500,
    });

    const generatedContent = contentCompletion.choices[0].message.content || "";

    // Now, generate a concise description
    const descriptionMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert at writing concise, compelling meta descriptions for blog posts. Your task is to create a brief description (under 160 characters) that summarizes the main value proposition of a blog post and entices readers to click.`
      },
      {
        role: "user",
        content: `Based on this blog title: "${title}" and this additional context: "${extraContext}", please write a compelling meta description in ${language} language. The description should be under 160 characters and highlight the main value readers will get from the article. Generate in ${language} language.`
      }
    ];

    const descriptionCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: descriptionMessages,
      temperature: 0.7,
      max_tokens: 200,
    });

    const generatedDescription = descriptionCompletion.choices[0].message.content || "";

    // Finally, generate an optimized title if needed
    const titleMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert at writing engaging, SEO-friendly blog titles. Your task is to refine or enhance a given blog title to make it more compelling while maintaining its core topic.`
      },
      {
        role: "user",
        content: `Based on this initial blog title: "${title}" and this additional context: "${extraContext}", please suggest an optimized version of the title in ${language} language. The title should be attention-grabbing, clear, and optimized for both readers and search engines. Avoid having double quotes in the title. Strictly generate in ${language} language.`
      }
    ];

    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: titleMessages,
      temperature: 0.7,
      max_tokens: 100,
    });

    const generatedTitle = titleCompletion.choices[0].message.content || title;

    // Store the usage in database if needed
    try {
      await prismadb.apiUsage.create({
        data: {
          content: JSON.stringify({
            title: generatedTitle,
            description: generatedDescription,
            content: generatedContent
          }),
          prompt: title,
          platform: "blog",
        },
      });
    } catch (dbError) {
      console.error("Failed to log AI generation to database:", dbError);
      // Continue execution even if logging fails
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          title: generatedTitle,
          description: generatedDescription,
          content: generatedContent,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );

  } catch (error: any) {
    console.error(`Error generating blog content: ${error.message}`);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: error.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }
} 