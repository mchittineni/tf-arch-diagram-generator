# Security Policy

## Supported versions

The latest published `1.x` release receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Report it privately through GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository. Include:

- What the issue is and how to trigger it
- A minimal, **sanitized** reproduction (never include a real plan, state file, account id or credential)
- The version of the package and of Node you used

You can expect an initial response within 7 days.

## Handling plan data

This is the part most likely to bite users, so it is worth stating plainly:

- **Terraform plan JSON frequently contains sensitive values** — account ids, private CIDR ranges, connection strings, and any attribute your providers do not mark as sensitive.
- The web viewer and the `tf-arch render` command process plans **entirely locally**. Nothing is uploaded, and the project has no network calls and no runtime dependencies. The only remote request the hosted page makes is to Google Fonts for typography.
- `tf-arch serve` binds to `127.0.0.1` by default. If you override `--host`, you are exposing your plan to that network — do so deliberately; the CLI prints a warning when it binds anywhere else.
- The pip package runs whatever `node` it finds on `PATH`, or the binary named by `TF_ARCH_NODE`. Treat that variable like `PATH` itself: a poisoned value executes attacker code with your privileges.
- Exported SVGs embed resource names, addresses, CIDR ranges and zones. Treat an exported diagram with the same care as the plan it came from before attaching it to a ticket or a public PR.
- `.gitignore` blocks `plan.json`, `*.tfplan` and `*.tfstate` so a plan is not committed by accident. Keep it that way.

## Hardening in place

The local viewer (`tf-arch serve`) renders plan data in a browser, so it applies:

- **Loopback binding** by default (`127.0.0.1`); `--host` opts out deliberately.
- **Host-header validation**, which blocks DNS-rebinding: a malicious page cannot
  point its own hostname at your loopback port and read the plan being served.
- **A strict Content-Security-Policy** (`default-src 'self'`, no `object-src`, no
  framing), plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
  and cross-origin isolation headers.
- **GET/HEAD only**; every other method is rejected.
- **Path containment** for static files, verified against encoded, double-encoded
  and sibling-prefix traversal attempts.

Plan content is treated as untrusted throughout: resource names, addresses, tags
and attribute values are escaped before reaching HTML or SVG, and
`test/security.test.js` asserts that a deliberately hostile plan produces no
script element, no inline event handler and no `javascript:` URL — while still
displaying the payload as literal text.

The third-party icon assets in `assets/icons/` are scanned by
`npm run security:assets` (also enforced in CI and on every scheduled refresh),
because SVG can carry script, event handlers and remote references.

## Automated checks

| Check | Where |
|---|---|
| `npm audit` on production dependencies | `.github/workflows/security.yml` |
| Secret scanning over full history (gitleaks) | `.github/workflows/security.yml` |
| CodeQL, `security-extended` queries | `.github/workflows/security.yml` |
| Vendor SVG active-content scan | `.github/workflows/security.yml`, icon refresh |
| Injection / hardening test suite | `.github/workflows/security.yml` |

Run everything locally with `npm run security`.

## Scope

In scope: code execution or file disclosure via a crafted plan file, path traversal in `tf-arch serve`, script injection into rendered SVG/HTML output.

Out of scope: the sensitivity of data a user deliberately renders or exports, and vulnerabilities in Terraform itself.
