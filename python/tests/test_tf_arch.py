"""Tests for the Python distribution. Stdlib only; needs Node >= 22 on PATH.

Run from the repository root:
    python -m unittest discover -s python/tests -t python/tests
Works against an installed wheel (preferred in CI) or the checkout itself.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import tf_arch

REPO_ROOT = Path(__file__).resolve().parents[2]
EXAMPLES = REPO_ROOT / "examples"
MULTI_CLOUD = EXAMPLES / "multi-cloud.plan.json"


class VersionTests(unittest.TestCase):
    def test_version_matches_bundled_package_json(self):
        bundled = json.loads((tf_arch.js_root() / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(tf_arch.__version__, bundled["version"])

    def test_version_matches_repo_package_json(self):
        # Fails loudly if a wheel was built from a stale checkout.
        repo = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(tf_arch.__version__, repo["version"])

    def test_cli_version_flag(self):
        completed = tf_arch.run(["--version"])
        self.assertEqual(completed.stdout.strip(), tf_arch.__version__)


class RenderTests(unittest.TestCase):
    def test_render_returns_svg_string(self):
        svg = tf_arch.render(MULTI_CLOUD, title="Landing Zone")
        self.assertTrue(svg.startswith("<svg xmlns"))
        self.assertIn("Landing Zone", svg)

    def test_render_writes_out_file_creating_parents(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "nested" / "diagram.svg"
            svg = tf_arch.render(MULTI_CLOUD, out=out)
            self.assertTrue(out.is_file())
            self.assertEqual(out.read_text(encoding="utf-8"), svg)

    def test_render_accepts_plan_dict(self):
        plan = json.loads((EXAMPLES / "aws-three-tier.plan.json").read_text(encoding="utf-8"))
        svg = tf_arch.render(plan)
        self.assertIn("<svg", svg)

    def test_missing_plan_raises_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            tf_arch.render(REPO_ROOT / "nope.json")

    def test_unsupported_plan_type_raises_type_error(self):
        for bad in ([], 42, b"{}"):
            with self.assertRaises(TypeError, msg=repr(bad)):
                tf_arch.render(bad)
        with self.assertRaises(TypeError):
            tf_arch.serve({"format_version": "1.2"})


class InspectTests(unittest.TestCase):
    def test_inspect_reports_providers_and_resources(self):
        report = tf_arch.inspect(MULTI_CLOUD)
        self.assertEqual(report["stats"]["total"], len(report["resources"]))
        self.assertEqual([p["id"] for p in report["providers"]], ["aws", "gcp", "azure"])

    def test_invalid_json_surfaces_cli_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            bad = Path(tmp) / "bad.json"
            bad.write_text("{ not json", encoding="utf-8")
            with self.assertRaises(tf_arch.CommandError) as ctx:
                tf_arch.inspect(bad)
        self.assertIn("not valid JSON", str(ctx.exception))
        self.assertEqual(ctx.exception.returncode, 1)


class NodeDiscoveryTests(unittest.TestCase):
    def test_missing_node_gives_actionable_error(self):
        env_backup = os.environ.get(tf_arch.NODE_ENV_VAR)
        os.environ[tf_arch.NODE_ENV_VAR] = "/definitely/not/a/node/binary"
        try:
            with self.assertRaises(tf_arch.NodeNotFoundError):
                tf_arch.find_node()
        finally:
            if env_backup is None:
                del os.environ[tf_arch.NODE_ENV_VAR]
            else:
                os.environ[tf_arch.NODE_ENV_VAR] = env_backup

    def test_console_script_exits_127_without_node(self):
        env = {**os.environ, tf_arch.NODE_ENV_VAR: "/definitely/not/a/node/binary"}
        completed = subprocess.run(
            [sys.executable, "-m", "tf_arch", "--help"],
            capture_output=True, text=True, env=env,
        )
        self.assertEqual(completed.returncode, 127)
        self.assertIn("Node.js", completed.stderr)


class ModuleEntryPointTests(unittest.TestCase):
    def test_python_m_tf_arch_help(self):
        completed = subprocess.run(
            [sys.executable, "-m", "tf_arch", "--help"],
            capture_output=True, text=True,
        )
        self.assertEqual(completed.returncode, 0)
        for command in ("serve", "render", "inspect"):
            self.assertIn(f"tf-arch {command}", completed.stdout)


if __name__ == "__main__":
    unittest.main()
