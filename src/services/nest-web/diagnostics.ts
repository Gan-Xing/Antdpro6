// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/diagnostics/redis */
export async function diagnosticsControllerCheckRedis(options?: { [key: string]: any }) {
  return request<any>('/api/diagnostics/redis', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/diagnostics/sms */
export async function diagnosticsControllerTestSms(
  body: NestWebAPI.TestSmsDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/diagnostics/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
