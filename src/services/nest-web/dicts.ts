// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function dictsControllerCreateType(
  body: NestWebAPI.CreateDictTypeDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictTypeEntity>('/api/dicts/types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

export async function dictsControllerFindTypes(
  params: NestWebAPI.DictsControllerFindTypesParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/dicts/types', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function dictsControllerUpdateType(
  params: NestWebAPI.DictsControllerUpdateTypeParams,
  body: NestWebAPI.UpdateDictTypeDto,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.DictTypeEntity>(`/api/dicts/types/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    params: queryParams,
    data: body,
    ...(options || {}),
  });
}

export async function dictsControllerRemoveType(
  params: NestWebAPI.DictsControllerRemoveTypeParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.DictTypeEntity>(`/api/dicts/types/${id}`, {
    method: 'DELETE',
    params: queryParams,
    ...(options || {}),
  });
}

export async function dictsControllerCreateItem(
  body: NestWebAPI.CreateDictItemDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictItemEntity>('/api/dicts/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

export async function dictsControllerFindItems(
  params: NestWebAPI.DictsControllerFindItemsParams,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.DictItemEntity[]>('/api/dicts/items', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function dictsControllerFindItemsByTypeCode(
  params: NestWebAPI.DictsControllerFindItemsByTypeCodeParams,
  options?: { [key: string]: any },
) {
  const { code, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity[]>(`/api/dicts/${code}/items`, {
    method: 'GET',
    params: queryParams,
    ...(options || {}),
  });
}

export async function dictsControllerUpdateItem(
  params: NestWebAPI.DictsControllerUpdateItemParams,
  body: NestWebAPI.UpdateDictItemDto,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity>(`/api/dicts/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    params: queryParams,
    data: body,
    ...(options || {}),
  });
}

export async function dictsControllerRemoveItem(
  params: NestWebAPI.DictsControllerRemoveItemParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.DictItemEntity>(`/api/dicts/items/${id}`, {
    method: 'DELETE',
    params: queryParams,
    ...(options || {}),
  });
}
