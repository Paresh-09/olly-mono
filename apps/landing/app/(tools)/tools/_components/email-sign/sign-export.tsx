'use client'

import { useState, useRef } from 'react'
import { FormData, CustomizationOptions, TemplateType } from './sign-generator'

interface SignatureExportProps {
  formData: FormData
  template: TemplateType
  customization: CustomizationOptions
}

export const SignatureExport = ({ formData, template, customization }: SignatureExportProps) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'instructions' | 'code'>('instructions')
  const codeRef = useRef<HTMLDivElement>(null)

  // Function to get font size in pixels based on the selected size
  const getFontSizePixels = (baseSize: number): string => {
    switch (customization.fontSize) {
      case 'small':
        return `${baseSize - 2}px`;
      case 'large':
        return `${baseSize + 2}px`;
      default: // medium
        return `${baseSize}px`;
    }
  }

  // Generate HTML code for the signature
  const generateHTML = (): string => {
    // This function should mirror the HTML structure of the SignaturePreview component
    // but return it as a string.
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>`;
    
    // Based on template, generate the appropriate HTML
    switch (template) {
      case 'minimal':
        html += generateMinimalHTML();
        break;
      case 'creative':
        html += generateCreativeHTML();
        break;
      case 'classic':
        html += generateClassicHTML();
        break;
      case 'professional':
      default:
        html += generateProfessionalHTML();
        break;
    }
    
    html += `</body></html>`;
    return html;
  }

  // Helper functions to generate HTML for each template
  const generateProfessionalHTML = (): string => {
    // Create social icons HTML
    const socialIconsHTML = generateSocialIconsHTML();
    
    return `<table cellpadding="0" cellspacing="0" style="font-family: ${customization.fontFamily}; color: #333333; border-collapse: collapse;">
      <tr>
        ${customization.includePhoto && formData.photo ? 
          `<td valign="top" style="padding-right: 15px;">
            <img src="${formData.photo}" alt="${formData.fullName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />
          </td>` 
        : ''}
        
        <td valign="top">
          <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td>
                <h2 style="margin: 0 0 5px 0; font-size: ${getFontSizePixels(18)}; color: ${customization.primaryColor}; font-weight: 600;">
                  ${formData.fullName || 'Your Name'}
                </h2>
              </td>
            </tr>
            
            ${formData.jobTitle ? 
              `<tr>
                <td>
                  <p style="margin: 0 0 10px 0; font-size: ${getFontSizePixels(14)}; color: #555555;">
                    ${formData.jobTitle}${formData.company ? ` at ${formData.company}` : ''}
                  </p>
                </td>
              </tr>` 
            : ''}
            
            <tr>
              <td>
                <table cellpadding="2" cellspacing="0">
                  ${formData.email ? 
                    `<tr>
                      <td>
                        <a href="mailto:${formData.email}" style="color: ${customization.primaryColor}; text-decoration: none; font-size: ${getFontSizePixels(14)};">
                          ${formData.email}
                        </a>
                      </td>
                    </tr>` 
                  : ''}
                  
                  ${formData.phone ? 
                    `<tr>
                      <td style="font-size: ${getFontSizePixels(14)};">
                        ${formData.phone}
                      </td>
                    </tr>` 
                  : ''}
                  
                  ${formData.website ? 
                    `<tr>
                      <td>
                        <a href="${formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}" target="_blank" rel="noopener noreferrer" style="color: ${customization.primaryColor}; text-decoration: none; font-size: ${getFontSizePixels(14)};">
                          ${formData.website.replace(/^https?:\/\//i, '')}
                        </a>
                      </td>
                    </tr>` 
                  : ''}
                  
                  ${formData.address ? 
                    `<tr>
                      <td style="font-size: ${getFontSizePixels(14)};">
                        ${formData.address}
                      </td>
                    </tr>` 
                  : ''}
                </table>
              </td>
            </tr>
            
            ${customization.includeSocials && socialIconsHTML ? 
              `<tr>
                <td style="padding-top: 10px;">
                  <div style="display: flex;">
                    ${socialIconsHTML}
                  </div>
                </td>
              </tr>` 
            : ''}
          </table>
        </td>
        
        ${customization.includeLogo && formData.logo ? 
          `<td valign="top" style="padding-left: 15px;">
            <img src="${formData.logo}" alt="Company Logo" style="max-width: 120px; max-height: 60px; object-fit: contain;" />
          </td>` 
        : ''}
      </tr>
    </table>`;
  }

  // Generate Minimal HTML
  const generateMinimalHTML = (): string => {
    const socialIconsHTML = generateSocialIconsHTML();
    
    return `<table cellpadding="0" cellspacing="0" style="font-family: ${customization.fontFamily}; color: #333333; border-collapse: collapse;">
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td>
                <h2 style="margin: 0 0 5px 0; font-size: ${getFontSizePixels(18)}; color: ${customization.primaryColor}; font-weight: 600;">
                  ${formData.fullName || 'Your Name'}
                </h2>
              </td>
            </tr>
            
            ${formData.jobTitle ? 
              `<tr>
                <td>
                  <p style="margin: 0 0 15px 0; font-size: ${getFontSizePixels(14)}; color: #555555;">
                    ${formData.jobTitle}${formData.company ? ` · ${formData.company}` : ''}
                  </p>
                </td>
              </tr>` 
            : ''}
            
            <tr>
              <td>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: ${getFontSizePixels(14)};">
                  ${formData.email ? 
                    `<a href="mailto:${formData.email}" style="color: ${customization.primaryColor}; text-decoration: none;">
                      ${formData.email}
                    </a>` 
                  : ''}
                  
                  ${formData.phone ? 
                    `<span style="color: #555555;">
                      ${formData.phone}
                    </span>` 
                  : ''}
                  
                  ${formData.website ? 
                    `<a href="${formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}" target="_blank" rel="noopener noreferrer" style="color: ${customization.primaryColor}; text-decoration: none;">
                      ${formData.website.replace(/^https?:\/\//i, '')}
                    </a>` 
                  : ''}
                </div>
              </td>
            </tr>
            
            ${customization.includeSocials && socialIconsHTML ? 
              `<tr>
                <td style="padding-top: 15px;">
                  <div style="display: flex;">
                    ${socialIconsHTML}
                  </div>
                </td>
              </tr>` 
            : ''}
          </table>
        </td>
        
        ${customization.includePhoto && formData.photo ? 
          `<td valign="top" style="padding-left: 20px;">
            <img src="${formData.photo}" alt="${formData.fullName}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover;" />
          </td>` 
        : ''}
      </tr>
      
      ${customization.includeLogo && formData.logo ? 
        `<tr>
          <td colspan="${customization.includePhoto && formData.photo ? 2 : 1}" style="padding-top: 15px;">
            <img src="${formData.logo}" alt="Company Logo" style="max-height: 40px; object-fit: contain;" />
          </td>
        </tr>` 
      : ''}
    </table>`;
  }

  // Generate Creative HTML
  const generateCreativeHTML = (): string => {
    const socialIconsHTML = generateSocialIconsHTML();
    
    return `<table cellpadding="0" cellspacing="0" style="font-family: ${customization.fontFamily}; color: #333333; border-collapse: collapse;">
      <tr>
        <td style="background-color: ${customization.primaryColor}; padding: 20px; color: #ffffff; border-radius: 8px 0 0 8px;">
          ${customization.includePhoto && formData.photo ? 
            `<div style="margin-bottom: 15px; text-align: center;">
              <img src="${formData.photo}" alt="${formData.fullName}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff;" />
            </div>` 
          : ''}
          
          <h2 style="margin: 0 0 5px 0; font-size: ${getFontSizePixels(20)}; color: #ffffff; font-weight: 600; text-align: center;">
            ${formData.fullName || 'Your Name'}
          </h2>
          
          ${formData.jobTitle ? 
            `<p style="margin: 0 0 15px 0; font-size: ${getFontSizePixels(14)}; color: #ffffff; opacity: 0.9; text-align: center;">
              ${formData.jobTitle}
            </p>` 
          : ''}
          
          ${formData.company ? 
            `<p style="margin: 0 0 15px 0; font-size: ${getFontSizePixels(14)}; color: #ffffff; opacity: 0.9; text-align: center; font-weight: 600;">
              ${formData.company}
            </p>` 
          : ''}
          
          ${customization.includeSocials && socialIconsHTML ? 
            `<div style="display: flex; justify-content: center; margin-top: 15px;">
              ${socialIconsHTML.split('</a>').join('</a> ')}
            </div>` 
          : ''}
        </td>
        
        <td style="background-color: #f5f5f5; padding: 20px; border-radius: 0 8px 8px 0;">
          <table cellpadding="0" cellspacing="0">
            <tbody>
              ${formData.email ? 
                `<tr>
                  <td style="padding-bottom: 10px;">
                    <div style="display: flex; align-items: center;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background-color: ${customization.primaryColor}; display: inline-block; text-align: center; margin-right: 10px; font-size: 12px; color: white; line-height: 24px;">@</span>
                      <a href="mailto:${formData.email}" style="color: #333333; text-decoration: none; font-size: ${getFontSizePixels(14)};">
                        ${formData.email}
                      </a>
                    </div>
                  </td>
                </tr>` 
              : ''}
              
              ${formData.phone ? 
                `<tr>
                  <td style="padding-bottom: 10px;">
                    <div style="display: flex; align-items: center;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background-color: ${customization.primaryColor}; display: inline-block; text-align: center; margin-right: 10px; font-size: 12px; color: white; line-height: 24px;">☎</span>
                      <span style="font-size: ${getFontSizePixels(14)};">
                        ${formData.phone}
                      </span>
                    </div>
                  </td>
                </tr>` 
              : ''}
              
              ${formData.website ? 
                `<tr>
                  <td style="padding-bottom: 10px;">
                    <div style="display: flex; align-items: center;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background-color: ${customization.primaryColor}; display: inline-block; text-align: center; margin-right: 10px; font-size: 12px; color: white; line-height: 24px;">🌐</span>
                      <a href="${formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}" target="_blank" rel="noopener noreferrer" style="color: #333333; text-decoration: none; font-size: ${getFontSizePixels(14)};">
                        ${formData.website.replace(/^https?:\/\//i, '')}
                      </a>
                    </div>
                  </td>
                </tr>` 
              : ''}
              
              ${formData.address ? 
                `<tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background-color: ${customization.primaryColor}; display: inline-block; text-align: center; margin-right: 10px; font-size: 12px; color: white; line-height: 24px;">📍</span>
                      <span style="font-size: ${getFontSizePixels(14)};">
                        ${formData.address}
                      </span>
                    </div>
                  </td>
                </tr>` 
              : ''}
            </tbody>
          </table>
          
          ${customization.includeLogo && formData.logo ? 
            `<div style="margin-top: 15px;">
              <img src="${formData.logo}" alt="Company Logo" style="max-width: 120px; max-height: 60px; object-fit: contain;" />
            </div>` 
          : ''}
        </td>
      </tr>
    </table>`;
  }

  // Generate Classic HTML
  const generateClassicHTML = (): string => {
    const socialIconsHTML = generateSocialIconsHTML();
    
    return `<table cellpadding="0" cellspacing="0" style="font-family: ${customization.fontFamily}; color: #333333; border-collapse: collapse; border-top: 3px solid ${customization.primaryColor};">
      <tr>
        <td style="padding: 15px 0;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              ${customization.includePhoto && formData.photo ? 
                `<td valign="middle" style="padding-right: 15px; width: 80px;">
                  <img src="${formData.photo}" alt="${formData.fullName}" style="width: 70px; height: 70px; border-radius: 0; object-fit: cover; border: 1px solid ${customization.primaryColor};" />
                </td>` 
              : ''}
              
              <td valign="middle">
                <h2 style="margin: 0; font-size: ${getFontSizePixels(20)}; color: ${customization.primaryColor}; font-weight: 600;">
                  ${formData.fullName || 'Your Name'}
                </h2>
                
                ${formData.jobTitle ? 
                  `<p style="margin: 2px 0 0 0; font-size: ${getFontSizePixels(14)}; color: #555555; font-style: italic;">
                    ${formData.jobTitle}
                  </p>` 
                : ''}
                
                ${formData.company ? 
                  `<p style="margin: 2px 0 0 0; font-size: ${getFontSizePixels(14)}; color: #555555; font-weight: 600;">
                    ${formData.company}
                  </p>` 
                : ''}
              </td>
              
              ${customization.includeLogo && formData.logo ? 
                `<td valign="middle" style="width: 100px; text-align: right;">
                  <img src="${formData.logo}" alt="Company Logo" style="max-width: 100px; max-height: 50px; object-fit: contain;" />
                </td>` 
              : ''}
            </tr>
          </table>
        </td>
      </tr>
      
      <tr>
        <td style="border-top: 1px solid #dddddd; padding: 10px 0;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    ${formData.email ? 
                      `<td style="padding-right: 15px;">
                        <a href="mailto:${formData.email}" style="color: ${customization.primaryColor}; text-decoration: none; font-size: ${getFontSizePixels(14)}; font-family: 'Times New Roman', Times, serif;">
                          ${formData.email}
                        </a>
                      </td>` 
                    : ''}
                    
                    ${formData.phone ? 
                      `<td style="padding-right: 15px;">
                        <span style="font-size: ${getFontSizePixels(14)}; color: #555555; font-family: 'Times New Roman', Times, serif;">
                          ${formData.phone}
                        </span>
                      </td>` 
                    : ''}
                    
                    ${formData.website ? 
                      `<td style="padding-right: 15px;">
                        <a href="${formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}" target="_blank" rel="noopener noreferrer" style="color: ${customization.primaryColor}; text-decoration: none; font-size: ${getFontSizePixels(14)}; font-family: 'Times New Roman', Times, serif;">
                          ${formData.website.replace(/^https?:\/\//i, '')}
                        </a>
                      </td>` 
                    : ''}
                  </tr>
                </table>
              </td>
              
              ${customization.includeSocials && socialIconsHTML ? 
                `<td style="text-align: right;">
                  <div style="display: flex; justify-content: flex-end;">
                    ${socialIconsHTML}
                  </div>
                </td>` 
              : ''}
            </tr>
            
            ${formData.address ? 
              `<tr>
                <td colspan="${customization.includeSocials ? 2 : 1}" style="padding-top: 5px;">
                  <span style="font-size: ${getFontSizePixels(14)}; color: #555555; font-style: italic; font-family: 'Times New Roman', Times, serif;">
                    ${formData.address}
                  </span>
                </td>
              </tr>` 
            : ''}
          </table>
        </td>
      </tr>
    </table>`;
  }

  // Generate social icons HTML
  const generateSocialIconsHTML = (): string => {
    const iconSize = 16;
    let socialIcons = '';
    
    // Use inline SVG for social icons instead of Lucide components
    if (formData.socials.linkedin) {
      socialIcons += `<a href="${formData.socials.linkedin}" target="_blank" rel="noopener noreferrer" style="margin-right: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${customization.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      </a>`;
    }
    
    if (formData.socials.twitter) {
      socialIcons += `<a href="${formData.socials.twitter}" target="_blank" rel="noopener noreferrer" style="margin-right: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${customization.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      </a>`;
    }
    
    if (formData.socials.facebook) {
      socialIcons += `<a href="${formData.socials.facebook}" target="_blank" rel="noopener noreferrer" style="margin-right: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${customization.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      </a>`;
    }
    
    if (formData.socials.instagram) {
      socialIcons += `<a href="${formData.socials.instagram}" target="_blank" rel="noopener noreferrer" style="margin-right: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${customization.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </a>`;
    }
    
    return socialIcons;
  }

  // Function to copy HTML code to clipboard
  const copyToClipboard = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }


  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Export Signature</h3>
      
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === 'instructions' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === 'code' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('code')}
          >
            HTML Code
          </button>
        </div>

        
        <button 
          onClick={copyToClipboard}
          className={`w-full py-2 rounded font-medium text-sm ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition-colors`}
        >
          {copied ? 'Copied!' : 'Copy HTML Code'}
        </button>
      </div>
    </div>
  )
}