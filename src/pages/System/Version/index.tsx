import { systemControllerGetVersion } from '@/services/nest-web/system';
import { unwrapResponse } from '@/utils/apiResponse';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';

const SystemVersionPage: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState<NestWebAPI.SystemVersionEntity>();

  const loadVersion = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<NestWebAPI.SystemVersionEntity>(
        await systemControllerGetVersion(),
      );
      setVersion(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.system.version.loadFailed' }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersion();
  }, []);

  return (
    <PageContainer
      extra={
        <Button loading={loading} onClick={loadVersion}>
          {intl.formatMessage({ id: 'common.refresh' })}
        </Button>
      }
    >
      <ProCard>
        <ProDescriptions<NestWebAPI.SystemVersionEntity>
          title={intl.formatMessage({ id: 'pages.system.version.title' })}
          column={1}
          loading={loading}
          dataSource={version}
          columns={[
            {
              title: intl.formatMessage({ id: 'pages.system.version.service' }),
              dataIndex: 'service',
            },
            {
              title: intl.formatMessage({ id: 'pages.system.version.version' }),
              dataIndex: 'version',
            },
            { title: intl.formatMessage({ id: 'pages.system.version.env' }), dataIndex: 'env' },
            {
              title: intl.formatMessage({ id: 'pages.system.version.nodeVersion' }),
              dataIndex: 'nodeVersion',
            },
            { title: 'Commit SHA', dataIndex: 'commitSha', copyable: true },
            {
              title: intl.formatMessage({ id: 'pages.system.version.buildTime' }),
              dataIndex: 'buildTime',
            },
          ]}
        />
      </ProCard>
    </PageContainer>
  );
};

export default SystemVersionPage;
