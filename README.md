# ERP Modular

Sistema de gestión empresarial modular con arquitectura frontend-backend separada.

## Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de datos**: MySQL/MariaDB (instalación local)

## Requisitos

- Node.js 18+
- MariaDB o MySQL instalado localmente
- Git

## Instalación de Base de Datos

### 1. Crear base de datos en MariaDB/MySQL

```sql
CREATE DATABASE erp_modular CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'Panteur7899968@';
GRANT ALL PRIVILEGES ON erp_modular.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

O desde terminal:
```bash
mysql -u root -p -e "CREATE DATABASE erp_modular;"
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/panteur/Erp-Modular.git
cd Erp-Modular
```

### 3. Configurar Backend

```bash
cd backend
npm install
npm run db:migrate    # Crear tablas
npm run db:seed       # Poblar datos iniciales
npm run dev           # Iniciar servidor (puerto 4000)
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
npm run dev           # Iniciar servidor (puerto 3000)
```

## Credenciales por defecto

- **Email**: admin@miempresa.com
- **Contraseña**: admin123

## Estructura del proyecto

```
Erp-Modular/
├── backend/           # API Node.js + Express
│   ├── config/        # Configuración
│   ├── controllers/   # Controladores
│   ├── database/      # Conexión y migraciones
│   ├── middleware/    # Middleware auth
│   ├── models/        # Modelos Sequelize
│   ├── routes/        # Rutas API
│   ├── services/      # Lógica de negocio
│   ├── utils/         # Helpers
│   └── app.js         # Entry point
├── frontend/          # Next.js 14
│   ├── app/           # Rutas (App Router)
│   ├── components/     # Componentes
│   ├── context/       # Contextos React
│   ├── lib/           # Utilidades API
│   └── hooks/         # Custom hooks
└── README.md
```

## Variables de entorno

### Backend (backend/.env)

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=erp_modular
DB_USER=root
DB_PASSWORD=Panteur7899968@
JWT_SECRET=erp-modular-secret-key-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### Frontend (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Roles
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

## Módulos del sistema

1. **Seguridad** - Usuarios, roles y permisos
2. **Inventario** - Gestión de productos
3. **Ventas** - Facturación y ventas
4. **Compras** - Proveedores y compras
5. **Contabilidad** - Gestión contable
6. **Reportes** - Análisis y reportes

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/api/health