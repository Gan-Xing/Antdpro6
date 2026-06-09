import { permissionsControllerFindTree } from '@/services/nest-web/permissions';
import { unwrapResponse } from '@/utils/apiResponse';
import {
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Form, FormInstance, message, Spin, Tag, Tree, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import React, { useEffect, useState } from 'react';

interface Props {
  form?: FormInstance<any>;
  permissions?: { id: number; name: string }[];
  showCode?: boolean;
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
  const { form, permissions, showCode = false } = props;
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
        message.error(
          error?.response?.data?.message ??
            intl.formatMessage({ id: 'pages.roles.permissionTreeLoadFailed' }),
        );
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
        {showCode ? (
          <ProFormText
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'pages.roles.codeRequired' }),
              },
              {
                pattern: /^[a-z][a-z0-9._-]*$/,
                message: intl.formatMessage({ id: 'pages.roles.codePattern' }),
              },
            ]}
            extra={intl.formatMessage({ id: 'pages.roles.codeExtra' })}
            label={intl.formatMessage({ id: 'pages.roles.code' })}
            width="md"
            name="code"
          />
        ) : null}
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
        <ProFormDigit
          label={intl.formatMessage({ id: 'pages.roles.sort' })}
          width="sm"
          name="sort"
          min={0}
          fieldProps={{ precision: 0 }}
          initialValue={0}
        />
        <ProFormSwitch
          label={intl.formatMessage({ id: 'pages.roles.enabled' })}
          name="enabled"
          initialValue
          checkedChildren={intl.formatMessage({ id: 'common.enabled' })}
          unCheckedChildren={intl.formatMessage({ id: 'pages.roles.disabled' })}
        />
        <ProFormTextArea
          label={intl.formatMessage({ id: 'pages.roles.description' })}
          name="description"
          width="xl"
          fieldProps={{
            autoSize: { minRows: 2, maxRows: 4 },
          }}
          placeholder={intl.formatMessage({ id: 'pages.roles.descriptionPlaceholder' })}
        />
        <Form.Item
          label={intl.formatMessage({ id: 'pages.roles.permissionSelect' })}
          name="permissions"
        >
          <div style={{ minWidth: 560 }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {intl.formatMessage({ id: 'pages.roles.permissionSelectHelp' })}
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
              {intl.formatMessage(
                { id: 'pages.roles.permissionsSelected' },
                { count: selectedPermissionCount },
              )}
            </Typography.Text>
          </div>
        </Form.Item>
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
