import useQueryList from '@/hooks/useQueryList';
import { useDictOptions } from '@/hooks/useDictOptions';
import TableExportButton from '@/components/TableExportButton';
import {
  usersControllerCreate,
  usersControllerFindAllPaged,
  usersControllerRemoveByIds,
  usersControllerResetPassword,
  usersControllerUpdateStatus,
  usersControllerUpdate,
} from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';
import { formatGlobalMessage } from '@/utils/i18n';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl, useModel } from '@umijs/max';
import { Button, Input, message, Modal, Select, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update from './components/Update';
import { genderFallbackOptions, renderUserStatus, userStatusFallbackOptions } from './constants';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: User.UsersEntity) => {
  const hide = message.loading(formatGlobalMessage('common.loading.add', 'Adding'));
  try {
    await usersControllerCreate(fields as unknown as NestWebAPI.CreateUserDto);
    hide();
    message.success(formatGlobalMessage('common.message.addSuccess', 'Added successfully'));
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
  const hide = message.loading(formatGlobalMessage('common.loading.update', 'Updating'));
  try {
    await usersControllerUpdate({ id: fields.id! }, fields as unknown as NestWebAPI.UpdateUserDto);
    hide();
    message.success(formatGlobalMessage('common.message.updateSuccess', 'Updated successfully'));
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.message ??
        formatGlobalMessage('common.message.updateFailure', 'Update failed, please try again'),
    );
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
  const hide = message.loading(formatGlobalMessage('common.loading.delete', 'Deleting'));
  if (!ids) return true;
  try {
    await usersControllerRemoveByIds({ ids });
    hide();
    message.success(formatGlobalMessage('common.message.deleteSuccess', 'Deleted successfully'));
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ??
        formatGlobalMessage('common.message.deleteFailure', 'Delete failed, please try again'),
    );
    return false;
  }
};

const handleUpdateStatus = async (id: number, status: NestWebAPI.UpdateUserStatusDto['status']) => {
  const hide = message.loading(
    status === 'active'
      ? formatGlobalMessage('pages.users.enabling', 'Enabling')
      : formatGlobalMessage('pages.users.disabling', 'Disabling'),
  );
  try {
    await usersControllerUpdateStatus({ id }, { status });
    hide();
    message.success(
      status === 'active'
        ? formatGlobalMessage('pages.users.enabledSuccess', 'User enabled')
        : formatGlobalMessage('pages.users.disabledSuccess', 'User disabled'),
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ??
        formatGlobalMessage('pages.users.statusUpdateFailed', 'Failed to update user status'),
    );
    return false;
  }
};

const handleResetPassword = async (id: number, password: string) => {
  const hide = message.loading(
    formatGlobalMessage('pages.users.resettingPassword', 'Resetting password'),
  );
  try {
    await usersControllerResetPassword({ id }, { password });
    hide();
    message.success(formatGlobalMessage('pages.users.resetPasswordSuccess', 'Password reset'));
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ??
        formatGlobalMessage('pages.users.resetPasswordFailed', 'Failed to reset password'),
    );
    return false;
  }
};

