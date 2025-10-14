import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { startOfDay, subDays } from 'date-fns';
import OpenAI from 'openai';
import { DailyVlog, TransactionType } from '@prisma/client';
import { createCreditTransaction } from '@/lib/credit-transaction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the most recent trajectory analysis for the user
    const analysis = await prismadb.trajectoryAnalysis.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching trajectory analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trajectory analysis' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has enough credits
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id }
    });
    
    if (!userCredit || userCredit.balance < 1) {
      return NextResponse.json(
        { message: 'Insufficient credits. You need at least 1 credit to generate a trajectory analysis.' },
        { status: 400 }
      );
    }
    
    // Get vlog entries from the past 30 days
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
    
    const vlogEntries = await prismadb.dailyVlog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    if (vlogEntries.length < 3) {
      return NextResponse.json(
        { message: 'Not enough vlog entries. You need at least 3 entries in the past 30 days for analysis.' },
        { status: 400 }
      );
    }
    
    // Generate mock data for mood, energy, and productivity
    // In a real implementation, this would be extracted from the vlog entries using AI
    const moodData = generateMockData(vlogEntries);
    const energyData = generateMockData(vlogEntries);
    const productivityData = generateMockData(vlogEntries);
    
    // Generate insights and recommendations using OpenAI
    const vlogTexts = vlogEntries.map(entry => `Date: ${new Date(entry.date).toISOString().split('T')[0]}\nContent: ${entry.content}`).join('\n\n');
    
    const prompt = `
      Analyze the following daily vlog entries and provide insights and recommendations:
      
      ${vlogTexts}
      
      Based on these entries, provide:
      1. A concise analysis of patterns, trends, and insights (in HTML format with <p>, <ul>, <li> tags)
      2. Actionable recommendations for improvement (in HTML format with <p>, <ul>, <li> tags)
      
      Format your response with two clearly separated sections:
      <section id="insights">
      [Your insights here]
      </section>
      
      <section id="recommendations">
      [Your recommendations here]
      </section>
    `;
    
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert life coach and psychologist analyzing daily vlog entries to identify patterns and provide helpful insights and recommendations. Format your response in clean HTML."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });
    
    const aiText = aiResponse.choices[0].message.content || '';
    
    // Extract insights and recommendations from AI response using string operations
    let insightsText = '<p>No insights available.</p>';
    let recommendationsText = '<p>No recommendations available.</p>';
    
    const insightsStartIndex = aiText.indexOf('<section id="insights">');
    const insightsEndIndex = aiText.indexOf('</section>', insightsStartIndex);
    const recommendationsStartIndex = aiText.indexOf('<section id="recommendations">');
    const recommendationsEndIndex = aiText.indexOf('</section>', recommendationsStartIndex);
    
    if (insightsStartIndex !== -1 && insightsEndIndex !== -1) {
      insightsText = aiText.substring(insightsStartIndex + '<section id="insights">'.length, insightsEndIndex).trim();
    }
    
    if (recommendationsStartIndex !== -1 && recommendationsEndIndex !== -1) {
      recommendationsText = aiText.substring(recommendationsStartIndex + '<section id="recommendations">'.length, recommendationsEndIndex).trim();
    }
    
    // Create trajectory analysis with proper typing
    const analysis = await prismadb.trajectoryAnalysis.create({
      data: {
        userId: user.id,
        moodData: moodData,
        energyData: energyData,
        productivityData: productivityData,
        insightsText,
        recommendationsText,
      },
    });
    
    // Create credit transaction and deduct credits
    await createCreditTransaction({
      userId: user.id,
      amount: 1,
      type: TransactionType.SPENT,
      description: 'Generated trajectory analysis'
    });
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating trajectory analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate trajectory analysis' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock data for visualization
function generateMockData(entries: DailyVlog[]) {
  return entries.map(entry => {
    // Generate a random value between 1 and 10
    // In a real implementation, this would be extracted from the vlog content using AI
    const value = Math.floor(Math.random() * 10) + 1;
    
    return {
      date: new Date(entry.date).toISOString(),
      value,
    };
  });
} 