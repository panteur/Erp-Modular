'use client';

import { useState, useEffect } from 'react';
import { companyAPI } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/components/context/AuthContext';

interface Company {
  id: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      if (user?.company?.id) {
        const res = await companyAPI.getById(user.company.id);
        setCompany(res.company);
        setFormData({
          name: res.company.name || '',
          nit: res.company.nit || '',
          address: res.company.address || '',
          phone: res.company.phone || '',
          email: res.company.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    
    setIsSaving(true);
    try {
      await companyAPI.update(company.id, formData);
      alert('Empresa actualizada correctamente');
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Datos de la Empresa</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <Input
            label="Nombre de la Empresa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
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
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}