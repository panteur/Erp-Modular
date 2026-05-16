import Card from '@/components/ui/Card';

export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel Principal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Usuarios Activos">
          <div className="text-3xl font-bold text-blue-600">12</div>
          <p className="text-sm text-gray-500 mt-2">Usuarios conectados</p>
        </Card>
        
        <Card title="Módulos Activos">
          <div className="text-3xl font-bold text-green-600">4</div>
          <p className="text-sm text-gray-500 mt-2">De 6 módulos disponibles</p>
        </Card>
        
        <Card title="Sucursales">
          <div className="text-3xl font-bold text-purple-600">2</div>
          <p className="text-sm text-gray-500 mt-2">Sucursales configuradas</p>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Bienvenido al ERP Modular">
          <p className="text-gray-600">
            Este es tu panel de control. Desde aquí puedes gestionar usuarios, roles,
            módulos y la configuración general del sistema.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Seguridad</h3>
              <p className="text-sm text-blue-700">Gestiona usuarios y roles</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Configuración</h3>
              <p className="text-sm text-green-700">Administra módulos y empresa</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}