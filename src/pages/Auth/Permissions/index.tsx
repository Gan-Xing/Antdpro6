import {
  permissionsControllerCreate,
  permissionsControllerFindAll,
  permissionsControllerRemoveMany,
  permissionsControllerUpdate,
} from '@/services/nest-web/permissions';
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Alert, Button, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update, { FormValueType } from './components/Update';

const systemManagedPermissionCodes = new Set([
  'dashboard.view',
  'message.view',
  'message.manage',
  'message.complete',
  'auth.users.view',
  'auth.users.create',
  'auth.users.update',
  'auth.users.delete',
  'auth.roles.view',
  'auth.roles.create',
  'auth.roles.update',
  'auth.roles.delete',
  'auth.permissions.view',
  'auth.permissions.create',
  'auth.permissions.update',
  'auth.permissions.delete',
  'auth.menus.view',
  'auth.menus.create',
  'auth.menus.update',
  'auth.menus.delete',
  'resources.images.view',
  'resources.images.detail',
  'resources.images.create',
  'resources.images.upload',
  'resources.images.update',
  'resources.images.delete',
  'system.logs.view',
  'system.logs.detail',
  'system.logs.export',
  'system.logs.delete',
  'system.dicts.view',
  'system.dicts.create',
  'system.dicts.update',
  'system.dicts.delete',
  'system.config.view',
  'system.config.update',
  'system.files.view',
  'system.files.upload',
  'system.files.download',
  'system.files.delete',
  'system.status.view',
  'system.version.view',
  'system.queues.view',
  'security.loginLogs.view',
  'approval.requests.view',
  'approval.requests.create',
  'approval.requests.approve',
  'approval.requests.reject',
  'approval.requests.cancel',
  'approval.requests.manage',
  'account.profile.view',
  'account.profile.update',
  'account.password.change',
  'export.data',
]);

const isSystemManagedPermission = (permission?: Partial<Permissions.Entity>) =>
  Boolean(permission?.code && systemManagedPermissionCodes.has(permission.code));

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: Permissions.CreateParams) => {
  const hide = message.loading('正在添加');
  try {
    await permissionsControllerCreate(fields as NestWebAPI.CreatePermissionDto);
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
    await permissionsControllerUpdate(
      { id: fields.id! },
      fields as unknown as NestWebAPI.UpdatePermissionDto,
    );
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
    await permissionsControllerRemoveMany({ ids });
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
  const [currentRow, setCurrentRow] = useState<Permissions.Entity>();
  const [selectedRowsState, setSelectedRows] = useState<Permissions.Entity[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const { canEditPermission, canDeletePermission, canCreatePermission, canExportData } =
    useAccess();
  const [currentRows, setCurrentRows] = useState<Permissions.Entity[]>([]);
  const rawColumns: Array<ProColumns<Permissions.Entity> | false> = [
    {
      title: <FormattedMessage id="pages.permission.name" defaultMessage="权限名称" />,
      dataIndex: 'name',
      tip: '名称',
      sorter: (a: Permissions.Entity, b: Permissions.Entity) => a.name.localeCompare(b.name), // 添加这一行
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
              {isSystemManagedPermission(entity) ? <Tag color="blue">系统内置</Tag> : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
      render: (dom) => (
        <Typography.Text code style={{ fontSize: 12 }}>
          {dom}
        </Typography.Text>
      ),
    },
    {
      title: '请求方法',
      dataIndex: 'action',
      width: 96,
      hideInSearch: true,
      render: (_, record) => <Tag>{record.action}</Tag>,
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.permissions.group" defaultMessage="所属权限组" />,
      dataIndex: 'permissionGroup',
      renderText: (val) => {
        return `${val?.parent?.name ? `${val.parent.name}-` : ''}${val?.name ?? ''}`;
      },
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    (canDeletePermission || canEditPermission) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => {
        const systemManaged = isSystemManagedPermission(record);

        return [
          canEditPermission &&
            (systemManaged ? (
              <Tooltip key="update-disabled" title="系统内置权限由代码种子维护，不能在后台编辑">
                <Typography.Text type="secondary">编辑</Typography.Text>
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
          canDeletePermission &&
            (systemManaged ? (
              <Tooltip key="delete-disabled" title="系统内置权限由代码种子维护，不能在后台删除">
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
        ].filter(Boolean);
      },
    },
  ];
  const columns = rawColumns.filter(Boolean) as ProColumns<Permissions.Entity>[];
  const selectedContainsSystemManagedPermission = selectedRowsState.some(isSystemManagedPermission);

  return (
    <PageContainer>
      <Alert
        showIcon
        type="warning"
        message="内部维护入口"
        description="系统内置权限由后端代码种子维护，后台只允许查看和分配给角色，不能编辑或删除。新增权限仅用于临时扩展，正式权限建议通过代码种子管理。"
        style={{ marginBottom: 16 }}
      />
      <ProTable<Permissions.Entity, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'menu.auth.permissions',
          defaultMessage: '权限管理',
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
        toolBarRender={() => [
          canExportData ? (
            <TableExportButton<Permissions.Entity>
              key="export"
              filename="permissions.csv"
              rows={currentRows}
              columns={[
                { title: 'ID', dataIndex: 'id' },
                { title: '权限编码', dataIndex: 'code' },
                { title: '权限名称', dataIndex: 'name' },
                { title: '请求方法', dataIndex: 'action' },
                { title: '请求路径', dataIndex: 'path' },
                {
                  title: '权限组',
                  renderText: (record) =>
                    `${record.permissionGroup?.parent?.name ? `${record.permissionGroup.parent.name}-` : ''}${
                      record.permissionGroup?.name ?? ''
                    }`,
                },
                { title: '创建时间', dataIndex: 'createdAt' },
              ]}
            />
          ) : null,
          canCreatePermission && (
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
          const data = unwrapResponse<NestWebAPI.PermissionEntity[]>(
            await permissionsControllerFindAll(),
          );
          setCurrentRows(data as Permissions.Entity[]);
          return {
            data: data as Permissions.Entity[],
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: isSystemManagedPermission(record),
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
              selectedContainsSystemManagedPermission
                ? '已选择系统内置权限，不能批量删除'
                : undefined
            }
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsSystemManagedPermission}
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
          const success = await handleAdd(value as Permissions.CreateParams);
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
        currentRow={currentRow as Permissions.Entity}
        columns={columns as ProDescriptionsItemProps<Permissions.Entity>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
