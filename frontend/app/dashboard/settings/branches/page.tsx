'use client';

import { useState, useEffect } from 'react';
import { branchesAPI } from '@/lib/api';
import { Button, Input, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';
import { useAuth } from '@/components/context/AuthContext';

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  is_active: boolean;
  company: { id: number; name: string };
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const res = await branchesAPI.getAll({ company_id: user?.company?.id?.toString() || '' });
      setBranches(res.branches);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchesAPI.update(editingBranch.id, formData);
      } else {
        await branchesAPI.create(formData);
      }
      setIsModalOpen(false);
      loadBranches();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code || '',
      address: branch.address || '',
      phone: branch.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    try {
      await branchesAPI.delete(id);
      loadBranches();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setEditingBranch(null);
    setFormData({ name: '', code: '', address: '', phone: '' });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
        <Button onClick={openCreateModal}>+ Nueva Sucursal</Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'Código', 'Dirección', 'Teléfono', 'Estado', 'Acciones']}>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell>{branch.code || '-'}</TableCell>
              <TableCell>{branch.address || '-'}</TableCell>
              <TableCell>{branch.phone || '-'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  branch.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {branch.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingBranch ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Código"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="SUC001"
          />
          <Input
            label="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}