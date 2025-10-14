'use client'

import { CSSProperties, ReactNode } from 'react'
import { Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import { FormData, CustomizationOptions, TemplateType } from './sign-generator'

interface SignaturePreviewProps {
  formData: FormData
  template: TemplateType
  customization: CustomizationOptions
}

export const SignaturePreview = ({ formData, template, customization }: SignaturePreviewProps) => {
  // Function to get font size in pixels based on the selected size
  const getFontSize = (baseSize: number): number => {
    switch (customization.fontSize) {
      case 'small':
        return baseSize - 2;
      case 'large':
        return baseSize + 2;
      default: // medium
        return baseSize;
    }
  }

  // Get social icons with appropriate styling
  const getSocialIcons = (): ReactNode[] => {
    const socialLinks: ReactNode[] = []
    const iconSize = 16
    const iconColor = customization.primaryColor
    
    if (formData.socials.linkedin) {
      socialLinks.push(
        <a href={formData.socials.linkedin} key="linkedin" target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
          <Linkedin size={iconSize} color={iconColor} />
        </a>
      )
    }
    
    if (formData.socials.twitter) {
      socialLinks.push(
        <a href={formData.socials.twitter} key="twitter" target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
          <Twitter size={iconSize} color={iconColor} />
        </a>
      )
    }
    
    if (formData.socials.facebook) {
      socialLinks.push(
        <a href={formData.socials.facebook} key="facebook" target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
          <Facebook size={iconSize} color={iconColor} />
        </a>
      )
    }
    
    if (formData.socials.instagram) {
      socialLinks.push(
        <a href={formData.socials.instagram} key="instagram" target="_blank" rel="noopener noreferrer" style={{ marginRight: '8px' }}>
          <Instagram size={iconSize} color={iconColor} />
        </a>
      )
    }
    
    return socialLinks
  }

  // Templates - Render different layouts based on selected template
  const renderTemplate = (): ReactNode => {
    const commonStyles: CSSProperties = {
      fontFamily: customization.fontFamily,
      color: '#333333'
    }
    
    switch (template) {
      case 'minimal':
        return renderMinimalTemplate(commonStyles)
      case 'creative':
        return renderCreativeTemplate(commonStyles)
      case 'classic':
        return renderClassicTemplate(commonStyles)
      case 'professional':
      default:
        return renderProfessionalTemplate(commonStyles)
    }
  }

  // Professional template
  const renderProfessionalTemplate = (styles: CSSProperties): ReactNode => (
    <table cellPadding="0" cellSpacing="0" style={{ ...styles, borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          {customization.includePhoto && formData.photo && (
            <td valign="top" style={{ paddingRight: '15px' }}>
              <img 
                src={formData.photo} 
                alt={formData.fullName} 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  objectFit: 'cover' 
                }} 
              />
            </td>
          )}
          
          <td valign="top">
            <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td>
                    <h2 style={{ 
                      margin: '0 0 5px 0', 
                      fontSize: `${getFontSize(18)}px`, 
                      color: customization.primaryColor, 
                      fontWeight: 600 
                    }}>
                      {formData.fullName || 'Your Name'}
                    </h2>
                  </td>
                </tr>
                
                {formData.jobTitle && (
                  <tr>
                    <td>
                      <p style={{ 
                        margin: '0 0 10px 0', 
                        fontSize: `${getFontSize(14)}px`, 
                        color: '#555555' 
                      }}>
                        {formData.jobTitle}{formData.company ? ` at ${formData.company}` : ''}
                      </p>
                    </td>
                  </tr>
                )}
                
                <tr>
                  <td>
                    <table cellPadding="2" cellSpacing="0">
                      <tbody>
                        {formData.email && (
                          <tr>
                            <td>
                              <a 
                                href={`mailto:${formData.email}`} 
                                style={{ 
                                  color: customization.primaryColor, 
                                  textDecoration: 'none',
                                  fontSize: `${getFontSize(14)}px`,
                                }}
                              >
                                {formData.email}
                              </a>
                            </td>
                          </tr>
                        )}
                        
                        {formData.phone && (
                          <tr>
                            <td style={{ fontSize: `${getFontSize(14)}px` }}>
                              {formData.phone}
                            </td>
                          </tr>
                        )}
                        
                        {formData.website && (
                          <tr>
                            <td>
                              <a 
                                href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  color: customization.primaryColor, 
                                  textDecoration: 'none',
                                  fontSize: `${getFontSize(14)}px`,
                                }}
                              >
                                {formData.website.replace(/^https?:\/\//i, '')}
                              </a>
                            </td>
                          </tr>
                        )}
                        
                        {formData.address && (
                          <tr>
                            <td style={{ fontSize: `${getFontSize(14)}px` }}>
                              {formData.address}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                
                {customization.includeSocials && (
                  <tr>
                    <td style={{ paddingTop: '10px' }}>
                      <div style={{ display: 'flex' }}>
                        {getSocialIcons()}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </td>
          
          {customization.includeLogo && formData.logo && (
            <td valign="top" style={{ paddingLeft: '15px' }}>
              <img 
                src={formData.logo} 
                alt="Company Logo" 
                style={{ 
                  maxWidth: '120px',
                  maxHeight: '60px',
                  objectFit: 'contain'
                }} 
              />
            </td>
          )}
        </tr>
      </tbody>
    </table>
  )

  // Minimal template
  const renderMinimalTemplate = (styles: CSSProperties): ReactNode => (
    <table cellPadding="0" cellSpacing="0" style={{ ...styles, borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td>
            <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td>
                    <h2 style={{ 
                      margin: '0 0 5px 0', 
                      fontSize: `${getFontSize(18)}px`, 
                      color: customization.primaryColor, 
                      fontWeight: 600 
                    }}>
                      {formData.fullName || 'Your Name'}
                    </h2>
                  </td>
                </tr>
                
                {formData.jobTitle && (
                  <tr>
                    <td>
                      <p style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: `${getFontSize(14)}px`, 
                        color: '#555555' 
                      }}>
                        {formData.jobTitle}{formData.company ? ` · ${formData.company}` : ''}
                      </p>
                    </td>
                  </tr>
                )}
                
                <tr>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '12px',
                      fontSize: `${getFontSize(14)}px`,
                    }}>
                      {formData.email && (
                        <a 
                          href={`mailto:${formData.email}`} 
                          style={{ 
                            color: customization.primaryColor, 
                            textDecoration: 'none',
                          }}
                        >
                          {formData.email}
                        </a>
                      )}
                      
                      {formData.phone && (
                        <span style={{ color: '#555555' }}>
                          {formData.phone}
                        </span>
                      )}
                      
                      {formData.website && (
                        <a 
                          href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            color: customization.primaryColor, 
                            textDecoration: 'none',
                          }}
                        >
                          {formData.website.replace(/^https?:\/\//i, '')}
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
                
                {customization.includeSocials && (
                  <tr>
                    <td style={{ paddingTop: '15px' }}>
                      <div style={{ display: 'flex' }}>
                        {getSocialIcons()}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </td>
          
          {customization.includePhoto && formData.photo && (
            <td valign="top" style={{ paddingLeft: '20px' }}>
              <img 
                src={formData.photo} 
                alt={formData.fullName} 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%',
                  objectFit: 'cover' 
                }} 
              />
            </td>
          )}
        </tr>
        
        {customization.includeLogo && formData.logo && (
          <tr>
            <td colSpan={customization.includePhoto && formData.photo ? 2 : 1} style={{ paddingTop: '15px' }}>
              <img 
                src={formData.logo} 
                alt="Company Logo" 
                style={{ 
                  maxHeight: '40px',
                  objectFit: 'contain'
                }} 
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )

  // Creative template
  const renderCreativeTemplate = (styles: CSSProperties): ReactNode => (
    <table cellPadding="0" cellSpacing="0" style={{ ...styles, borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td style={{ 
            backgroundColor: customization.primaryColor, 
            padding: '20px',
            color: '#ffffff',
            borderRadius: '8px 0 0 8px'
          }}>
            {customization.includePhoto && formData.photo && (
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <img 
                  src={formData.photo} 
                  alt={formData.fullName} 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ffffff'
                  }} 
                />
              </div>
            )}
            
            <h2 style={{ 
              margin: '0 0 5px 0', 
              fontSize: `${getFontSize(20)}px`, 
              color: '#ffffff', 
              fontWeight: 600,
              textAlign: 'center'
            }}>
              {formData.fullName || 'Your Name'}
            </h2>
            
            {formData.jobTitle && (
              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: `${getFontSize(14)}px`, 
                color: '#ffffff', 
                opacity: 0.9,
                textAlign: 'center'
              }}>
                {formData.jobTitle}
              </p>
            )}
            
            {formData.company && (
              <p style={{ 
                margin: '0 0 15px 0', 
                fontSize: `${getFontSize(14)}px`, 
                color: '#ffffff', 
                opacity: 0.9,
                textAlign: 'center',
                fontWeight: 600
              }}>
                {formData.company}
              </p>
            )}
            
            {customization.includeSocials && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '15px' 
              }}>
                {getSocialIcons().map((icon, index) => (
                  <div key={index} style={{ margin: '0 5px' }}>
                    {icon}
                  </div>
                ))}
              </div>
            )}
          </td>
          
          <td style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '20px',
            borderRadius: '0 8px 8px 0'
          }}>
            <table cellPadding="0" cellSpacing="0">
              <tbody>
                {formData.email && (
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: customization.primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          @
                        </span>
                        <a 
                          href={`mailto:${formData.email}`} 
                          style={{ 
                            color: '#333333', 
                            textDecoration: 'none',
                            fontSize: `${getFontSize(14)}px`,
                          }}
                        >
                          {formData.email}
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
                
                {formData.phone && (
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: customization.primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          ☎
                        </span>
                        <span style={{ fontSize: `${getFontSize(14)}px` }}>
                          {formData.phone}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {formData.website && (
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: customization.primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          🌐
                        </span>
                        <a 
                          href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            color: '#333333', 
                            textDecoration: 'none',
                            fontSize: `${getFontSize(14)}px`,
                          }}
                        >
                          {formData.website.replace(/^https?:\/\//i, '')}
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
                
                {formData.address && (
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: customization.primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          📍
                        </span>
                        <span style={{ fontSize: `${getFontSize(14)}px` }}>
                          {formData.address}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {customization.includeLogo && formData.logo && (
              <div style={{ marginTop: '15px' }}>
                <img 
                  src={formData.logo} 
                  alt="Company Logo" 
                  style={{ 
                    maxWidth: '120px',
                    maxHeight: '60px',
                    objectFit: 'contain'
                  }} 
                />
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  )

  // Classic template
  const renderClassicTemplate = (styles: CSSProperties): ReactNode => (
    <table cellPadding="0" cellSpacing="0" style={{ ...styles, borderCollapse: 'collapse', borderTop: `3px solid ${customization.primaryColor}` }}>
      <tbody>
        <tr>
          <td style={{ padding: '15px 0' }}>
            <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  {customization.includePhoto && formData.photo && (
                    <td valign="middle" style={{ paddingRight: '15px', width: '80px' }}>
                      <img 
                        src={formData.photo} 
                        alt={formData.fullName} 
                        style={{ 
                          width: '70px', 
                          height: '70px', 
                          borderRadius: '0',
                          objectFit: 'cover',
                          border: `1px solid ${customization.primaryColor}`
                        }} 
                      />
                    </td>
                  )}
                  
                  <td valign="middle">
                    <h2 style={{ 
                      margin: '0', 
                      fontSize: `${getFontSize(20)}px`, 
                      color: customization.primaryColor, 
                      fontWeight: 600 
                    }}>
                      {formData.fullName || 'Your Name'}
                    </h2>
                    
                    {formData.jobTitle && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        fontSize: `${getFontSize(14)}px`, 
                        color: '#555555',
                        fontStyle: 'italic'
                      }}>
                        {formData.jobTitle}
                      </p>
                    )}
                    
                    {formData.company && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        fontSize: `${getFontSize(14)}px`, 
                        color: '#555555',
                        fontWeight: 600
                      }}>
                        {formData.company}
                      </p>
                    )}
                  </td>
                  
                  {customization.includeLogo && formData.logo && (
                    <td valign="middle" style={{ width: '100px', textAlign: 'right' }}>
                      <img 
                        src={formData.logo} 
                        alt="Company Logo" 
                        style={{ 
                          maxWidth: '100px',
                          maxHeight: '50px',
                          objectFit: 'contain'
                        }} 
                      />
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        
        <tr>
          <td style={{ borderTop: '1px solid #dddddd', padding: '10px 0' }}>
            <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
                    <table cellPadding="0" cellSpacing="0">
                      <tbody>
                        <tr>
                          {formData.email && (
                            <td style={{ paddingRight: '15px' }}>
                              <a 
                                href={`mailto:${formData.email}`} 
                                style={{ 
                                  color: customization.primaryColor, 
                                  textDecoration: 'none',
                                  fontSize: `${getFontSize(14)}px`,
                                  fontFamily: '"Times New Roman", Times, serif'
                                }}
                              >
                                {formData.email}
                              </a>
                            </td>
                          )}
                          
                          {formData.phone && (
                            <td style={{ paddingRight: '15px' }}>
                              <span style={{ 
                                fontSize: `${getFontSize(14)}px`,
                                color: '#555555',
                                fontFamily: '"Times New Roman", Times, serif'
                              }}>
                                {formData.phone}
                              </span>
                            </td>
                          )}
                          
                          {formData.website && (
                            <td style={{ paddingRight: '15px' }}>
                              <a 
                                href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  color: customization.primaryColor, 
                                  textDecoration: 'none',
                                  fontSize: `${getFontSize(14)}px`,
                                  fontFamily: '"Times New Roman", Times, serif'
                                }}
                              >
                                {formData.website.replace(/^https?:\/\//i, '')}
                              </a>
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  
                  {customization.includeSocials && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {getSocialIcons()}
                      </div>
                    </td>
                  )}
                </tr>
                
                {formData.address && (
                  <tr>
                    <td colSpan={customization.includeSocials ? 2 : 1} style={{ paddingTop: '5px' }}>
                      <span style={{ 
                        fontSize: `${getFontSize(14)}px`,
                        color: '#555555',
                        fontStyle: 'italic',
                        fontFamily: '"Times New Roman", Times, serif'
                      }}>
                        {formData.address}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )

  return (
    <div className="p-4 border border-gray-200 rounded-md bg-white">
      <div className="mb-4 text-xs text-gray-500">
        This is how your signature will appear in email clients
      </div>
      <div className="overflow-auto">
        {renderTemplate()}
      </div>
    </div>
  )
}