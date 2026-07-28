import { securityHideSavePaths } from './security-hidden';

type HassConnection = {
  sendMessagePromise: <T>(message: Record<string, unknown>) => Promise<T>;
};

export type SkinStrategyPatch = {
  skin: string;
  base_path: string;
  assets?: Record<string, string>;
  downloaded_skins?: string[];
  background_image?: string;
};

/**
 * Persist resource_pack.skin (+ base_path/assets) into the Skins Pro strategy dashboard.
 */
export async function saveSkinToHa(
  connection: HassConnection,
  patch: SkinStrategyPatch,
  pathname = window.location.pathname,
): Promise<boolean> {
  let lastError: unknown;
  for (const urlPath of securityHideSavePaths(pathname)) {
    try {
      const current = await connection.sendMessagePromise<Record<string, unknown>>({
        type: 'lovelace/config',
        url_path: urlPath,
      });
      if (!current?.strategy || typeof current.strategy !== 'object') continue;
      const strategy = current.strategy as Record<string, unknown>;
      if (!String(strategy.type || '').includes('skins-pro')) continue;

      const prevPack = typeof strategy.resource_pack === 'object' && strategy.resource_pack
        ? (strategy.resource_pack as Record<string, unknown>)
        : {};
      const prevAssets = typeof prevPack.assets === 'object' && prevPack.assets
        ? (prevPack.assets as Record<string, unknown>)
        : {};

      const nextAssets = {
        ...prevAssets,
        ...(patch.assets || {}),
      };
      if (typeof nextAssets.theme_css === 'string' && String(nextAssets.theme_css).startsWith('theme.css')) {
        nextAssets.theme_css = 'theme.css';
      }

      await connection.sendMessagePromise({
        type: 'lovelace/config/save',
        url_path: urlPath,
        config: {
          ...current,
          strategy: {
            ...strategy,
            background_image: patch.background_image ?? '',
            downloaded_skins: patch.downloaded_skins
              ?? (Array.isArray(strategy.downloaded_skins) ? strategy.downloaded_skins : undefined),
            resource_pack: {
              ...prevPack,
              skin: patch.skin,
              base_path: patch.base_path,
              assets: nextAssets,
            },
          },
        },
      });

      const verify = await connection.sendMessagePromise<Record<string, unknown>>({
        type: 'lovelace/config',
        url_path: urlPath,
      });
      const strat = (verify?.strategy && typeof verify.strategy === 'object')
        ? (verify.strategy as Record<string, unknown>)
        : {};
      const pack = (strat.resource_pack && typeof strat.resource_pack === 'object')
        ? (strat.resource_pack as Record<string, unknown>)
        : {};
      if (String(pack.skin || '') === patch.skin) return true;
      lastError = new Error(`verify mismatch on ${urlPath}`);
    } catch (error) {
      lastError = error;
    }
  }
  console.warn('[Skins Pro] resource_pack.skin save failed', lastError);
  return false;
}
