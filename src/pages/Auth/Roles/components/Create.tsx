import { ModalForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';
import BaseForm from './BaseForm';
interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}
const Create: React.FC<Props> = (props) => {
  const { open, onOpenChange, onFinish } = props;
  const intl = useIntl();
  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'pages.searchTable.createForm.newRole',
        defaultMessage: '新建角色',
      })}
      width="70%"
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
    >
      <BaseForm />
    </ModalForm>
  );
};

export default Create;
