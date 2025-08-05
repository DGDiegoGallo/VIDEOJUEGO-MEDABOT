# Dashboard de Administración

## Descripción

El dashboard de administración es un sistema completo para gestionar usuarios, sesiones de juego y métricas de rendimiento de la aplicación. Está diseñado específicamente para usuarios con rol de administrador.

## Características Principales

### 🔐 Control de Acceso
- Solo usuarios con rol `admin` pueden acceder al dashboard
- Redirección automática desde el login para administradores
- Protección de rutas con verificación de roles

### 📊 Métricas y Análisis
- **Métricas de Rendimiento Web**: Utilizando Web Vitals para medir:
  - Tiempo de carga de página
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - First Input Delay (FID)
  - Time to Interactive (TTI)

- **Métricas de Engagement**:
  - Usuarios activos diarios, semanales y mensuales
  - Duración promedio de sesión
  - Tasa de rebote
  - Tasa de retención

### 👥 Gestión de Usuarios
- Vista completa de todos los usuarios registrados
- Información detallada incluyendo nombre, apellido y rol
- Filtros por rol de usuario
- Modal de detalles con estadísticas individuales
- Búsqueda por nombre de usuario, email, nombre o apellido

### 🎮 Análisis de Sesiones de Juego
- Listado completo de todas las sesiones de juego
- Filtros por estado (activa, completada, abandonada)
- Filtros por rango de fechas
- Información de duración, puntuación y nivel

### 📈 Visualización de Datos
- Gráficos interactivos usando Chart.js:
  - Distribución de usuarios por nivel (gráfico de dona)
  - Usuarios activos (gráfico de barras)
  - Sesiones por día (gráfico de líneas)
  - Top 5 jugadores (gráfico de barras)

### 📄 Exportación de Datos
- Generación de reportes en PDF con jsPDF
- Incluye resumen ejecutivo y tablas detalladas
- Descarga automática con fecha en el nombre del archivo

## Estructura de Archivos

```
src/
├── components/admin/
│   ├── AdminDashboard.tsx      # Componente principal
│   ├── AdminHeader.tsx         # Header con navegación y acciones
│   ├── AdminLoading.tsx        # Componente de carga
│   ├── AdminStats.tsx          # Tarjetas de estadísticas
│   ├── AdminFilters.tsx        # Filtros de datos
│   ├── AdminCharts.tsx         # Gráficos y visualizaciones
│   ├── AdminMetrics.tsx        # Métricas de rendimiento
│   ├── AdminUserTable.tsx      # Tabla de usuarios
│   ├── AdminGameSessionTable.tsx # Tabla de sesiones
│   ├── AdminUserModal.tsx      # Modal de detalles de usuario
│   └── index.ts               # Exportaciones
├── pages/
│   └── AdminPage.tsx          # Página principal de admin
├── services/
│   └── adminService.ts        # Servicios de API para admin
├── stores/
│   └── adminStore.ts          # Estado global del dashboard
├── types/
│   └── admin.ts               # Tipos TypeScript
└── hooks/
    └── usePerformanceMetrics.ts # Hook para métricas automáticas
```

## Configuración de Roles

### En Strapi
Los usuarios deben tener el campo `rol` configurado como `'admin'` o el campo `role.name` como `'admin'`.

### En el Frontend
El contexto de autenticación verifica automáticamente el rol y proporciona:
```typescript
const { isAdmin } = useAuthContext();
```

## Uso

### Acceso al Dashboard
1. Iniciar sesión con una cuenta de administrador
2. Serás redirigido automáticamente a `/admin`
3. O navegar manualmente a `/admin` (con protección de ruta)

### Funcionalidades Principales
- **Filtrar datos**: Usar los filtros en la parte superior
- **Ver detalles de usuario**: Hacer clic en el ícono de ojo en la tabla
- **Exportar PDF**: Botón "Exportar PDF" en el header
- **Actualizar métricas**: Botón "Actualizar Métricas" para recopilar datos de rendimiento

## Métricas Automáticas

El sistema recopila automáticamente métricas de rendimiento:
- Al cargar la aplicación
- Antes de cerrar la página
- Manualmente desde el dashboard

Las métricas se guardan en Strapi en la colección `metrics`.

## Dependencias

- **Chart.js & react-chartjs-2**: Para gráficos
- **jsPDF & jspdf-autotable**: Para exportación PDF
- **web-vitals**: Para métricas de rendimiento
- **React Icons**: Para iconografía
- **Zustand**: Para gestión de estado

## Personalización

### Agregar Nuevas Métricas
1. Actualizar `AdminMetricsData` en `types/admin.ts`
2. Modificar `AdminService.getMetrics()` para recopilar los datos
3. Actualizar `AdminMetrics.tsx` para mostrar las nuevas métricas

### Agregar Nuevos Gráficos
1. Importar el tipo de gráfico necesario en `AdminCharts.tsx`
2. Crear los datos del gráfico
3. Agregar el componente de gráfico al render

### Personalizar Filtros
1. Actualizar el estado `filters` en `adminStore.ts`
2. Modificar `AdminFilters.tsx` para los controles UI
3. Actualizar la lógica de filtrado en las tablas

## Consideraciones de Rendimiento

- Las tablas están paginadas (10 elementos por página)
- Los gráficos se renderizan solo cuando hay datos
- Las métricas se recopilan de forma asíncrona
- Los datos se cargan una sola vez al montar el componente

## Seguridad

- Verificación de roles en frontend y backend
- Protección de rutas sensibles
- Validación de permisos antes de mostrar datos
- Manejo seguro de errores sin exponer información sensible