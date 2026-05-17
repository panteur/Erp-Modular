'use client';

import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { typeBadge, renderCategorySelectOptions, buildTree } from '@/lib/categories';
import type { Category } from '@/lib/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: '', description: '', type: 'both', parent_id: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.categories);
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

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

  const tree = buildTree(categories);

  const renderNode = (node: Category, depth: number) => (
    <div key={node.id}>
      <div className={`flex items-center gap-4 py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${depth > 0 ? 'bg-gray-50/50' : ''}`} style={{ paddingLeft: `${16 + depth * 24}px` }}>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${depth > 0 ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
            {depth > 0 && <span className="text-gray-400 mr-2">└</span>}
            {node.name}
            {node.children.length > 0 && (
              <span className="ml-2 text-xs text-gray-400">({node.children.length} subcategorías)</span>
            )}
          </p>
        </div>
        <div className="shrink-0">{typeBadge(node.type)}</div>
        <div className="shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs ${node.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {node.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <div className="shrink-0 flex gap-2">
          <button onClick={() => handleEdit(node)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
          <button onClick={() => handleDelete(node.id)} className="text-red-600 hover:text-red-800 text-sm">Desactivar</button>
        </div>
      </div>
      {node.children.map(child => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona la jerarquía de categorías y subcategorías</p>
        </div>
        <Button onClick={openCreate}>+ Nueva Categoría</Button>
      </div>

      <Card>
        <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex-1">Nombre</div>
          <div className="w-24 text-center">Tipo</div>
          <div className="w-20 text-center">Estado</div>
          <div className="w-28 text-right">Acciones</div>
        </div>
        {tree.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Sin categorías creadas</div>
        ) : (
          tree.map(node => renderNode(node, 0))
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleClose}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
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
              ...renderCategorySelectOptions(categories, editing?.id).map(o => ({ value: o.value, label: o.label })),
            ]} />
          <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}
