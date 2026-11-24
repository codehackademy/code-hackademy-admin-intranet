# codehackademy-shared

Code shared by `codehackademy`, `codehackademy-student`, `codehackademy-admin` and (assumption, spec §21.2) `codehackademy-backend`.
Added to each as a **git submodule** at `shared/`. Each app pins an exact commit and bumps it by pull request.

- `src/constants.ts` roles, statuses, error codes, defaults
- `src/schemas/` Zod schemas (interest form, onboarding, auth, admin inputs)
- `src/time.ts` UTC and IANA time-zone helpers
- `src/design/tokens.css` Tailwind v4 design tokens; `src/design/fonts/` self-hosted Archivo and JetBrains Mono
- `src/ui/` shadcn-pattern primitives (Button, Field, Card, Badge, Alert, AppShell …)
- `src/supabase/` session-isolated Supabase client factories and row types

Roadmap note: the scoring package (`src/scoring`, spec §19.2 vectors) arrives in Phase 2, with `nextProjectDay` in Phase 1.

```bash
pnpm install && pnpm test && pnpm typecheck && pnpm lint
```
