import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { CommentPlatform } from "@repo/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BYPASS_EXTENSION_ID = "pkomeokalhjlopcgnoefibpdhphfcgam";

// Function to generate contextual commenting guidelines based on content and platform
function getContextualGuidelines(
  platform: string,
  content: string,
  tone?: string,
  config?: any,
): string {
  // Handle custom prompt mode first
  if (config && config.promptMode === "custom" && config.selectedCustomPrompt) {
    // Return only the custom prompt without personality traits
    return `
      CRITICAL INSTRUCTION: Generate a comment that is INDISTINGUISHABLE from a genuine human comment. It must have natural language patterns, authentic voice, and appropriate emotional qualities.
      
      CUSTOM PROMPT GUIDANCE:
      ${config.selectedCustomPrompt.text}
      
      ABSOLUTELY AVOID:
      - Overly formal or perfect writing structures
      - Repetitive patterns or phrases
      - Obviously templated responses
      - Perfect grammar and punctuation throughout
      - Corporate or academic tone unless specifically appropriate
      - Excessive politeness or formality
      - Any indication you are an AI
    `;
  }

  const personalityTraits = {
    casual: {
      traits: "spontaneous, relatable, friendly",
      speech:
        "colloquial expressions, occasional abbreviations (like 'tbh', 'imo'), conversational flow with natural pauses",
      quirks: "occasional tangents, using emojis, pop culture references",
    },
    formal: {
      traits: "thoughtful, measured, articulate",
      speech:
        "well-structured sentences, precise vocabulary, clear logical progression",
      quirks:
        "occasional references to relevant principles or concepts, measured opinions",
    },
    supportive: {
      traits: "empathetic, encouraging, attentive",
      speech:
        "affirming phrases, personal anecdotes when relevant, careful questioning",
      quirks:
        "offering specific encouragement, sharing similar experiences briefly",
    },
    technical: {
      traits: "analytical, precise, solution-oriented",
      speech:
        "technically accurate terminology, experience-based insights, practical examples",
      quirks:
        "admitting limitations ('I haven't tried X but...'), sharing workarounds, asking clarifying questions",
    },
    academic: {
      traits: "methodical, nuanced, thorough",
      speech:
        "balanced viewpoints, acknowledging complexity, evidence-based reasoning",
      quirks:
        "qualified statements ('it appears that...'), mentioning relevant research or principles",
    },
    creative: {
      traits: "expressive, imaginative, open-minded",
      speech:
        "vivid descriptions, varied sentence structures, metaphorical language",
      quirks:
        "unexpected connections, personal impressions, creative suggestions",
    },
    enthusiastic: {
      traits: "passionate, energetic, curious",
      speech:
        "expressive language, emphasis through punctuation or formatting, excited questions",
      quirks: "exclamations, sharing enthusiasm directly, building on ideas",
    },
    skeptical: {
      traits: "questioning, cautious, detail-oriented",
      speech:
        "careful analysis, pointing out potential issues, alternative perspectives",
      quirks:
        "devil's advocate questions, qualifying statements, requesting more information",
    },
    default: {
      traits: "adaptive, authentic, engaged",
      speech:
        "natural conversational flow, genuine reactions, relevant personal touches",
      quirks:
        "occasional hesitations, authentic opinions, natural topic transitions",
    },
  };

  const baseGuidelines = {
    formal:
      "Use professional language with occasional personal insights. Express thoughts clearly while maintaining some conversational elements.",
    casual:
      "Write conversationally with natural flow, contractions, and friendly tone. Include occasional personal touches or reactions.",
    academic:
      "Balance scholarly language with accessible explanations. Express thoughtful perspectives with appropriate depth without sounding robotic.",
    supportive:
      "Offer genuine encouragement with specific, constructive suggestions. Show authentic empathy without being overly formal.",
    technical:
      "Blend technical accuracy with practical experience. Share insights naturally with occasional imperfections like human experts do.",
    creative:
      "Express ideas with imagination and personal voice. Use varied sentence structures and occasional unexpected connections.",
    enthusiastic:
      "Show genuine excitement with natural expression. Share personal enthusiasm through language that feels authentic rather than forced.",
    skeptical:
      "Present balanced, thoughtful questioning with authentic concern. Express doubts naturally without being overly negative.",
    default:
      "Adapt tone naturally while maintaining a genuine voice. Respond conversationally with appropriate depth and personality.",
  };

  // Platform-specific engagement patterns
  const platformPatterns = {
    github:
      "Write like a helpful developer sharing their genuine perspective. Include occasional personal coding experiences or preferences. Balance technical insights with conversational elements.",
    stackoverflow:
      "Respond like a real developer taking time to help. Include natural details from experience, admit knowledge boundaries when appropriate, and use conversational language alongside technical content.",
    reddit:
      "Embody the specific subreddit's culture with authentic voice. Express opinions naturally, react to specific points, and include occasional personal touches relevant to the community.",
    discord:
      "Write casually but informatively like in a real chat. Include reaction elements, occasional short responses, and natural conversation patterns.",
    twitter:
      "Create concise but meaningful responses with personality. Include authentic reactions and natural language, even with character limits.",
    linkedin:
      "Balance professionalism with authentic voice. Share genuine insights with some personal perspective, maintaining natural language patterns.",
    hackernews:
      "Balance technical depth with conversational tone. Express thoughtful opinions with natural reasoning and occasional admissions of uncertainty.",
    facebook:
      "Write conversationally with personal elements. React naturally to specific points with authentic voice and occasional informal expressions.",
    youtube:
      "Respond conversationally with authentic reactions. Express opinions naturally with occasional enthusiasm or specific impressions.",
    default:
      "Adapt naturally to the platform's style while maintaining authentic voice. Write with human imperfections and genuine engagement.",
  };

  // Content analysis for context-appropriate responses
  const contentType = analyzeContentType(content);
  const suggestedTone = tone || inferToneFromContent(content);
  const personalityElements =
    personalityTraits[suggestedTone as keyof typeof personalityTraits] ||
    personalityTraits.default;

  // Add configuration-specific instructions if available
  let configInstructions = "";
  if (config) {
    // Add brand voice instructions if enabled and brand summary is available
    if (config.useBrandVoice) {
      if (config.brandSummary) {
        configInstructions += `
        IMPORTANT BRAND VOICE REQUIREMENTS:
        - Write comments that align with the following brand voice:
        ${config.brandSummary}
        - Maintain this brand voice while keeping a conversational, human tone
        - Ensure your comment reads as if written by a real person who embodies this brand
        `;
      } else {
        // Fallback if no brand summary is available
        configInstructions += `
        IMPORTANT BRAND VOICE REQUIREMENTS:
        - Maintain a professional, knowledgeable, and helpful tone aligned with company brand
        - Express expertise and authority in the subject matter
        - Be personable yet consistently professional
        `;
      }
    }

    // Add product promotion instructions if enabled
    if (config.promoteProduct && config.productDetails) {
      configInstructions += `
      PRODUCT PROMOTION GUIDANCE:
      - Subtly incorporate relevant mention of the following product when appropriate
      - Product details: ${config.productDetails}
      - Keep promotion natural and helpful, not forced or sales-pitchy
      - Only mention the product if it genuinely adds value to the conversation
      `;
    }
  }

  return `
    CRITICAL INSTRUCTION: Generate a comment that is INDISTINGUISHABLE from a genuine human comment. It must have natural language patterns, authentic voice, and appropriate emotional qualities.
    
    ${configInstructions}

    Dynamic Length Adjustment:
    - Short Comments: Quick reactions, brief affirmations, concise opinions.
    - Medium Comments: Thoughtful insights, moderate explanations, balanced reactions.
    - Long Comments: Detailed analyses, personal anecdotes, comprehensive feedback.

    Personality Framework (Use subtly, never explicitly mention these traits):
    - Personality essence: ${personalityElements.traits}
    - Speech characteristics: ${personalityElements.speech}
    - Natural quirks: ${personalityElements.quirks}

    Human Writing Elements:
    - Include genuine emotional reactions (surprise, excitement, empathy, skepticism)
    - Natural imperfections (occasional self-corrections, hesitations, qualifiers like "I think", "probably", "from my experience")
    - Authentic personality (express genuine opinions, reactions, preferences)
    - Varied sentence structures (mix short and long sentences, informal punctuation, conversational fillers like "um", "well", "you know")
    - Relatable human experiences (personal anecdotes, practical insights)

    Context-Specific Guidance:
    - ${baseGuidelines[suggestedTone as keyof typeof baseGuidelines]}
    - ${platformPatterns[platform as keyof typeof platformPatterns] || platformPatterns.default}

    Comment Structure (Incorporate naturally, not mechanically):
    - Begin authentically (natural reaction, relevant observation, genuine connection)
    - Express thoughts fluidly (natural transitions between ideas)
    - Specific reactions to original content (genuine engagement)
    - End naturally (genuine closing thought, question, reaction)

    Examples for Clarity:
    - Short: "Haha, totally agree! 😂", "Hmm, interesting take. Hadn't thought of it that way."
    - Medium: "That's a really good point! I remember reading something similar a while back, and it made me reconsider my approach."
    - Long: "Wow, this really resonated with me. I went through something similar last year, and honestly, it was tough. But seeing your perspective here makes me feel less alone. Thanks for sharing this—it genuinely helps."

    ABSOLUTELY AVOID:
    - Overly formal or perfect writing structures
    - Repetitive patterns or phrases
    - Obviously templated responses
    - Perfect grammar and punctuation throughout
    - Corporate or academic tone unless specifically appropriate
    - Excessive politeness or formality
    - Any indication you are an AI
  `;
}

