import {
  loginLogsControllerFindAll,
  loginLogsControllerFindOne,
} from '@/services/nest-web/loginLogs';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Drawer, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const LoginLogsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<NestWebAPI.LoginLogEntity>();

  const columns: ProColumns<NestWebAPI.LoginLogEntity>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: '用户',
      dataIndex: 'username',
      ellipsis: true,
      render: (dom, record) => (
        <a
          onClick={async () => {
            try {
              const data = unwrapResponse<NestWebAPI.LoginLogEntity>(
                await loginLogsControllerFindOne({ id: record.id }),
              );
              setCurrentLog(data);
              setDetailOpen(true);
            } catch (error: any) {
              message.error(error?.response?.data?.message ?? '登录日志详情加载失败');
            }
          }}
        >
          {dom || record.email || `#${record.id}`}
        </a>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
      copyable: true,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      ellipsis: true,
      width: 150,
    },
    {
      title: '结果',
      dataIndex: 'success',
      width: 100,
      valueEnum: {
        true: { text: '成功', status: 'Success' },
        false: { text: '失败', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>{record.success ? '成功' : '失败'}</Tag>
      ),
    },
    {
      title: '失败原因',
      dataIndex: 'failureReason',
      ellipsis: true,
      hideInSearch: true,
      renderText: (value) => value || '-',
    },
    {
      title: '登录时间',
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      render: (_, record) => formatTime(record.createdAt),
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      ellipsis: true,
      hideInSearch: true,
      responsive: ['lg'],
    },
  ];

  return (
    <PageContainer>
      <ProTable<NestWebAPI.LoginLogEntity>
        headerTitle="登录日志"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        columns={columns}
        request={async (
          params: NestWebAPI.LoginLogsControllerFindAllParams & {
            createdAt?: string[];
          },
        ) => {
          const { current, pageSize, createdAt, ...rest } = params;
          const [startTime, endTime] = createdAt || [];
          const result = unwrapResponse<any>(
            await loginLogsControllerFindAll({
              current,
              pageSize,
              startTime,
              endTime,
              ...rest,
            }),
          );

          return {
            data: result.data,
            success: true,
            current: result.pagination.current,
            pageSize: result.pagination.pageSize,
            total: result.pagination.total,
          };
        }}
        scroll={{ x: 'max-content' }}
      />
      <Drawer
        width={560}
        open={detailOpen}
        title="登录日志详情"
        onClose={() => {
          setDetailOpen(false);
          setCurrentLog(undefined);
        }}
        destroyOnClose
      >
        <ProDescriptions<NestWebAPI.LoginLogEntity>
          column={1}
          dataSource={currentLog}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: '用户 ID', dataIndex: 'userId' },
            { title: '用户名', dataIndex: 'username' },
            { title: '邮箱', dataIndex: 'email', copyable: true },
            { title: 'IP', dataIndex: 'ip' },
            {
              title: '结果',
              dataIndex: 'success',
              render: (_, entity) => (
                <Tag color={entity.success ? 'success' : 'error'}>
                  {entity.success ? '成功' : '失败'}
                </Tag>
              ),
            },
            { title: '失败编码', dataIndex: 'failureCode' },
            { title: '失败原因', dataIndex: 'failureReason' },
            { title: 'User Agent', dataIndex: 'userAgent' },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              render: (_, entity) => formatTime(entity.createdAt),
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default LoginLogsPage;
