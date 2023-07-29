// import useQueryList from '@/hooks/useQueryList';
import useQueryList from '@/hooks/useQueryList';
import { ProForm, ProFormSelect, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { FormInstance } from 'antd';
// import type { Key } from 'react';
// import React, { useState } from 'react';

interface Props {
  form: FormInstance<any>;
  permissions?: { id: number }[];
}
const BaseForm: React.FC<Props> = () => {
  // const { form, permissions } = props;
  const intl = useIntl();
  // const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  // const [checkedKeys, setCheckedKeys] = useState<Key[] | { checked: Key[]; halfChecked: Key[] }>(
  //   permissions?.map((permission) => `permission-${permission.id}`) ?? [],
  // );
  // const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  // const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  // const { items: permissions } = useQueryList('/permissiongroups');
  // console.log(permissions);

  function transformData(data: any) {
    return data.map((item: any) => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children: item.children ? transformData(item.children) : [],
    }));
  }

  const { items: data } = useQueryList('/permissiongroups');
  const permissiongroups = transformData(data);
  console.log('permissiongroups', permissiongroups);

  // const onExpand = (expandedKeysValue: Key[]) => {
  //   console.log('onExpand', expandedKeysValue);
  //   // if not set autoExpandParent to false, if children expanded, parent can not collapse.
  //   // or, you can remove all expanded children keys.
  //   setExpandedKeys(expandedKeysValue);
  //   setAutoExpandParent(false);
  // };

  // const onCheck = (checkedKeysValue: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
  //   console.log('onCheck', checkedKeysValue);
  //   setCheckedKeys(checkedKeysValue);
  //   const permissions = (checkedKeysValue as Key[]).filter((key: Key) =>
  //     key.toString().startsWith('permission'),
  //   );
  //   const permissionIds = permissions.map((key: Key) =>
  //     Number(key.toString().replace('permission-', '')),
  //   );
  //   form.setFieldsValue({
  //     permissionIds,
  //   });
  // };

  // const onSelect = (selectedKeysValue: Key[], info: any) => {
  //   console.log('onSelect', info);
  //   setSelectedKeys(selectedKeysValue);
  // };
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.name.placeholder"
                  defaultMessage="请输入名称"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.roles.name',
            defaultMessage: '名称',
          })}
          width="md"
          name="name"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.path.placeholder"
                  defaultMessage="请输入路径"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.permissions.path',
            defaultMessage: '请求路径',
          })}
          width="md"
          name="path"
        />
        <ProFormSelect
          name="action"
          label={intl.formatMessage({
            id: 'pages.permissions.method',
            defaultMessage: '请求方法',
          })}
          valueEnum={{
            GET: 'GET',
            POST: 'POST',
            DELETE: 'DELETE',
            PUT: 'PUT',
            PATCH: 'PATCH',
          }}
          width="md"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          rules={[
            {
              required: true,
              message: <FormattedMessage id="pages.placeholder" defaultMessage="请输入！" />,
            },
          ]}
        />
        <ProFormTreeSelect
          name="permissionGroupId"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          allowClear
          width="md"
          secondary
          label={intl.formatMessage({
            id: 'pages.permissions.permissionGroup',
            defaultMessage: ' 选择权限组',
          })}
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
            treeData: permissiongroups,
          }}
          rules={[
            {
              required: true,
              message: <FormattedMessage id="pages.placeholder" defaultMessage="请输入！" />,
            },
          ]}
        />
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
