'use client';

import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI } from '@/lib/api';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { Table, TableRow, TableCell } from '@/components/ui';

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  document_type: string;
  document_number: string;
  address: string;
}

interface User {
  id: number;
  email: string;
  profile: UserProfile | null;
  is_active: boolean;
  role: { id: number; name: string };
  company: { id: number; name: string };
  branch: { id: number; name: string } | null;
}

interface Role {
  id: number;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    document_type: '',
    document_number: '',
    role_id: '',
    branch_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersAPI.getAll(),
        rolesAPI.getAll(),
      ]);
      setUsers(usersRes.users);
      setRoles(rolesRes.roles);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
      } else {
        await usersAPI.create(formData);
      }
      setIsModalOpen(false);
      loadData();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.profile?.first_name || '',
      last_name: user.profile?.last_name || '',
      phone: user.profile?.phone || '',
      document_type: user.profile?.document_type || '',
      document_number: user.profile?.document_number || '',
      role_id: user.role.id.toString(),
      branch_id: user.branch?.id.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await usersAPI.delete(id);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      document_type: '',
      document_number: '',
      role_id: '',
      branch_id: '',
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={openCreateModal}>+ Nuevo Usuario</Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'Email', 'Rol', 'Sucursal', 'Estado', 'Acciones']}>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.profile?.first_name} {user.profile?.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user.role.name}
                </span>
              </TableCell>
              <TableCell>{user.branch?.name || 'Todas'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editingUser && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <Input
              label="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo Documento"
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              options={[
                { value: '', label: 'Seleccionar...' },
                { value: 'CC', label: 'Cédula de Ciudadanía' },
                { value: 'CE', label: 'Cédula de Extranjería' },
                { value: 'NIT', label: 'NIT' },
                { value: 'PASSPORT', label: 'Pasaporte' },
              ]}
            />
            <Input
              label="Número Documento"
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            />
          </div>
          <Select
            label="Rol"
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            options={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
          />
        </form>
      </Modal>
    </div>
  );
}
