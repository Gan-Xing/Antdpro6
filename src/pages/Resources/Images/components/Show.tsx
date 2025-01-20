import { ProDescriptions } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React from 'react';

interface ShowProps {
  open: boolean;
  currentRow: Images.Entity;
  columns: any[];
  onClose: () => void;
}

const Show: React.FC<ShowProps> = (props) => {
  const { open, currentRow, columns, onClose } = props;

  return (
    <Drawer width={600} open={open} onClose={onClose} closable={false}>
      {currentRow?.id && (
        <ProDescriptions<Images.Entity>
          column={2}
          title={currentRow?.description}
          dataSource={currentRow}
          columns={columns}
        />
      )}
    </Drawer>
  );
};

export default Show;
