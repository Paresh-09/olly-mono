'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { useToast } from '@repo/ui/hooks/use-toast';
import { Loader2, Mic, Upload, Play, Square } from 'lucide-react';

export function BarkToTextConverter() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/validate');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setAudioUrl(audioUrl);
    }
  };

  const processAudio = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this feature.",
        variant: "destructive",
      });
      return;
    }

    if (!audioUrl) {
      toast({
        title: "No Audio",
        description: "Please record or upload an audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const result = await fetch('/api/bark-to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await result.json();
      if (data.success) {
        setTranscription(data.text);
      } else {
        throw new Error(data.error || 'Failed to process audio');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              disabled={isProcessing}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Bark
                </>
              )}
            </Button>
            <Button
              variant="outline"
              disabled={isProcessing}
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {audioUrl && (
            <div className="w-full">
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </div>

        <Button
          onClick={processAudio}
          disabled={!audioUrl || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Convert to Text
            </>
          )}
        </Button>

        {transcription && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Translation:</h3>
            <p className="text-muted-foreground">{transcription}</p>
          </div>
        )}
      </div>
    </Card>
  );
} 