'use client';

import { useState, useEffect } from 'react';
import { rolesAPI } from '@/lib/api';
import { Button, Input, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  is_active: boolean;
  company: { id: number; name: string };
}

const AVAILABLE_PERMISSIONS = ['create', 'read', 'update', 'delete', 'configure'];
const MODULES = ['security', 'inventory', 'sales', 'purchases', 'accounting', 'reports'];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await rolesAPI.getAll();
      setRoles(res.roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        permissions: editingRole?.permissions || getDefaultPermissions(),
      };
      
      if (editingRole) {
        await rolesAPI.update(editingRole.id, data);
      } else {
        await rolesAPI.create(data);
      }
      setIsModalOpen(false);
      loadRoles();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;
    try {
      await rolesAPI.delete(id);
      loadRoles();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
  };

  const getDefaultPermissions = () => {
    const perms: Record<string, string[]> = {};
    MODULES.forEach(m => { perms[m] = ['read']; });
    return perms;
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const showPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <Button onClick={openCreateModal}>+ Nuevo Rol</Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'Descripción', 'Permisos', 'Estado', 'Acciones']}>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description || '-'}</TableCell>
              <TableCell>
                <button
                  onClick={() => showPermissions(role)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver permisos
                </button>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  role.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {role.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
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
        title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingRole ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Rol"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <p className="text-sm text-gray-500">
            Los permisos se configuran después de crear el rol.
          </p>
        </form>
      </Modal>

      <Modal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        title={`Permisos: ${selectedRole?.name}`}
        footer={
          <Button onClick={() => setIsPermissionsOpen(false)}>Cerrar</Button>
        }
      >
        {selectedRole && (
          <div className="space-y-4">
            {MODULES.map((module) => (
              <div key={module} className="border rounded-lg p-4">
                <h4 className="font-medium capitalize mb-2">{module}</h4>
                <div className="flex gap-4">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions?.[module]?.includes(perm) || false}
                        disabled
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}