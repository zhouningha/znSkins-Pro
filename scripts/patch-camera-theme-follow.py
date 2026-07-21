#!/usr/bin/env python3
"""Patch skin theme.css so security camera cards contain go2rtc + overlay chrome."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

MARKER = "/* === skins-pro security camera theme-follow (fork) === */"

PATCH_ORGANIC = """
/* === skins-pro security camera theme-follow (fork) === */
.camera-card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #1a1a1a !important;
}
.camera-card .camera-preview {
  flex: 1 1 auto !important;
  margin: 0 !important;
  width: 100% !important;
  min-height: 160px !important;
  max-height: none !important;
  aspect-ratio: 16 / 10 !important;
  height: auto !important;
  background: #111 !important;
  overflow: hidden !important;
  position: relative !important;
}
.camera-card .camera-preview,
.camera-card .camera-preview .camera-stream,
.camera-card .camera-preview hui-image,
.camera-card .camera-preview sp-camera-preview,
.camera-card .camera-preview sp-go2rtc-live-preview,
.camera-card .camera-preview sp-go2rtc-video,
.camera-card .camera-preview .sp-go2rtc-slot {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}
.camera-card .camera-preview sp-go2rtc-live-preview,
.camera-card .camera-preview sp-go2rtc-video,
.camera-card .camera-preview .sp-go2rtc-slot,
.camera-card .camera-preview .sp-go2rtc-live,
.camera-card .camera-preview .sp-go2rtc-mjpeg {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border: 0 !important;
  object-fit: cover !important;
}
.camera-card .camera-preview sp-go2rtc-video video,
.camera-card .camera-preview video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  pointer-events: none !important;
}
.camera-card:not(.camera-card-edit) { cursor: default !important; }
.camera-meta-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  pointer-events: none !important;
  background: linear-gradient(180deg, rgba(45,55,52,.62) 0%, rgba(45,55,52,0) 100%) !important;
}
.camera-meta-overlay .device-name {
  margin: 0 !important;
  color: #F4F7F4 !important;
  text-shadow: 0 1px 4px rgba(0,0,0,.45) !important;
  font-size: var(--sp-font-sm) !important;
  font-weight: 700 !important;
}
.camera-meta-overlay .status {
  flex-shrink: 0 !important;
  background: rgba(255,255,255,.22) !important;
  color: #F4F7F4 !important;
}
.mc-app[data-view="security"] .camera-card {
  box-shadow: var(--sp-shadow-card, 2px 3px 8px rgba(45,55,52,.14)) !important;
  backdrop-filter: blur(14px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(120%) !important;
  background: linear-gradient(180deg, rgba(235,239,234,.92), rgba(226,230,224,.88)) !important;
  border: 1px solid rgba(45,55,52,.12) !important;
  border-radius: var(--sp-radius-lg) !important;
  color: var(--sp-text-dark, #2d3734) !important;
}
.mc-app[data-view="security"] .camera-card .camera-preview {
  border-radius: 0 !important;
}
.panel-camera.glass-card,
.panel-camera {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: var(--sp-radius-glass) !important;
  min-height: 0 !important;
  background: #1a1a1a !important;
}
.panel-camera .camera-preview {
  position: relative !important;
  flex: 1 1 auto !important;
  min-height: 120px !important;
  max-height: none !important;
  overflow: hidden !important;
}
"""

PATCH_GOW = PATCH_ORGANIC.replace(
    "background: linear-gradient(180deg, rgba(45,55,52,.62) 0%, rgba(45,55,52,0) 100%) !important;",
    "background: linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 100%) !important;",
).replace(
    "color: #F4F7F4 !important;",
    "color: #F5E6C8 !important;",
).replace(
    "background: linear-gradient(180deg, rgba(235,239,234,.92), rgba(226,230,224,.88)) !important;\n"
    "  border: 1px solid rgba(45,55,52,.12) !important;",
    "background: rgba(28, 12, 10, 0.78) !important;\n"
    "  border: 1px solid rgba(212, 175, 55, 0.35) !important;",
)

PATCH_AC = PATCH_ORGANIC.replace(
    "background: linear-gradient(180deg, rgba(45,55,52,.62) 0%, rgba(45,55,52,0) 100%) !important;",
    "background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%) !important;",
).replace(
    "color: #F4F7F4 !important;",
    "color: #fff8e6 !important;",
).replace(
    "background: linear-gradient(180deg, rgba(235,239,234,.92), rgba(226,230,224,.88)) !important;\n"
    "  border: 1px solid rgba(45,55,52,.12) !important;",
    "background: var(--sp-glass-bg, rgba(245, 240, 232, 0.62)) !important;\n"
    "  border: 1px solid var(--sp-border-glass, rgba(139, 115, 85, 0.28)) !important;",
)

PATCHES = {
    "organic": PATCH_ORGANIC,
    "god_of_war_3_wall": PATCH_GOW,
    "animal-crossing": PATCH_AC,
}


def patch_theme(skin: str, patch: str) -> None:
    path = Path(f"/config/www/skins-pro/{skin}/theme.css")
    if not path.exists():
        print("MISS", skin)
        return
    text = path.read_text()
    if MARKER in text:
        text = text[: text.index(MARKER)].rstrip() + "\n"
    path.write_text(text.rstrip() + "\n" + patch)
    print("PATCHED", skin, path.stat().st_size)


def bump_dashboard() -> None:
    p = Path("/config/.storage/lovelace.dashboard_n_2")
    d = json.loads(p.read_text())
    rp = d["data"]["config"]["strategy"]["config"]["resource_pack"]
    stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    rp.setdefault("assets", {})["theme_css"] = f"theme.css?v=camfollow-{stamp}"
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
    print("BUMP", rp["assets"]["theme_css"], "skin", rp.get("skin"))


def main() -> None:
    for skin, patch in PATCHES.items():
        patch_theme(skin, patch)
    bump_dashboard()


if __name__ == "__main__":
    main()
