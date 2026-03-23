# 🎓 Sistema de Gestión de Estudiantes

Una aplicación full-stack moderna construida con Next.js 15, Supabase y Drizzle ORM que implementa un sistema completo de gestión de usuarios con autenticación, autorización y una interfaz administrativa intuitiva.

## ✨ Características Principales

- 🔐 **Autenticación robusta** con NextAuth.js y JWT
- 👥 **Gestión completa de usuarios** (estudiantes, profesores, administradores)
- 🎨 **Interfaz moderna** con Tailwind CSS y componentes Radix UI
- 🛡️ **Seguridad avanzada** con middleware de autorización por roles
- 📱 **Responsive design** para dispositivos móviles y desktop
- �️ **Base de datos optimizada** con PostgreSQL y Drizzle ORM
- ⚡ **Rendimiento optimizado** con Next.js 15 y Turbopack
- 🧪 **Tipado completo** con TypeScript
- 📊 **Dashboard interactivo** para administración

## 🚀 Stack Tecnológico

### Frontend

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconografía
- **React Hook Form** - Manejo de formularios

### Backend

- **Next.js API Routes** - Endpoints REST
- **NextAuth.js** - Sistema de autenticación
- **Drizzle ORM** - Object-Relational Mapping
- **PostgreSQL (Supabase)** - Base de datos
- **bcryptjs** - Encriptación de contraseñas
- **Zod** - Validación de schemas

### DevOps & Tooling

- **pnpm** - Gestor de paquetes
- **ESLint** - Linting de código
- **Drizzle Kit** - Migraciones de base de datos
- **Turbopack** - Bundler de desarrollo

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Endpoints de autenticación
│   │   │   ├── [...nextauth]/    # NextAuth.js handler
│   │   │   ├── login/            # Login personalizado
│   │   │   ├── register/         # Registro de usuarios
│   │   │   ├── session/          # Gestión de sesiones
│   │   │   └── signout/          # Cierre de sesión
│   │   ├── users/                # CRUD de usuarios
│   │   │   ├── route.ts          # GET, POST usuarios
│   │   │   └── [id]/route.ts     # GET, PUT, PATCH, DELETE por ID
│   │   └── admin/                # Endpoints administrativos
│   │       └── users/[id]/       # Gestión admin de usuarios
│   ├── favicon.ico
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/                   # Componentes React
│   ├── auth/                     # Componentes de autenticación
│   │   └── LoginForm.tsx         # Formulario de login
│   ├── dashboard/                # Componentes del dashboard
│   │   ├── Dashboard.tsx         # Dashboard principal
│   │   ├── DashboardHeader.tsx   # Header del dashboard
│   │   ├── UserCard.tsx          # Tarjeta de usuario
│   │   ├── UserDetail.tsx        # Detalle de usuario
│   │   └── UsersList.tsx         # Lista de usuarios
│   └── ui/                       # Componentes UI reutilizables
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       └── label.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Hook de autenticación
│   └── useUsers.ts               # Hook de gestión de usuarios
├── lib/                          # Librerías y utilidades
│   ├── db/                       # Configuración de base de datos
│   │   ├── index.ts              # Cliente de Drizzle
│   │   ├── schema.ts             # Schema principal
│   │   └── schema.optimized.ts   # Schema optimizado
│   ├── services/                 # Servicios de negocio
│   │   └── user.service.ts       # Servicio de usuarios
│   ├── types/                    # Tipos TypeScript
│   │   └── api.ts                # Tipos de API
│   ├── utils/                    # Utilidades
│   │   └── api-response.ts       # Builder de respuestas API
│   ├── validators/               # Validadores Zod
│   │   └── index.ts              # Schemas de validación
│   ├── auth.ts                   # Configuración NextAuth.js
│   ├── middleware.ts             # Middleware de autorización
│   └── utils.ts                  # Utilidades generales
├── services/                     # Servicios adicionales
│   ├── auth.service.ts           # Servicio de autenticación
│   └── user.service.ts           # Servicio de usuarios
├── types/                        # Tipos globales
│   └── index.ts                  # Definiciones de tipos
└── env.ts                        # Configuración de variables de entorno
```

## 🗄️ Modelo de Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  description TEXT,
  career VARCHAR(100),
  hobbies TEXT,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  section VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles y Permisos

- **🎯 Student**: Acceso a su propio perfil y visualización de otros usuarios
- **👨‍🏫 Teacher**: Acceso extendido para gestión de estudiantes
- **👑 Admin**: Acceso completo al sistema

## 🔐 Sistema de Autenticación

### NextAuth.js Configuration

El sistema utiliza **NextAuth.js** con autenticación basada en credenciales y JWT:

```typescript
// Proveedor configurado:
- Credentials Provider (username/password con bcryptjs)

// Características implementadas:
- Sesiones JWT (sin base de datos de sesiones)
- Validación de credenciales con Zod
- Hash de contraseñas con bcryptjs (12 salt rounds)
- Middleware de protección por roles
- Callbacks personalizados para JWT y sesiones
- Tipos extendidos para usuario y sesión

