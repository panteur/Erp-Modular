'use client';

import { useAuth } from '@/components/context/AuthContext';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Bienvenido,             {user?.profile?.first_name || 'Usuario'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
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