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
- God of War 主题素材按官方主题标准：确认 `source-kratos-wallpaper.jpg` MD5 为 `204ca3b343688906f5ca57de48c827cd`，确认 `avatar.png` MD5 为 `98269216d3a9d5729f3572509d5b317e`
- 首页背景、头像、设备图标不丢失
- 圆角自绘开关正常显示，不变方块
- 点击开关仍能控制设备
- 点击切换房间可用
- 当前房间名正常显示
- 首页不会退化成“二层 / 其他”静态分组
- 环境传感器按 HA 区域归属显示：实体区域优先，设备区域兜底，无区域才进“其他”
- 新增环境传感器不需要写死设备名，只要 HA 区域设置正确，就应自动显示到对应房间
- 设备页默认不能误触长按隐藏；必须打开“编辑隐藏/管理隐藏”后，提示出现且长按隐藏/恢复才生效
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
- 优先使用 `scripts/deploy-ha-god-war.sh` 一键部署；恢复步骤见 `HA_RESTORE.md`
- HA `core check` 通过
- 页面强制刷新后显示正常

## 发布后

- 截图确认首页
- 截图确认设备卡片开关
- 截图确认房间切换
- 检查浏览器控制台无关键错误
- 保留本次发布备份路径
