'use client';

import { useAuth } from '@/components/context/AuthContext';
import { useSidebar } from '@/components/context/SidebarContext';
import NotificationsBell from '@/components/ui/NotificationsBell';

function Hamburger() {
  return (
    <div className="relative w-5 h-4">
      <span className="absolute left-0 top-0 block h-0.5 w-full bg-gray-600 rounded" />
      <span className="absolute left-0 top-1.5 block h-0.5 w-full bg-gray-600 rounded" />
      <span className="absolute left-0 bottom-0 block h-0.5 w-full bg-gray-600 rounded" />
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <Hamburger />
          </button>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            Bienvenido, {user?.profile?.first_name || 'Usuario'}
          </h2>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <NotificationsBell />
          <div className="hidden sm:block text-right">
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.role?.name}</p>
          </div>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
