# Repository layout and template branches

The existing representative repository already resolves to `comwit/comwit`;
its issues, PRs and stars are retained. State/UI retain their extracted public
history. The initial base/shop snapshots started new history from public working-tree sources.

The initial product split used separate repositories. Base and shop are now
maintained as `main` and `shop` branches of `comwit/template`; the parent keeps
two pinned submodule checkouts of that repository. The initial split was integrated
by https://github.com/comwit/comwit/pull/141; parent PRs continue to target `main`.
The representative repository uses `main` as its default and CI branch; the former
`latest` branch has no unique commits and is being retired. npm `latest` tags are
unchanged.

Snapshot verification: base has 322 original public files; shop has 559.
Their source code, settings, skills and rules match byte-for-byte, including
uncommitted public changes. Added metadata is `PUBLIC_SOURCE.json`, `PUBLIC.md`,
LICENSE and CI. No original Git history or ignored local environment, credential,
database, upload, cache or build files is imported. Fingerprints are in each repo.
Source scans found no credential candidates after excluding only verified generated
SHA-256 manifests from secret classification. History scans for State/UI also passed.

Validation covers frozen standalone installs; library/template builds; State/UI,
agent and shop tests; type/lint checks; Storybook/catalog builds; parent docs and
integration tests; and packed create-comwit source fidelity. Tests use mocks or
isolated fixtures, not real shop payment, notification or production data.

## Deferred

- GitHub monorepo subdirectory import is not implemented.
- Course templates, npm releases and production docs deployment are out of scope.

## Handoff to the service integration owner

| Source repository                  | Branch | Source commit pinned by the parent |
| ---------------------------------- | ------ | ---------------------------------- |
| https://github.com/comwit/template | `main` | See the `templates/base` gitlink   |
| https://github.com/comwit/template | `shop` | See the `templates/shop` gitlink   |

These refs install and build independently. The shop application needs its own
configured resource/auth environment for real runtime data; tests and Storybook
use isolated fixtures/mocks. Runtime project creation must resolve the selected
`main` or `shop` branch to a commit in this same repository. The service integration
owner manages that selection; this parent manages the docs and packaged CLI sources.

Parent clean-clone verification passed: recursive GitHub clone, frozen workspace
install, docs production build, 16 source/submodule/CLI integration checks and the
State playground build. A live docs Dialog example was opened in the browser.

Docs present the base as an editable open-source Next.js template. Optional default
Comwit integrations and their edit points are described separately in
`/template/docs/integrations`; starting the mock-backed base does not require a
Comwit account. The maintained source itself remains unchanged.
