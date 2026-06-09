import { exportCsv } from '@/utils/csvExport';
import { formatGlobalMessage } from '@/utils/i18n';
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
          message.warning(formatGlobalMessage('common.exportEmpty', 'There is no data to export'));
          return;
        }
        exportCsv(filename, columns, rows);
      }}
    >
      {formatGlobalMessage('common.exportCurrentPage', 'Export current page')}
    </Button>
  );
}
