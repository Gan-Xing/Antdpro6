import { ExclamationCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Modal, Tag } from 'antd';
import { useRef } from 'react';
import { clearLogs, exportLogs, queryLogs } from '@/services/system/log';
import moment from 'moment';

const SystemLogs: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.SystemLog>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
      responsive: ['lg'],
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
      width: 100,
    },
    {
      title: '请求内容',
      dataIndex: 'requestDescription',
      ellipsis: true,
      search: false,
    },
    {
      title: '国家',
      dataIndex: 'country',
      search: false,
      ellipsis: true,
      responsive: ['md'],
      width: 80,
    },
    {
      title: '城市',
      dataIndex: 'city',
      search: false,
      ellipsis: true,
      responsive: ['lg'],
      width: 100,
    },
    {
      title: '运营商',
      dataIndex: 'isp',
      search: false,
      ellipsis: true,
      responsive: ['lg'],
      width: 80,
    },
    {
      title: '耗时(ms)',
      dataIndex: 'duration',
      search: false,
      responsive: ['md'],
      width: 90,
      render: (_, record) => `${record.duration}ms`,
    },
    {
      title: '状态',
      dataIndex: 'success',
      search: false,
      width: 80,
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>{record.success ? '成功' : '失败'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      responsive: ['sm'],
      width: 160,
      render: (_, record) => moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const handleClear = () => {
    Modal.confirm({
      title: '确认清理',
      icon: <ExclamationCircleOutlined />,
      content: '是否确认清理30天前的日志？此操作不可恢复！',
      onOk: async () => {
        try {
          const result = await clearLogs(30);
          message.success(`清理成功：${result.message}`);
          actionRef.current?.reload();
        } catch (error) {
          message.error('清理失败');
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const data = await exportLogs();
      // 这里需要处理导出逻辑，可以是下载CSV文件
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-logs-${moment().format('YYYY-MM-DD')}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('导出失败');
    }
  };

  return (
    <PageContainer>
      <ProTable<API.SystemLog>
        headerTitle="系统日志"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button key="clear" onClick={handleClear}>
            清理日志
          </Button>,
          <Button key="export" type="primary" onClick={handleExport}>
            导出日志
          </Button>,
        ]}
        request={async (
          params: {
            current?: number;
            pageSize?: number;
            createdAt?: string[];
          } & Record<string, any>,
        ) => {
          const { current, pageSize, createdAt, ...rest } = params;
          const [startTime, endTime] = createdAt || [];
          const result = await queryLogs({
            page: current,
            pageSize,
            startTime,
            endTime,
            ...rest,
          });
          return {
            data: result.data.data,
            success: true,
            total: result.data.total,
          };
        }}
        columns={columns}
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  );
};

export default SystemLogs;
