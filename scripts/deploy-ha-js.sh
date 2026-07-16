#!/usr/bin/env bash
# Deploy the current Skins Pro JS bundle to Home Assistant and bump the frontend resource URL.
set -euo pipefail

HA_HOST="${HA_HOST:-root@192.168.1.17}"
REMOTE_WWW="${REMOTE_WWW:-/homeassistant/www/community/skins-pro}"
REMOTE_MIRROR_WWW="${REMOTE_MIRROR_WWW:-/homeassistant/www/community/znSkins-Pro}"
REMOTE_CUSTOM_WWW="${REMOTE_CUSTOM_WWW:-/homeassistant/www/skins-pro}"
DEPLOY_SKIN="${DEPLOY_SKIN:-god_of_war_3_wall}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${1:-}" == "--build" || ! -f "${REPO_ROOT}/dist/skins-pro.js" ]]; then
  (cd "${REPO_ROOT}" && npm run build)
fi

build="$(node -e "const fs=require('fs'); const p='${REPO_ROOT}/dist/version.json'; console.log(fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')).version : Date.now())")"
stamp="$(date +%Y%m%d-%H%M%S)"

echo "==> Upload latest skins-pro.js to ${HA_HOST}:${REMOTE_WWW}"
ssh "${HA_HOST}" "mkdir -p '${REMOTE_WWW}' && cp '${REMOTE_WWW}/skins-pro.js' '${REMOTE_WWW}/skins-pro.js.before-js-deploy-${stamp}' 2>/dev/null || true"
ssh "${HA_HOST}" "cat > /tmp/skins-pro.js.${stamp}" < "${REPO_ROOT}/dist/skins-pro.js"
ssh "${HA_HOST}" "cp /tmp/skins-pro.js.${stamp} '${REMOTE_WWW}/skins-pro.js'"
ssh "${HA_HOST}" "mkdir -p '${REMOTE_MIRROR_WWW}' && cp /tmp/skins-pro.js.${stamp} '${REMOTE_MIRROR_WWW}/skins-pro.js'"

if [[ -f "${REPO_ROOT}/dist/version.json" ]]; then
  ssh "${HA_HOST}" "cat > /tmp/skins-pro-version.${stamp}.json" < "${REPO_ROOT}/dist/version.json"
  ssh "${HA_HOST}" "cp /tmp/skins-pro-version.${stamp}.json '${REMOTE_WWW}/version.json'"
  ssh "${HA_HOST}" "cp /tmp/skins-pro-version.${stamp}.json '${REMOTE_MIRROR_WWW}/version.json'"
fi

if [[ -f "${REPO_ROOT}/dist/${DEPLOY_SKIN}/theme.css" ]]; then
  echo "==> Upload ${DEPLOY_SKIN}/theme.css"
  ssh "${HA_HOST}" "mkdir -p '${REMOTE_WWW}/${DEPLOY_SKIN}' && cp '${REMOTE_WWW}/${DEPLOY_SKIN}/theme.css' '${REMOTE_WWW}/${DEPLOY_SKIN}/theme.css.before-js-deploy-${stamp}' 2>/dev/null || true"
  ssh "${HA_HOST}" "cat > /tmp/${DEPLOY_SKIN}.theme.${stamp}.css" < "${REPO_ROOT}/dist/${DEPLOY_SKIN}/theme.css"
  ssh "${HA_HOST}" "cp /tmp/${DEPLOY_SKIN}.theme.${stamp}.css '${REMOTE_WWW}/${DEPLOY_SKIN}/theme.css'"
  ssh "${HA_HOST}" "mkdir -p '${REMOTE_MIRROR_WWW}/${DEPLOY_SKIN}' && cp '${REMOTE_MIRROR_WWW}/${DEPLOY_SKIN}/theme.css' '${REMOTE_MIRROR_WWW}/${DEPLOY_SKIN}/theme.css.before-js-deploy-${stamp}' 2>/dev/null || true"
  ssh "${HA_HOST}" "cp /tmp/${DEPLOY_SKIN}.theme.${stamp}.css '${REMOTE_MIRROR_WWW}/${DEPLOY_SKIN}/theme.css'"
  ssh "${HA_HOST}" "mkdir -p '${REMOTE_CUSTOM_WWW}/${DEPLOY_SKIN}' && cp '${REMOTE_CUSTOM_WWW}/${DEPLOY_SKIN}/theme.css' '${REMOTE_CUSTOM_WWW}/${DEPLOY_SKIN}/theme.css.before-js-deploy-${stamp}' 2>/dev/null || true"
  ssh "${HA_HOST}" "cp /tmp/${DEPLOY_SKIN}.theme.${stamp}.css '${REMOTE_CUSTOM_WWW}/${DEPLOY_SKIN}/theme.css'"
fi

echo "==> Bump Lovelace resource cache tag"
ssh "${HA_HOST}" "python3 - <<PY
import json, time
paths = ['/config/.storage/lovelace_resources', '/homeassistant/.storage/lovelace_resources']
tag = '${build}-' + str(int(time.time()))
for path in paths:
    try:
        with open(path) as f:
            data = json.load(f)
    except FileNotFoundError:
        continue
    changed = False
    for item in data.get('data', {}).get('items', []):
        url = item.get('url', '')
        if 'skins-pro' in url.lower() and 'skins-pro.js' in url.lower():
            item['url'] = url.split('?')[0] + '?v=' + tag
            changed = True
    if changed:
        with open(path, 'w') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print('updated_resource', path, tag)
        break
else:
    print('resource_not_found_or_not_changed', tag)
PY"

echo "==> Remote bundle check"
ssh "${HA_HOST}" "sha256sum '${REMOTE_WWW}/skins-pro.js'; ls -l '${REMOTE_WWW}/skins-pro.js'"
ssh "${HA_HOST}" "sha256sum '${REMOTE_MIRROR_WWW}/skins-pro.js' 2>/dev/null || true"
echo "==> Done. Reopen the HA app if the old JS is still active."
