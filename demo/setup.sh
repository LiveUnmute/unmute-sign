#!/usr/bin/env bash
# Copies the MediaPipe runtime out of node_modules into ./vendor so it can be
# served locally (and works on hospital wifi).
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/@mediapipe/tasks-vision ] || { echo "Run 'npm install' first."; exit 1; }
mkdir -p vendor/wasm
cp node_modules/@mediapipe/tasks-vision/vision_bundle.mjs vendor/
cp node_modules/@mediapipe/tasks-vision/wasm/* vendor/wasm/
echo "vendor/ ready ($(du -sh vendor | cut -f1))"
