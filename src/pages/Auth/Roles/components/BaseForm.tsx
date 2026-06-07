import { permissionsControllerFindTree } from '@/services/nest-web/permissions';
import { unwrapResponse } from '@/utils/apiResponse';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Form, FormInstance, message, Spin, Tree } from 'antd';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';

interface Props {
  form?: FormInstance<any>;
  permissions?: { id: number; name: string }[];
}

const toCheckedPermissionKeys = (permissions?: { id: number }[]) =>
  permissions?.map((permission) => `permission:${permission.id}`) ?? [];

const collectExpandableKeys = (nodes: NestWebAPI.PermissionTreeNodeEntity[]): Key[] =>
  nodes.flatMap((node) => {
    const children = node.children ?? [];
    return children.length > 0 ? [node.key, ...collectExpandableKeys(children)] : [];
  });

const getCheckedKeys = (value: Key[] | { checked: Key[]; halfChecked: Key[] }) =>
  Array.isArray(value) ? value : value.checked;

const getPermissionIdsByKeys = (
  nodes: NestWebAPI.PermissionTreeNodeEntity[],
  checkedKeys: Key[],
): number[] => {
  const checkedKeySet = new Set(checkedKeys.map((key) => key.toString()));

  return nodes.flatMap((node) => {
    const selfPermissionId =
      node.permissionId && checkedKeySet.has(node.key) ? [node.permissionId] : [];
    const childPermissionIds = node.children
      ? getPermissionIdsByKeys(node.children, checkedKeys)
      : [];

    return [...selfPermissionId, ...childPermissionIds];
  });
};

const BaseForm: React.FC<Props> = (props) => {
  const { form, permissions } = props;
  const intl = useIntl();
  const [treeData, setTreeData] = useState<NestWebAPI.PermissionTreeNodeEntity[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<Key[] | { checked: Key[]; halfChecked: Key[] }>(
    toCheckedPermissionKeys(permissions),
  );
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  useEffect(() => {
    setCheckedKeys(toCheckedPermissionKeys(permissions));
    form?.setFieldsValue({
      permissions: permissions?.map((permission) => permission.id) ?? [],
    });
  }, [form, permissions]);

  useEffect(() => {
    let mounted = true;

    const loadPermissionTree = async () => {
      setLoadingTree(true);
      try {
        const data = unwrapResponse<NestWebAPI.PermissionTreeNodeEntity[]>(
          await permissionsControllerFindTree(),
        );
        if (!mounted) return;

        setTreeData(data);
        setExpandedKeys(collectExpandableKeys(data));
      } catch (error: any) {
        message.error(error?.response?.data?.message ?? '权限树加载失败');
      } finally {
        if (mounted) {
          setLoadingTree(false);
        }
      }
    };

    loadPermissionTree();

    return () => {
      mounted = false;
    };
  }, []);

  const onExpand = (expandedKeysValue: Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    setCheckedKeys(checkedKeysValue);

    const permissions = getPermissionIdsByKeys(treeData, getCheckedKeys(checkedKeysValue));
    form?.setFieldsValue({
      permissions,
    });
  };

  const onSelect = (selectedKeysValue: Key[]) => {
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
        <Form.Item name="permissions">
          <div>
            选择权限
            <Spin spinning={loadingTree}>
              <Tree
                checkable
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                onSelect={onSelect}
                selectedKeys={selectedKeys}
                treeData={treeData}
              />
            </Spin>
          </div>
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
