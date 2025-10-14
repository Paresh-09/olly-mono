'use client'

import { ChangeEvent } from 'react'
import { CustomizationOptions, TemplateType } from './sign-generator'

interface SignatureTemplatesProps {
  selectedTemplate: TemplateType
  onSelectTemplate: (template: TemplateType) => void
  customization: CustomizationOptions
  onCustomizationChange: <T extends keyof CustomizationOptions>(
    name: T, 
    value: CustomizationOptions[T]
  ) => void
}

interface TemplateOption {
  id: TemplateType
  name: string
  description: string
}

interface FontOption {
  value: string
  label: string
}

interface FontSizeOption {
  value: 'small' | 'medium' | 'large'
  label: string
}

export const SignatureTemplates = ({ 
  selectedTemplate, 
  onSelectTemplate, 
  customization, 
  onCustomizationChange 
}: SignatureTemplatesProps) => {
  const templates: TemplateOption[] = [
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Clean and professional template with a modern look'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Simple and elegant template with minimal design elements'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Bold template with creative layout and styling'
    },
    { 
      id: 'classic', 
      name: 'Classic', 
      description: 'Traditional layout with formal styling'
    }
  ]

  // Font options
  const fontOptions: FontOption[] = [
    { value: 'Arial, sans-serif', label: 'Arial (Sans-serif)' },
    { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia (Serif)' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: '"Courier New", monospace', label: 'Courier New (Monospace)' }
  ]

  // Font size options
  const fontSizeOptions: FontSizeOption[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCustomizationChange('primaryColor', e.target.value)
  }

  const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onCustomizationChange('fontFamily', e.target.value)
  }

  const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onCustomizationChange('fontSize', e.target.value as 'small' | 'medium' | 'large')
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    const option = id as 'includeSocials' | 'includePhoto' | 'includeLogo'
    onCustomizationChange(option, checked)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Template & Customization</h3>
      
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">Select Template</h4>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => (
              <div 
                key={template.id}
                className={`border rounded-md p-3 cursor-pointer transition ${
                  selectedTemplate === template.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">{template.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Color Customization */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">Color Scheme</h4>
          <div className="flex items-center">
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 w-32">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="primaryColor"
                value={customization.primaryColor}
                onChange={handleColorChange}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={handleColorChange}
                className="p-1.5 text-sm border border-gray-300 rounded w-24"
              />
            </div>
          </div>
        </div>
        
        {/* Typography */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">Typography</h4>
          
          <div className="flex items-center mb-3">
            <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 w-32">
              Font Family
            </label>
            <select
              id="fontFamily"
              value={customization.fontFamily}
              onChange={handleFontFamilyChange}
              className="p-1.5 border border-gray-300 rounded flex-1 text-sm"
            >
              {fontOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 w-32">
              Font Size
            </label>
            <select
              id="fontSize"
              value={customization.fontSize}
              onChange={handleFontSizeChange}
              className="p-1.5 border border-gray-300 rounded flex-1 text-sm"
            >
              {fontSizeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Display Options */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Display Options</h4>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSocials"
                checked={customization.includeSocials}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="includeSocials" className="ml-2 block text-sm text-gray-700">
                Include social media icons
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePhoto"
                checked={customization.includePhoto}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="includePhoto" className="ml-2 block text-sm text-gray-700">
                Show profile photo
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeLogo"
                checked={customization.includeLogo}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="includeLogo" className="ml-2 block text-sm text-gray-700">
                Show company logo
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}