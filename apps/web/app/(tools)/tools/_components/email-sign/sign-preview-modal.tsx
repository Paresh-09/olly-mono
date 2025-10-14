'use client'

import { useState, useRef, useEffect } from 'react'
import { FormData, CustomizationOptions, TemplateType } from './sign-generator'
import { SignaturePreview } from './sign-preview'
import { SignatureTemplates } from './sign-template'
import { SignatureExport } from './sign-export'

interface SignatureModalProps {
  formData: FormData
  template: TemplateType
  customization: CustomizationOptions
  isOpen: boolean
  onClose: () => void
  onTemplateChange: (template: TemplateType) => void
  onCustomizationChange: <T extends keyof CustomizationOptions>(
    name: T, 
    value: CustomizationOptions[T]
  ) => void
}

export const SignaturePreviewModal = ({ 
  formData, 
  template, 
  customization,
  isOpen,
  onClose,
  onTemplateChange,
  onCustomizationChange
}: SignatureModalProps) => {
  const previewRef = useRef<HTMLDivElement>(null)

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Email Signature Preview</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Preview Section - Always visible and fixed on the left */}
          <div className="md:w-1/2 p-6 border-r border-gray-200 overflow-auto" ref={previewRef}>
            <div className="bg-gray-100 p-6 rounded-lg">
              <h4 className="font-medium mb-4 text-center">Preview</h4>
              <div className="bg-white p-6 shadow rounded-lg">
                <SignaturePreview 
                  formData={formData}
                  template={template}
                  customization={customization}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm text-center">
                This is how your signature will appear in email clients.<br/>
                <span className='text-green-500'>Copy the Signature (Rendered HTML) and use it in desired provider</span>
              </p>
            </div>
          </div>
          
          {/* Settings Section - Always scrollable on the right */}
          <div className="md:w-1/2 overflow-y-auto">
            <div className="p-6">
              <SignatureTemplates 
                selectedTemplate={template}
                onSelectTemplate={onTemplateChange}
                customization={customization}
                onCustomizationChange={onCustomizationChange}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}