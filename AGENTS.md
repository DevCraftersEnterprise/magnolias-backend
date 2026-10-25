# AGENTS.md — magnolias-backend

Guía de forma de trabajo para cualquier agente (o persona) que haga cambios en este repo. NestJS 11 + TypeORM 0.3 + Postgres (Neon), desplegado en Render.

## Flujo por tarea

1. **Analiza antes de tocar código.** Lee el código real involucrado, no asumas — en este repo varias veces el comportamiento real difiere de lo que describe un issue o una llamada de capacitación (ej. un guard que se creía existente en backend en realidad solo vivía en el frontend).
2. **Crea la rama desde `dev` antes de editar cualquier archivo**, nunca edites directo sobre `dev`:
   ```
   git checkout dev && git pull
   git checkout -b <tipo>/<slug-descriptivo>
   ```
   `<tipo>`: `feature/`, `fix/`, `chore/`, `docs/`. Esto aplica también a las promociones `dev → staging` y `staging → prod`: la rama de promoción sale de `origin/dev` (o `origin/staging`) directo, **nunca** de `staging`/`prod` haciendo `merge --no-ff` del siguiente ambiente — eso genera conflictos "add/add" falsos contra el historial squasheado de PRs previas.
3. **Implementa**, incluyendo specs nuevos/actualizados para cada caso de negocio que cambie (no solo el happy path — los guards de permisos, los estados bloqueados y las excepciones de negocio son los que más vale la pena cubrir).
4. **Verifica antes de commitear**, en este orden:
   ```
   npm test
   npm run build
   npm run lint
   ```
   `npm run lint` corre con `--fix` y casi siempre reformatea de paso `src/auth/usecases/login.usecase.spec.ts`, `src/auth/usecases/verify-discount-authorization.usecase.spec.ts` y `src/branch-employees/usecases/verify-employee-pin.usecase.spec.ts` aunque no los hayas tocado — si no eran parte de tu cambio, revierte esos 3 archivos antes de commitear (`git checkout -- <archivo>`) para no ensuciar el diff.
5. **Commit**: mensaje descriptivo explicando el *por qué* del cambio (no solo el qué), terminando con:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```
   Si el mensaje tiene comillas/backticks/saltos de línea, escríbelo a un archivo temporal y usa `git commit -F <archivo>` — pasarlo inline por `-m` en Bash se corrompe fácilmente.
6. **Push + PR** con `gh pr create --base dev --head <rama> --title "..." --body-file <archivo>` (mismo motivo: el cuerpo del PR se escribe a un archivo, no inline). El cuerpo del PR termina con:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```
7. **Auto-merge**: `gh pr merge --auto --squash` inmediatamente después de crear el PR.
8. **Monitorea CI y SonarCloud** (`gh pr checks <n>`) hasta que ambos pasen. El quality gate de SonarCloud exige **≥80% de cobertura en código nuevo** — si falla por cobertura, agrega los casos de prueba que falten y vuelve a empujar, no fuerces el merge.
9. **Verifica que el PR quedó `MERGED`** (`gh pr view <n> --json state`) antes de dar la tarea por terminada.
10. **Borra la rama**, local y remota:
    ```
    git checkout dev && git pull
    git branch -D <rama>
    git push origin --delete <rama>
    ```

No te saltes pasos para ir "más rápido" — el branch protection de `dev`/`staging`/`prod` es estricto y aplica incluso a administradores, no hay atajo de hotfix.

## Promoción entre ambientes

`dev → staging → prod`, siempre en ese orden, nunca directo a `prod`. Antes de crear la rama de promoción, compara **contenido real**, no historial de commits:
```
git diff --stat origin/staging origin/dev
```
(`git log origin/staging..origin/dev` es engañoso después de que `staging` recibe PRs por squash: lista todos los commits originales como "faltantes" aunque su contenido ya esté ahí). El deploy de staging/prod en Render corre migraciones pendientes automáticamente en cada deploy — si tu cambio incluye una migración nueva, avisa cuáles corren en la promoción.

## Notas del entorno

- Node 22. `git autocrlf` está activado — las advertencias de CRLF al hacer `add`/`commit` son normales, ignóralas.
- No hay Python disponible en este entorno; usa Node para scripts puntuales.
- Los usecases siguen el patrón Controller → Service → UseCase.execute(); los nuevos guards de negocio (quién puede hacer qué, en qué estado) casi siempre viven dentro del usecase, no en el controller.
