#!/bin/bash

set -ex

version=$1

if [ -z "$version" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

pnpm run version
git tag -a "$version" -m "Release $version"
