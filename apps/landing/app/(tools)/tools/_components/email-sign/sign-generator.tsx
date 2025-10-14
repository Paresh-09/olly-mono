'use client'

import { useState } from 'react'
import { SignatureForm } from './sign-form'
import { SignaturePreview } from './sign-preview'
import { SignatureTemplates } from './sign-template'
import { SignatureExport } from './sign-export'
import { SignaturePreviewModal } from './sign-preview-modal'


export interface FormData {
  fullName: string
  jobTitle: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  photo: string | null
  logo: string | null
  socials: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
  }
}

export interface CustomizationOptions {
  primaryColor: string
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large'
  includeSocials: boolean
  includePhoto: boolean
  includeLogo: boolean
}

export type TemplateType = 'professional' | 'minimal' | 'creative' | 'classic'



export const EmailSignatureGenerator = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    jobTitle: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    photo: null,
    logo: null,
    socials: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('professional')
  const [customization, setCustomization] = useState<CustomizationOptions>({
    primaryColor: '#0072C6', // Default blue
    fontFamily: 'Arial, sans-serif',
    fontSize: 'medium',
    includeSocials: true,
    includePhoto: true,
    includeLogo: false
  })
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      // Handle nested properties (like socials.linkedin)
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageUpload = (type: 'photo' | 'logo', file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [type]: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCustomizationChange = <T extends keyof CustomizationOptions>(
    name: T, 
    value: CustomizationOptions[T]
  ) => {
    setCustomization(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left side - Fixed Preview */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-lg  ">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <SignaturePreview 
              formData={formData}
              template={selectedTemplate}
              customization={customization}
            />
            
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="mt-4 w-full py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium text-sm"
            >
              Preview and Design
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <SignatureExport 
              formData={formData}
              template={selectedTemplate}
              customization={customization}
            />
          </div>
        </div>
        
        {/* Right side - Form & Templates (Scrollable) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <SignatureForm 
              formData={formData} 
              onChange={handleFormChange}
              onImageUpload={handleImageUpload}
            />
          </div>
        
        </div>
      </div>
      
      {/* Preview Modal */}
      <SignaturePreviewModal
        formData={formData}
        template={selectedTemplate}
        customization={customization}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onTemplateChange={setSelectedTemplate}
        onCustomizationChange={handleCustomizationChange}
      />
    </div>
  )
}