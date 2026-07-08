# Skins Pro 定制功能保护清单

这个仓库以后以 `zhouningha/znSkins-Pro` 作为最终交付版本。官方 Skins Pro 只作为功能来源，不能直接覆盖本仓库定制体验。

## 核心规则

1. 官方新增功能可以合并。
2. 本文件登记的定制功能默认不能删除、覆盖、降级。
3. 官方逻辑和定制功能冲突时，先对比差异并提出方案，再决定怎么改。
4. 后续新增任何定制设置，都必须同步写入本文件和 `UPGRADE_CHECKLIST.md`。
5. HA 生产环境只安装 fork 版本，不直接安装官方版本。
6. 每次部署必须同步更新 Lovelace resources 里的 `skins-pro.js` URL query（`hacstag/build`），否则 HA/平板会继续加载旧 JS；`scripts/deploy-ha-god-war.sh` 必须保留 `lovelace_resources` cache bump 和 `znSkins-Pro` mirror sync。

## 当前必须保留的定制功能

- God of War 主题：`god_of_war_3_wall`
- God of War 官方素材裁切版：`source-kratos-wallpaper.jpg` 保留用户指定 1920x1080 原图（MD5 `204ca3b343688906f5ca57de48c827cd`），`avatar.png` 使用从该原图裁出的正方形官方头像源图（MD5 `98269216d3a9d5729f3572509d5b317e`），背景/房间/图标来自官方素材裁切，禁止回退到程序化模拟图
- God of War 房间图池至少保留 10 张 `room-*.jpg` 作为素材池/备选；但 God of War 主题默认房间卡使用透明背景透出主题大图，不渲染独立房间 `<img>`；用户明确排除绿色大厅图 `source-room-gow3-daedalus-environment.jpg`
- 房间卡图片必须有破图兜底：保留 `hideBrokenImage` 和房间/头像 `<img @error=...>` 处理，任何资源路径短暂失效时不能显示浏览器蓝色问号，只能隐藏破图并使用卡片背景兜底
- God of War 视觉偏好：深色暗红玻璃侧边栏 + 更强背景压暗（见 `HA_RESTORE.md`）
- 圆角自绘开关：使用主题 `.switch` 样式，不直接依赖会破坏视觉的 `ha-control-switch`
- 点击切换房间
- 当前房间名显示
- 首页环境卡按“房间/区域”切换，不按官方默认楼层静态分组
- 环境实体归属规则：优先使用实体自身 `area_id`，没有则使用所属设备的 `area_id`，再通过 HA 区域注册表显示房间名；只有没有任何区域归属时才显示“其他”
- 官方楼层功能可以保留，但不能覆盖首页环境卡的房间切换逻辑
- 空调 `climate` 卡片不能退化为只有开关：卡片主体点击必须打开 God of War 风格调温弹层，右侧开关只负责开/关；弹层读取 HA climate 属性，支持目标温度加减、模式、风速
- 设备页长按隐藏必须受“编辑隐藏/管理隐藏”状态保护：默认浏览设备时长按不隐藏；打开编辑隐藏后才显示提示并允许长按隐藏/恢复
- 平板浏览器全屏 / kiosk 模式必须铺满真实可视高度，不能露出底边；保护点为 `visualViewport.height`、`data-kiosk-fullscreen`、God of War 主题里的 `tablet browser fullscreen must fill the real viewport` 覆盖规则
- 平板 kiosk 适配
- 深色启动页和“正在启动中”显示
- 避免 Home Assistant 白屏闪烁的启动遮罩逻辑
- 屏保/黑屏相关逻辑
- 不自动刷新页面
- 场景框高度和媒体播放器高度适配
- 首页场景框高度必须跟随官方房间/产品卡渲染后的真实高度，不写死像素值；官方结构变更时先重新取官方卡片高度，再同步场景框
- 保留物理按键相关逻辑
- 保留安全性补充，但不影响现有平板使用

## 官方升级冲突处理原则

- 官方换控件：优先保留当前视觉和交互，只适配数据层。
- 官方换数据结构：优先保留定制功能，新增兼容层。
- 官方新增功能不影响首页体验：可以合并。
- 官方新增功能影响平板显示：先隐藏或放二级页，不直接进首页。
- 官方删除旧接口：先评估影响，再制定迁移方案。
- 任何会影响本文件功能的修改，都需要先说明风险和回滚方案。

## 新增定制登记区

后续新增功能写在这里：

- 2026-07-08：平板浏览器全屏 / kiosk 底边修复：全屏高度使用 `visualViewport.height` 兜底真实可视高度，host 写入 `data-kiosk-fullscreen`，主题在该状态下覆盖平板断点的 `height:auto` / `overflow:visible`，避免底部露边。
- 2026-07-08：God of War 房间图池扩展到 10 张，`areaRoomImageKey` 按房间名优先映射并按顺序兜底，避免前 10 个 HA 房间重复；绿色大厅图已按用户要求排除，禁止恢复。
- 2026-07-08：房间卡破图问号修复：图片 `<img>` 必须绑定 `hideBrokenImage`，加载失败时隐藏并移除 `src`，防止 HA 平板/浏览器显示蓝色问号；升级官方或重构渲染路径时，首页房间卡、房间页、头像/通用图片渲染都要保留这个兜底。
- 2026-07-08：God of War 房间卡默认改为透明卡片效果：所有房间统一不渲染独立房间图，直接透出主题大背景并保留压暗层；这比多张房间图更符合当前视觉。10 张 `room-*.jpg` 只作为素材池/备选保留。
- 2026-07-08：空调调温弹层：`climate` 设备卡主体点击使用 `climate-control` 动作打开弹层，保留开关独立开/关；弹层用 `climate.set_temperature`、`set_hvac_mode`、`set_fan_mode`，样式类为 `climate-control-*`。
- 2026-07-08：部署缓存保护：部署脚本必须同步 `skins-pro` 与 `znSkins-Pro`，并更新 `/config/.storage/lovelace_resources` 中 `skins-pro.js?hacstag=...&build=...`；只上传文件但不更新 resource URL 会导致清浏览器历史也继续无效。
