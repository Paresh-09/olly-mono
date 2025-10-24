// api-keys-list.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { 
  Copy, Check, ExternalLink, Eye, EyeOff, 
  RefreshCw, Trash2, Info, BookAIcon 
} from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiKey {
  apiKey: {
    id: string;
    key: string;
    isActive: boolean;
  }
}

interface ApiKeysListProps {
  initialApiKeys: ApiKey[];
}

const API_PROVIDERS = [
  { name: "OpenAI", description: "Recommended, Paid", link: "https://platform.openai.com/api-keys" },
  { name: "Ollama", description: "Free", link: "https://youtu.be/fABczcnx9AY?si=lwKj_HNSVsTH9ytF" },
  { name: "Claude API", description: "Paid", link: "https://console.anthropic.com/settings/keys" },
  { name: "Gemini - Google", description: "Paid", link: "https://aistudio.google.com/app/apikey" },
];

export default function ApiKeysList({ initialApiKeys }: ApiKeysListProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const activeOllyApiKey = useMemo(() => {
    return apiKeys.find(key => key.apiKey.isActive);
  }, [apiKeys]);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      prev.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const generateNewApiKey = async () => {
    if (activeOllyApiKey) return;
    setIsLoading('generate');
    try {
      const response = await fetch('/api/v2/key/generate', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate API key');
      if (data.apiKey) {
        setApiKeys(prev => [...prev, { apiKey: data.apiKey }]);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const regenerateApiKey = async (id: string) => {
    setIsLoading(id);
    try {
      const response = await fetch(`/api/v2/key/${id}/manage`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to regenerate API key');
      if (data.apiKey) {
        setApiKeys(prev => prev.map(key => 
          key.apiKey.id === id ? { apiKey: data.apiKey } : key
        ));
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    setIsLoading(id);
    try {
      const response = await fetch(`/api/v2/key/${id}/manage`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete API key');
      if (data.success) {
        setApiKeys(prev => prev.filter(key => key.apiKey.id !== id));
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Olly API Key Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Olly Keys</h3>
            <Alert className="mb-2">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Use Olly API key to access our service. Each action costs 1 credit.
                <Link href="/credits" className="text-blue-700 ml-1">
                  Get More
                </Link>
              </AlertDescription>
            </Alert>

            {activeOllyApiKey ? (
              <div className="bg-gray-50 p-2 rounded flex items-center justify-between">
                <code className="text-sm font-mono">
                  {visibleKeys.has(activeOllyApiKey.apiKey.id) 
                    ? activeOllyApiKey.apiKey.key 
                    : '•'.repeat(20)}
                </code>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleKeyVisibility(activeOllyApiKey.apiKey.id)}
                  >
                    {visibleKeys.has(activeOllyApiKey.apiKey.id) 
                      ? <EyeOff className="h-4 w-4" /> 
                      : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(activeOllyApiKey.apiKey.key, activeOllyApiKey.apiKey.id)}
                  >
                    {copiedId === activeOllyApiKey.apiKey.id 
                      ? <Check className="h-4 w-4" /> 
                      : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => regenerateApiKey(activeOllyApiKey.apiKey.id)}
                    disabled={isLoading === activeOllyApiKey.apiKey.id}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading === activeOllyApiKey.apiKey.id ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteApiKey(activeOllyApiKey.apiKey.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isLoading === activeOllyApiKey.apiKey.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push(`/dashboard/train/${activeOllyApiKey.apiKey.id}`)}
                    className="text-green-500 hover:text-green-700"
                    disabled={isLoading === activeOllyApiKey.apiKey.id}
                  >
                    <BookAIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={generateNewApiKey}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading === 'generate'}
              >
                {isLoading === 'generate' ? 'Generating...' : 'Generate Olly API Key'}
              </Button>
            )}
          </div>

          {/* External API Providers */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Other API Providers</h3>
            <Alert className="mb-2">
              <AlertDescription>
                Alternatively, you can use your own API key from these providers.
              </AlertDescription>
            </Alert>
            <ul className="space-y-2">
              {API_PROVIDERS.map((provider, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-semibold">{provider.name}</span>
                    {provider.description && (
                      <span className="ml-2 text-sm text-gray-500">
                        {provider.description}
                      </span>
                    )}
                  </div>
                  <a 
                    href={provider.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Get API Key
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}