'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { useToast } from '@repo/ui/hooks/use-toast';
import { Loader2, Play, Download } from 'lucide-react';

export function TextToBarkConverter() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const generateBark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this feature.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to convert to bark.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/text-to-bark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (data.success) {
        // Convert base64 to blob URL
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        throw new Error(data.error || 'Failed to generate bark');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bark",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'bark-sound.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Enter text to convert to bark..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
            disabled={isProcessing}
          />

          <Button
            onClick={generateBark}
            disabled={!text.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Bark...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Bark
              </>
            )}
          </Button>
        </div>

        {audioUrl && (
          <div className="space-y-4">
            <audio controls src={audioUrl} className="w-full" />
            <Button
              onClick={downloadAudio}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Bark Sound
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
} 