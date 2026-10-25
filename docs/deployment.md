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

## Main automation

`.github/workflows/deploy-docs.yml` runs after successful main CI, or by manual
dispatch on main. It checks out the verified SHA, skips obsolete main revisions,
builds the artifact, deploys with a pinned CLI and verifies the public revision
plus representative English/Korean routes. The deploy credential is available only
after the build and is stored in a temporary mode-0600 CLI config, then removed.

Configure `COMWIT_PROJECT`, `COMWIT_APP`, `COMWIT_API_URL` and `SITE_URL` as GitHub
variables. Add a dedicated project token with `app:read` and `app:deploy` as the
`COMWIT_DEPLOY_TOKEN` secret, then set `COMWIT_DEPLOY_ENABLED=true`. The workflow
stays disabled until that explicit setup is complete. Do not use an internal
platform server token or a broad personal development credential for automation.

On macOS the deploy helper disables AppleDouble resource-fork packaging. Content
discovery also ignores hidden metadata files; MDX is bundled for the isolate
runtime instead of relying on native Node package-import resolution.
