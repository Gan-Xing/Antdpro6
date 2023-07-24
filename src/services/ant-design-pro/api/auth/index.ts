// @ts-ignore
/* eslint-disable */
import testAPI from '@/constants';

import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{ data: User.CurrentUser }>('/users', {
    method: 'GET',
    ...(options || {}),
  });
}
// data: API.CurrentUser;

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  const { type, email, password } = body;
  return request<Common.ResponseStructure<Auth.Token>>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email, password },
    ...(options || {}),
  });
}

export async function refreshToken(body: Auth.RefreshTokenDto, options?: { [key: string]: any }) {
  return request<Common.ResponseStructure<Auth.Token>>('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
