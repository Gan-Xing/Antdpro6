// @ts-ignore
/* eslint-disable */

declare namespace API {
  type LoginResult = {
    refreshToken?: string;
    success?: boolean;
    token?: string;
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type RefreshResult = {
    refreshToken?: string;
    success?: boolean;
    token?: string;
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type UsersListItem = {
    name?: string;
    id?: number;
    username?: string;
    gender?: string;
    isAdmin?: boolean;
    email?: string;
    status?: string;
    roles?: any[];
    createdAt?: string;
    permissions?: { id: number }[];
  };

  type UsersList = {
    data?: UsersListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email: string;
    password: string;
    type?: string;
  };

  type RegisterParams = {
    email: string;
    password: string;
    lastName: string; // 姓
    firstName: string; // 名
    phoneNumber: string;
    country?: string;
  };

  type LoginParams = {
    username?: string;
    email?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
  type Response<T = any> = {
    success: boolean;
    data: T;
    message?: string;
  };

  type PageResult<T> = {
    data: T[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
}
declare namespace Images {
  type Thumbnail = {
    size: string;
    url: string;
    path: string;
  };

  type Entity = {
    id: number;
    description?: string;
    area?: string;
    photos: string[];
    thumbnails?: Thumbnail[];
    location?: {
      latitude: number;
      longitude: number;
    };
    stakeNumber?: string;
    offset?: string;
    category?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    createdById: number;
    createdBy: {
      id: number;
      username: string;
      avatar?: string;
    };
  };
}
