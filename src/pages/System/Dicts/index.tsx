import {
  dictsControllerCreateItem,
  dictsControllerCreateType,
  dictsControllerFindItems,
  dictsControllerFindTypes,
  dictsControllerRemoveItem,
  dictsControllerRemoveType,
  dictsControllerUpdateItem,
  dictsControllerUpdateType,
} from '@/services/nest-web/dicts';
import { unwrapResponse } from '@/utils/apiResponse';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Modal, Space, Tag, Typography, message } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

type DictTypeFormValues = NestWebAPI.CreateDictTypeDto & { id?: number };
type DictItemFormValues = NestWebAPI.CreateDictItemDto & { id?: number };

const normalizeTypePayload = (
  values: DictTypeFormValues,
): NestWebAPI.CreateDictTypeDto | NestWebAPI.UpdateDictTypeDto => ({
  code: values.code,
  name: values.name,
  description: values.description,
  enabled: values.enabled ?? true,
  sort: values.sort ?? 0,
});

const normalizeItemPayload = (
  values: DictItemFormValues,
): NestWebAPI.CreateDictItemDto | NestWebAPI.UpdateDictItemDto => ({
  dictTypeId: values.dictTypeId,
  code: values.code,
  label: values.label,
  value: values.value,
  color: values.color,
  description: values.description,
  enabled: values.enabled ?? true,
  sort: values.sort ?? 0,
});

