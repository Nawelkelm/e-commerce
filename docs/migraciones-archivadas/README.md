# Migraciones archivadas

Estas 15 migraciones quedaron **superadas** por
`server/src/migrations/20240101000000-initial-schema.js`, que crea el esquema
base completo. Se conservan sólo como referencia histórica: ninguna herramienta
las ejecuta.

## Por qué se archivaron

Eran **parches incrementales**: ninguna creaba `Users`, `Products`, `Orders` ni
`Categories`. Servían para modificar un esquema que ya existía, creado por
`sequelize.sync()`.

Eso tenía dos consecuencias:

1. **No podían construir una base desde cero.** Se verificó: sobre una base
   vacía, `db:migrate` falla en la quinta con
   `function uuid_generate_v4() does not exist` — dependen de la extensión
   `uuid-ossp`, que el proyecto no instala porque los UUID se generan del lado
   de Node (`DataTypes.UUIDV4`).

2. **Chocaban con el esquema inicial.** Como ese esquema se generó desde los
   modelos actuales, ya incluye todo lo que estas migraciones agregaban. Correr
   `add-review-fields-to-products` después habría fallado con
   `column "averageRating" already exists`.

Mantenerlas habría roto toda instalación nueva, que es justo lo que la
migración inicial vino a arreglar.

## ¿Se pierde algo?

No. Todo lo que hacían está en el esquema inicial, que se generó con `pg_dump`
sobre una base construida por `sync()` desde los modelos. Se comparó línea por
línea: el esquema que producen las migraciones es idéntico al que producía
`sync()`.

Además, ninguna de estas migraciones llegó a ejecutarse nunca en ninguna base:
el historial (`SequelizeMeta`) estaba vacío hasta que se resolvió V1.9.

## De acá en adelante

Cada cambio de esquema va en una migración nueva en `server/src/migrations/`:

```bash
cd server
npx sequelize-cli migration:generate --name descripcion-del-cambio
npm run db:migrate
```

Ver `architecture.md` sección 6.d.
