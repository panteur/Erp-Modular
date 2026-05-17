'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { useSidebar } from '@/components/context/SidebarContext';

const menuItems = [
  { name: 'Seguridad', href: '/dashboard/security', icon: '🛡️' },
  { name: 'Inventario', href: '/dashboard/inventory', icon: '📦' },
  { name: 'Configuración', href: '/dashboard/settings', icon: '⚙️' },
];

const subItems: Record<string, { name: string; href: string; icon: string }[]> = {
  Seguridad: [
    { name: 'Usuarios', href: '/dashboard/security/users', icon: '👥' },
    { name: 'Roles', href: '/dashboard/security/roles', icon: '🔑' },
  ],
  Inventario: [
    { name: 'Productos', href: '/dashboard/inventory/products', icon: '📦' },
    { name: 'Servicios', href: '/dashboard/inventory/services', icon: '🔧' },
    { name: 'Stock', href: '/dashboard/inventory/stock', icon: '📊' },
    { name: 'Categorías', href: '/dashboard/inventory/categories', icon: '🏷️' },
  ],
  Configuración: [
    { name: 'Módulos', href: '/dashboard/settings/modules', icon: '📦' },
    { name: 'Sucursales', href: '/dashboard/settings/branches', icon: '🏢' },
    { name: 'Empresa', href: '/dashboard/settings/company', icon: '🏛️' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center border-b border-gray-700 ${isCollapsed ? 'justify-center p-3' : 'p-4'}`}>
        {isCollapsed ? (
          <span className="text-lg font-bold">E</span>
        ) : (
          <>
            <h1 className="text-lg font-bold truncate">ERP Modular</h1>
            <p className="text-[10px] text-gray-400 truncate">{user?.company?.name || ''}</p>
          </>
        )}
      </div>

      <button
        onClick={toggle}
        className="absolute -right-3 top-12 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border border-gray-700 hover:bg-gray-700 z-10"
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const children = subItems[item.name] || [];
          const hasActiveChild = children.some(c => pathname === c.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive || hasActiveChild ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>

              {!isCollapsed && (isActive || hasActiveChild) && children.length > 0 && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        pathname === child.href
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-sm shrink-0">{child.icon}</span>
                      <span className="truncate">{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {isCollapsed ? (
        <div className="p-3 border-t border-gray-700 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
            {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium shrink-0">
              {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.profile?.first_name} {user?.profile?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.role?.name}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