const DictsPage: React.FC = () => {
  const typeActionRef = useRef<ActionType>();
  const itemActionRef = useRef<ActionType>();
  const [currentType, setCurrentType] = useState<NestWebAPI.DictTypeEntity>();
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<NestWebAPI.DictTypeEntity>();
  const [editingItem, setEditingItem] = useState<NestWebAPI.DictItemEntity>();
  const { canCreateDicts, canEditDicts, canDeleteDicts } = useAccess();

  const typeColumns = useMemo<ProColumns<NestWebAPI.DictTypeEntity>[]>(
    () => [
      {
        title: '字典编码',
        dataIndex: 'code',
        render: (dom, record) => (
          <a
            onClick={() => {
              setCurrentType(record);
              itemActionRef.current?.reload();
            }}
          >
            <Typography.Text code>{dom}</Typography.Text>
          </a>
        ),
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        search: false,
        width: 90,
        render: (_, record) => (record.enabled ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
      },
      {
        title: '排序',
        dataIndex: 'sort',
        search: false,
        width: 80,
      },
      {
        title: '操作',
        valueType: 'option',
        width: 130,
        render: (_, record) =>
          [
            canEditDicts && (
              <a
                key="edit"
                onClick={() => {
                  setEditingType(record);
                  setTypeModalOpen(true);
                }}
              >
                编辑
              </a>
            ),
            canDeleteDicts && (
              <a
                key="delete"
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除字典类型？',
                    content: '删除字典类型会同时删除其字典项。',
                    onOk: async () => {
                      await dictsControllerRemoveType({ id: record.id });
                      message.success('删除成功');
                      if (currentType?.id === record.id) {
                        setCurrentType(undefined);
                      }
                      typeActionRef.current?.reload();
                      itemActionRef.current?.reload();
                    },
                  });
                }}
              >
                删除
              </a>
            ),
          ].filter(Boolean),
      },
    ],
    [canDeleteDicts, canEditDicts, currentType?.id],
  );

  const itemColumns = useMemo<ProColumns<NestWebAPI.DictItemEntity>[]>(
    () => [
      {
        title: '编码',
        dataIndex: 'code',
        render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
      },
      {
        title: '标签',
        dataIndex: 'label',
      },
      {
        title: '值',
        dataIndex: 'value',
        render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
      },
      {
        title: '颜色',
        dataIndex: 'color',
        search: false,
        render: (_, record) =>
          record.color ? <Tag color={record.color}>{record.color}</Tag> : '-',
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        search: false,
        width: 90,
        render: (_, record) => (record.enabled ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
      },
      {
        title: '排序',
        dataIndex: 'sort',
        search: false,
        width: 80,
      },
      {
        title: '操作',
        valueType: 'option',
        width: 130,
        render: (_, record) =>
          [
            canEditDicts && (
              <a
                key="edit"
                onClick={() => {
                  setEditingItem(record);
                  setItemModalOpen(true);
                }}
              >
                编辑
              </a>
            ),
            canDeleteDicts && (
              <a
                key="delete"
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除字典项？',
                    onOk: async () => {
                      await dictsControllerRemoveItem({ id: record.id });
                      message.success('删除成功');
                      itemActionRef.current?.reload();
                    },
                  });
                }}
              >
                删除
              </a>
            ),
          ].filter(Boolean),
      },
    ],
    [canDeleteDicts, canEditDicts],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <ProCard title="字典类型">
          <ProTable<NestWebAPI.DictTypeEntity>
            actionRef={typeActionRef}
            rowKey="id"
            search={{ labelWidth: 80 }}
            pagination={{ defaultPageSize: 10 }}
            columns={typeColumns}
            rowClassName={(record) =>
              record.id === currentType?.id ? 'ant-table-row-selected' : ''
            }
            toolBarRender={() => [
              canCreateDicts && (
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingType(undefined);
                    setTypeModalOpen(true);
                  }}
                >
                  新增类型
                </Button>
              ),
            ]}
            request={async (params) => {
              const result = unwrapResponse<any>(
                await dictsControllerFindTypes({
                  current: params.current,
                  pageSize: params.pageSize,
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
        </ProCard>
        <ProCard
          title={currentType ? `字典项：${currentType.name}` : '字典项'}
          extra={
            canCreateDicts ? (
              <Button
                disabled={!currentType}
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingItem(undefined);
                  setItemModalOpen(true);
                }}
              >
                新增字典项
              </Button>
            ) : null
          }
        >
          <ProTable<NestWebAPI.DictItemEntity>
            actionRef={itemActionRef}
            rowKey="id"
            search={false}
            pagination={false}
            columns={itemColumns}
            request={async () => {
              if (!currentType?.id) {
                return { data: [], success: true };
              }
              const data = unwrapResponse<NestWebAPI.DictItemEntity[]>(
                await dictsControllerFindItems({ dictTypeId: currentType.id }),
              );
              return { data, success: true };
            }}
          />
        </ProCard>
      </Space>
      <ModalForm<DictTypeFormValues>
        title={editingType ? '编辑字典类型' : '新增字典类型'}
        open={typeModalOpen}
        initialValues={editingType ?? { enabled: true, sort: 0 }}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onOpenChange={(open) => {
          setTypeModalOpen(open);
          if (!open) setEditingType(undefined);
        }}
        onFinish={async (values) => {
          const payload = normalizeTypePayload(values);
          if (editingType) {
            const updatePayload: NestWebAPI.UpdateDictTypeDto = {
              name: payload.name,
              description: payload.description,
              enabled: payload.enabled,
              sort: payload.sort,
            };
            await dictsControllerUpdateType({ id: editingType.id }, updatePayload);
          } else {
            await dictsControllerCreateType(payload as NestWebAPI.CreateDictTypeDto);
          }
          message.success('保存成功');
          setTypeModalOpen(false);
          typeActionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="code"
          label="字典编码"
          disabled={Boolean(editingType)}
          rules={[
            { required: true, message: '请输入字典编码' },
            {
              pattern: /^[a-z][a-z0-9._-]*$/,
              message: '仅支持小写字母、数字、点、下划线和短横线',
            },
          ]}
        />
        <ProFormText name="name" label="名称" rules={[{ required: true }]} />
        <ProFormDigit name="sort" label="排序" min={0} fieldProps={{ precision: 0 }} />
        <ProFormSwitch name="enabled" label="是否启用" />
        <ProFormTextArea name="description" label="说明" />
      </ModalForm>
      <ModalForm<DictItemFormValues>
        title={editingItem ? '编辑字典项' : '新增字典项'}
        open={itemModalOpen}
        initialValues={editingItem ?? { enabled: true, sort: 0, dictTypeId: currentType?.id }}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onOpenChange={(open) => {
          setItemModalOpen(open);
          if (!open) setEditingItem(undefined);
        }}
        onFinish={async (values) => {
          const payload = normalizeItemPayload({
            ...values,
            dictTypeId: currentType?.id ?? values.dictTypeId,
          });
          if (editingItem) {
            const updatePayload: NestWebAPI.UpdateDictItemDto = {
              label: payload.label,
              value: payload.value,
              color: payload.color,
              description: payload.description,
              enabled: payload.enabled,
              sort: payload.sort,
            };
            await dictsControllerUpdateItem({ id: editingItem.id }, updatePayload);
          } else {
            await dictsControllerCreateItem(payload as NestWebAPI.CreateDictItemDto);
          }
          message.success('保存成功');
          setItemModalOpen(false);
          itemActionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="dictTypeId" label="字典类型 ID" hidden />
        <ProFormText
          name="code"
          label="字典项编码"
          disabled={Boolean(editingItem)}
          rules={[
            { required: true, message: '请输入字典项编码' },
            {
              pattern: /^[a-z][a-z0-9._-]*$/,
              message: '仅支持小写字母、数字、点、下划线和短横线',
            },
          ]}
        />
        <ProFormText name="label" label="标签" rules={[{ required: true }]} />
        <ProFormText name="value" label="值" rules={[{ required: true }]} />
        <ProFormText name="color" label="颜色" placeholder="success / error / blue / default" />
        <ProFormDigit name="sort" label="排序" min={0} fieldProps={{ precision: 0 }} />
        <ProFormSwitch name="enabled" label="是否启用" />
        <ProFormTextArea name="description" label="说明" />
      </ModalForm>
    </PageContainer>
  );
};

export default DictsPage;
