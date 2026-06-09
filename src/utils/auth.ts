import { getLocal, removeLocals, setLocals } from 'ganxing';

enum TokenKeys {
  Access = 'ACCESS_TOKEN',
  LegacyRefresh = 'REFRESH_TOKEN',
}
// 获取token
export const getAccessToken = () => {
  return getLocal(TokenKeys.Access) as string;
};

// 设置token
export const setToken = (token: Auth.Token) => {
  removeLocals([TokenKeys.LegacyRefresh]);
  setLocals([
    { key: TokenKeys.Access, value: token.accessToken, expiration: token.accessExpiresIn * 1000 },
  ]);
};

// 删除token
export const removeToken = () => {
  removeLocals([TokenKeys.Access, TokenKeys.LegacyRefresh]);
};

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token;
};
