import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface NicheResponse {
    recommendedNiches: {
        niche: string;
        score: number;
        description: string;
        keyStrengths: string[];
        potentialChallenges: string[];
        contentIdeas: string[];
        monetizationStrategies: string[];
    }[];
    skillsAssessment: {
        subject: string;
        value: number;
        recommendations: string[];
    }[];
    marketAnalysis: {
        trendAlignment: number;
        competitionLevel: number;
        growthPotential: number;
        analysis: string;
    };
    nextSteps: string[];
    contentStrategy: {
        weeklyMix: {
            type: string;
            count: number;
        }[];
        timeAllocation: {
            activity: string;
            percentage: number;
        }[];
        platformRecommendations: {
            platform: string;
            priority: number;
            contentTypes: string[];
            postingFrequency: string;
        }[];
    };
}

export async function POST(request: Request) {
    try {
        const formData = await request.json();

        const prompt = `As an AI content strategy expert, analyze this detailed creator profile and provide comprehensive recommendations. Consider all aspects:

Current Professional Profile:
- Roles: ${formData.currentRoles.join(', ') || 'N/A'}
- Years of Experience: ${formData.yearsOfExperience || 'N/A'}
- Expertise Areas: ${Object.entries(formData.expertiseTopics).map(([category, topics]) => 
    `${category}: ${(topics as string[]).join(', ')}`).join('\n') || 'N/A'}

Content Creation Goals:
- Primary Goals: ${formData.contentGoals.join(', ') || 'N/A'}
- Target Platforms: ${formData.targetPlatforms.join(', ') || 'N/A'}
- Preferred Content Types: ${formData.preferredContentTypes.join(', ') || 'N/A'}

Creator Personality:
- Type: ${formData.personalityType || 'N/A'}
- Desired Superpower: ${formData.superpower || 'N/A'}
- Content Style: ${formData.contentStyle || 'N/A'}
- Dream Scenario: ${formData.dreamScenario || 'N/A'}

Preferences & Comfort:
- Camera Comfort: ${formData.cameraComfort || 50}%
- Research Interest: ${formData.researchPassion || 50}%
- Trend Focus: ${formData.trendFocus || 50}%
- Schedule Type: ${formData.schedule || 'casual'}
- Money Focus: ${formData.moneyFocus || 'passion'}
- Tech Level: ${formData.techLevel || 'basic'}

Based on this comprehensive profile, provide a detailed content strategy analysis in the following JSON format. Make recommendations specific to their unique combination of roles and expertise:

{
    "recommendedNiches": [
        {
            "niche": "Specific niche name based on expertise intersection",
            "score": "Match score 0-100",
            "description": "Detailed description connecting their roles and expertise",
            "keyStrengths": ["Specific strengths based on their background"],
            "potentialChallenges": ["Realistic challenges with solutions"],
            "contentIdeas": ["Specific content ideas matching their expertise"],
            "monetizationStrategies": ["Monetization strategies aligned with their goals"]
        }
    ],
    "skillsAssessment": [
        {
            "subject": "Specific skill relevant to content creation",
            "value": "Current proficiency 0-100",
            "recommendations": ["Actionable improvement steps"]
        }
    ],
    "marketAnalysis": {
        "trendAlignment": "Score 0-100",
        "competitionLevel": "Score 0-100",
        "growthPotential": "Score 0-100",
        "analysis": "Detailed market analysis for their specific combination"
    },
    "contentStrategy": {
        "weeklyMix": [
            {
                "type": "Content type",
                "count": "Recommended weekly frequency"
            }
        ],
        "timeAllocation": [
            {
                "activity": "Specific activity",
                "percentage": "Recommended time allocation"
            }
        ],
        "platformRecommendations": [
            {
                "platform": "Platform name",
                "priority": "Priority level 1-5",
                "contentTypes": ["Recommended content types"],
                "postingFrequency": "Recommended posting frequency"
            }
        ]
    },
    "nextSteps": ["Specific, actionable next steps"]
}

Consider these factors in your analysis:
1. Leverage their unique combination of roles and expertise
2. Match content formats to their comfort levels
3. Balance their goals with realistic time commitments
4. Suggest specific topics where their expertise intersects
5. Recommend platform-specific strategies
6. Provide realistic growth projections
7. Include both quick wins and long-term strategies
8. Consider their technical comfort level in recommendations

Make all recommendations specific to their unique background and goals.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const generatedContent = completion.choices[0].message.content || '';
        
        try {
            // Clean and parse the response
            const cleanContent = generatedContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            const response: NicheResponse = JSON.parse(cleanContent);
            
            return new NextResponse(JSON.stringify(response), { status: 200 });
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return new NextResponse(JSON.stringify({ error: "Failed to parse AI response" }), { status: 500 });
        }
    } catch (error) {
        console.error('Error in niche finder:', error);
        return new NextResponse(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
} 