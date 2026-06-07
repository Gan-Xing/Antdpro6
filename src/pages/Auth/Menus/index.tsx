import {
  menusControllerCreate,
  menusControllerFindAllPaged,
  menusControllerRemoveByIds,
  menusControllerUpdate,
} from '@/services/nest-web/menus';
import { unwrapResponse } from '@/utils/apiResponse';
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
  'auth',
  'auth.users',
  'auth.roles',
  'auth.permissions',
  'auth.menus',
  'resources',
  'resources.images',
  'system',
  'system.logs',
]);

const isSystemManagedMenu = (menu?: Partial<Menus.MenusType>) =>
  Boolean(menu?.code && systemManagedMenuCodes.has(menu.code));

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: Menus.MenusType) => {
  const hide = message.loading('正在添加');
  try {
    await menusControllerCreate(fields as unknown as NestWebAPI.CreateMenuDto);
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
const handleUpdate = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await menusControllerUpdate({ id: fields.id }, fields as NestWebAPI.UpdateMenuDto);
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
    await menusControllerRemoveByIds({ ids });
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
  const [currentRow, setCurrentRow] = useState<Menus.MenusType>();
  const [selectedRowsState, setSelectedRows] = useState<Menus.MenusType[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const { canCreateMenu, canDeleteMenu, canEditMenu } = useAccess();
  const rawColumns: Array<ProColumns<Menus.MenusType> | false> = [
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="名称" />,
      dataIndex: 'name',
      tip: '名称',
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
              {isSystemManagedMenu(entity) ? <Tag color="blue">系统内置</Tag> : null}
            </Space>
          </a>
        );
      },
    },
    {
      title: '菜单编码',
      dataIndex: 'code',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      ellipsis: true, // 添加此属性
    },
    {
      title: <FormattedMessage id="pages.roles.updatedTime" defaultMessage="更新时间" />,
      hideInSearch: true,
      // hideInTable: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      ellipsis: true, // 添加此属性
    },
    (canEditMenu || canDeleteMenu) && {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const systemManaged = isSystemManagedMenu(record);

        return [
          canEditMenu &&
            (systemManaged ? (
              <Tooltip key="update-disabled" title="系统内置菜单由代码种子维护，不能在后台编辑">
                <Typography.Text type="secondary">编辑</Typography.Text>
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
              <Tooltip key="delete-disabled" title="系统内置菜单由代码种子维护，不能在后台删除">
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
        message="内部维护入口"
        description="系统内置菜单由后端种子配置维护，后台只允许查看，不能编辑或删除。新增菜单仅用于临时扩展，正式菜单建议通过代码种子管理。"
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
              selectedContainsSystemManagedMenu ? '已选择系统内置菜单，不能批量删除' : undefined
            }
          >
            <Button
              type="primary"
              danger
              disabled={selectedContainsSystemManagedMenu}
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
