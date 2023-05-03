#!/bin/sh

# This script is used to build the site
# documentation which is not tagged per release.
#

if [ $# -eq 0 ]; then
  echo "Usage: $0 { 'develop' | 'master' }..."
  echo
  echo "Examples:"
  echo
  echo "    $0 develop        # build develop"
  echo "    $0 master         # build master"
  exit 2
fi

# Check if node and npx are available
node_version=$(node --version 2>/dev/null)
if [ -z "$node_version" ]; then
  echo "Node.js is not installed"play
  exit 1
fi
major_version=$(echo $node_version | egrep -o "v([0-9]+)\." | cut -c 2- | rev | cut -c 2- | rev)
if [ "$major_version" -lt "16" ]; then
  echo "Node.js version $node_version is not supported. Please upgrade to version 16 or higher."
  node_path=$(which node)
  echo "node_path=${node_path}"
fi

antora_version=$(antora --version 2>/dev/null)
if [ -n "$antora_version" ]; then
  ANTORA_CMD='antora'
else
  npx_version=$(npx --version 2>/dev/null)
  if [ -z "$npx_version" ]; then
    echo "Neither antora nor npx are installed"
    exit 1
  else
    ANTORA_CMD='npx antora'
  fi
fi

cwd=$(pwd)
script_dir=$(dirname "$(readlink -f "$0")")
if ! [ -e "$script_dir/antora-ui/build/ui-bundle.zip" ] || \
   find "$script_dir/antora-ui" -newer "$script_dir/antora-ui/build/ui-bundle.zip" -print -quit | grep -q .
then
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

if [ "$1" != "develop" ] && [ "$1" != "master" ]; then
  echo "invalid argument: '$1'"
  exit 1
fi

$ANTORA_CMD --fetch \
  --attribute page-boost-branch="$1" \
  --attribute page-commit-id="$commit_id" \
  site.playbook.yml
