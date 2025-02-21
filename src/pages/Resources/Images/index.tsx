import { addItems, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, message, Modal, Select, Tag, DatePicker } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update from './components/Update';
import ImagePreview from './components/ImagePreview';

const { RangePicker } = DatePicker;

const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Images.Entity>();
  const [selectedRowsState, setSelectedRows] = useState<Images.Entity[]>([]);

  const intl = useIntl();
  const { canCreateImage, canUpdateImage, canDeleteImage } = useAccess();

  /**
   * @en-US Add node
   * @zh-CN 添加节点
   * @param fields
   */
  const handleAdd = async (fields: Images.Entity) => {
    const hide = message.loading(
      intl.formatMessage({
        id: 'pages.operation.adding',
        defaultMessage: '正在添加',
      }),
    );
    try {
      await addItems('/images', { ...fields });
      hide();
      message.success(
        intl.formatMessage({
          id: 'pages.operation.add.success',
          defaultMessage: '添加成功',
        }),
      );
      return true;
    } catch (error: any) {
      hide();
      console.log('error', error);
      return false;
    }
  };

  /**
   * @en-US Update node
   * @zh-CN 更新节点
   *
   * @param fields
   */
  const handleUpdate = async (fields: Images.Entity) => {
    const hide = message.loading(
      intl.formatMessage({
        id: 'pages.operation.updating',
        defaultMessage: '正在更新',
      }),
    );
    try {
      await updateItem(`/images/${fields.id}`, fields as Images.Entity);
      hide();
      message.success(
        intl.formatMessage({
          id: 'pages.operation.update.success',
          defaultMessage: '更新成功',
        }),
      );
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.message ??
          intl.formatMessage({
            id: 'pages.operation.update.failed',
            defaultMessage: '更新失败,请重试',
          }),
      );
      return false;
    }
  };

  /**
   * @en-US Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: Images.Entity[]) => {
    const hide = message.loading(
      intl.formatMessage({
        id: 'pages.operation.deleting',
        defaultMessage: '正在删除',
      }),
    );
    if (!selectedRows || selectedRows.length === 0) return true;
    try {
      // 批量删除
      await Promise.all(selectedRows.map((row) => removeItem(`/images/${row.id}`)));
      hide();
      message.success(
        intl.formatMessage({
          id: 'pages.operation.delete.success',
          defaultMessage: '删除成功',
        }),
      );
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.message ??
          intl.formatMessage({
            id: 'pages.operation.delete.failed',
            defaultMessage: '删除失败，请重试',
          }),
      );
      return false;
    }
  };

  const columns: ProColumns<Images.Entity>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.description',
        defaultMessage: '描述',
      }),
      dataIndex: 'description',
      tip: intl.formatMessage({
        id: 'pages.resources.images.description',
        defaultMessage: '描述',
      }),
      ellipsis: true,
      responsive: ['md'],
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.area',
        defaultMessage: '工程类别',
      }),
      dataIndex: 'area',
      valueType: 'select',
      responsive: ['lg'],
      valueEnum: {
        temporary: { text: intl.formatMessage({ id: 'pages.resources.images.area.temporary' }) },
        soil_disposal: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.soil_disposal' }),
        },
        soil_filling: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.soil_filling' }),
        },
        soil_replacement: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.soil_replacement' }),
        },
        subgrade: { text: intl.formatMessage({ id: 'pages.resources.images.area.subgrade' }) },
        gravel_base: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.gravel_base' }),
        },
        asphalt_surface: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.asphalt_surface' }),
        },
        demolition: { text: intl.formatMessage({ id: 'pages.resources.images.area.demolition' }) },
        structure: { text: intl.formatMessage({ id: 'pages.resources.images.area.structure' }) },
        traffic_sign: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.traffic_sign' }),
        },
        environment: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.environment' }),
        },
        public_facilities: {
          text: intl.formatMessage({ id: 'pages.resources.images.area.public_facilities' }),
        },
      },
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.category',
        defaultMessage: '分类',
      }),
      dataIndex: 'category',
      valueType: 'select',
      responsive: ['sm'],
      valueEnum: {
        progress: { text: intl.formatMessage({ id: 'pages.resources.images.category.progress' }) },
        safety: { text: intl.formatMessage({ id: 'pages.resources.images.category.safety' }) },
        quality: { text: intl.formatMessage({ id: 'pages.resources.images.category.quality' }) },
      },
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.stakeNumber',
        defaultMessage: '桩号',
      }),
      dataIndex: 'stakeNumber',
      valueType: 'text',
      responsive: ['lg'],
      hideInTable: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.tags',
        defaultMessage: '标签',
      }),
      dataIndex: 'tags',
      responsive: ['lg'],
      renderFormItem: (_, { ...rest }, form) => {
        return (
          <Select
            {...rest}
            mode="tags"
            placeholder={intl.formatMessage({
              id: 'pages.resources.images.tags.placeholder',
              defaultMessage: '请输入标签，按 Enter 键添加',
            })}
            tokenSeparators={[',', ' ']}
            onChange={(value) => {
              form.setFieldsValue({ tags: value });
            }}
          />
        );
      },
      search: {
        transform: (value: string[]) => {
          if (!value || value.length === 0) return {};
          return { tags: value };
        },
      },
      render: (_, record) => {
        if (!record.tags?.length) return '-';
        return record.tags.map((tag) => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ));
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.photos',
        defaultMessage: '照片',
      }),
      dataIndex: 'photos',
      valueType: 'image',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.photos?.length) return '-';
        return <ImagePreview photos={record.photos} thumbnails={record.thumbnails} />;
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.creator',
        defaultMessage: '创建者',
      }),
      dataIndex: ['createdBy', 'username'],
      ellipsis: true,
      responsive: ['md'],
      search: {
        transform: (value) => {
          if (!value) return {};
          return { createdBy: { username: value } };
        },
      },
      renderFormItem: (item, { defaultRender }) => {
        return defaultRender(item);
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.resources.images.createTime',
        defaultMessage: '创建时间',
      }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: false,
      responsive: ['lg'],
      ellipsis: true,
      renderFormItem: () => {
        return (
          <RangePicker
            placeholder={[
              intl.formatMessage({
                id: 'pages.resources.images.startDate',
                defaultMessage: '开始日期',
              }),
              intl.formatMessage({
                id: 'pages.resources.images.endDate',
                defaultMessage: '结束日期',
              }),
            ]}
            showTime={false}
            format="YYYY-MM-DD"
          />
        );
      },
      search: {
        transform: (value: any) => {
          if (!value || !Array.isArray(value)) return {};
          return {
            startDate: value[0],
            endDate: value[1],
          };
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        canUpdateImage && (
          <a
            key="update"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            <FormattedMessage id="pages.resources.images.edit" defaultMessage="编辑" />
          </a>
        ),
        canDeleteImage && (
          <a
            key="delete"
            onClick={() => {
              Modal.confirm({
                title: intl.formatMessage({
                  id: 'pages.resources.images.delete.confirm',
                  defaultMessage: '确认删除？',
                }),
                onOk: async () => {
                  await removeItem(`/images/${record.id}`);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: intl.formatMessage({
                  id: 'pages.resources.images.delete.confirm',
                  defaultMessage: '确认删除吗？',
                }),
                okText: intl.formatMessage({
                  id: 'pages.system.ok',
                  defaultMessage: '确认',
                }),
                cancelText: intl.formatMessage({
                  id: 'pages.system.cancel',
                  defaultMessage: '取消',
                }),
              });
            }}
          >
            <FormattedMessage id="pages.resources.images.delete" defaultMessage="删除" />
          </a>
        ),
      ],
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<Images.Entity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.resources.images.list.title',
          defaultMessage: '图片管理列表',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
        }}
        toolBarRender={() => [
          canCreateImage && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="pages.resources.images.create" defaultMessage="新建图片" />
            </Button>
          ),
        ]}
        request={async (params) => {
          const msg = await queryList('/images', params);
          const result = msg as any;
          return {
            data: result.data?.data || [],
            success: true,
            total: result.data?.pagination?.total || 0,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            type="primary"
            danger
            onClick={async () => {
              Modal.confirm({
                title: intl.formatMessage({
                  id: 'pages.resources.images.batch.delete',
                  defaultMessage: '批量删除',
                }),
                content: intl.formatMessage(
                  {
                    id: 'pages.resources.images.batch.delete.confirm.content',
                    defaultMessage: '是否确认删除选中的 {count} 项？',
                  },
                  {
                    count: selectedRowsState.length,
                  },
                ),
                okText: intl.formatMessage({
                  id: 'pages.system.ok',
                  defaultMessage: '确认',
                }),
                cancelText: intl.formatMessage({
                  id: 'pages.system.cancel',
                  defaultMessage: '取消',
                }),
                onOk: async () => {
                  await handleRemove(selectedRowsState);
                  setSelectedRows([]);
                  actionRef.current?.reload();
                },
              });
            }}
          >
            <FormattedMessage id="pages.resources.images.batch.delete" defaultMessage="批量删除" />
          </Button>
        </FooterToolbar>
      )}
      <Create
        createModalOpen={createModalOpen}
        onCancel={() => {
          handleModalOpen(false);
        }}
        onSubmit={async (value) => {
          const success = await handleAdd(value as Images.Entity);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return success;
        }}
      />
      <Update
        updateModalOpen={updateModalOpen}
        onCancel={() => {
          handleUpdateModalOpen(false);
          setCurrentRow(undefined);
        }}
        onSubmit={async (value) => {
          const success = await handleUpdate(value as Images.Entity);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return success;
        }}
        values={(currentRow as Images.Entity) || {}}
      />
      <Show
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        currentRow={(currentRow as Images.Entity) || {}}
        columns={columns as ProDescriptionsItemProps<Images.Entity>[]}
      />
    </PageContainer>
  );
};

export default TableList;
