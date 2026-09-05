# tf-arch-diagram-generator (Python)

Turn any Terraform plan into an interactive cloud architecture diagram — for **AWS**, **Google Cloud** and **Azure**, including plans that span all three.

This is the Python distribution of the [`tf-arch-diagram-generator`](https://www.npmjs.com/package/tf-arch-diagram-generator) npm package: the same `tf-arch` command, installable with `pip`, plus a small `tf_arch` API. Supports **Python 3.12, 3.13, and 3.14**. The rendering engine is JavaScript, bundled inside the wheel and run on your local **Node.js 22 or newer** — there are no third-party Python dependencies and nothing is downloaded at install or run time.

```bash
pip install tf-arch-diagram-generator      # or: pipx install / uv tool install

terraform plan -out=tfplan && terraform show -json tfplan > plan.json
tf-arch serve plan.json --open              # interactive viewer
tf-arch render plan.json -o arch.svg        # standalone SVG, no browser
tf-arch inspect plan.json --json            # machine-readable summary
```

Python 3.12+ and Node.js 22+ are the prerequisites: install Node.js from [nodejs.org](https://nodejs.org/en/download) or with your package manager, nvm or fnm. If `node` is not on `PATH`, point `TF_ARCH_NODE` at the binary. `pip install` itself does not check for Node — the first `tf-arch` command does, and exits with status 127 and an install pointer if it is missing.

## Python API

```python
import tf_arch

svg = tf_arch.render("plan.json", title="Production")   # SVG as a string
tf_arch.render("plan.json", out="docs/architecture.svg")  # …or written to disk

summary = tf_arch.inspect("plan.json")
summary["stats"]       # {'create': …, 'update': …, 'delete': …, 'noop': …, 'total': …}
summary["providers"]   # [{'id': 'aws', 'shortName': 'AWS', …}, …]
summary["resources"]   # address, type, provider, action, service, network, subnet, zone, region
summary["edges"]       # inferred relationships

tf_arch.serve("plan.json", port=5173, open_browser=True)  # blocks; returns 130 on Ctrl+C
```

`render` and `inspect` also accept the plan as an already-parsed `dict`. Failures raise `tf_arch.CommandError` (with the CLI's message and exit status) or `tf_arch.NodeNotFoundError`. `tf_arch.run([...])` passes arbitrary arguments straight through to the CLI.

## What you get

- **Three clouds, one tool** — AWS, Google Cloud and Azure, 280+ resource types mapped to the official vendor architecture icons. Multi-provider plans render as one band per cloud.
- **Real containment hierarchy** — VPC / VPC Network / Virtual Network → zones → public and private subnets.
- **Deep reference & architectural links** — Extracts real dependency links from Terraform expressions and attribute values (KMS keys, IAM roles, security groups, target groups, route tables, peering).
- **Perimeter-snapped connectors & relationship styling** — Connectors snap directly to outer card perimeters with clearance offsets so arrowheads never bury under cards. Distinguishes traffic flows, security/encryption (dashed amber), peering (purple), and dependencies.
- **Directional spotlighting & connected links inspector** — Dual-directional highlighting (inbound in blue, outbound in violet), toggleable connection labels, and an interactive Connected Links drawer with one-click navigation.
- **Plan-aware badges** (`+ create`, `~ update`, `- destroy`) with attribute-level diffs in the inspector.
- **Headless rendering** for CI, and a **hardened local viewer** (loopback only, Host validation, strict CSP).
- **Private by design** — plans are processed on your machine; no telemetry, no network calls.

Full documentation, the library API for JavaScript, provider coverage and security notes live in the [project README](https://github.com/mchittineni/tf-arch-diagram-generator#readme). Terraform plans routinely contain sensitive values — read [SECURITY.md](https://github.com/mchittineni/tf-arch-diagram-generator/blob/main/SECURITY.md) before sharing a plan or an exported diagram.

## License

[MIT](https://github.com/mchittineni/tf-arch-diagram-generator/blob/main/LICENSE). The embedded cloud icons remain the property of AWS, Google and Microsoft under their own terms.
