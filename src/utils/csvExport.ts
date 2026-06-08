type CsvColumn<T> = {
  title: string;
  dataIndex?: keyof T | string;
  renderText?: (record: T) => unknown;
};

const csvCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export function exportCsv<T extends Record<string, any>>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
) {
  const visibleColumns = columns.filter((column) => column.title);
  const header = visibleColumns.map((column) => csvCell(column.title)).join(',');
  const body = rows
    .map((row) =>
      visibleColumns
        .map((column) => {
          if (column.renderText) {
            return csvCell(column.renderText(row));
          }

          const dataIndex = column.dataIndex;
          return csvCell(dataIndex ? row[dataIndex as keyof T] : '');
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([`\uFEFF${header}\n${body}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
