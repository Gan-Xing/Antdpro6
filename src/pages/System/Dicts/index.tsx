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
import TableExportButton from '@/components/TableExportButton';
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
import { useAccess, useIntl } from '@umijs/max';
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
  const { canCreateDicts, canEditDicts, canDeleteDicts, canExportData } = useAccess();
  const intl = useIntl();
  const [typeRows, setTypeRows] = useState<NestWebAPI.DictTypeEntity[]>([]);
  const [itemRows, setItemRows] = useState<NestWebAPI.DictItemEntity[]>([]);

  const typeColumns = useMemo<ProColumns<NestWebAPI.DictTypeEntity>[]>(
    () => [
      {
        title: intl.formatMessage({ id: 'pages.dicts.typeCode' }),
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
        title: intl.formatMessage({ id: 'common.name' }),
        dataIndex: 'name',
      },
      {
        title: intl.formatMessage({ id: 'common.status' }),
        dataIndex: 'enabled',
        search: false,
        width: 90,
        render: (_, record) =>
          record.enabled ? (
            <Tag color="success">{intl.formatMessage({ id: 'common.enabled' })}</Tag>
          ) : (
            <Tag>{intl.formatMessage({ id: 'pages.dicts.disabled' })}</Tag>
          ),
      },
      {
        title: intl.formatMessage({ id: 'common.sort' }),
        dataIndex: 'sort',
        search: false,
        width: 80,
      },
      {
        title: intl.formatMessage({ id: 'common.action' }),
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
                {intl.formatMessage({ id: 'common.edit' })}
              </a>
            ),
            canDeleteDicts && (
              <a
                key="delete"
                onClick={() => {
                  Modal.confirm({
                    title: intl.formatMessage({ id: 'pages.dicts.confirmDeleteType' }),
                    content: intl.formatMessage({ id: 'pages.dicts.confirmDeleteTypeContent' }),
                    onOk: async () => {
                      await dictsControllerRemoveType({ id: record.id });
                      message.success(intl.formatMessage({ id: 'common.message.deleteSuccess' }));
                      if (currentType?.id === record.id) {
                        setCurrentType(undefined);
                      }
                      typeActionRef.current?.reload();
                      itemActionRef.current?.reload();
                    },
                  });
                }}
              >
                {intl.formatMessage({ id: 'common.delete' })}
              </a>
            ),
          ].filter(Boolean),
      },
    ],
    [canDeleteDicts, canEditDicts, currentType?.id, intl],
  );

  const itemColumns = useMemo<ProColumns<NestWebAPI.DictItemEntity>[]>(
    () => [
      {
        title: intl.formatMessage({ id: 'common.code' }),
        dataIndex: 'code',
        render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
      },
      {
        title: intl.formatMessage({ id: 'common.label' }),
        dataIndex: 'label',
      },
      {
        title: intl.formatMessage({ id: 'common.value' }),
        dataIndex: 'value',
        render: (dom) => <Typography.Text code>{dom}</Typography.Text>,
      },
      {
        title: intl.formatMessage({ id: 'common.color' }),
        dataIndex: 'color',
        search: false,
        render: (_, record) =>
          record.color ? <Tag color={record.color}>{record.color}</Tag> : '-',
      },
      {
        title: intl.formatMessage({ id: 'common.status' }),
        dataIndex: 'enabled',
        search: false,
        width: 90,
        render: (_, record) =>
          record.enabled ? (
            <Tag color="success">{intl.formatMessage({ id: 'common.enabled' })}</Tag>
          ) : (
            <Tag>{intl.formatMessage({ id: 'pages.dicts.disabled' })}</Tag>
          ),
      },
      {
        title: intl.formatMessage({ id: 'common.sort' }),
        dataIndex: 'sort',
        search: false,
        width: 80,
      },
      {
        title: intl.formatMessage({ id: 'common.action' }),
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
                {intl.formatMessage({ id: 'common.edit' })}
              </a>
            ),
            canDeleteDicts && (
              <a
                key="delete"
                onClick={() => {
                  Modal.confirm({
                    title: intl.formatMessage({ id: 'pages.dicts.confirmDeleteItem' }),
                    onOk: async () => {
                      await dictsControllerRemoveItem({ id: record.id });
                      message.success(intl.formatMessage({ id: 'common.message.deleteSuccess' }));
                      itemActionRef.current?.reload();
                    },
                  });
                }}
              >
                {intl.formatMessage({ id: 'common.delete' })}
              </a>
            ),
          ].filter(Boolean),
      },
    ],
    [canDeleteDicts, canEditDicts, intl],
  );

  return (
    <PageContainer>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <ProCard title={intl.formatMessage({ id: 'pages.dicts.typeTitle' })}>
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
              canExportData ? (
                <TableExportButton<NestWebAPI.DictTypeEntity>
                  key="export"
                  filename="dict-types.csv"
                  rows={typeRows}
                  columns={[
                    { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                    { title: intl.formatMessage({ id: 'common.code' }), dataIndex: 'code' },
                    { title: intl.formatMessage({ id: 'common.name' }), dataIndex: 'name' },
                    {
                      title: intl.formatMessage({ id: 'common.status' }),
                      renderText: (record) =>
                        record.enabled
                          ? intl.formatMessage({ id: 'common.enabled' })
                          : intl.formatMessage({ id: 'pages.dicts.disabled' }),
                    },
                    { title: intl.formatMessage({ id: 'common.sort' }), dataIndex: 'sort' },
                  ]}
                />
              ) : null,
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
                  {intl.formatMessage({ id: 'pages.dicts.createType' })}
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
              setTypeRows(result.data ?? []);
              return {
                data: result.data,
                success: true,
                total: result.pagination.total,
              };
            }}
          />
        </ProCard>
        <ProCard
          title={
            currentType
              ? intl.formatMessage(
                  { id: 'pages.dicts.itemTitleWithName' },
                  { name: currentType.name },
                )
              : intl.formatMessage({ id: 'pages.dicts.itemTitle' })
          }
          extra={
            <Space>
              {canExportData ? (
                <TableExportButton<NestWebAPI.DictItemEntity>
                  filename="dict-items.csv"
                  rows={itemRows}
                  disabled={!currentType}
                  columns={[
                    { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                    { title: intl.formatMessage({ id: 'common.code' }), dataIndex: 'code' },
                    { title: intl.formatMessage({ id: 'common.label' }), dataIndex: 'label' },
                    { title: intl.formatMessage({ id: 'common.value' }), dataIndex: 'value' },
                    { title: intl.formatMessage({ id: 'common.color' }), dataIndex: 'color' },
                    {
                      title: intl.formatMessage({ id: 'common.status' }),
                      renderText: (record) =>
                        record.enabled
                          ? intl.formatMessage({ id: 'common.enabled' })
                          : intl.formatMessage({ id: 'pages.dicts.disabled' }),
                    },
                    { title: intl.formatMessage({ id: 'common.sort' }), dataIndex: 'sort' },
                  ]}
                />
              ) : null}
              {canCreateDicts ? (
                <Button
                  disabled={!currentType}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(undefined);
                    setItemModalOpen(true);
                  }}
                >
                  {intl.formatMessage({ id: 'pages.dicts.createItem' })}
                </Button>
              ) : null}
            </Space>
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
                setItemRows([]);
                return { data: [], success: true };
              }
              const data = unwrapResponse<NestWebAPI.DictItemEntity[]>(
                await dictsControllerFindItems({ dictTypeId: currentType.id }),
              );
              setItemRows(data);
              return { data, success: true };
            }}
          />
        </ProCard>
      </Space>
      <ModalForm<DictTypeFormValues>
        title={
          editingType
            ? intl.formatMessage({ id: 'pages.dicts.editType' })
            : intl.formatMessage({ id: 'pages.dicts.createType' })
        }
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
          message.success(intl.formatMessage({ id: 'common.saveSuccess' }));
          setTypeModalOpen(false);
          typeActionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="code"
          label={intl.formatMessage({ id: 'pages.dicts.typeCode' })}
          disabled={Boolean(editingType)}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.dicts.codeRequired' }) },
            {
              pattern: /^[a-z][a-z0-9._-]*$/,
              message: intl.formatMessage({ id: 'pages.dicts.codePattern' }),
            },
          ]}
        />
        <ProFormText
          name="name"
          label={intl.formatMessage({ id: 'common.name' })}
          rules={[{ required: true }]}
        />
        <ProFormDigit
          name="sort"
          label={intl.formatMessage({ id: 'common.sort' })}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSwitch name="enabled" label={intl.formatMessage({ id: 'pages.dicts.enabled' })} />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'common.description' })}
        />
      </ModalForm>
      <ModalForm<DictItemFormValues>
        title={
          editingItem
            ? intl.formatMessage({ id: 'pages.dicts.editItem' })
            : intl.formatMessage({ id: 'pages.dicts.createItem' })
        }
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
          message.success(intl.formatMessage({ id: 'common.saveSuccess' }));
          setItemModalOpen(false);
          itemActionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="dictTypeId"
          label={intl.formatMessage({ id: 'pages.dicts.typeId' })}
          hidden
        />
        <ProFormText
          name="code"
          label={intl.formatMessage({ id: 'pages.dicts.itemCode' })}
          disabled={Boolean(editingItem)}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.dicts.codeRequired' }) },
            {
              pattern: /^[a-z][a-z0-9._-]*$/,
              message: intl.formatMessage({ id: 'pages.dicts.codePattern' }),
            },
          ]}
        />
        <ProFormText
          name="label"
          label={intl.formatMessage({ id: 'common.label' })}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="value"
          label={intl.formatMessage({ id: 'common.value' })}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="color"
          label={intl.formatMessage({ id: 'common.color' })}
          placeholder="success / error / blue / default"
        />
        <ProFormDigit
          name="sort"
          label={intl.formatMessage({ id: 'common.sort' })}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSwitch name="enabled" label={intl.formatMessage({ id: 'pages.dicts.enabled' })} />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'common.description' })}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default DictsPage;
