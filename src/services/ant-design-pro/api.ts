// @ts-ignore
/* eslint-disable */
import testAPI from '@/constants';
import { request } from '@umijs/max';
/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  if (testAPI) {
    return request<API.CurrentUser>('/users/profile', {
      method: 'GET',
      ...(options || {}),
    });
  } else {
    return request<{
      data: API.CurrentUser;
    }>('/api/currentUser', {
      method: 'GET',
      ...(options || {}),
    });
  }
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  const { type, email, password } = body;
  if (testAPI) {
    return request<API.LoginResult>('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { email, password },
      ...(options || {}),
    });
  } else {
    return request<API.LoginResult>('/api/login/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    });
  }
}

export async function refreshToken(body: API.refreshParams, options?: { [key: string]: any }) {
  return request<API.RefreshResult>('/users/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取列表 GET /api/users */
export async function queryList(
  url: string,
  params?: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  sort?: { [key: string]: any },
  filter?: { [key: string]: any },
) {
  return request<API.UsersList>(url, {
    method: 'GET',
    params: {
      ...params,
      sorter: sort,
      ...filter,
    },
  });
}
/** 新建规则 POST /api/rule */
export async function addItems(url: string, options?: { [key: string]: any }) {
  return request<API.UsersListItem>(url, {
    method: 'POST',
    data: {
      ...(options || {}),
    },
  });
}
/** 新建规则 PUT /api/rule */
export async function updateItem(url: string, options?: { [key: string]: any }) {
  return request<API.RuleListItem>(url, {
    method: 'PUT',
    data: {
      ...(options || {}),
    },
  });
}
/** 删除规则 DELETE /api/rule */
export async function removeItem(url: string, options?: { [key: string]: any }) {
  return request<Record<string, any>>(url, {
    method: 'DELETE',
    data: {
      ...(options || {}),
    },
  });
}
