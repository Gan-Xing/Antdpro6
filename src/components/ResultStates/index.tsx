import { history } from '@umijs/max';
import { Button, Empty, Result } from 'antd';
import type { ReactNode } from 'react';
import React from 'react';

type EmptyStateProps = {
  description?: ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ description = '暂无数据' }) => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
);

export const renderEmpty = (componentName?: string) => (
  <EmptyState description={componentName === 'Table' ? '暂无数据' : '暂无内容'} />
);

export const AccessDeniedResult: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="当前账号没有访问该页面的权限。"
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        返回工作台
      </Button>
    }
  />
);

export const ServerErrorResult: React.FC = () => (
  <Result
    status="500"
    title="500"
    subTitle="服务器暂时不可用，请稍后重试或联系管理员。"
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        返回工作台
      </Button>
    }
  />
);

export const RequestFailureResult: React.FC = () => (
  <Result
    status="error"
    title="请求失败"
    subTitle="网络异常或服务未响应，请检查连接后重试。"
    extra={
      <Button type="primary" onClick={() => window.location.reload()}>
        重新加载
      </Button>
    }
  />
);
