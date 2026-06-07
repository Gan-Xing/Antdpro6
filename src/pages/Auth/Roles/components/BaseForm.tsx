import { permissionsControllerFindTree } from '@/services/nest-web/permissions';
import { unwrapResponse } from '@/utils/apiResponse';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Form, FormInstance, message, Spin, Tag, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';

interface Props {
  form?: FormInstance<any>;
  permissions?: { id: number; name: string }[];
}

const toCheckedPermissionKeys = (permissions?: { id: number }[]) =>
  permissions?.map((permission) => `permission:${permission.id}`) ?? [];

const actionTagColors: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'orange',
  DELETE: 'red',
};

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

const renderPermissionTitle = (node: NestWebAPI.PermissionTreeNodeEntity) => {
  if (!node.permissionId) {
    return <Typography.Text strong>{node.title}</Typography.Text>;
  }

  const action = node.action?.toUpperCase();

  return (
    <span
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <Typography.Text>{node.title}</Typography.Text>
      {action ? (
        <Tag color={actionTagColors[action] ?? 'default'} style={{ marginInlineEnd: 0 }}>
          {action}
        </Tag>
      ) : null}
      {node.code ? (
        <Typography.Text code type="secondary" style={{ fontSize: 12 }}>
          {node.code}
        </Typography.Text>
      ) : null}
    </span>
  );
};

const renderPermissionTreeData = (nodes: NestWebAPI.PermissionTreeNodeEntity[]): DataNode[] =>
  nodes.map((node) => ({
    ...node,
    title: renderPermissionTitle(node),
    children: node.children ? renderPermissionTreeData(node.children) : undefined,
  }));

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

  const selectedPermissionCount = getPermissionIdsByKeys(
    treeData,
    getCheckedKeys(checkedKeys),
  ).length;

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
        <Form.Item label="选择权限" name="permissions">
          <div style={{ minWidth: 560 }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              按菜单分组授权。日常只需要勾选业务动作；权限码用于排查接口授权问题。
            </Typography.Paragraph>
            <Spin spinning={loadingTree}>
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  maxHeight: 420,
                  overflow: 'auto',
                  padding: '8px 12px',
                }}
              >
                <Tree
                  autoExpandParent={autoExpandParent}
                  blockNode
                  checkable
                  checkedKeys={checkedKeys}
                  expandedKeys={expandedKeys}
                  onCheck={onCheck}
                  onExpand={onExpand}
                  onSelect={onSelect}
                  selectedKeys={selectedKeys}
                  showLine
                  treeData={renderPermissionTreeData(treeData)}
                />
              </div>
            </Spin>
            <Typography.Text type="secondary">
              已选择 {selectedPermissionCount} 个权限
            </Typography.Text>
          </div>
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
