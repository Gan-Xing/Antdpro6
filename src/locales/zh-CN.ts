import component from './zh-CN/component';
import common from './zh-CN/common';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.brand.name': '企业管理平台',
  'app.copyright.produced': '企业管理平台',
  'request.error.forbidden': '当前操作没有权限',
  'request.error.server': '服务器问题，请联系管理员处理',
  'request.error.httpStatus': '请求失败，HTTP 状态码：{status}',
  'request.error.network': '网络异常或服务未响应，请检查连接后重试。',
  'request.error.generic': '请求失败，请稍后重试。',
  'request.error.failed': '请求失败！',
  ...common,
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
};
