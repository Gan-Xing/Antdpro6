// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/users */
export async function usersControllerFindAll(options?: { [key: string]: any }) {
  return request<NestWebAPI.UserEntity[]>('/api/users', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/users */
export async function usersControllerCreate(
  body: NestWebAPI.CreateUserDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.UserEntity>('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/users */
export async function usersControllerRemoveByIds(
  body: NestWebAPI.BatchIdsDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/users', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/users/${param0} */
export async function usersControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.UserEntity>(`/api/users/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/users/${param0} */
export async function usersControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.UserEntity>(`/api/users/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/users/${param0} */
export async function usersControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerUpdateParams,
  body: NestWebAPI.UpdateUserDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.UserEntity>(`/api/users/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/users/${param0}/reset-password */
export async function usersControllerResetPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerResetPasswordParams,
  body: NestWebAPI.ResetPasswordDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.UserEntity>(`/api/users/${param0}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/users/${param0}/status */
export async function usersControllerUpdateStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerUpdateStatusParams,
  body: NestWebAPI.UpdateUserStatusDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.UserEntity>(`/api/users/${param0}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/users/current */
export async function usersControllerFindCurrent(options?: { [key: string]: any }) {
  return request<NestWebAPI.UserEntity>('/api/users/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/users/page */
export async function usersControllerFindAllPaged(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.UsersControllerFindAllPagedParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/users/page', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
