// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/permissions */
export async function permissionsControllerFindAll(options?: { [key: string]: any }) {
  return request<NestWebAPI.PermissionEntity[]>('/api/permissions', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/permissions */
export async function permissionsControllerCreate(
  body: NestWebAPI.CreatePermissionDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.PermissionEntity>('/api/permissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/permissions */
export async function permissionsControllerRemoveMany(
  body: NestWebAPI.BatchIdsDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.PermissionEntity>('/api/permissions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/permissions/${param0} */
export async function permissionsControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissionsControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.PermissionEntity>(`/api/permissions/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/permissions/${param0} */
export async function permissionsControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissionsControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.PermissionEntity>(`/api/permissions/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/permissions/${param0} */
export async function permissionsControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissionsControllerUpdateParams,
  body: NestWebAPI.UpdatePermissionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.PermissionEntity>(`/api/permissions/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
