'use client';

import { useAuth } from '@/components/context/AuthContext';
import { useSidebar } from '@/components/context/SidebarContext';
import NotificationsBell from '@/components/ui/NotificationsBell';

function Hamburger() {
  return (
    <div className="relative w-5 h-4">
      <span className="absolute left-0 top-0 block h-0.5 w-full bg-slate-400 rounded-full" />
      <span className="absolute left-0 top-1.5 block h-0.5 w-full bg-slate-400 rounded-full" />
      <span className="absolute left-0 bottom-0 block h-0.5 w-full bg-slate-400 rounded-full" />
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Hamburger />
          </button>
          <h2 className="text-base lg:text-lg font-semibold text-slate-900">
            Bienvenido,{' '}
            <span className="text-accent-600">{user?.profile?.first_name || 'Usuario'}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <NotificationsBell />
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-700">{user?.email}</p>
            <p className="text-xs text-slate-400">{user?.role?.name}</p>
          </div>
          <button
            onClick={() => logout()}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
