// app/api/ai-tools/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface GiftSuggestion {
    name: string;
    price: number;
    description: string;
    category: string;
    link?: string;
    reason: string;
}

interface ToolResponse {
    analysis?: string;
    joke?: string;
    chapters?: string;
    lines?: string[];
    verses?: string[];
    creditsRemaining: number;
    toolType: string;
    score?: number;
    insults?: string[];
    puns?: string[];
    roasts?: string[];
    gifts?: GiftSuggestion[];
    reportCard?: {
        grade: string;
        percentage: number;
        performance: string;
        strengths: string[];
        improvements: string[];
        recommendations: string[];
        comments: string;
    };
}

interface ToolConfig {
    prompt: string;
    maxTokens: number;
    temperature: number;
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
    'content-detector': {
        prompt: `Analyze the following content and determine the likelihood it was written by AI. 
        Consider factors like repetition, natural language patterns, consistency, and human-like nuances.
        Provide a score from 0-100 (0 being definitely human, 100 being definitely AI) and explain your reasoning.
        Content to analyze:

        {content}`,
        maxTokens: 250,
        temperature: 0.3
    },
    'gift-suggester': {
        prompt: `Generate 5 thoughtful gift suggestions based on the following parameters:

        Recipient Name: {recipientName}
        Age: {recipientAge}
        Occasion: {occasion}
        Relationship: {relationship}
        Budget Range: {minBudget}-{maxBudget}
        Interests: {interests}
        Dislikes/Allergies: {dislikes}

        Guidelines:
        - Suggest gifts within the specified budget range
        - Consider age appropriateness
        - Match interests and avoid dislikes
        - Include mixture of practical and thoughtful items
        - Provide specific product suggestions with estimated prices
        - Include reasoning for each suggestion
        - Consider occasion appropriateness
        - Include both online and local shopping options
        - Ensure suggestions are currently available
        - Mix categories (e.g., experiences, physical items, personalized gifts)

        IMPORTANT: Respond with ONLY a valid JSON array. Do not include markdown formatting, code blocks, or any other text.
        Use this exact format without any additional formatting or explanation:
        [
        {
            "name": "Gift Name",
            "price": 00.00,
            "description": "Brief description",
            "category": "Category",
            "link": "Optional shopping link",
            "reason": "Why this gift is appropriate"
        }
        ]

        Ensure all JSON properties use double quotes and all values are properly escaped.`,
        maxTokens: 800,
        temperature: 0.7
    },
    'roast-generator': {
        prompt: `Generate {count} playful roasts based on the following parameters:

        Style: {style}
        Context Category: {contextCategory}
        Context Details: {contextDetails}
        Target Name: {targetName}
        Intensity Level: {intensity}/100
        Clean Level: {cleanLevel}/100

        Guidelines:
        - Match the specified roast style authentically
        - Keep it playful and appropriate (no hate speech or harmful content)
        - Maintain the specified clean level
        - Use clever wordplay and references
        - Include context-specific elements
        - Use target name if provided (respectfully)
        - Adjust intensity based on level
        - Focus on humor over hostility
        - Consider the relationship context
        - Keep it creative and original
        
        Respond with ONLY the roasts, one per line. No additional text or explanations.
        Each roast should be a complete, self-contained statement.`,
        maxTokens: 400,
        temperature: 0.8
    },
    'insult-generator': {
        prompt: `Generate {count} witty insults based on the following parameters:

        Style: {style}
        Context Category: {contextCategory}
        Context Details: {contextDetails}
        Target Name: {targetName}
        Wit Level: {witLevel}/100
        Clean Level: {cleanLevel}/100

        Guidelines:
        - Match the specified style authentically
        - Keep it playful and appropriate (no hate speech or serious insults)
        - Maintain the specified clean level
        - Use wordplay and clever references
        - Include context-specific elements
        - Use target name if provided (respectfully)
        - Adjust complexity based on wit level
        - Focus on humor over hostility
        - Keep it creative and original
        
        Respond with ONLY the insults, one per line. No additional text or explanations.
        Each insult should be a complete, self-contained statement.`,
        maxTokens: 400,
        temperature: 0.8
    },
    'pun-generator': {
        prompt: `Generate {count} clever puns based on the following parameters:

        Style: {style}
        Topic Category: {topicCategory}
        Topic Details: {topicDetails}
        Keywords: {keywords}
        Complexity Level: {complexity}/100

        Guidelines:
        - Match the specified pun style authentically
        - Incorporate the topic and keywords naturally
        - Adjust complexity based on the level provided
        - Ensure puns are family-friendly
        - Create original and creative wordplay
        - Include topic-specific references
        - Make sure puns are clear and understandable
        - Use double meanings and clever associations
        - Keep each pun self-contained
        
        Respond with ONLY the puns, one per line. No additional text or explanations.
        Each pun should be a complete, self-contained statement.`,
        maxTokens: 400,
        temperature: 0.8
    },
    'sentiment-analyzer': {
        prompt: `Analyze the sentiment and emotional impact of this social media post. 
        Consider tone, emotion, potential audience reaction, and viral potential.
        Provide specific recommendations for improvement.
        Content to analyze:

        {content}`,
        maxTokens: 200,
        temperature: 0.4
    },
    'trend-adapter': {
        prompt: `Adapt this content to incorporate current trending elements while maintaining its core message.
        Consider viral formats, trending phrases, and platform-specific trends.
        Original content:

        {content}

        Platform: {platform}`,
        maxTokens: 300,
        temperature: 0.7
    },
    'content-localizer': {
        prompt: `Adapt this content for the {region} market while maintaining its core message.
        Consider cultural nuances, local trends, and regional preferences.
        Provide both adapted content and explanations of the changes made.
        Original content:

        {content}`,
        maxTokens: 300,
        temperature: 0.6
    },
    'engagement-optimizer': {
        prompt: `Analyze this social media post and suggest optimizations for maximum engagement.
        Consider timing, format, call-to-actions, and platform-specific best practices.
        Provide specific, actionable recommendations.
        Content to analyze:

        {content}
        Platform: {platform}`,
        maxTokens: 250,
        temperature: 0.5
    },
    'viral-potential-scorer': {
        prompt: `Analyze this content's viral potential. Consider:
        - Hook strength
        - Emotional impact
        - Shareability
        - Trend alignment
        - Platform suitability
        
        Provide a viral potential score (0-100) and specific improvements.
        Content to analyze:

        {content}
        Platform: {platform}`,
        maxTokens: 250,
        temperature: 0.4
    },
    'joke-generator': {
        prompt: `Generate a {style} joke suitable for social media, specifically for {platform}.
        Style: {style}
        Target audience: {audience}
        Must be:
        - Clean and appropriate
        - Easy to understand
        - Shareable
        - Platform-appropriate
        - Trendy and current
        
        Additional requirements:
        {requirements}

        Respond with ONLY the joke text, no explanations or additional commentary.`,
        maxTokens: 200,
        temperature: 0.8
    },
    'chapter-generator': {
        prompt: `Analyze the following transcript and generate well-structured chapters with timestamps.
        Follow this format strictly:
        00:00:00 Chapter Title
        
        Guidelines:
        - Create 4-10 chapters
        - Use proper timestamp format (HH:MM:SS)
        - Ensure timestamps are in chronological order
        - Chapter titles should be clear and concise
        - Consider natural topic transitions
        - First chapter always starts at 00:00:00
        
        Example format:
        00:00:00 Introduction and Overview
        00:02:15 First Major Topic
        00:05:30 Second Major Topic
        xx:xx:xx < Last timestamp of the transcript

        Not all videos may have conclusion, so don't make up timestamps that do not exist in transcript.
        
        Transcript to analyze:
        {content}
        
        Respond with ONLY the chapter timestamps and titles, no additional text or explanations. Ensure the generated chapters do no exceed the final timestamp of the video it should MANDATORILY BE LESS THAN THE LAST TIMESTAMP. ELSE YOUR CONTENT IS INVALIDATED.
        
        Transcript will have timestamps either like this 4:35 meaning 4 mins 35 seconds, or 00:04:35 which is also 4 minutes 35 seconds or 1:04:35 which is 1 hours, 4 mins 35 seconds..
        `,
        maxTokens: 300,
        temperature: 0.1
    },
    'rizz-generator': {
        prompt: `Generate 5 smooth, contextual, and appropriate rizz lines/conversation starters based on the following parameters:

        Category: {category}
        Situation: {situation}
        Context: {context}
        Target Name: {name}
        Smoothness Level: {smoothness}/100

        Guidelines:
        - Adapt tone and style to match the category and situation
        - Include context-specific references when provided
        - Maintain appropriate boundaries and respect
        - Use the target's name naturally if provided
        - Adjust complexity based on smoothness level
        - Ensure responses are engaging and original
        - Avoid generic or overused lines
        - Keep it clean and professional
        - Consider the situation's appropriateness
        
        Respond with ONLY the 5 lines, one per line. No additional text or explanations.`,
        maxTokens: 400,
        temperature: 0.7
    },
    'linkedin-headline-generator': {
        prompt: `Generate 5 powerful and professional LinkedIn headlines based on the following parameters:

        Industry: {industry}
        Job Title/Role: {jobTitle}
        Experience Details: {experienceDetails}
        Style: {style}
        Impact Level: {impactLevel}/100

        Guidelines:
        - Create headlines that are concise (under 220 characters)
        - Incorporate industry-specific keywords for searchability
        - Match the specified style authentically
        - Highlight expertise and value proposition
        - Include achievements or specializations when provided
        - Adjust impact and boldness based on impact level
        - Ensure headlines are professional and credible
        - Avoid clichés and overused buzzwords
        - Focus on what makes the person unique in their field
        - Consider both human readers and LinkedIn's algorithm
        
        Respond with ONLY the 5 headlines, one per line. No additional text or explanations.`,
        maxTokens: 400,
        temperature: 0.7
    },
    'instagram-generator': {
        prompt: `Generate 5 engaging Instagram {contentType} based on the following parameters:

        Content Type: {contentType} (profile description or caption)
        Niche: {niche}
        Style: {style}
        Details: {details}
        Creativity Level: {creativityLevel}/100

        Guidelines for Profile Descriptions:
        - Create concise, engaging bios (under 150 characters)
        - Include relevant emojis appropriately
        - Incorporate niche-specific keywords
        - Match the specified style authentically
        - Highlight unique value proposition
        - Include a clear call-to-action
        - Format with line breaks for readability
        - Adjust creativity based on the specified level
        - Consider Instagram's formatting limitations
        - Make it scannable and memorable

        Guidelines for Captions:
        - Create engaging, shareable captions
        - Include relevant hashtags (5-10) grouped at the end
        - Incorporate emojis appropriately
        - Match the specified style and niche
        - Include a question or call-to-action to boost engagement
        - Format with line breaks for readability
        - Adjust creativity and tone based on the specified level
        - Keep within optimal caption length (under 2,200 characters)
        - Make it relatable and authentic
        - Consider what would encourage comments and shares
        
        Respond with ONLY the 5 {contentType}, one per content block. No additional text or explanations.`,
        maxTokens: 500,
        temperature: 0.8
    },
    'youtube-description-generator': {
        prompt: `Generate 5 professional YouTube channel descriptions based on the following parameters:

        Channel Category: {category}
        Channel Name: {channelName}
        Channel Details: {channelDetails}
        Style: {style}
        Formality Level: {formalityLevel}/100

        Guidelines:
        - Create descriptions between 500-1000 characters
        - Include relevant keywords for YouTube SEO
        - Match the specified style and category
        - Incorporate the channel name naturally
        - Include a clear value proposition for viewers
        - Add a call-to-action for subscribing
        - Format with line breaks for readability
        - Adjust formality based on the specified level
        - Include relevant links placeholder sections (website, social media)
        - Make it engaging and professional
        - Consider YouTube's search algorithm
        - Include relevant hashtags (3-5)
        
        Respond with ONLY the 5 descriptions, separated by three dashes (---). No additional text or explanations.`,
        maxTokens: 800,
        temperature: 0.7
    },
    'twitter-bio-generator': {
        prompt: `Generate 5 engaging Twitter/X bios based on the following parameters:

        Category: {category}
        Display Name: {displayName}
        Profile Details: {profileDetails}
        Style: {style}
        Conciseness Level: {conciseLevel}/100

        Guidelines:
        - Create bios under 160 characters (Twitter's limit)
        - Match the specified style and category
        - Incorporate the display name naturally if provided
        - Include relevant emojis appropriately
        - Highlight key expertise or interests
        - Make it attention-grabbing and unique
        - Adjust length based on conciseness level (higher = shorter)
        - Consider including a call-to-action
        - Avoid hashtags unless absolutely necessary
        - Make it scannable and memorable
        - Consider Twitter's search functionality
        
        Respond with ONLY the 5 bios, one per line. No additional text or explanations.`,
        maxTokens: 400,
        temperature: 0.7
    },
    'rap-generator': {
        prompt: `Generate a rap verse with the following parameters:

        Style: {style}
        Theme Category: {themeCategory}
        Theme Details: {themeDetails}
        Keywords to Include: {keywords}
        Flow Complexity: {flowLevel}/100
        Verse Length: {verseLength} lines

        Guidelines:
        - Match the specified rap style authentically
        - Incorporate the theme and keywords naturally
        - Maintain consistent flow and rhythm
        - Use appropriate slang and terminology for the style
        - Create internal rhymes based on flow complexity
        - Avoid explicit content or profanity
        - Ensure proper line count
        - Include metaphors and wordplay
        - Keep verses coherent and meaningful
        
        Format the verse with proper line breaks and spacing. Focus on authenticity and musicality.
        
        Respond with ONLY the verse text, no additional explanations or commentary.`,
        maxTokens: 500,
        temperature: 0.8
    },
    'report-card-generator': {
        prompt: `Generate a detailed academic report card analysis based on the following parameters:

        Student Name: {studentName}
        Grade Level: {gradeLevel}
        Subject: {subject}
        Performance Data: {performanceData}
        Term: {term}

        Guidelines:
        - Provide a comprehensive grade analysis
        - Include specific strengths and areas for improvement
        - Suggest actionable steps for improvement
        - Consider grade-appropriate expectations
        - Include both quantitative and qualitative feedback
        - Maintain a constructive and encouraging tone
        - Focus on growth mindset and potential
        - Include specific examples where possible
        - This is for educational purposes only and should not be used for any other purpose
        
        Format the response as a JSON object with the following structure:
        {
            "grade": "Letter grade (A+, A, A-, etc.)",
            "percentage": "Numerical grade (0-100)",
            "performance": "Brief performance summary",
            "strengths": ["Array of specific strengths"],
            "improvements": ["Array of areas needing improvement"],
            "recommendations": ["Array of specific recommendations"],
            "comments": "Detailed teacher comments"
        }

        Ensure all JSON properties use double quotes and values are properly escaped.`,
        maxTokens: 800,
        temperature: 0.4
    },
};

