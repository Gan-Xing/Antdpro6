// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function filesControllerUpload(
  body: NestWebAPI.UploadFileAssetDto,
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  Object.entries(body || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return request<NestWebAPI.FileAssetEntity>('/api/files/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

export async function filesControllerFindAll(
  params: NestWebAPI.FilesControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/files', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function filesControllerFindOne(
  params: NestWebAPI.FilesControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.FileAssetEntity>(`/api/files/${id}`, {
    method: 'GET',
    params: queryParams,
    ...(options || {}),
  });
}

export async function filesControllerGetDownloadUrl(
  params: NestWebAPI.FilesControllerGetDownloadUrlParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.FileDownloadEntity>(`/api/files/${id}/download`, {
    method: 'GET',
    params: queryParams,
    ...(options || {}),
  });
}

export async function filesControllerRemove(
  params: NestWebAPI.FilesControllerRemoveParams,
  options?: { [key: string]: any },
) {
  const { id, ...queryParams } = params;
  return request<NestWebAPI.FileAssetEntity>(`/api/files/${id}`, {
    method: 'DELETE',
    params: queryParams,
    ...(options || {}),
  });
}
