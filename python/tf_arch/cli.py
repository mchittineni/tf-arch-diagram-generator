"""`tf-arch` console script: a thin shim over the JavaScript CLI."""

from __future__ import annotations

import sys
from typing import Optional, Sequence

from ._runtime import NodeNotFoundError, TfArchError, exec_cli


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    try:
        return exec_cli(args)
    except NodeNotFoundError as err:
        print(f"Error: {err}", file=sys.stderr)
        return 127
    except TfArchError as err:
        print(f"Error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
