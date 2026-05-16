'use client';

import { useState, useEffect } from 'react';
import { itemsAPI, categoriesAPI } from '@/lib/api';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', category_id: '',
    sale_price: '', cost_price: '', tax_rate: '19',
    unit: 'unidad', stock_min: '0', stock_max: '0',
    description: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [itemsRes, catRes] = await Promise.all([
        itemsAPI.getAll({ type: 'product' }),
        categoriesAPI.getAll({ type: 'product' }),
      ]);
      setItems(itemsRes.items);
      setCategories(catRes.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({ name: '', sku: '', barcode: '', category_id: '', sale_price: '', cost_price: '', tax_rate: '19', unit: 'unidad', stock_min: '0', stock_max: '0', description: '' });
  };

  const openCreate = () => { resetForm(); setIsModalOpen(true); };
  const handleClose = () => { resetForm(); setIsModalOpen(false); };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name, sku: item.sku || '', barcode: item.barcode || '',
      category_id: item.category_id?.toString() || '',
      sale_price: item.sale_price?.toString() || '0',
      cost_price: item.cost_price?.toString() || '0',
      tax_rate: item.tax_rate?.toString() || '19',
      unit: item.unit || 'unidad',
      stock_min: item.stock_min?.toString() || '0',
      stock_max: item.stock_max?.toString() || '0',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('El nombre es requerido');

    const data: Record<string, any> = {
      type: 'product',
      name: form.name,
      sku: form.sku,
      barcode: form.barcode,
      unit: form.unit,
      sale_price: parseFloat(form.sale_price) || 0,
      cost_price: parseFloat(form.cost_price) || 0,
      tax_rate: parseFloat(form.tax_rate) ?? 19,
      stock_min: parseFloat(form.stock_min) || 0,
      stock_max: parseFloat(form.stock_max) || 0,
      description: form.description,
    };
    if (form.category_id) data.category_id = parseInt(form.category_id);

    try {
      if (editingItem) {
        await itemsAPI.update(editingItem.id, data);
      } else {
        await itemsAPI.create(data);
      }
      handleClose();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar este producto?')) return;
    try {
      await itemsAPI.delete(id);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Button onClick={openCreate}>+ Nuevo Producto</Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'SKU', 'Categoría', 'Precio Venta', 'Stock Min', 'Estado', 'Acciones']}>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.sku || '—'}</TableCell>
              <TableCell>{item.category?.name || '—'}</TableCell>
              <TableCell>${parseFloat(item.sale_price).toLocaleString()}</TableCell>
              <TableCell>{item.stock_min}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Desactivar</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingItem ? 'Editar Producto' : 'Nuevo Producto'}
        footer={<><Button variant="outline" onClick={handleClose}>Cancelar</Button><Button onClick={handleSubmit}>{editingItem ? 'Actualizar' : 'Crear'}</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Código de Barras" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoría" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={[{ value: '', label: 'Sin categoría' }, ...categories.map((c) => ({ value: c.id.toString(), label: c.name }))]} />
            <Select label="Unidad" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              options={[{ value: 'unidad', label: 'Unidad' }, { value: 'kg', label: 'Kilogramo' }, { value: 'litro', label: 'Litro' }, { value: 'metro', label: 'Metro' }, { value: 'caja', label: 'Caja' }, { value: 'pack', label: 'Pack' }]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Precio Venta" type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            <Input label="Precio Costo" type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
            <Input label="IVA (%)" type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Mínimo" type="number" value={form.stock_min} onChange={(e) => setForm({ ...form, stock_min: e.target.value })} />
            <Input label="Stock Máximo" type="number" value={form.stock_max} onChange={(e) => setForm({ ...form, stock_max: e.target.value })} />
          </div>
          <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}
