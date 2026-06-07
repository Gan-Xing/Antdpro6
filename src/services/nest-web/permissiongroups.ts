// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/permissiongroups */
export async function permissiongroupsControllerFindAll(options?: { [key: string]: any }) {
  return request<any>('/api/permissiongroups', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/permissiongroups */
export async function permissiongroupsControllerCreate(
  body: NestWebAPI.CreatePermissionGroupDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/permissiongroups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/permissiongroups/${param0} */
export async function permissiongroupsControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissiongroupsControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/permissiongroups/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/permissiongroups/${param0} */
export async function permissiongroupsControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissiongroupsControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/permissiongroups/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/permissiongroups/${param0} */
export async function permissiongroupsControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.PermissiongroupsControllerUpdateParams,
  body: NestWebAPI.UpdatePermissionGroupDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/permissiongroups/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
