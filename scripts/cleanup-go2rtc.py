#!/usr/bin/env python3
"""Clean /config/go2rtc.yaml to only monitoring + security streams."""
from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

SRC = Path("/config/go2rtc.yaml")

# monitoring door + the three security names (+ door main used by monitoring)
KEEP_ORDER = [
    "akuvox_sub",
    "akuvox_akuvox_door",
    "tp_ipc_main",
    "yw_main",
]


def redact(url: str) -> str:
    return re.sub(r"://([^:/@]+):([^@]+)@", "://***:***@", url)


def parse_stream_sources(text: str) -> dict[str, list[str]]:
    streams: dict[str, list[str]] = {}
    cur: str | None = None
    in_streams = False
    for line in text.splitlines():
        if re.match(r"^streams:\s*$", line):
            in_streams = True
            cur = None
            continue
        if in_streams and re.match(r"^[A-Za-z]", line):
            # next top-level key ends streams section
            break
        if not in_streams:
            continue
        m = re.match(r"^  ([^:\s][^:]*):\s*$", line)
        if m:
            cur = m.group(1)
            streams.setdefault(cur, [])
            continue
        if cur and line.strip().startswith("-"):
            val = line.strip()[1:].strip()
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            streams[cur].append(val)
    return streams


def pick_rtsp(sources: list[str]) -> str | None:
    for v in sources:
        if v.startswith("rtsp://"):
            return v
    return sources[0] if sources else None


def main() -> None:
    text = SRC.read_text()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak = Path(f"/config/go2rtc.yaml.before-cleanup-{stamp}")
    shutil.copy2(SRC, bak)
    print("BACKUP", bak)

    parsed = parse_stream_sources(text)
    picked: dict[str, str] = {}
    for key in KEEP_ORDER:
        url = pick_rtsp(parsed.get(key) or [])
        if not url:
            raise SystemExit(f"MISSING source for {key}")
        picked[key] = url
        print("KEEP", key, "->", redact(url)[:120])

    removed = sorted(set(parsed) - set(KEEP_ORDER))
    print("REMOVE_COUNT", len(removed))
    for key in removed:
        print("REMOVE", key)

    new = f"""# go2rtc cleaned {stamp}
# Keep only streams used by monitoring + security (exclude ONVIF/DLNA duplicates).
# monitoring: akuvox_akuvox_door, tp_ipc_main, yw_main
# security:   akuvox_sub, tp_ipc_main, yw_main

api:
  origin: "*"

ffmpeg:
  bin: /usr/bin/ffmpeg
  h264: "-codec:v libx264 -g:v 30 -preset:v superfast -tune:v zerolatency -profile:v main -level:v 4.1 -pix_fmt yuv420p"

streams:
  akuvox_sub:
    - {picked['akuvox_sub']}
  akuvox_akuvox_door:
    - {picked['akuvox_akuvox_door']}
  tp_ipc_main:
    - {picked['tp_ipc_main']}
  yw_main:
    - {picked['yw_main']}
"""
    SRC.write_text(new)
    print("WROTE", SRC, "bytes", SRC.stat().st_size)


if __name__ == "__main__":
    main()
