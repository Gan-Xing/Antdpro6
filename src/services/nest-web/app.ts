// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET / */
export async function appControllerGetHello(options?: { [key: string]: any }) {
  return request<any>('/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health */
export async function appControllerGetHealth(options?: { [key: string]: any }) {
  return request<any>('/api/health', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/live */
export async function appControllerGetLiveness(options?: { [key: string]: any }) {
  return request<any>('/api/health/live', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/health/ready */
export async function appControllerGetReadiness(options?: { [key: string]: any }) {
  return request<any>('/api/health/ready', {
    method: 'GET',
    ...(options || {}),
  });
}
