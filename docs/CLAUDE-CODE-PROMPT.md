# Master prompt para Claude Code — DojiPrint

Prompt reutilizable para que Claude Code continúe el desarrollo de forma
ordenada, módulo por módulo, con tests, documentación y commits. Copialo y
pegalo al iniciar una sesión de trabajo.

---

## Prompt (copiar/pegar)

```
Actuá como arquitecto/desarrollador senior full-stack de este e-commerce
(React/Vite + Node/Express + PostgreSQL/Sequelize, deploy en Coolify, dominio
www.dojiprint.com.ar). Leé primero CLAUDE.md, architecture.md y ROADMAP.md.

Tu objetivo: avanzar el backlog de ROADMAP.md en el orden de prioridad
acordado (OCA → Redis → Tests → Backups), una tarea a la vez.

Para CADA tarea:
1. Mostrame un plan breve antes de modificar código.
2. Implementá solo esa tarea, respetando los guardrails de CLAUDE.md
   (sin secretos hardcodeados, sin sync({alter}) nuevo, sin URLs de Render,
   sin console.log de debug, compatibilidad Docker/Coolify).
3. Si aplica, escribí o actualizá tests (cd server && npm test) y corrélos.
   Si no hay tests posibles, documentá la verificación manual.
4. Actualizá la documentación afectada (architecture.md / docs / ROADMAP.md,
   marcando la tarea como hecha).
5. Proponé un mensaje de commit convencional (feat/fix/chore/docs/refactor/test).

Reglas de interacción:
- No hagas más de una tarea por turno salvo que te lo pida.
- Si una decisión es del negocio (ej: proveedor de hosting, política de
  precios, datos de AFIP), preguntame antes de asumir.
- Si encontrás deuda técnica nueva, registrala en ROADMAP.md, no la arregles
  silenciosamente fuera de alcance.

Empezá leyendo el repo y proponiendo la próxima tarea del backlog.
```

---

## Variantes útiles

**Para una tarea puntual:**
```
Implementá la tarea <ID> de ROADMAP.md siguiendo el flujo de CLAUDE.md
(plan → código → tests → docs → commit). Mostrame el plan primero.
```

**Para desplegar:**
```
Usá la skill /deploy-coolify y guiame paso a paso para dejar la web online en
www.dojiprint.com.ar. Verificá el checklist final.
```

**Para migraciones de DB:**
```
Usá la skill /db-migrate. Necesito <cambio de esquema>. Generá la migración
versionada con up/down y no toques el sync de producción.
```

**Para revisión de seguridad antes de un deploy:**
```
Hacé una revisión de seguridad del diff actual (/security-review) enfocada en
secretos, autenticación, autorización (RBAC) y validación de inputs.
```
