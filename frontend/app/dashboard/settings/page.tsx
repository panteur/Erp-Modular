import Card from '@/components/ui/Card';

export default function SettingsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <Card>
        <p className="text-gray-600">
          Gestiona la configuración general del sistema.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <a 
            href="/dashboard/settings/modules"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-medium text-blue-900">📦 Módulos</h3>
            <p className="text-sm text-blue-700">Activar/desactivar módulos</p>
          </a>
          <a 
            href="/dashboard/settings/branches"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h3 className="font-medium text-green-900">🏢 Sucursales</h3>
            <p className="text-sm text-green-700">Gestionar sucursales</p>
          </a>
          <a 
            href="/dashboard/settings/company"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-medium text-purple-900">🏛️ Empresa</h3>
            <p className="text-sm text-purple-700">Datos de la empresa</p>
          </a>
        </div>
      </Card>
    </div>
  );
}