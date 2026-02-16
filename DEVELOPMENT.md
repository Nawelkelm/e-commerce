# Configuración de Desarrollo Local

## Instalación Paso a Paso

### 1. Preparar el entorno
```bash
# Clonar repositorio
git clone <repo-url>
cd e-commerce

# Copiar variables de entorno
cp .env.example .env
```

### 2. Configurar archivo .env
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=admin
DB_PASSWORD=

# JWT (generar una clave segura)
JWT_SECRET=mi-clave-super-secreta-para-jwt-development
JWT_EXPIRES_IN=7d

# MercadoPago (obtener de https://www.mercadopago.com.ar/developers)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-de-sandbox
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-de-sandbox
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# Configuración del servidor
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email (opcional - para recuperación de contraseñas)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
```

### 3. Desarrollo con Docker (Recomendado)
```bash
# Instalar todas las dependencias
npm run install:all

# Levantar servicios
npm run docker:up

# Ver logs
docker-compose logs -f

# Detener servicios
npm run docker:down
```

### 4. Desarrollo sin Docker
```bash
# Terminal 1: Base de datos (instalar PostgreSQL localmente)
createdb ecommerce_db

# Terminal 2: Backend
cd server
npm install
npm run dev

# Terminal 3: Frontend  
cd client
npm install
npm run dev
```

## URLs de Desarrollo
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Base de datos: localhost:5432

## Comandos Útiles

### Docker
```bash
# Reconstruir contenedores
npm run docker:rebuild

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres

# Acceder a la base de datos
docker-compose exec postgres psql -U postgres -d ecommerce_db

# Limpiar volúmenes Docker
docker-compose down -v
```

### Base de datos
```bash
# Dentro del contenedor de postgres
docker-compose exec postgres psql -U postgres -d ecommerce_db

# Comandos SQL útiles
\dt  # Listar tablas
\d "Users"  # Describir tabla Users
SELECT * FROM "Users" LIMIT 5;
```

### Backend
```bash
cd server

# Instalar nueva dependencia
npm install nueva-libreria

# Ejecutar migraciones manualmente
npm run db:migrate

# Reiniciar en desarrollo
npm run dev
```

### Frontend
```bash
cd client

# Instalar nueva dependencia
npm install nueva-libreria

# Build de producción
npm run build

# Previsualizar build
npm run preview
```

## Estructura de Desarrollo

### Flujo de trabajo típico
1. Crear nueva rama: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar cambios
3. Probar localmente con `npm run dev`
4. Commit y push
5. Crear Pull Request

### Agregando nuevas funcionalidades

#### Nuevo endpoint en backend
```javascript
// 1. Crear controller en server/src/controllers/
// 2. Agregar rutas en server/src/routes/
// 3. Agregar validaciones con express-validator
// 4. Probar con Postman/Thunder Client
```

#### Nuevo componente en frontend
```javascript
// 1. Crear componente en client/src/components/
// 2. Agregar a las rutas en App.jsx si es necesario
// 3. Conectar con store de Zustand si maneja estado
// 4. Agregar estilos con TailwindCSS
```

## Debugging

### Backend
```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Debugger con VS Code
# Agregar configuración launch.json
```

### Frontend
```bash
# React DevTools (extensión de navegador)
# Redux DevTools si usas Redux
# Console del navegador para errores
```

### Base de datos
```bash
# Conectarse a PostgreSQL
docker-compose exec postgres psql -U postgres -d ecommerce_db

# Backup de desarrollo
docker-compose exec postgres pg_dump -U postgres ecommerce_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres -d ecommerce_db < backup.sql
```

## Testing

### Configurar tests de backend
```bash
cd server
npm test

# Con coverage
npm run test:coverage
```

### Configurar tests de frontend
```bash
cd client
# Instalar testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Ejecutar tests
npm test
```

## Solución de Problemas Comunes

### Puerto ya en uso
```bash
# Encontrar proceso usando puerto 5000
lsof -ti:5000
kill -9 <PID>

# O cambiar puerto en .env
PORT=5001
```

### Problemas con Docker
```bash
# Limpiar todo Docker
docker system prune -a

# Reconstruir desde cero
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Problemas con base de datos
```bash
# Resetear base de datos completamente
docker-compose down -v
docker-compose up postgres
# Esperar a que inicie
docker-compose up backend
```

### Hot reload no funciona
```bash
# Frontend - verificar que Vite esté configurado correctamente
# Backend - verificar que nodemon esté instalado
npm install --save-dev nodemon
```