# Comwit docs

This app belongs to [comwit/comwit](https://github.com/comwit/comwit). State and UI
are imported from `../../packages/state/core` and the UI submodule's packages.
Live UI examples come from `../../packages/ui/apps/storybook/specs/`; the registry
and component source remain in that same UI repository.

```bash
git clone --branch main --recurse-submodules https://github.com/comwit/comwit.git
cd comwit
pnpm install --frozen-lockfile
pnpm dev:docs
pnpm build
```

`pnpm --filter docs gen` builds the UI registry and generates example modules.
Edit original UI components/specs in `packages/ui`, not generated docs.
Human docs have matching English and Korean MDX files; run
`pnpm --filter docs test:i18n` and `pnpm --filter docs lint` after changes.

`templates/base` pins the `main` branch of `comwit/template`;
`templates/shop` pins its `shop` branch. Their public
source manifests record the exact snapshot. They install and run independently,
outside the parent workspace. The `create-comwit` pack step exports the pinned
base and shop submodules instead of maintaining separate source copies.

For edits inside a submodule, branch, validate, commit, push and open a PR there
first. Update its parent reference in a separate parent PR. Independent clones
use the product repository's own pnpm workspace. See the root README for commands.

The CI branch is `main`. Vercel-specific repository configuration has been removed;
CI validates builds only. Manual Comwit CLI deployment is documented in `../../docs/deployment.md`.
Sibling `comwit-state`, `comwit-ui` and template clones are independent working
trees; edits reach this workspace through pushed commits and submodule updates.
