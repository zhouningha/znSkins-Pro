import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HomeAssistant, TranslationKey } from '../types';

const PRE_MUTE_VOLUMES = new WeakMap<object, number>();
const MUSIC_SOURCE_ENTITY = 'input_select.living_room_music_source';

export function renderMediaPlayer(
  hass: HomeAssistant,
  entityId: string | undefined,
  translate: (key: TranslationKey) => string,
): TemplateResult | typeof nothing {
  if (!entityId) return nothing;
  const stateObj = hass.states?.[entityId];
  if (!stateObj) return nothing;
  const state = stateObj.state;
  const attrs = stateObj.attributes || {};
  const title = (attrs.media_title as string) || (attrs.friendly_name as string) || entityId;
  const artist = attrs.media_artist as string | undefined;
  const albumArt = attrs.entity_picture as string | undefined;
  const source = (attrs.app_name as string) || (attrs.source as string) || state;
  const isPlaying = state === 'playing';
  const sourceObj = hass.states?.[MUSIC_SOURCE_ENTITY];
  const selectedPlaylist = String(sourceObj?.state || '');
  const playlistOptions = (sourceObj?.attributes?.options as string[] | undefined) || [];
  const playPlaylist = (playlist = selectedPlaylist) => {
    if (!playlist) return;
    hass.callService('music_assistant', 'play_media', {
      entity_id: entityId,
      media_id: playlist,
      media_type: 'playlist',
      enqueue: 'replace',
    });
  };
  const selectPlaylist = (playlist: string) => {
    if (!playlist) return;
    hass.callService('input_select', 'select_option', {
      entity_id: MUSIC_SOURCE_ENTITY,
      option: playlist,
    });
    playPlaylist(playlist);
  };
  const playlistIndex = Math.max(0, playlistOptions.indexOf(selectedPlaylist));
  const currentPlaylist = playlistOptions[playlistIndex] || selectedPlaylist || playlistOptions[0] || '';
  const stepPlaylist = (delta: number) => {
    if (!playlistOptions.length) return;
    const nextIndex = (playlistIndex + delta + playlistOptions.length) % playlistOptions.length;
    const next = playlistOptions[nextIndex];
    if (next) selectPlaylist(next);
  };
  const vol = attrs.volume_level as number | undefined;
  const volZero = vol !== undefined && vol === 0;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const handleVolTrack = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: pct });
  };
  const handleMute = () => {
    if (vol !== undefined) {
      if (vol > 0) {
        PRE_MUTE_VOLUMES.set(stateObj, vol);
        hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: 0 });
      } else {
        const restored = PRE_MUTE_VOLUMES.get(stateObj) ?? 0.3;
        hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: restored });
      }
    }
  };
  return html`
    <section class="glass-card panel-media">
      <div class="section-title">
        <h2>${translate('mediaPlayer')}</h2>
        ${playlistOptions.length ? html`
          <div class="media-playlist" role="group" aria-label=${translate('mediaPlayer')}>
            <button
              type="button"
              class="media-playlist-nav media-playlist-prev"
              title=${translate('previous')}
              aria-label=${translate('previous')}
              @click=${(e: Event) => { e.stopPropagation(); stepPlaylist(-1); }}
            ><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <span class="media-playlist-label" title=${currentPlaylist}>${currentPlaylist}</span>
            <button
              type="button"
              class="media-playlist-nav media-playlist-next"
              title=${translate('next')}
              aria-label=${translate('next')}
              @click=${(e: Event) => { e.stopPropagation(); stepPlaylist(1); }}
            ><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        ` : ''}
      </div>
      <div class="media-content">
        <div class="media-row">
          ${albumArt ? html`<div class="media-cover"><img alt="" src=${albumArt}></div>` : html`<div class="media-cover media-cover-null"><ha-icon icon="mdi:music"></ha-icon></div>`}
          <div class="media-body">
            <div class="media-title">${title}</div>
            ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
            ${source ? html`<div class="media-source">${source}</div>` : ''}
          </div>
          <div class="media-actions">
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_previous_track', { entity_id: entityId })} title=${translate('previous')}><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <button class="media-btn media-playbtn" @click=${() => isPlaying ? hass.callService('media_player', 'media_pause', { entity_id: entityId }) : playPlaylist()} title=${isPlaying ? translate('pause') : translate('play')}><ha-icon icon=${isPlaying ? 'mdi:pause-circle' : 'mdi:play-circle'}></ha-icon></button>
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