const openResetPasswordConfirm = (record: User.UsersEntity, onSuccess: () => void) => {
  let nextPassword = '';

  Modal.confirm({
    title: formatGlobalMessage('pages.users.resetPasswordTitle', 'Reset password for {name}', {
      name: record.username ?? record.email ?? record.id,
    }),
    content: (
      <Input.Password
        autoFocus
        placeholder={formatGlobalMessage(
          'pages.users.resetPasswordPlaceholder',
          'Please enter a new password of at least 8 characters',
        )}
        onChange={(event) => {
          nextPassword = event.target.value;
        }}
      />
    ),
    okText: formatGlobalMessage('pages.users.confirmResetPassword', 'Confirm Reset'),
    cancelText: formatGlobalMessage('common.cancel', 'Cancel'),
    onOk: async () => {
      if (nextPassword.length < 8) {
        message.error(
          formatGlobalMessage(
            'pages.users.resetPasswordMin',
            'New password must be at least 8 characters',
          ),
        );
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
  const {
    canEditUser,
    canDeleteUser,
    canCreateUser,
    canDisableUser,
    canResetUserPassword,
    canExportData,
  } = useAccess();
  const [currentRows, setCurrentRows] = useState<User.UsersEntity[]>([]);
  const { valueEnum: genderValueEnum } = useDictOptions('user.gender', genderFallbackOptions);
  const { valueEnum: userStatusValueEnum } = useDictOptions(
    'user.status',
    userStatusFallbackOptions,
  );
  const isCurrentUser = (user?: Partial<User.UsersEntity>) => user?.id === currentUserId;
  const rawColumns: Array<ProColumns<User.UsersEntity> | false> = [
    {
      title: <FormattedMessage id="pages.users.username" defaultMessage="Name" />,
      dataIndex: 'username',
      tip: intl.formatMessage({ id: 'pages.users.username' }),
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
              {isCurrentUser(entity) ? (
                <Tag color="blue">{intl.formatMessage({ id: 'pages.users.currentUser' })}</Tag>
              ) : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.users.email" defaultMessage="Email" />,
      dataIndex: 'email',
      copyable: true,
      ellipsis: true,
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.users.gender" defaultMessage="Gender" />,
      dataIndex: 'gender',
      valueEnum: genderValueEnum,
    },
    {
      title: <FormattedMessage id="pages.users.isSuperAdmin" defaultMessage="Super Admin" />,
      dataIndex: 'isAdmin',
      render: (_, entity) => {
        return entity?.isAdmin ? (
          <Tag color="success">{intl.formatMessage({ id: 'common.yes' })}</Tag>
        ) : (
          <Tag color="default">{intl.formatMessage({ id: 'common.no' })}</Tag>
        );
      },
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'common.yes' }) },
        false: { text: intl.formatMessage({ id: 'common.no' }) },
      },
    },
    {
      title: <FormattedMessage id="pages.users.roles" defaultMessage="Roles" />,
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
      title: <FormattedMessage id="pages.users.status" defaultMessage="Status" />,
      dataIndex: 'status',
      render: (_, entity) => renderUserStatus(entity?.status),
      valueEnum: userStatusValueEnum,
    },
    {
      title: intl.formatMessage({ id: 'pages.users.recentLogin' }),
      hideInSearch: true,
      dataIndex: 'lastLoginAt',
      valueType: 'dateTime',
      responsive: ['md'],
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="Created At" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      ellipsis: true,
    },
    (canDeleteUser || canEditUser || canDisableUser || canResetUserPassword) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
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
              <Tooltip
                key="delete-disabled"
                title={intl.formatMessage({ id: 'pages.users.cannotDeleteCurrent' })}
              >
                <Typography.Text type="secondary">
                  {intl.formatMessage({ id: 'common.delete' })}
                </Typography.Text>
              </Tooltip>
            ) : (
              <a
                key="delete"
                onClick={() => {
                  return Modal.confirm({
                    title: intl.formatMessage({ id: 'common.confirmDelete' }),
                    onOk: async () => {
                      await handleRemove([record.id!]);
                      setSelectedRows([]);
                      actionRef.current?.reloadAndRest?.();
                    },
                    content: intl.formatMessage({ id: 'common.confirmDeleteContent' }),
                    okText: intl.formatMessage({ id: 'common.confirm' }),
                    cancelText: intl.formatMessage({ id: 'common.cancel' }),
                  });
                }}
              >
                <FormattedMessage id="pages.searchTable.delete" defaultMessage="Delete" />
              </a>
            )),
          canDisableUser &&
            (currentUserRecord ? (
              <Tooltip
                key="status-disabled"
                title={intl.formatMessage({ id: 'pages.users.cannotDisableCurrent' })}
              >
                <Typography.Text type="secondary">
                  {record.status === 'active' || record.status === '1'
                    ? intl.formatMessage({ id: 'pages.users.disable' })
                    : intl.formatMessage({ id: 'pages.users.enable' })}
                </Typography.Text>
              </Tooltip>
            ) : (
              <a
                key="status"
                onClick={() => {
                  const nextStatus =
                    record.status === 'active' || record.status === '1' ? 'disabled' : 'active';
                  Modal.confirm({
                    title:
                      nextStatus === 'active'
                        ? intl.formatMessage({ id: 'pages.users.confirmEnableTitle' })
                        : intl.formatMessage({ id: 'pages.users.confirmDisableTitle' }),
                    content:
                      nextStatus === 'active'
                        ? intl.formatMessage({ id: 'pages.users.enableContent' })
                        : intl.formatMessage({ id: 'pages.users.disableContent' }),
                    okText: intl.formatMessage({ id: 'common.confirm' }),
                    cancelText: intl.formatMessage({ id: 'common.cancel' }),
                    onOk: async () => {
                      const success = await handleUpdateStatus(record.id, nextStatus);
                      if (success) {
                        actionRef.current?.reload();
                      }
                    },
                  });
                }}
              >
                {record.status === 'active' || record.status === '1'
                  ? intl.formatMessage({ id: 'pages.users.disable' })
                  : intl.formatMessage({ id: 'pages.users.enable' })}
              </a>
            )),
          canResetUserPassword && (
            <a
              key="reset-password"
              onClick={() => {
                openResetPasswordConfirm(record, () => actionRef.current?.reload());
              }}
            >
              {intl.formatMessage({ id: 'pages.users.resetPassword' })}
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
          canExportData ? (
            <TableExportButton<User.UsersEntity>
              key="export"
              filename="users.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                {
                  title: intl.formatMessage({ id: 'pages.users.username' }),
                  dataIndex: 'username',
                },
                { title: intl.formatMessage({ id: 'common.email' }), dataIndex: 'email' },
                { title: intl.formatMessage({ id: 'common.status' }), dataIndex: 'status' },
                {
                  title: intl.formatMessage({ id: 'pages.users.roles' }),
                  renderText: (record) => record.roles?.map((role) => role.name).join(', '),
                },
                {
                  title: intl.formatMessage({ id: 'pages.users.recentLogin' }),
                  dataIndex: 'lastLoginAt',
                },
                { title: intl.formatMessage({ id: 'common.createdAt' }), dataIndex: 'createdAt' },
              ]}
            />
          ) : null,
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
          setCurrentRows(data.data ?? []);
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
            title={
              selectedContainsCurrentUser
                ? intl.formatMessage({ id: 'pages.users.selectedCurrentDeleteTip' })
                : undefined
            }
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsCurrentUser}
              onClick={() => {
                return Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirmDelete' }),
                  onOk: async () => {
                    await handleRemove(selectedRowsState?.map((item) => item.id!));
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  },
                  content: intl.formatMessage({ id: 'common.confirmDeleteContent' }),
                  okText: intl.formatMessage({ id: 'common.confirm' }),
                  cancelText: intl.formatMessage({ id: 'common.cancel' }),
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
