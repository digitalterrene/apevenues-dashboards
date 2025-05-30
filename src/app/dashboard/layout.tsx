import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout';
import React from 'react'

 
export default function Dashboard_Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <> 
    <ProtectedRoute> <DashboardLayout>{children}
        </DashboardLayout>  </ProtectedRoute>
    </>
  );
}
