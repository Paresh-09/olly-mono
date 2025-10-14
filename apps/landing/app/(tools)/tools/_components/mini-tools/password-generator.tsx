"use client"

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Copy, CheckSquare, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

const OPTION_LABELS = {
  uppercase: 'Uppercase (A-Z)',
  lowercase: 'Lowercase (a-z)',
  numbers: 'Numbers (0-9)',
  symbols: 'Symbols (!@#$)'
} as const;

export const PasswordGenerator = () => {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(12)
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'password-generator',
    dailyLimit: 2
  });

  const validatePassword = (pwd: string): boolean => {
    if (options.uppercase && !/[A-Z]/.test(pwd)) return false;
    if (options.lowercase && !/[a-z]/.test(pwd)) return false;
    if (options.numbers && !/\d/.test(pwd)) return false;
    if (options.symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) return false;
    return true;
  };

  const generatePassword = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    const selectedOptions = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => key as keyof typeof CHARACTER_SETS);

    if (selectedOptions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one option",
        variant: "destructive"
      });
      return;
    }

    try {
      let chars = selectedOptions
        .map(option => CHARACTER_SETS[option])
        .join('');

      let generated: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Keep generating until we get a valid password or reach max attempts
      do {
        generated = Array.from(
          { length }, 
          () => chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
        attempts++;
      } while (!validatePassword(generated) && attempts < maxAttempts);

      if (!validatePassword(generated)) {
        toast({
          title: "Warning",
          description: "Could not generate password with all requirements. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setPassword(generated);
      
      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Success",
        description: "New password generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate password",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "Password copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleLengthChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 4) {
      setLength(4);
    } else if (numValue > 50) {
      setLength(50);
    } else {
      setLength(numValue);
    }
  };

  const toggleOption = (option: keyof PasswordOptions) => {
    setOptions(prev => {
      const newOptions = { ...prev, [option]: !prev[option] };
      const hasOneEnabled = Object.values(newOptions).some(Boolean);
      
      if (!hasOneEnabled) {
        toast({
          title: "Error",
          description: "At least one option must be selected",
          variant: "destructive"
        });
        return prev;
      }
      
      return newOptions;
    });
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free generation{remainingUses !== 1 ? 's' : ''} remaining today. Sign in for unlimited access.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <label className="text-sm font-medium">Length:</label>
          </div>
          <Input
            type="number"
            min={4}
            max={50}
            value={length}
            onChange={(e) => handleLengthChange(e.target.value)}
            className="w-24"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(options) as Array<keyof PasswordOptions>).map(option => (
            <label key={option} className="flex items-center gap-2 group cursor-pointer">
              <Checkbox
                checked={options[option]}
                onCheckedChange={() => toggleOption(option)}
              />
              <span className="text-sm">{OPTION_LABELS[option]}</span>
            </label>
          ))}
        </div>

        <Button 
          onClick={generatePassword} 
          className="w-full gap-2"
          disabled={!isAuthenticated && remainingUses <= 0}
        >
          <RefreshCw className="h-4 w-4" />
          Generate Password
        </Button>

        {password && (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              readOnly
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-8 w-8 p-0"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">Password Requirements:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Length: 4-50 characters</li>
            <li>At least one character type selected</li>
            <li>Must contain selected character types</li>
          </ul>
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
}