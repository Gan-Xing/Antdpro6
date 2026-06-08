// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 查询消息 GET /api/messages */
export async function messagesControllerFindAll(
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

/** 查询未读消息数 GET /api/messages/unread-count */
export async function messagesControllerUnreadCount(options?: { [key: string]: any }) {
  return request<NestWebAPI.MessageUnreadCountEntity>('/api/messages/unread-count', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 全部通知标记已读 POST /api/messages/read-all */
export async function messagesControllerMarkAllRead(options?: { [key: string]: any }) {
  return request<any>('/api/messages/read-all', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 消息标记已读 POST /api/messages/${param0}/read */
export async function messagesControllerMarkRead(
  params: NestWebAPI.MessagesControllerMessageActionParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/read`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 完成待办 POST /api/messages/${param0}/complete */
export async function messagesControllerCompleteTodo(
  params: NestWebAPI.MessagesControllerMessageActionParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/complete`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 取消待办 POST /api/messages/${param0}/cancel */
export async function messagesControllerCancelTodo(
  params: NestWebAPI.MessagesControllerMessageActionParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.MessageEntity>(`/api/messages/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
