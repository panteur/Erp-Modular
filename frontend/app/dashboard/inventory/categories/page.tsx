'use client';

import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';

interface Category {
  id: number;
  name: string;
  description: string;
  type: 'product' | 'service' | 'both';
  parent_id: number | null;
  parent: { id: number; name: string } | null;
  children: { id: number; name: string }[];
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parents, setParents] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: '', description: '', type: 'both', parent_id: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [catRes, parentRes] = await Promise.all([
        categoriesAPI.getAll(),
        categoriesAPI.getParents(),
      ]);
      setCategories(catRes.categories);
      setParents(parentRes.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', description: '', type: 'both', parent_id: '' });
  };

  const openCreate = () => { resetForm(); setIsModalOpen(true); };
  const handleClose = () => { resetForm(); setIsModalOpen(false); };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      type: cat.type,
      parent_id: cat.parent_id?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('El nombre es requerido');

    const data: Record<string, any> = {
      name: form.name,
      description: form.description,
      type: form.type,
    };
    if (form.parent_id) data.parent_id = parseInt(form.parent_id);

    try {
      if (editing) {
        await categoriesAPI.update(editing.id, data);
      } else {
        await categoriesAPI.create(data);
      }
      handleClose();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar esta categoría?')) return;
    try {
      await categoriesAPI.delete(id);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      product: 'bg-blue-100 text-blue-800',
      service: 'bg-purple-100 text-purple-800',
      both: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      product: 'Producto',
      service: 'Servicio',
      both: 'Ambos',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[type] || ''}`}>{labels[type] || type}</span>;
  };

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las categorías y subcategorías de productos y servicios</p>
        </div>
        <Button onClick={openCreate}>+ Nueva Categoría</Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'Tipo', 'Categoría Padre', 'Subcategorías', 'Estado', 'Acciones']}>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell>{typeBadge(cat.type)}</TableCell>
              <TableCell>{cat.parent?.name || <span className="text-gray-400">—</span>}</TableCell>
              <TableCell>
                {cat.children.length > 0
                  ? <span className="text-sm">{cat.children.map(c => c.name).join(', ')}</span>
                  : <span className="text-gray-400">—</span>}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cat.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 text-sm">Desactivar</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
        footer={<><Button variant="outline" onClick={handleClose}>Cancelar</Button><Button onClick={handleSubmit}>{editing ? 'Actualizar' : 'Crear'}</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'both', label: 'Productos y Servicios' },
              { value: 'product', label: 'Solo Productos' },
              { value: 'service', label: 'Solo Servicios' },
            ]} />
          <Select label="Categoría Padre" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            options={[
              { value: '', label: 'Sin padre (categoría principal)' },
              ...parents
                .filter(p => !editing || p.id !== editing.id)
                .map((p) => ({ value: p.id.toString(), label: p.name }))
            ]} />
          <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}
