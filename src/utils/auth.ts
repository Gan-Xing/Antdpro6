import { useCache } from '@/hooks/useCache';
import { Decrypt, Encrypt } from './encrypt';
import { getLocal, removeLocals, setLocals } from 'ganxing';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { wsCache } = useCache();

enum TokenKeys {
  Access = 'ACCESS_TOKEN',
  Refresh = 'REFRESH_TOKEN',
}
// 获取token
export const getAccessToken = () => {
  return getLocal(TokenKeys.Access) as string;
};

// 刷新token
export const getRefreshToken = () => {
  return getLocal(TokenKeys.Refresh) as string;
};

// 设置token
export const setToken = (token: Auth.Token) => {
  setLocals([
    {
      key: TokenKeys.Refresh,
      value: token.refreshToken,
      expiration: token.refreshExpiresIn * 1000,
    },
    { key: TokenKeys.Access, value: token.accessToken, expiration: token.accessExpiresIn * 1000 },
  ]);
};

// 删除token
export const removeToken = () => {
  removeLocals([TokenKeys.Access, TokenKeys.Refresh]);
};

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token;
};

// ========== 账号相关 ==========

const LoginFormKey = 'LOGINFORM';

export type LoginFormType = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export const getLoginForm = () => {
  const loginForm: LoginFormType = wsCache.get(LoginFormKey);
  if (loginForm) {
    loginForm.password = Decrypt(loginForm.password) as string;
  }
  return loginForm;
};

export const setLoginForm = (loginForm: LoginFormType) => {
  loginForm.password = Encrypt(loginForm.password) as string;
  wsCache.set(LoginFormKey, loginForm, { exp: 30 * 24 * 60 * 60 });
};

export const removeLoginForm = () => {
  wsCache.delete(LoginFormKey);
};

// ========== 租户相关 ==========

const TenantIdKey = 'TENANT_ID';
const TenantNameKey = 'TENANT_NAME';

export const getTenantName = () => {
  return wsCache.get(TenantNameKey);
};

export const setTenantName = (username: string) => {
  wsCache.set(TenantNameKey, username, { exp: 30 * 24 * 60 * 60 });
};

export const removeTenantName = () => {
  wsCache.delete(TenantNameKey);
};

export const getTenantId = () => {
  return wsCache.get(TenantIdKey);
};

export const setTenantId = (username: string) => {
  wsCache.set(TenantIdKey, username);
};

export const removeTenantId = () => {
  wsCache.delete(TenantIdKey);
};