export async function POST(request: Request) {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const toolType = formData.get('toolType') as keyof typeof TOOL_CONFIGS;
    
    // Parse the content as JSON if it's a string
    let parsedContent: any = content;
    try {
        parsedContent = JSON.parse(content);
    } catch (e) {
        // If parsing fails, keep the original content
    }

    // Extract common parameters
    const platform = formData.get('platform') as string;
    const region = formData.get('region') as string;
    const style = formData.get('style') as string;
    const audience = formData.get('audience') as string;
    const requirements = formData.get('requirements') as string;

    // Extract tool-specific parameters from parsedContent
    const {
        // Rizz Generator params
        category = '',
        situationType = '',
        contextDetails = '',
        targetName = '',
        smoothnessLevel = '',

        contextCategory = '',
        witLevel = '',
        cleanLevel = '',

        topicCategory = '',
        topicDetails = '',
        complexity = '',

        intensity = '',

        recipientName = '',
        recipientAge = '',
        occasion = '',
        relationship = '',
        minBudget = '',
        maxBudget = '',
        interests = '',
        dislikes = '',
        
        themeCategory = '',
        themeDetails = '',
        keywords = '',
        flowLevel = '',
        verseLength = '',
    } = typeof parsedContent === 'object' ? parsedContent : {};

    try {
        // Validate tool type
        if (!TOOL_CONFIGS[toolType]) {
            return new NextResponse(JSON.stringify({ error: "Invalid tool type" }), { status: 400 });
        }

        // Get tool config and prepare prompt
        const toolConfig = TOOL_CONFIGS[toolType];
        let prompt = toolConfig.prompt;

        if (toolType === 'gift-suggester') {
            prompt = prompt
                .replace(/{recipientName}/g, recipientName || '')
                .replace(/{recipientAge}/g, recipientAge?.toString() || '')
                .replace(/{occasion}/g, occasion || '')
                .replace(/{relationship}/g, relationship || '')
                .replace(/{minBudget}/g, minBudget?.toString() || '0')
                .replace(/{maxBudget}/g, maxBudget?.toString() || '100')
                .replace(/{interests}/g, Array.isArray(interests) ? interests.join(', ') : '')
                .replace(/{dislikes}/g, Array.isArray(dislikes) ? dislikes.join(', ') : '');
        }

        // Replace common parameters
        prompt = prompt
            .replace(/{content}/g, typeof parsedContent === 'object' ? JSON.stringify(parsedContent) : content || '')
            .replace(/{platform}/g, platform || '')
            .replace(/{region}/g, region || '')
            .replace(/{style}/g, style || '')
            .replace(/{audience}/g, audience || '')
            .replace(/{requirements}/g, requirements || 'None');

        // Replace tool-specific parameters
        if (toolType === 'rizz-generator') {
            prompt = prompt
                .replace(/{category}/g, category || '')
                .replace(/{situation}/g, situationType || '')
                .replace(/{context}/g, contextDetails || '')
                .replace(/{name}/g, targetName || '')
                .replace(/{smoothness}/g, smoothnessLevel?.toString() || '50');
        }

        if (toolType === 'insult-generator') {
            prompt = prompt
                .replace(/{style}/g, style || '')
                .replace(/{contextCategory}/g, contextCategory || '')
                .replace(/{contextDetails}/g, contextDetails || '')
                .replace(/{targetName}/g, targetName || '')
                .replace(/{witLevel}/g, witLevel?.toString() || '50')
                .replace(/{cleanLevel}/g, cleanLevel?.toString() || '80')
                .replace(/{count}/g, '5');
        }

        if (toolType === 'pun-generator') {
            prompt = prompt
                .replace(/{style}/g, style || '')
                .replace(/{topicCategory}/g, topicCategory || '')
                .replace(/{topicDetails}/g, topicDetails || '')
                .replace(/{keywords}/g, keywords || '')
                .replace(/{complexity}/g, complexity?.toString() || '50')
                .replace(/{count}/g, '5');
        }

        if (toolType === 'roast-generator') {
            prompt = prompt
                .replace(/{style}/g, style || '')
                .replace(/{contextCategory}/g, contextCategory || '')
                .replace(/{contextDetails}/g, contextDetails || '')
                .replace(/{targetName}/g, targetName || '')
                .replace(/{intensity}/g, intensity?.toString() || '30')
                .replace(/{cleanLevel}/g, cleanLevel?.toString() || '90')
                .replace(/{count}/g, '5');
        }

        if (toolType === 'rap-generator') {
            prompt = prompt
                .replace(/{style}/g, style || '')
                .replace(/{themeCategory}/g, themeCategory || '')
                .replace(/{themeDetails}/g, themeDetails || '')
                .replace(/{keywords}/g, keywords || '')
                .replace(/{flowLevel}/g, flowLevel?.toString() || '50')
                .replace(/{verseLength}/g, verseLength?.toString() || '16');
        }

        // Generate response
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: toolConfig.maxTokens,
            temperature: toolConfig.temperature,
        });

        const generatedContent = completion.choices[0].message.content || '';

    

        // Format response based on tool type
        let response: ToolResponse = {
            creditsRemaining: 999, // Placeholder since we removed credit system
            toolType,
        };

        switch (toolType) {
            case 'joke-generator':
                response.joke = generatedContent;
                break;
            case 'chapter-generator':
                response.chapters = generatedContent;
                break;
            case 'rizz-generator':
                response.lines = generatedContent.split('\n').filter(line => line.trim());
                break;
            case 'rap-generator':
                response.verses = generatedContent.split('\n').filter(line => line.trim());
                break;
            case 'insult-generator':
                response.insults = generatedContent.split('\n').filter(line => line.trim());
                break;
            case 'pun-generator':
                response.puns = generatedContent.split('\n').filter(line => line.trim());
                break;
            case 'roast-generator':
                response.roasts = generatedContent.split('\n').filter(line => line.trim());
                break;
            case 'gift-suggester':
                try {
                    // Remove any markdown formatting if present
                    const cleanContent = generatedContent
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim();
                        
                    // Parse the cleaned JSON
                    const suggestions = JSON.parse(cleanContent);
                    
                    // Validate the structure
                    if (!Array.isArray(suggestions)) {
                        throw new Error('Response is not an array');
                    }
                    
                    // Validate each suggestion
                    response.gifts = suggestions.filter(suggestion => {
                        return suggestion &&
                            typeof suggestion === 'object' &&
                            typeof suggestion.name === 'string' &&
                            typeof suggestion.price === 'number' &&
                            typeof suggestion.description === 'string' &&
                            typeof suggestion.category === 'string' &&
                            typeof suggestion.reason === 'string';
                    });
                    
                    // If no valid suggestions, throw error
                    if (response.gifts.length === 0) {
                        throw new Error('No valid gift suggestions found');
                    }
                } catch (error) {
                    console.error('Error parsing gift suggestions:', error);
                    response.gifts = [];
                }
                break;
            case 'report-card-generator':
                try {
                    // Clean the response by removing markdown formatting
                    const cleanContent = generatedContent
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim();
                        
                    // Parse the cleaned JSON
                    const reportCard = JSON.parse(cleanContent);
                    
                    // Convert percentage to number if it's a string
                    if (typeof reportCard.percentage === 'string') {
                        reportCard.percentage = parseFloat(reportCard.percentage);
                    }
                    
                    // Validate the structure
                    if (!reportCard ||
                        typeof reportCard !== 'object' ||
                        typeof reportCard.grade !== 'string' ||
                        typeof reportCard.percentage !== 'number' ||
                        isNaN(reportCard.percentage) ||
                        typeof reportCard.performance !== 'string' ||
                        !Array.isArray(reportCard.strengths) ||
                        !Array.isArray(reportCard.improvements) ||
                        !Array.isArray(reportCard.recommendations) ||
                        typeof reportCard.comments !== 'string') {
                        throw new Error('Invalid report card structure');
                    }
                    
                    response.reportCard = reportCard;
                } catch (error) {
                    console.error('Error parsing report card:', error);
                    response.analysis = generatedContent;
                }
                break;
            case 'linkedin-headline-generator':
                try {
                    const parsedContent = JSON.parse(content);
                    const industry = parsedContent.industry || 'Technology';
                    const jobTitle = parsedContent.jobTitle || '';
                    const experienceDetails = parsedContent.experienceDetails || '';
                    const style = parsedContent.style || 'Professional';
                    const impactLevel = parsedContent.impactLevel || 50;

                    const prompt = TOOL_CONFIGS['linkedin-headline-generator'].prompt
                        .replace('{industry}', industry)
                        .replace('{jobTitle}', jobTitle)
                        .replace('{experienceDetails}', experienceDetails)
                        .replace('{style}', style)
                        .replace('{impactLevel}', impactLevel.toString());

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: "You are an expert in professional branding and LinkedIn optimization." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: TOOL_CONFIGS['linkedin-headline-generator'].maxTokens,
                        temperature: TOOL_CONFIGS['linkedin-headline-generator'].temperature,
                    });

                    const responseText = completion.choices[0].message.content || '';
                    const lines = responseText.split('\n').filter(line => line.trim() !== '');

                    return NextResponse.json({
                        lines,
                        creditsRemaining: 0,
                        toolType: 'linkedin-headline-generator'
                    });
                } catch (error) {
                    console.error('Error generating LinkedIn headlines:', error);
                    return NextResponse.json({ error: 'Failed to generate LinkedIn headlines' }, { status: 500 });
                }
                break;
            case 'instagram-generator':
                try {
                    const parsedContent = JSON.parse(content);
                    const contentType = parsedContent.contentType || 'profile description';
                    const niche = parsedContent.niche || 'General';
                    const style = parsedContent.style || 'Professional';
                    const details = parsedContent.details || '';
                    const creativityLevel = parsedContent.creativityLevel || 50;

                    const prompt = TOOL_CONFIGS['instagram-generator'].prompt
                        .replace('{contentType}', contentType)
                        .replace('{niche}', niche)
                        .replace('{style}', style)
                        .replace('{details}', details)
                        .replace('{creativityLevel}', creativityLevel.toString());

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: "You are an expert in Instagram content creation and optimization." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: TOOL_CONFIGS['instagram-generator'].maxTokens,
                        temperature: TOOL_CONFIGS['instagram-generator'].temperature,
                    });

                    const responseText = completion.choices[0].message.content || '';
                    const lines = responseText.split('\n').filter(line => line.trim() !== '');

                    return NextResponse.json({
                        lines,
                        creditsRemaining: 0,
                        toolType: 'instagram-generator'
                    });
                } catch (error) {
                    console.error('Error generating Instagram content:', error);
                    return NextResponse.json({ error: 'Failed to generate Instagram content' }, { status: 500 });
                }
                break;
            case 'youtube-description-generator':
                try {
                    const parsedContent = JSON.parse(content);
                    const category = parsedContent.category || 'Technology';
                    const channelName = parsedContent.channelName || 'Tech Innovators';
                    const channelDetails = parsedContent.channelDetails || 'Innovating for a better future';
                    const style = parsedContent.style || 'Professional';
                    const formalityLevel = parsedContent.formalityLevel || 50;

                    const prompt = TOOL_CONFIGS['youtube-description-generator'].prompt
                        .replace('{category}', category)
                        .replace('{channelName}', channelName)
                        .replace('{channelDetails}', channelDetails)
                        .replace('{style}', style)
                        .replace('{formalityLevel}', formalityLevel.toString());

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: "You are an expert in YouTube channel description creation and optimization." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: TOOL_CONFIGS['youtube-description-generator'].maxTokens,
                        temperature: TOOL_CONFIGS['youtube-description-generator'].temperature,
                    });

                    const responseText = completion.choices[0].message.content || '';
                    const descriptions = responseText.split('---').map(desc => desc.trim()).filter(desc => desc);

                    return NextResponse.json({
                        lines: descriptions,
                        creditsRemaining: 0,
                        toolType: 'youtube-description-generator'
                    });
                } catch (error) {
                    console.error('Error generating YouTube descriptions:', error);
                    return NextResponse.json({ error: 'Failed to generate YouTube descriptions' }, { status: 500 });
                }
                break;
            case 'twitter-bio-generator':
                try {
                    const parsedContent = JSON.parse(content);
                    const category = parsedContent.category || 'Technology';
                    const displayName = parsedContent.displayName || 'Tech Innovator';
                    const profileDetails = parsedContent.profileDetails || 'Innovating for a better future';
                    const style = parsedContent.style || 'Professional';
                    const conciseLevel = parsedContent.conciseLevel || 50;

                    const prompt = TOOL_CONFIGS['twitter-bio-generator'].prompt
                        .replace('{category}', category)
                        .replace('{displayName}', displayName)
                        .replace('{profileDetails}', profileDetails)
                        .replace('{style}', style)
                        .replace('{conciseLevel}', conciseLevel.toString());

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: "You are an expert in Twitter/X bio creation and optimization." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: TOOL_CONFIGS['twitter-bio-generator'].maxTokens,
                        temperature: TOOL_CONFIGS['twitter-bio-generator'].temperature,
                    });

                    const responseText = completion.choices[0].message.content || '';
                    const bios = responseText.split('\n').filter(line => line.trim() !== '');

                    return NextResponse.json({
                        lines: bios,
                        creditsRemaining: 0,
                        toolType: 'twitter-bio-generator'
                    });
                } catch (error) {
                    console.error('Error generating Twitter/X bios:', error);
                    return NextResponse.json({ error: 'Failed to generate Twitter/X bios' }, { status: 500 });
                }
                break;
            default:
                response.analysis = generatedContent;
                // Add score for specific tools
                if (toolType === 'content-detector' || toolType === 'viral-potential-scorer') {
                    const scoreMatch = generatedContent.match(/(\d+)/);
                    if (scoreMatch) {
                        response.score = parseInt(scoreMatch[1]);
                    }
                }
        }

        return new NextResponse(JSON.stringify(response), { status: 200 });
    } catch (error: any) {
        console.error(`Error using ${toolType} tool:`, error);
        return new NextResponse(JSON.stringify({ error: `Error using ${toolType} tool` }), { status: 500 });
    }
}