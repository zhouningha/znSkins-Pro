#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import urllib.request
from pathlib import Path

p = Path("/config/go2rtc.yaml")
bak = Path("/config/go2rtc.yaml.bak-onvif-alias-20260719")
if not bak.exists():
    bak.write_text(p.read_text())

text = bak.read_text()
cur = p.read_text()


def extract(name: str, blob: str) -> str | None:
    m = re.search(
        rf"(?m)^\s*{re.escape(name)}:\s*\n(?:\s*-\s*.+\n)*?\s*-\s*(rtsp://\S+)",
        blob,
    )
    return m.group(1).strip().strip('"') if m else None


def first(*vals: str | None) -> str | None:
    for v in vals:
        if v:
            return v
    return None


urls = {
    "tp_main": first(extract("tp_ipc_main", cur), extract("tp_ipc_main", text)),
    "tp_sub": first(extract("tp_ipc_sub", cur), extract("tp_ipc_sub", text)),
    "yw_main": first(extract("yw_main", cur), extract("yw_main", text)),
    "yw_sub": first(extract("yw_sub", cur), extract("yw_sub", text)),
    "akuvox_main": first(
        extract("akuvox_akuvox_door", cur),
        extract("akuvox_akuvox_door", text),
    ),
    "akuvox_sub": first(extract("akuvox_sub", cur), extract("akuvox_sub", text)),
}
missing = [k for k, v in urls.items() if not v]
if missing:
    raise SystemExit(f"missing {missing}")

yw_third = urls["yw_main"].replace("/Channels/101", "/Channels/103")
mosaic = re.search(r"(?ms)^\s*all_cameras_dlna:\n(?:\s+- .+\n)+", text)
mosaic_block = mosaic.group(0) if mosaic else "  all_cameras_dlna:\n    - ffmpeg:tp_ipc_sub#video=h264\n"

# Exact percent-encoded names HA requests on go2rtc :8554 / API.
aliases = {
    "onvif_f4-84-8d-16-3a-fa%23profile_1": [
        urls["tp_main"],
        "ffmpeg:tp_ipc_main#video=copy#audio=opus",
    ],
    "onvif_f4-84-8d-16-3a-fa%23profile_2": [
        urls["tp_sub"],
        "ffmpeg:tp_ipc_sub#video=copy#audio=opus",
    ],
    "onvif_08%3A54%3A11%3Ae5%3Ae9%3A68%23Profile_1": [
        urls["yw_main"],
        "ffmpeg:yw_main#video=copy#audio=opus",
    ],
    "onvif_08%3A54%3A11%3Ae5%3Ae9%3A68%23Profile_2": [
        urls["yw_sub"],
        "ffmpeg:yw_sub#video=copy#audio=opus",
    ],
    "onvif_08%3A54%3A11%3Ae5%3Ae9%3A68%23Profile_3": [
        yw_third,
        "ffmpeg:yw_sub#video=copy#audio=opus",
    ],
    "onvif_0C1105412C74%23Profile_Token": [
        urls["akuvox_main"],
        "ffmpeg:akuvox_akuvox_door#video=copy#audio=opus",
    ],
    "onvif_0C1105412C74%23Profile_Token_2": [
        urls["akuvox_sub"],
        "ffmpeg:akuvox_sub#video=copy#audio=opus",
    ],
}

alias_yaml = []
for name, srcs in aliases.items():
    alias_yaml.append(f"  {name}:")
    for s in srcs:
        alias_yaml.append(f"    - {s}")

new = f"""# go2rtc — HA WebRTC uses percent-encoded ONVIF names (%23 not #).
# Never use ffmpeg:onvif_* self-refs (causes DESCRIBE 404 on :8554).
# Locked with chattr +i so HA cannot rewrite broken aliases into this file.

api:
  origin: "*"

ffmpeg:
  bin: /usr/bin/ffmpeg
  h264: "-codec:v libx264 -g:v 30 -preset:v superfast -tune:v zerolatency -profile:v main -level:v 4.1 -pix_fmt yuv420p"

streams:
  akuvox_sub:
    - {urls["akuvox_sub"]}
  akuvox_akuvox_door:
    - {urls["akuvox_main"]}
  tp_ipc_main:
    - {urls["tp_main"]}
  tp_ipc_sub:
    - {urls["tp_sub"]}
  yw_main:
    - {urls["yw_main"]}
  yw_sub:
    - {urls["yw_sub"]}
  tp_ipc_main_dlna:
    - ffmpeg:tp_ipc_main#video=h264
  tp_ipc_sub_dlna:
    - ffmpeg:tp_ipc_sub#video=h264
  yw_main_dlna:
    - ffmpeg:yw_main#video=h264
  akuvox_door_dlna:
    - ffmpeg:akuvox_akuvox_door#video=h264
{mosaic_block}
{chr(10).join(alias_yaml)}
"""

subprocess.run(["chattr", "-i", str(p)], check=False)
p.write_text(new)
print("wrote", p, "self_ref", "ffmpeg:onvif_" in new)

for name, srcs in aliases.items():
    body = json.dumps(srcs).encode()
    req = urllib.request.Request(
        f"http://127.0.0.1:1984/api/streams?name={name}",
        data=body,
        method="PUT",
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=5)
        print("PUT ok", name)
    except Exception as err:
        print("PUT fail", name, err)

subprocess.run(["chattr", "+i", str(p)], check=False)
print("locked chattr +i")

for name in aliases:
    try:
        raw = urllib.request.urlopen(
            f"http://127.0.0.1:1984/api/streams?src={name}",
            timeout=5,
        ).read().decode()
        bad = "ffmpeg:onvif_" in raw
        print("GET", name, "BAD_SELF_REF" if bad else "ok")
    except Exception as err:
        print("GET fail", name, err)

# mp4 smoke test
for name in (
    "onvif_f4-84-8d-16-3a-fa%23profile_2",
    "onvif_08%3A54%3A11%3Ae5%3Ae9%3A68%23Profile_2",
    "onvif_0C1105412C74%23Profile_Token_2",
):
    try:
        data = urllib.request.urlopen(
            f"http://127.0.0.1:1984/api/stream.mp4?src={name}&duration=1",
            timeout=20,
        ).read()
        print("mp4", name, len(data))
    except Exception as err:
        print("mp4 fail", name, err)
