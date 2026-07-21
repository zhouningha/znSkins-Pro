# AI 交接：首页布局 / 门禁 / 环境排序（znSkins-Pro）

给后续 AI 用。先读本文件 + `CUSTOM_FEATURES.md` + `UPGRADE_CHECKLIST.md`，再改代码。不要猜，不要试验性部署；改完按文末「构建与部署」操作。

---

## 1. 仓库与生产环境

| 项 | 值 |
|---|---|
| 本地仓库 | `/Users/mac/Desktop/Skins Pro/znSkins-Pro`（fork：`zhouningha/znSkins-Pro`） |
| HA SSH | `root@192.168.1.17` |
| JS 安装路径 | `/config/www/community/skins-pro/skins-pro.js` |
| 主题 CSS 根目录 | `/config/www/skins-pro/<skin>/` |
| 常用仪表盘 | `/config/.storage/lovelace.dashboard_n_2` |
| Lovelace 资源 | `/config/.storage/lovelace_resources`（必须 bump `build=` / `v=`） |

**规则：** 合并官方 Skins Pro 前必须核对 `CUSTOM_FEATURES.md`。设备页排序/隐藏、窗帘点按进度条、编辑空闲 10s、God of War、能源日 `change`、kiosk 全屏等不得删。

---

## 2. 本轮已做完的改动（保留，勿回退除非用户要求）

### 2.1 首页摄像头布局（`src/views/home.ts`）

- **时间 + 环境固定在天气旁 `welcome-meta`**，与是否配置摄像头无关（2026-07-21：取消「无摄像头时塞进右侧栏」的分支，避免右侧能源/媒体/场景整体上移乱位）。
- **有摄像头时：** 仅在侧栏顶部多一张摄像头卡；无摄像头时侧栏从能源/媒体等开始，结构不变。
- **摄像头预览：** 不要写 `max-height:none` / `height:auto`，否则侧栏被撑爆。用主题 `.camera-preview`（建议 `max-height≈160px`，`object-fit:cover`）。
- **不要**把摄像头 + 时间 + 环境全堆在侧栏（会「更挤」）。
- **不要**把门锁芯片塞进 `.time-card`（会叠在时间上）。报警盾牌可留在 welcome-meta 时间行右侧。

### 2.2 门禁信息展示（`src/utils/index.ts` → `infoDisplayValue`）

- `info.entity` 可为 `lock.*` / `binary_sensor`（门磁）/ 普通文案实体。
- 锁类文案：**`门禁 · 已上锁` / `门禁 · 未上锁`**（不要显示 HA 友好名「门禁开门」）。
- `infoLockLabel()`：名称含「门禁」→ 显示「门禁」；去掉尾部「开门」等。
- **当前产品决定：** 门锁状态**不要**叠在时间上；曾试过放环境卡顶部，用户要求**回退**。欢迎区 `.quote` 仍可显示 `infoDisplayValue` 结果。
- 若再放门禁 UI：时间卡保持纯时间/日期；优先单独位置或用户指定位置，**禁止**放进 `.time-card` 的 flex 横向布局。

### 2.3 能源卡空配置不显示（`src/views/energy.ts` + `src/config/*` + `src/index.ts`）

- `DEFAULT_CONFIG.energy.entity` 必须为 `''`（不要默认 `sensor.energy_cost_today`）。
- `mergeConfig` / `buildAutoConfig`：无真实实体时不要回落占位实体。
- strategy `generate()`：若 strategy 里已有 `energy` 键（即使是 `{}`），`entity` 以用户配置为准（空则空）。
- `renderHomeEnergyCard`：无 `energy.entity`，或实体不存在且值为 `--` 时，返回 `nothing`。

### 2.4 环境信息编辑排序（编辑器）

首页「二层」下温湿度/CO2 等顺序来自：

```text
config.home_selection.environment  // string[]，顺序即显示顺序
```

