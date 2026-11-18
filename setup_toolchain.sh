#!/usr/bin/env bash
# One-time toolchain setup: JDK 17 + Android build-tools 34 + platform 35.
# No Android Studio, no Gradle, no root needed.
set -euo pipefail
TOOLS="${TOOLS:-$(cd "$(dirname "$0")" && pwd)/tools}"
mkdir -p "$TOOLS" && cd "$TOOLS"

JDK_DIR="jdk-17.0.13+11"
if [ ! -d "$JDK_DIR" ]; then
  echo "==> JDK 17"
  curl -sL -o jdk.tar.gz "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_linux_hotspot_17.0.13_11.tar.gz"
  tar xzf jdk.tar.gz && rm jdk.tar.gz
fi

SDK="$TOOLS/sdk"
mkdir -p "$SDK/build-tools" "$SDK/platforms"
if [ ! -d "$SDK/build-tools/34.0.0" ]; then
  echo "==> build-tools 34.0.0"
  curl -sL -o bt.zip "https://dl.google.com/android/repository/build-tools_r34-linux.zip"
  unzip -q bt.zip -d bt-tmp
  mv bt-tmp/* "$SDK/build-tools/34.0.0"
  rmdir bt-tmp && rm bt.zip
fi
if [ ! -d "$SDK/platforms/android-35" ]; then
  echo "==> platform android-35"
  curl -sL -o plat.zip "https://dl.google.com/android/repository/platform-35_r02.zip"
  unzip -q plat.zip -d "$SDK/platforms" && rm plat.zip
fi

echo "toolchain ready in $TOOLS"
echo "now run:  TOOLS=$TOOLS ./build.sh"
