import component from './en-US/component';
import common from './en-US/common';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.brand.name': 'Enterprise Admin Platform',
  'app.copyright.produced': 'Enterprise Admin Platform',
  'request.error.forbidden': 'You do not have permission to perform this action',
  'request.error.server': 'Server error. Please contact the administrator.',
  'request.error.httpStatus': 'Request failed, HTTP status: {status}',
  'request.error.network':
    'Network error or service unavailable. Check the connection and try again.',
  'request.error.generic': 'Request failed. Please try again later.',
  'request.error.failed': 'Request failed!',
  ...common,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
