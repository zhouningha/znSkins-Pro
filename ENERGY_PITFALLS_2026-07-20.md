# 能源页踩坑记录（2026-07-20）

给后续 AI / 自己用。先读本文件 + `CUSTOM_FEATURES.md`，再改能源相关代码或 HA 配置。不要猜，不要只改服务端文件就当客户端已生效。

---

## 1. 今日改了什么（结论）

| 项 | 结果 |
|---|---|
| 能源页读 `device_consumption`（个体设备） | 已恢复；上游合并曾只读电网，卡退化成多张「今日用电」 |
| 按名称选图标（空调/插座/机柜/照明…） | 对齐旧提交 `56a13a3` 的 `energyDeviceIcon` + `cleanEnergyLabel` |
| 楼层 · 房间分组 | 实体/设备 → area → floor；标题如「二层 · 多媒体机柜」 |
| 卡上指标 | **今日 / 本周 / 本月**（设备卡不再用「较昨日」当主对比） |
| 炬为电表 | 设备 `total_energy` 一直为 0 → 改用功率 **Riemann 积分** + 三个 `utility_meter` |
| 柱状图（新表） | 日统计不足时：小时 → 5 分钟；条数固定 **30 槽右对齐**，避免粗柱 |
| AC 主题布局 | `shared-chrome` **LAYOUT LOCK**：能源页强制 `display: grid !important`，楼层标题横排占满行 |

生产 JS 示例（以 Lovelace 实际 URL 为准）：

`/local/community/znSkins-Pro/skins-pro-fork-energy-ui-<STAMP>.js?v=<STAMP>`

---

## 2. 硬坑（按踩过的顺序）

### 2.1 加了电表 ≠ 能源页有卡

- Skins Pro **只读** HA「设置 → 能源」：`energy_sources` + `device_consumption`。
- 实体进了 HA，但没进 `/config/.storage/energy` 的 `device_consumption` → **不会出卡**。
- 个体设备要用 `total_increasing` / kWh 类统计实体（或 Riemann 产出的积分传感器），不是功率 W。

### 2.2 炬为 `total_energy` = 0 不能当真

- 实况：功率约 800–900 W，但 `…_total_energy` 长期 **0.0**（设备/固件不报累计）。
- **错误做法：** 把该实体挂进能源个体设备 → 卡永远 0。
- **正确做法：**
  1. Helper：`integration`（Riemann）吃 `…_power` → `…_ju_wei_dian_biao_yong_dian_liang`（left / kWh）
  2. 能源 `device_consumption` 换成该 Riemann 实体
  3. 再建三个 `utility_meter`：`…_jin_ri` / `…_ben_zhou` / `…_ben_yue`（日/周/月重置）
- 代码约定：源实体 id 以 `_yong_dian_liang` 结尾时，自动拼上述三个 meter id（`relatedUtilityMeterIds`）。

### 2.3 「今日」和「本周」一样，不一定是 bug

- **已核实（2026-07-20）：当天是周一**，周起点 = 今日 0 点 → 「本周累计」==「今日用电」是正常的。
- 炬为三个 meter 刚建、且从周一开始计，今日/本周/本月数值接近也正常。
- 从周二起本周会大于今日；不要为「数值相同」去改求和逻辑，先看日历和 meter 创建时间。

### 2.4 有 `device_consumption` 时不要再叠电网总表

- `grid`（如 ch_4「2楼总」）≈ 各通道之和 → 和个体设备一起展示会 **重复计**。
- 有个体设备时：页面卡与汇总只聚合 `isDevice`；跳过注入首页 `energy.entity`（如 `6_chs_sum`）。

### 2.5 楼层标题竖着挤扁（动物森友会）

- **现象：** 「二层·多媒体机柜」竖排、左右被裁。
- **根因：** AC 主题 `.page-body.single-column { display: flex }`，子项 `grid-column: 1 / -1` **无效**，标题被挤进一列 flex 槽。
- **修法：** 在 `src/styles/shared-chrome.ts` 对 `.page-body.single-column.energy-detail-page` 强制：

  ```css
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  ```

  楼层/汇总标题 `grid-column: 1 / -1`，`h2` `writing-mode: horizontal-tb` + `white-space: nowrap`。
- 竖屏/窄屏再压成 1 列。只改 `theme.css` 不够时，以 shared-chrome **LAYOUT LOCK** 为准。

### 2.6 「本月累计」换行

