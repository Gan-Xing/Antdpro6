import useQueryList from '@/hooks/useQueryList';
import { addItems, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, message, Modal, Select, Tag, TreeSelect } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import type { FormValueType } from './components/Update';
import Update from './components/Update';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UsersListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addItems('/users', { ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在更新');
  try {
    await updateItem(`/users/${fields.id}`, fields);
    hide();

    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '更新失败,请重试');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param ids
 */
const handleRemove = async (ids: number[]) => {
  const hide = message.loading('正在删除');
  if (!ids) return true;
  try {
    await removeItem('/users', {
      ids,
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.UsersListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.UsersListItem[]>([]);
  const { items: roles } = useQueryList('/roles');
  const { items: department } = useQueryList('/departments');
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  const columns: ProColumns<API.UsersListItem>[] = [
    {
      title: <FormattedMessage id="pages.users.username" defaultMessage="姓名" />,
      dataIndex: 'username',
      tip: '员工姓名',
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
      title: <FormattedMessage id="pages.users.email" defaultMessage="邮箱" />,
      dataIndex: 'email',
      copyable: true,
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.users.gender" defaultMessage="性别" />,
      dataIndex: 'gender',
      valueEnum: {
        男: { text: '男' },
        女: { text: '男' },
      },
    },
    {
      title: <FormattedMessage id="pages.users.isSuperAdmin" defaultMessage="是否超级管理员" />,
      dataIndex: 'isAdmin',
      render: (_, entity) => {
        return entity?.isAdmin ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>;
      },
      valueEnum: {
        ture: { text: '是' },
        false: { text: '否' },
      },
    },
    {
      title: <FormattedMessage id="pages.users.department" defaultMessage="部门" />,
      dataIndex: 'department',
      renderText: (val: { depName: string }) => val?.depName,
      renderFormItem: () => {
        return (
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder={intl.formatMessage({
              id: 'pages.searchTable.users.department.placeholder',
              defaultMessage: '请选择部门',
            })}
            allowClear
            treeDefaultExpandAll
            treeData={department}
          />
        );
      },
    },
    {
      title: <FormattedMessage id="pages.users.roles" defaultMessage="角色" />,
      dataIndex: 'roles',
      renderText: (val: { name: string }[]) => {
        return val.map((item) => item.name).join(', ');
      },
      renderFormItem() {
        return (
          <Select
            showSearch
            placeholder={intl.formatMessage({
              id: 'pages.searchTable.users.roles.placeholder',
              defaultMessage: '请选择角色',
            })}
            allowClear
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={roles?.map((role: { name: string; id: number }) => ({
              label: role.name,
              value: role.id,
            }))}
          />
        );
      },
    },
    {
      title: <FormattedMessage id="pages.users.status" defaultMessage="在职状态" />,
      dataIndex: 'status',
      render: (_, entity) => {
        return entity?.status === '在职' ? (
          <Tag color="success">是</Tag>
        ) : (
          <Tag color="default">否</Tag>
        );
      },
      valueEnum: {
        在职: { text: '在职' },
        离职: { text: '离职' },
      },
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        access.canUpdateUser && (
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
        access.canDeleteUser && (
          <a
            key="delete"
            onClick={() => {
              return Modal.confirm({
                title: '确认删除？',
                onOk: async () => {
                  await handleRemove([record.id!]);
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
      <ProTable<API.UsersListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'menu.auth.users',
          defaultMessage: '员工管理',
        })}
        actionRef={actionRef}
        pagination={{ defaultPageSize: 10 }}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          access.canCreateUser && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
            </Button>
          ),
        ]}
        request={async (params, sort, filter) => queryList('/users', params, sort, filter)}
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
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            type="primary"
            danger
            onClick={() => {
              return Modal.confirm({
                title: '确认删除？',
                onOk: async () => {
                  await handleRemove(selectedRowsState?.map((item) => item.id!));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
                content: '确认删除吗？',
                okText: '确认',
                cancelText: '取消',
              });
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <Create
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.UsersListItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      />
      <Update
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={handleUpdateModalOpen}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />
      <Show
        open={showDetail}
        currentRow={currentRow as API.UsersListItem}
        columns={columns as ProDescriptionsItemProps<API.UsersListItem>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
