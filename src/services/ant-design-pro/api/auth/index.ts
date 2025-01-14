// @ts-ignore

import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  const response = await request<{ data: User.UsersEntity }>('/users/current', {
    method: 'GET',
    ...(options || {}),
  });
  return response;
}
// data: API.CurrentUser;

/** 退出登录接口 POST /auth/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  const { email, password } = body;
  return request<Common.ResponseStructure<Auth.Token>>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email, password },
    ...(options || {}),
  });
}

/** 注册接口 POST /auth/register */
export async function register(body: API.RegisterParams, options?: { [key: string]: any }) {
  const { email, password, firstName, lastName, phoneNumber, country } = body;
  return request<Common.ResponseStructure<Auth.Token>>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      country,
      username: lastName + firstName,
    },
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

/** 获取图形验证码 */
export async function fetchCaptcha() {
  return request<{ image: string; token: string }>('/captcha', {
    method: 'GET',
  });
}