- 四列网格下卡片很窄，`.env-row` 若用 `1fr` 挤标签会折行。
- 能源页：`grid-template-columns: 24px max-content minmax(0, 1fr)`，标签 `white-space: nowrap`。

### 2.7 新表柱状图又粗又少

- 新 Riemann / meter 只有 0–1 个日桶 → 按「每天一根」画会粗得离谱。
- 回退：日 ≥3 点用日；否则小时（末 24）；再否则 5 分钟（末 30）；UI **固定 30 槽右对齐**（`energy-bars.ts`）。

### 2.8 周期重置 ≠ 历史被删

- `utility_meter` 日/周/月清零只清 **当前周期 state**。
- Recorder `purge_keep_days`（如 14）清的是短状态历史；**长期 statistics 仍保留**（旧通道可查约 120 天量级）。
- 结算/对账应依赖 long-term statistics，不要只盯 meter 当前值。

### 2.9 部署假成功

- 改 `/config/www/.../skins-pro.js` 不够；必须 bump `lovelace_resources` 的 `?v=` / 换文件名，平板 **强刷**。
- Fork 路径优先：`/local/community/znSkins-Pro/skins-pro-fork-*.js`，避免 HACS 官方包覆盖。
- 部署后应用字符串自检，例如：`energy-detail-page` + `display: grid !important` 是否在已部署 JS 里。

### 2.10 Registry 未就绪 → 没楼层名

- 楼层·房间依赖 area / floor / entity / device registry。
- 拉能源前要等 registry（promise 缓存加载）；否则 location 空、分组标题缺失。

---

## 3. 关键代码位置

| 文件 | 作用 |
|---|---|
| `src/ha/energy.ts` | prefs、个体设备、图标、位置、今日/周/月、meter 叠加、统计回退 |
| `src/views/energy.ts` | 分组渲染、汇总卡、设备卡三行指标 |
| `src/components/energy-bars.ts` | 30 槽右对齐柱图 |
| `src/styles/shared-chrome.ts` | 能源页 grid LAYOUT LOCK、「本月累计」nowrap |
| `src/skins/modern/theme.css` | 与能源布局相关的镜像规则（AC 仍以 shared-chrome 为准） |
| `src/i18n/zh-CN.ts` | `todayEnergy` / `weekToDate` / `monthToDate` |

HA 侧（生产，勿随意改坏）：

| 配置 | 要点 |
|---|---|
| `/config/.storage/energy` | `device_consumption` 含六通道个体 + 炬为 Riemann；grid 可保留但 UI 侧不重复展示 |
| Riemann | `…_ju_wei_dian_biao_yong_dian_liang` ← power |
| utility_meter | `…_jin_ri` / `…_ben_zhou` / `…_ben_yue` |

---

## 4. 部署检查清单（能源改动后）

1. `npm run build`
2. 上传 `dist/skins-pro.js` → `/config/www/community/znSkins-Pro/skins-pro-fork-energy-ui-<STAMP>.js`
3. 改 `lovelace_resources` URL + `?v=<STAMP>`；可选 mirror 到同目录 `skins-pro.js`
4. `ha core restart`（改 storage / 需清前端缓存时）
5. 平板强制刷新
6. 目视：楼层标题横排；设备卡图标区分；炬为非 0；周一当天「今日≈本周」可接受
7. 字符串抽查：`force_grid` / `device_consumption` / `_jin_ri` 是否在部署文件中

---

## 5. 不要再做的事

- 不要把炬为原始 `…_total_energy` 重新加回个体设备（仍为 0）。
- 不要为 AC「挤标题」只改 `grid-column` 而不强制 `display: grid`。
- 不要在周一把「今日=本周」当成求和 bug 去「修」。
- 不要同时展示电网总表 + 全部个体设备并加总（双计）。
- 不要合并官方时丢掉 `device_consumption` / `energyDeviceIcon` / shared-chrome 能源 LAYOUT LOCK。

---

## 6. 与定制清单的关系

本轮结果已写入 / 应对齐：

- `CUSTOM_FEATURES.md`：个体设备、楼层分组、今日/本周/本月、炬为 Riemann + utility_meter、LAYOUT LOCK
- `UPGRADE_CHECKLIST.md`：升级后能源页验收项需覆盖楼层标题横排与三周期指标

合并官方 Skins Pro 前，按该两份清单逐项核对，禁止用官方「仅电网」能源页覆盖本 fork。
