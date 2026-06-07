// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/roles */
export async function rolesControllerFindAll(options?: { [key: string]: any }) {
  return request<NestWebAPI.RoleEntity[]>('/api/roles', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/roles */
export async function rolesControllerCreate(
  body: NestWebAPI.CreateRoleDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.RoleEntity>('/api/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/roles */
export async function rolesControllerRemoveMany(options?: { [key: string]: any }) {
  return request<NestWebAPI.RoleEntity>('/api/roles', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/roles/${param0} */
export async function rolesControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.RolesControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.RoleEntity>(`/api/roles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/roles/${param0} */
export async function rolesControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.RolesControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.RoleEntity>(`/api/roles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/roles/${param0} */
export async function rolesControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.RolesControllerUpdateParams,
  body: NestWebAPI.UpdateRoleDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.RoleEntity>(`/api/roles/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
