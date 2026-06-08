import { systemControllerGetQueues } from '@/services/nest-web/system';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';

const statusColor = (status?: string) => (status === 'ok' ? 'success' : 'error');

const SystemQueuesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState<NestWebAPI.SystemQueuesEntity>();

  const loadQueues = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<NestWebAPI.SystemQueuesEntity>(await systemControllerGetQueues());
      setQueues(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '队列状态加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  const columns: ProColumns<NestWebAPI.QueueStatusEntity>[] = [
    {
      title: '队列',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => <Tag color={statusColor(record.status)}>{record.status}</Tag>,
    },
    { title: 'Waiting', dataIndex: 'waiting', search: false },
    { title: 'Active', dataIndex: 'active', search: false },
    { title: 'Completed', dataIndex: 'completed', search: false },
    { title: 'Failed', dataIndex: 'failed', search: false },
    { title: 'Delayed', dataIndex: 'delayed', search: false },
    {
      title: '错误',
      dataIndex: 'error',
      ellipsis: true,
      search: false,
      renderText: (value) => value || '-',
    },
  ];

  return (
    <PageContainer
      extra={
        <Button loading={loading} onClick={loadQueues}>
          刷新
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <ProCard gutter={[16, 16]} wrap>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 4 }}
            statistic={{ title: 'Waiting', value: queues?.totals.waiting ?? 0 }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 4 }}
            statistic={{ title: 'Active', value: queues?.totals.active ?? 0 }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 4 }}
            statistic={{ title: 'Completed', value: queues?.totals.completed ?? 0 }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 4 }}
            statistic={{ title: 'Failed', value: queues?.totals.failed ?? 0 }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 4 }}
            statistic={{ title: 'Delayed', value: queues?.totals.delayed ?? 0 }}
          />
        </ProCard>
        <ProTable<NestWebAPI.QueueStatusEntity>
          rowKey="name"
          loading={loading}
          search={false}
          pagination={false}
          columns={columns}
          dataSource={queues?.queues ?? []}
        />
      </Space>
    </PageContainer>
  );
};

export default SystemQueuesPage;
