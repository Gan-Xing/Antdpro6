import { authControllerRefresh } from '@/services/nest-web/auth';
import * as authUtil from '@/utils/auth';
import { unwrapResponse } from '@/utils/apiResponse';
import { jwtDecode } from 'jwt-decode';

export const loginPath = '/user/login';

const refreshSkewMs = 10_000;
const publicRequestPaths = [
  '/api/auth/exchange-code-for-user',
  '/api/auth/login',
  '/api/auth/miniprogram-login',
  '/api/auth/refresh',
  '/api/auth/register',
  '/api/auth/registerByEmail',
  '/api/auth/validateCaptcha',
  '/api/auth/validateEmail',
  '/api/auth/validateSMS',
  '/api/auth/wechat-miniprogram-qrcode',
];
const publicRequestPrefixes = ['/api/captcha'];

let refreshSessionPromise: Promise<Auth.Token | undefined> | undefined;

function getRequestPath(url?: string) {
  if (!url) {
    return '';
  }

  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    const queryIndex = url.indexOf('?');
    return queryIndex >= 0 ? url.slice(0, queryIndex) : url;
  }
}

export function isPublicRequestUrl(url?: string) {
  const path = getRequestPath(url);

  return (
    publicRequestPaths.includes(path) ||
    publicRequestPrefixes.some((prefix) => path.startsWith(prefix))
  );
}

export function isAccessTokenFresh(accessToken?: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decodedToken = jwtDecode<{ exp?: number }>(accessToken);
    if (!decodedToken.exp) {
      return false;
    }

    return decodedToken.exp * 1000 > Date.now() + refreshSkewMs;
  } catch {
    return false;
  }
}

export async function refreshSessionToken() {
  const refreshToken = authUtil.getRefreshToken();
  if (!refreshToken) {
    return undefined;
  }

  if (!refreshSessionPromise) {
    refreshSessionPromise = authControllerRefresh({ refreshToken }, { skipErrorHandler: true })
      .then((response) => {
        const token = unwrapResponse<Auth.Token>(response as any);
        if (token?.accessToken) {
          authUtil.setToken(token);
          return token;
        }

        authUtil.removeToken();
        return undefined;
      })
      .catch((error) => {
        authUtil.removeToken();
        throw error;
      })
      .finally(() => {
        refreshSessionPromise = undefined;
      });
  }

  return refreshSessionPromise;
}

export async function ensureValidAccessToken() {
  const accessToken = authUtil.getAccessToken();
  if (isAccessTokenFresh(accessToken)) {
    return accessToken;
  }

  const refreshedToken = await refreshSessionToken();
  return refreshedToken?.accessToken;
}

export function clearSessionAndRedirect() {
  authUtil.removeToken();

  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname === loginPath) {
    return;
  }

  const redirect = `${window.location.pathname}${window.location.search}`;
  window.location.href = `${loginPath}?redirect=${encodeURIComponent(redirect)}`;
}
