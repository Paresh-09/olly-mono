import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds the 10MB limit' }, { status: 400 });
    }

    // Check file type and extract text accordingly
    const fileType = file.type;
    let text = '';

    if (fileType === 'text/plain' || fileType.includes('text/')) {
      // For text files, simply extract the text
      text = await file.text();
    } else if (fileType.includes('pdf')) {
      // For PDF files, we'd normally use a PDF parsing library
      // For this implementation, we'll just read as text and inform about limitations
      text = await file.text().catch(() => 'PDF content extraction not fully supported in this demo. Please copy and paste content for better results.');
      text = `[Extracted from PDF]\n\n${text}`;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      // For Word documents
      text = await file.text().catch(() => 'Word document content extraction not fully supported in this demo. Please copy and paste content for better results.');
      text = `[Extracted from Word document]\n\n${text}`;
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload a text, PDF, or Word document.' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      text: text.substring(0, 100000), // Limit to 100K characters
      fileName: file.name
    });
  } catch (error) {
    console.error('Error extracting text from document:', error);
    return NextResponse.json({ 
      error: 'Failed to extract text from document' 
    }, { status: 500 });
  }
} 