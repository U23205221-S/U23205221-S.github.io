# MobiliAri - Micro Frontends Architecture

## Descripción del Proyecto

MobiliAri es una aplicación web para una empresa de muebles personalizados que ha sido reestructurada utilizando **arquitectura de Micro Frontends**. La aplicación original monolítica ha sido dividida en módulos independientes y reutilizables.

## Arquitectura de Micro Frontends

La aplicación está organizada de la siguiente manera:

```
frontend/
├── container/                    # El contenedor principal (Shell)
│   ├── css/
│   │   └── global.css           # Estilos globales para toda la aplicación
│   ├── js/
│   │   └── router.js            # Router para cargar micro frontends
│   └── index.html               # Punto de entrada único
│
├── auth-module/                 # Módulo de Autenticación
│   ├── css/
│   │   └── auth.css
│   ├── js/
│   │   └── auth.js
│   └── auth.html
│
├── catalog-module/              # Módulo de Catálogo E-commerce
│   ├── css/
│   │   └── catalog.css
│   ├── js/
│   │   └── catalog.js
│   └── catalog.html
│
├── customization-module/        # Módulo de Personalización
│   ├── css/
│   │   └── customization.css
│   ├── js/
│   │   └── customization.js
│   └── customization.html
│
├── dashboard-module/            # Módulo de Dashboard Administrativo
│   ├── css/
│   │   └── dashboard.css
│   ├── js/
│   │   └── dashboard.js
│   └── dashboard.html
│
├── orders-module/               # Módulo de Pedidos y Tareas
├── inventory-module/            # Módulo de Inventario
├── suppliers-module/            # Módulo de Proveedores
├── reports-module/              # Módulo de Reportes
├── users-module/                # Módulo de Usuarios
├── payments-module/             # Módulo de Pagos
└── cart-module/                 # Módulo de Carrito de Compras
```

## Módulos Implementados

### ✅ Completados

1. **Container/Shell** - El contenedor principal que maneja la navegación entre micro frontends
2. **Auth Module** - Maneja login, registro y autenticación de usuarios
3. **Catalog Module** - Catálogo de productos, búsqueda, filtros y carrito de compras
4. **Customization Module** - Personalización de muebles y generación de cotizaciones
5. **Dashboard Module** - Panel administrativo con estadísticas y navegación

### 🚧 Pendientes

6. **Orders Module** - Gestión de pedidos y tareas de producción
7. **Inventory Module** - Control de materia prima e inventario
8. **Suppliers Module** - Gestión de proveedores
9. **Reports Module** - Reportes y análisis
10. **Users Module** - Administración de usuarios
11. **Payments Module** - Gestión de pagos
12. **Cart Module** - Carrito de compras independiente

## Características Principales

### 🏗️ Arquitectura
- **Micro Frontends independientes**: Cada módulo es autónomo y puede desarrollarse por separado
- **Router centralizado**: Maneja la carga dinámica de módulos
- **Estado global compartido**: Sistema de estado centralizado para datos compartidos
- **Comunicación entre módulos**: Sistema de eventos para comunicación inter-módulos

### 🎨 Diseño
- **Design System consistente**: Paleta de colores y componentes unificados
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Tema personalizado**: Colores inspirados en madera y materiales naturales

### 🔐 Seguridad
- **Autenticación basada en roles**: Cliente y Administrador
- **Navegación condicional**: Módulos visibles según el rol del usuario
- **Validación de formularios**: Validación en tiempo real

### 💾 Gestión de Estado
- **LocalStorage**: Persistencia de datos del usuario
- **Estado reactivo**: Actualizaciones automáticas de la UI
- **Sincronización**: Estado compartido entre módulos

## Cómo Ejecutar

### Opción 1: Servidor Local Simple
```bash
# Navegar al directorio del proyecto
cd "c:\Users\renzo\OneDrive\Documentos\PRUEBA MICROFRONTENDS"

# Usar Python para servir archivos estáticos
python -m http.server 8000

# O usar Node.js
npx http-server -p 8000
```

### Opción 2: Live Server (VS Code)
1. Instalar la extensión "Live Server" en VS Code
2. Abrir el archivo `frontend/container/index.html`
3. Click derecho → "Open with Live Server"

### Acceso
- **URL**: `http://localhost:8000/frontend/container/`
- **Credenciales de prueba**:
  - **Admin**: `admin@mobiliari.mx` / `admin123`
  - **Cliente**: `cliente@mobiliari.mx` / `cliente123`

## Flujo de Usuario

### Para Clientes
1. **Login** → Autenticación
2. **Catálogo** → Explorar productos
3. **Personalización** → Crear muebles personalizados
4. **Carrito** → Revisar y proceder al pago

### Para Administradores
1. **Login** → Autenticación
2. **Dashboard** → Vista general del negocio
3. **Pedidos** → Gestionar órdenes de trabajo
4. **Inventario** → Control de materiales
5. **Proveedores** → Gestión de proveedores
6. **Reportes** → Análisis del negocio

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones (Variables CSS, Flexbox, Grid)
- **JavaScript ES6+** - Lógica de aplicación (Módulos, Clases, Async/Await)
- **Bootstrap 5** - Framework CSS para componentes
- **Bootstrap Icons** - Iconografía
- **Chart.js** - Gráficos y visualizaciones
- **SortableJS** - Funcionalidad drag & drop

## Ventajas de la Arquitectura de Micro Frontends

### 🚀 Desarrollo
- **Equipos independientes**: Cada módulo puede ser desarrollado por equipos diferentes
- **Tecnologías flexibles**: Cada micro frontend puede usar tecnologías diferentes
- **Despliegue independiente**: Módulos se pueden actualizar por separado
- **Escalabilidad**: Fácil agregar nuevos módulos

### 🔧 Mantenimiento
- **Código modular**: Fácil de mantener y debuggear
- **Reutilización**: Componentes pueden reutilizarse entre módulos
- **Testing**: Pruebas unitarias por módulo
- **Refactoring**: Cambios aislados por módulo

### 👥 Organización
- **Responsabilidades claras**: Cada módulo tiene un propósito específico
- **Onboarding**: Nuevos desarrolladores pueden enfocarse en un módulo
- **Documentación**: Cada módulo puede tener su propia documentación

## Próximos Pasos

1. **Completar módulos pendientes** (Orders, Inventory, Suppliers, etc.)
2. **Implementar testing unitario** para cada módulo
3. **Optimizar performance** (lazy loading, code splitting)
4. **Agregar PWA features** (offline support, push notifications)
5. **Implementar CI/CD** para despliegue automatizado
6. **Dockerización** para facilitar el despliegue

## Estructura de Archivos Original vs Nueva

### Antes (Monolítico)
```
├── index.html          # 484 líneas - Todo mezclado
├── script.js           # 2386 líneas - Toda la lógica
└── style.css           # 724 líneas - Todos los estilos
```

### Después (Micro Frontends)
```
frontend/
├── container/          # Shell application
├── auth-module/        # ~200 líneas por módulo
├── catalog-module/     # Código organizado y modular
├── customization-module/
├── dashboard-module/
└── [otros módulos]/    # Fácil de extender
```

## Contribución

Para contribuir al proyecto:

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**MobiliAri** - Transformando espacios con muebles personalizados 🪑✨
