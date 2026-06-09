// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/messages */
export async function messagesControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MessagesControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.MessageListEntity>('/api/messages', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/messages/${param0}/cancel */
export async function messagesControllerCancelTodo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MessagesControllerCancelTodoParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/messages/${param0}/complete */
export async function messagesControllerCompleteTodo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MessagesControllerCompleteTodoParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/complete`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/messages/${param0}/read */
export async function messagesControllerMarkRead(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.MessagesControllerMarkReadParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/read`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/messages/read-all */
export async function messagesControllerMarkAllRead(options?: { [key: string]: any }) {
  return request<any>('/api/messages/read-all', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/messages/unread-count */
export async function messagesControllerUnreadCount(options?: { [key: string]: any }) {
  return request<NestWebAPI.MessageUnreadCountEntity>('/api/messages/unread-count', {
    method: 'GET',
    ...(options || {}),
  });
}
