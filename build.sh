#!/usr/bin/env bash
# Build the Gitanjali Tickets APK without Gradle:
# aapt2 -> javac -> d8 -> zipalign -> apksigner
set -euo pipefail

APP="$(cd "$(dirname "$0")" && pwd)"
TOOLS="${TOOLS:-$(cd "$(dirname "$0")" && pwd)/tools}"
export JAVA_HOME="${JAVA_HOME:-$TOOLS/jdk-17.0.13+11}"
export ANDROID_HOME="${ANDROID_HOME:-$TOOLS/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/build-tools/34.0.0:$PATH"
# keep the JVM inside the sandbox memory budget
export JAVA_TOOL_OPTIONS="-Xms32m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:CompressedClassSpaceSize=64m -XX:ReservedCodeCacheSize=48m"

BT="$ANDROID_HOME/build-tools/34.0.0"
ANDROID_JAR="$ANDROID_HOME/platforms/android-35/android.jar"
OUT="$APP/build"
NAME="GitanjaliTickets"

rm -rf "$OUT"
mkdir -p "$OUT/gen" "$OUT/classes" "$OUT/dex"

echo "==> icons"
python3 "$APP/make_icons.py" >/dev/null

echo "==> aapt2 compile"
"$BT/aapt2" compile --dir "$APP/res" -o "$OUT/res.zip"

echo "==> aapt2 link"
"$BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$APP/AndroidManifest.xml" \
  -R "$OUT/res.zip" \
  --java "$OUT/gen" \
  -A "$APP/assets" \
  --min-sdk-version 21 \
  --target-sdk-version 35 \
  --version-code 1 --version-name 1.0 \
  --auto-add-overlay

echo "==> javac"
find "$APP/src" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
javac -nowarn --release 11 \
  -classpath "$ANDROID_JAR" \
  -d "$OUT/classes" \
  @"$OUT/sources.txt" 2>&1 | grep -v 'warning:' || true

echo "==> d8"
find "$OUT/classes" -name '*.class' > "$OUT/classes.txt"
"$BT/d8" -JXmx512m --lib "$ANDROID_JAR" --min-api 21 --release \
  --output "$OUT/dex" @"$OUT/classes.txt"

echo "==> package"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
( cd "$OUT/dex" && zip -q -X "$OUT/unsigned.apk" classes.dex )

echo "==> zipalign"
"$BT/zipalign" -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

echo "==> signing key"
KS="$APP/keystore.jks"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -v -keystore "$KS" -alias gitanjali \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -storepass gitanjali -keypass gitanjali \
    -dname "CN=Gitanjali Cinema Hall, OU=Ticketing, O=Gitanjali Cinema Hall, L=Santiniketan, ST=West Bengal, C=IN" >/dev/null 2>&1
fi

echo "==> apksigner"
"$BT/apksigner" -JXmx512m sign \
  --ks "$KS" --ks-key-alias gitanjali \
  --ks-pass pass:gitanjali --key-pass pass:gitanjali \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --out "$OUT/$NAME.apk" "$OUT/aligned.apk"

"$BT/apksigner" -JXmx512m verify --print-certs "$OUT/$NAME.apk" | head -6
ls -lh "$OUT/$NAME.apk"
echo "OK: $OUT/$NAME.apk"
