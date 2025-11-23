#!/bin/bash

jq '.background.service_worker = .background.scripts[0] | del(.background.scripts)' src/manifest.json > src/manifest.chrome.json

