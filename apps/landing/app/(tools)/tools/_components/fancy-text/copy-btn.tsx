'use client'

import React, { FC, useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({
  text,
  size = 'sm',
  variant = 'ghost',
  className = 'h-8 px-2 text-xs'
}) => {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1" />
          <span>Copy</span>
        </>
      )}
    </Button>
  )
}