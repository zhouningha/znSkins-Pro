# Skins Pro 定制功能保护清单

这个仓库以后以 `zhouningha/znSkins-Pro` 作为最终交付版本。官方 Skins Pro 只作为功能来源，不能直接覆盖本仓库定制体验。

## 核心规则

1. 官方新增功能可以合并。
2. 本文件登记的定制功能默认不能删除、覆盖、降级。
3. 官方逻辑和定制功能冲突时，先对比差异并提出方案，再决定怎么改。
4. 后续新增任何定制设置，都必须同步写入本文件和 `UPGRADE_CHECKLIST.md`。
5. HA 生产环境只安装 fork 版本，不直接安装官方版本。
6. 每次部署必须同步更新 Lovelace resources 里的 `skins-pro.js` URL query（`hacstag/build`），否则 HA/平板会继续加载旧 JS；`scripts/deploy-ha-god-war.sh` 必须保留 `lovelace_resources` cache bump 和 `znSkins-Pro` mirror sync。
7. 每次修复、构建、部署或同步官方完成后，必须把最新结果同步到 GitHub fork：检查 `git rev-list --left-right --count master...origin/master`，不是 `0 0` 就执行 `git push origin master`，不能只停在本地或 HA。

## 当前必须保留的定制功能

- 能源页读取 HA 原生能源配置的「个体设备」(`device_consumption`)：每个设备一张卡，显示今日用电+昨日对比+30天柱状图，图标按名称智能匹配；用户在 HA 能源设置里增删设备即自动生效，无需卡片编辑器 UI
- God of War 主题：`god_of_war_3_wall`
- God of War 官方素材裁切版：`source-kratos-wallpaper.jpg` 保留用户指定 1920x1080 原图（MD5 `204ca3b343688906f5ca57de48c827cd`），`avatar.png` 使用从该原图裁出的正方形官方头像源图（MD5 `98269216d3a9d5729f3572509d5b317e`），背景/房间/图标来自官方素材裁切，禁止回退到程序化模拟图
- God of War 主舞台背景 `background.jpg` 固定使用 `source-gow-4k-bg.png` 生成的战神熔岩神殿远景（MD5 `af45e72ec15a2a074121a731631dd405`），不要回退到山景奥林匹斯远景/巨人脸特写，横幅里会压住文字
- God of War 房间图池至少保留 10 张 `room-*.jpg` 作为素材池/备选；但 God of War 主题默认房间卡使用透明背景透出主题大图，不渲染独立房间 `<img>`；用户明确排除绿色大厅图 `source-room-gow3-daedalus-environment.jpg`
- 房间卡图片必须有破图兜底：保留 `hideBrokenImage` 和房间/头像 `<img @error=...>` 处理，任何资源路径短暂失效时不能显示浏览器蓝色问号，只能隐藏破图并使用卡片背景兜底
- God of War 视觉偏好：深色暗红玻璃侧边栏 + 更强背景压暗（见 `HA_RESTORE.md`）
- 圆角自绘开关：使用主题 `.switch` 样式，不直接依赖会破坏视觉的 `ha-control-switch`
- God of War 媒体播放器外层必须保持主题圆角，并裁切内部背景、封面和动态内容：`.glass-card,.time-card` 保留 `border-radius: var(--sp-radius-lg)` 与 `overflow: hidden`；不得因切换主题、构建或原生控件样式覆盖而变成直角面板
- God of War 媒体播放器的歌单下拉框与音量减/加按钮必须在 Android WebView 中保持深色圆角控件；`.media-playlist-select` 和 `.media-volume-step` 必须同时设置 `-webkit-appearance: none`、`appearance: none` 与明确的 `border-radius`，禁止退化为系统白色方框
- God of War 是唯一的本地定制皮肤包，资源路径固定为 `/local/skins-pro/god_of_war_3_wall/`，并由 `znSkins-Pro/skins-pro/god_of_war_3_wall/` 同步部署；不能指向不存在的 `/local/community/skins-pro/god_of_war_3_wall/`，否则整份主题 CSS 会 404 并退化为未样式化页面
- 点击切换房间
- 当前房间名显示
- 首页环境卡按“房间/区域”切换，不按官方默认楼层静态分组
- 环境实体归属规则：优先使用实体自身 `area_id`，没有则使用所属设备的 `area_id`，再通过 HA 区域注册表显示房间名；只有没有任何区域归属时才显示“其他”
- 官方楼层功能可以保留，但不能覆盖首页环境卡的房间切换逻辑
- 空调 `climate` 卡片不能退化为只有开关：卡片主体点击必须打开 God of War 风格调温弹层，右侧开关只负责开/关；弹层读取 HA climate 属性，支持目标温度加减、模式、风速
- 空调调温弹层在平板 `2018` kiosk/fullscreen 账户下必须限制在真实可视高度内；内容超出时弹层内部纵向滚动，不能被 fullscreen host 的 `overflow:hidden` 裁掉下半部分
- 设备页长按隐藏必须受“编辑隐藏/管理隐藏”状态保护：默认浏览设备时长按不隐藏；打开编辑隐藏后才显示提示并允许长按隐藏/恢复
- 设备页隐藏/恢复必须对所有实体类型统一持久化，`media_player.*` 不得在刷新初始化或版本迁移时被从隐藏名单剔除
- 首页场景配置同时支持 `scene.*` 和 `script.*`，按用户指定顺序显示并按实体域调用 `turn_on`；不能要求用户为已有观影/KTV/离场脚本重复创建 HA 场景
- 全屏 / kiosk 模式下设备页整个顶部控制栏都不渲染，包括房间/类型筛选、未分配筛选、隐藏管理和全部开启/关闭；退出全屏后恢复
- 平板浏览器全屏 / kiosk 模式必须铺满真实可视高度，不能露出底边；保护点为 `visualViewport.height`、`data-kiosk-fullscreen`、God of War 主题里的 `tablet browser fullscreen must fill the real viewport` 覆盖规则
- 平板 kiosk 适配
- 深色启动页和“正在启动中”显示
- 避免 Home Assistant 白屏闪烁的启动遮罩逻辑
- 屏保/黑屏相关逻辑
- 不自动刷新页面
- 场景框高度和媒体播放器高度适配
- 首页媒体播放器标题栏必须保留歌曲分区选择，读取 `input_select.living_room_music_source`，切换后调用 `music_assistant.play_media` 播放对应歌单；不能只剩播放按钮
- 首页媒体卡的歌曲信息、歌单、播放、暂停、继续、上一首和下一首全部控制 Music Assistant 实体；天龙实体只负责音量和静音。播放按钮必须分别调用 `media_pause` / `media_play`，禁止使用会重新播放的 `media_play_pause`，也禁止用会推进队列的 `media_stop` 冒充暂停。
- 客厅 Music Assistant 播放器的首选输出协议必须为 AirPlay。HEOS Native 在 Music Assistant 2.9.x 中强制 `requires_flow_mode = True`，暂停后日志会出现 `Resuming playback after flow stream completed` 并自动续播，不能作为本项目的首选输出协议。
- 音量控制使用静音、减 5%、当前百分比、加 5% 四个固定控件，不使用可拖动或点击任意位置跳变的音量进度条；所有音量和静音命令只发给天龙 `control_entity`。
- 编辑器媒体播放器必须分别配置“歌曲与队列”实体和“播放与音量控制”实体；`control_entity` 优先，实体名去尾号自动识别只作兜底
- 首页场景框高度必须跟随官方房间/产品卡渲染后的真实高度，不写死像素值；官方结构变更时先重新取官方卡片高度，再同步场景框
- God of War 1080p 墙控首页场景必须保持“一行两卡、超出向右分页”的横向滑动：使用 `data-wall-panel="1080p"` 限定作用域，场景容器采用横向 overflow 和 scroll snap；不能恢复成两行后被面板裁切，也不能用固定像素高度猜卡片尺寸
- 普通 Mac/桌面浏览器和其他官方皮肤不能继承 God of War 墙控专属横滑规则；墙控专属适配必须留在 `god_of_war_3_wall/theme.css` 的 `data-wall-panel="1080p"` 选择器内
- `skins-pro-card.ts` 必须通过当前皮肤名隔离 God of War 墙控状态。切换到其他官方皮肤时主动移除 `data-wall-panel`、`data-kiosk-fullscreen`、`--sp-home-room-card-height`、`--sp-runtime-height`、`--sp-runtime-min-height`、`--sp-app-padding`、`--sp-sidebar-width`、`--sp-stage-radius`；切回 `god_of_war_3_wall` 后再测量并恢复
- Kiosk APK 只负责 WebView、沉浸全屏、系统栏控制并暴露 `__skinsProKioskAndroid` 身份标记，禁止全局注入 `meta viewport width=1920,height=1080`。物理屏固定 1920×1080，但 Android density 可能让 WebView CSS 视口不同；仅在 `Android Kiosk + god_of_war_3_wall` 时由 Skins Pro 临时设置 1920×1080 viewport，切换官方皮肤时恢复原 viewport
- 切换官方皮肤后，共享卡片层只能清理 God of War 的 host 属性、变量和 viewport；不得向官方皮肤写入 `--sp-runtime-height`、`--sp-runtime-min-height` 或任何布局尺寸，必须完全使用该主题原有的 CSS 与 `@media` 规则
- `scripts/build-skins.cjs` 可能从发行包基线重新生成 `dist/god_of_war_3_wall/theme.css`；每次构建后必须确认横滑规则进入最终部署文件，不能只确认源码存在。保护标记：`grid-auto-flow: column`、`grid-template-rows: minmax(0, 1fr)`、`scroll-snap-type: x mandatory`
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
- 2026-07-08：God of War 主背景替换为战神熔岩神殿远景：`background.jpg` 从 `source-gow-4k-bg.png` 生成，保留右侧战神雕像和神殿/熔岩主体；禁止回退到山景奥林匹斯远景或巨人脸特写。
- 2026-07-11：设备隐藏名单对所有实体类型统一生效，隐藏与恢复刷新后都必须保持，禁止恢复任何 `media_player.*` 特殊排除逻辑。
- 2026-07-11：设备页全屏 / kiosk 时不生成整个顶部控制栏；保护点为 `renderDevicesPage` 对 `filter-bar` 的 `isKioskFullscreenActive` 条件渲染。
- 2026-07-11：首页场景选择器扩展为场景/脚本快捷模式，支持 `scene.*` 与 `script.*`，首页保持配置顺序并调用对应域的 `turn_on`。
- 2026-07-11：首页脚本的最近执行时间必须读取 `last_changed`，不能把脚本的 `on/off` 状态当日期传给 `Intl.RelativeTimeFormat`；无效日期必须跳过时间文案，禁止导致首页白屏。
- 2026-07-11：空调弹层增加 `100dvh` 最大高度和内部触控滚动，短高度视口改为顶部对齐及紧凑间距，避免 `2018` kiosk 账户只显示半个弹层。
- 2026-07-11：歌曲分区正式并入 fork 主源码，读取 `input_select.living_room_music_source` 的歌单选项名称并直接传给 Music Assistant 播放；新建歌单只要加入该 input_select 选项就会自动出现在卡片中，不再依赖固定歌单 ID 或外层补丁。
- 2026-07-11：修复 Music Assistant 队列实体长期显示 `idle` 导致暂停按钮重新播放；使用基础功放实体判断真实状态，显示状态点，并将暂停/继续拆成独立服务调用。
- 2026-07-12：Music Assistant 客厅播放器最终验证使用 AirPlay 首选输出协议后，播放、暂停、恢复和上下曲正常。HEOS Native 强制队列 Flow 模式，暂停会在约 2 秒后被 Music Assistant 自动续播；`stop` 会推进下一首，均不得作为暂停替代。最终分工：Music Assistant 负责全部歌曲与队列控制，天龙只负责音量和静音。
- 2026-07-12：God of War 1080p 墙控首页场景改为一行两卡横向分页。My-Home 当前顺序为离场、KTV、芝度观影、Apple TV；首屏显示前两项，向左滑动查看后两项。高度继续读取 `--sp-home-room-card-height`，禁止写死行高；规则仅限 `data-wall-panel="1080p"`。
- 2026-07-12：墙控布局按皮肤隔离。只有 `god_of_war_3_wall` 可设置专属 host 属性和尺寸变量；其他官方皮肤切入时必须清理残留状态并走自身响应式布局。Kiosk 0.2.36 使用 Android 身份标记：God of War 条件化使用 1920×1080 viewport，官方皮肤恢复原 viewport。
- 2026-07-13：安卓 Kiosk 设备页兼容旧 WebView 的瓦片内存上限：同时支持 `data-android-kiosk` 与旧版 `data-kiosk-fullscreen` 宿主标记，仅在设备页降低 `.device` 合成成本并延迟离屏 `.device-group` 绘制；新版可再按 16 张分页，避免 Chromium 报 `tile memory limits exceeded` 并把设备卡闪成空白背景块。Mac 普通页面和其他页面不受影响。
