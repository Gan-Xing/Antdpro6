import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="当前页面不存在或已被移动。"
    extra={
      <Button type="primary" onClick={() => history.push('/dashboard')}>
        返回工作台
      </Button>
    }
  />
);

export default NoFoundPage;
