#!/usr/bin/env python3
"""Check all four published JARs against this checkout's root license files."""

import argparse
from pathlib import Path
import sys
from zipfile import BadZipFile, ZipFile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive_prefix", type=Path,
                        help="archive path without classifier or .jar suffix")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    expected = {name: (root / name).read_bytes() for name in ("LICENSE", "NOTICE")}
    failures = []

    for classifier in ("", "-sources", "-tests", "-javadoc"):
        archive = Path(f"{args.archive_prefix}{classifier}.jar")
        try:
            with ZipFile(archive) as jar:
                for name, content in expected.items():
                    entry = f"META-INF/{name}"
                    if jar.namelist().count(entry) != 1:
                        failures.append(f"{archive}: expected exactly one {entry}")
                    elif jar.read(entry) != content:
                        failures.append(f"{archive}: {entry} differs from root {name}")
        except (OSError, BadZipFile) as error:
            failures.append(f"{archive}: {error}")

    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print("PASS: main, sources, tests and javadoc JARs contain exact root LICENSE/NOTICE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
