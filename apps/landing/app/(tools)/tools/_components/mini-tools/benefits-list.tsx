import { FC } from 'react'
import { Card } from '@repo/ui/components/ui/card'

interface Benefit {
  title: string
  description: string
}

interface BenefitsListProps {
  benefits: Benefit[]
}

export const BenefitsList: FC<BenefitsListProps> = ({ benefits }) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Features & Benefits</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="p-6">
            <h3 className="font-bold mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}