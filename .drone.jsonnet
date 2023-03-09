# Copyright 2023 Christian Mazakas
# Distributed under the Boost Software License, Version 1.0.
# https://www.boost.org/LICENSE_1_0.txt

local triggers =
{
    branch: [ "master", "develop", "feature/*", "bugfix/*", "fix/*", "pr/*", "base-template" ]
};

local linux_pipeline(name, image, environment, packages = "", sources = [], arch = "amd64") =
{
    name: name,
    kind: "pipeline",
    type: "docker",
    trigger: triggers,
    platform:
    {
        os: "linux",
        arch: arch
    },
    steps:
    [
        {
            name: "everything",
            image: image,
            environment: environment,
            commands:
            [
                'set -e',
                'uname -a',
                'wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add -',
            ] +
            (if sources != [] then [ ('apt-add-repository "' + source + '"') for source in sources ] else []) +
            (if packages != "" then [ 'apt-get update', 'apt-get -y install ' + packages ] else []) +
            [
                './.drone/drone.sh',
            ]
        }
    ]
};

[

    linux_pipeline(
        "Linux 22.04 GCC 11* 32/64",
        "cppalliance/droneubuntu2204:1",
        {},
        "asciidoctor"
    ),

]
