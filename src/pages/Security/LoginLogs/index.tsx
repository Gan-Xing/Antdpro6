import {
  loginLogsControllerFindAll,
  loginLogsControllerFindOne,
} from '@/services/nest-web/loginLogs';
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Drawer, message, Tag } from 'antd';
import { useAccess, useIntl } from '@umijs/max';
import React, { useRef, useState } from 'react';

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const LoginLogsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<NestWebAPI.LoginLogEntity>();
  const [currentRows, setCurrentRows] = useState<NestWebAPI.LoginLogEntity[]>([]);

  const columns: ProColumns<NestWebAPI.LoginLogEntity>[] = [
    {
      title: intl.formatMessage({ id: 'common.keyword' }),
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: intl.formatMessage({ id: 'common.user' }),
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
              message.error(
                error?.response?.data?.message ??
                  intl.formatMessage({ id: 'pages.security.loginLogs.loadDetailFailed' }),
              );
            }
          }}
        >
          {dom || record.email || `#${record.id}`}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'common.email' }),
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
      title: intl.formatMessage({ id: 'pages.security.loginLogs.result' }),
      dataIndex: 'success',
      width: 100,
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'common.success' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'common.failure' }), status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>
          {record.success
            ? intl.formatMessage({ id: 'common.success' })
            : intl.formatMessage({ id: 'common.failure' })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.security.loginLogs.failureReason' }),
      dataIndex: 'failureReason',
      ellipsis: true,
      hideInSearch: true,
      renderText: (value) => value || '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.security.loginLogs.loginTime' }),
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
        headerTitle={intl.formatMessage({ id: 'pages.security.loginLogs.title' })}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        columns={columns}
        toolBarRender={() => [
          access.canExportData ? (
            <TableExportButton<NestWebAPI.LoginLogEntity>
              key="export"
              filename="login-logs.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'common.user' }), dataIndex: 'username' },
                { title: intl.formatMessage({ id: 'common.email' }), dataIndex: 'email' },
                { title: 'IP', dataIndex: 'ip' },
                {
                  title: intl.formatMessage({ id: 'pages.security.loginLogs.result' }),
                  renderText: (record) =>
                    record.success
                      ? intl.formatMessage({ id: 'common.success' })
                      : intl.formatMessage({ id: 'common.failure' }),
                },
                {
                  title: intl.formatMessage({ id: 'pages.security.loginLogs.failureReason' }),
                  dataIndex: 'failureReason',
                },
                {
                  title: intl.formatMessage({ id: 'pages.security.loginLogs.loginTime' }),
                  dataIndex: 'createdAt',
                },
              ]}
            />
          ) : null,
        ]}
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
          setCurrentRows(result.data ?? []);

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
        title={intl.formatMessage({ id: 'pages.security.loginLogs.detailTitle' })}
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
            { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
            { title: intl.formatMessage({ id: 'common.userId' }), dataIndex: 'userId' },
            { title: intl.formatMessage({ id: 'common.username' }), dataIndex: 'username' },
            {
              title: intl.formatMessage({ id: 'common.email' }),
              dataIndex: 'email',
              copyable: true,
            },
            { title: 'IP', dataIndex: 'ip' },
            {
              title: intl.formatMessage({ id: 'pages.security.loginLogs.result' }),
              dataIndex: 'success',
              render: (_, entity) => (
                <Tag color={entity.success ? 'success' : 'error'}>
                  {entity.success
                    ? intl.formatMessage({ id: 'common.success' })
                    : intl.formatMessage({ id: 'common.failure' })}
                </Tag>
              ),
            },
            {
              title: intl.formatMessage({ id: 'pages.security.loginLogs.failureCode' }),
              dataIndex: 'failureCode',
            },
            {
              title: intl.formatMessage({ id: 'pages.security.loginLogs.failureReason' }),
              dataIndex: 'failureReason',
            },
            { title: 'User Agent', dataIndex: 'userAgent' },
            {
              title: intl.formatMessage({ id: 'common.createdAt' }),
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
