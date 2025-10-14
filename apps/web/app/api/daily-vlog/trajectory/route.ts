import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import OpenAI from 'openai';
import { TransactionType } from '@prisma/client';
import { createCreditTransaction } from '@/lib/credit-transaction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TRAJECTORY_ANALYSIS_COST = 5; // Credits cost for trajectory analysis

// POST endpoint to request a new trajectory analysis
export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has enough credits
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id }
    });

    if (!userCredit || userCredit.balance < TRAJECTORY_ANALYSIS_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TRAJECTORY_ANALYSIS_COST} credits for trajectory analysis.` },
        { status: 402 }  // 402 Payment Required
      );
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 30);

    // Get all vlog entries in the date range
    const vlogEntries = await prismadb.dailyVlog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      orderBy: { date: 'asc' }
    });

    // Check if there are enough entries to analyze
    if (vlogEntries.length < 3) {
      return NextResponse.json(
        { error: 'Not enough vlog entries to analyze. You need at least 3 entries in the last 30 days.' },
        { status: 400 }
      );
    }

    // Create a pending trajectory analysis record
    const trajectoryAnalysis = await prismadb.trajectoryAnalysis.create({
      data: {
        userId: user.id,
        moodData: { status: 'pending' },
        energyData: { status: 'pending' },
        productivityData: { status: 'pending' },
        insightsText: 'Processing analysis...',
        recommendationsText: 'Processing recommendations...'
      }
    });

    // Deduct credits
    await createCreditTransaction({
      userId: user.id,
      amount: TRAJECTORY_ANALYSIS_COST,
      type: TransactionType.SPENT,
      description: 'Trajectory analysis of daily vlogs'
    });

    // Start the analysis process asynchronously
    processTrajectoryAnalysis(trajectoryAnalysis.id, vlogEntries)
      .catch(error => console.error('Error processing trajectory analysis:', error));

    return NextResponse.json({
      message: 'Trajectory analysis started',
      trajectoryId: trajectoryAnalysis.id,
      status: 'PROCESSING'
    });
  } catch (error) {
    console.error('Error creating trajectory analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET endpoint to fetch trajectory analyses
export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trajectoryId = searchParams.get('id');

    // If an ID is provided, fetch that specific analysis
    if (trajectoryId) {
      const analysis = await prismadb.trajectoryAnalysis.findUnique({
        where: {
          id: trajectoryId,
          userId: user.id
        }
      });

      if (!analysis) {
        return NextResponse.json({ error: 'Trajectory analysis not found' }, { status: 404 });
      }

      return NextResponse.json(analysis);
    }

    // Otherwise, fetch all analyses for the user
    const analyses = await prismadb.trajectoryAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching trajectory analyses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to process the trajectory analysis asynchronously
async function processTrajectoryAnalysis(trajectoryId: string, vlogEntries: any[]) {
  try {
    // Prepare the data for analysis
    const entriesForAnalysis = vlogEntries.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      content: entry.content,
      transcription: entry.transcription
    }));

    // Generate analysis with OpenAI
    const analysisPrompt = `
      Analyze the following daily vlog entries from the last 30 days. 
      Identify patterns, trends, and insights about the person's life, mood, activities, and well-being.
      
      Entries:
      ${JSON.stringify(entriesForAnalysis)}
      
      Provide a comprehensive analysis including:
      1. Overall mood and emotional trends
      2. Key activities and interests
      3. Challenges and stressors
      4. Achievements and positive moments
      5. Social interactions and relationships
      6. Work/life balance
      7. Health and wellness patterns
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Brief overall summary",
        "moodTrend": "Analysis of mood trends",
        "activities": "Analysis of key activities",
        "challenges": "Analysis of challenges faced",
        "achievements": "Analysis of achievements",
        "social": "Analysis of social interactions",
        "workLifeBalance": "Analysis of work/life balance",
        "health": "Analysis of health patterns",
        "graphData": {
          "mood": [{"date": "YYYY-MM-DD", "value": number from 1-10}],
          "energy": [{"date": "YYYY-MM-DD", "value": number from 1-10}],
          "productivity": [{"date": "YYYY-MM-DD", "value": number from 1-10}],
          "social": [{"date": "YYYY-MM-DD", "value": number from 1-10}]
        }
      }
    `;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert life coach and data analyst who specializes in analyzing personal journals and providing insights.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 2000
    });

    const analysisResult = JSON.parse(analysisResponse.choices[0]?.message?.content || '{}');

    // Generate recommendations
    const recommendationsPrompt = `
      Based on the following analysis of a person's daily vlogs:
      ${JSON.stringify(analysisResult)}
      
      Provide personalized recommendations for how they can improve their life, well-being, and happiness.
      Focus on practical, actionable advice that addresses their specific challenges and builds on their strengths.
      
      Include recommendations for:
      1. Mental health and emotional well-being
      2. Physical health and wellness
      3. Work and productivity
      4. Social connections and relationships
      5. Personal growth and development
      6. Habits to build or break
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Brief summary of key recommendations",
        "mentalHealth": ["recommendation 1", "recommendation 2", ...],
        "physicalHealth": ["recommendation 1", "recommendation 2", ...],
        "workProductivity": ["recommendation 1", "recommendation 2", ...],
        "socialConnections": ["recommendation 1", "recommendation 2", ...],
        "personalGrowth": ["recommendation 1", "recommendation 2", ...],
        "habits": {
          "build": ["habit 1", "habit 2", ...],
          "break": ["habit 1", "habit 2", ...]
        }
      }
    `;

    const recommendationsResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert life coach who specializes in providing personalized recommendations based on journal analysis.'
        },
        {
          role: 'user',
          content: recommendationsPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500
    });

    const recommendationsResult = JSON.parse(recommendationsResponse.choices[0]?.message?.content || '{}');

    // Update the trajectory analysis record with the results
    await prismadb.trajectoryAnalysis.update({
      where: { id: trajectoryId },
      data: {
        moodData: analysisResult.graphData?.mood || [],
        energyData: analysisResult.graphData?.energy || [],
        productivityData: analysisResult.graphData?.productivity || [],
        insightsText: JSON.stringify(analysisResult),
        recommendationsText: JSON.stringify(recommendationsResult),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in trajectory analysis processing:', error);
    
    // Update the record with error status
    await prismadb.trajectoryAnalysis.update({
      where: { id: trajectoryId },
      data: {
        insightsText: 'Analysis failed. Please try again.',
        recommendationsText: 'Analysis failed. Please try again.',
        updatedAt: new Date()
      }
    });
  }
} 