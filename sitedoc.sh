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
# major_version=$(echo $node_version | egrep -o "v([0-9]+)\." | cut -c 2- | rev | cut -c 2- | rev)
major_version=$(echo "$node_version" | awk -F. '{print $1}' | cut -c 2-)
if [ "$major_version" -lt "16" ]; then
  echo "Node.js version $node_version is not supported. Please upgrade to version 16 or higher."
  node_path=$(which node)
  echo "node_path=${node_path}"
fi

# Check if antora is available
PATH=$(pwd)/node_modules/.bin:$PATH
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

# Build UI if we have to
cwd=$(pwd)
script_dir=$(dirname "$(readlink -f "$0")")
if ! [ -e "$script_dir/antora-ui/build/ui-bundle.zip" ] || \
   find "$script_dir/antora-ui" -newer "$script_dir/antora-ui/build/ui-bundle.zip" -print -quit | grep -q .
then
  cd "$script_dir/antora-ui" || exit
  ./build.sh
  cd "$cwd" || exit
fi

# Identify current commit id for footer
if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  commit_id=$(git rev-parse HEAD)
  commit_id=$(expr substr "$commit_id" 1 7)
else
  commit_id=""
fi

# Install node modules if needed
if [ ! -d "node_modules" ] || [ "$(find package.json -prune -printf '%T@\n' | cut -d . -f 1)" -gt "$(find node_modules -prune -printf '%T@\n' | cut -d . -f 1)" ]; then
  npm ci
fi

# TODO: Find a better way of setting these
export ALGOLIA_APP_ID="HXFFX7FZYE"
export ALGOLIA_API_KEY="6a58e88f13574fdb9b18ca0159e896b4"
export ALGOLIA_IDX_NAME="cppalliancedocs"

echo $ANTORA_CMD --fetch --attribute page-boost-branch="$1" --attribute page-commit-id="$commit_id" site.playbook.yml
$ANTORA_CMD --fetch --attribute page-boost-branch="$1" --attribute page-commit-id="$commit_id" site.playbook.yml

