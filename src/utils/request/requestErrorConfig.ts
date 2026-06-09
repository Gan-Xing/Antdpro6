import type { RequestOptions } from '@@/plugin-request/request';

import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { config } from './config';
import {
  clearSessionAndRedirect,
  ensureValidAccessToken,
  isPublicRequestUrl,
} from '@/utils/session';
import { formatGlobalMessage, getBackendLocale, getFrontendLocale } from '@/utils/i18n';

const { base_url, request_timeout } = config;

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  baseURL: base_url,
  timeout: request_timeout,
  withCredentials: false,
  errorConfig: {
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
        throw error;
      }
    },
    errorHandler: async (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      if (error.name === 'BizError') {
        const errorInfo: Common.ResponseStructure<any> | undefined = error.info;
        if (errorInfo) {
          const { message: errorMessage, statusCode } = errorInfo;
          switch (errorInfo.showType) {
            case Common.ErrorShowType.SILENT:
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
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          if (Array.isArray(error.response?.data?.message?.message)) {
            error.response?.data?.message?.message?.map((item: string) => message.error(item));
          }
          message.error(error.response?.data?.message?.message);
        } else if (status === 401) {
          try {
            const accessToken = await ensureValidAccessToken();
            if (!accessToken) {
              clearSessionAndRedirect();
            }
          } catch {
            clearSessionAndRedirect();
          }
        } else if (status === 403) {
          message.error(
            formatGlobalMessage(
              'request.error.forbidden',
              'You do not have permission to perform this action',
            ),
          );
        } else if (status === 500) {
          message.error(
            formatGlobalMessage(
              'request.error.server',
              'Server error. Please contact the administrator.',
            ),
          );
        } else {
          message.error(
            formatGlobalMessage(
              'request.error.httpStatus',
              'Request failed, HTTP status: {status}',
              {
                status: error.response.status,
              },
            ),
          );
        }
      } else if (error.request) {
        message.error(
          formatGlobalMessage(
            'request.error.network',
            'Network error or service unavailable. Check the connection and try again.',
          ),
        );
      } else {
        message.error(
          formatGlobalMessage('request.error.generic', 'Request failed. Please try again later.'),
        );
      }
    },
  },

  requestInterceptors: [
    async (config: RequestOptions) => {
      const url = config?.url;
      const headers = { ...(config.headers || {}) } as Record<string, any>;
      const isTokenRequired = headers.isToken !== false && !isPublicRequestUrl(url);
      delete headers.isToken;
      headers['x-custom-lang'] = getBackendLocale();
      headers['Accept-Language'] = getFrontendLocale();

      if (isTokenRequired) {
        try {
          const accessToken = await ensureValidAccessToken();
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          } else {
            delete headers.Authorization;
            clearSessionAndRedirect();
          }
        } catch {
          delete headers.Authorization;
          clearSessionAndRedirect();
        }
      }

      return {
        ...config,
        headers,
        url,
      };
    },
  ],

  responseInterceptors: [
    (response) => {
      const data = response?.data as Common.ResponseStructure<any>;

      if (data?.success === false) {
        message.error(formatGlobalMessage('request.error.failed', 'Request failed!'));
      }
      return response;
    },
  ],
};
