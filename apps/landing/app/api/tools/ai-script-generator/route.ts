// File: app/api/tools/ai-script-generator/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      topic,
      tone,
      scriptType,
      duration,
      additionalInfo,
      includeCallToAction,
      includeHooks
    } = await request.json();

    if (!topic || topic.trim() === '') {
      return NextResponse.json(
        { error: 'Script topic is required' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for the script with explicit Markdown instructions
    const prompt = `
    Generate a ${scriptType} script about "${topic}" using Markdown formatting.
    ${tone ? `Tone: ${tone}` : ''}
    Duration: Approximately ${duration} ${duration === 1 ? 'minute' : 'minutes'}
    ${additionalInfo ? `Additional requirements: ${additionalInfo}` : ''}
    
    ${includeHooks ? 'Include an attention-grabbing hook at the beginning to draw in the audience.' : ''}
    ${includeCallToAction ? 'Include a clear call to action at the end of the script.' : ''}
    
    The script should include:
    1. ${includeHooks ? 'An engaging introduction with a hook' : 'An introduction'} (formatted as a level 2 heading with ##)
    2. The main content structured in a logical flow (with appropriate headings)
    3. Clear transitions between sections
    4. ${includeCallToAction ? 'A conclusion with a call to action' : 'A conclusion'} (formatted as a level 2 heading with ##)
    
    ${scriptType === 'video' ? 'Include [VISUAL CUES] in brackets where appropriate to indicate what should be shown on screen.' : ''}
    ${scriptType === 'podcast' ? 'Include [HOST] and [GUEST] indicators to show who is speaking.' : ''}
    ${scriptType === 'commercial' ? 'Keep the script concise and focused on benefits and features.' : ''}
    ${scriptType === 'presentation' ? 'Include [SLIDE X] indicators where new slides should be shown.' : ''}
    ${scriptType === 'tutorial' ? 'Break down steps clearly with numbered instructions.' : ''}
    ${scriptType === 'act' ? 'Format this as a theatrical script with Scene headings, character names, dialogue, and stage directions in parentheses. Include 3-5 scenes with a clear narrative arc.' : ''}
    
    Please use proper Markdown formatting:
    - Use # for title
    - Use ## for main section headings
    - Use ### for subsections
    - Use bullet points (- or *) for lists
    - Use **bold** or *italic* for emphasis where appropriate
    - Use > for quotes or important callouts
    ${scriptType === 'act' ? '- For theatrical scripts, put character names in bold followed by a colon, and stage directions in italics within parentheses' : ''}
    
    Format the script clearly with proper Markdown syntax.
    `;
    
    // Also update the system message to include theatrical writing expertise
    const systemMessage = "You are an expert scriptwriter who specializes in creating engaging, well-structured scripts using Markdown formatting. Your scripts are clear, engaging, and tailored to the specific medium they're designed for, including theatrical plays and screenplays with compelling characters and dialogue.";

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert scriptwriter who specializes in creating engaging, well-structured scripts using Markdown formatting. Your scripts are clear, engaging, and tailored to the specific medium they're designed for."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Get the script content from OpenAI
    const scriptContent = completion.choices[0].message.content || '';
    
    return NextResponse.json({ 
      success: true,
      script: scriptContent
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}