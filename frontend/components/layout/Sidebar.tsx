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

function Hamburger({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-4">
      <span className={`absolute left-0 top-0 block h-0.5 w-full bg-current rounded transition-all duration-200 ${open ? 'top-1.5 rotate-45' : ''}`} />
      <span className={`absolute left-0 top-1.5 block h-0.5 w-full bg-current rounded transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
      <span className={`absolute left-0 bottom-0 block h-0.5 w-full bg-current rounded transition-all duration-200 ${open ? 'bottom-1.5 -rotate-45' : ''}`} />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center border-b border-gray-700 shrink-0 ${isCollapsed ? 'justify-center p-3' : 'p-4'}`}>
        <button
          onClick={toggle}
          className="text-gray-300 hover:text-white transition-colors shrink-0"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-label="Toggle sidebar"
        >
          <Hamburger open={!isCollapsed} />
        </button>
        {!isCollapsed && (
          <div className="ml-3 min-w-0">
            <h1 className="text-sm font-bold truncate">ERP Modular</h1>
            <p className="text-[10px] text-gray-400 truncate">{user?.company?.name || ''}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const children = subItems[item.name] || [];
          const hasActiveChild = children.some(c => pathname === c.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={closeMobile}
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
                      onClick={closeMobile}
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
        <div className="p-3 border-t border-gray-700 flex justify-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
            {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-700 shrink-0">
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
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white flex flex-col transition-all duration-300 z-30 hidden md:flex ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 z-50 md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center p-4 border-b border-gray-700 shrink-0">
          <button
            onClick={closeMobile}
            className="text-gray-300 hover:text-white transition-colors mr-3"
            aria-label="Close sidebar"
          >
            <Hamburger open />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">ERP Modular</h1>
            <p className="text-[10px] text-gray-400 truncate">{user?.company?.name || ''}</p>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const children = subItems[item.name] || [];
            const hasActiveChild = children.some(c => pathname === c.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive || hasActiveChild ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>

                {(isActive || hasActiveChild) && children.length > 0 && (
                  <div className="ml-2 mt-0.5 space-y-0.5">
                    {children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMobile}
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

        <div className="p-4 border-t border-gray-700 shrink-0">
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
      </aside>
    </>
  );
}
