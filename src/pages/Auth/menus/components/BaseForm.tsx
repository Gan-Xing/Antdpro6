import useQueryList from '@/hooks/useQueryList';
import { ProForm, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
// import { FormInstance } from 'antd';
import React from 'react';

interface Props {
  // form: FormInstance<any>;
  permissions?: { id: number }[];
}

interface MenuItem {
  id: number;
  name: string;
  children?: MenuItem[];
}

interface TransformedMenuItem {
  title: string;
  value: number;
  key: number;
  children?: TransformedMenuItem[];
}

function transformData(data: MenuItem[]): TransformedMenuItem[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data.map((item: MenuItem) => ({
    title: item.name,
    value: item.id,
    key: item.id,
    children: item.children ? transformData(item.children) : undefined,
  }));
}

const BaseForm: React.FC<Props> = () => {
  const intl = useIntl();
  const { items: menusdata } = useQueryList('/menus');

  const rawData = menusdata as any;
  const realData = (rawData?.data || []) as MenuItem[];
  const menus = transformData(realData);

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
        <ProFormTreeSelect
          name="parentId"
          placeholder={intl.formatMessage({
            id: 'pages.searchTable.select.placeholder',
            defaultMessage: '请选择',
          })}
          allowClear
          width="md"
          secondary
          label={intl.formatMessage({
            id: 'pages.menus.parentid',
            defaultMessage: '上级菜单',
          })}
          fieldProps={{
            showArrow: true, // 修改为显示箭头
            filterTreeNode: true,
            showSearch: true,
            treeDefaultExpandAll: true,
            autoClearSearchValue: true,
            treeNodeFilterProp: 'title',
            fieldNames: {
              label: 'title',
              value: 'value',
              children: 'children',
            },
            treeData: menus,
          }}
        />
      </ProForm.Group>
    </>
  );
};

export default BaseForm;