// Flujo de autenticación:
1. Validación de entrada con schema Zod
2. Búsqueda de usuario en base de datos
3. Verificación de contraseña con bcrypt.compare()
4. Generación de JWT con datos del usuario
5. Middleware de autorización por roles
```

### Middleware de Autorización

Sistema de middleware para protección de rutas:

```typescript
// Funciones disponibles:
withAuth()              // Requiere autenticación básica
withAdminAuth()         // Solo administradores
withTeacherAuth()       // Profesores y administradores
withUserResourceAuth()  // Acceso a recursos propios o admin

// Control de acceso granular:
- Validación automática de sesión
- Verificación de roles por endpoint
- Logs detallados para debugging
- Manejo consistente de errores
```

## 📡 API Endpoints

### 🔐 Autenticación

```http
POST /api/auth/login           # Login personalizado
POST /api/auth/register        # Registro de nuevos usuarios
GET  /api/auth/session         # Obtener sesión actual
POST /api/auth/signout         # Cerrar sesión
```

### 👥 Gestión de Usuarios

```http
GET    /api/users              # Listar todos los usuarios
POST   /api/users              # Crear nuevo usuario
GET    /api/users/[id]         # Obtener usuario por ID
PUT    /api/users/[id]         # Actualizar perfil completo
PATCH  /api/users/[id]         # Actualizar campos específicos
DELETE /api/users/[id]         # Eliminar cuenta propia
```

### 👑 Administración (Solo Admins)

```http
PUT    /api/admin/users/[id]   # Actualizar cualquier usuario (incluye cambios de rol)
DELETE /api/admin/users/[id]   # Eliminar cualquier usuario
```

## 🛡️ Seguridad y Middleware

### Capas de Protección

1. **Validación de entrada** con schemas Zod
2. **Autenticación** via NextAuth.js
3. **Autorización** por roles y recursos
4. **Sanitización** de datos
5. **Rate limiting** (configurado en middleware)

### Middleware de Autorización

```typescript
// Disponibles:
withAuth(); // Requiere autenticación
withAdminAuth(); // Solo administradores
withTeacherAuth(); // Profesores y administradores
withUserResourceAuth(); // Acceso a recursos propios
```

## ⚙️ Configuración e Instalación

### 1. Prerrequisitos

```bash
Node.js >= 18.0.0
pnpm >= 8.0.0
PostgreSQL database (Supabase recomendado)
```

### 2. Variables de Entorno

Crear `.env` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:port/database"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Autenticación
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Otros
NODE_ENV="development"
```

### 3. Instalación y Setup

```bash
# Clonar el repositorio
git clone https://github.com/CS2031-DBP/cs2031-2025-2-week01-lab01.git
cd cs2031-2025-2-week01-lab01

# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm db:generate    # Generar migraciones
pnpm db:push        # Aplicar schema a la DB

# Iniciar desarrollo
pnpm dev
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
pnpm dev            # Servidor de desarrollo con Turbopack
pnpm build          # Build de producción
pnpm start          # Servidor de producción
pnpm lint           # Linting del código

# Base de datos
pnpm db:generate    # Generar migraciones de Drizzle
pnpm db:migrate     # Ejecutar migraciones
pnpm db:push        # Push directo del schema
pnpm db:studio      # Abrir Drizzle Studio (GUI para DB)
```

## 🎯 Casos de Uso

### 👨‍🎓 Flujo de Estudiante

1. **Registro**: Crear cuenta nueva
2. **Login**: Acceder al sistema
3. **Dashboard**: Ver información personal y lista de usuarios
4. **Perfil**: Actualizar información personal
5. **Navegación**: Explorar perfiles de otros estudiantes

### 👑 Flujo de Administrador

1. **Login**: Acceso con credenciales admin
2. **Dashboard Completo**: Gestión de todos los usuarios
3. **CRUD Avanzado**: Crear, editar, eliminar usuarios
4. **Gestión de Roles**: Cambiar roles de usuarios
5. **Moderación**: Eliminar cuentas según necesidad

### 👨‍🏫 Flujo de Profesor

1. **Login**: Acceso con credenciales de profesor
2. **Vista de Sección**: Gestión de estudiantes por sección
3. **Reportes**: Acceso a información estudiantil
4. **Comunicación**: Interacción con estudiantes

## 📊 Características Avanzadas

### 🎨 UI/UX

- **Design System** consistente con Tailwind CSS
- **Componentes reutilizables** con Radix UI
- **Animaciones suaves** y transiciones
- **Modo responsive** para todos los dispositivos
- **Accesibilidad** mejorada (ARIA labels, keyboard navigation)

### ⚡ Performance

- **Server-side rendering** con Next.js
- **Static generation** para páginas estáticas
- **Code splitting** automático
- **Optimización de imágenes** con Next.js Image
- **Lazy loading** de componentes

### 🔧 Mantenibilidad

- **TypeScript** para tipado fuerte
- **Modular architecture** con separación de responsabilidades
- **Custom hooks** para lógica reutilizable
- **Service layer** para operaciones de negocio
- **Consistent error handling** con builders de respuesta

## 🚀 Deployment

Pueden acceder a la plataforma desde el siguiente url:

[Link al frontend web desplegado en Vercel](https://cs2031-2025-2-week01-lab01.vercel.app)
