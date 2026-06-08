import {
  systemConfigControllerFindAll,
  systemConfigControllerUpdate,
} from '@/services/nest-web/systemConfig';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Tag, Tooltip, Typography, message } from 'antd';
import React, { useRef, useState } from 'react';

const SystemConfigPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentConfig, setCurrentConfig] = useState<NestWebAPI.SystemConfigEntity>();
  const [modalOpen, setModalOpen] = useState(false);
  const { canEditSystemConfig } = useAccess();

  const columns: ProColumns<NestWebAPI.SystemConfigEntity>[] = [
    {
      title: '参数键',
      dataIndex: 'key',
      ellipsis: true,
      render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '分组',
      dataIndex: 'group',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'valueType',
      width: 100,
      search: false,
    },
    {
      title: '值',
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
      title: '可编辑',
      dataIndex: 'editable',
      width: 90,
      search: false,
      render: (_, record) =>
        record.editable ? <Tag color="success">可编辑</Tag> : <Tag>系统维护</Tag>,
    },
    {
      title: '说明',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
      hideInTable: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record) => {
        if (!canEditSystemConfig) return [];

        if (!record.editable) {
          return [
            <Tooltip key="disabled" title="该参数由系统维护，不允许在后台编辑">
              <Typography.Text type="secondary">编辑</Typography.Text>
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
            编辑
          </a>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<NestWebAPI.SystemConfigEntity>
        headerTitle="系统参数"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        columns={columns}
        request={async (params) => {
          const result = unwrapResponse<any>(
            await systemConfigControllerFindAll({
              current: params.current,
              pageSize: params.pageSize,
              group: params.group as string,
              keyword: params.keyword as string,
            }),
          );
          return {
            data: result.data,
            success: true,
            total: result.pagination.total,
          };
        }}
      />
      <ModalForm<NestWebAPI.UpdateSystemConfigDto>
        title={currentConfig ? `编辑参数：${currentConfig.name}` : '编辑系统参数'}
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
          message.success('保存成功');
          setModalOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText label="参数键" name="key" disabled initialValue={currentConfig?.key} />
        <ProFormTextArea
          label="参数值"
          name="value"
          rules={[{ required: true, message: '请输入参数值' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default SystemConfigPage;
