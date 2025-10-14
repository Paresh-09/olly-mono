import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Workshop Group Participant View',
  description: 'Join your workshop group and work together on tasks.',
}

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <Link href="/tools/workshop-group-organizer" className="text-lg font-medium">
            Workshop Group Organizer
          </Link>
          <div className="text-sm text-muted-foreground">Participant View</div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
} 