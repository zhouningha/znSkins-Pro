import type { HomeAssistant } from '../types';

export async function uploadBackgroundImage(
  file: File,
  hass: HomeAssistant | undefined,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const resp = await fetch('/api/image/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hass?.auth?.data?.access_token || ''}` },
      body: formData,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const item = await resp.json();
    if (item?.id) {
      return `/api/image/serve/${item.id}/original`;
    }
    throw new Error('No id in response');
  } catch {
    return await readFileAsDataURL(file);
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
