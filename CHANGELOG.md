# Changelog

All notable changes to this project are documented here. This file is
maintained automatically by [semantic-release](https://semantic-release.gitbook.io/)
from [Conventional Commits](https://www.conventionalcommits.org/).

## 1.0.0

First open-source release. The tool went from an AWS-only web app to a
multi-cloud, publishable npm package.

### Added

- **Google Cloud support** — 82 `google_*` resource types mapped across 37
  service icons, with `google_compute_network` / `google_compute_subnetwork`
  hierarchy, nested `network_interface[].subnetwork` resolution, zone/region
  grouping, label support, and Cloud DNS → Global LB → Cloud Run / MIG →
  Cloud SQL / Spanner / Firestore / Pub/Sub edge inference.
- **Azure support** — 103 `azurerm_*` / `azuread_*` resource types mapped across
  40 service icons, with `azurerm_virtual_network` / `azurerm_subnet` hierarchy,
  nested `ip_configuration[].subnet_id` and `default_node_pool[].vnet_subnet_id`
  resolution, location and resource-group metadata, and DNS → Front Door →
  Application Gateway → VMSS / AKS → Azure SQL / Cosmos DB / Service Bus edge
  inference.
- **Multi-cloud plans** — a plan spanning several providers renders one labelled
  band per cloud; inferred edges never cross provider boundaries. New sidebar
  filter and navbar badges for the clouds detected in a plan.
- **npm package** — installable and runnable via `npx`, with a `tf-arch` binary
  and a DOM-free programmatic API (`parseTerraformPlan`,
  `computeArchitectureLayout`, `renderStandaloneSvg`, `planToSvg`, provider
  registry helpers).
- **CLI** — `tf-arch serve` (interactive viewer, optionally preloaded with your
  plan), `tf-arch render` (headless SVG, no browser required) and
  `tf-arch inspect` (human and `--json` plan summaries).
- **Provider plug-in architecture** — each cloud is a directory under
  `src/providers/` declaring its type prefixes, icon set, resource map,
  hierarchy attribute keys, vocabulary and edge inference. Adding a cloud
  requires one registry entry.
- **Five new example architectures** — GCP web platform, GCP serverless data
  platform, Azure 3-tier, Azure AKS platform and a multi-cloud landing zone,
  available in the viewer and as standalone files in `examples/`.
- **Open-source project scaffolding** — MIT license, contributing guide,
  code of conduct, security policy, issue/PR templates, Dependabot config, and
  GitHub Actions workflows for CI (Node 22/24/26), semantic-release publishing
  with provenance, Conventional-Commit linting, a security pipeline (npm audit,
  gitleaks over full history, CodeQL security-extended, vendor-SVG scan) and a
  GitHub Pages deploy of the live demo.
- **Reference icon pipeline** — the official AWS/GCP/Azure architecture icon
  sets (1,145 SVGs) tracked under `assets/icons/` with a checksummed manifest,
  refreshed semiannually by a scheduled workflow that opens a PR only on real
  upstream drift; every refresh is gated by an active-content scan. The icons
  stay under their vendors' terms and are excluded from the npm package.
- **Hardened local server** — `tf-arch serve` validates the Host header
  (blocks DNS rebinding), sends a strict CSP plus security headers, accepts
  only GET/HEAD, resolves symlinks before its containment check, serves
  fingerprinted assets with immutable caching + ETag/304 revalidation, and
  shuts down gracefully on SIGINT/SIGTERM. The CLI refuses to run on
  end-of-life Node versions (supported: the active lines, currently 22/24/26).
- **Test suite and coverage gate** — 53 tests on Node's built-in runner:
  parsing and all three provider hierarchies, multi-cloud isolation, the full
  app mounted in jsdom, canvas/modal/inspector interactions, hostile-plan
  injection, the published API contract, and socket-level server tests.
  `scripts/check-coverage.mjs` enforces ≥90% line coverage per file and
  overall (currently ~99%), and fails if any source file has no test at all.

### Changed

- Parser output is now provider-agnostic: `parentVpcId` → `parentNetworkId`,
  `vpcNodes` → `networkNodes`, plus `providerId`, `region`, `group`, `tags` and
  `module` on every node. Plans are also read from `planned_values` /
  `prior_state`, including child modules.
- SVG generation moved into a shared pure-string renderer, so the interactive
  canvas and the CLI produce identical output from the same code.
- The inspector, sidebar and navbar use each provider's own vocabulary rather
  than AWS terms; the UI palette is provider-neutral with per-cloud accents.
- Diagram export now produces a titled, legended standalone SVG document.

### Fixed

- Resource names, types, addresses, tags and attribute keys are escaped before
  being written into SVG and HTML, so a plan containing markup can no longer
  break or inject into the rendered diagram.
- The app no longer renders a blank page: initialising the diagram canvas used
  to destroy the zoom controls it shared a container with, crashing startup.
  The canvas now owns a dedicated mount node.
- Embedded service icons carry an explicit viewport size. A nested `<svg>`
  without width/height defaults to the full canvas, which blew each icon up to
  cover the entire diagram.
- Canvas bounds track the real drawing extent instead of a fixed 1200×800
  minimum, so fit-to-screen and exported SVGs no longer carry dead space.
- The local server survives unreadable files instead of crashing on an
  unhandled stream error, and reports a port conflict without a stack trace.
- Resources whose subnet or network lives outside the plan are laid out as
  standalone nodes instead of disappearing from the diagram.
- `terraform show -json` output with no `resource_changes` block no longer
  renders an empty canvas.
