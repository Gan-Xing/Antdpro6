// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/captcha */
export async function captchaControllerGetCaptcha(options?: { [key: string]: any }) {
  return request<any>('/api/captcha', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/captcha/validate */
export async function captchaControllerValidateCaptcha(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.CaptchaControllerValidateCaptchaParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/captcha/validate', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
