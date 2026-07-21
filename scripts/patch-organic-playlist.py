#!/usr/bin/env python3
"""Append organic claymorphism media-playlist styles (AC structure, organic tokens)."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

MARKER = "/* === skins-pro media-playlist theme-follow (fork) === */"

PATCH = """
/* === skins-pro media-playlist theme-follow (fork) === */
/* Same DOM as animal-crossing; organic papercut visuals */
.media-playlist {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  flex: 0 0 var(--media-controls-width, 136px);
  width: var(--media-controls-width, 136px);
  min-width: var(--media-controls-width, 136px);
  max-width: var(--media-controls-width, 136px);
  height: 28px;
  min-height: 28px;
  max-height: 28px;
  margin: 0 0 0 auto;
  padding: 0 2px;
  border: 0;
  border-radius: var(--sp-radius-pill, 999px);
  background: linear-gradient(180deg, #F4F7F4 0%, #E2E8E2 100%);
  box-shadow:
    inset -2px -2px 5px rgba(45,55,52,.08),
    inset 2px 2px 5px rgba(255,255,255,.75),
    0 2px 6px rgba(45,55,52,.12);
  box-sizing: border-box;
  overflow: hidden;
}
.glass-card .media-playlist-nav,
.sp-card .media-playlist-nav,
.media-playlist-nav {
  flex: 0 0 28px !important;
  width: 28px !important;
  height: 24px !important;
  min-width: 28px !important;
  min-height: 0 !important;
  max-height: 24px !important;
  border: 0 !important;
  border-radius: 999px !important;
  margin: 0 !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  color: var(--sp-text-dark, #2D3734) !important;
  box-shadow: none !important;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.media-playlist-nav:hover {
  background: rgba(217, 155, 104, 0.16) !important;
  color: var(--sp-accent, #D99B68) !important;
}
.media-playlist-nav:active {
  background: rgba(217, 155, 104, 0.28) !important;
}
.media-playlist-nav ha-icon {
  --mdc-icon-size: 20px;
  width: 20px;
  height: 20px;
  color: inherit;
  pointer-events: none;
}
.media-playlist-label {
  flex: 1 1 auto;
  min-width: 0;
  height: 24px;
  line-height: 24px;
  text-align: center;
  padding: 0 4px;
  color: var(--sp-text-dark, #2D3734);
  font-size: var(--sp-font-3xs);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.media-playlist-menu,
.media-playlist-option { display: none; }
"""


def main() -> None:
    path = Path("/config/www/skins-pro/organic/theme.css")
    text = path.read_text()
    if MARKER in text:
        text = text[: text.index(MARKER)].rstrip() + "\n"
    path.write_text(text.rstrip() + "\n" + PATCH)
    print("PATCHED organic", path.stat().st_size)

    p = Path("/config/.storage/lovelace.dashboard_n_2")
    d = json.loads(p.read_text())
    rp = d["data"]["config"]["strategy"]["resource_pack"]
    stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    rp.setdefault("assets", {})["theme_css"] = f"theme.css?v=playlist-{stamp}"
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
    print("BUMP", rp["assets"]["theme_css"], "skin", rp.get("skin"))


if __name__ == "__main__":
    main()
