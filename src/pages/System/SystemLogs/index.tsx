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
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import moment from 'moment';
import { useAccess, useIntl } from '@umijs/max';

const SystemLogs: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<API.SystemLogDetail>();
  const [currentRows, setCurrentRows] = useState<API.SystemLog[]>([]);

  const openDetail = async (record: API.SystemLog) => {
    try {
      const data = unwrapResponse<API.SystemLogDetail>(
        await systemLogControllerFindOne({ id: record.id }),
      );
      setCurrentLog(data);
      setDetailOpen(true);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.system.logs.loadDetailFailed' }),
      );
    }
  };

  const columns: ProColumns<API.SystemLog>[] = [
    {
      title: intl.formatMessage({ id: 'common.id' }),
      dataIndex: 'id',
      search: false,
      responsive: ['lg'],
      width: 60,
    },
    {
      title: intl.formatMessage({ id: 'common.username' }),
      dataIndex: 'username',
      ellipsis: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.logs.requestContent' }),
      dataIndex: 'requestDescription',
      ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.logs.country' }),
      dataIndex: 'country',
      search: false,
      ellipsis: true,
      responsive: ['md'],
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.logs.city' }),
      dataIndex: 'city',
      search: false,
      ellipsis: true,
      responsive: ['lg'],
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.logs.isp' }),
      dataIndex: 'isp',
      search: false,
      ellipsis: true,
      responsive: ['lg'],
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.logs.durationMs' }),
      dataIndex: 'duration',
      search: false,
      responsive: ['md'],
      width: 90,
      render: (_, record) => `${record.duration}ms`,
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'success',
      search: false,
      width: 80,
      render: (_, record) => (
        <Tag color={record.success ? 'success' : 'error'}>
          {record.success
            ? intl.formatMessage({ id: 'common.success' })
            : intl.formatMessage({ id: 'common.failure' })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'common.createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      responsive: ['sm'],
      width: 160,
      render: (_, record) => moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      valueType: 'option',
      width: 90,
      render: (_, record) =>
        access.canViewSystemLogDetail
          ? [
              <a key="detail" onClick={() => openDetail(record)}>
                {intl.formatMessage({ id: 'common.detail' })}
              </a>,
            ]
          : [],
    },
  ];

  const handleClear = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.system.logs.confirmClearTitle' }),
      icon: <ExclamationCircleOutlined />,
      content: intl.formatMessage({ id: 'pages.system.logs.confirmClearContent' }),
      onOk: async () => {
        try {
          const result = unwrapResponse<any>(await systemLogControllerClear({ days: 30 }));
          message.success(
            intl.formatMessage(
              { id: 'pages.system.logs.clearSuccess' },
              { message: result.message },
            ),
          );
          actionRef.current?.reload();
        } catch (error) {
          message.error(intl.formatMessage({ id: 'pages.system.logs.clearFailed' }));
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
      message.error(intl.formatMessage({ id: 'pages.system.logs.exportFailed' }));
    }
  };

  return (
    <PageContainer>
      <ProTable<API.SystemLog>
        headerTitle={intl.formatMessage({ id: 'pages.system.logs.title' })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          access.canDeleteSystemLogs ? (
            <Button key="clear" onClick={handleClear}>
              {intl.formatMessage({ id: 'pages.system.logs.clear' })}
            </Button>
          ) : null,
          access.canExportSystemLogs ? (
            <Button key="export" type="primary" onClick={handleExport}>
              {intl.formatMessage({ id: 'pages.system.logs.export' })}
            </Button>
          ) : null,
          access.canExportData ? (
            <TableExportButton<API.SystemLog>
              key="export-csv"
              filename="system-logs.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'common.username' }), dataIndex: 'username' },
                {
                  title: intl.formatMessage({ id: 'pages.system.logs.requestContent' }),
                  dataIndex: 'requestDescription',
                },
                { title: 'IP', dataIndex: 'ip' },
                {
                  title: intl.formatMessage({ id: 'pages.system.status.latency' }),
                  dataIndex: 'duration',
                },
                {
                  title: intl.formatMessage({ id: 'pages.security.loginLogs.result' }),
                  renderText: (record) =>
                    record.success
                      ? intl.formatMessage({ id: 'common.success' })
                      : intl.formatMessage({ id: 'common.failure' }),
                },
                { title: intl.formatMessage({ id: 'common.createdAt' }), dataIndex: 'createdAt' },
              ]}
            />
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
          setCurrentRows(result.data ?? []);
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
        title={intl.formatMessage({ id: 'pages.system.logs.detailTitle' })}
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
            { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
            { title: intl.formatMessage({ id: 'common.userId' }), dataIndex: 'userId' },
            { title: intl.formatMessage({ id: 'common.username' }), dataIndex: 'username' },
            {
              title: intl.formatMessage({ id: 'pages.system.logs.requestUrl' }),
              dataIndex: 'requestUrl',
              copyable: true,
            },
            {
              title: intl.formatMessage({ id: 'pages.system.logs.requestMethod' }),
              dataIndex: 'method',
            },
            {
              title: intl.formatMessage({ id: 'pages.system.logs.httpStatus' }),
              dataIndex: 'status',
            },
            { title: 'IP', dataIndex: 'ip' },
            { title: 'User Agent', dataIndex: 'userAgent' },
            {
              title: intl.formatMessage({ id: 'pages.system.status.latency' }),
              dataIndex: 'duration',
              render: (_, entity) => `${entity.duration ?? 0}ms`,
            },
            {
              title: intl.formatMessage({ id: 'common.createdAt' }),
              dataIndex: 'createdAt',
              render: (_, entity) =>
                entity.createdAt ? moment(entity.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
            },
            {
              title: intl.formatMessage({ id: 'pages.system.logs.requestData' }),
              dataIndex: 'requestData',
              render: (_, entity) => (
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                  {entity.requestData ? JSON.stringify(entity.requestData, null, 2) : '-'}
                </Typography.Paragraph>
              ),
            },
            {
              title: intl.formatMessage({ id: 'pages.system.logs.errorMessage' }),
              dataIndex: 'errorMsg',
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default SystemLogs;
