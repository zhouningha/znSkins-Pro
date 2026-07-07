from __future__ import annotations

import asyncio
from pathlib import Path
import re
import shutil
import tempfile
import zipfile

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.aiohttp_client import async_get_clientsession

DOMAIN = "skins_pro"
DEFAULT_STORE_BASE = "https://cdn.jsdelivr.net/gh/ha-china/Skins-Pro@store/store"
CUSTOM_STORE_BASE = "https://cdn.jsdelivr.net/gh/zhouningha/znSkins-Pro@master/store"
WWW_ROOT = Path("/config/www/skins-pro")
SAFE_SKIN_ID = re.compile(r"^[A-Za-z0-9_-]+$")


def _safe_skin_id(value: str) -> str:
    skin_id = str(value or "").strip()
    if not skin_id or not SAFE_SKIN_ID.match(skin_id):
        raise ValueError("Invalid skin_id")
    return skin_id


def _extract_zip(zip_path: Path, skin_id: str) -> None:
    target = WWW_ROOT / skin_id
    temp_target = WWW_ROOT / f".{skin_id}.tmp"
    if temp_target.exists():
        shutil.rmtree(temp_target)
    temp_target.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_path) as archive:
        for member in archive.infolist():
            name = member.filename
            if not name or name.startswith("/") or ".." in Path(name).parts:
                continue
            archive.extract(member, temp_target)

    nested = temp_target / skin_id
    source = nested if nested.exists() and nested.is_dir() else temp_target
    if target.exists():
        shutil.rmtree(target)
    if source == temp_target:
        temp_target.rename(target)
    else:
        shutil.move(str(source), str(target))
        shutil.rmtree(temp_target, ignore_errors=True)


def _remove_skin(skin_id: str) -> None:
    target = WWW_ROOT / skin_id
    if target.exists():
        shutil.rmtree(target)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    session = async_get_clientsession(hass)

    async def async_download_skin(call: ServiceCall) -> None:
        skin_id = _safe_skin_id(call.data.get("skin_id"))
        package_url = str(call.data.get("package_url") or "").strip()
        urls = []
        if package_url:
            urls.append(package_url)
        urls.extend([
            f"{CUSTOM_STORE_BASE}/{skin_id}.zip",
            f"{DEFAULT_STORE_BASE}/{skin_id}.zip",
        ])

        WWW_ROOT.mkdir(parents=True, exist_ok=True)
        last_error: Exception | None = None
        with tempfile.TemporaryDirectory() as tmp_dir:
            zip_path = Path(tmp_dir) / f"{skin_id}.zip"
            for url in dict.fromkeys(urls):
                try:
                    async with session.get(url, timeout=60) as response:
                        response.raise_for_status()
                        zip_path.write_bytes(await response.read())
                    await hass.async_add_executor_job(_extract_zip, zip_path, skin_id)
                    return
                except Exception as err:  # pragma: no cover - surfaced as service error
                    last_error = err
            raise RuntimeError(f"Failed to download {skin_id}: {last_error}")

    async def async_remove_skin(call: ServiceCall) -> None:
        skin_id = _safe_skin_id(call.data.get("skin_id"))
        await hass.async_add_executor_job(_remove_skin, skin_id)

    hass.services.async_register(DOMAIN, "download_skin", async_download_skin)
    hass.services.async_register(DOMAIN, "remove_skin", async_remove_skin)
    return True
