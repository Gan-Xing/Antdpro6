import { ModalForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Form, Input } from 'antd';
import React from 'react';
import BaseForm from './BaseForm';

export type FormValueType = Partial<User.UsersEntity>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<User.UsersEntity>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const intl = useIntl();
  const [form] = Form.useForm();
  return (
    <ModalForm
      form={form}
      title={intl.formatMessage({
        id: 'pages.searchTable.createForm.newUser',
        defaultMessage: '新建用户',
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
      }}
    >
      <BaseForm permissions={values.permissions} form={form} />
      <Form.Item name="id" label={false}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;