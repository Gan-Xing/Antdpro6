import { formatGlobalMessage } from '@/utils/i18n';
import { history } from '@umijs/max';
import { Button, Empty, Result } from 'antd';
import type { ReactNode } from 'react';
import React from 'react';

type EmptyStateProps = {
  description?: ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  description = formatGlobalMessage('common.empty.data', 'No data'),
}) => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />;

export const renderEmpty = (componentName?: string) => (
  <EmptyState
    description={
      componentName === 'Table'
        ? formatGlobalMessage('common.empty.data', 'No data')
        : formatGlobalMessage('common.empty.content', 'No content')
    }
  />
);

export const AccessDeniedResult: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle={formatGlobalMessage(
      'common.result.403.subtitle',
      'This account does not have permission to access this page.',
    )}
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        {formatGlobalMessage('common.backDashboard', 'Back to Dashboard')}
      </Button>
    }
  />
);

export const ServerErrorResult: React.FC = () => (
  <Result
    status="500"
    title="500"
    subTitle={formatGlobalMessage(
      'common.result.500.subtitle',
      'The server is temporarily unavailable. Please try again later or contact the administrator.',
    )}
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        {formatGlobalMessage('common.backDashboard', 'Back to Dashboard')}
      </Button>
    }
  />
);

export const RequestFailureResult: React.FC = () => (
  <Result
    status="error"
    title={formatGlobalMessage('common.result.requestFailure.title', 'Request failed')}
    subTitle={formatGlobalMessage(
      'common.result.requestFailure.subtitle',
      'Network error or service unavailable. Check the connection and try again.',
    )}
    extra={
      <Button type="primary" onClick={() => window.location.reload()}>
        {formatGlobalMessage('common.reload', 'Reload')}
      </Button>
    }
  />
);
