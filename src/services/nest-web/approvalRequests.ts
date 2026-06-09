// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/approval-requests */
export async function approvalRequestsControllerFindAll(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
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

/** 此处后端没有提供注释 POST /api/approval-requests */
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

/** 此处后端没有提供注释 GET /api/approval-requests/${param0} */
export async function approvalRequestsControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
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

/** 此处后端没有提供注释 POST /api/approval-requests/${param0}/approve */
export async function approvalRequestsControllerApprove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ApprovalRequestsControllerApproveParams,
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

/** 此处后端没有提供注释 POST /api/approval-requests/${param0}/cancel */
export async function approvalRequestsControllerCancel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ApprovalRequestsControllerCancelParams,
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

/** 此处后端没有提供注释 POST /api/approval-requests/${param0}/comment */
export async function approvalRequestsControllerComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ApprovalRequestsControllerCommentParams,
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

/** 此处后端没有提供注释 POST /api/approval-requests/${param0}/reject */
export async function approvalRequestsControllerReject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: NestWebAPI.ApprovalRequestsControllerRejectParams,
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
