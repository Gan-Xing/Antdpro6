import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Drawer } from 'antd';
interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: User.UsersEntity;
  columns: ProDescriptionsItemProps<User.UsersEntity>[];
}
const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  return (
    <Drawer width="70%" open={open} onClose={onClose} closable={false}>
      {currentRow?.name && (
        <ProDescriptions<User.UsersEntity>
          column={2}
          title={currentRow?.name}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?.name,
          }}
          columns={columns as ProDescriptionsItemProps<User.UsersEntity>[]}
        />
      )}
    </Drawer>
  );
};

export default Show;
