# Sistema de Autenticación y Creación de Usuarios

## Descripción General

Este sistema implementa un flujo de autenticación simplificado para una aplicación demo que se conecta con Strapi como backend. El sistema está diseñado para ser funcional pero no necesariamente perfecto, ya que es una demostración.

## Características Principales

- **Login sin contraseña** (modo demo)
- **Registro completo de usuarios** con validación frontend
- **Autenticación passwordless** contra Strapi `/api/users`
- **Almacenamiento en localStorage** (no sessionStorage)
- **Creación automática de wallet** al registrarse
- **Context de autenticación** con React
- **Roles personalizados** almacenados en `rol` field

## Estructura de Archivos

```
src/
├── views/auth/
│   ├── LoginPage.tsx          # Página de inicio de sesión
│   ├── LoginPage.css          # Estilos del login
│   ├── RegisterForm.tsx       # Formulario de registro
│   ├── RegisterPage.tsx       # Página de registro
│   └── LogoutPage.tsx         # Página de logout
├── features/auth/
│   ├── hooks/
│   │   └── useAuth.ts         # Hook principal de autenticación
│   ├── services/
│   │   ├── auth.service.ts    # Servicio de autenticación
│   │   └── user.service.ts    # Servicio de usuarios
│   └── types/
│       ├── auth.types.ts      # Tipos de autenticación
│       └── register.types.ts  # Tipos de registro
```

## Tipos de Datos

### LoginCredentials
```typescript
interface LoginCredentials {
  email: string;
  password?: string; // opcional para demo sin contraseña
  rememberMe?: boolean;
}
```

### RegisterCredentials
```typescript
interface RegisterCredentials {
  username: string;
  email: string;
  phone: string;
  fullName: string;
  idType: 'DNI' | 'PAS' | 'RUC';
  idNumber: string;
  address: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}
```

