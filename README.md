# TiendaKit — Plataforma E-commerce para PyMEs

Plataforma e-commerce B2C white-label lista para vender. React + Node.js + PostgreSQL + MercadoPago. Cada cliente despliega con su marca y dominio.

## 🚀 Características

### Frontend (React + Vite)
- ✅ Interfaz moderna y responsive con TailwindCSS
- ✅ Gestión de estado con Zustand
- ✅ Rutas protegidas y navegación dinámica
- ✅ Carrito de compras persistente
- ✅ Integración con MercadoPago para checkout
- ✅ Panel de administración completo
- ✅ Autenticación JWT
- ✅ Búsqueda y filtros avanzados

### Backend (Node.js + Express)
- ✅ API RESTful completa
- ✅ Autenticación JWT con bcrypt
- ✅ CRUD de productos, categorías, usuarios y pedidos
- ✅ Integración completa con MercadoPago (checkout + webhooks)
- ✅ Gestión de carrito y sesiones
- ✅ Sistema de roles (usuario/admin)
- ✅ Subida de imágenes con Multer
- ✅ Logs con Winston
- ✅ Rate limiting y seguridad

### Base de Datos (PostgreSQL + Sequelize)
- ✅ Modelos relacionales completos
- ✅ Migraciones y seeders
- ✅ Índices optimizados para performance
- ✅ Backup automatizado con Docker

### DevOps
- ✅ Docker Compose para desarrollo y producción
- ✅ Nginx como proxy reverso
- ✅ Redis para caché (opcional)
- ✅ Configuración de SSL/HTTPS ready
- ✅ Health checks y monitoring

## 📋 Requisitos Previos

- Node.js 18+ 
- Docker y Docker Compose
- Git

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd e-commerce
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
# Configurar claves de MercadoPago, JWT, base de datos, etc.
```

### 3. Instalación con Docker (Recomendado)

#### Desarrollo
```bash
# Instalar dependencias
npm run install:all

# Levantar servicios con Docker
npm run docker:up

# La aplicación estará disponible en:
# Frontend: https://www.tu-dominio.com
# Backend:  https://api.tu-dominio.com
# PostgreSQL: gestionado por Coolify
```

#### Producción
```bash
# Construir y levantar servicios de producción
docker-compose --profile production up -d

# Con Nginx como proxy reverso
# Aplicación disponible en: https://www.tu-dominio.com
```

### 4. Instalación Manual (Sin Docker)

#### Backend
```bash
cd server
npm install
npm run dev  # Desarrollo
# o
npm start    # Producción
```

#### Frontend
```bash
cd client
npm install
npm run dev  # Desarrollo
# o
npm run build && npm run preview  # Producción
```

#### Base de datos
```bash
# Instalar PostgreSQL localmente
# Crear base de datos 'ecommerce_db'
# Configurar credenciales en .env
```

## 🔧 Scripts Disponibles

### Proyecto principal
- `npm run dev` - Levantar frontend y backend en desarrollo
- `npm run install:all` - Instalar dependencias en todos los proyectos
- `npm run docker:up` - Levantar servicios con Docker
- `npm run docker:down` - Detener servicios Docker
- `npm run docker:rebuild` - Reconstruir y levantar servicios

### Backend (/server)
- `npm run dev` - Servidor en modo desarrollo con nodemon
- `npm start` - Servidor en modo producción
- `npm test` - Ejecutar tests
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Ejecutar seeders

### Frontend (/client)
- `npm run dev` - Servidor de desarrollo Vite
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de build de producción
- `npm run lint` - Linter ESLint

## 📁 Estructura del Proyecto

```
e-commerce/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── store/         # Gestión de estado (Zustand)
│   │   ├── services/      # APIs y servicios
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilidades
│   ├── public/            # Archivos estáticos
│   └── package.json
│
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── config/        # Configuraciones
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Definición de rutas
│   │   ├── middleware/    # Middlewares personalizados
│   │   └── services/      # Servicios (email, etc.)
│   ├── uploads/           # Archivos subidos
│   └── package.json
│
├── db/                    # Scripts de base de datos
│   └── init.sql
│
├── nginx/                 # Configuración Nginx
│   └── nginx.conf
│
├── docker-compose.yml     # Orquestación Docker
├── .env.example          # Variables de entorno ejemplo
└── README.md
```

## 🔑 Variables de Entorno Importantes

```bash
# Base de datos
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-access-token
MERCADOPAGO_PUBLIC_KEY=your-public-key
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Servidor
PORT=5000
FRONTEND_URL=https://www.tu-dominio.com
BACKEND_URL=https://api.tu-dominio.com

# Email (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

## 🔐 Configuración de MercadoPago

1. Crear cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Obtener Access Token y Public Key de sandbox/producción
3. Configurar webhook URL: `https://tu-dominio.com/api/payments/webhook`
4. Agregar credenciales al archivo `.env`

## 👤 Usuarios por Defecto

### Admin
- Email: admin@ecommerce.com
- Password: admin123
- Rol: Administrador

### Cliente
- Email: cliente@example.com  
- Password: cliente123
- Rol: Cliente

## 🚀 Deploy en Producción

### Con Docker
```bash
# 1. Configurar variables de producción en .env
# 2. Configurar certificados SSL en nginx/ssl/
# 3. Construir y desplegar
docker-compose --profile production up -d
```

### Proveedores Recomendados
- **Railway**: Deploy automático con Git
- **DigitalOcean**: VPS con Docker
- **AWS**: EC2 + RDS + S3
- **Render**: Frontend + Backend separados

### Checklist de Producción
- [ ] Configurar HTTPS/SSL
- [ ] Variables de entorno de producción
- [ ] Backup automático de base de datos
- [ ] Monitoreo y logs
- [ ] CDN para imágenes (opcional)
- [ ] Rate limiting configurado
- [ ] CORS configurado correctamente

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests (configurar según necesidad)
cd client
npm test
```

## 📊 Monitoreo y Logs

Los logs se almacenan en:
- Backend: `server/logs/`
- Nginx: Container logs
- PostgreSQL: Container logs

## 🤝 Contribución

1. Fork del proyecto
2. Crear branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE.md](LICENSE.md)

## 🆘 Soporte

Para soporte técnico:
- Crear issue en GitHub
- Email: soporte@tu-ecommerce.com
- Documentación: [Wiki del proyecto]

## 📝 Changelog

### v1.0.0 (2025-10-06)
- ✅ Implementación inicial completa
- ✅ Integración MercadoPago
- ✅ Panel de administración
- ✅ Docker setup completo
- ✅ Documentación completa

---

**Desarrollado con ❤️ usando React, Node.js, PostgreSQL y MercadoPago**