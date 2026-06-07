// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 POST /api/auth/exchange-code-for-user */
export async function authControllerExchangeCodeForUserId(options?: { [key: string]: any }) {
  return request<any>('/api/auth/exchange-code-for-user', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/login */
export async function authControllerLogin(
  body: NestWebAPI.LoginDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.Token>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/logout */
export async function authControllerLogout(options?: { [key: string]: any }) {
  return request<any>('/api/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/miniprogram-login */
export async function authControllerMiniprogramLogin(options?: { [key: string]: any }) {
  return request<any>('/api/auth/miniprogram-login', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/refresh */
export async function authControllerRefresh(
  body: NestWebAPI.RefreshTokenDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.Token>('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/register */
export async function authControllerRegister(
  body: NestWebAPI.RegisterDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.Token>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/registerByEmail */
export async function authControllerRegisterByEmail(
  body: NestWebAPI.RegisterByEmailDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.Token>('/api/auth/registerByEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/validateCaptcha */
export async function authControllerValidateCaptchaAndInitiateEmailVerification(
  body: NestWebAPI.SignUpFormData,
  options?: { [key: string]: any },
) {
  return request<any>('/api/auth/validateCaptcha', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/validateEmail */
export async function authControllerValidateEmailToken(
  body: NestWebAPI.ValidateTokenDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/auth/validateEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/auth/validateSMS */
export async function authControllerValidateSmsToken(
  body: NestWebAPI.ValidateTokenDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/auth/validateSMS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/auth/wechat-miniprogram-qrcode */
export async function authControllerRequestQrCode(options?: { [key: string]: any }) {
  return request<any>('/api/auth/wechat-miniprogram-qrcode', {
    method: 'GET',
    ...(options || {}),
  });
}
