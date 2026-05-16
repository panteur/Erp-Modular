'use client';

import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI, branchesAPI, authAPI } from '@/lib/api';
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

const RUT_REGEX = /^(\d{1,3}(?:\.?\d{3}){0,2}-?[0-9Kk])$/;

const validateRUT = (rut: string): boolean => {
  const cleaned = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d+[0-9K]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDV;
  if (remainder === 11) expectedDV = '0';
  else if (remainder === 10) expectedDV = 'K';
  else expectedDV = remainder.toString();

  return expectedDV === dv;
};

const formatRUT = (value: string): string => {
  const cleaned = value.replace(/\./g, '').replace(/-/g, '');
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

const DOCUMENT_OPTIONS = [
  { value: 'RUT', label: 'RUT (Chile)' },
  { value: 'OTRA', label: 'Otra' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [documentError, setDocumentError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    document_type: 'RUT',
    document_number: '',
    role_id: '',
    branch_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        usersAPI.getAll(),
        rolesAPI.getAll(),
        branchesAPI.getAll(),
      ]);
      setUsers(usersRes.users);
      setRoles(rolesRes.roles);
      setBranches(branchesRes.branches);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentChange = (value: string) => {
    setFormData({ ...formData, document_type: value, document_number: '' });
    setDocumentError('');
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phone: digits });
  };

  const handleDocumentNumberChange = (value: string) => {
    if (formData.document_type === 'RUT') {
      const cleaned = value.replace(/[^0-9kK\-\.]/g, '');
      const formatted = formatRUT(cleaned);
      setFormData({ ...formData, document_number: formatted });
    } else {
      setFormData({ ...formData, document_number: value });
    }
    setDocumentError('');
  };

  const validateForm = (): boolean => {
    if (formData.document_type === 'RUT' && formData.document_number) {
      if (!validateRUT(formData.document_number)) {
        setDocumentError('RUT inválido - verifique el dígito verificador');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!formData.role_id) {
      return alert('Debes seleccionar un rol');
    }

    const submitData: Record<string, any> = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      document_type: formData.document_type,
      document_number: formData.document_number
        ? formData.document_number.replace(/\./g, '').replace(/-/g, '')
        : '',
      role_id: formData.role_id,
    };

    if (formData.branch_id) submitData.branch_id = formData.branch_id;

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, submitData);
      } else {
        await usersAPI.create(submitData);
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
      first_name: user.profile?.first_name || '',
      last_name: user.profile?.last_name || '',
      phone: user.profile?.phone || '',
      document_type: user.profile?.document_type || 'RUT',
      document_number: user.profile?.document_number || '',
      role_id: user.role.id.toString(),
      branch_id: user.branch?.id.toString() || '',
    });
    setDocumentError('');
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

  const handleSendReset = async (id: number) => {
    if (!confirm('¿Enviar correo de restablecimiento de contraseña a este usuario?')) return;
    try {
      const res = await usersAPI.sendResetPassword(id);
      alert(res.message || 'Correo enviado correctamente');
    } catch (error: any) {
      alert(error.message || 'Error al enviar correo');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      document_type: 'RUT',
      document_number: '',
      role_id: '',
      branch_id: '',
    });
    setDocumentError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleSendReset(user.id)}
                    className="text-amber-600 hover:text-amber-800 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
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
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                +56
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9 1234 5678"
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-300 rounded-r-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo Documento"
              value={formData.document_type}
              onChange={(e) => handleDocumentChange(e.target.value)}
              options={DOCUMENT_OPTIONS}
            />
            <div>
              {formData.document_type === 'RUT' ? (
                <Input
                  label="Número Documento"
                  value={formData.document_number}
                  onChange={(e) => handleDocumentNumberChange(e.target.value)}
                  placeholder="12.345.678-5"
                />
              ) : (
                <Input
                  label="Número Documento"
                  value={formData.document_number}
                  onChange={(e) => handleDocumentNumberChange(e.target.value)}
                  placeholder="Ingrese número"
                />
              )}
              {documentError && (
                <p className="text-red-500 text-xs mt-1">{documentError}</p>
              )}
            </div>
          </div>
          <Select
            label="Rol"
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            options={[
              { value: '', label: 'Seleccione rol' },
              ...roles.map((r) => ({ value: r.id.toString(), label: r.name }))
            ]}
          />
          <Select
            label="Sucursal"
            value={formData.branch_id}
            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
            options={[
              { value: '', label: 'Todas las sucursales' },
              ...branches.map((b) => ({ value: b.id.toString(), label: b.name }))
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
