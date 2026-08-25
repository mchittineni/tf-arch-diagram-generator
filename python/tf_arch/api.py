"""Python API mirroring the tf-arch CLI commands."""

from __future__ import annotations

import json
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterator, Mapping, Optional, Union

from . import _runtime

PlanInput = Union[str, "os.PathLike[str]", Mapping[str, Any]]


@contextmanager
def _plan_path(plan: PlanInput) -> Iterator[str]:
    """Yield a filesystem path for the plan, materialising dicts to a temp file."""
    if isinstance(plan, Mapping):
        with tempfile.TemporaryDirectory(prefix="tf-arch-") as tmp:
            path = Path(tmp) / "plan.json"
            path.write_text(json.dumps(plan), encoding="utf-8")
            yield str(path)
        return

    yield str(_existing_plan_file(plan))


def _existing_plan_file(plan: Union[str, "os.PathLike[str]"]) -> Path:
    if isinstance(plan, (bytes, bytearray)) or not isinstance(plan, (str, os.PathLike)):
        raise TypeError(
            f"plan must be a path to a plan.json or a dict of the parsed plan, not {type(plan).__name__}"
        )
    path = Path(plan)
    if not path.is_file():
        raise FileNotFoundError(f"Plan file not found: {path}")
    return path


def render(
    plan: PlanInput,
    *,
    out: Optional[Union[str, "os.PathLike[str]"]] = None,
    title: Optional[str] = None,
) -> str:
    """Render a Terraform plan to a standalone SVG and return it as a string.

    `plan` is a path to `terraform show -json` output or the already-parsed
    dict. When `out` is given the SVG is also written there (parents created).
    """
    with _plan_path(plan) as plan_file:
        with tempfile.TemporaryDirectory(prefix="tf-arch-") as tmp:
            target = Path(out) if out is not None else Path(tmp) / "architecture.svg"
            args = ["render", plan_file, "--out", str(target)]
            if title is not None:
                args += ["--title", title]
            _runtime.run(args)
            return target.read_text(encoding="utf-8")


def inspect(plan: PlanInput) -> Dict[str, Any]:
    """Return the machine-readable plan summary (`tf-arch inspect --json`).

    Keys: `stats`, `providers`, `resources`, `edges`.
    """
    with _plan_path(plan) as plan_file:
        completed = _runtime.run(["inspect", plan_file, "--json"])
    return json.loads(completed.stdout)


def serve(
    plan: Optional[Union[str, "os.PathLike[str]"]] = None,
    *,
    port: Optional[int] = None,
    host: Optional[str] = None,
    title: Optional[str] = None,
    open_browser: bool = False,
) -> int:
    """Start the interactive viewer and block until it exits.

    Equivalent to `tf-arch serve [plan] [--port] [--host] [--title] [--open]`.
    Returns the process exit status; Ctrl+C stops the server and returns 130
    rather than raising KeyboardInterrupt. Only file paths are accepted here:
    the server must outlive this call's temporaries.
    """
    args = ["serve"]
    if plan is not None:
        args.append(str(_existing_plan_file(plan)))
    if port is not None:
        args += ["--port", str(port)]
    if host is not None:
        args += ["--host", host]
    if title is not None:
        args += ["--title", title]
    if open_browser:
        args.append("--open")

    try:
        completed = _runtime.run(args, check=False, capture_output=False)
    except KeyboardInterrupt:
        # The child received the same SIGINT and shuts itself down cleanly.
        return 130
    return completed.returncode
