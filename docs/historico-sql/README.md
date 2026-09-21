# SQL histórico

Estos archivos **no son migraciones** y no los ejecuta ninguna herramienta.

Son cambios de esquema que en su momento se aplicaron **a mano** con `psql`,
antes de que el proyecto tuviera migraciones versionadas funcionando. Vivían
repartidos en dos carpetas (`migrations/` en la raíz y `server/migrations/`),
y una de ellas era justamente donde `sequelize-cli` buscaba por defecto, lo que
hacía que `npm run db:migrate` apuntara al lugar equivocado.

Se conservan como referencia: todo lo que hacen ya está en los modelos de
Sequelize y en el esquema actual.

## Dónde van los cambios de esquema ahora

En `server/src/migrations/`, como migraciones versionadas de `sequelize-cli`:

```bash
cd server
npx sequelize-cli migration:generate --name descripcion-del-cambio
npm run db:migrate
```

Ver `architecture.md` para el detalle del flujo, incluido `npm run db:baseline`,
que hace falta una sola vez en bases que ya estaban en uso.
