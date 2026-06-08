import { Tag } from 'antd';
import React from 'react';

export const userStatusValueEnum = {
  active: { text: '启用', status: 'Success' },
  disabled: { text: '禁用', status: 'Error' },
  resigned: { text: '离职', status: 'Default' },
};

export const genderValueEnum = {
  Male: '男',
  Female: '女',
  1: '男',
  0: '女',
};

export function renderUserStatus(status?: string | null) {
  if (status === 'active' || status === '1') {
    return React.createElement(Tag, { color: 'success' }, '启用');
  }

  if (status === 'disabled') {
    return React.createElement(Tag, { color: 'error' }, '禁用');
  }

  return React.createElement(Tag, { color: 'default' }, '离职');
}
