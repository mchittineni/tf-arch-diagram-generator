"""Version source for the Python distribution.

The single source of truth is the npm package version. During a release
semantic-release bumps ../package.json in the working tree before the Python
build runs; TF_ARCH_VERSION lets a workflow pass the released tag explicitly.
When building a wheel from an sdist the repo root is absent, so fall back to
the package.json bundled inside tf_arch/_js/.
"""

import json
import os
from pathlib import Path

_HERE = Path(__file__).resolve().parent


def _read_version() -> str:
    override = os.environ.get("TF_ARCH_VERSION", "").strip()
    if override:
        return override[1:] if override.startswith("v") else override

    for candidate in (
        _HERE.parent / "package.json",
        _HERE / "tf_arch" / "_js" / "package.json",
    ):
        if candidate.is_file():
            with candidate.open(encoding="utf-8") as fh:
                return json.load(fh)["version"]

    raise RuntimeError(
        "Cannot determine the tf-arch version: no ../package.json (build from the "
        "repository checkout) and no bundled tf_arch/_js/package.json (build from an "
        "sdist). Set TF_ARCH_VERSION to override."
    )


VERSION = _read_version()
