import { Tag } from 'antd';
import React from 'react';
import { formatGlobalMessage } from '@/utils/i18n';

const statusText = {
  active: () => formatGlobalMessage('common.enabled', 'Enabled'),
  disabled: () => formatGlobalMessage('pages.roles.disabled', 'Disabled'),
  resigned: () => formatGlobalMessage('pages.users.resigned', 'Resigned'),
};

const genderText = {
  male: () => formatGlobalMessage('pages.users.genderMale', 'Male'),
  female: () => formatGlobalMessage('pages.users.genderFemale', 'Female'),
};

export const userStatusFallbackOptions = [
  { label: statusText.active(), value: 'active', color: 'success' },
  { label: statusText.disabled(), value: 'disabled', color: 'error' },
  { label: statusText.resigned(), value: 'resigned', color: 'default' },
];

export const genderFallbackOptions = [
  { label: genderText.male(), value: 'Male', color: 'blue' },
  { label: genderText.female(), value: 'Female', color: 'magenta' },
];

export const userStatusValueEnum = {
  active: { text: statusText.active(), status: 'Success' },
  disabled: { text: statusText.disabled(), status: 'Error' },
  resigned: { text: statusText.resigned(), status: 'Default' },
};

export const genderValueEnum = {
  Male: genderText.male(),
  Female: genderText.female(),
  1: genderText.male(),
  0: genderText.female(),
};

export function renderUserStatus(status?: string | null) {
  if (status === 'active' || status === '1') {
    return React.createElement(Tag, { color: 'success' }, statusText.active());
  }

  if (status === 'disabled') {
    return React.createElement(Tag, { color: 'error' }, statusText.disabled());
  }

  return React.createElement(Tag, { color: 'default' }, statusText.resigned());
}
