import { Metadata } from 'next';
import { LeadsDashboard } from './components/leads-dashboard';

export const metadata: Metadata = {
  title: 'Leads Dashboard - Apollo Lead Finder',
  description: 'Manage and find leads using the Apollo API',
};

export default function LeadsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leads Dashboard</h1>
        <p className="text-gray-600">
          Find and manage leads from LinkedIn profiles
        </p>
      </div>
      
      <LeadsDashboard />
    </div>
  );
} 