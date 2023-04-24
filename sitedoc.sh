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
if ! [ -e "$script_dir/antora-ui/build/ui-bundle.zip" ]; then
  cd "$script_dir/antora-ui" || exit
  ./build.sh
  cd "$cwd" || exit
fi

while test $# -gt 0; do
  if [ "$1" = "develop" ]; then
    $ANTORA_CMD --fetch \
      --attribute page-boost-branch=$1 \
      site.playbook.yml
  elif [ "$1" = "master" ]; then
    $ANTORA_CMD --fetch \
      --attribute page-boost-branch=$1 \
      site.playbook.yml
  else
    echo "invalid argument: '$1'"
  fi
  shift
done
