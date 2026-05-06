# Dockerfile para el servidor backend
FROM node:18-alpine

# Instalar curl, wget y postgresql-client para healthchecks y espera de servicios
RUN apk add --no-cache curl wget postgresql-client

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p uploads/products uploads/logos uploads/carousel uploads/payment-proofs uploads/temp logs

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar permisos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 5000

# Dar permisos de ejecución al script de espera
RUN chmod +x wait-for-postgres.sh

# Usar el script como entrypoint para esperar la base de datos
ENTRYPOINT ["sh", "wait-for-postgres.sh"]
CMD ["node", "src/index.js"]