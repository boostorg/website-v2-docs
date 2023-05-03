#!/bin/sh

if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git rev-parse --abbrev-ref HEAD)
else
  branch="develop"
fi

if [ "$branch" != "master" ] && [ "$branch" != "develop" ]; then
  branch="develop"
fi

./sitedoc.sh "$branch"
