import Card from '@/components/ui/Card';

export default function SecurityIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seguridad</h1>
      <Card>
        <p className="text-gray-600">
          Gestiona usuarios, roles y permisos del sistema.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <a 
            href="/dashboard/security/users"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-medium text-blue-900">👥 Usuarios</h3>
            <p className="text-sm text-blue-700">Administrar usuarios del sistema</p>
          </a>
          <a 
            href="/dashboard/security/roles"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h3 className="font-medium text-green-900">🔑 Roles</h3>
            <p className="text-sm text-green-700">Configurar roles y permisos</p>
          </a>
        </div>
      </Card>
    </div>
  );
}