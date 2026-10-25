# Repository guide

Comwit is a pnpm workspace containing independent State and UI libraries used in comwit.io templates.

## Commands

- `pnpm install` — install the pinned workspace dependencies.
- `pnpm build` — build the two runtime packages, generate UI docs, and build the docs site.
- `pnpm test` — State tests and workspace/CLI integration tests.
- `pnpm typecheck` — generate required artifacts and typecheck workspaces.
- `pnpm dev:docs` — start the shared documentation app.
- `pnpm dev:state` / `pnpm dev:ui` — watch-build a runtime.
- `pnpm dev:playground`, `pnpm dev:ui-catalog`, `pnpm storybook` — development apps.

## Boundaries

- `packages/state/core` (`@comwit/state`) owns state, query/local descriptors, actions and interceptors. `es-toolkit` is its sole runtime dependency. Its Vitest configuration is in `vite.config.ts`; React integration tests use happy-dom.
- `packages/ui/core` (`@comwit/ui`) owns headless behavior and accessibility, and ships the original icon set as subpath exports (`@comwit/ui/icons`, `/icons/animated`, `/icons/catalog`). `src/icons/{index,animated,catalog}.ts` and `src/icons/generated/` are written by `scripts/generate-icons.mjs` from `src/icons/definitions/`; edit the definitions, never the generated entries.
- `packages/ui/templates` (`@comwit/ui-templates`) owns editable component source and the shared CSS token contract.
- `packages/ui/cli` (`comwit-ui`) installs component source into consumer projects. Generate its registry from templates; do not edit generated JSON.
- `templates/base` and `templates/shop` are independent source repositories. Keep their code, settings and skills aligned with their maintained source; preserve each repository's own pnpm lockfile and standalone setup. Never include them in the parent pnpm workspace.
- `packages/template` (`create-comwit`) exports the pinned `templates/base` source during `prepack`; its ignored `template/` directory is generated packaging output, never a second source.
- `apps/docs` owns the shared site, product-specific human docs and separate llms.txt files. Generate UI previews from Storybook specs and registry source. Template guides live in `content/template`.

Keep public package names, independent versions, and runtime exports stable during repository maintenance. Site branding must not change the UI library's token defaults. Never couple the UI engine to State just to support a docs example.

See CONTRIBUTING.md for generation, verification and release details.

## Repository ownership

All changes to the Comwit open-source projects (State, UI, Template, shop template
and this parent repository) must go through a branch and pull request in the
repository that owns each changed file, including work from standalone clones.
Never push changes directly to `main`. Validate before merging and release from
the reviewed, merged source. Push submodule commits first;
update the parent gitlink in a separate parent commit/PR. Do not mix or overwrite
other repositories' or users' changes. Verify standalone operation and integrated
docs. `packages/ui/apps/storybook` and `packages/ui/apps/ui-dev` belong to UI.

Sibling `comwit-*` clones and parent submodules are separate checkouts of the same
remotes, not live-synchronized folders. Preserve each checkout's local settings;
push/fetch commits explicitly and update the parent gitlink when adopting changes.