已实现：

| 文件 | 作用 |
|---|---|
| `src/editor/pickers.ts` → `listPicker` | 每行增加 ↑↓（`data-move-path` / `data-move-index` / `data-move-delta`） |
| `src/editor/config.ts` → `moveListItem` | 交换数组项并 `config-changed` |
| `src/editor/events.ts` → `bindListButtons` | 绑定 ↑↓ 点击后 `reload` |
| `src/components/environment.ts` | 多房间：点击 chip 切换；chip 顺序 = 编辑器传感器首次出现顺序；房内行序同 ↑↓ |

用户操作路径：编辑仪表盘 → **环境信息** → 用 ↑↓ 调整 → 保存。

同逻辑也作用于首页设备/场景的 `listPicker`（设备、场景列表同样有 ↑↓）。

---

## 3. 当前 HA 快照（2026-07-19 前后，以设备为准）

`lovelace.dashboard_n_2` strategy 要点（可能已变，改前请再读一次 storage）：

```json
{
  "resource_pack": {
    "skin": "organic",
    "base_path": "/local/skins-pro/organic/",
    "assets": { "theme_css": "theme.css?v=..." }
  },
  "info": { "entity": "lock.r20k_2c74_relaya" },
  "camera": {},
  "energy": { "entity": "sensor.6tong_dao_dian_liang_ji_liang_mo_kuai_v3_1_6_chs_sum_energy" },
  "home_selection": {
    "environment": [
      "sensor.211106254151429_co2",
      "sensor.211106254151429_temperature",
      "sensor.211106254151429_humidity"
    ]
  }
}
```

说明：

- `lock.r20k_2c74_relaya`：状态里友好名常为「门禁开门」，实体注册名可能是「门禁」；**UI 文案必须以代码 `infoLockLabel` 为准**。
- `lock.akuvox_door_lock`（Lock A）在安防页 `security_page.hidden` 里，但仍可用于信息展示。
- 皮肤下拉里只有「已下载 / 内置」皮肤：`downloaded_skins` + 内置 `modern`。缺「动物森友会 / animal-crossing」时，检查是否从商店安装，或 `downloaded_skins` 是否含该 id；磁盘上 `/config/www/skins-pro/animal-crossing/` 存在不代表编辑器列表一定有。
- `base_path` 指向 `organic` 时，改 CSS 要改 **organic** 主题，不只改 animal-crossing。

最近一次部署资源示例：

```text
/local/community/skins-pro/skins-pro.js?v=20260718223345&build=20260718231608
```

---

## 4. 关键文件地图

| 需求 | 主要文件 |
|---|---|
| 首页结构（时间/环境/摄像头/侧栏） | `src/views/home.ts` |
| 环境行渲染 | `src/components/environment.ts` |
| 信息展示文案 | `src/utils/index.ts` → `infoDisplayValue` / `infoLockLabel` |
| 首页能源卡显隐 | `src/views/energy.ts` → `renderHomeEnergyCard` |
| 默认配置 / 自动配置 | `src/config/constants.ts`, `src/config/index.ts` |
| strategy 合并 | `src/index.ts` → `SkinsProStrategy.generate` |
| 编辑器列表 ↑↓ | `src/editor/pickers.ts`, `config.ts`, `events.ts` |
| 安防过滤 / 编辑隐藏 | `src/views/security.ts` |
| 主题 CSS（本机） | `skin-assets/animal-crossing/theme.css`；HA 上常为 `/config/www/skins-pro/organic/theme.css` |

---

## 5. 后续可做（用户可能继续提）

