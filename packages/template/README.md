# create-comwit

Create a Next.js app from the maintained [Comwit template](https://github.com/comwit/template):

```bash
npm create comwit@latest my-app -- --pm pnpm
```

Create a shop with product, inventory, cart, order and admin pages:

```bash
npm create comwit@latest my-shop -- --shop --pm pnpm
```

Create a course platform with courses, enrollments, payments and admin pages:

```bash
npm create comwit@latest my-course -- --course --pm pnpm
```

Sources are `comwit/template`’s `main`, `shop` and `course` branches, pinned as
`templates/base`, `templates/shop` and `templates/course` in the parent repository. `pnpm pack` runs `prepack`,
exports the pinned public files and verifies their contents. The ignored `template/`,
`shop-template/` and `course-template/` directories are packaging output, not separately maintained sources. In a source
checkout the CLI reads the submodule directly; published tarballs carry the same
snapshot. Project name substitution is the only default source change.

The source includes Comwit Cloud configuration, skills and rules. No real credentials,
local databases, uploads or build output are packaged. Use `.env.example` for setup.
The application installs independently of this workspace.

Options: `--shop`, `--course`, `--name`, `--pm`, `--no-install`, `--no-git`, `--cwd`, `--dry` and
`--opennext`. The explicit OpenNext option replaces the build adapter in the generated
base project for Cloudflare Workers. It cannot be combined with `--shop` or `--course`.
`template-sources.json` in the package records the shared repository, source branch and exact commit for each bundled template.

Use Node.js 22.16 or later and pnpm 11.3.0 for the generated application. The
command installs dependencies and creates a new initial Git commit when Git is
available. It never copies the upstream repository history or configures a remote.
Use `--no-git` to skip initialization; inside an existing repository, the CLI leaves
its history unchanged.

Documentation: https://library.comwit.io/template
