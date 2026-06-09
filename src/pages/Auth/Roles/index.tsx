import TableExportButton from '@/components/TableExportButton';
import {
  rolesControllerCreate,
  rolesControllerFindAll,
  rolesControllerRemoveMany,
  rolesControllerUpdate,
} from '@/services/nest-web/roles';
import { unwrapResponse } from '@/utils/apiResponse';
import { formatGlobalMessage } from '@/utils/i18n';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update from './components/Update';

const isSystemAdminRole = (role?: Partial<Roles.Entity>) => role?.code === 'admin';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const toCreateRoleDto = (fields: Roles.CreateParams): NestWebAPI.CreateRoleDto => ({
  code: fields.code,
  name: fields.name,
  description: fields.description,
  sort: fields.sort ?? 0,
  enabled: fields.enabled ?? true,
  permissions: fields.permissions ?? [],
});

const toUpdateRoleDto = (fields: Roles.UpdateParams): NestWebAPI.UpdateRoleDto => ({
  name: fields.name,
  description: fields.description,
  sort: fields.sort ?? 0,
  enabled: fields.enabled ?? true,
  permissions: fields.permissions ?? [],
});

const handleAdd = async (fields: Roles.CreateParams) => {
  const hide = message.loading(formatGlobalMessage('common.loading.add', 'Adding'));
  try {
    await rolesControllerCreate(toCreateRoleDto(fields));
    hide();
    message.success(formatGlobalMessage('common.message.addSuccess', 'Added successfully'));
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ??
        formatGlobalMessage('common.message.addFailure', 'Adding failed, please try again'),
    );
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Roles.UpdateParams) => {
  const hide = message.loading(formatGlobalMessage('common.loading.update', 'Updating'));
  try {
    await rolesControllerUpdate({ id: Number(fields.id) }, toUpdateRoleDto(fields));
    hide();

    message.success(formatGlobalMessage('common.message.updateSuccess', 'Updated successfully'));
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ??
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
    await rolesControllerRemoveMany({ ids });
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
  const [currentRow, setCurrentRow] = useState<Roles.Entity>();
  const [selectedRowsState, setSelectedRows] = useState<Roles.Entity[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const { canCreateRole, canEditRole, canDeleteRole, canExportData } = useAccess();
  const [currentRows, setCurrentRows] = useState<Roles.Entity[]>([]);
  const rawColumns: Array<ProColumns<Roles.Entity> | false> = [
    {
      title: intl.formatMessage({ id: 'pages.roles.code' }),
      dataIndex: 'code',
      width: 140,
      render: (dom) => (
        <Typography.Text code style={{ fontSize: 12 }}>
          {dom}
        </Typography.Text>
      ),
    },
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="Name" />,
      dataIndex: 'name',
      tip: intl.formatMessage({ id: 'pages.roles.name' }),
      width: '75px',
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
              {isSystemAdminRole(entity) ? (
                <Tag color="blue">{intl.formatMessage({ id: 'pages.roles.systemManagedTag' })}</Tag>
              ) : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.roles.description' }),
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
      renderText: (value) => value || '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.roles.sort' }),
      dataIndex: 'sort',
      width: 90,
      hideInSearch: true,
      sorter: (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'enabled',
      width: 90,
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'common.enabled' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'pages.roles.disabled' }), status: 'Default' },
      },
      render: (_, entity) =>
        entity.enabled ? (
          <Tag color="success">{intl.formatMessage({ id: 'common.enabled' })}</Tag>
        ) : (
          <Tag color="default">{intl.formatMessage({ id: 'pages.roles.disabled' })}</Tag>
        ),
    },
    {
      title: <FormattedMessage id="pages.roles.permissions" defaultMessage="权限列表" />,
      dataIndex: 'permissions',
      renderText: (val: { name: string }[]) => {
        return val.map((item) => item.name).join(', ');
      },
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.roles.users" defaultMessage="Users" />,
      dataIndex: 'users',
      renderText: (val) => {
        return val.map((item: { username: string }) => item.username).join(', ');
      },
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="Created At" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.roles.updatedTime" defaultMessage="Updated At" />,
      hideInSearch: true,
      hideInTable: true,
      dataIndex: 'updatedAt',
      valueType: 'date',
    },
    (canEditRole || canDeleteRole) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => {
        const systemAdminRole = isSystemAdminRole(record);

        return [
          canEditRole &&
            (systemAdminRole ? (
              <Tooltip
                key="update-disabled"
                title={intl.formatMessage({ id: 'pages.roles.systemAdminEditTip' })}
              >
                <Typography.Text type="secondary">
                  {intl.formatMessage({ id: 'common.edit' })}
                </Typography.Text>
              </Tooltip>
            ) : (
              <a
                key="update"
                onClick={() => {
                  handleUpdateModalOpen(true);
                  setCurrentRow(record);
                }}
              >
                <FormattedMessage id="pages.searchTable.editting" defaultMessage="编辑" />
              </a>
            )),
          canDeleteRole &&
            (systemAdminRole ? (
              <Tooltip
                key="delete-disabled"
                title={intl.formatMessage({ id: 'pages.roles.systemAdminDeleteTip' })}
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
        ].filter(Boolean);
      },
    },
  ];
  const columns = rawColumns.filter(Boolean) as ProColumns<Roles.Entity>[];
  const selectedContainsAdminRole = selectedRowsState.some(isSystemAdminRole);

  return (
    <PageContainer>
      <ProTable<Roles.Entity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'menu.auth.roles',
          defaultMessage: '角色管理',
        })}
        actionRef={actionRef}
        pagination={{ defaultPageSize: 10 }}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          canExportData ? (
            <TableExportButton<Roles.Entity>
              key="export"
              filename="roles.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'pages.roles.code' }), dataIndex: 'code' },
                { title: intl.formatMessage({ id: 'common.name' }), dataIndex: 'name' },
                {
                  title: intl.formatMessage({ id: 'common.description' }),
                  dataIndex: 'description',
                },
                {
                  title: intl.formatMessage({ id: 'common.status' }),
                  renderText: (record) =>
                    record.enabled
                      ? intl.formatMessage({ id: 'common.enabled' })
                      : intl.formatMessage({ id: 'pages.roles.disabled' }),
                },
                {
                  title: intl.formatMessage({ id: 'pages.roles.permissions' }),
                  renderText: (record) => record.permissions?.map((item) => item.name).join(', '),
                },
                { title: intl.formatMessage({ id: 'common.createdAt' }), dataIndex: 'createdAt' },
              ]}
            />
          ) : null,
          canCreateRole && (
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
        request={async () => {
          const data = unwrapResponse<NestWebAPI.RoleEntity[]>(await rolesControllerFindAll());
          setCurrentRows(data as unknown as Roles.Entity[]);
          return {
            data: data as unknown as Roles.Entity[],
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: isSystemAdminRole(record),
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
              selectedContainsAdminRole
                ? intl.formatMessage({ id: 'pages.roles.selectedAdminDeleteTip' })
                : undefined
            }
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsAdminRole}
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
          const success = await handleAdd(value);
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
        values={currentRow}
      />
      <Show
        open={showDetail}
        currentRow={currentRow as Roles.Entity}
        columns={columns as ProDescriptionsItemProps<Roles.Entity>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
