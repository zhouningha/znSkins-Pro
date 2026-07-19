import type { HomeAssistant } from '../types';

export async function runScene(hass: HomeAssistant | undefined, entityId: string): Promise<void> {
  const domain = entityId.split('.')[0] || 'scene';
  const serviceDomain = domain === 'script' ? 'script' : 'scene';
  await hass?.callService(serviceDomain, 'turn_on', { entity_id: entityId });
}

export async function toggleEntity(hass: HomeAssistant | undefined, entityId: string): Promise<void> {
  if (!hass) return;
  const [domain] = entityId.split('.');
  if (!domain) return;
  await hass.callService(domain, 'toggle', { entity_id: entityId });
}

export function moreInfo(element: HTMLElement, entityId: string): void {
  element.dispatchEvent(new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  }));
}

export function navigatePath(path: string): void {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('location-changed'));
}

export function turnOffAreaType(hass: HomeAssistant | undefined, entityIds: string[]): void {
  if (!hass || entityIds.length === 0) return;
  const byDomain = new Map<string, string[]>();
  for (const eid of entityIds) {
    const domain = eid.split('.')[0] || '';
    if (!domain) continue;
    const list = byDomain.get(domain) || [];
    list.push(eid);
    byDomain.set(domain, list);
  }
  for (const [domain, ids] of byDomain) {
    const service = domain === 'lock' ? 'lock' : 'turn_off';
    void hass.callService(domain, service, { entity_id: ids });
  }
}
