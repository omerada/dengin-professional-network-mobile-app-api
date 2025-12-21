// src/config/index.ts
export { ENV } from './env';
export { APP_CONFIG } from './app';
export {
  LINKING_CONFIG,
  URL_SCHEMES,
  URL_PREFIXES,
  buildDeepLink,
  buildWebUrl,
  openDeepLink,
  parseDeepLink,
  getShareablePostUrl,
  getShareableProfileUrl,
} from './deepLinking';
