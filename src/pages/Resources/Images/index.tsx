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

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: Images.Entity) => {
  const hide = message.loading('正在添加');
  try {
    await addItems('/images', { ...fields });
    hide();
    message.success('添加成功');
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
  const hide = message.loading('正在更新');
  try {
    await updateItem(`/images/${fields.id}`, fields as Images.Entity);
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.message ?? '更新失败,请重试');
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
  const hide = message.loading('正在删除');
  if (!selectedRows || selectedRows.length === 0) return true;
  try {
    // 批量删除
    await Promise.all(selectedRows.map((row) => removeItem(`/images/${row.id}`)));
    hide();
    message.success('删除成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.message ?? '删除失败，请重试');
    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Images.Entity>();
  const [selectedRowsState, setSelectedRows] = useState<Images.Entity[]>([]);

  const intl = useIntl();
  const { canCreateImage, canUpdateImage, canDeleteImage } = useAccess();

  const columns: ProColumns<Images.Entity>[] = [
    {
      title: '描述',
      dataIndex: 'description',
      tip: '图片描述',
      ellipsis: true,
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
      title: '工程类别',
      dataIndex: 'area',
      valueType: 'select',
      valueEnum: {
        临建: { text: '临建' },
        土方弃方: { text: '土方弃方' },
        土方填方: { text: '土方填方' },
        土方换填: { text: '土方换填' },
        底基层: { text: '底基层' },
        碎石基层: { text: '碎石基层' },
        沥青面层: { text: '沥青面层' },
        拆迁: { text: '拆迁' },
        结构物: { text: '结构物' },
        交通标志: { text: '交通标志' },
        环境与绿化: { text: '环境与绿化' },
        公共设施: { text: '公共设施' },
      },
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      valueType: 'select',
      valueEnum: {
        安全: { text: '安全' },
        质量: { text: '质量' },
        进度: { text: '进度' },
      },
    },
    {
      title: '桩号',
      dataIndex: 'stakeNumber',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      renderFormItem: (_, { ...rest }, form) => {
        return (
          <Select
            {...rest}
            mode="tags"
            placeholder="请输入标签，按 Enter 键添加"
            tokenSeparators={[',', ' ']}
            onChange={(value) => {
              form.setFieldsValue({ tags: value });
            }}
          />
        );
      },
      search: {
        transform: (value: string[]) => {
          // 将标签数组传递给后端
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
      title: '照片',
      dataIndex: 'photos',
      valueType: 'image',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.photos?.length) return '-';
        return <ImagePreview photos={record.photos} />;
      },
    },
    {
      title: '创建者',
      dataIndex: ['createdBy', 'username'],
      ellipsis: true,
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
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: false,
      ellipsis: true,
      renderFormItem: () => {
        return (
          <RangePicker
            placeholder={['开始日期', '结束日期']}
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
            <FormattedMessage id="pages.searchTable.editting" defaultMessage="编辑" />
          </a>
        ),
        canDeleteImage && (
          <a
            key="delete"
            onClick={() => {
              Modal.confirm({
                title: '确认删除？',
                onOk: async () => {
                  await removeItem(`/images/${record.id}`);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: '确认删除吗？',
                okText: '确认',
                cancelText: '取消',
              });
            }}
          >
            <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Images.Entity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.resources.images.title',
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
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reload();
            }}
          >
            批量删除
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
        values={(currentRow as Images.Entity) || {}}
        columns={columns as ProDescriptionsItemProps<Images.Entity>[]}
      />
    </PageContainer>
  );
};

export default TableList;
