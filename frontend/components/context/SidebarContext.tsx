'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggle: () => {},
  isMobileOpen: false,
  toggleMobile: () => {},
  closeMobile: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsCollapsed(localStorage.getItem('sidebar_collapsed') === 'true');
  }, []);

  const toggle = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (mounted) localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobile = () => setIsMobileOpen(prev => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, isMobileOpen, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
