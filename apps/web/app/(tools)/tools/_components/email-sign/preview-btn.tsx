'use client'

import { FormData, CustomizationOptions, TemplateType } from './sign-generator'
import { useState } from 'react'

interface PreviewButtonProps {
  formData: FormData
  template: TemplateType
  customization: CustomizationOptions
}

export const SignaturePreviewButton = ({ 
  formData, 
  template, 
  customization 
}: PreviewButtonProps) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  
  // Function to simulate how the signature would look in a real email
  const showEmailPreview = () => {
    setIsPreviewVisible(true)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsPreviewVisible(false)
    }, 5000)
  }
  
  return (
    <div className="mt-4">
      <button
        onClick={showEmailPreview}
        className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium flex items-center justify-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1.5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        See in Email Context
      </button>
      
      {/* Popup preview of the signature in an email context */}
      {isPreviewVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 animate-fade-in">
            <div className="border border-gray-200 rounded p-4" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-gray-500">To: jane@example.com</div>
                  </div>
                  <div className="text-sm text-gray-500">Today, 2:30 PM</div>
                </div>
                <div className="font-medium mb-1">Re: Meeting follow-up</div>
              </div>
              
              <div className="text-gray-800 mb-6">
                <p>Hi Jane,</p>
                <p className="my-2">Thank you for your time today. I'll send over those documents we discussed by the end of the week.</p>
                <p>Best regards,</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div id="email-signature">
                  {/* Here we would actually render the SignaturePreview component */}
                  <div className="text-center py-10 text-gray-500">
                    Your email signature would appear here
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Preview will close automatically in a few seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
