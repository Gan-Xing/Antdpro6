import { ExclamationCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import {
  systemLogControllerClear,
  systemLogControllerExport,
  systemLogControllerFindAll,
  systemLogControllerFindOne,
} from '@/services/nest-web/systemLog';
import { unwrapResponse } from '@/utils/apiResponse';
import moment from 'moment';
import { useAccess } from '@umijs/max';

const SystemLogs: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<API.SystemLogDetail>();

  const openDetail = async (record: API.SystemLog) => {
    try {
      const data = unwrapResponse<API.SystemLogDetail>(
        await systemLogControllerFindOne({ id: record.id }),
      );
      setCurrentLog(data);
      setDetailOpen(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '系统日志详情加载失败');
    }
  };

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
    {
      title: '操作',
      valueType: 'option',
      width: 90,
      render: (_, record) =>
        access.canViewSystemLogDetail
          ? [
              <a key="detail" onClick={() => openDetail(record)}>
                详情
              </a>,
            ]
          : [],
    },
  ];

  const handleClear = () => {
    Modal.confirm({
      title: '确认清理',
      icon: <ExclamationCircleOutlined />,
      content: '是否确认清理30天前的日志？此操作不可恢复！',
      onOk: async () => {
        try {
          const result = unwrapResponse<any>(await systemLogControllerClear({ days: 30 }));
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
      const data = unwrapResponse<API.SystemLog[]>(await systemLogControllerExport({}));
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
          access.canDeleteSystemLogs ? (
            <Button key="clear" onClick={handleClear}>
              清理日志
            </Button>
          ) : null,
          access.canExportSystemLogs ? (
            <Button key="export" type="primary" onClick={handleExport}>
              导出日志
            </Button>
          ) : null,
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
          const result = unwrapResponse<any>(
            await systemLogControllerFindAll({
              page: current,
              pageSize,
              startTime,
              endTime,
              ...rest,
            }),
          );
          return {
            data: result.data,
            success: true,
            total: result.total,
          };
        }}
        columns={columns}
        scroll={{ x: 'max-content' }}
      />
      <Drawer
        width={680}
        open={detailOpen}
        title="系统日志详情"
        onClose={() => {
          setDetailOpen(false);
          setCurrentLog(undefined);
        }}
        destroyOnClose
      >
        <ProDescriptions<API.SystemLogDetail>
          column={1}
          dataSource={currentLog}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: '用户 ID', dataIndex: 'userId' },
            { title: '用户名', dataIndex: 'username' },
            { title: '请求地址', dataIndex: 'requestUrl', copyable: true },
            { title: '请求方法', dataIndex: 'method' },
            { title: 'HTTP 状态', dataIndex: 'status' },
            { title: 'IP', dataIndex: 'ip' },
            { title: 'User Agent', dataIndex: 'userAgent' },
            {
              title: '耗时',
              dataIndex: 'duration',
              render: (_, entity) => `${entity.duration ?? 0}ms`,
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              render: (_, entity) =>
                entity.createdAt ? moment(entity.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
            },
            {
              title: '请求数据',
              dataIndex: 'requestData',
              render: (_, entity) => (
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                  {entity.requestData ? JSON.stringify(entity.requestData, null, 2) : '-'}
                </Typography.Paragraph>
              ),
            },
            { title: '错误信息', dataIndex: 'errorMsg' },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default SystemLogs;
