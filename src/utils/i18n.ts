import { getIntl, getLocale, setLocale } from '@umijs/max';

export const SUPPORTED_FRONTEND_LOCALES = ['zh-CN', 'en-US'] as const;

export type SupportedFrontendLocale = (typeof SUPPORTED_FRONTEND_LOCALES)[number];

const BACKEND_LOCALE_MAP: Record<SupportedFrontendLocale, 'zh' | 'en'> = {
  'zh-CN': 'zh',
  'en-US': 'en',
};

export const normalizeFrontendLocale = (locale?: string): SupportedFrontendLocale => {
  if (locale?.startsWith('en')) {
    return 'en-US';
  }
  return 'zh-CN';
};

export const getFrontendLocale = (): SupportedFrontendLocale =>
  normalizeFrontendLocale(getLocale());

export const getBackendLocale = (): 'zh' | 'en' => BACKEND_LOCALE_MAP[getFrontendLocale()];

export const switchFrontendLocale = (locale: SupportedFrontendLocale) => {
  setLocale(locale, true);
};

export const formatGlobalMessage = (
  id: string,
  defaultMessage: string,
  values?: Record<string, string | number | boolean | null | undefined>,
) => {
  try {
    return getIntl(getFrontendLocale()).formatMessage({ id, defaultMessage }, values);
  } catch {
    return defaultMessage;
  }
};