### User
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: Role; // Strapi default role object (unused in demo)
  rol?: string; // Rol de texto personalizado (user, agent, company)
  phone?: string;
  fullName?: string;
  idType?: string;
  idNumber?: string;
  address?: string;
  birthDate?: string;
  // Campos adicionales de Strapi
  documentoID?: string;
  nombre?: string;
  apellido?: string;
  company?: number | string | Record<string, unknown> | null;
}
```

## Flujo de Autenticación

### 1. Login (Passwordless)

El sistema implementa un login sin contraseña para la demo:

```typescript
// En auth.service.ts
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Busca usuario por email o username
  const identifier = credentials.email.trim();
  const encoded = encodeURIComponent(identifier);
  const res = await fetch(`${API_URL}/api/users?filters[$or][0][email][$eq]=${encoded}&filters[$or][1][username][$eq]=${encoded}&populate=*`);
  
  const json = await res.json();
  let userData = null;
  
  if (Array.isArray(json) && json.length > 0) {
    userData = json[0];
  } else if (Array.isArray(json.data) && json.data.length > 0) {
    userData = { id: json.data[0].id, ...json.data[0].attributes };
  }
  
  if (!userData) throw new Error('Usuario no encontrado');
  
  return { jwt: '', user: userData } as AuthResponse;
}
```

**Características del Login:**
- No requiere contraseña (modo demo)
- Busca usuarios por email o username
- Retorna datos del usuario desde Strapi
- No genera JWT real (campo vacío)

### 2. Registro de Usuarios

El registro incluye validación completa y creación automática de wallet:

```typescript
// En auth.service.ts
async register(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Limpiar storage antes del registro
  localStorage.clear();
  sessionStorage.clear();
  
  const response = await fetch(`${API_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      telefono: credentials.phone || '',
      rol: 'cliente',
      direccion: credentials.address || '',
      documentoID: credentials.idNumber || '',
      fechaNacimiento: credentials.birthDate || null,
      nombre: credentials.fullName.split(' ')[0] || credentials.fullName,
      apellido: credentials.fullName.split(' ').slice(1).join(' ') || ''
    }),
  });
  
  return await response.json();
}
```

**Características del Registro:**
- Validación completa en frontend
- Campos personalizados para datos del usuario
- Creación automática de wallet crypto
- Limpieza de storage antes del registro

### 3. Creación Automática de Wallet

Después del registro exitoso, se crea automáticamente una wallet:

```typescript
// En useAuth.ts - función register
try {
  const { userWalletService } = await import('../../../services/userWallet.service');
  const walletResult = await userWalletService.createUserWallet(response.user.id);
  
  // Agregar datos de wallet a la respuesta
  response.walletData = {
    wallet: walletResult.wallet,
    pin: walletResult.pin
  };
} catch (walletError) {
  console.error('Error creando wallet automáticamente:', walletError);
}
```

## Hook useAuth

El hook principal que maneja todo el estado de autenticación:

```typescript
const useAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    // Cargar usuario desde localStorage al inicializar
    const storedRaw = authService.getUser();
    return storedRaw ? sanitizeUser(storedRaw as RawUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    authService.isAuthenticated()
  );

  // Funciones disponibles
  return {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register
  };
};
```

**Características del Hook:**
- Estado reactivo sincronizado con localStorage
- Listener para cambios en storage (múltiples pestañas)
- Sanitización automática de datos de usuario
- Manejo de errores centralizado

## Almacenamiento de Datos

### localStorage
```typescript
// Datos almacenados
localStorage.setItem('token', token || ''); // JWT vacío en demo
localStorage.setItem('user', JSON.stringify(user)); // Datos completos del usuario
localStorage.setItem('companyName', companyName); // Nombre de empresa (opcional)
```

### Verificación de Autenticación
```typescript
isAuthenticated(): boolean {
  const token = this.getToken();
  const user = this.getUser();
  
  // Si hay token, está autenticado
  if (token && token !== '') return true;
  
  // Si no hay token pero hay usuario válido (modo demo)
  if (user && user.id) return true;
  
  return false;
}
```

## Componentes de UI

### LoginPage.tsx
- Formulario de login con email/password
- Validación frontend
- Redirección basada en roles
- Manejo de estados de carga y error

### RegisterForm.tsx
- Formulario completo de registro
- Validación de campos requeridos
- Confirmación de contraseña
- Modal para mostrar datos de wallet creada
- Términos y condiciones

## Redirección por Roles

```typescript
// En LoginPage.tsx
const userRole = response?.user?.rol || response?.user?.role?.name || 'user';

if (['admin', 'superadmin', 'administrator'].includes(userRole.toLowerCase())) {
  window.location.href = '/admin/dashboard';
} else if (userRole === 'agent') {
  window.location.href = '/agent/dashboard';
} else {
  window.location.href = '/company/dashboard';
}
```

## Configuración de API

```typescript
// En config/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:1337
VITE_USE_MOCK=false
```

## Funciones de Utilidad

### Sanitización de Usuario
```typescript
const sanitizeUser = (rawUser: RawUser | null): User | null => {
  if (!rawUser) return null;
  
  const { role, ...userData } = rawUser;
  const user: Partial<User> = {
    ...userData,
    rol: rawUser.rol || (typeof role === 'object' && role?.name === 'Authenticated' ? 'user' : 'guest')
  };
  
  return user as User;
};
```

### Logout Completo
```typescript
logout(): void {
  // Limpiar todo el localStorage y sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Eliminar cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  // Disparar evento de logout
  const logoutEvent = new Event('app:logout');
  window.dispatchEvent(logoutEvent);
}
```

## Uso en Otros Proyectos

Para reutilizar esta lógica en otro proyecto:

1. **Copiar la estructura de carpetas** `features/auth/`
2. **Adaptar las URLs** de API en `auth.service.ts`
3. **Modificar los tipos** según las necesidades del proyecto
4. **Ajustar los campos** del formulario de registro
5. **Personalizar la redirección** por roles
6. **Configurar las variables** de entorno

## Consideraciones Importantes

- **Es una demo**: Las funciones no necesitan ser perfectas
- **Sin JWT real**: El sistema funciona sin tokens reales
- **Validación frontend**: La seguridad está en el frontend únicamente
- **localStorage**: Los datos persisten entre sesiones
- **Passwordless**: El login no requiere contraseña real
- **Wallet automática**: Se crea wallet crypto al registrarse

## Dependencias Requeridas

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "react-icons": "^4.x"
}
```

Este sistema proporciona una base sólida para autenticación en aplicaciones demo con Strapi, enfocándose en la funcionalidad y experiencia de usuario más que en la seguridad perfecta.
