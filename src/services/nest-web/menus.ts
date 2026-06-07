// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/menus */
export async function menusControllerFindAllPaged(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MenusControllerFindAllPagedParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/menus', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/menus */
export async function menusControllerCreate(
  body: NestWebAPI.CreateMenuDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/menus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/menus */
export async function menusControllerRemoveByIds(
  body: NestWebAPI.BatchIdsDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/menus', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/menus/${param0} */
export async function menusControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MenusControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/menus/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/menus/${param0} */
export async function menusControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MenusControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/menus/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/menus/${param0} */
export async function menusControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MenusControllerUpdateParams,
  body: NestWebAPI.UpdateMenuDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/menus/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/menus/user */
export async function menusControllerFindUserMenus(options?: { [key: string]: any }) {
  return request<any>('/api/menus/user', {
    method: 'GET',
    ...(options || {}),
  });
}
