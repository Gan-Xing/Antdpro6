import { authControllerRefresh } from '@/services/nest-web/auth';
import * as authUtil from '@/utils/auth';
import {
  ensureValidAccessToken,
  isAccessTokenFresh,
  isPublicRequestUrl,
  refreshSessionToken,
} from './session';

jest.mock('@/services/nest-web/auth', () => ({
  authControllerRefresh: jest.fn(),
}));

jest.mock('@/utils/auth', () => ({
  getAccessToken: jest.fn(),
  removeToken: jest.fn(),
  setToken: jest.fn(),
}));

function base64Url(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function buildJwt(payload: Record<string, unknown>) {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.test`;
}

const token: Auth.Token = {
  accessToken: buildJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  accessExpiresIn: 3600,
  refreshExpiresIn: 7200,
};

describe('session utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects public auth and captcha requests', () => {
    expect(isPublicRequestUrl('/api/auth/login')).toBe(true);
    expect(isPublicRequestUrl('/api/auth/validateEmail')).toBe(true);
    expect(isPublicRequestUrl('/api/captcha/validate?token=abc')).toBe(true);
    expect(isPublicRequestUrl('/api/users/current')).toBe(false);
  });

  it('keeps fresh access token without refresh', async () => {
    const accessToken = buildJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    (authUtil.getAccessToken as jest.Mock).mockReturnValue(accessToken);

    await expect(ensureValidAccessToken()).resolves.toBe(accessToken);
    expect(authControllerRefresh).not.toHaveBeenCalled();
  });

  it('refreshes expired access token with a single in-flight refresh', async () => {
    (authUtil.getAccessToken as jest.Mock).mockReturnValue(buildJwt({ exp: 1 }));
    (authControllerRefresh as jest.Mock).mockResolvedValue({
      success: true,
      data: token,
    });

    await expect(
      Promise.all([ensureValidAccessToken(), ensureValidAccessToken()]),
    ).resolves.toEqual([token.accessToken, token.accessToken]);

    expect(authControllerRefresh).toHaveBeenCalledTimes(1);
    expect(authControllerRefresh).toHaveBeenCalledWith({ skipErrorHandler: true });
    expect(authUtil.setToken).toHaveBeenCalledWith(token);
  });

  it('clears local tokens when refresh fails', async () => {
    (authControllerRefresh as jest.Mock).mockRejectedValue(new Error('refresh failed'));

    await expect(refreshSessionToken()).rejects.toThrow('refresh failed');
    expect(authUtil.removeToken).toHaveBeenCalled();
  });

  it('treats malformed access tokens as stale', () => {
    expect(isAccessTokenFresh('not-a-jwt')).toBe(false);
  });
});
