// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/system/status */
export async function systemControllerGetStatus(options?: { [key: string]: any }) {
  return request<NestWebAPI.SystemStatusEntity>('/api/system/status', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/system/version */
export async function systemControllerGetVersion(options?: { [key: string]: any }) {
  return request<NestWebAPI.SystemVersionEntity>('/api/system/version', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/system/queues */
export async function systemControllerGetQueues(options?: { [key: string]: any }) {
  return request<NestWebAPI.SystemQueuesEntity>('/api/system/queues', {
    method: 'GET',
    ...(options || {}),
  });
}
