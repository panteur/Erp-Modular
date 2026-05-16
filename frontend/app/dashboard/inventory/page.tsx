'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

const sections = [
  { name: 'Productos', href: '/dashboard/inventory/products', desc: 'Gestión de productos, SKU, precios', icon: '📦' },
  { name: 'Servicios', href: '/dashboard/inventory/services', desc: 'Gestión de servicios y tarifas', icon: '🔧' },
  { name: 'Stock', href: '/dashboard/inventory/stock', desc: 'Inventario por sucursal', icon: '📊' },
];

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventario</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h2 className="text-lg font-semibold text-gray-900">{s.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
