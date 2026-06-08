// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 查询审批请求 GET /api/approval-requests */
export async function approvalRequestsControllerFindAll(
  params: NestWebAPI.ApprovalRequestsControllerFindAllParams,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.ApprovalRequestListEntity>('/api/approval-requests', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建审批请求 POST /api/approval-requests */
export async function approvalRequestsControllerCreate(
  body: NestWebAPI.CreateApprovalRequestDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.ApprovalRequestEntity>('/api/approval-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取审批请求详情 GET /api/approval-requests/${param0} */
export async function approvalRequestsControllerFindOne(
  params: NestWebAPI.ApprovalRequestsControllerFindOneParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ApprovalRequestEntity>(`/api/approval-requests/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 通过审批请求 POST /api/approval-requests/${param0}/approve */
export async function approvalRequestsControllerApprove(
  params: NestWebAPI.ApprovalRequestsControllerActionParams,
  body: NestWebAPI.ApprovalActionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ApprovalRequestEntity>(`/api/approval-requests/${param0}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 驳回审批请求 POST /api/approval-requests/${param0}/reject */
export async function approvalRequestsControllerReject(
  params: NestWebAPI.ApprovalRequestsControllerActionParams,
  body: NestWebAPI.ApprovalActionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ApprovalRequestEntity>(`/api/approval-requests/${param0}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 取消审批请求 POST /api/approval-requests/${param0}/cancel */
export async function approvalRequestsControllerCancel(
  params: NestWebAPI.ApprovalRequestsControllerActionParams,
  body: NestWebAPI.ApprovalActionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ApprovalRequestEntity>(`/api/approval-requests/${param0}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 评论审批请求 POST /api/approval-requests/${param0}/comment */
export async function approvalRequestsControllerComment(
  params: NestWebAPI.ApprovalRequestsControllerActionParams,
  body: NestWebAPI.ApprovalActionDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<NestWebAPI.ApprovalRequestEntity>(`/api/approval-requests/${param0}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
