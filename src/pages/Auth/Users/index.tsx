import useQueryList from '@/hooks/useQueryList';
import {
  usersControllerCreate,
  usersControllerFindAllPaged,
  usersControllerRemoveByIds,
  usersControllerResetPassword,
  usersControllerUpdateStatus,
  usersControllerUpdate,
} from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Input, message, Modal, Select, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update from './components/Update';
import { genderValueEnum, renderUserStatus, userStatusValueEnum } from './constants';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: User.UsersEntity) => {
  const hide = message.loading('正在添加');
  try {
    await usersControllerCreate(fields as unknown as NestWebAPI.CreateUserDto);
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
const handleUpdate = async (fields: User.UpdateUserParams) => {
  const hide = message.loading('正在更新');
  try {
    await usersControllerUpdate({ id: fields.id! }, fields as unknown as NestWebAPI.UpdateUserDto);
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
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param ids
 */
const handleRemove = async (ids: number[]) => {
  const hide = message.loading('正在删除');
  if (!ids) return true;
  try {
    await usersControllerRemoveByIds({ ids });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Delete failed, please try again');
    return false;
  }
};

const handleUpdateStatus = async (id: number, status: NestWebAPI.UserStatus) => {
  const hide = message.loading(status === 'active' ? '正在启用' : '正在禁用');
  try {
    await usersControllerUpdateStatus({ id }, { status });
    hide();
    message.success(status === 'active' ? '用户已启用' : '用户已禁用');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '状态更新失败');
    return false;
  }
};

const handleResetPassword = async (id: number, password: string) => {
  const hide = message.loading('正在重置密码');
  try {
    await usersControllerResetPassword({ id }, { password });
    hide();
    message.success('密码已重置');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '密码重置失败');
    return false;
  }
};

const openResetPasswordConfirm = (record: User.UsersEntity, onSuccess: () => void) => {
  let nextPassword = '';

  Modal.confirm({
    title: `重置 ${record.username ?? record.email} 的密码`,
    content: (
      <Input.Password
        autoFocus
        placeholder="请输入至少 8 位的新密码"
        onChange={(event) => {
          nextPassword = event.target.value;
        }}
      />
    ),
    okText: '确认重置',
    cancelText: '取消',
    onOk: async () => {
      if (nextPassword.length < 8) {
        message.error('新密码至少 8 位');
        return Promise.reject();
      }

      const success = await handleResetPassword(record.id, nextPassword);
      if (success) {
        onSuccess();
        return;
      }
      return Promise.reject();
    },
  });
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
  const [currentRow, setCurrentRow] = useState<User.UsersEntity>();
  const [selectedRowsState, setSelectedRows] = useState<User.UsersEntity[]>([]);
  const { items: roles } = useQueryList('/roles');
  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentUser?.id;
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const { canEditUser, canDeleteUser, canCreateUser, canDisableUser, canResetUserPassword } =
    useAccess();
  const isCurrentUser = (user?: Partial<User.UsersEntity>) => user?.id === currentUserId;
  const rawColumns: Array<ProColumns<User.UsersEntity> | false> = [
    {
      title: <FormattedMessage id="pages.users.username" defaultMessage="姓名" />,
      dataIndex: 'username',
      tip: '用户姓名',
      ellipsis: true,
      sorter: (a: User.UsersEntity, b: User.UsersEntity) =>
        String(a.username ?? '').localeCompare(String(b.username ?? '')), // 添加这一行
      sortDirections: ['ascend', 'descend'], // 添加这一行
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            <Space size={8}>
              {dom}
              {isCurrentUser(entity) ? <Tag color="blue">当前用户</Tag> : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.users.email" defaultMessage="邮箱" />,
      dataIndex: 'email',
      copyable: true,
      ellipsis: true,
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.users.gender" defaultMessage="性别" />,
      dataIndex: 'gender',
      valueEnum: genderValueEnum,
    },
    {
      title: <FormattedMessage id="pages.users.isSuperAdmin" defaultMessage="是否超级管理员" />,
      dataIndex: 'isAdmin',
      render: (_, entity) => {
        return entity?.isAdmin ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>;
      },
      valueEnum: {
        true: { text: '是' },
        false: { text: '否' },
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
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
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
      render: (_, entity) => renderUserStatus(entity?.status),
      valueEnum: userStatusValueEnum,
    },
    {
      title: '最近登录',
      hideInSearch: true,
      dataIndex: 'lastLoginAt',
      valueType: 'dateTime',
      responsive: ['md'],
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      ellipsis: true,
    },
    (canDeleteUser || canEditUser || canDisableUser || canResetUserPassword) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      ellipsis: true,
      fixed: 'right',
      render: (_, record) => {
        const currentUserRecord = isCurrentUser(record);

        return [
          canEditUser && (
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
          canDeleteUser &&
            (currentUserRecord ? (
              <Tooltip key="delete-disabled" title="不能删除当前登录用户">
                <Typography.Text type="secondary">删除</Typography.Text>
              </Tooltip>
            ) : (
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
            )),
          canDisableUser &&
            (currentUserRecord ? (
              <Tooltip key="status-disabled" title="不能禁用当前登录用户">
                <Typography.Text type="secondary">
                  {record.status === 'active' || record.status === '1' ? '禁用' : '启用'}
                </Typography.Text>
              </Tooltip>
            ) : (
              <a
                key="status"
                onClick={() => {
                  const nextStatus =
                    record.status === 'active' || record.status === '1' ? 'disabled' : 'active';
                  Modal.confirm({
                    title: nextStatus === 'active' ? '确认启用用户？' : '确认禁用用户？',
                    content:
                      nextStatus === 'active'
                        ? '启用后该用户可以重新登录系统。'
                        : '禁用后该用户不能登录，现有 refresh token 会失效。',
                    okText: '确认',
                    cancelText: '取消',
                    onOk: async () => {
                      const success = await handleUpdateStatus(record.id, nextStatus);
                      if (success) {
                        actionRef.current?.reload();
                      }
                    },
                  });
                }}
              >
                {record.status === 'active' || record.status === '1' ? '禁用' : '启用'}
              </a>
            )),
          canResetUserPassword && (
            <a
              key="reset-password"
              onClick={() => {
                openResetPasswordConfirm(record, () => actionRef.current?.reload());
              }}
            >
              重置密码
            </a>
          ),
        ].filter(Boolean);
      },
    },
  ];
  const columns = rawColumns.filter(Boolean) as ProColumns<User.UsersEntity>[];
  const selectedContainsCurrentUser = selectedRowsState.some(isCurrentUser);

  return (
    <PageContainer>
      <ProTable<User.UsersEntity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'menu.auth.users',
          defaultMessage: '用户管理',
        })}
        actionRef={actionRef}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '30', '50'], // 提供更多的选择项
          showSizeChanger: true, // 允许用户更改每页的记录数
        }}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        // scroll={{ x: 1200 }}
        toolBarRender={() => [
          canCreateUser && (
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
        request={async (params, sort, filter) => {
          const data = unwrapResponse<any>(
            await usersControllerFindAllPaged({
              ...(params as NestWebAPI.UsersControllerFindAllPagedParams),
              sorter: sort ? JSON.stringify(sort) : undefined,
              ...filter,
            }),
          );
          return {
            data: data.data,
            current: data.pagination.current,
            pageSize: data.pagination.pageSize,
            total: data.pagination.total,
          };
        }}
        columns={columns}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: isCurrentUser(record),
          }),
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
          <Tooltip
            title={selectedContainsCurrentUser ? '已选择当前登录用户，不能批量删除' : undefined}
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsCurrentUser}
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
          </Tooltip>
        </FooterToolbar>
      )}
      <Create
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as User.UsersEntity);
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
          if (value?.password?.trim() === '') {
            delete value.password;
          }
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
        currentRow={currentRow as User.UsersEntity}
        columns={columns as ProDescriptionsItemProps<User.UsersEntity>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
