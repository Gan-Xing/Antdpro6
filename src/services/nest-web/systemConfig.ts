// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function systemConfigControllerFindAll(
  params: NestWebAPI.SystemConfigControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/system-config', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function systemConfigControllerFindOne(
  params: NestWebAPI.SystemConfigControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.SystemConfigEntity>(`/api/system-config/${id}`, {
    method: 'GET',
    params: queryParams,
    ...(options || {}),
  });
}

export async function systemConfigControllerUpdate(
  params: NestWebAPI.SystemConfigControllerUpdateParams,
  body: NestWebAPI.UpdateSystemConfigDto,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.SystemConfigEntity>(`/api/system-config/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    params: queryParams,
    data: body,
    ...(options || {}),
  });
}
