// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 PATCH /api/account/password */
export async function accountControllerChangePassword(
  body: NestWebAPI.ChangePasswordDto,
  options?: { [key: string]: any },
) {
  return request<boolean>('/api/account/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/account/profile */
export async function accountControllerProfile(options?: { [key: string]: any }) {
  return request<NestWebAPI.UserEntity>('/api/account/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /api/account/profile */
export async function accountControllerUpdateProfile(
  body: NestWebAPI.UpdateProfileDto,
  options?: { [key: string]: any },
) {
  return request<NestWebAPI.UserEntity>('/api/account/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
