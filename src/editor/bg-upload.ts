import type { HomeAssistant } from '../types';

export async function uploadBackgroundImage(
  file: File,
  hass: HomeAssistant | undefined,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const resp = await fetch('/api/image/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${hass?.auth?.data?.access_token || ''}` },
    body: formData,
  }).catch((err: unknown) => {
    throw new Error(err instanceof Error ? err.message : 'Network error');
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const item = await resp.json().catch(() => undefined) as { id?: string } | undefined;
  if (!item?.id) throw new Error('No image id returned');
  return `/api/image/serve/${item.id}/original`;
}
