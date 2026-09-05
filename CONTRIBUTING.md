# Contributing

Thanks for helping improve tf-arch-diagram-generator. This project turns Terraform plans into architecture diagrams for AWS, Google Cloud and Azure, and the most valuable contributions are usually **new resource mappings** and **better relationship inference** for clouds you use daily.

## Getting set up

```bash
git clone https://github.com/mchittineni/tf-arch-diagram-generator.git
cd tf-arch-diagram-generator
npm install
npm run dev            # interactive viewer on http://localhost:5173
npm run build          # the serve integration tests need dist/
npm test               # full suite (Node's built-in test runner)
npm run test:coverage  # suite + coverage gate
```

Coverage floor, enforced in CI by `scripts/check-coverage.mjs`: **90% line
coverage overall and per file**, 80% branches overall, and every source file
must be exercised by at least one test (files absent from the coverage report
fail the gate). `src/main.js` is exempt — it imports CSS, so it is verified by
the headless-browser checks instead.

Requirements: Node 22 or newer — the project supports only [actively maintained Node lines](https://nodejs.org/en/about/previous-releases) (currently 22, 24 and 26; the floor rises when a line reaches end-of-life). There are no runtime dependencies — please keep it that way. The dev dependencies are Vite (build), jsdom (DOM tests), commitlint + husky (commit hygiene) and semantic-release (publishing).

## Project layout

```
bin/cli.js                 tf-arch CLI (serve / render / inspect) with a hardened
                           local HTTP server (CSP, host validation, caching)
scripts/fetch-icons.mjs    semiannual vendor icon refresh (+ scripts/lib/unzip.mjs)
scripts/scan-svg-assets.mjs blocks active content in the vendor SVGs
scripts/check-coverage.mjs coverage gate (per-file floor + completeness check)
scripts/brew-formula.mjs   emits the Homebrew formula for a published npm
                           version (URL + verified sha256); publish.yml pushes
                           its output to mchittineni/homebrew-tap
src/index.js               programmatic API surface
src/providers/             one directory per cloud — the extension point
  index.js                 registry + type→provider resolution
  aws/ gcp/ azure/         icons.js (SVG set) + index.js (provider definition)
src/parser/                plan JSON → provider-agnostic resource graph & reference links
src/canvas/layoutEngine.js graph → positioned containers, nodes & perimeter-snapped connectors
src/canvas/svgRenderer.js  pure SVG string builders with traffic/security/peering styles
src/canvas/DiagramCanvas.js interactive viewport (pan, zoom, filter, spotlight, label toggle)
src/main.js                browser entry point (CSS + bootstrap only)
src/app.js                 application shell — testable in jsdom
src/components/            navbar, sidebar, inspector (diffs & connected links), import modal
src/data/samples/          demo plans per cloud
examples/*.plan.json       the same plans as standalone files for the CLI
test/parser.test.js        parsing, hierarchy, multi-cloud, reference links, perimeter snapping
test/app.test.js           full app mounted in jsdom (catches blank-page bugs)
test/ui.test.js            canvas pan/zoom, spotlighting, edge toggle, inspector navigation
test/security.test.js      hostile-plan injection and malformed-input handling
python/                    the PyPI distribution: a thin wrapper that bundles
                           bin/ src/ dist/ into the wheel and runs them on the
                           local Node (pyproject.toml, tf_arch/, tests/)
test/api.test.js           the published npm API contract
test/cli.test.js           tf-arch CLI behaviour, incl. the Node-version guard
test/serve.test.js         the local server over real sockets (headers, traversal,
                           DNS rebinding, crash resilience, ETag/304 caching)
```

The important boundary: **`svgRenderer.js` and everything it imports must never touch the DOM**, because the CLI renders SVG in Node using the same code the browser uses.

## Adding a resource type

Most contributions are one line. Open the provider's `index.js` and add an entry to `RESOURCE_MAP`:

```js
// src/providers/gcp/index.js
google_workflows_workflow: 'eventarc',
```

If no existing icon fits, add one to that provider's `icons.js`:

```js
workflows: {
  category: 'integration',           // must be a key in CATEGORIES
  name: 'Workflows',                 // shown on the node and in the inspector
  svg: `<svg viewBox="0 0 64 64" ...>...</svg>`
}
```

Icon guidelines: `viewBox="0 0 64 64"`, a filled rounded-rect background in the service's category color, white strokes/fills for the glyph, no external references, no `id` attributes (icons are inlined many times per diagram).

## Adding relationship inference

Traffic-flow edges live in each provider's `inferEdges(nodes, addEdge)`. It receives **only that provider's** resources, so edges never cross clouds:

```js
inferEdges(nodes, addEdge) {
  const gateways = nodes.filter(n => n.type === 'google_api_gateway_gateway');
  const services = nodes.filter(n => n.type.startsWith('google_cloud_run'));
  gateways.forEach(g => services.forEach(s => addEdge(g.id, s.id, 'Invoke')));
}
```

Keep labels short (they render inside a small pill) and prefer protocol/port hints where they help a reviewer, e.g. `SQL TCP:5432`.

## Adding a whole cloud provider

1. Create `src/providers/<id>/icons.js` exporting `CATEGORIES` and `ICONS`.
2. Create `src/providers/<id>/index.js` exporting a provider object with: `id`, `name`, `shortName`, `accentColor`, `typePrefixes`, `categories`, `icons`, `resourceMap`, `genericIconKey`, `terms`, `hierarchy`, `inferEdges()`, `isEntryResource()`.
3. Register it in `src/providers/index.js`.
4. Add a sample plan under `src/data/samples/` and export it from `samplePlans.js`.
5. Add hierarchy assertions to `test/parser.test.js`.

Reuse the shared category keys (`compute`, `containers`, `networking`, `storage`, `database`, `security`, `management`, `integration`, `analytics`, `general`) so the category filter stays consistent for multi-cloud plans.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/),
because [semantic-release](https://semantic-release.gitbook.io/) derives the
version, changelog and npm publish from them.

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`.

Scopes: `providers`, `aws`, `gcp`, `azure`, `parser`, `layout`, `renderer`,
`ui`, `cli`, `api`, `samples`, `icons`, `scripts`, `deps`, `release`, `readme`,
`docs`, `test`, `ci`.

```bash
feat(azure): map azurerm_container_app_job to container_app
fix(layout): stop orphan subnets vanishing from the diagram
chore(icons): refresh cloud architecture icon sets
feat(api)!: rename parentVpcId to parentNetworkId
```

A `!` before the colon (or a `BREAKING CHANGE:` footer) triggers a major
release. `feat` gives a minor, everything else a patch.

Two husky hooks run automatically after `npm install`:

- `commit-msg` — rejects a message commitlint does not accept
- `pre-commit` — runs `npm test`

CI re-checks every commit in a PR plus the PR title, so a squash-merge title
must be conventional too. A checkout therefore always reports the version of
the last *committed* `package.json` (`tf-arch --version` prints `1.0.0` from a
clone even after later npm releases) — quote the npm/pip/brew version when
filing bugs. **Do not** bump the version in `package.json` —
semantic-release derives versions from git tags, and release notes are
published on the GitHub Releases page. The same workflow publishes the Python
wheel to PyPI and updates the Homebrew tap; if the tap step was skipped (no
`TAP_GITHUB_TOKEN` secret) run `node scripts/brew-formula.mjs <version>` and
commit the output as `Formula/tf-arch.rb` in the tap repo.

## Refreshing the vendor icon sets

`assets/icons/` holds the official AWS, GCP and Azure architecture icons as
reference assets, refreshed by a semiannual GitHub Actions job (1 January and
1 July) that opens a PR only when upstream actually changes.

```bash
npm run icons:update              # all clouds
npm run icons:update -- -c gcp    # one cloud
npm run icons:check               # verify against the committed manifest
```

Add or repoint a source in [`scripts/icons/sources.json`](scripts/icons/sources.json).
The downloader is dependency-free: it reads the bundle with a small ZIP reader
built on `node:zlib` (`scripts/lib/unzip.mjs`) and writes vendor bytes through
untouched, since vendor terms forbid modifying the icons.

These assets are **not** MIT-licensed and are excluded from the npm package —
read [`assets/icons/NOTICE.md`](assets/icons/NOTICE.md) before using them
anywhere.

## Pull requests

- One logical change per PR; describe what a reviewer should see differently in the diagram.
- Use a Conventional Commit title (see above) — it becomes the release note.
- Run `npm test` and `npm run build` before pushing.
- If you touch `python/`, also run its suite (needs Node 22+ on PATH and `pip install build`):
  `python -m build python/ --outdir python/dist && pip install python/dist/*.whl && python -m unittest discover -s python/tests -t python/tests`.
  The Python package has no logic of its own beyond locating Node and shelling out — keep it that way; behaviour belongs in `bin/cli.js` so both distributions stay identical.
- Add or update a test for parsing/hierarchy changes.
- **Never commit real plan files.** Plans contain account ids, IP ranges and sometimes secrets. `.gitignore` blocks `plan.json`, `*.tfstate` and `*.tfplan`; sanitize anything you add to `examples/`.
- No new runtime dependencies without discussing it in an issue first.

## Code style

Match the surrounding code: ES modules, 2-space indent, single quotes, semicolons. Comments explain *why*, not *what*. No build step or transpilation — the browser and Node both run the source as-is.

## Reporting bugs

Open an issue with a **minimal, sanitized** plan excerpt that reproduces the problem, the resource types involved, and what you expected the diagram to show. `tf-arch inspect plan.json --json` output is often the fastest way to show how a plan was interpreted.
