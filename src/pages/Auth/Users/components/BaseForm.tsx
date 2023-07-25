import useQueryList from '@/hooks/useQueryList';
import {
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
interface Props {
  newRecord?: boolean;
}
const BaseForm: React.FC<Props> = (props) => {
  const { newRecord } = props;
  const { items: departments } = useQueryList('/departments');
  const { items: roles } = useQueryList('/roles');
  const intl = useIntl();
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.username.placeholder"
                  defaultMessage="请输入用户名"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.users.username',
            defaultMessage: '姓名',
          })}
          width="md"
          name="username"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.email.placeholder"
                  defaultMessage="请输入邮箱"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.users.email',
            defaultMessage: '电子邮箱',
          })}
          width="md"
          name="email"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="gender"
          label={intl.formatMessage({
            id: 'pages.users.gender',
            defaultMessage: '性别',
          })}
          valueEnum={{
            男: '男',
            女: '女',
          }}
          width="md"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.select.rules.gender"
                  defaultMessage="请选择性别"
                />
              ),
            },
          ]}
        />
        <ProFormText
          rules={[
            {
              required: newRecord,
              message: (
                <FormattedMessage
                  id="pages.searchTable.password.placeholder"
                  defaultMessage="请输入密码"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.users.password',
            defaultMessage: '密码',
          })}
          width="md"
          name="password"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTreeSelect
          name="departmentId"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          allowClear
          width="md"
          secondary
          label={intl.formatMessage({
            id: 'pages.users.department',
            defaultMessage: '部门',
          })}
          // request={async () => {
          //   return departments;
          // }}
          // tree-select args
          fieldProps={{
            showArrow: false,
            filterTreeNode: true,
            showSearch: true,
            treeDefaultExpandAll: true,
            autoClearSearchValue: true,
            // multiple: true,
            treeNodeFilterProp: 'title',
            fieldNames: {
              label: 'title',
            },
            treeData: departments,
          }}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.select.rules.department"
                  defaultMessage="请选择部门"
                />
              ),
            },
          ]}
        />
        <ProFormSelect
          name="status"
          label={intl.formatMessage({
            id: 'pages.users.status',
            defaultMessage: '在职状态',
          })}
          valueEnum={{
            在职: '在职',
            离职: '离职',
          }}
          width="md"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.select.rules.status"
                  defaultMessage="请选择在职状态"
                />
              ),
            },
          ]}
        />
      </ProForm.Group>
      <ProFormCheckbox.Group
        name="roleIds"
        layout="horizontal"
        label={intl.formatMessage({
          id: 'pages.searchTable.users.roles.placeholder',
          defaultMessage: '请选择角色',
        })}
        options={roles?.map((role: { name: string; id: number }) => ({
          label: role.name,
          value: role.id,
        }))}
      />
    </>
  );
};

export default BaseForm;
