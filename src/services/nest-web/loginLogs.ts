// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/security/login-logs */
export async function loginLogsControllerFindAll(
  params: NestWebAPI.LoginLogsControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/security/login-logs', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/security/login-logs/${param0} */
export async function loginLogsControllerFindOne(
  params: NestWebAPI.LoginLogsControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.LoginLogEntity>(`/api/security/login-logs/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
