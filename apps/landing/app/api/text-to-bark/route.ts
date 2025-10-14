import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

// List of dog-like voices (you'll need to find appropriate voice IDs)
const DOG_VOICES = [
    "21m00Tcm4TlvDq8ikWAM", // Example voice ID - replace with actual dog-like voice
];

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: "No text provided" },
                { status: 400 }
            );
        }

        // Select a random dog voice from the list
        const voiceId = DOG_VOICES[Math.floor(Math.random() * DOG_VOICES.length)];

        // Make a direct fetch request to ElevenLabs API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate audio');
        }

        // Get audio as array buffer and convert to base64
        const audioArrayBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioArrayBuffer).toString('base64');

        return NextResponse.json({
            audio: base64Audio,
            success: true
        });

    } catch (error: any) {
        console.error("Error in text-to-bark conversion:", error);
        return NextResponse.json(
            { 
                error: "Failed to convert text to bark",
                details: error.message 
            },
            { status: 500 }
        );
    }
} 