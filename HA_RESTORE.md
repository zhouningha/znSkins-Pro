# HA 恢复记忆点 — God of War 主题

以后 HA 重装、换机、恢复备份后，按本文执行即可，不需要重新摸索。

## 固定参数

| 项 | 值 |
|---|---|
| HA SSH | `root@192.168.1.17` |
| 皮肤 ID | `god_of_war_3_wall` |
| 安装目录 | `/config/www/community/skins-pro/` |
| 仪表盘 | `lovelace.my_home` |
| 素材来源 | `source-kratos-wallpaper.jpg`（GOW III 官方宣传图裁切） |
| 视觉偏好 | **深色背景**（`theme.css` 暗红玻璃 + 背景图 darken 0.36） |

## 一键恢复（推荐）

在 Mac 上，仓库根目录执行：

```bash
chmod +x scripts/deploy-ha-god-war.sh
./scripts/deploy-ha-god-war.sh --build
```

脚本会自动：

1. `npm run build`（加 `--build` 时）
2. 上传 `dist/god_of_war_3_wall/` 和 `dist/skins-pro.js`
3. 备份远程旧皮肤目录
4. 把 `lovelace.my_home` 设为：
   - `resource_pack.skin = god_of_war_3_wall`
   - `resource_pack.base_path = __AUTO__`
   - `downloaded_skins` 包含 `god_of_war_3_wall`

完成后浏览器 **Cmd + Shift + R** 强刷。

## 手动恢复（脚本不可用时）

```bash
# 1. 本地构建
cd /Users/mac/Projects/Skins-Pro && npm run build

# 2. 上传皮肤（scp 不可用则用 tar）
cd dist && tar czf - god_of_war_3_wall | ssh root@192.168.1.17 \
  "cd /config/www/community/skins-pro && tar xzf - --overwrite"

# 3. 上传 JS
cat dist/skins-pro.js | ssh root@192.168.1.17 \
  "cat > /config/www/community/skins-pro/skins-pro.js"

# 4. 强刷 HA
```

Lovelace 皮肤必须在编辑器里能看到 `god_of_war_3_wall (Downloaded)`。  
若下拉里只有 `modern`，说明 `downloaded_skins` 没写上，重新跑部署脚本。

## 重新生成官方素材

素材在桌面包，不在仓库里：

```bash
cd ~/Desktop/Skins\ Pro/god-war-wall-package
python3 generate_official_god_war_assets.py

# 同步到仓库并构建
python3 - <<'PY'
import shutil
from pathlib import Path
src = Path("skins-pro/god_war_wall")
dst = Path("/Users/mac/Projects/Skins-Pro/skins-pro/god_of_war_3_wall")
for f in src.iterdir():
    if f.suffix.lower() in {".jpg", ".png"}:
        shutil.copy2(f, dst / f.name)
PY
cd /Users/mac/Projects/Skins-Pro && npm run build
./scripts/deploy-ha-god-war.sh
```

## 必查项（恢复后 30 秒自检）

- [ ] 皮肤下拉有 `god_of_war_3_wall (Downloaded)`
- [ ] 背景是奎托斯 vs 泰坦（不是矢量模拟图）
- [ ] 侧边栏底部装饰是奎托斯背影 + 双刃
- [ ] 背景/侧边栏偏**深暗红**，不要发白
- [ ] 圆角开关、房间切换、环境卡仍正常

## 相关文件

- 定制功能：`CUSTOM_FEATURES.md`
- 升级检查：`UPGRADE_CHECKLIST.md`
- 官方素材脚本：`scripts/generate_official_god_war_assets.py`
- 部署脚本：`scripts/deploy-ha-god-war.sh`
