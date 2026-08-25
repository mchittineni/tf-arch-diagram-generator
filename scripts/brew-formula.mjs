#!/usr/bin/env node
/**
 * Emit the Homebrew formula for a published npm release.
 *
 *   node scripts/brew-formula.mjs            # version from package.json
 *   node scripts/brew-formula.mjs 1.1.0      # explicit version
 *   node scripts/brew-formula.mjs v1.1.0 > Formula/tf-arch.rb
 *
 * Reads the release's tarball URL from the npm registry, downloads it,
 * verifies the registry's sha512 integrity and computes the sha256 Homebrew
 * wants. The registry can lag a few seconds behind `npm publish`, so a
 * missing version is retried (BREW_FORMULA_RETRIES × BREW_FORMULA_DELAY_MS).
 *
 * The publish workflow pipes this into the mchittineni/homebrew-tap repo
 * right after semantic-release; run it by hand to bootstrap or repair the tap.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { setTimeout as sleep } from 'node:timers/promises';

const PACKAGE = 'tf-arch-diagram-generator';
const REGISTRY = 'https://registry.npmjs.org';
const RETRIES = Number(process.env.BREW_FORMULA_RETRIES ?? 10);
const DELAY_MS = Number(process.env.BREW_FORMULA_DELAY_MS ?? 15_000);

const pkg = createRequire(import.meta.url)('../package.json');

async function fetchOk(url, accept) {
  const res = await fetch(url, { headers: accept ? { accept } : {} });
  if (!res.ok) {
    const err = new Error(`${res.status} ${res.statusText} for ${url}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

async function fetchReleaseMetadata(version) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetchOk(`${REGISTRY}/${PACKAGE}/${version}`, 'application/json');
      return await res.json();
    } catch (err) {
      if (err.status !== 404 || attempt >= RETRIES) throw err;
      console.error(`${PACKAGE}@${version} not on the registry yet (attempt ${attempt}/${RETRIES}); retrying in ${DELAY_MS / 1000}s`);
      await sleep(DELAY_MS);
    }
  }
}

function verifyIntegrity(bytes, integrity) {
  const [algorithm, expected] = integrity.split('-', 2);
  const actual = createHash(algorithm).update(bytes).digest('base64');
  if (actual !== expected) {
    throw new Error(`Tarball ${algorithm} mismatch: registry says ${expected}, download is ${actual}`);
  }
}

function renderFormula({ version, tarballUrl, sha256 }) {
  return `class TfArch < Formula
  desc "Turn Terraform plans into cloud architecture diagrams (AWS, GCP, Azure)"
  homepage "https://github.com/mchittineni/tf-arch-diagram-generator"
  url "${tarballUrl}"
  sha256 "${sha256}"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_equal "${version}", shell_output("#{bin}/tf-arch --version").strip

    (testpath/"plan.json").write <<~JSON
      {
        "format_version": "1.2",
        "resource_changes": [
          {
            "address": "aws_vpc.main",
            "type": "aws_vpc",
            "name": "main",
            "provider_name": "registry.terraform.io/hashicorp/aws",
            "change": { "actions": ["create"], "before": null, "after": { "cidr_block": "10.0.0.0/16" } }
          }
        ]
      }
    JSON

    system bin/"tf-arch", "render", "plan.json", "--out", "arch.svg", "--title", "Brew"
    assert_match "<svg", (testpath/"arch.svg").read
    assert_match "Brew", (testpath/"arch.svg").read
  end
end
`;
}

async function main() {
  const requested = process.argv[2] || pkg.version;
  const version = requested.startsWith('v') ? requested.slice(1) : requested;

  const meta = await fetchReleaseMetadata(version);
  const tarballUrl = meta.dist.tarball;

  const bytes = Buffer.from(await (await fetchOk(tarballUrl)).arrayBuffer());
  verifyIntegrity(bytes, meta.dist.integrity);
  const sha256 = createHash('sha256').update(bytes).digest('hex');

  process.stdout.write(renderFormula({ version, tarballUrl, sha256 }));
}

main().catch((err) => {
  console.error(`brew-formula: ${err.message}`);
  process.exit(1);
});
