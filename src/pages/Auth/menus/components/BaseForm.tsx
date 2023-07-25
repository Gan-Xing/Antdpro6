import useQueryList from '@/hooks/useQueryList';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Form, FormInstance, Tree } from 'antd';
import type { Key } from 'react';
import React, { useState } from 'react';

interface Props {
  form: FormInstance<any>;
  permissions?: { id: number }[];
}
const BaseForm: React.FC<Props> = (props) => {
  const { form, permissions } = props;
  const intl = useIntl();
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<Key[] | { checked: Key[]; halfChecked: Key[] }>(
    permissions?.map((permission) => `permission-${permission.id}`) ?? [],
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  const { items: permission_groups } = useQueryList('/permission_groups');
  const onExpand = (expandedKeysValue: Key[]) => {
    console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
    const permissions = (checkedKeysValue as Key[]).filter((key: Key) =>
      key.toString().startsWith('permission'),
    );
    const permissionIds = permissions.map((key: Key) =>
      Number(key.toString().replace('permission-', '')),
    );
    form.setFieldsValue({
      permissionIds,
    });
  };

  const onSelect = (selectedKeysValue: Key[], info: any) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };
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
        <Form.Item name="permissionIds">
          <div>
            选择权限
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={permission_groups}
            />
          </div>
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
