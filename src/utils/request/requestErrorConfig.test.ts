import { errorConfig } from './requestErrorConfig';
import {
  clearSessionAndRedirect,
  ensureValidAccessToken,
  isPublicRequestUrl,
} from '@/utils/session';

jest.mock('@/utils/session', () => ({
  clearSessionAndRedirect: jest.fn(),
  ensureValidAccessToken: jest.fn(),
  isPublicRequestUrl: jest.fn(),
}));

describe('request session interceptor', () => {
  const interceptor = errorConfig.requestInterceptors?.[0] as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (isPublicRequestUrl as jest.Mock).mockReturnValue(false);
  });

  it('keeps existing headers and attaches bearer token', async () => {
    (ensureValidAccessToken as jest.Mock).mockResolvedValue('access-token');

    const result = await interceptor({
      url: '/api/users/current',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer access-token',
    });
  });

  it('does not send Bearer undefined when no token is available', async () => {
    (ensureValidAccessToken as jest.Mock).mockResolvedValue(undefined);

    const result = await interceptor({
      url: '/api/users/current',
      headers: {},
    });

    expect(result.headers.Authorization).toBeUndefined();
    expect(clearSessionAndRedirect).toHaveBeenCalled();
  });

  it('does not attach auth headers for public requests', async () => {
    (isPublicRequestUrl as jest.Mock).mockReturnValue(true);

    const result = await interceptor({
      url: '/api/auth/login',
      headers: {
        isToken: false,
      },
    });

    expect(result.headers.Authorization).toBeUndefined();
    expect(result.headers.isToken).toBeUndefined();
    expect(ensureValidAccessToken).not.toHaveBeenCalled();
  });
});
