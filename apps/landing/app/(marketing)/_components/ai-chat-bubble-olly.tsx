"use client"

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
interface Message {
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
}

interface ChatBubbleProps {
  onChatOpenChange: (isOpen: boolean) => void;
}

const sampleQuestions: string[] = [
  "How can Agencies use Olly?",
  "We are a 10 people team, which is the best plan for me?",
  "What are the top features?",
  "What platforms does Olly support?",
  "I'm seeing 429 error when using OpenAI?",
  "How do I get started?"
];

const ChatBubble: React.FC<ChatBubbleProps> = ({ onChatOpenChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "👋 Hi! I'm Olly. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onChatOpenChange(open);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = { text: text, isUser: true };
    const assistantMessage: Message = {
      text: "",
      isUser: false,
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/contact-us/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          threadId: threadId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        streamedText += chunk;

        // Check if this chunk contains the threadId
        if (chunk.includes('threadId:')) {
          const newThreadId = chunk.split('threadId:')[1].trim();
          setThreadId(newThreadId);
          streamedText = streamedText.replace(`\nthreadId: ${newThreadId}`, '');
        }

        // Update the streaming message
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            lastMessage.text = streamedText;
          }
          return newMessages;
        });
      }

      // Mark message as no longer streaming
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          text: "Sorry, I'm having trouble connecting. Please try again.",
          isUser: false
        }
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleQuestionClick = (question: string): void => {
    handleSend(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {isOpen ? (
        <Card className="w-[95vw] h-[80vh] md:w-[450px] md:h-[600px] flex flex-col shadow-xl animate-in slide-in-from-bottom-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-primary">
            <CardTitle className="text-lg font-medium text-primary-foreground">This Chat is AI-Powered! Ask me anything!</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary/90"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <ScrollArea className="flex-1 w-full">
              <div className="space-y-4 pr-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-2",
                      msg.isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-background">
                      {msg.isUser ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Image width={24} height={24} src="/icon-2.png" alt="Olly" className="h-6 w-6" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[75%] break-words",
                        msg.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                        msg.isStreaming && "animate-pulse"
                      )}
                    >
                      {msg.text || "..."}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Popular questions:</p>
                    {sampleQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleQuestionClick(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-auto">
              <Input
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputValue(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => handleOpenChange(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatBubble;