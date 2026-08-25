"""Terraform plan → cloud architecture diagram (AWS, Google Cloud, Azure).

Python distribution of the `tf-arch-diagram-generator` npm package. The
rendering engine is JavaScript and runs on a local Node.js (>= 22); this
package bundles it and exposes the CLI as `tf-arch` plus a small API:

    import tf_arch

    svg = tf_arch.render("plan.json", title="Production")
    summary = tf_arch.inspect("plan.json")        # stats, providers, resources, edges
    tf_arch.serve("plan.json", open_browser=True)  # blocks until Ctrl+C
"""

from ._runtime import (
    NODE_ENV_VAR,
    CommandError,
    NodeNotFoundError,
    TfArchError,
    find_node,
    js_root,
    run,
    version,
)
from .api import inspect, render, serve


def __getattr__(name):
    # Resolved lazily: a broken install should fail in the CLI/API call with a
    # clear message, not with a traceback at `import tf_arch`.
    if name == "__version__":
        return version()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "NODE_ENV_VAR",
    "CommandError",
    "NodeNotFoundError",
    "TfArchError",
    "__version__",
    "find_node",
    "inspect",
    "js_root",
    "render",
    "run",
    "serve",
    "version",
]
