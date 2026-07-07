请为 Home Assistant Skins-Pro 皮肤生成 strings.json。

皮肤名：deltaforce
风格：Delta Force 战术军事风，硬朗科技 HUD，适合 Home Assistant 作战指挥式仪表盘
色彩：军绿、沙色、黑灰、荧光绿、金属棕
氛围：战术、冷静、专业、暗色玻璃、强对比

要求：
1. 只输出合法 JSON，不要 Markdown。
2. 生成 title_zh/title_en/subtitle_zh/subtitle_en/profile_name_zh/profile_name_en/profile_subtitle_zh/profile_subtitle_en。
3. 保留完整 icon_map，技术键名必须完全正确。

icon_map 模板：
{
  "light": "light",
  "input_boolean": "switch",
  "button": "button",
  "scene": "light",
  "climate": "climate",
  "water_heater": "water_heater",
  "humidifier": "humidifier",
  "media_player": "speaker",
  "remote": "remote",
  "lock": "lock",
  "binary_sensor": "lock",
  "alarm_control_panel": "lock",
  "switch": "switch",
  "fan": "fan",
  "cover": "switch",
  "camera": "camera",
  "automation": "switch",
  "sensor": "button",
  "person": "button",
  "vacuum": "fan",
  "device_tracker": "button",
  "update": "button"
}
