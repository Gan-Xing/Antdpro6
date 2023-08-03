import type { RequestOptions } from '@@/plugin-request/request';

import * as authUtil from '@/utils/auth';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import jwt_decode from 'jwt-decode';
import { config } from './config';
// import errorCode from './errorCode';
// import { useRequest } from 'umi';
import { refreshToken } from '@/services/ant-design-pro/api';

const { base_url, request_timeout } = config;
// const ignoreMsgs = [
//   '无效的刷新令牌', // 刷新令牌被删除时，不用提示
//   '刷新令牌已过期', // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
// ];
// let requestList: any[] = [];
// 是否正在刷新中
// let isRefreshToken = false;
// 请求白名单，无须token的接口
const whiteList: string[] = ['/auth/login', '/auth/refresh'];
/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
console.log('console.log(base_url', base_url);
export const errorConfig: RequestConfig = {
  baseURL: base_url, // api 的 base_url
  timeout: request_timeout, // 请求超时时间
  withCredentials: false, // 禁用 Cookie 等信息
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const {
        success,
        data,
        statusCode,
        message: errorMessage,
        showType,
      } = res as unknown as Common.ResponseStructure<any>;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { statusCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: Common.ResponseStructure<any> | undefined = error.info;
        if (errorInfo) {
          const { message: errorMessage, statusCode } = errorInfo;
          switch (errorInfo.showType) {
            case Common.ErrorShowType.SILENT:
              // do nothing
              break;
            case Common.ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case Common.ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case Common.ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: statusCode,
              });
              break;
            case Common.ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    async (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const url = config?.url;
      let isToken = (config!.headers || {}).isToken === false;
      // eslint-disable-next-line array-callback-return
      whiteList.some((v) => {
        if (config.url) {
          if (config.url.indexOf(v) > -1) {
            isToken = false;
            return true; // 结束 .some 的遍历
          }
        }
      });
      const accessToken = authUtil.getAccessToken();
      let newToken;
      if (accessToken && !isToken) {
        const currentDate = new Date();
        const decodedToken = jwt_decode<{ exp: number }>(accessToken);
        // expired
        if (decodedToken.exp * 1000 < currentDate.getTime()) {
          // sent refresh token
          const response = await refreshToken({
            refreshToken: authUtil.getRefreshToken(),
          });
          if (response?.success) {
            authUtil.setToken(response?.data);
            newToken = response?.data.accessToken;
          }
        }
      }

      // // refresh token
      // if (accessToken) {
      //   const currentDate = new Date();
      //   const decodedToken = jwt_decode<{ exp: number }>(accessToken);
      //   // expired
      //   if (decodedToken.exp * 1000 < currentDate.getTime()) {
      //     // sent refresh token
      //     const response = await refreshToken({
      //       refreshToken: authUtil.getRefreshToken(),
      //     });
      //     if (response?.success) {
      //       authUtil.setToken(response?.data);
      //       newToken = response?.data.accessToken;
      //     }
      //   }
      // }
      return {
        ...config,
        headers: { Authorization: `Bearer ${newToken ?? accessToken}` },
        url,
      };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const data = response?.data as Common.ResponseStructure<any>;

      if (data?.success === false) {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};
