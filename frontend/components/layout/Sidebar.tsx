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
      <span className={`absolute left-0 top-0 block h-0.5 w-full bg-current rounded-full transition-all duration-200 ${open ? 'top-1.5 rotate-45' : ''}`} />
      <span className={`absolute left-0 top-1.5 block h-0.5 w-full bg-current rounded-full transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
      <span className={`absolute left-0 bottom-0 block h-0.5 w-full bg-current rounded-full transition-all duration-200 ${open ? 'bottom-1.5 -rotate-45' : ''}`} />
    </div>
  );
}

function NavItem({ item, isCollapsed, pathname, onClick }: {
  item: typeof menuItems[0];
  isCollapsed: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const children = subItems[item.name] || [];
  const isActive = pathname.startsWith(item.href);
  const hasActiveChild = children.some(c => pathname === c.href);

  return (
    <div>
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
          isActive || hasActiveChild
            ? 'bg-accent-600/10 text-accent-500'
            : 'text-slate-300 hover:text-white hover:bg-white/5'
        } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? item.name : undefined}
      >
        <span className="text-lg shrink-0">{item.icon}</span>
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </Link>

      {!isCollapsed && (isActive || hasActiveChild) && children.length > 0 && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
          {children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                pathname === child.href
                  ? 'text-accent-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
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
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center border-b border-white/5 shrink-0 ${isCollapsed ? 'justify-center p-3' : 'p-4'}`}>
        <button
          onClick={toggle}
          className="text-slate-400 hover:text-white transition-colors shrink-0 p-1 rounded-lg hover:bg-white/5"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-label="Toggle sidebar"
        >
          <Hamburger open={!isCollapsed} />
        </button>
        {!isCollapsed && (
          <div className="ml-3 min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight">ERP Modular</h1>
            <p className="text-[10px] text-slate-500 truncate font-medium tracking-wide uppercase">{user?.company?.name || ''}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
        ))}
      </nav>

      {isCollapsed ? (
        <div className="p-3 border-t border-white/5 flex justify-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-accent-600/20 flex items-center justify-center text-xs font-bold text-accent-400">
            {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-600/20 flex items-center justify-center text-sm font-bold text-accent-400 shrink-0">
              {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.profile?.first_name} {user?.profile?.last_name}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">{user?.role?.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={`fixed left-0 top-0 h-full bg-sidebar text-white flex flex-col transition-all duration-300 z-30 hidden md:flex border-r border-white/5 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={closeMobile} />
      )}

      {/* Mobile */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-sidebar text-white flex flex-col transition-transform duration-300 z-50 md:hidden border-r border-white/5 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center p-4 border-b border-white/5 shrink-0">
          <button onClick={closeMobile} className="text-slate-400 hover:text-white transition-colors mr-3 p-1 rounded-lg hover:bg-white/5" aria-label="Close sidebar">
            <Hamburger open />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight">ERP Modular</h1>
            <p className="text-[10px] text-slate-500 truncate font-medium tracking-wide uppercase">{user?.company?.name || ''}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={false} pathname={pathname} onClick={closeMobile} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-600/20 flex items-center justify-center text-sm font-bold text-accent-400 shrink-0">
              {user?.profile?.first_name?.[0]}{user?.profile?.last_name?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.profile?.first_name} {user?.profile?.last_name}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">{user?.role?.name}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
