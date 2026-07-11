# Skins Pro 官方升级检查清单

每次合并官方 Skins Pro 前后，都按这个清单检查。没有检查完，不发布到 HA。

## 升级前

- 备份当前 fork 的 `dist/skins-pro.js`
- 备份当前主题包，特别是 `dist/god_of_war_3_wall`
- 备份 HA 当前 Lovelace resources
- 备份 HA 当前 `lovelace.my_home`
- 拉取官方新版并对比差异
- 标记官方改动是否影响 `CUSTOM_FEATURES.md`

## 必测功能

- God of War 主题正常加载
- 能源页显示 HA 能源配置里的电网 + 个体设备（`device_consumption`），每设备一张今日+30天柱状图卡
- God of War 主题素材按官方主题标准：确认 `source-kratos-wallpaper.jpg` MD5 为 `204ca3b343688906f5ca57de48c827cd`，确认 `avatar.png` MD5 为 `98269216d3a9d5729f3572509d5b317e`
- God of War 主舞台背景保持战神熔岩神殿远景：确认 `skins-pro/god_of_war_3_wall/source-gow-4k-bg.png` 存在，且 `skins-pro/god_of_war_3_wall/background.jpg` MD5 为 `af45e72ec15a2a074121a731631dd405`，不能回退为山景奥林匹斯远景或巨人脸/手臂特写图
- God of War 房间图池至少 10 张作为素材池/备选；默认房间卡必须是透明卡片透出主题大图，不渲染独立房间 `<img>`；不得恢复用户排除的绿色大厅图 `source-room-gow3-daedalus-environment.jpg`
- 房间卡图片加载失败时不能出现浏览器蓝色问号；确认 `hideBrokenImage` 和房间/头像图片的 `@error` 兜底仍在
- 首页背景、头像、设备图标不丢失
- 圆角自绘开关正常显示，不变方块
- 点击开关仍能控制设备
- 点击切换房间可用
- 当前房间名正常显示
- 首页不会退化成“二层 / 其他”静态分组
- 环境传感器按 HA 区域归属显示：实体区域优先，设备区域兜底，无区域才进“其他”
- 新增环境传感器不需要写死设备名，只要 HA 区域设置正确，就应自动显示到对应房间
- 空调 `climate` 设备卡主体点击打开调温弹层，右侧开关只负责开/关；弹层可调目标温度、模式、风速，不能退回官方单纯开关
- 设备页默认不能误触长按隐藏；必须打开“编辑隐藏/管理隐藏”后，提示出现且长按隐藏/恢复才生效
- 灯光、开关、空调、锁、摄像头和 `media_player.*` 等所有设备隐藏后刷新仍保持隐藏；从已隐藏列表恢复后刷新仍保持显示
- 全屏 / kiosk 模式下设备页整个顶部控制栏都不可见，包括房间/类型/未分配筛选、隐藏管理和全部开启/关闭；退出全屏后必须恢复
- 首页场景选择器能同时选择 `scene.*` 和 `script.*`；脚本按配置顺序显示，点击后调用 `script.turn_on`
- 平板 kiosk 进入流程正常
- 平板浏览器全屏 / kiosk 后底部不能露边；确认 `data-kiosk-fullscreen` 生效，God of War 主题覆盖规则没有被官方平板断点覆盖
- 深色启动页正常
- “正在启动中”显示完整
- 不出现白屏闪烁
- 不自动刷新页面
- 屏保/黑屏逻辑正常
- 场景框高度正常
- 场景框高度跟随官方房间/产品卡真实高度，不使用固定像素猜测
- 媒体播放器高度正常
- 管理菜单按钮保留
- 物理按键相关逻辑不受影响
- 安全性补充不影响现有使用

## 冲突判断

发现官方改动影响定制功能时，不直接覆盖。先写清楚：

- 官方改了什么
- 影响了哪个定制功能
- 是否必须跟随官方
- 可选方案
- 推荐方案
- 回滚方式

## 发布到 HA 前

- Lovelace resources 只保留 fork 版本 Skins Pro
- 不混用官方版和旧本地版
- `my-home` 仪表盘保留
- `resource_pack.skin` 指向 `god_of_war_3_wall`
- `downloaded_skins` 必须包含 `god_of_war_3_wall`（否则编辑器下拉只有 modern）
- `base_path` 与当前安装方式一致（`__AUTO__`）
- Lovelace resources 里的 `skins-pro.js` URL 必须更新到当前 `dist/version.json` 的 `build`，不能停留旧 `hacstag/build`
- `znSkins-Pro` 镜像目录必须同步到与 `skins-pro` 同版本
- 优先使用 `scripts/deploy-ha-god-war.sh` 一键部署；恢复步骤见 `HA_RESTORE.md`
- HA `core check` 通过
- 页面强制刷新后显示正常

## 发布后

- 截图确认首页
- 截图确认设备卡片开关
- 截图确认房间切换
- 截图确认 God of War 所有房间卡统一为透明背景效果，不再混用独立房间图
- 截图确认房间卡没有蓝色问号/破图图标；若某张资源路径异常，应隐藏破图并显示卡片背景兜底
- 检查浏览器控制台无关键错误
- 保留本次发布备份路径
- 同步到 GitHub fork `zhouningha/znSkins-Pro`：执行 `git push origin master`，并确认 `git rev-list --left-right --count master...origin/master` 输出 `0 0`