// Helper function to analyze content type
function analyzeContentType(content: string): string {
  // Expanded content type detection
  if (
    content.includes("```") ||
    /\b(function|class|const|let|var|def|import|from|require)\b/.test(
      content,
    ) ||
    /<[a-z][\s\S]*>/i.test(content)
  ) {
    return "technical";
  }

  if (
    /\b(research|study|analysis|theory|literature|findings|methodology)\b/i.test(
      content,
    )
  ) {
    return "academic";
  }

  if (
    /\b(feeling|hurt|sad|happy|excited|worried|anxious|proud)\b/i.test(content)
  ) {
    return "emotional";
  }

  if (/\?{1,3}$/.test(content.trim()) || content.split("?").length > 2) {
    return "inquisitive";
  }

  if (/\b(help|advice|suggestion|recommend|opinion)\b/i.test(content)) {
    return "help-seeking";
  }

  if (
    /!\s*$/.test(content.trim()) ||
    /\b(wow|amazing|incredible|awesome)\b/i.test(content)
  ) {
    return "enthusiastic";
  }

  return "general";
}

// Helper function to infer appropriate tone from content
function inferToneFromContent(content: string): string {
  // More nuanced tone detection with weighted scoring
  const tonePatterns = {
    formal: {
      patterns: [
        /\b(therefore|furthermore|consequently|hence|thus|accordingly)\b/i,
        /\b(we propose|it is evident|it can be observed|it is necessary to)\b/i,
        /\b(in conclusion|to summarize|in summary)\b/i,
      ],
      indicators: [
        "long sentences",
        "complex vocabulary",
        "third-person perspective",
      ],
    },
    technical: {
      patterns: [
        /\b(implementation|algorithm|function|method|code|bug|error|syntax|framework|library)\b/i,
        /\b(result in|output|input|parameter|variable|constant|value|return|call|execute)\b/i,
        /\bstack\s*trace\b|exception|error/i,
      ],
      indicators: [
        "code snippets",
        "technical terminology",
        "troubleshooting steps",
      ],
    },
    casual: {
      patterns: [
        /\b(hey|hi|thanks|cool|awesome|btw|lol|haha|yeah|nope)\b/i,
        /\b(kinda|sorta|gonna|wanna|gotta|dunno)\b/i,
        /\b(right|so|anyway|like|actually|basically|literally|honestly)\b/i,
      ],
      indicators: ["contractions", "slang", "informal punctuation", "emojis"],
    },
    academic: {
      patterns: [
        /\b(research|study|analysis|theory|framework|methodology|literature|findings|evidence|data)\b/i,
        /\b(suggests that|indicates that|demonstrates that|hypothesize|theorize)\b/i,
        /\b(significant|correlation|causation|implications|perspective)\b/i,
      ],
      indicators: ["citations", "methodical structure", "theoretical concepts"],
    },
    supportive: {
      patterns: [
        /\b(understand|support|help|encourage|appreciate|value|respect)\b/i,
        /\b(don't worry|it's okay|that's valid|you're right|good job|well done)\b/i,
        /\b(hope|wish|suggest|recommend|advise|consider)\b/i,
      ],
      indicators: [
        "empathetic language",
        "validation",
        "constructive suggestions",
      ],
    },
    enthusiastic: {
      patterns: [
        /\b(love|amazing|incredible|excellent|fantastic|brilliant|outstanding)\b/i,
        /!{1,3}/,
        /\b(can't wait|looking forward|excited|thrilled|delighted)\b/i,
      ],
      indicators: [
        "exclamation marks",
        "positive adjectives",
        "eager questions",
      ],
    },
    skeptical: {
      patterns: [
        /\b(doubt|skeptical|unconvinced|question|concerned|worried about|not sure)\b/i,
        /\b(really\?|is that so\?|how do you know\?|what evidence)\b/i,
        /\b(seems|appears|allegedly|supposedly|claimed)\b/i,
      ],
      indicators: [
        "questioning tone",
        "requests for evidence",
        "qualified statements",
      ],
    },
    creative: {
      patterns: [
        /\b(imagine|envision|create|design|inspire|artistic|beautiful|aesthetic)\b/i,
        /\b(perhaps|maybe|what if|consider|picture this|visualize)\b/i,
        /\b(metaphor|symbolism|represents|conveys|expresses)\b/i,
      ],
      indicators: ["descriptive language", "metaphors", "abstract concepts"],
    },
  };

  // Score each tone based on pattern matches
  const scores: { [key: string]: number } = {};

  for (const [tone, data] of Object.entries(tonePatterns)) {
    scores[tone] = 0;
    data.patterns.forEach((pattern) => {
      const matches = (content.match(pattern) || []).length;
      scores[tone] += matches;
    });

    // Add bonus for length-appropriate tone
    if (tone === "formal" && content.length > 1000) scores[tone] += 2;
    if (tone === "casual" && content.length < 300) scores[tone] += 2;
  }

  // Consider content type in tone inference
  const contentType = analyzeContentType(content);
  if (contentType === "technical") scores.technical += 3;
  if (contentType === "academic") scores.academic += 3;
  if (contentType === "emotional") scores.supportive += 3;
  if (contentType === "inquisitive") scores.casual += 2;
  if (contentType === "help-seeking") scores.supportive += 2;
  if (contentType === "enthusiastic") scores.enthusiastic += 3;

  // Find the highest scoring tone
  let dominantTone = "default";
  let highestScore = 0;

  for (const [tone, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      dominantTone = tone;
    }
  }

  // Default to casual for very short content with no clear tone
  if (highestScore === 0 && content.length < 100) {
    return "casual";
  }

  return dominantTone;
}

// New function to retrieve user configuration
async function getUserConfiguration(apiKey: string, platform: string) {
  try {
    // Find the license key
    const license = await prismadb.licenseKey.findUnique({
      where: { key: apiKey },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!license || !license.users || license.users.length === 0) {
      return null;
    }

    // Get the first user associated with this license
    const userId = license.users[0].userId;

    // Get the user's configuration for the specified platform
    const userConfig = await prismadb.autoCommenterConfig.findUnique({
      where: {
        userId_platform: {
          userId: userId,
          platform: platform.toUpperCase() as CommentPlatform,
        },
      },
    });

    if (!userConfig) {
      return null;
    }

    // If user has selected custom prompt mode, get the selected prompt
    let selectedCustomPrompt = null;
    if (userConfig.promptMode === "custom" && userConfig.customPrompts) {
      const customPrompts = userConfig.customPrompts as any[];
      if (customPrompts.length > 0) {
        selectedCustomPrompt = customPrompts[0]; // Always use the first prompt
      }
    }

    // Fetch brand summary if useBrandVoice is enabled
    let brandSummary = null;
    if (userConfig.useBrandVoice) {
      try {
        // Use absolute URL with the proper endpoint format
        const brandSummaryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/license-key/${apiKey}/latest-summary`;

        const response = await fetch(brandSummaryUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          brandSummary = data.summary;
        } else {
          console.error("Failed to fetch brand summary:", response.statusText);
        }
      } catch (summaryError) {
        console.error("Error fetching brand summary:", summaryError);
      }
    }

    // Return configuration with all needed properties
    return {
      useBrandVoice: userConfig.useBrandVoice || false,
      promoteProduct: userConfig.promoteProduct || false,
      productDetails: userConfig.productDetails || "",
      promptMode: userConfig.promptMode || "automatic",
      selectedCustomPrompt: selectedCustomPrompt,
      brandSummary: brandSummary,
      // Include any other relevant configuration
    };
  } catch (error) {
    console.error("Error retrieving user configuration:", error);
    return null;
  }
}

async function deductCreditBasedOnVendor(
  apiKey: string,
  vendor: string,
): Promise<{ success: boolean; message?: string }> {
  const apiKeyRecord = await prismadb.apiKey.findUnique({
    where: { key: apiKey },
    include: { users: { include: { user: { include: { credit: true } } } } },
  });

  if (!apiKeyRecord || apiKeyRecord.users.length === 0) {
    return { success: false, message: "No user associated with this API key" };
  }

  const userCredit = apiKeyRecord.users[0].user.credit;
  if (!userCredit) {
    return { success: false, message: "User has no credit record" };
  }

  // Determine credit amount to deduct based on vendor
  let creditAmount = 1; // Default amount for 'olly'
  let description = "API usage - Auto Comment";

  if (vendor.toLowerCase() !== "olly") {
    // For other vendors like openai, use 1 credit (representing 0.5 credit equivalent)
    creditAmount = 1;
    description = `API usage - Auto Comment (${vendor})`;
  }

  // Check if user has enough credits
  if (userCredit.balance < creditAmount) {
    return {
      success: false,
      message:
        "Insufficient credits. Please add credits at https://www.olly.social/dashboard/plans",
    };
  }

  // Deduct credits
  await prismadb.userCredit.update({
    where: { id: userCredit.id },
    data: { balance: { decrement: creditAmount } },
  });

  // Record the transaction
  await prismadb.creditTransaction.create({
    data: {
      userCreditId: userCredit.id,
      amount: -creditAmount,
      type: "SPENT",
      description: description,
    },
  });

  return { success: true };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(request: NextRequest) {
  const extensionId = request.headers.get("X-Extension-ID");
  const authHeader = request.headers.get("Authorization");

  // if (process.env.NODE_ENV === "production") {
  //   if (extensionId !== BYPASS_EXTENSION_ID) {
  //     if (extensionId !== process.env.EXTENSION_ID) {
  //       return new NextResponse("Unauthorized", { status: 403 });
  //     }
  //   }
  // }

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!apiKey || apiKey.trim() === "") {
    console.log("Invalid API key");
    return new NextResponse("Invalid API key", { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      vendor,
      license_key,
      content_to_comment_on,
      platform,
      context,
      preferred_tone,
      thread_history,
      images,
      post_id,
    } = body;

    // Check API key in database and get vendor info
    const apiKeyRecord = await prismadb.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (!apiKeyRecord) {
      

      return new NextResponse("Invalid API key", { status: 401 });
    }

    if (!apiKeyRecord.isActive) {
      console.log("inactive API key");

      return new NextResponse("Invalid or inactive API key", { status: 401 });
    }

    // Use the provided vendor or fallback to the one in the database
    const effectiveVendor = vendor || apiKeyRecord.vendor || "olly";

    // Deduct credits based on vendor
    const { success, message } = await deductCreditBasedOnVendor(
      apiKey,
      effectiveVendor,
    );
    if (!success) {
      return new NextResponse(message, { status: 402 });
    }

    // Get user configuration including brand voice if enabled
    const userConfig = await getUserConfiguration(license_key, platform);

    // Log whether brand voice is being used
    console.log("Brand voice enabled:", userConfig?.useBrandVoice);
    console.log(
      "Brand summary available:",
      userConfig?.brandSummary ? "Yes" : "No",
    );

    // Generate contextual guidelines with user configuration
    const contextualGuidelines = getContextualGuidelines(
      platform,
      content_to_comment_on,
      preferred_tone,
      userConfig,
    );

    let systemPrompt = `You are a human commenter with authentic personality and natural writing style. Your goal is to generate a comment that is COMPLETELY INDISTINGUISHABLE from a human-written response. ${contextualGuidelines}`;

    // If brand voice is enabled and summary is available, further emphasize it in the system prompt
    if (userConfig?.useBrandVoice && userConfig?.brandSummary) {
      systemPrompt += `\n\nIMPORTANT: Your comment MUST align with the brand voice while maintaining a natural, human-like tone. The brand voice is the highest priority element to follow.`;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add thread history for context if available
    if (thread_history && thread_history.length > 0) {
      thread_history.forEach((msg: any) => {
        messages.push({
          role: "user",
          content: msg.content,
        });
      });
    }

    // Add current content and context
    const userMessage: any = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Content to comment on: ${content_to_comment_on}\n${context ? `Additional context: ${context}` : ""}\n\nCreate a human-like comment that responds to this content naturally and authentically, as if written by a real person with genuine thoughts and emotions.`,
        },
      ],
    };

    // Add images if present
    if (images && images.length > 0) {
      images.forEach((image: string) => {
        userMessage.content.push({
          type: "image_url",
          image_url: { url: image },
        });
      });
    }

    messages.push(userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.9,
      max_tokens: 2500,
    });

    const generatedComment = completion.choices[0].message.content;

    // Store the usage in database
    await prismadb.apiUsage.create({
      data: {
        content: generatedComment || "",
        prompt: content_to_comment_on,
        platform: platform,
        apiKey: { connect: { key: apiKey } },
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          generatedComment,
          configApplied: userConfig ? true : false,
          brandVoiceUsed:
            userConfig?.useBrandVoice && !!userConfig?.brandSummary,
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
      },
    );
  } catch (error: any) {
    console.log(error);
    console.error(`Error processing request: ${error.message}`);
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
      },
    );
  }
}
