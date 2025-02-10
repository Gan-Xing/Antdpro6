declare namespace API {
  type SystemLog = {
    id: number;
    username: string;
    country: string;
    city: string;
    isp: string;
    requestDescription: string;
    duration: number;
    success: boolean;
    createdAt: string;
  };

  type SystemLogList = {
    data: SystemLog[];
    total: number;
    page: number;
    pageSize: number;
  };

  type QueryLogParams = {
    userId?: number;
    username?: string;
    requestUrl?: string;
    method?: string;
    status?: number;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number;
  };

  type ClearLogsResult = {
    message: string;
    count: number;
  };
}
