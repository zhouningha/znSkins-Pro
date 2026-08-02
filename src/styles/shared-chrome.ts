/**
 * Shared chrome — LAYOUT LOCK + token-colored widgets.
 *
 * Injected AFTER skin theme.css (see skins-pro-card.ts) with !important so
 * skins cannot invent alternate size/position/fill. Skins only change visual
 * tokens (--sp-accent, --sp-glass-bg, backgrounds, icons).
 */
export const SHARED_CHROME_CSS = `
/* ========== Skin switch: short crossfade only while transitioning ========== */
:host([data-skin-transition]) {
  transition: opacity 160ms ease;
}
:host([data-skin-transition="out"]),
:host([data-skin-transition="hold"]) {
  opacity: 0;
  pointer-events: none;
}
:host([data-skin-transition="in"]) {
  opacity: 1;
}

/* ========== LAYOUT LOCK: kiosk / Android edge-to-edge ==========
   Tablet kiosk must fill the real viewport — no --sp-app-padding frame.
   Verified cause of the wood/blank border: .mc-app padding (16px AC default). */
:host([data-kiosk-fullscreen]),
:host([data-android-kiosk="true"]),
:host([data-sp-kiosk]) {
  --sp-app-padding: 0px !important;
  --sp-stage-radius: 0px !important;
}
:host([data-kiosk-fullscreen]) .mc-app,
:host([data-android-kiosk="true"]) .mc-app,
:host([data-sp-kiosk]) .mc-app {
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
:host([data-kiosk-fullscreen]) .sidebar,
:host([data-android-kiosk="true"]) .sidebar,
:host([data-sp-kiosk]) .sidebar,
:host([data-kiosk-fullscreen]) .stage,
:host([data-android-kiosk="true"]) .stage,
:host([data-sp-kiosk]) .stage {
  border-radius: 0 !important;
}
:host([data-kiosk-fullscreen]),
:host([data-android-kiosk="true"]),
:host([data-sp-kiosk]) {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  height: var(--sp-runtime-height, 100vh) !important;
  min-height: var(--sp-runtime-min-height, 100vh) !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
:host([data-kiosk-fullscreen]) ha-card,
:host([data-android-kiosk="true"]) ha-card,
:host([data-sp-kiosk]) ha-card {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
  height: 100% !important;
}

/* Home header/weather group: use AC placement across skins; do not touch side panels.
   Tablet readability: weather was 240px / 22px — bump size here (LAYOUT LOCK wins over skins). */
.mc-app[data-view="home"] .stage-grid {
  position: relative !important;
}
.mc-app[data-view="home"] .welcome-group {
  grid-area: welcome !important;
  display: grid !important;
  grid-template-rows: auto auto !important;
  gap: 0 !important;
  align-self: start !important;
  max-width: 540px !important;
  min-width: 0 !important;
}
.mc-app[data-view="home"] .weather-block {
  margin-top: 14px !important;
  width: 100% !important;
  max-width: 400px !important;
  flex-shrink: 0 !important;
  cursor: pointer !important;
}
.mc-app[data-view="home"] .weather-state-icon {
  width: 48px !important;
  height: 48px !important;
}
.mc-app[data-view="home"] .weather-state-icon ha-icon {
  --mdc-icon-size: 30px;
  width: 30px;
  height: 30px;
}
.mc-app[data-view="home"] .weather-current-temp {
  font-size: 38px !important;
  line-height: 1.1 !important;
}
.mc-app[data-view="home"] .weather-current-hl {
  font-size: 18px !important;
}
.mc-app[data-view="home"] .weather-current-cond {
  font-size: 16px !important;
}
.mc-app[data-view="home"] .weather-forecast {
  gap: 6px !important;
  margin-top: 12px !important;
}
.mc-app[data-view="home"] .forecast-day {
  gap: 4px !important;
}
.mc-app[data-view="home"] .forecast-weekday {
  font-size: 15px !important;
}
.mc-app[data-view="home"] .forecast-icon ha-icon {
  --mdc-icon-size: 28px;
  width: 28px;
  height: 28px;
}
.mc-app[data-view="home"] .forecast-high {
  font-size: 15px !important;
}
.mc-app[data-view="home"] .forecast-low {
  font-size: 14px !important;
}

/* ========== LAYOUT LOCK: media playlist ========== */
.media-playlist {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 2px !important;
  flex: 0 0 var(--media-controls-width, 136px) !important;
  width: var(--media-controls-width, 136px) !important;
  min-width: var(--media-controls-width, 136px) !important;
  max-width: var(--media-controls-width, 136px) !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  margin: 0 0 0 auto !important;
  padding: 0 2px !important;
  border: var(--sp-border-width, 0) solid var(--sp-border-chip, var(--sp-border-glass, transparent));
  border-radius: var(--sp-radius-pill, 999px) !important;
  background: var(--sp-device-bg, var(--sp-glass-bg, var(--glass-regular, rgba(255,255,255,.55))));
  box-shadow: var(--sp-shadow-sm, none);
  box-sizing: border-box !important;
  overflow: hidden !important;
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
  color: var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, inherit))) !important;
  box-shadow: none !important;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.media-playlist-nav:hover,
.media-playlist-nav:active {
  background: var(--sp-accent-alpha, rgba(0,0,0,.08)) !important;
  color: var(--sp-accent, inherit) !important;
}
.media-playlist-nav ha-icon {
  --mdc-icon-size: 20px;
  width: 20px;
  height: 20px;
  color: inherit;
  pointer-events: none;
}
.media-playlist-label {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  height: 24px !important;
  line-height: 24px !important;
  text-align: center !important;
  padding: 0 4px !important;
  color: var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, inherit)));
  font-size: var(--sp-font-3xs, 11px);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.media-playlist-menu,
.media-playlist-option { display: none !important; }

/* ========== LAYOUT LOCK: home sidebar camera ========== */
.panel-camera.glass-card,
.panel-camera {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: var(--sp-radius-glass, var(--sp-radius-lg, 24px)) !important;
  background: #1a1a1a;
  cursor: default !important;
  box-sizing: border-box !important;
}
.panel-camera .section-title {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  pointer-events: none !important;
  background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%) !important;
}
.panel-camera .section-title h2 {
  margin: 0 !important;
  padding: 0 !important;
  color: #fff !important;
  text-shadow: 0 1px 4px rgba(0,0,0,.55);
  font-size: var(--sp-font-sm, 13px);
  line-height: 1.2;
}
.panel-camera .camera-preview {
  flex: none !important;
  margin: 0 !important;
  width: 100% !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  aspect-ratio: 16 / 10 !important;
  overflow: hidden !important;
  position: relative !important;
  background: #111 !important;
  border-radius: 0 !important;
  contain: layout size;
}
.side > .panel-camera {
  height: auto !important;
  max-height: none !important;
  overflow: hidden !important;
  align-self: start !important;
}
/* Kiosk home: monitor stays content-sized (16:10); leftover side height → scenes. */
:host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-camera {
  align-self: start !important;
  height: auto !important;
  max-height: none !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}
:host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-camera .camera-preview {
  flex: none !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  aspect-ratio: 16 / 10 !important;
  contain: layout size !important;
}
.panel-camera .camera-preview,
.panel-camera .camera-preview *,
.camera-card .camera-preview,
.camera-card .camera-preview * {
  pointer-events: none !important;
}

/* ========== LAYOUT LOCK: security camera cards ========== */
.mc-app[data-view="security"] .page-shell {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 0 !important;
  box-shadow: none !important;
}
.security-cameras {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: var(--sp-space-sm, 10px) !important;
}
.security-devices {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
  gap: var(--sp-space-sm, 10px) !important;
}
.security-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: var(--sp-space-md, 12px) !important;
}
.camera-card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  overflow: hidden !important;
  isolation: isolate !important;
  width: 100% !important;
  /* AC baseline: radius on card; do not let skins use aspect-ratio on the card itself */
  aspect-ratio: auto !important;
  border: 0 !important;
  border-radius: var(--sp-radius-lg, var(--sp-radius-camera, var(--sp-stage-radius, 24px))) !important;
  background: #111;
  box-sizing: border-box !important;
  cursor: default;
  text-align: left;
  box-shadow: var(--sp-shadow-card, none);
  /* Prevent backdrop-filter from painting square over rounded corners */
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
}
.camera-card.camera-card-edit { cursor: pointer; }
.camera-card .camera-preview {
  position: relative !important;
  flex: 1 1 auto !important;
  margin: 0 !important;
  width: 100% !important;
  min-height: 160px !important;
  max-height: none !important;
  aspect-ratio: 16 / 10 !important;
  height: auto !important;
  overflow: hidden !important;
  background: #111 !important;
  /* Same radius as card — skins must not force 0 (GoW had independent square preview) */
  border-radius: inherit !important;
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
.camera-card .camera-preview .sp-go2rtc-mjpeg,
.panel-camera .camera-preview sp-camera-preview,
.panel-camera .camera-preview .camera-stream,
.panel-camera .camera-preview hui-image {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border: 0 !important;
  object-fit: cover !important;
}
.camera-card .camera-preview sp-go2rtc-video video,
.camera-card .camera-preview video,
.panel-camera .camera-preview video,
.panel-camera .camera-preview img,
.camera-card .camera-preview img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: inherit !important;
}
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
  background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%) !important;
}
.camera-meta-overlay .device-name {
  margin: 0 !important;
  color: #fff !important;
  text-shadow: 0 1px 4px rgba(0,0,0,.55);
  font-weight: 700;
  font-size: var(--sp-font-sm, 13px);
}
.camera-meta-overlay .status {
  flex-shrink: 0 !important;
  background: rgba(255,255,255,.22) !important;
  color: #fff !important;
}

/* ========== LAYOUT LOCK: device control row (light dim / cover / switch) ==========
   Structure & geometry = Animal Crossing. Skins only recolor via tokens.
   Prevents theme CSS from dropping .control-row flex and parking the knob wrong. */
.device .control-row,
.devices .control-row,
.devices-page-grid .control-row {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  justify-content: flex-start !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  min-width: 0 !important;
  margin-top: 4px !important;
  box-sizing: border-box !important;
}
.device .control-row .device-pos-track,
.devices .control-row .device-pos-track,
.devices-page-grid .control-row .device-pos-track {
  flex: 1 1 auto !important;
  min-width: 64px !important;
  max-width: none !important;
}
.device .control-row .switch,
.devices .control-row .switch,
.devices-page-grid .control-row .switch {
  flex: 0 0 auto !important;
  margin-left: auto !important;
}
.device .control-row .light-color-swatch,
.devices .control-row .light-color-swatch,
.devices-page-grid .control-row .light-color-swatch {
  flex: 0 0 auto !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
}

/* Themed switch geometry — AC baseline; colors from --sp-switch-* / --sp-accent */
.switch {
  position: relative !important;
  display: inline-block !important;
  width: 42px !important;
  height: 22px !important;
  min-width: 42px !important;
  min-height: 22px !important;
  border-radius: 999px !important;
  background: var(--sp-switch-bg, rgba(128,128,128,.22)) !important;
  box-sizing: border-box !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
}
.switch::after {
  content: "" !important;
  position: absolute !important;
  top: 3px !important;
  left: 3px !important;
  width: 16px !important;
  height: 16px !important;
  border-radius: 999px !important;
  background: var(--sp-switch-knob, #fff) !important;
  box-shadow: var(--sp-shadow-switch, 0 2px 6px rgba(0,0,0,.25)) !important;
  transition: left 0.15s ease !important;
}
.switch.on {
  background: var(--sp-accent, var(--sp-accent-green, #7BC67E)) !important;
}
.switch.on::after {
  left: 23px !important;
}

/* ========== LAYOUT LOCK: home time + air as ONE card ==========
   Nested time/env never draw their own card chrome. */
.home-meta-card {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 12px 14px !important;
  margin: 0 !important;
  overflow: hidden !important;
}
.home-meta-card .time-card,
.home-meta-card .panel-environment,
.home-meta-card .home-meta-time,
.home-meta-card .home-meta-env {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
.home-meta-time-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  min-width: 0 !important;
}
.home-meta-date {
  font-size: var(--sp-font-sm, 14px) !important;
  white-space: nowrap !important;
}
.home-meta-card .time-icon {
  cursor: pointer !important;
  flex-shrink: 0 !important;
}
.home-meta-env-list {
  gap: clamp(2px, 0.6vw, 6px) clamp(6px, 1vw, 12px) !important;
  margin-top: 0 !important;
}
.welcome-meta {
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
  min-width: 0 !important;
}

/* ========== LAYOUT LOCK: home/rooms card label ==========
   Soft bottom gradient (no frosted pill). Skins may recolor text via tokens. */
.room-label {
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  padding: 28px 14px 12px !important;
  border-radius: 0 0 var(--sp-radius-room, var(--sp-radius-lg, 24px)) var(--sp-radius-room, var(--sp-radius-lg, 24px)) !important;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.18) 42%, rgba(0, 0, 0, 0.52) 100%) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
  text-align: left !important;
}
.room-label h3 {
  color: #fff !important;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55) !important;
  margin: 0 !important;
}
.room-label .muted,
.room-label .room-stats {
  color: rgba(255, 255, 255, 0.88) !important;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5) !important;
  margin: 2px 0 0 !important;
  /* Always reserve one subtitle line so room titles align across cards. */
  min-height: 1.25em !important;
  line-height: 1.25 !important;
}

/* Cover/valve/light percent bar — LAYOUT LOCK (AC). Skins color fill via --sp-accent. */
.device-pos-track {
  flex: 1 1 auto !important;
  min-width: 64px !important;
  height: 10px !important;
  border-radius: 999px !important;
  background: var(--sp-device-bg, var(--sp-switch-bg, rgba(0,0,0,.12))) !important;
  overflow: hidden !important;
  cursor: pointer !important;
  position: relative !important;
  touch-action: manipulation !important;
}
.device-pos-fill {
  height: 100% !important;
  border-radius: inherit !important;
  background: var(--sp-accent, var(--sp-accent-green, #7BC67E)) !important;
  pointer-events: none !important;
  transition: width 0.12s ease-out;
}

/* Fan etc. still on ha-control-slider — color from skin tokens only (not layout). */
ha-control-slider {
  --control-slider-color: var(--sp-accent, var(--sp-accent-green, #7BC67E)) !important;
  --control-slider-background: var(--sp-device-bg, rgba(128,128,128,.22)) !important;
  --control-slider-background-opacity: 1 !important;
  --control-slider-border-radius: var(--sp-radius-pill, var(--sp-radius-infinite, 999px)) !important;
  border-radius: var(--sp-radius-pill, var(--sp-radius-infinite, 999px)) !important;
  overflow: hidden !important;
  flex: 1 1 auto !important;
  min-width: 64px !important;
  align-self: center !important;
}

/* Security card chrome — colors from tokens; structure/radius fixed (AC) */
.mc-app[data-view="security"] .camera-card {
  background: var(--sp-glass-bg, var(--glass-regular, rgba(255,248,230,.62))) !important;
  border: 1px solid var(--sp-border-glass, rgba(255,255,255,.46)) !important;
  color: var(--sp-text-primary, var(--sp-text-stage, var(--sp-text-main, inherit))) !important;
  box-shadow: none !important;
  border-radius: var(--sp-radius-lg, var(--sp-radius-camera, var(--sp-stage-radius, 24px))) !important;
  overflow: hidden !important;
  isolation: isolate !important;
  aspect-ratio: auto !important;
  backdrop-filter: blur(14px) saturate(130%);
  -webkit-backdrop-filter: blur(14px) saturate(130%);
}
.mc-app[data-view="security"] .camera-card .camera-preview {
  border-radius: inherit !important;
}

/*
  Kiosk landscape side — Animal Crossing baseline for ALL skins:
  monitor/energy/media content-sized; leftover → scenes.
  Skins may recolor panels; they must not hide scenes or invent another row recipe.
  Exception: God of War wall data-wall-panel=1080p keeps its registered layout.
*/
@media (orientation: landscape) {
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .stage-grid {
    grid-template-columns: minmax(0, 1fr) clamp(240px, 23vw, 310px) !important;
    grid-template-rows: auto minmax(0, 1fr) auto !important;
  }
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side {
    display: grid !important;
    grid-template-rows: max-content max-content max-content minmax(0, 1fr) !important;
    grid-auto-rows: max-content !important;
    gap: 8px !important;
    align-content: start !important;
    align-items: stretch !important;
    height: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side > .panel-camera,
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side > .panel-energy,
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side > .panel-media {
    display: flex !important;
    height: auto !important;
    max-height: none !important;
    min-height: 0 !important;
    align-self: start !important;
  }
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side > .panel-scenes {
    display: flex !important;
    flex-direction: column !important;
    /* Fill leftover row under media (AC). Kill GoW margin-top:auto gap. */
    height: 100% !important;
    max-height: none !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    align-self: stretch !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  :host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .side > .maintenance-card {
    display: none !important;
  }
}
:host([data-sp-kiosk]:not([data-wall-panel="1080p"])) .mc-app[data-view="home"] .panel-camera .camera-preview {
  flex: none !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  aspect-ratio: 16 / 10 !important;
  contain: layout size !important;
}
/* Neutralize skin camera AR fights (3/2, 16/9). Card max-height stays per .camera-card lock. */
.camera-preview,
.panel-camera .camera-preview,
.camera-card .camera-preview {
  aspect-ratio: 16 / 10 !important;
}

/* Keep home energy bars visible (avoid collapsed chart leaving empty side gap). */
:host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .bars,
:host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .energy-chart .bars,
:host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .compact-energy-bars {
  display: flex !important;
  align-items: flex-end !important;
  min-height: 48px !important;
  height: 48px !important;
  flex: none !important;
  margin-top: var(--sp-space-xs, 6px) !important;
}

/* ========== LAYOUT LOCK: energy bars (all skins) ==========
   Some skins ship .bars but omit energy-bar-level-* heights; --sp-bar-min then
   flattens every column. Heights come from inline style on .energy-bar. */
.bars {
  display: flex !important;
  align-items: flex-end !important;
  gap: 2px !important;
  box-sizing: border-box !important;
}
.bars .energy-bar,
.bars span.energy-bar {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  align-self: flex-end !important;
  border-radius: 3px !important;
  background: var(--sp-bar-gradient) !important;
  opacity: 0.9 !important;
  box-sizing: border-box !important;
}
.bars .energy-bar-level-0 {
  opacity: 0.28 !important;
  min-height: 3px !important;
}
.energy-chart {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  min-width: 0 !important;
}
.energy-bar-axis {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-top: 4px !important;
  padding: 0 1px !important;
  font-size: var(--sp-font-3xs, 10px) !important;
  line-height: 1.2 !important;
  color: var(--sp-text-muted-dim, var(--sp-text-muted, rgba(0,0,0,.55))) !important;
  opacity: 0.9 !important;
  pointer-events: none !important;
}
.energy-bar-axis span {
  min-width: 0 !important;
  white-space: nowrap !important;
}

/* ========== LAYOUT LOCK: energy page (AC uses flex on .page-body; force grid) ========== */
.page-body.single-column.energy-detail-page {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: var(--sp-space-lg, 16px) !important;
  align-items: start !important;
  width: 100% !important;
  min-width: 0 !important;
}
.page-body.single-column.energy-detail-page .energy-total-card,
.page-body.single-column.energy-detail-page .energy-floor-title {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  flex: none !important;
}
.energy-card-head {
  flex-wrap: wrap !important;
  gap: 4px 8px !important;
  align-items: baseline !important;
}
.energy-location {
  font-size: var(--sp-font-2xs, 11px) !important;
  opacity: 0.8 !important;
  display: inline !important;
}
.energy-floor-title {
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  margin: 8px 0 0 !important;
}
.energy-floor-title h2 {
  font-size: var(--sp-font-md, 15px) !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  overflow: visible !important;
  width: auto !important;
  max-width: 100% !important;
}

/* Energy metric rows: keep「本月累计」on one line (AC cards are narrow in 4-col grid). */
.energy-detail-page .env-row {
  grid-template-columns: 24px max-content minmax(0, 1fr) !important;
  gap: 6px !important;
  align-items: center !important;
}
.energy-detail-page .env-row .muted {
  white-space: nowrap !important;
  width: max-content !important;
  max-width: none !important;
  overflow: visible !important;
  text-overflow: clip !important;
  flex-shrink: 0 !important;
}
.energy-detail-page .env-value {
  white-space: nowrap !important;
  overflow-wrap: normal !important;
  word-break: keep-all !important;
  justify-self: end !important;
  min-width: 0 !important;
}

/* ========== LAYOUT LOCK: home env floor tabs (all skins) ========== */
.env-floor-tabs {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px !important;
  width: 100% !important;
  margin: 0 0 4px !important;
}
.env-floor-tabs .chip {
  min-height: 24px !important;
  padding: 0 10px !important;
  font-size: var(--sp-font-2xs, 11px) !important;
  line-height: 1 !important;
}

@media (max-width: 1100px), (orientation: portrait) {
  .page-body.single-column.energy-detail-page {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}

/* ========== Android Kiosk: devices page tile-memory budget ==========
   Old Chromium WebView drops cards with "tile memory limits exceeded"
   when many glass cards use backdrop-filter. Mac is unaffected.
   Keep skin glass tint via CSS vars (AC cream / GoW dark) but NO blur
   (blur × 16 cards blows tile memory). Do not hardcode AC colors. */
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  transition: none !important;
  transform: none !important;
  background: var(--sp-glass-light, var(--sp-card-bg, var(--glass-regular, var(--sp-panel-bg, rgba(255,255,255,0.14))))) !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, var(--sp-border-device, rgba(255,255,255,0.18))) !important;
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .device-name,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .muted,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .status,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .state-word,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .count-tag {
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
  text-shadow: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .muted {
  color: var(--sp-text-stage-muted, var(--sp-text-muted, var(--sp-text-secondary, inherit))) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .status,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .count-tag {
  background: var(--sp-accent-alpha, rgba(255,255,255,0.12)) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .section-title h2,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .section-title .muted,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-header h1,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-header .muted {
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
  text-shadow: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-scroll {
  /* GoW theme still ships contain:strict here — that collapses height to 0 on Android. */
  contain: none !important;
  content-visibility: visible !important;
  overscroll-behavior: contain;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device-group {
  content-visibility: visible !important;
  contain: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .item-img,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .item-icon {
  box-shadow: none !important;
  filter: none !important;
  transition: none !important;
}
.android-device-pager {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: var(--sp-space-sm, 8px) !important;
  margin-bottom: var(--sp-space-sm, 8px) !important;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
  font-size: var(--sp-font-sm, 13px);
}
.android-device-page-button {
  display: grid !important;
  place-items: center !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, rgba(0,0,0,.12)) !important;
  border-radius: 50% !important;
  background: var(--sp-glass-light, var(--sp-card-bg, rgba(255,255,255,.7))) !important;
  color: var(--sp-text-main, inherit) !important;
  cursor: pointer;
}
.android-device-page-button ha-icon { --mdc-icon-size: 22px; }
.android-device-page-button:disabled { opacity: 0.35; cursor: default; }

/* Devices page edit-hidden */
.device-hide-hint {
  margin: 0 0 var(--sp-space-sm, 8px) !important;
  font-size: var(--sp-font-sm, 13px);
}
.device-hide-wrap {
  position: relative !important;
  display: block !important;
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}
.device-hide-wrap > .device,
.device-hide-wrap > button.device {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
.device-hide-wrap.device-hide-edit-target > * {
  pointer-events: none !important;
}
.device-hide-wrap.device-card-hidden {
  opacity: 0.48 !important;
  filter: grayscale(0.25);
}
.device-hide-badge {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 2 !important;
  padding: 2px 8px !important;
  border-radius: 999px !important;
  font-size: var(--sp-font-3xs, 11px) !important;
  font-weight: 700 !important;
  color: #fff !important;
  background: rgba(0,0,0,.55) !important;
  pointer-events: none !important;
}
.filter-bar .action-btn.active {
  outline: 2px solid var(--sp-accent, #c4a574);
  outline-offset: 1px;
}
.scene-area-section {
  display: grid;
  gap: var(--sp-space-sm, 10px);
  margin-bottom: var(--sp-space-lg, 18px);
}
.scene-area-section .section-title {
  margin-bottom: 0;
}

/* Themed device-card selects — follow current skin tokens (not OS grey popup) */
.sp-select {
  position: relative !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
  z-index: 3;
}
.sp-select-trigger {
  list-style: none !important;
  min-height: 32px !important;
  min-width: 52px !important;
  max-width: 96px !important;
  padding: 0 18px 0 6px !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-chip, var(--sp-border-glass, rgba(255,255,255,.35))) !important;
  border-radius: var(--sp-radius-pill, 999px) !important;
  background-color: var(--sp-device-bg, var(--sp-glass-light, var(--glass-regular, rgba(255,255,255,.55)))) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 6px center !important;
  background-size: 10px !important;
  color: var(--sp-text-main, var(--sp-text-primary, inherit)) !important;
  font: inherit !important;
  font-size: var(--sp-font-3xs, 11px) !important;
  line-height: 32px !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  user-select: none !important;
}
.sp-select-trigger::-webkit-details-marker { display: none !important; }
.sp-select-menu {
  /* Real menu is a body portal (see themed-select.ts). Keep stub hidden. */
  display: none !important;
}
.sp-select-compact .sp-select-trigger {
  min-height: 32px !important;
  font-size: var(--sp-font-3xs, 11px) !important;
}
`;
