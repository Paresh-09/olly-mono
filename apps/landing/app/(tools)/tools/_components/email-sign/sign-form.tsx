'use client'

import { ChangeEvent } from 'react'
import { FormData } from './sign-generator'

interface SignatureFormProps {
  formData: FormData
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onImageUpload: (type: 'photo' | 'logo', file: File | null) => void
}

export const SignatureForm = ({ formData, onChange, onImageUpload }: SignatureFormProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Your Information</h3>
      
      <div className="space-y-4">
        {/* Personal information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Personal Details</h4>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Marketing Manager"
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Inc."
            />
          </div>
        </div>
        
        {/* Contact information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Contact Information</h4>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (123) 456-7890"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="www.example.com"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Business Ave, New York, NY 10001"
            />
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Social Media</h4>
          
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              name="socials.linkedin"
              value={formData.socials.linkedin}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter / X
            </label>
            <input
              type="url"
              id="twitter"
              name="socials.twitter"
              value={formData.socials.twitter}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/username"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                id="facebook"
                name="socials.facebook"
                value={formData.socials.facebook}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/username"
              />
            </div>
            
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                name="socials.instagram"
                value={formData.socials.instagram}
                onChange={onChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </div>
        
        {/* Images */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Images</h4>
          
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              {formData.photo && (
                <div className="w-16 h-16 relative">
                  <img 
                    src={formData.photo} 
                    alt="Profile" 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>
              )}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={(e) => onImageUpload('photo', e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Recommended size: 100x100px</p>
          </div>
          
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo && (
                <div className="w-32 h-16 relative">
                  <img 
                    src={formData.logo} 
                    alt="Company Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={(e) => onImageUpload('logo', e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Recommended size: 200x100px</p>
          </div>
        </div>
      </div>
    </div>
  )
}