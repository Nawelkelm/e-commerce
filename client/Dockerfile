FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# VITE_API_URL se inyecta en build-time (en Coolify: build variable)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build

# --- Producción: nginx sirve el SPA estático ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
