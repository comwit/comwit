# Docs hosting

The docs app builds for Comwit Cloud with `@brrrd/adapter`, following the existing
comwit-cloud web build convention. `pnpm build` produces `apps/docs/dist/brrrd`.
MDX content and OG assets are explicitly included in file tracing so request-time
pages can read them after deployment.

## Environment

| Name                  | Storage                                     | Purpose                                          |
| --------------------- | ------------------------------------------- | ------------------------------------------------ |
| `COMWIT_PROJECT`      | Local environment / GitHub variable         | Target Cloud project                             |
| `COMWIT_APP`          | Local environment / GitHub variable         | Dedicated docs app                               |
| `SITE_URL`            | Build/runtime environment / GitHub variable | Public origin for metadata and agent-guide links |
| `GIT_SHA`             | Build environment                           | Revision exposed by `/api/health`                |
| `COMWIT_DEPLOY_TOKEN` | GitHub Actions secret only                  | Dedicated `app:read` / `app:deploy` credential   |

No target IDs, deployment URLs or credentials belong in source. The docs runtime
needs no deployment credential. Local `comwit` uses its own logged-in CLI config;
never copy the internal platform server token into this repository or CI.

```bash
pnpm install --frozen-lockfile
GIT_SHA="$(git rev-parse HEAD)" pnpm build
pnpm docs:deploy
```

Export `COMWIT_PROJECT`, `COMWIT_APP` and `SITE_URL` before these commands.
`node scripts/deploy-docs.mjs --check` verifies target configuration and the
packaged documentation before upload. Verify `/api/health` and representative
State, UI, Template, blog and llms.txt paths after deployment.

Vercel-specific repository configuration has been removed. Custom-domain DNS is
separate from deploying the app to its provider-assigned public URL.
