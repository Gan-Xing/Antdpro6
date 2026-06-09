// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/dicts/${param0}/items */
export async function dictsControllerFindItemsByTypeCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerFindItemsByTypeCodeParams,
  options?: { [key: string]: any },
) {
  const { code: param0, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity[]>(`/api/dicts/${param0}/items`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/dicts/items */
export async function dictsControllerFindItems(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerFindItemsParams,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictItemEntity[]>('/api/dicts/items', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/dicts/items */
export async function dictsControllerCreateItem(
  body: NestWebAPI.CreateDictItemDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictItemEntity>('/api/dicts/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/dicts/items/${param0} */
export async function dictsControllerRemoveItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerRemoveItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity>(`/api/dicts/items/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/dicts/items/${param0} */
export async function dictsControllerUpdateItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerUpdateItemParams,
  body: NestWebAPI.UpdateDictItemDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity>(`/api/dicts/items/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/dicts/types */
export async function dictsControllerFindTypes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerFindTypesParams,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictTypeEntity[]>('/api/dicts/types', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/dicts/types */
export async function dictsControllerCreateType(
  body: NestWebAPI.CreateDictTypeDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictTypeEntity>('/api/dicts/types', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/dicts/types/${param0} */
export async function dictsControllerFindType(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerFindTypeParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.DictTypeEntity>(`/api/dicts/types/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/dicts/types/${param0} */
export async function dictsControllerRemoveType(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerRemoveTypeParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.DictTypeEntity>(`/api/dicts/types/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/dicts/types/${param0} */
export async function dictsControllerUpdateType(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.DictsControllerUpdateTypeParams,
  body: NestWebAPI.UpdateDictTypeDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.DictTypeEntity>(`/api/dicts/types/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
