import {
  menusControllerCreate,
  menusControllerFindAllPaged,
  menusControllerRemoveByIds,
  menusControllerUpdate,
} from '@/services/nest-web/menus';
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import { formatGlobalMessage } from '@/utils/i18n';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Alert, Button, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update from './components/Update';

const systemManagedMenuCodes = new Set([
  'dashboard',
  'message.center',
  'auth',
  'auth.users',
  'auth.roles',
  'auth.permissions',
  'auth.menus',
  'resources',
  'resources.images',
  'system',
  'system.logs',
  'system.dicts',
  'system.config',
  'system.files',
  'system.status',
  'system.version',
  'system.queues',
  'security',
  'security.loginLogs',
  'approval.requests',
  'common.export',
  'account',
  'account.profile',
]);

const isSystemManagedMenu = (menu?: Partial<Menus.MenusType>) =>
  Boolean(menu?.code && systemManagedMenuCodes.has(menu.code));

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: Menus.MenusType) => {
  const hide = message.loading(formatGlobalMessage('common.loading.add', 'Adding'));
  try {
    await menusControllerCreate(fields as unknown as NestWebAPI.CreateMenuDto);
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
const handleUpdate = async (fields: any) => {
  const hide = message.loading(formatGlobalMessage('common.loading.update', 'Updating'));
  try {
    await menusControllerUpdate({ id: fields.id }, fields as NestWebAPI.UpdateMenuDto);
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
    await menusControllerRemoveByIds({ ids });
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
  const [currentRow, setCurrentRow] = useState<Menus.MenusType>();
  const [selectedRowsState, setSelectedRows] = useState<Menus.MenusType[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const { canCreateMenu, canDeleteMenu, canEditMenu, canExportData } = useAccess();
  const [currentRows, setCurrentRows] = useState<Menus.MenusType[]>([]);
  const rawColumns: Array<ProColumns<Menus.MenusType> | false> = [
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="Name" />,
      dataIndex: 'name',
      tip: intl.formatMessage({ id: 'pages.roles.name' }),
      ellipsis: true,
      render: (dom: any, entity: any) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            <Space size={8}>
              {dom}
              {isSystemManagedMenu(entity) ? (
                <Tag color="blue">{intl.formatMessage({ id: 'common.systemManaged' })}</Tag>
              ) : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.menus.code' }),
      dataIndex: 'code',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.menus.path' }),
      dataIndex: 'path',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="Created At" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      ellipsis: true, // 添加此属性
    },
    {
      title: <FormattedMessage id="pages.roles.updatedTime" defaultMessage="Updated At" />,
      hideInSearch: true,
      // hideInTable: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      ellipsis: true, // 添加此属性
    },
    (canEditMenu || canDeleteMenu) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const systemManaged = isSystemManagedMenu(record);

        return [
          canEditMenu &&
            (systemManaged ? (
              <Tooltip
                key="update-disabled"
                title={intl.formatMessage({ id: 'pages.menus.systemManagedEditTip' })}
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
                  setCurrentRow((prevState) => ({ ...prevState, ...record }));
                }}
              >
                <FormattedMessage id="pages.searchTable.editting" defaultMessage="编辑" />
              </a>
            )),
          canDeleteMenu &&
            (systemManaged ? (
              <Tooltip
                key="delete-disabled"
                title={intl.formatMessage({ id: 'pages.menus.systemManagedDeleteTip' })}
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
  const columns = rawColumns.filter(Boolean) as ProColumns<Menus.MenusType>[];

  const processChildren = (items: Menus.MenusType[]): any => {
    return items.map((item: Menus.MenusType) => {
      if (item.children && item.children.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { children, ...newItem } = item; // remove `children` from item
        return newItem;
      } else if (item.children) {
        return { ...item, children: processChildren(item.children) };
      }
      return item;
    });
  };

  const selectedContainsSystemManagedMenu = selectedRowsState.some(isSystemManagedMenu);

  return (
    <PageContainer>
      <Alert
        showIcon
        type="warning"
        message={intl.formatMessage({ id: 'pages.menus.systemManagedAlertTitle' })}
        description={intl.formatMessage({ id: 'pages.menus.systemManagedAlertDescription' })}
        style={{ marginBottom: 16 }}
      />
      <ProTable
        headerTitle={intl.formatMessage({
          id: 'menu.auth.menus',
          defaultMessage: '菜单管理',
        })}
        actionRef={actionRef}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '30', '50'], // 提供更多的选择项
          showSizeChanger: true, // 允许用户更改每页的记录数
        }}
        rowKey="id"
        search={{
          labelWidth: 80,
        }}
        toolBarRender={() => [
          canExportData ? (
            <TableExportButton<Menus.MenusType>
              key="export"
              filename="menus.csv"
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'pages.menus.code' }), dataIndex: 'code' },
                { title: intl.formatMessage({ id: 'common.name' }), dataIndex: 'name' },
                { title: intl.formatMessage({ id: 'pages.menus.path' }), dataIndex: 'path' },
                { title: intl.formatMessage({ id: 'pages.menus.icon' }), dataIndex: 'icon' },
                { title: intl.formatMessage({ id: 'common.sort' }), dataIndex: 'sort' },
                { title: intl.formatMessage({ id: 'common.createdAt' }), dataIndex: 'createdAt' },
              ]}
            />
          ) : null,
          canCreateMenu && (
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
            await menusControllerFindAllPaged({
              ...params,
              current: params.current || 1, // 添加默认值
              ...filter,
            } as NestWebAPI.MenusControllerFindAllPagedParams),
          );
          const processedData = processChildren(data.data);
          setCurrentRows(processedData);
          return {
            data: processedData,
            current: data.pagination.current,
            pageSize: data.pagination.pageSize,
            total: data.pagination.total,
          };
        }}
        columns={columns}
        expandable={{}}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: isSystemManagedMenu(record),
          }),
          onChange: (_, selectedRows: Menus.MenusType[]) => {
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
              selectedContainsSystemManagedMenu
                ? intl.formatMessage({ id: 'pages.menus.selectedSystemManagedDeleteTip' })
                : undefined
            }
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsSystemManagedMenu}
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

      <Create
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as Menus.MenusType);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      />
      <Show
        open={showDetail}
        currentRow={currentRow as Menus.MenusType}
        columns={columns as ProDescriptionsItemProps<Menus.MenusType>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
