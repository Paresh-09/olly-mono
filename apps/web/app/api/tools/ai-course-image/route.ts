// File: app/api/tools/ai-course-image/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      courseName,
      courseSubject,
      additionalDetails,
      imageStyle,
      aspectRatio,
      colorPalette,
      includeTextOverlay,
      includeIcons
    } = await request.json();

    if (!courseName || courseName.trim() === '') {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for image generation
    const prompt = `Generate a professional course image for "${courseName}"
    
Image Style: ${imageStyle}
Aspect Ratio: ${aspectRatio}
Color Palette: ${colorPalette}

Key Requirements:
- Focus on creating an engaging visual representation of an online course
${courseSubject ? `- Incorporate elements related to ${courseSubject}` : ''}
${additionalDetails ? `- Additional context: ${additionalDetails}` : ''}
${includeTextOverlay ? '- Include course name as text overlay' : ''}
${includeIcons ? '- Add subject-related icons or symbolic representations' : ''}

Specific Guidelines:
- Create a clean, professional design that represents online learning
- Ensure the image is visually appealiung and informative 
- Keep the sentence struture concise 
- Avoid spelling mistakes and grammatical errors
- Use modern, appealing visual aesthetics
- Ensure the image is clear and high-resolution
- Avoid using any specific brand logos or copyrighted images
- Focus on creating an inspirational and educational atmosphere

Color and Style Guidance:
${colorPalette === 'professional' ? '- Use a palette of blues, grays, and whites' : ''}
${colorPalette === 'creative' ? '- Employ soft, pastel colors with playful transitions' : ''}
${colorPalette === 'tech' ? '- Utilize gradient effects with tech-inspired colors' : ''}
${colorPalette === 'education' ? '- Choose warm, inviting tones that suggest learning' : ''}
${colorPalette === 'minimalist' ? '- Stick to neutral tones with clean, simple design' : ''}

Imagery Style:
${imageStyle === 'modern-minimal' ? '- Clean, flat design with minimal elements' : ''}
${imageStyle === 'vibrant-illustrative' ? '- Colorful, graphic illustration style' : ''}
${imageStyle === 'professional-photo' ? '- Use high-quality photographic elements' : ''}
${imageStyle === 'abstract-geometric' ? '- Incorporate geometric shapes and abstract design' : ''}
${imageStyle === 'hand-drawn' ? '- Create a sketch-like, artistic rendering' : ''}`;

    // Call OpenAI API for image generation
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality: "standard",
      size: aspectRatio === "square" ? "1024x1024" : 
        aspectRatio === "landscape" ? "1792x1024" : 
        aspectRatio === "portrait" ? "1024x1792" : 
        "1024x1024" // default to square if not specified
    });
    
    // Get the image URL from the response
    if (!response?.data?.[0]?.url) {
      throw new Error('Failed to generate image: No URL returned from OpenAI');
    }
    
    return NextResponse.json({ 
      success: true,
      imageUrl: response.data[0].url
    });
  } catch (error) {
    console.error('Error generating course image:', error);
    return NextResponse.json(
      { error: 'Failed to generate course image' },
      { status: 500 }
    );
  }
}