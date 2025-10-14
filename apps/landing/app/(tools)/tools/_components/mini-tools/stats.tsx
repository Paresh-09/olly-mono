import { FC } from 'react'

interface StatsProps {
  stats: {
    words: number
    characters: number
    sentences: number
    readingTime: number
  }
}

export const Stats: FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatItem label="Words" value={stats.words} />
      <StatItem label="Characters" value={stats.characters} />
      <StatItem label="Sentences" value={stats.sentences} />
      <StatItem label="Reading Time" value={stats.readingTime} unit="min" />
    </div>
  )
}

const StatItem: FC<{
  label: string
  value: number
  unit?: string
}> = ({ label, value, unit }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <div className="text-2xl font-bold">
      {value}
      {unit && <span className="text-sm ml-1">{unit}</span>}
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
)