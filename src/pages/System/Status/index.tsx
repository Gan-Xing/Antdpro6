import { systemControllerGetStatus } from '@/services/nest-web/system';
import { unwrapResponse } from '@/utils/apiResponse';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Empty, Space, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';

const dependencyLabels: Record<string, string> = {
  database: 'Database',
  redis: 'Redis',
  rabbitmq: 'RabbitMQ',
  minio: 'MinIO',
  queue: 'Bull Queue',
};

const statusColor = (status?: string) => (status === 'ok' ? 'success' : 'error');

const SystemStatusPage: React.FC = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<NestWebAPI.SystemStatusEntity>();

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<NestWebAPI.SystemStatusEntity>(await systemControllerGetStatus());
      setStatus(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.system.status.loadFailed' }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const dependencies = status?.dependencies ? Object.entries(status.dependencies) : [];

  return (
    <PageContainer
      extra={
        <Button loading={loading} onClick={loadStatus}>
          {intl.formatMessage({ id: 'common.refresh' })}
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <ProCard>
          <ProDescriptions
            column={3}
            dataSource={status}
            loading={loading}
            columns={[
              {
                title: intl.formatMessage({ id: 'pages.system.status.overall' }),
                dataIndex: 'status',
                render: (_, entity) => (
                  <Tag color={statusColor(entity.status)}>{entity.status}</Tag>
                ),
              },
              {
                title: intl.formatMessage({ id: 'pages.system.status.checkedAt' }),
                dataIndex: 'checkedAt',
                render: (_, entity) =>
                  entity.checkedAt ? new Date(entity.checkedAt).toLocaleString() : '-',
              },
            ]}
          />
        </ProCard>
        {dependencies.length ? (
          <ProCard gutter={[16, 16]} wrap>
            {dependencies.map(([key, value]) => (
              <ProCard key={key} colSpan={{ xs: 24, sm: 12, md: 8 }} bordered>
                <ProDescriptions<NestWebAPI.SystemDependencyHealthEntity>
                  title={dependencyLabels[key] ?? key}
                  column={1}
                  dataSource={value}
                  columns={[
                    {
                      title: intl.formatMessage({ id: 'pages.system.status.status' }),
                      dataIndex: 'status',
                      render: (_, entity) => (
                        <Tag color={statusColor(entity.status)}>{entity.status}</Tag>
                      ),
                    },
                    {
                      title: intl.formatMessage({ id: 'pages.system.status.latency' }),
                      dataIndex: 'latencyMs',
                      render: (_, entity) => `${entity.latencyMs ?? 0} ms`,
                    },
                    {
                      title: intl.formatMessage({ id: 'pages.system.status.error' }),
                      dataIndex: 'error',
                      renderText: (value) => value || '-',
                    },
                  ]}
                />
              </ProCard>
            ))}
          </ProCard>
        ) : (
          <Empty description={intl.formatMessage({ id: 'pages.system.status.empty' })} />
        )}
      </Space>
    </PageContainer>
  );
};

export default SystemStatusPage;
