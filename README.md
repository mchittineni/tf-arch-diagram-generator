# Terraform Architecture Diagram Generator

[![npm version](https://img.shields.io/npm/v/tf-arch-diagram-generator?logo=npm&color=cb3837)](https://www.npmjs.com/package/tf-arch-diagram-generator)
[![CI](https://github.com/mchittineni/tf-arch-diagram-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mchittineni/tf-arch-diagram-generator/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/tf-arch-diagram-generator?logo=nodedotjs)](https://nodejs.org/en/about/previous-releases)
[![license](https://img.shields.io/npm/l/tf-arch-diagram-generator)](LICENSE)

Turn any Terraform plan into an interactive cloud architecture diagram — for **AWS**, **Google Cloud** and **Azure**, including plans that span all three.

Point it at `terraform show -json` output and get a diagram with the real hierarchy (network → zone → subnet → resource), inferred traffic flows, and per-resource plan diffs. Runs as a CLI, a local web viewer, or a library.

```bash
terraform plan -out=tfplan && terraform show -json tfplan > plan.json

npx tf-arch-diagram-generator serve plan.json --open      # interactive viewer
npx tf-arch-diagram-generator render plan.json -o arch.svg # standalone SVG, no browser
```

## Features

- **Three clouds, one tool** — AWS (`aws_*`), Google Cloud (`google_*`) and Azure (`azurerm_*` / `azuread_*`), with 265 resource types mapped across 104 service icons — the **official vendor architecture icons**, embedded verbatim from the AWS / Google Cloud / Azure icon sets. A multi-provider plan renders as one band per cloud.
- **Real containment hierarchy** — VPC / VPC Network / Virtual Network, availability zones and regions, public vs. private subnets. Nested references resolve too (`network_interface[0].subnetwork`, `ip_configuration[0].subnet_id`, `default_node_pool[0].vnet_subnet_id`).
- **Inferred traffic flows** — Route 53 → CloudFront → ALB → EC2 → RDS, Cloud DNS → Global LB → Cloud Run → Cloud SQL, DNS → Front Door → App Gateway → VMSS → Azure SQL, and many more. Inference is per-provider, so edges never cross clouds by accident.
- **Plan-aware** — `+ create`, `~ update`, `- destroy` badges on every node, with attribute-level before/after diffs in the inspector.
- **Native provider vocabulary** — a GCP resource reads "VPC Network / Subnetwork / Zone / Labels"; an Azure one reads "Virtual Network / Subnet / Location / Resource Group".
- **Headless rendering** — `tf-arch render` produces SVG in pure Node. No browser, no Puppeteer. Good for CI and for committing diagrams next to your modules.
- **Hardened local viewer** — `tf-arch serve` binds to loopback, validates the Host header (blocks DNS rebinding), sends a strict Content-Security-Policy, allows only GET/HEAD, and contains file access to the built assets (symlinks included).
- **Zero runtime dependencies** — nothing is uploaded, nothing phones home.

## Install

```bash
# One-off, no install
npx tf-arch-diagram-generator --help

# Project dev dependency (CI, docs generation)
npm install --save-dev tf-arch-diagram-generator

# Global CLI
npm install -g tf-arch-diagram-generator
```

Requires Node 22 or newer (the oldest currently supported Node line). The command is `tf-arch`.

## CLI

```
tf-arch serve [plan.json] [options]     Open the interactive viewer
tf-arch render <plan.json> [options]    Write a standalone SVG (no browser)
tf-arch inspect <plan.json> [options]   Print a plan summary

  -o, --out <file>     Output path for render (default: architecture.svg)
  -t, --title <text>   Diagram title
  -p, --port <number>  Port for serve (default: 5173)
      --host <host>    Host for serve (default: 127.0.0.1)
      --open           Open the viewer in your default browser
      --json           Machine-readable output for inspect
```

```bash
# Explore a plan interactively
tf-arch serve plan.json --open

# Commit a diagram alongside your module
tf-arch render plan.json --out docs/architecture.svg --title "Production"

# See how the plan was interpreted (useful when filing an issue)
tf-arch inspect plan.json
tf-arch inspect plan.json --json | jq '.providers'

# Browse the built-in demo plans with no plan of your own
tf-arch serve
```

Running `tf-arch serve` with no plan shows eight bundled example architectures (AWS 3-tier / serverless / EKS, GCP web platform / serverless data, Azure 3-tier / AKS, and a multi-cloud landing zone). The same plans are in [`examples/`](examples/) if you want to try the CLI immediately.

## Library API

Everything is DOM-free, so it works in Node and in the browser:

```js
import fs from 'node:fs';
import {
  parseTerraformPlan,
  computeArchitectureLayout,
  renderStandaloneSvg
} from 'tf-arch-diagram-generator';

const plan = JSON.parse(fs.readFileSync('plan.json', 'utf8'));
const parsed = parseTerraformPlan(plan);

console.log(parsed.stats);        // { create, update, delete, noop, total }
console.log(parsed.providers);    // [{ id: 'aws', shortName: 'AWS', … }]
console.log(parsed.edges.length); // inferred relationships

const svg = renderStandaloneSvg(
  computeArchitectureLayout(parsed),
  { title: 'Production' }
);
fs.writeFileSync('architecture.svg', svg);
```

Or the one-liner:

```js
import { planToSvg } from 'tf-arch-diagram-generator';
const svg = await planToSvg(plan, { title: 'Production' });
```

Also exported: `PROVIDERS`, `getProvider`, `getProviderForType`, `getIconForType`, `getMergedCategories`, `SAMPLE_PLANS`.

### Diagrams in CI

```yaml
- run: terraform show -json tfplan > plan.json
- run: npx tf-arch-diagram-generator render plan.json --out architecture.svg
- uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
  with:
    name: architecture
    path: architecture.svg
```

A rendered diagram attached to a PR shows reviewers what the plan actually changes. Remember that the SVG embeds resource names, addresses and CIDR ranges — see [SECURITY.md](SECURITY.md) before posting one publicly.

## Web viewer

Every push to `main` deploys the viewer with its bundled example plans to GitHub Pages via [pages.yml](.github/workflows/pages.yml), so there is a live demo without installing anything. To run it locally:

```bash
git clone https://github.com/mchittineni/tf-arch-diagram-generator.git
cd tf-arch-diagram-generator
npm install
npm run dev      # http://localhost:5173
```

In the viewer: drag to pan, scroll to zoom, click a resource to inspect its planned diff, filter by cloud / service category / plan action, search by name or address, and export the diagram as SVG. Hovering a resource spotlights its connections — its edges light up with an animated flow while everything unrelated fades back — and the spotlight sticks while a resource is selected. Double-click a node (or click one in the sidebar) to glide the viewport to it; press `+` / `-` to zoom, `0` to reset, `F` to fit, `Esc` to deselect. **Import Plan** accepts a drag-and-dropped or pasted `plan.json`.

Exported SVGs keep a slice of that interactivity: opened in a browser they carry hover highlighting, native tooltips and the animated traffic flow.

## Provider coverage

| | AWS | Google Cloud | Azure |
|---|---|---|---|
| Network container | VPC | VPC Network | Virtual Network |
| Subnet container | Subnet | Subnetwork | Subnet |
| Zone grouping | Availability Zone | Zone / Region | Availability Zone |
| Tag model | Tags | Labels | Tags + Resource Group |
| Compute | EC2, ASG, Lambda | Compute Engine, MIG, Cloud Run, Functions, App Engine | VM, VMSS, Functions, App Service |
| Containers | ECS, EKS, ECR | GKE, Artifact Registry | AKS, Container Apps, ACR |
| Data | RDS, DynamoDB, ElastiCache | Cloud SQL, Spanner, Firestore, Bigtable, Memorystore, BigQuery | Azure SQL, Cosmos DB, PostgreSQL, Redis, Synapse |
| Messaging | SQS, SNS, EventBridge | Pub/Sub, Tasks, Eventarc | Service Bus, Event Grid, Event Hubs |
| Edge | CloudFront, ALB, API Gateway, Route 53 | Global LB, Cloud CDN, API Gateway, Cloud DNS | Front Door, App Gateway, LB, APIM, Azure DNS |

Unmapped resource types still render, with that cloud's generic icon — nothing is silently dropped. Missing a service you use? [Open a mapping issue](.github/ISSUE_TEMPLATE/resource_mapping.yml) or send a one-line PR.

## How it works

```
plan.json
   │
   ├─ src/parser/tfPlanParser.js     resolves each resource to its provider,
   │                                 builds the network/subnet hierarchy,
   │                                 delegates edge inference per cloud
   ├─ src/canvas/layoutEngine.js     positions cloud bands, networks, zones,
   │                                 subnets and resources
   └─ src/canvas/svgRenderer.js      pure SVG strings — the browser canvas and
                                     the CLI share this exact code
```

Each cloud lives in `src/providers/<id>/`: an icon set plus a definition declaring its type prefixes, resource→icon map, hierarchy attribute keys, vocabulary and edge inference. Adding a provider means adding one directory and one registry entry — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

Plans are processed entirely on your machine. There are no runtime dependencies, no telemetry and no network calls; `tf-arch serve` binds to `127.0.0.1` and rejects requests with an unexpected Host header. The hosted page's only remote request is to Google Fonts. Plan content is treated as untrusted throughout — names, tags and attribute values are escaped before reaching HTML or SVG. Terraform plans routinely contain sensitive values — read [SECURITY.md](SECURITY.md) for the full hardening list before sharing a plan or an exported diagram.

## Official icon sets

The diagrams render with the official vendor architecture icons. The full sets
are tracked in `assets/icons/`, and the subset the resource map actually uses
is embedded into generated modules (`src/providers/*/officialIcons.js`) so the
CLI and viewer need no asset files at runtime:

```bash
npm run icons:update          # refresh all three sets from upstream
npm run icons:update -- -c azure   # one cloud
npm run icons:check           # verify the files match the committed manifest
npm run icons:build           # re-embed the mapped subset into src/providers/
npm run icons:build:check     # CI gate: embedded modules match the assets
```

The key → file mapping lives in
[`scripts/icons/mapping.json`](scripts/icons/mapping.json). The generator
embeds each SVG verbatim, only stripping XML metadata and namespacing internal
`id`/`class` attributes so icons can coexist in one SVG document. The artwork
remains the property of its vendors — see
[`assets/icons/NOTICE.md`](assets/icons/NOTICE.md).

Sources are declared in [`scripts/icons/sources.json`](scripts/icons/sources.json)
and default to the bundles behind [aws-icons.com](https://aws-icons.com/),
[gcpicons.com](https://gcpicons.com/) and [az-icons.com](https://az-icons.com/)
— 311 AWS, 216 GCP and 618 Azure icons, fetched as one zip per cloud.
`assets/icons/manifest.json` records each source's ETag plus a SHA-256 per file,
so a refresh only produces a diff when something genuinely changed upstream.

A [scheduled workflow](.github/workflows/update-icons.yml) runs the refresh
**semiannually** (1 January and 1 July, 06:00 UTC, plus on demand) and opens a
PR only when upstream drifts.

> **Note on freshness.** Every file on that CDN currently carries a 2023-04-17
> timestamp, so those three sites are a frozen snapshot rather than a moving
> feed. Each source entry also records the vendor's `officialUpstream` — the
> pages that *are* refreshed — if you want to point the job at those instead.

> **Licensing.** These icons stay the property of AWS, Google and Microsoft
> under their own terms, are **not** covered by this project's MIT license, and
> are excluded from the published npm package. See
> [`assets/icons/NOTICE.md`](assets/icons/NOTICE.md).

## Commits and releases

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
and drive releases automatically:

```
feat(gcp): add Cloud Workflows resource mapping
fix(parser): resolve Azure ip_configuration subnet references
chore(icons): refresh cloud architecture icon sets
feat(providers)!: rename parentVpcId to parentNetworkId   # breaking change
```

`commitlint` enforces the allowed types and scopes — locally through a husky
`commit-msg` hook, and in CI on every PR commit and the PR title. A husky
`pre-commit` hook runs the test suite. Run `npm run commitlint` to check your
last commit by hand.

[semantic-release](https://semantic-release.gitbook.io/) handles versioning: a
merge to `main` derives the next version from the commit types, tags the
release, publishes to npm with provenance, and writes the notes to the
[GitHub Releases](https://github.com/mchittineni/tf-arch-diagram-generator/releases)
page. Never bump the version by hand.

## Contributing

Contributions are very welcome, especially resource mappings and relationship inference for clouds you use daily. See [CONTRIBUTING.md](CONTRIBUTING.md) for the project layout and a walkthrough of both. Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

```bash
npm run build          # production web build (the serve tests need dist/)
npm test               # full suite on Node's built-in runner
npm run test:coverage  # suite + coverage gate (>=90% lines per file)
npm run security       # dependency audit + vendor-SVG scan + injection tests
npm run icons:check    # verify the reference icon sets
```

## License

[MIT](LICENSE)
