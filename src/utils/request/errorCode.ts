import { formatGlobalMessage } from '@/utils/i18n';

type ErrorCodeType = {
  '401': string;
  '403': string;
  '404': string;
  default: string;
  [key: string]: string;
};

const errorCode: ErrorCodeType = {
  '401': formatGlobalMessage(
    'common.error.401',
    'Authentication failed. System resources cannot be accessed.',
  ),
  '403': formatGlobalMessage(
    'common.error.403',
    'You do not have permission to perform this action.',
  ),
  '404': formatGlobalMessage('common.error.404', 'The requested resource does not exist.'),
  default: formatGlobalMessage(
    'common.error.default',
    'Unknown system error. Please contact the administrator.',
  ),
};

export default errorCode;
