import { addItems, queryList } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message } from 'antd';
import React, { useRef, useState } from 'react';
import Create from './components/Create';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UsersListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addItems('/menus', { ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const columns = [
    {
      title: <FormattedMessage id="pages.roles.name" defaultMessage="名称" />,
      dataIndex: 'name',
      tip: '名称',
    },
    {
      title: <FormattedMessage id="pages.menus.permissions" defaultMessage="绑定权限" />,
      dataIndex: 'name',
      renderText: (val: any) => {
        return val;
      },
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.users.createTime" defaultMessage="创建时间" />,
      hideInSearch: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
  ];

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
        request={async (params, sort, filter) => {
          const { data } = await queryList('/menus', params, sort, filter);
          const processedData = processChildren(data);
          return { data: processedData };
        }}
        columns={columns}
        expandable={{}}
      />
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
    </PageContainer>
  );
};

export default TableList;
