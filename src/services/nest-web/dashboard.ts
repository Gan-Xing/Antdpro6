// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function dashboardControllerSummary(options?: { [key: string]: any }) {
  return request<NestWebAPI.DashboardSummaryEntity>('/api/dashboard/summary', {
    method: 'GET',
    ...(options || {}),
  });
}
