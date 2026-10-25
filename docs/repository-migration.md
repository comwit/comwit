# Repository split

The existing representative repository already resolves to `comwit/comwit`;
its issues, PRs and stars are retained. State/UI retain their extracted public
history. Base/shop start new history from public working-tree snapshots.

Apply the product PRs first, then the parent gitlink PR:

1. https://github.com/comwit/state/pull/1
2. https://github.com/comwit/ui/pull/1
3. https://github.com/comwit/template/pull/1
4. https://github.com/comwit/template-shop/pull/1
5. The dependent `comwit/comwit` repository migration PR.

The parent pins published product PR commits so its recursive clone is testable
before merge. After product merges, confirm those commits remain reachable or
update the gitlinks to the product merge commits (especially after squash/rebase).
Before those PRs merge, use their feature branches for independent clones.
No PR is merged by this migration.

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

- Shop skill updates: the owner will update them later; current skills are unchanged.
- The Comwit service's project-creation default template URL stays unchanged.
  Moving Prism comwit-template to comwit/template is a separate owner TODO.
- GitHub monorepo subdirectory import is not implemented.
- Course templates, npm releases and production docs deployment are out of scope.
