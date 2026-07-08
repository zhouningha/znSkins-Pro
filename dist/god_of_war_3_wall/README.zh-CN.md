# god_of_war_3_wall — Skins Pro 皮肤

**风格：** 暗红、熔岩金、黑铁、希腊神殿废墟、奥林匹斯云层、混沌双刃链条  
（原创美术灵感，非官方 God of War 资产）

严格遵循 [Skins Pro 官方皮肤规范](https://github.com/ha-china/Skins-Pro/blob/master/README.zh-CN.md)。

> 素材来源：从 `source-kratos-wallpaper.jpg`（GOW III 官方宣传图）裁切生成，非 AI 模拟绘制。重新生成见 `scripts/generate_official_god_war_assets.py`。

## 文件清单

| 文件 | 场景对应 |
|------|----------|
| `background.jpg` | 奥林匹斯战场 / 神殿废墟 / 火焰天空 |
| `decoration.jpg` | 混沌双刃 + 锁链 + 断柱 |
| `avatar.jpg` | 斯巴达剪影头像 |
| `room-living.jpg` | 奥林匹斯大厅 |
| `room-bedroom.jpg` | 冥界寝殿 |
| `room-kitchen.jpg` | 火炉厨房 |
| `room-dining.jpg` | 神殿宴会厅 |
| `room-garden.jpg` | 神殿庭院 |
| `room-office.jpg` | 泰坦武库 |
| `room-garage.jpg` | 链狱武库 |
| `icon-*.jpg` | 火焰/锁链/柱/盾徽/眼睛/雷电等主题图标 |
| `theme.css` | 暗红熔岩金 CSS 变量 |
| `strings.json` | 中英文 + 官方 `icon_map` |

总览预览：`../screenshots/god_of_war_3_wall.png`

## 安装

### 直接部署 HA

```bash
scp -r ~/Desktop/主题/god_of_war_3_wall ha:/config/www/community/skins-pro/
```

卡片编辑器 → **皮肤 / Skin** → `god_of_war_3_wall` → 硬刷新。

### 官方仓库构建

```bash
git clone https://github.com/ha-china/Skins-Pro.git
cp -R ~/Desktop/主题/god_of_war_3_wall Skins-Pro/skins-pro/
cp ~/Desktop/主题/screenshots/god_of_war_3_wall.png Skins-Pro/screenshots/
cd Skins-Pro && npm install && npm run build
```

## icon_map 说明

与官方 `visionOS` 一致，例如：

- `"climate": "ac"` → `icon-ac.jpg`
- `"media_player": "media_player"` → `icon-media_player.jpg`（混沌双刃）
