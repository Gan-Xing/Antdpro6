import { addItems, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { CarryOutOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Modal, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, { useRef, useState } from 'react';
import Create from './components/Create';
import Show from './components/Show';
import Update, { FormValueType } from './components/Update';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UsersListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addItems('/roles', { ...fields });
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
    await updateItem(`/roles/${fields.id}`, fields);
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
    await removeItem('/roles', {
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

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const columns = [
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="名称" />,
      dataIndex: 'name',
      tip: '名称',
      render: (dom: any, entity: any) => {
        console.log('dom,entity', dom, entity);
        const onSelect = (selectedKeys: React.Key[], info: any) => {
          console.log('selected', selectedKeys, info);
        };
        const treeData: DataNode[] = [
          {
            title: 'parent 1',
            key: '0-0',
            icon: <CarryOutOutlined />,
            children: [
              {
                title: 'parent 1-0',
                key: '0-0-0',
                icon: <CarryOutOutlined />,
                children: [
                  { title: 'leaf', key: '0-0-0-0', icon: <CarryOutOutlined /> },
                  {
                    title: (
                      <>
                        <div>multiple line title</div>
                        <div>multiple line title</div>
                      </>
                    ),
                    key: '0-0-0-1',
                    icon: <CarryOutOutlined />,
                  },
                  { title: 'leaf', key: '0-0-0-2', icon: <CarryOutOutlined /> },
                ],
              },
              {
                title: 'parent 1-1',
                key: '0-0-1',
                icon: <CarryOutOutlined />,
                children: [{ title: 'leaf', key: '0-0-1-0', icon: <CarryOutOutlined /> }],
              },
              {
                title: 'parent 1-2',
                key: '0-0-2',
                icon: <CarryOutOutlined />,
                children: [
                  { title: 'leaf', key: '0-0-2-0', icon: <CarryOutOutlined /> },
                  {
                    title: 'leaf',
                    key: '0-0-2-1',
                    icon: <CarryOutOutlined />,
                    switcherIcon: <FormOutlined />,
                  },
                ],
              },
            ],
          },
          {
            title: 'parent 2',
            key: '0-1',
            icon: <CarryOutOutlined />,
            children: [
              {
                title: 'parent 2-0',
                key: '0-1-0',
                icon: <CarryOutOutlined />,
                children: [
                  { title: 'leaf', key: '0-1-0-0', icon: <CarryOutOutlined /> },
                  { title: 'leaf', key: '0-1-0-1', icon: <CarryOutOutlined /> },
                ],
              },
            ],
          },
        ];
        return (
          <div>
            <Tree
              showLine={true}
              defaultExpandedKeys={['0-0-0']}
              onSelect={onSelect}
              treeData={treeData}
            />
          </div>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.menus.permissions" defaultMessage="绑定权限" />,
      dataIndex: 'permission',
      renderText: (val: { name: string }) => {
        return val.name;
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
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_: any, record: any) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.searchTable.editting" defaultMessage="编辑" />
        </a>,
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
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle={intl.formatMessage({
          id: 'menu.auth.menus',
          defaultMessage: '菜单管理',
        })}
        actionRef={actionRef}
        pagination={{ defaultPageSize: 10 }}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={async (params, sort, filter) => queryList('/roles', params, sort, filter)}
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
