import {
  systemConfigControllerFindAll,
  systemConfigControllerUpdate,
} from '@/services/nest-web/systemConfig';
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess, useIntl } from '@umijs/max';
import { Tag, Tooltip, Typography, message } from 'antd';
import React, { useRef, useState } from 'react';

const SystemConfigPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentConfig, setCurrentConfig] = useState<NestWebAPI.SystemConfigEntity>();
  const [currentRows, setCurrentRows] = useState<NestWebAPI.SystemConfigEntity[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { canEditSystemConfig, canExportData } = useAccess();
  const intl = useIntl();

  const columns: ProColumns<NestWebAPI.SystemConfigEntity>[] = [
    {
      title: intl.formatMessage({ id: 'pages.system.config.key' }),
      dataIndex: 'key',
      ellipsis: true,
      render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
    },
    {
      title: intl.formatMessage({ id: 'common.name' }),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.config.group' }),
      dataIndex: 'group',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.config.valueType' }),
      dataIndex: 'valueType',
      width: 100,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.system.config.value' }),
      dataIndex: 'value',
      ellipsis: true,
      search: false,
      render: (dom, record) =>
        record.valueType === 'boolean' ? (
          <Tag color={record.value === 'true' ? 'success' : 'default'}>{dom}</Tag>
        ) : (
          <Typography.Text>{dom}</Typography.Text>
        ),
    },
    {
      title: intl.formatMessage({ id: 'pages.system.config.editable' }),
      dataIndex: 'editable',
      width: 90,
      search: false,
      render: (_, record) =>
        record.editable ? (
          <Tag color="success">{intl.formatMessage({ id: 'pages.system.config.editable' })}</Tag>
        ) : (
          <Tag>{intl.formatMessage({ id: 'pages.system.config.systemMaintained' })}</Tag>
        ),
    },
    {
      title: intl.formatMessage({ id: 'common.description' }),
      dataIndex: 'description',
      ellipsis: true,
      search: false,
      hideInTable: true,
    },
    {
      title: intl.formatMessage({ id: 'common.updatedAt' }),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      valueType: 'option',
      width: 100,
      render: (_, record) => {
        if (!canEditSystemConfig) return [];

        if (!record.editable) {
          return [
            <Tooltip
              key="disabled"
              title={intl.formatMessage({ id: 'pages.system.config.disabledTip' })}
            >
              <Typography.Text type="secondary">
                {intl.formatMessage({ id: 'common.edit' })}
              </Typography.Text>
            </Tooltip>,
          ];
        }

        return [
          <a
            key="edit"
            onClick={() => {
              setCurrentConfig(record);
              setModalOpen(true);
            }}
          >
            {intl.formatMessage({ id: 'common.edit' })}
          </a>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<NestWebAPI.SystemConfigEntity>
        headerTitle={intl.formatMessage({ id: 'pages.system.config.title' })}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        columns={columns}
        toolBarRender={() => [
          canExportData ? (
            <TableExportButton<NestWebAPI.SystemConfigEntity>
              key="export"
              filename="system-config.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'pages.system.config.key' }), dataIndex: 'key' },
                { title: intl.formatMessage({ id: 'common.name' }), dataIndex: 'name' },
                {
                  title: intl.formatMessage({ id: 'pages.system.config.group' }),
                  dataIndex: 'group',
                },
                {
                  title: intl.formatMessage({ id: 'pages.system.config.valueType' }),
                  dataIndex: 'valueType',
                },
                {
                  title: intl.formatMessage({ id: 'pages.system.config.value' }),
                  dataIndex: 'value',
                },
                { title: intl.formatMessage({ id: 'common.updatedAt' }), dataIndex: 'updatedAt' },
              ]}
            />
          ) : null,
        ]}
        request={async (params) => {
          const result = unwrapResponse<any>(
            await systemConfigControllerFindAll({
              current: params.current,
              pageSize: params.pageSize,
              group: params.group as string,
              keyword: params.keyword as string,
            }),
          );
          setCurrentRows(result.data ?? []);
          return {
            data: result.data,
            success: true,
            total: result.pagination.total,
          };
        }}
      />
      <ModalForm<NestWebAPI.UpdateSystemConfigDto>
        title={
          currentConfig
            ? intl.formatMessage(
                { id: 'pages.system.config.editTitle' },
                { name: currentConfig.name },
              )
            : intl.formatMessage({ id: 'pages.system.config.defaultEditTitle' })
        }
        open={modalOpen}
        initialValues={{ value: currentConfig?.value }}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setCurrentConfig(undefined);
        }}
        onFinish={async (values) => {
          if (!currentConfig) return false;
          await systemConfigControllerUpdate({ id: currentConfig.id }, values);
          message.success(intl.formatMessage({ id: 'common.saveSuccess' }));
          setModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          label={intl.formatMessage({ id: 'pages.system.config.key' })}
          name="key"
          disabled
          initialValue={currentConfig?.key}
        />
        <ProFormTextArea
          label={intl.formatMessage({ id: 'pages.system.config.value' })}
          name="value"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.system.config.valueRequired' }),
            },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default SystemConfigPage;
