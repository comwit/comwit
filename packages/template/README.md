# create-comwit

Create a Next.js app from the maintained [Comwit template](https://github.com/comwit/template):

```bash
npm create comwit@latest my-app
```

Source is `templates/base` in the parent repository. `pnpm pack` runs `prepack`,
exports the pinned public files and verifies their contents. The ignored `template/`
directory is packaging output, not a separately maintained template. In a source
checkout the CLI reads the submodule directly; published tarballs carry the same
snapshot. Project name substitution is the only default source change.

The source includes Comwit Cloud configuration, skills and rules. No real credentials,
local databases, uploads or build output are packaged. Use `.env.example` for setup.
The application installs independently of this workspace.

Options: `--name`, `--pm`, `--no-install`, `--no-git`, `--cwd`, `--dry` and
`--opennext`. The explicit OpenNext option replaces the build adapter in the generated
project for Cloudflare Workers; it never changes the maintained template source.

This change does not publish a new npm release. Existing registry versions remain as
published until a maintainer requests a release.

Documentation: https://library.comwit.io/template
