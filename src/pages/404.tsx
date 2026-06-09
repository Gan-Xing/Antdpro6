import { formatGlobalMessage } from '@/utils/i18n';
import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle={formatGlobalMessage(
      'common.result.404.subtitle',
      'This page does not exist or has been moved.',
    )}
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        {formatGlobalMessage('common.backDashboard', 'Back to Dashboard')}
      </Button>
    }
  />
);

export default NoFoundPage;
