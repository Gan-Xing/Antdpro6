import TableExportButton from '@/components/TableExportButton';
import {
  rolesControllerCreate,
  rolesControllerFindAll,
  rolesControllerRemoveMany,
  rolesControllerUpdate,
} from '@/services/nest-web/roles';
import { unwrapResponse } from '@/utils/apiResponse';
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
  const hide = message.loading('正在添加');
  try {
    await rolesControllerCreate(toCreateRoleDto(fields));
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
const handleUpdate = async (fields: Roles.UpdateParams) => {
  const hide = message.loading('正在更新');
  try {
    await rolesControllerUpdate({ id: Number(fields.id) }, toUpdateRoleDto(fields));
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
    await rolesControllerRemoveMany({ ids });
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
      title: '角色编码',
      dataIndex: 'code',
      width: 140,
      render: (dom) => (
        <Typography.Text code style={{ fontSize: 12 }}>
          {dom}
        </Typography.Text>
      ),
    },
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="名称" />,
      dataIndex: 'name',
      tip: '名称',
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
              {isSystemAdminRole(entity) ? <Tag color="blue">系统内置</Tag> : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: '职责说明',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
      renderText: (value) => value || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 90,
      hideInSearch: true,
      sorter: (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 90,
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '停用', status: 'Default' },
      },
      render: (_, entity) =>
        entity.enabled ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag>,
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
      title: <FormattedMessage id="pages.roles.users" defaultMessage="用户列表" />,
      dataIndex: 'users',
      renderText: (val) => {
        return val.map((item: { username: string }) => item.username).join(', ');
      },
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.roles.updatedTime" defaultMessage="更新时间" />,
      hideInSearch: true,
      hideInTable: true,
      dataIndex: 'updatedAt',
      valueType: 'date',
    },
    (canEditRole || canDeleteRole) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => {
        const systemAdminRole = isSystemAdminRole(record);

        return [
          canEditRole &&
            (systemAdminRole ? (
              <Tooltip key="update-disabled" title="admin 是系统管理员角色，不能在后台编辑">
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
          canDeleteRole &&
            (systemAdminRole ? (
              <Tooltip key="delete-disabled" title="admin 是系统管理员角色，不能在后台删除">
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
                { title: 'ID', dataIndex: 'id' },
                { title: '角色编码', dataIndex: 'code' },
                { title: '名称', dataIndex: 'name' },
                { title: '说明', dataIndex: 'description' },
                { title: '状态', renderText: (record) => (record.enabled ? '启用' : '停用') },
                {
                  title: '权限',
                  renderText: (record) => record.permissions?.map((item) => item.name).join(', '),
                },
                { title: '创建时间', dataIndex: 'createdAt' },
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
            title={selectedContainsAdminRole ? '已选择 admin 角色，不能批量删除' : undefined}
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsAdminRole}
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
