import { request } from '@umijs/max';
import type { API } from './typings';

export * from './common';
export * from './auth';
export * from './rules';

/** 获取图片列表 GET /api/images */
export async function getImages(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<API.PageResult<Images.Entity>>>('/api/images', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建图片 POST /api/images */
export async function addImage(data: Images.CreateParams, options?: { [key: string]: any }) {
  return request<API.Response<Images.Entity>>('/api/images', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** 更新图片 PUT /api/images/:id */
export async function updateImage(
  id: number,
  data: Images.UpdateParams,
  options?: { [key: string]: any },
) {
  return request<API.Response<Images.Entity>>(`/api/images/${id}`, {
    method: 'PUT',
    data,
    ...(options || {}),
  });
}

/** 删除图片 DELETE /api/images/:id */
export async function deleteImage(id: number, options?: { [key: string]: any }) {
  return request<API.Response<any>>(`/api/images/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 上传图片 POST /api/images/upload */
export async function uploadImage(formData: FormData, options?: { [key: string]: any }) {
  return request<API.Response<any>>('/api/images/upload', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  });
}
