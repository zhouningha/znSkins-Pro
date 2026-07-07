请为 Home Assistant Skins-Pro 皮肤生成 theme-vars.json。

风格：Delta Force 战术军事风，硬朗科技 HUD，适合 Home Assistant 作战指挥式仪表盘
色彩：军绿、沙色、黑灰、荧光绿、金属棕
氛围：战术、冷静、专业、暗色玻璃、强对比
额外要求：保留干净区域用于叠加设备卡片，不出现真实品牌 logo

要求：
1. 只输出合法 JSON，不要 Markdown。
2. 只输出 CSS 变量键值，不要输出完整 CSS，不要输出选择器。
3. 不要输出 --sp-runtime-height、--sp-sidebar-width、--sp-app-padding、--sp-space-*、--sp-font-*、--sp-base-texture、--sp-stage-texture。
4. 重点生成背景、玻璃卡片、文字、强调色、设备状态色、场景色、环境色、阴影和圆角变量。
5. 所有值不能包含分号。

示例格式：
{
  "--sp-glass-bg": "rgba(10, 18, 32, .78)",
  "--sp-panel-bg": "rgba(245, 248, 255, .92)",
  "--sp-app-overlay": "linear-gradient(135deg, rgba(7,12,24,.86), rgba(28,48,88,.74))",
  "--sp-stage-overlay": "linear-gradient(90deg, rgba(5,10,20,.34), rgba(5,10,20,.06) 46%, rgba(5,10,20,.40))",
  "--sp-text-main": "#f7fbff",
  "--sp-text-muted": "rgba(247,251,255,.72)",
  "--sp-text-alt": "#6bd7ff",
  "--sp-accent-green": "#50d6a9",
  "--sp-accent-blue": "#3aa7ff",
  "--sp-accent-purple": "#8e7cff",
  "--sp-device-blue": "rgb(118, 186, 245)",
  "--sp-bar-gradient": "linear-gradient(180deg,#72e8ff,#2677ff)"
}
