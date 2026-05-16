'use client';

import { useState, useEffect } from 'react';
import { stockAPI, itemsAPI, branchesAPI } from '@/lib/api';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lowFilter, setLowFilter] = useState(false);

  const [form, setForm] = useState({ item_id: '', branch_id: '', quantity: '' });

  useEffect(() => { loadData(); }, [lowFilter]);

  const loadData = async () => {
    try {
      const [stockRes, prodRes, branchRes] = await Promise.all([
        stockAPI.getAll({ low_stock: lowFilter ? 'true' : '' }),
        itemsAPI.getAll({ type: 'product', is_active: 'true' }),
        branchesAPI.getAll(),
      ]);
      setStock(stockRes.stock);
      setProducts(prodRes.items);
      setBranches(branchRes.branches);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_id || !form.branch_id) return alert('Selecciona producto y sucursal');

    try {
      await stockAPI.adjust({
        item_id: parseInt(form.item_id),
        branch_id: parseInt(form.branch_id),
        quantity: parseFloat(form.quantity) || 0,
      });
      setIsModalOpen(false);
      setForm({ item_id: '', branch_id: '', quantity: '' });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={lowFilter} onChange={(e) => setLowFilter(e.target.checked)} className="w-4 h-4" />
            Solo stock bajo
          </label>
          <Button onClick={() => setIsModalOpen(true)}>+ Ajustar Stock</Button>
        </div>
      </div>

      <Card>
        <Table headers={['Producto', 'SKU', 'Sucursal', 'Cantidad', 'Stock Mín', 'Estado']}>
          {stock.map((s) => (
            <TableRow key={`${s.item_id}-${s.branch_id}`}>
              <TableCell className="font-medium">{s.item.name}</TableCell>
              <TableCell>{s.item.sku || '—'}</TableCell>
              <TableCell>{s.branch.name}</TableCell>
              <TableCell>{parseFloat(s.quantity).toFixed(2)}</TableCell>
              <TableCell>{s.item.stock_min}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(s.quantity) <= parseFloat(s.item.stock_min) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {parseFloat(s.quantity) <= parseFloat(s.item.stock_min) ? 'Stock Bajo' : 'OK'}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {stock.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">Sin registros de stock</TableCell></TableRow>
          )}
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajustar Stock"
        footer={<><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={handleAdjust}>Guardar</Button></>}>
        <form onSubmit={handleAdjust} className="space-y-4">
          <Select label="Producto" value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })}
            options={[{ value: '', label: 'Seleccione producto' }, ...products.map((p) => ({ value: p.id.toString(), label: `${p.name} (${p.sku || 'sin SKU'})` }))]} />
          <Select label="Sucursal" value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            options={[{ value: '', label: 'Seleccione sucursal' }, ...branches.map((b) => ({ value: b.id.toString(), label: b.name }))]} />
          <Input label="Cantidad" type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        </form>
      </Modal>
    </div>
  );
}
