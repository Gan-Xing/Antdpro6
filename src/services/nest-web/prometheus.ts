// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /metrics */
export async function prometheusControllerIndex(options?: { [key: string]: any }) {
  return request<any>('/metrics', {
    method: 'GET',
    ...(options || {}),
  });
}
