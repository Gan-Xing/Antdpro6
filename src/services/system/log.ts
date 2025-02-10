import { request } from '@umijs/max';

/** 查询日志列表 */
export async function queryLogs(params: API.QueryLogParams) {
  return request<API.SystemLogList>('/system-log', {
    method: 'GET',
    params,
  });
}

/** 清理日志 */
export async function clearLogs(days: number) {
  return request<API.ClearLogsResult>('/system-log/clear', {
    method: 'DELETE',
    params: { days },
  });
}

/** 导出日志 */
export async function exportLogs(params?: API.QueryLogParams) {
  return request<API.SystemLog[]>('/system-log/export', {
    method: 'GET',
    params,
  });
}

/** 获取日志详情 */
export async function getLogDetail(id: number) {
  return request<API.SystemLog>(`/system-log/${id}`, {
    method: 'GET',
  });
}
