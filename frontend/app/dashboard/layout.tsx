'use client';

import { AuthProvider } from '@/components/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}