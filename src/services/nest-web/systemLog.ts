// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/system-log */
export async function systemLogControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.SystemLogControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/system-log', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/system-log/${param0} */
export async function systemLogControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.SystemLogControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/system-log/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/system-log/clear */
export async function systemLogControllerClear(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.SystemLogControllerClearParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/system-log/clear', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/system-log/export */
export async function systemLogControllerExport(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.SystemLogControllerExportParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/system-log/export', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
