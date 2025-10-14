import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: Request) {
    try {
        // Get the form data from the request
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // Convert File to Blob
        const audioBlob = new Blob([audioFile], { type: audioFile.type });

        // Convert audio to text using ElevenLabs
        const transcription = await client.speechToText.convert({
            file: audioBlob,
            model_id: "scribe_v1",
            tag_audio_events: true,
            language_code: undefined, // Will auto-detect language
            diarize: true
        });

        return NextResponse.json({
            text: transcription.text,
            success: true
        });

    } catch (error: any) {
        console.error("Error in bark-to-text conversion:", error);
        return NextResponse.json(
            { 
                error: "Failed to convert audio to text",
                details: error.message 
            },
            { status: 500 }
        );
    }
}
