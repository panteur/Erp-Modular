'use client';

import { useState, useEffect } from 'react';
import { modulesAPI } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/components/context/AuthContext';

interface Module {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const res = await modulesAPI.getAll();
      setModules(res.modules);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (module: Module) => {
    try {
      if (user?.company?.id) {
        await modulesAPI.toggle(module.id, !module.is_active, user.company.id);
        loadModules();
      }
    } catch (error: any) {
      alert(error.message || 'Error al togglear módulo');
    }
  };

  const getIcon = (code: string) => {
    const icons: Record<string, string> = {
      security: '🛡️',
      inventory: '📦',
      sales: '🛒',
      purchases: '🚚',
      accounting: '🧮',
      reports: '📊',
    };
    return icons[code] || '📁';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h1>
      
      <Card>
        <p className="text-gray-600 mb-6">
          Activa o desactiva los módulos disponibles para tu empresa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`border rounded-lg p-4 transition-colors ${
                module.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getIcon(module.code)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{module.name}</h3>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  module.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {module.is_active ? 'Activo' : 'Inactivo'}
                </span>
                
                <button
                  onClick={() => toggleModule(module)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    module.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {module.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}