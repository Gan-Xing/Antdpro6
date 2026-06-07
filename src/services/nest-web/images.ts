// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/images */
export async function imagesControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ImagesControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/images', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/images */
export async function imagesControllerCreate(
  body: NestWebAPI.CreateImageDto,
  options?: { [key: string]: any },
) {
  return request<any>('/api/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/images/${param0} */
export async function imagesControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ImagesControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/images/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /api/images/${param0} */
export async function imagesControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ImagesControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/images/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/images/${param0} */
export async function imagesControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ImagesControllerUpdateParams,
  body: NestWebAPI.UpdateImageDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/images/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 上传图片 POST /api/images/upload */
export async function imagesControllerUploadFile(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<any>('/api/images/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}
