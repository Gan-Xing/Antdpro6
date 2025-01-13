import { ProDescriptions } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React from 'react';

interface PhotoLog {
  id: number;
  description: string;
  area: string;
  photos: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  stakeNumber?: string;
  offset?: number;
  category: '安全' | '质量' | '进度';
  tags: string[];
  createdAt: string;
  createdBy: {
    id: number;
    username: string;
    avatar: string;
  };
}

interface ShowProps {
  open: boolean;
  currentRow: PhotoLog;
  columns: any[];
  onClose: () => void;
}

const Show: React.FC<ShowProps> = (props) => {
  const { open, currentRow, columns, onClose } = props;

  return (
    <Drawer width={600} open={open} onClose={onClose} closable={false}>
      {currentRow?.id && (
        <ProDescriptions<PhotoLog>
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
