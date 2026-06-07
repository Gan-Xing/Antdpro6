import { ModalForm } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import { Form, Input } from 'antd';
import React from 'react';
import BaseForm from './BaseForm';

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: User.UpdateUserParams) => Promise<void>;
  updateModalOpen: boolean;
  values: User.UpdateUserParams;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentUser?.id;
  const protectAdminRole =
    values.id === currentUserId &&
    values.roles?.some((role: Roles.Entity) => role.name === 'admin');

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'pages.searchTable.updateForm.editUser',
        defaultMessage: '编辑用户',
      })}
      width="70%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={onSubmit}
      initialValues={{
        ...values,
        password: undefined,
        roles: values.roles?.map((role: Roles.Entity) => role.id),
        gender: values.gender?.toString(), // 将gender值从数字转换为字符串
        status: values.status ? values.status?.toString() : '1', // 将gender值从数字转换为字符串
      }}
    >
      <BaseForm protectAdminRole={protectAdminRole} />
      <Form.Item name="id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
