#!/bin/sh
#
# Copyright (c) 2024 The C++ Alliance, Inc. (https://cppalliance.org)
#
# Distributed under the Boost Software License, Version 1.0. (See accompanying
# file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
#
# Official repository: https://github.com/boostorg/website-v2-docs
#


# This script is used to build the Antora-based
# documentation for Boost libraries and for the
# versioned site documentation such as the
# User's Guide.
#

set -e

if [ $# -eq 0 ]; then
  echo "Usage: $0 { branch | version | 'release' | 'all' }..."
  echo
  echo "    branch : 'develop' | 'master' | 'release'"
  echo "    version: [0-9]+ '.' [0-9]+ '.' [0-9]+"
  echo "    'release': builds master to build/doc/html"
  echo "    'all': rebuilds develop, master, and every version"
  echo
  echo "Examples:"
  echo
  echo "    $0 develop master      # build develop and master"
  echo "    $0 1.83.0              # build tagged version boost-1.83.0"
  exit 2
fi

# Check if node and npx are available
node_version=$(node --version 2>/dev/null)
if [ -z "$node_version" ]; then
  echo "Node.js is not installed"
  exit 1
fi
major_version=$(echo "$node_version" | egrep -o "v([0-9]+)\." | cut -c 2- | rev | cut -c 2- | rev)
if [ "$major_version" -lt "16" ]; then
  echo "Node.js version $node_version is not supported. Please upgrade to version 16 or higher."
  node_path=$(which node)
  echo "node_path=${node_path}"
fi
echo "Node.js version $node_version"

npx_version=$(npx --version 2>/dev/null)
if [ -z "$npx_version" ]; then
  echo "npx is not installed"
  exit 1
fi
echo "npx version $npx_version"

cwd=$(pwd)
script_dir=$(dirname "$(readlink -f "$0")")
if ! [ -e "$script_dir/antora-ui/build/ui-bundle.zip" ]; then
  echo "Building antora-ui"
  cd "$script_dir/antora-ui" || exit
  ./build.sh
  cd "$cwd" || exit
fi

if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  commit_id=$(git rev-parse HEAD)
  commit_id=$(expr substr "$commit_id" 1 7)
else
  commit_id=""
fi
echo "Commit ID: $commit_id"

if [ ! -d "node_modules" ] || [ "$(find package.json -prune -printf '%T@\n' | cut -d . -f 1)" -gt "$(find node_modules -prune -printf '%T@\n' | cut -d . -f 1)" ]; then
  echo "Installing playbook node modules"
  npm ci
fi

# Run antora command
while test $# -gt 0; do
  set -x
  if [ "$CI" = "true" ]; then
    ANTORA_LOG_LEVEL=all
    export ANTORA_LOG_LEVEL
  fi

  if [ "$1" = "develop" ] || [ "$1" = "master" ]; then
    npx antora --fetch \
      --attribute page-boost-branch="$1" \
      --attribute page-boost-ui-branch="$1" \
      --attribute page-commit-id="$commit_id" \
      --stacktrace \
      libs.playbook.yml

  elif [ "$1" = "release" ]; then
    npx antora --fetch \
      --attribute page-boost-branch=master \
      --attribute page-boost-ui-branch=master \
      --attribute page-commit-id="$commit_id" \
      --attribute page-boost-is-release=true \
      --stacktrace \
      libs.playbook.yml

  elif echo "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    f="./history/libs.$1.playbook.yml"
    if [ -f "$f" ]; then
      echo "Building playbook $f"
      npx antora --fetch \
      --attribute page-boost-branch="$1" \
      --attribute page-boost-ui-branch=master \
      --attribute page-commit-id="$commit_id" \
      --stacktrace \
        "$f"
    else
      echo "Playbook \"$f\" does not exist"
    fi

  elif [ "$1" = "all" ]; then
    for f in ./history/*.yml; do
      echo "Building playbook $f"
      npx antora --fetch \
        --attribute page-boost-branch="$branch" \
        --attribute page-boost-ui-branch="$branch" \
        --stacktrace \
        "$f"
    done
    for branch in master develop; do
      echo "Building playbook libs.playbook.yml for $branch branch"
      npx antora --fetch \
        --attribute page-boost-branch=$branch \
        --attribute page-boost-ui-branch=$branch \
        --stacktrace \
        libs.playbook.yml
    done
  else
    echo "invalid argument: '$1'"
  fi
  shift
done
