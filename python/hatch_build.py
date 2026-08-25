"""Hatchling build hook: bundle the JavaScript runtime into the package.

Maps the repository's bin/, src/, dist/, package.json and LICENSE into
tf_arch/_js/ for both the sdist and the wheel, without copying anything into
the source tree. Building a wheel from an sdist has no repo root, but the
sdist already carries tf_arch/_js/, so that copy is used instead.

Everything goes through `force_include` on purpose: hatch copies the
repository .gitignore into the sdist, and its `dist/` rule would otherwise
silently drop tf_arch/_js/dist/ from a wheel built from that sdist.
"""

from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface

# Everything bin/cli.js needs at runtime. package.json is essential: its
# `"type": "module"` is what makes the .js files load as ES modules.
JS_ENTRIES = ("bin", "src", "dist", "package.json", "LICENSE")


class JsRuntimeHook(BuildHookInterface):
    PLUGIN_NAME = "custom"

    def initialize(self, version, build_data):
        project_root = Path(self.root)
        repo_root = project_root.parent
        bundled = project_root / "tf_arch" / "_js"

        force_include = build_data.setdefault("force_include", {})

        if not (repo_root / "bin" / "cli.js").is_file():
            if (bundled / "bin" / "cli.js").is_file():
                # Building from an sdist: re-include the bundled copy verbatim.
                force_include[str(bundled)] = "tf_arch/_js"
                return
            raise RuntimeError(
                "tf-arch JavaScript sources not found. Build from the repository "
                f"checkout (expected {repo_root / 'bin' / 'cli.js'})."
            )

        if not (repo_root / "dist" / "index.html").is_file():
            raise RuntimeError(
                "Built web assets missing at dist/. Run `npm run build` in the "
                "repository root before building the Python package."
            )

        for entry in JS_ENTRIES:
            source = repo_root / entry
            if not source.exists():
                raise RuntimeError(f"Expected {source} to exist")
            force_include[str(source)] = f"tf_arch/_js/{entry}"