1. **门禁显示位置：** 用户不要叠时间、也不要环境卡顶部（已回退）。若再要显示，先问位置（欢迎区 quote / 独立芯片 / 安防入口旁等）。
2. **首页摄像头：** 配置 `camera.entity`（如 `camera.yw_mainstream`）后验证侧栏高度与 welcome-meta 不乱。
3. **主题丢失：** 编辑器皮肤列表 = 内置 `SKINS`（当前生成多为 `modern`）+ `downloaded_skins`。恢复某皮肤：皮肤商店安装，或把 id 写入 `downloaded_skins`，并确保 `/config/www/skins-pro/<id>/theme.css` 存在；`base_path` 与皮肤一致。
4. **环境排序：** 已在编辑器支持；若用户要「首页上拖拽排序」，需仿设备页 `devices_page.order` 做运行时排序 + 持久化（尚未做）。
5. **动物森友会 vs organic：** 历史配置曾用 `skin: animal-crossing` + `base_path: organic`。改样式前确认实际加载的 `theme.css` URL。

---

## 6. 明确不要做的事

- 不要把门锁状态放回 `.time-card` 内部（flex 会叠在时间上）。
- 不要给首页 `camera-preview` 设 `max-height:none`。
- 不要恢复 `DEFAULT_CONFIG.energy.entity = 'sensor.energy_cost_today'`。
- 不要用官方设备页自由画布替换 fork 的「编辑排序 / 编辑隐藏」。
- 不要只改 `dist/` 不改 `src/`（除非紧急热修且随后回写 src）。
- 不要部署后不 bump `lovelace_resources` 的 `build=`。

---

## 7. 构建与部署（照做）

本地 Rollup 有时在 “created dist” 后挂起，推荐：

```bash
cd "/Users/mac/Desktop/Skins Pro/znSkins-Pro"
pkill -f "rollup -c" 2>/dev/null
ROLLUP_WATCH=1 npx rollup -c > /tmp/rollup.log 2>&1 &
RPID=$!
# 等到 log 出现 created dist 后 kill
kill $RPID 2>/dev/null; pkill -f "rollup -c" 2>/dev/null
```

部署 JS + bump 缓存（stdin 管道，避免 scp 问题）：

```bash
BUILD=$(date +%Y%m%d%H%M%S)
cat dist/skins-pro.js | ssh root@192.168.1.17 "cat > /config/www/community/skins-pro/skins-pro.js && python3 - << PY
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs, urlencode
p = Path('/config/.storage/lovelace_resources')
data = json.loads(p.read_text())
build = '${BUILD}'
for item in data.get('data', {}).get('items', []):
    url = item.get('url', '')
    if 'skins-pro.js' not in url: continue
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    qs['build'] = [build]
    flat = [(k, v[-1]) for k, v in qs.items()]
    item['url'] = parsed._replace(query=urlencode(flat)).geturl()
    print(item['url'])
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
Path('/config/www/community/skins-pro/version.json').write_text(json.dumps({'version': build}) + '\n')
PY"
```

改主题 CSS 时：写入实际 `base_path` 对应目录，并 bump dashboard 里 `resource_pack.assets.theme_css` 的 `?v=`。

部署后让用户**强制刷新**平板/浏览器。

---

## 8. 验证清单

- [ ] 无摄像头：时间/环境仍在 welcome-meta（天气旁）；右侧从能源等开始，不把时间/环境塞进侧栏。
- [ ] 有摄像头：侧栏顶部仅多摄像头；时间/环境仍在 welcome-meta；不挤爆。
- [ ] `info.entity` 为 R20K 锁：文案为「门禁 · 已上锁/未上锁」，不出现「门禁开门」叠在时间上。
- [ ] 清空能源实体：首页无「今日用电」占位卡。
- [ ] 编辑器环境信息 ↑↓：保存后首页三行顺序变化。
- [ ] `lovelace_resources` 的 `build=` 已更新；客户端加载的是新 JS。

---

## 9. 用户偏好（沟通）

- 中文、简短回复。
- 证据优先：先读配置/运行时再改。
- 只有用户明确要求才 commit / push。
- 用户说「回退」= 只回退最近一次相关 UI 改动，不要整仓 reset。
