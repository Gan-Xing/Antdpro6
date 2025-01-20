import type { MenuDataItem } from '@ant-design/pro-components';
import { request } from '@umijs/max';

interface menuResponse {
  success: boolean;
  data: MenuDataItem[];
}

// 原有的通用响应格式
export interface CommonResponseStructure<T> {
  success: boolean;
  data: T[];
  total?: number;
}

// 图片管理的响应格式
export interface PhotoLogResponseStructure<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  data: {
    data: T[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
  success: boolean;
  showType: number;
}

// 原有的通用列表查询方法
export async function queryList(
  url: string,
  params?: {
    current?: number;
    pageSize?: number;
  },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  return request<CommonResponseStructure<any>>(url, {
    method: 'GET',
    params: {
      ...params,
      sorter: sort,
      ...filter,
    },
  });
}

// 图片管理专用的查询方法
export async function queryPhotoLogs<T>(
  url: string,
  params?: {
    current?: number;
    pageSize?: number;
    [key: string]: any;
  },
  options?: { [key: string]: any },
) {
  return request<PhotoLogResponseStructure<T>>(url, {
    method: 'GET',
    params: {
      ...params,
      ...(options || {}),
    },
  });
}

// 原有的创建方法
export async function addItems(url: string, options?: { [key: string]: any }) {
  return request(url, {
    method: 'POST',
    data: {
      ...(options || {}),
    },
  });
}

// 图片管理专用的创建方法
export async function addPhotoLog<T>(url: string, data: T) {
  return request<PhotoLogResponseStructure<T>>(`${url}`, {
    method: 'POST',
    data,
  });
}

// 原有的更新方法
export async function updateItem(url: string, options?: { [key: string]: any }) {
  return request(url, {
    method: 'PATCH',
    data: {
      ...(options || {}),
    },
  });
}

// 图片管理专用的更新方法
export async function updatePhotoLog<T>(url: string, data: T) {
  return request<PhotoLogResponseStructure<T>>(`${url}`, {
    method: 'PATCH',
    data,
  });
}

// 原有的删除方法
export async function removeItem(url: string, options?: { [key: string]: any }) {
  return request(url, {
    method: 'DELETE',
    data: {
      ...(options || {}),
    },
  });
}

// 图片管理专用的删除方法
export async function removePhotoLog(url: string, data: { ids: number[] }) {
  return request<PhotoLogResponseStructure<any>>(`${url}`, {
    method: 'DELETE',
    data,
  });
}

/** 获取当前用户的目录 GET /menu */
export async function fetchMenuData() {
  return request<menuResponse>('/menus/user', {
    method: 'GET',
  });
}
