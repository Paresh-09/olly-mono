// File: app/api/tools/readability-tester/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a more specific type for results
interface ReadabilityResults {
  'Total Words': string;
  'Total Sentences': string;
  'Flesch-Kincaid Grade Level': string;
  'Flesch Reading Ease': string;
  'Coleman-Liau Index': string;
  'Unique Words': string;
  'Recommended Complexity Level'?: string;
  'AI Readability Insights'?: string;
}

// Custom readability metric calculations
function calculateReadabilityMetrics(text: string): ReadabilityResults {
  // Split text into words and sentences
  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // Count syllables in a word
  const countSyllables = (word: string) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    return word.match(/[aeiouy]{1,2}/g)?.length || 1;
  };

  // Calculate metrics
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade = 
    0.39 * (totalWords / totalSentences) + 
    11.8 * (totalSyllables / totalWords) - 
    15.59;

  // Flesch Reading Ease
  const fleschReadingEase = 
    206.835 - 
    1.015 * (totalWords / totalSentences) - 
    84.6 * (totalSyllables / totalWords);

  // Coleman-Liau Index
  const averageLetters = words.reduce((sum, word) => sum + word.length, 0) / totalWords;
  const averageSentences = totalSentences / (totalWords / 100);
  const colemanLiauIndex = 
    0.0588 * averageLetters * 100 - 
    0.296 * averageSentences - 
    15.8;

  // Unique words
  const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g)).size;

  return {
    'Total Words': totalWords.toString(),
    'Total Sentences': totalSentences.toString(),
    'Flesch-Kincaid Grade Level': fleschKincaidGrade.toFixed(2),
    'Flesch Reading Ease': fleschReadingEase.toFixed(2),
    'Coleman-Liau Index': colemanLiauIndex.toFixed(2),
    'Unique Words': uniqueWords.toString()
  };
}

export async function POST(request: Request) {
  try {
    const {
      text,
      algorithm,
      contentType
    } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Basic text preprocessing
    const cleanedText = text.trim().replace(/\s+/g, ' ');

    // Calculate readability metrics
    const results: ReadabilityResults = calculateReadabilityMetrics(cleanedText);

    // AI-Powered Advanced Analysis
    const aiAnalysisPrompt = `Analyze the readability and quality of the following text:

Text to Analyze:
${cleanedText}

Provide a comprehensive analysis focusing on:
1. Overall readability and comprehension difficulty
2. Sentence structure complexity
3. Vocabulary sophistication
4. Potential areas of improvement
5. Recommended target audience
6. Writing style assessment

Content Type Context: ${contentType}
Readability Metrics:
- Total Words: ${results['Total Words']}
- Total Sentences: ${results['Total Sentences']}
- Flesch-Kincaid Grade Level: ${results['Flesch-Kincaid Grade Level']}
- Flesch Reading Ease: ${results['Flesch Reading Ease']}

Please provide detailed, actionable insights in a clear, structured format.`;

    // Call OpenAI API for advanced analysis
    const aiCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert text analysis assistant specializing in readability, writing quality, and communication effectiveness."
        },
        {
          role: "user",
          content: aiAnalysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract AI insights
    const aiInsights = aiCompletion.choices[0].message.content || 'No additional insights generated.';

    // Add AI insights to results
    results['AI Readability Insights'] = aiInsights;

    // Complexity and recommendation based on content type
    switch (contentType) {
      case 'academic':
        results['Recommended Complexity Level'] = 'Advanced (College/Graduate)';
        break;
      case 'technical':
        results['Recommended Complexity Level'] = 'Specialized Professional';
        break;
      case 'marketing':
        results['Recommended Complexity Level'] = 'General Audience';
        break;
      case 'educational':
        results['Recommended Complexity Level'] = 'Student-Friendly';
        break;
      default:
        results['Recommended Complexity Level'] = 'General Readership';
    }

    return NextResponse.json({ 
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Error analyzing readability:', error);
    return NextResponse.json(
      { error: 'Failed to analyze readability' },
      { status: 500 }
    );
  }
}