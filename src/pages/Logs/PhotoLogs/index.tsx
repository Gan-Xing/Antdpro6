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

const { RangePicker } = DatePicker;

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: PhotoLogs.Entity) => {
  const hide = message.loading('正在添加');
  try {
    await addItems('/photo-logs', { ...fields });
    hide();
    message.success('Added successfully');
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
const handleUpdate = async (fields: PhotoLogs.Entity) => {
  const hide = message.loading('正在更新');
  try {
    await updateItem(`/photo-logs/${fields.id}`, fields);
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
const handleRemove = async (selectedRows: PhotoLogs.Entity[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows || selectedRows.length === 0) return true;
  try {
    // 批量删除
    await Promise.all(selectedRows.map((row) => removeItem(`/photo-logs/${row.id}`)));
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
  const [currentRow, setCurrentRow] = useState<PhotoLogs.Entity>();
  const [selectedRowsState, setSelectedRows] = useState<PhotoLogs.Entity[]>([]);

  const intl = useIntl();
  const { canCreatePhotoLog, canUpdatePhotoLog, canDeletePhotoLog } = useAccess();

  const columns: ProColumns<PhotoLogs.Entity>[] = [
    {
      title: '描述',
      dataIndex: 'description',
      tip: '照片描述',
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
        console.log(record.photos);
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {record.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`照片${index + 1}`}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }}
              />
            ))}
          </div>
        );
      },
    },
    {
      title: '创建者',
      dataIndex: ['createdBy', 'username'],
      ellipsis: true,
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
        canUpdatePhotoLog && (
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
        canDeletePhotoLog && (
          <a
            key="delete"
            onClick={() => {
              Modal.confirm({
                title: '确认删除？',
                onOk: async () => {
                  await removeItem(`/photo-logs/${record.id}`);
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
      <ProTable<PhotoLogs.Entity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.logs.photo-logs.title',
          defaultMessage: '照片日志列表',
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
          canCreatePhotoLog && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage id="pages.logs.photo-logs.create" defaultMessage="新建" />
            </Button>
          ),
        ]}
        request={async (params) => {
          const msg = await queryList('/photo-logs', params);
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
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <Create
        createModalOpen={createModalOpen}
        onCancel={() => handleModalOpen(false)}
        onSubmit={async (values) => {
          const success = await handleAdd(values as PhotoLogs.Entity);
          if (success) {
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
      />
      <Update
        updateModalOpen={updateModalOpen}
        onCancel={() => handleUpdateModalOpen(false)}
        values={currentRow || {}}
        onSubmit={async (values) => {
          const success = await handleUpdate(values as PhotoLogs.Entity);
          if (success) {
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
            return true;
          }
          return false;
        }}
      />
      <Show
        open={showDetail}
        currentRow={currentRow as PhotoLogs.Entity}
        columns={columns as ProDescriptionsItemProps<PhotoLogs.Entity>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
