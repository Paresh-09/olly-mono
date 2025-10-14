import { FC, ReactNode } from 'react'

interface ToolPageLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export const ToolPageLayout: FC<ToolPageLayoutProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </header>
      <main>{children}</main>
    </div>
  )
}