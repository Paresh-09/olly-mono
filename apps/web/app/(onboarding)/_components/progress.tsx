import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = Math.min((currentStep / (totalSteps - 1)) * 100, 100)

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          style={{ width: `${progress}%` }}
          className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <div 
              key={index} 
              className="relative flex flex-col items-center"
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted ? "bg-primary text-primary-foreground" : 
                  isCurrent ? "border-2 border-primary bg-background ring-2 ring-background" : 
                  "border border-muted-foreground bg-background"
                )}
              >
                {isCompleted && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}