#!/bin/bash

# Copyright 2023 Christian Mazakas
# Distributed under the Boost Software License, Version 1.0.
# https://www.boost.org/LICENSE_1_0.txt

set -ex
export PATH=~/.local/bin:/usr/local/bin:$PATH

DRONE_BUILD_DIR=$(pwd)

BOOST_BRANCH=develop
if [ "$DRONE_BRANCH" = "master" ]; then BOOST_BRANCH=master; fi

cd ..
git clone -b $BOOST_BRANCH --depth 1 https://github.com/boostorg/boost.git boost-root
cd boost-root
git submodule update --init tools/boostdep
python tools/boostdep/depinst/depinst.py config
./bootstrap.sh
./b2 -d0 headers

echo 'using asciidoctor : "/usr/bin/asciidoctor" ;' > ~/user-config.jam
./b2 $DRONE_BUILD_DIR
