# Docs hosting

The docs app builds for Comwit Cloud with `@brrrd/adapter`, following the existing
comwit-cloud web build convention. `pnpm build` produces `apps/docs/dist/brrrd`.
MDX content and OG assets are explicitly included in file tracing so request-time
pages can read them after deployment.

## Environment

| Name             | Storage                   | Purpose                                          |
| ---------------- | ------------------------- | ------------------------------------------------ |
| `COMWIT_PROJECT` | Local environment         | Target Cloud project                             |
| `COMWIT_APP`     | Local environment         | Dedicated docs app                               |
| `SITE_URL`       | Build/runtime environment | Public origin for metadata and agent-guide links |
| `GIT_SHA`        | Build environment         | Revision exposed by `/api/health`                |

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

## Manual deployment only

Pushing to main runs validation CI and does not deploy the site. Deploy manually
with the logged-in Comwit CLI and the commands above. No GitHub deployment token
or deployment workflow is required.

Real `.env` and `.env.*` files are ignored throughout this repository. The tracked
`apps/docs/.env.example` contains blank variable names only. Keep local environment
files and the CLI authentication config on your machine; never commit them.

On macOS the deploy helper disables AppleDouble resource-fork packaging. Content
discovery also ignores hidden metadata files; MDX is bundled for the isolate
runtime instead of relying on native Node package-import resolution.
