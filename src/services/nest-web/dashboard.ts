// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api/dashboard/summary */
export async function dashboardControllerSummary(options?: { [key: string]: any }) {
  return request<NestWebAPI.DashboardSummaryEntity>('/api/dashboard/summary', {
    method: 'GET',
    ...(options || {}),
  });
}
