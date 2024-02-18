#!/bin/sh
#
# Copyright (c) 2024 The C++ Alliance, Inc. (https://cppalliance.org)
#
# Distributed under the Boost Software License, Version 1.0. (See accompanying
# file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
#
# Official repository: https://github.com/boostorg/website-v2-docs
#

if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git rev-parse --abbrev-ref HEAD)
  echo "Setting branch to \"${branch}\""
fi

./sitedoc.sh "$branch"
