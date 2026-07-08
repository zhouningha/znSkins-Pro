#!/usr/bin/env bash
# One-shot deploy for zhouningha fork → Home Assistant production.
# Restores skin assets, JS bundle, and lovelace skin selection in one run.
set -euo pipefail

HA_HOST="${HA_HOST:-root@192.168.1.17}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKIN="god_of_war_3_wall"
REMOTE_WWW="/config/www/community/skins-pro"
REMOTE_SKIN="${REMOTE_WWW}/${SKIN}"

echo "==> Build (if dist missing or --build passed)"
if [[ "${1:-}" == "--build" ]] || [[ ! -f "${REPO_ROOT}/dist/skins-pro.js" ]]; then
  (cd "${REPO_ROOT}" && npm run build)
fi

echo "==> Refresh ${SKIN} from store zip (build output)"
rm -rf "${REPO_ROOT}/dist/${SKIN}"
unzip -q -o "${REPO_ROOT}/store/${SKIN}.zip" -d "${REPO_ROOT}/dist"

echo "==> Backup remote skin"
ssh "${HA_HOST}" "cp -a '${REMOTE_SKIN}' '${REMOTE_WWW}/${SKIN}-backup-\$(date +%Y%m%d-%H%M%S)' 2>/dev/null || true"

echo "==> Upload ${SKIN} + skins-pro.js"
(cd "${REPO_ROOT}/dist" && tar czf - "${SKIN}") | ssh "${HA_HOST}" "mkdir -p '${REMOTE_WWW}' && cd '${REMOTE_WWW}' && tar xzf - --overwrite"
cat "${REPO_ROOT}/dist/skins-pro.js" | ssh "${HA_HOST}" "cat > '${REMOTE_WWW}/skins-pro.js'"
cat "${REPO_ROOT}/dist/version.json" | ssh "${HA_HOST}" "cat > '${REMOTE_WWW}/version.json'"

echo "==> Patch lovelace.my_home skin + downloaded_skins"
ssh "${HA_HOST}" "python3 - <<'PY'
import json, shutil
from datetime import datetime
p='/config/.storage/lovelace.my_home'
backup=p+'.before-deploy-'+datetime.now().strftime('%Y%m%d-%H%M%S')
shutil.copy2(p, backup)
with open(p) as f:
    d=json.load(f)
cfg=d['data']['config']
if 'strategy' in cfg:
    s=cfg['strategy']
elif cfg.get('views'):
    s=cfg['views'][0]['cards'][0]
else:
    raise SystemExit('Unsupported lovelace.my_home structure')
s.setdefault('resource_pack', {})
s['resource_pack']['skin']='${SKIN}'
s['resource_pack']['base_path']='__AUTO__'
skins=set(s.get('downloaded_skins') or [])
skins.add('${SKIN}')
s['downloaded_skins']=sorted(skins)
with open(p,'w') as f:
    json.dump(d,f,ensure_ascii=False,indent=2)
print('backup', backup)
print('skin', s['resource_pack']['skin'])
print('downloaded_skins', s['downloaded_skins'])
PY"

echo "==> Done. Hard refresh HA (Cmd+Shift+R)."
