# Comwit

[Comwit](https://github.com/comwit/comwit) is the shared development workspace,
documentation and integration test repository for independent State, UI and templates.

| Repository                                                      | Checkout                                        | Owns                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| [comwit/state](https://github.com/comwit/state)                 | `packages/state`                                | `core/`: `@comwit/state`                                                |
| [comwit/ui](https://github.com/comwit/ui)                       | `packages/ui`                                   | `core/`, `templates/`, `cli/`, Storybook and the UI development catalog |
| [comwit/template](https://github.com/comwit/template)           | `templates/base`                                | Maintained base Next.js app, including its settings, skills and rules   |
| [comwit/template-shop](https://github.com/comwit/template-shop) | `templates/shop`                                | Shop app source, skills and rules                                       |
| This repository                                                 | `apps/docs`, `apps/state-playground`, `scripts` | Shared docs, examples and integration checks                            |

State and UI are independent products. Public npm package names and APIs stay the same.
The base template matches the maintainer's `comwit-template` working-tree snapshot;
shop matches the maintained shop backend. Each template's `PUBLIC_SOURCE.json`
records the original public files and their hashes. The former infrastructure-neutral
copy is removed. `create-comwit` packages the pinned `templates/base` source.

## Develop from the root

```bash
git clone --recurse-submodules https://github.com/comwit/comwit.git
cd comwit
pnpm install --frozen-lockfile
pnpm dev:docs
```

For an existing clone, run `git submodule update --init --recursive` first.
Edit files directly inside the submodules. Docs import the workspace State/UI
packages and generate live examples from `packages/ui/apps/storybook/specs/`.
`pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm --filter docs lint` check
integration. `pnpm storybook` opens UI's own Storybook.

Templates keep independent dependency graphs and lockfiles; they are deliberately
outside the parent pnpm workspace:

```bash
pnpm template:install
pnpm template:validate
pnpm template:build
pnpm shop:install
pnpm shop:validate
pnpm shop:build
```

## Independent clone

Clone any product repository directly and run `pnpm install --frozen-lockfile`.
State/UI support `pnpm build`, `pnpm test` and `pnpm typecheck`; templates support
`pnpm validate` and `pnpm build`. See each repository's README or `PUBLIC.md`.
Template cloud services use your own `.env`; no real credentials or user data ship.

## Branches and pull requests

Submodules check out the exact commit recorded by the parent, usually detached.
Create a branch in the repository you intend to edit:

```bash
git -C packages/ui switch -c my-ui-change
# edit, validate, commit and push inside packages/ui; open its PR
# after the UI PR is merged, select its merge commit locally
git -C packages/ui fetch origin
git -C packages/ui switch --detach origin/main
git add packages/ui
git commit -m "chore: update UI reference"
# push the parent branch and open a separate parent PR
```

Push submodule commits before the parent reference. Never overwrite local changes
with a submodule update; inspect `git status` in each repository first.
Merge product PRs before their dependent parent PR; the parent's gitlinks must refer
to published commits. Do not mix another repository's or user's pending changes.

Docs: [State](https://library.comwit.io/state/docs),
[UI](https://library.comwit.io/ui), [Template](https://library.comwit.io/template).
The representative introduction and Star link is [comwit/comwit](https://github.com/comwit/comwit).
Stars remain separate for each repository.
