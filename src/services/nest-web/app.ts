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

/** 此处后端没有提供注释 GET /greet */
export async function appControllerGreet(options?: { [key: string]: any }) {
  return request<any>('/greet', {
    method: 'GET',
    ...(options || {}),
  });
}
