# Terraform Architecture Diagram Generator

[![npm version](https://img.shields.io/npm/v/tf-arch-diagram-generator?logo=npm&color=cb3837)](https://www.npmjs.com/package/tf-arch-diagram-generator)
[![PyPI version](https://img.shields.io/pypi/v/tf-arch-diagram-generator?logo=pypi&logoColor=white&color=3775a9)](https://pypi.org/project/tf-arch-diagram-generator/)
[![CI](https://github.com/mchittineni/tf-arch-diagram-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mchittineni/tf-arch-diagram-generator/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/tf-arch-diagram-generator?logo=nodedotjs)](https://nodejs.org/en/about/previous-releases)
[![license](https://img.shields.io/npm/l/tf-arch-diagram-generator)](LICENSE)

Turn any Terraform plan into an interactive cloud architecture diagram — for **AWS**, **Google Cloud** and **Azure**, including plans that span all three.

Point it at `terraform show -json` output and get a diagram with the real hierarchy (network → zone → subnet → resource), inferred traffic flows, and per-resource plan diffs. Runs as a CLI, a local web viewer, or a library — installable from **npm**, **PyPI** or **Homebrew**.

```bash
terraform plan -out=tfplan && terraform show -json tfplan > plan.json

npx tf-arch-diagram-generator serve plan.json --open      # interactive viewer
npx tf-arch-diagram-generator render plan.json -o arch.svg # standalone SVG, no browser
```

## Features

- **Three clouds, one tool** — AWS (`aws_*`), Google Cloud (`google_*`) and Azure (`azurerm_*` / `azuread_*`), with 280+ resource types mapped across 104 service icons — the **official vendor architecture icons**, embedded verbatim from the AWS / Google Cloud / Azure icon sets. A multi-provider plan renders as one band per cloud.
- **Real containment hierarchy** — VPC / VPC Network / Virtual Network, availability zones and regions, public vs. private subnets. Nested references resolve too (`network_interface[0].subnetwork`, `ip_configuration[0].subnet_id`, `default_node_pool[0].vnet_subnet_id`).
- **Deep reference & architectural links** — Extracts direct configuration expressions and attribute values (`kms_key_arn`, `security_groups`, `target_group_arns`, `iam_roles`, `route_table_id`, `vpc_peering_connection_id`, `private_endpoints`) alongside high-level traffic routing (Route 53 → CloudFront → ALB → ECS/EC2 → RDS, Cloud Armor → Backend Services → Cloud Run → Cloud SQL, Front Door → App Gateway → AKS → Key Vault).
- **Perimeter-snapped connectors & relationship styling** — Connectors snap directly to outer card perimeters with clearance offsets so arrowheads never bury under cards. Styles distinguish traffic flows (solid blue/purple), security/encryption (dashed amber with security markers), VPC/VNet peering, and resource dependencies.
- **Directional spotlighting & edge labels** — Hovering or selecting any resource highlights inbound (blue) vs outbound (violet) paths while dimming unrelated architecture. Edge labels can be toggled in one click or inspected via interactive edge tooltips.
- **Connected links inspector** — Resource Inspector drawer includes an interactive **Connected Links** list showing all inbound and outbound architecture connections with one-click canvas navigation to peer nodes.
- **Plan-aware** — `+ create`, `~ update`, `- destroy` badges on every node, with attribute-level before/after diffs in the inspector.
- **Native provider vocabulary** — a GCP resource reads "VPC Network / Subnetwork / Zone / Labels"; an Azure one reads "Virtual Network / Subnet / Location / Resource Group".
- **Headless rendering** — `tf-arch render` produces SVG in pure Node. No browser, no Puppeteer. Good for CI and for committing diagrams next to your modules.
- **Hardened local viewer** — `tf-arch serve` binds to loopback, validates the Host header (blocks DNS rebinding), sends a strict Content-Security-Policy, allows only GET/HEAD, and contains file access to the built assets (symlinks included).
- **Zero runtime dependencies** — nothing is uploaded, nothing phones home.

## Install

### npm

```bash
# One-off, no install
npx tf-arch-diagram-generator --help

# Project dev dependency (CI, docs generation)
npm install --save-dev tf-arch-diagram-generator

# Global CLI
npm install -g tf-arch-diagram-generator
```

### Python

```bash
pip install tf-arch-diagram-generator      # or: pipx install / uv tool install
```

The PyPI package is the same tool: it bundles the JavaScript and runs it on your local Node.js, so Terraform teams working in Python (supports **Python 3.12, 3.13, and 3.14**) get the `tf-arch` command and an importable `tf_arch` module without touching npm. It has no third-party Python dependencies and downloads nothing at install or run time. See [Python API](#python-api) below.

### Homebrew

```bash
brew install mchittineni/tap/tf-arch
```

The formula installs the published npm tarball and pulls in Homebrew's `node` for you. It lives in the [`mchittineni/homebrew-tap`](https://github.com/mchittineni/homebrew-tap) tap and is updated automatically by every release.

Every route installs the same tool, and the command is always `tf-arch`. With npm or pip you need **Node 22 or newer** (the oldest currently supported Node line) installed yourself; the Python package looks for `node` on `PATH` and honours `TF_ARCH_NODE` to point at a specific binary.

## CLI

```
tf-arch serve [plan.json] [options]     Open the interactive viewer
tf-arch render <plan.json> [options]    Write a standalone SVG (no browser)
tf-arch inspect <plan.json> [options]   Print a plan summary

  <plan.json> is the output of `terraform show -json`; pass `-` to read it from stdin.

  render   -o, --out <file>     Output path (default: architecture.svg)
           -t, --title <text>   Diagram title (default: derived from the file name)
  serve    -p, --port <number>  Port (default: 5173; 0 picks a free port)
               --host <host>    Bind address (default: 127.0.0.1 — anything else exposes the plan)
               --open           Open the viewer in your default browser
           -t, --title <text>   Title shown in the viewer
  inspect      --json           Machine-readable output (stable, additive-only shape)
```

```bash
# Explore a plan interactively
tf-arch serve plan.json --open

# Commit a diagram alongside your module
tf-arch render plan.json --out docs/architecture.svg --title "Production"

# See how the plan was interpreted (useful when filing an issue)
tf-arch inspect plan.json
terraform show -json tfplan | tf-arch inspect - --json | jq '.providers'

# Browse the built-in demo plans with no plan of your own
tf-arch serve
```

Exit codes: `0` success; `1` any error (usage, unreadable or invalid plan, port in use, write failure) with the reason on stderr. The pip-installed shim adds `127` when no Node.js ≥ 22 can be found. Non-fatal caveats — an empty plan, resources from providers the tool does not model, relationships left undrawn on a very large plan — are `Warning:` lines on stderr, so `inspect --json` writes nothing but JSON to stdout and is safe to pipe (`unmodelled` and `edgesTruncated` carry the same information in the JSON). Works fully offline and on Windows; the only remote request anywhere is the viewer's Google Fonts stylesheet.

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

Also exported: `PROVIDERS` (an object keyed by provider id: `aws`, `gcp`, `azure`), `getProvider`, `getProviderForType`, `getIconForType`, `getMergedCategories`, `SAMPLE_PLANS`. The `inspect --json` shape (`stats`, `providers`, `resources`, `edges`) is a stable, additive-only contract — the Python API returns it verbatim.

### Python API

The Python package exposes the three CLI commands as functions. Plans can be a path or an already-parsed `dict`:

```python
import json
import tf_arch

svg = tf_arch.render("plan.json", title="Production")      # SVG as a string
tf_arch.render("plan.json", out="docs/architecture.svg")     # …or written to disk

summary = tf_arch.inspect("plan.json")                       # same shape as `tf-arch inspect --json`
summary["stats"]      # {'create': …, 'update': …, 'delete': …, 'noop': …, 'total': …}
summary["providers"]  # [{'id': 'aws', 'shortName': 'AWS', …}, …]
summary["resources"]  # address, type, provider, action, service, network, subnet, zone, region
summary["edges"]      # inferred relationships

plan = json.load(open("plan.json"))
tf_arch.render(plan)                                         # dict input works too

tf_arch.serve("plan.json", port=5173, open_browser=True)    # blocks; returns 130 on Ctrl+C
```

Errors surface as `tf_arch.CommandError` (carrying the CLI's message and exit status) or `tf_arch.NodeNotFoundError`; `tf_arch.run([...])` passes arbitrary arguments straight through to the CLI and returns a `CompletedProcess`. The package's source lives in [`python/`](python/).

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

In the viewer: drag to pan, scroll to zoom, click a resource to inspect its planned diff, filter by cloud / service category / plan action, search by name or address, and export the diagram as SVG. Hovering a resource spotlights its connections with directional distinction — inbound paths light up in blue (`.edge-inbound`), outbound paths in violet (`.edge-outbound`), while unrelated elements fade back. Connection labels can be toggled on/off in the toolbar, and connectors carry interactive hover tooltips and click-to-select navigation. The Resource Inspector includes an interactive **Connected Links** card showing all inbound and outbound architecture connections with one-click navigation to peer nodes. Double-click a node (or click one in the sidebar) to glide the viewport to it; press `+` / `-` to zoom, `0` to reset, `F` to fit, `Esc` to deselect. **Import Plan** accepts a drag-and-dropped or pasted `plan.json`.

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
| Messaging | SQS, SNS, EventBridge, Step Functions, Kinesis | Pub/Sub, Tasks, Eventarc, Workflows | Service Bus, Event Grid, Event Hubs |
| Security / Identity | IAM, KMS, Secrets Manager, WAF, ACM | IAM, KMS CMEK, Cloud Armor, Secret Manager | Key Vault, NSG rules, Entra ID |
| Edge & Networking | Route 53, CloudFront, ALB, API Gateway, TGW, Peering, Route Tables | Global LB, Cloud CDN, API Gateway, Cloud DNS, Serverless VPC, Peering | Front Door, App Gateway, LB, APIM, Azure DNS, Private Endpoints, VNet Peering |

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
page. The same run then builds the Python distribution from the just-published
files and uploads it to PyPI via trusted publishing, and regenerates the
Homebrew formula (`scripts/brew-formula.mjs`) in the tap, so all three
channels always carry the same version. Never bump the version by hand.

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
