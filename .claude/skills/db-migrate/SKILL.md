---
name: db-migrate
description: Flujo seguro de migraciones de base de datos (Sequelize) para el e-commerce. Úsala al crear/modificar modelos o columnas, o al reemplazar el sync({alter}) por migraciones versionadas. Evita pérdida de datos y el hack de ENUM en el arranque.
---

# Migraciones de DB — Sequelize

Contexto: hoy el server usa `sequelize.sync({ alter: true })` + un hack que
convierte ENUM→VARCHAR en cada arranque (`server/src/index.js`). Es frágil y
peligroso en producción. El objetivo es migrar a **migraciones versionadas**.

## Reglas de oro
- **Nunca** correr `sync({ alter: true })` contra producción.
- Toda cambio de esquema = una migración con `up` y `down` reversibles.
- Probar la migración en una DB de desarrollo/copia antes de producción.
- Hacer backup (o snapshot) antes de migrar en producción.

## Crear una migración
```bash
cd server
npx sequelize-cli migration:generate --name describe-el-cambio
# editar el archivo en src/migrations/ con up()/down()
npx sequelize-cli db:migrate          # aplicar
npx sequelize-cli db:migrate:undo     # revertir la última
```

## Al modificar un modelo Sequelize
1. Editar el modelo en `server/src/models/`.
2. Crear la migración correspondiente (no confiar en `sync`).
3. Si hay ENUM: preferir `VARCHAR` + validación en el modelo (`validate: { isIn }`) para evitar el problema histórico de ENUM en Postgres.
4. Verde local → documentar en `architecture.md` si cambia el dominio.

## Limpieza pendiente (ver ROADMAP V1.3/M.8)
- Hay migraciones duplicadas: `create-coupons` (×2) y `add-categoryIcons` (×3) en `server/src/migrations/`. Consolidar antes de habilitar `db:migrate` en CI/prod.
- Una vez con migraciones reales: cambiar `index.js` para correr `sync` **solo** en `NODE_ENV=development` y `db:migrate` en producción.

## Verificación
```bash
cd server && node --check src/index.js
# y, con una DB de prueba levantada:
npx sequelize-cli db:migrate:status
```
