#!/usr/bin/env bash
############################################################################
## ci-prebuild.sh
## CI prebuild for the shared ci-workflows maven.yaml (runs before Maven):
## Jest unit tests, the React build that is packaged into the jar, and the
## HTTPS dev server on :3001 that the Selenium ITs drive (as the old
## qqq-orb frontend-material pipeline did). Maven then runs the ITs headless.
############################################################################
set -euo pipefail

npm ci --legacy-peer-deps
npm test -- --watchAll=false
npm run build-and-publish

HTTPS=true PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 \
   nohup setsid npm run start > /tmp/react-dev-server.log 2>&1 < /dev/null &

for _ in $(seq 1 150); do
   if curl -ksf -o /dev/null https://localhost:3001/; then
      echo "React dev server is up on https://localhost:3001"
      exit 0
   fi
   sleep 2
done
echo "React dev server did not come up on :3001"
cat /tmp/react-dev-server.log
exit 1
