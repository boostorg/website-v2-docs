#!/bin/sh

if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git rev-parse --abbrev-ref HEAD)
  echo "Setting branch to \"${branch}\""
fi

./sitedoc.sh "$branch"
