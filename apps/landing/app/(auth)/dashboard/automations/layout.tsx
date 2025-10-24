import { ReactNode } from 'react'

interface AutomationsLayoutProps {
  children: ReactNode
}

export default function AutomationsLayout({ children }: AutomationsLayoutProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  )
} 