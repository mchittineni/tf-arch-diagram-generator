"""Locate the bundled JavaScript and a usable Node.js, and run the CLI."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from typing import Optional, Sequence

NODE_ENV_VAR = "TF_ARCH_NODE"
NODE_DOWNLOAD_URL = "https://nodejs.org/en/download"


class TfArchError(RuntimeError):
    """Base class for errors raised by the tf_arch package."""


class NodeNotFoundError(TfArchError):
    """No Node.js executable could be located."""


class CommandError(TfArchError):
    """The tf-arch CLI exited with a non-zero status."""

    def __init__(self, args: Sequence[str], returncode: int, stderr: str):
        self.args_list = list(args)
        self.returncode = returncode
        self.stderr = stderr
        message = stderr.strip() or f"tf-arch exited with status {returncode}"
        super().__init__(message)


@lru_cache(maxsize=None)
def js_root() -> Path:
    """Directory holding bin/, src/, dist/ and package.json.

    Installed wheels carry them in tf_arch/_js/. Running from a repository
    checkout (python/tf_arch/) falls back to the repo root so the package
    works uninstalled, e.g. in the test suite.
    """
    here = Path(__file__).resolve().parent
    for candidate in (here / "_js", here.parent.parent):
        if (candidate / "bin" / "cli.js").is_file():
            return candidate
    raise TfArchError(
        "Bundled tf-arch JavaScript not found. The package appears to be "
        "installed incorrectly; reinstall with `pip install --force-reinstall "
        "tf-arch-diagram-generator`."
    )


def cli_script() -> Path:
    return js_root() / "bin" / "cli.js"


@lru_cache(maxsize=None)
def version() -> str:
    """Version of the bundled tool (identical to the npm package version)."""
    with (js_root() / "package.json").open(encoding="utf-8") as fh:
        return json.load(fh)["version"]


def find_node() -> str:
    """Resolve the Node.js executable.

    Honours TF_ARCH_NODE (a path to a node binary), otherwise searches PATH.
    Version enforcement (Node >= 22) lives in bin/cli.js so the floor is
    defined in exactly one place.
    """
    override = os.environ.get(NODE_ENV_VAR)
    if override:
        resolved = shutil.which(override) or (override if Path(override).is_file() else None)
        if not resolved:
            raise NodeNotFoundError(
                f"{NODE_ENV_VAR}={override!r} does not point to a Node.js executable."
            )
        return resolved

    resolved = shutil.which("node")
    if resolved:
        return resolved

    raise NodeNotFoundError(
        "tf-arch needs Node.js 22 or newer but no `node` executable was found on PATH.\n"
        f"Install it from {NODE_DOWNLOAD_URL} (or with your package manager / nvm / fnm), "
        f"or set {NODE_ENV_VAR} to the path of a node binary."
    )


def build_command(args: Sequence[str]) -> list:
    return [find_node(), str(cli_script()), *args]


def run(
    args: Sequence[str],
    *,
    check: bool = True,
    capture_output: bool = True,
    cwd: Optional[os.PathLike] = None,
    **popen_kwargs,
) -> subprocess.CompletedProcess:
    """Run `tf-arch <args>` and return the CompletedProcess.

    With check=True (default) a non-zero exit raises CommandError carrying
    the CLI's stderr, which is where it prints its human-readable messages.
    """
    completed = subprocess.run(
        build_command(args),
        capture_output=capture_output,
        text=True,
        cwd=cwd,
        **popen_kwargs,
    )
    if check and completed.returncode != 0:
        raise CommandError(args, completed.returncode, completed.stderr or "")
    return completed


def exec_cli(args: Sequence[str]) -> int:
    """Hand the terminal over to the JavaScript CLI.

    On POSIX the Python process is replaced outright, so signals, exit codes
    and TTY behaviour are exactly those of the npm `tf-arch` command. Windows
    has no real exec, so the child is waited on instead.
    """
    command = build_command(args)
    if os.name != "nt":
        sys.stdout.flush()
        sys.stderr.flush()
        os.execv(command[0], command)
    try:
        return subprocess.call(command)
    except KeyboardInterrupt:
        return 130
