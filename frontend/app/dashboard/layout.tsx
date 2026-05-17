'use client';

import { AuthProvider } from '@/components/context/AuthContext';
import { SidebarProvider } from '@/components/context/SidebarContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SidebarProvider>
    </AuthProvider>
  );
}