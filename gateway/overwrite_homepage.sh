#!/bin/sh
if [ -x "$(command -v docker)" ]; then
    echo "This script should not be run outside the container"
    exit 1
else
    if [ -z ${WR_ROOT+x} ]; then
        echo "Using default homepage root"
        exit 0
    else
        echo "Updating homepage root to '$WR_ROOT'";
        sed -i "s/\(location \)\//\1$WR_ROOT\//" default.conf
    fi
fi
