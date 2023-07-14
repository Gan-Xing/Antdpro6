import useQueryList from '@/hooks/useQueryList';
import { addRule, queryList, removeRule, updateRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message, Select, Tag, TreeSelect } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UsersListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
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
  const hide = message.loading('Configuring');
  try {
    await updateRule(fields);
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UsersListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      id: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
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
      render: (dom) => {
        return dom ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>;
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
            options={roles?.map((role) => ({
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
      render: (dom) => {
        return dom === '在职' ? <Tag color="success">是</Tag> : <Tag color="default">否</Tag>;
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
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.searchTable.editting" defaultMessage="编辑" />
        </a>,
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
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {/* {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '} */}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button type="primary">
            <FormattedMessage
              id="pages.searchTable.batchApproval"
              defaultMessage="Batch approval"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
          defaultMessage: 'New rule',
        })}
        width="400px"
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
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.ruleName"
                  defaultMessage="Rule name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
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
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.UsersListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.UsersListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
