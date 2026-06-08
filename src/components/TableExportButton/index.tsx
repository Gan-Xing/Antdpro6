import { exportCsv } from '@/utils/csvExport';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';

type ExportColumn<T> = {
  title: string;
  dataIndex?: keyof T | string;
  renderText?: (record: T) => unknown;
};

type TableExportButtonProps<T extends Record<string, any>> = {
  filename: string;
  columns: ExportColumn<T>[];
  rows: T[];
  disabled?: boolean;
};

export default function TableExportButton<T extends Record<string, any>>({
  filename,
  columns,
  rows,
  disabled,
}: TableExportButtonProps<T>) {
  return (
    <Button
      icon={<DownloadOutlined />}
      disabled={disabled}
      onClick={() => {
        if (!rows.length) {
          message.warning('当前没有可导出的数据');
          return;
        }
        exportCsv(filename, columns, rows);
      }}
    >
      导出当前页
    </Button>
  );
}
