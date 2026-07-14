import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HomeAssistant, TranslationKey } from '../types';

const MUSIC_SOURCE_ENTITY = 'input_select.living_room_music_source';

function musicPlaylistMediaId(option: string): string {
  return option;
}

export function renderMediaPlayer(
  hass: HomeAssistant,
  entityId: string | undefined,
  configuredControlId: string | undefined,
  translate: (key: TranslationKey) => string,
): TemplateResult | typeof nothing {
  if (!entityId) return nothing;
  const stateObj = hass.states?.[entityId];
  if (!stateObj) return nothing;
  const state = stateObj.state;
  const isOff = state === 'off' || state === 'unavailable';
  if (isOff) {
    const name = (stateObj.attributes?.friendly_name as string) || entityId;
    return html`
      <section class="glass-card panel-media">
        <div class="section-title"><h2>${translate('mediaPlayer')}</h2></div>
        <div class="media-off-state">
          <button class="media-volbtn" @click=${() => hass.callService('media_player', 'turn_on', { entity_id: entityId })} title=${translate('turnOn')}><ha-icon icon="mdi:power-standby"></ha-icon></button>
          <span>${name}</span>
        </div>
      </section>
    `;
  }
  const attrs = stateObj.attributes || {};
  const title = (attrs.media_title as string) || (attrs.friendly_name as string) || entityId;
  const artist = attrs.media_artist as string | undefined;
  const albumArt = attrs.entity_picture as string | undefined;
  const source = (attrs.app_name as string) || (attrs.source as string) || '';
  const baseEntityId = entityId.replace(/_\d+$/, '');
  const controlEntityId = configuredControlId && hass.states?.[configuredControlId]
    ? configuredControlId
    : baseEntityId !== entityId && hass.states?.[baseEntityId] ? baseEntityId : entityId;
  const controlStateObj = hass.states?.[controlEntityId];
  const effectiveState = state;
  const isPlaying = effectiveState === 'playing';
  const hasQueue = Boolean(attrs.media_title || attrs.media_content_id || attrs.active_queue);
  const playbackLabel = isPlaying ? '正在播放' : effectiveState === 'paused' || hasQueue ? '已暂停' : '待播放';
  const controlAttrs = controlStateObj?.attributes || attrs;
  const vol = controlAttrs.volume_level as number | undefined;
  const isMuted = Boolean(controlAttrs.is_volume_muted);
  const volZero = isMuted || vol !== undefined && vol === 0;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const playlistState = hass.states?.[MUSIC_SOURCE_ENTITY];
  const playlistOptions = Array.isArray(playlistState?.attributes?.options)
    ? (playlistState.attributes.options as string[]).filter((option) => option.trim())
    : [];
  const selectedPlaylist = String(playlistState?.state || '');
  const playPlaylist = async (playlist: string) => {
    const mediaId = musicPlaylistMediaId(playlist);
    if (!mediaId) return;
    await hass.callService('input_select', 'select_option', { entity_id: MUSIC_SOURCE_ENTITY, option: playlist });
    await hass.callService('music_assistant', 'play_media', {
      entity_id: entityId,
      media_id: mediaId,
      media_type: 'playlist',
      enqueue: 'replace',
    });
  };
  const handleVolTrack = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rawPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const pct = Math.round(rawPct / 5) * 5 / 100;
    hass.callService('media_player', 'volume_set', { entity_id: controlEntityId, volume_level: pct });
  };
  const handleMute = () => {
    hass.callService('media_player', 'volume_mute', { entity_id: controlEntityId, is_volume_muted: !isMuted });
  };
  return html`
    <section class="glass-card panel-media">
      <div class="section-title media-title-row">
        <h2>${translate('mediaPlayer')}</h2>
        ${playlistOptions.length > 0 ? html`
          <details class="media-playlist-menu">
            <summary class="media-playlist-select" aria-label="歌曲分区">
              <span>${selectedPlaylist || playlistOptions[0] || '歌曲分区'}</span>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </summary>
            <div class="media-playlist-options" role="listbox">
              ${playlistOptions.map((option) => html`
                <button
                  class="media-playlist-option ${option === selectedPlaylist ? 'active' : ''}"
                  role="option"
                  aria-selected=${option === selectedPlaylist ? 'true' : 'false'}
                  @click=${(e: Event) => {
                    const details = (e.currentTarget as HTMLElement).closest('details');
                    if (details) details.open = false;
                    void playPlaylist(option);
                  }}
                >
                  ${option === selectedPlaylist ? html`<ha-icon icon="mdi:check"></ha-icon>` : html`<span class="media-playlist-check-spacer"></span>`}
                  <span>${option}</span>
                </button>
              `)}
            </div>
          </details>
        ` : nothing}
      </div>
      <div class="media-content">
        <div class="media-row">
          ${albumArt ? html`<div class="media-cover"><img alt="" src=${albumArt}></div>` : html`<div class="media-cover media-cover-null"><ha-icon icon="mdi:music"></ha-icon></div>`}
          <div class="media-body">
            <div class="media-title">${title}</div>
            ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
            ${source ? html`<div class="media-source">${source}</div>` : ''}
            <div class="media-playback-state ${isPlaying ? 'playing' : ''}"><span></span>${playbackLabel}</div>
          </div>
          <div class="media-actions">
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_previous_track', { entity_id: entityId })} title=${translate('previous')}><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <button class="media-btn media-playbtn" @click=${() => hass.callService('media_player', isPlaying ? 'media_pause' : 'media_play', { entity_id: entityId })} title=${isPlaying ? translate('pause') : translate('play')}><ha-icon icon=${isPlaying ? 'mdi:pause-circle' : 'mdi:play-circle'}></ha-icon></button>
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_next_track', { entity_id: entityId })} title=${translate('next')}><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        </div>
        ${volPct !== undefined ? html`
        <div class="media-row media-volrow">
          <button class="media-volbtn" @click=${handleMute}><ha-icon icon=${volZero ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon></button>
          <div class="media-voltrack" @click=${handleVolTrack}><div class="media-volfill" style="width:${volPct}%"></div></div>
        </div>` : ''}
      </div>
    </section>
  `;
}
