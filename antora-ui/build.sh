#!/bin/sh

# This script is used to build the Antora-UI

npm_version=$(npm --version 2>/dev/null)
if [ -z "$npm_version" ]; then
  echo "npm is not installed"
  exit 1
fi

gulp_version=$(gulp --version 2>/dev/null)
if [ -z "$gulp_version" ]; then
  echo "gulp is not installed"
  exit 1
fi

if [ ! -d "node_modules" ] || [ "$(find package.json -prune -printf '%T@\n' | cut -d . -f 1)" -gt "$(find node_modules -prune -printf '%T@\n' | cut -d . -f 1)" ]; then
  npm ci
fi

gulp bundle
