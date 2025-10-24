import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const { user } = await validateRequest();

    if (!user) {
        redirect('/dashboard');
    }

    if (!user?.isAdmin) {
        redirect('/dashboard');
    }
    
  return (
    <div>
        {children}
    </div>
  )
}

export default AdminLayout