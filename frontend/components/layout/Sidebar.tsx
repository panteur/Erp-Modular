'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';

const menuItems = [
  { name: 'Seguridad', href: '/dashboard/security', icon: 'shield' },
  { name: 'Inventario', href: '/dashboard/inventory', icon: 'package' },
  { name: 'Configuración', href: '/dashboard/settings', icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">ERP Modular</h1>
        <p className="text-sm text-gray-400">{user?.company?.name || 'Empresa'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">{item.icon === 'shield' ? '🛡️' : item.icon === 'package' ? '📦' : '⚙️'}</span>
            <span>{item.name}</span>
          </Link>
        ))}

        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="px-4 text-xs text-gray-500 uppercase">Seguridad</p>
          <Link
            href="/dashboard/security/users"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard/security/users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>👥</span>
            <span>Usuarios</span>
          </Link>
          <Link
            href="/dashboard/security/roles"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard/security/roles'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>🔑</span>
            <span>Roles</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="px-4 text-xs text-gray-500 uppercase">Inventario</p>
          <Link href="/dashboard/inventory/products" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/inventory/products' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>📦</span><span>Productos</span>
          </Link>
          <Link href="/dashboard/inventory/services" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/inventory/services' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>🔧</span><span>Servicios</span>
          </Link>
          <Link href="/dashboard/inventory/stock" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/inventory/stock' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>📊</span><span>Stock</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-700 mt-4">
          <p className="px-4 text-xs text-gray-500 uppercase">Configuración</p>
          <Link
            href="/dashboard/settings/modules"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard/settings/modules'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>📦</span>
            <span>Módulos</span>
          </Link>
          <Link
            href="/dashboard/settings/branches"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard/settings/branches'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>🏢</span>
            <span>Sucursales</span>
          </Link>
          <Link
            href="/dashboard/settings/company"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard/settings/company'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>🏛️</span>
            <span>Empresa</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.profile?.first_name} {user?.profile?.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}