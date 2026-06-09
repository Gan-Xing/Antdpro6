import {
  filesControllerFindAll,
  filesControllerGetDownloadUrl,
  filesControllerRemove,
  filesControllerUpload,
} from '@/services/nest-web/files';
import TableExportButton from '@/components/TableExportButton';
import { unwrapResponse } from '@/utils/apiResponse';
import { InboxOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useAccess, useIntl } from '@umijs/max';
import { Modal, Space, Tag, Upload, message } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import React, { useRef, useState } from 'react';

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const FilesPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { canUploadFiles, canDownloadFiles, canDeleteFiles, canExportData } = useAccess();
  const intl = useIntl();
  const [currentRows, setCurrentRows] = useState<NestWebAPI.FileAssetEntity[]>([]);

  const handleDownload = async (record: NestWebAPI.FileAssetEntity) => {
    try {
      const data = unwrapResponse<NestWebAPI.FileDownloadEntity>(
        await filesControllerGetDownloadUrl({ id: record.id }),
      );
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.download = data.originalName;
      link.click();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.files.downloadUrlFailed' }),
      );
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    customRequest: (async (options) => {
      const { file, onError, onSuccess } = options;
      try {
        const uploaded = await filesControllerUpload({}, file as File);
        onSuccess?.(uploaded as any);
        message.success(intl.formatMessage({ id: 'pages.files.uploadSuccess' }));
        actionRef.current?.reload();
      } catch (error: any) {
        onError?.(error);
        message.error(
          error?.response?.data?.message ?? intl.formatMessage({ id: 'pages.files.uploadFailed' }),
        );
      }
    }) satisfies UploadProps['customRequest'],
  };

  const columns: ProColumns<NestWebAPI.FileAssetEntity>[] = [
    {
      title: intl.formatMessage({ id: 'pages.files.fileName' }),
      dataIndex: 'originalName',
      ellipsis: true,
      render: (dom, record) => (
        <a onClick={() => handleDownload(record)}>{dom || record.filename}</a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.files.mimeType' }),
      dataIndex: 'mimeType',
      width: 180,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.files.category' }),
      dataIndex: 'category',
      width: 120,
      render: (_, record) => record.category || '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.files.size' }),
      dataIndex: 'size',
      search: false,
      width: 110,
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: intl.formatMessage({ id: 'pages.files.uploader' }),
      dataIndex: ['uploader', 'username'],
      search: false,
      width: 130,
      render: (_, record) => record.uploader?.username || record.uploader?.email || '-',
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'deletedAt',
      search: false,
      width: 90,
      render: (_, record) =>
        record.deletedAt ? (
          <Tag>{intl.formatMessage({ id: 'common.deleted' })}</Tag>
        ) : (
          <Tag color="success">{intl.formatMessage({ id: 'pages.files.available' })}</Tag>
        ),
    },
    {
      title: intl.formatMessage({ id: 'pages.files.uploadTime' }),
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      width: 180,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      valueType: 'option',
      width: 150,
      render: (_, record) =>
        [
          canDownloadFiles && (
            <a key="download" onClick={() => handleDownload(record)}>
              {intl.formatMessage({ id: 'common.download' })}
            </a>
          ),
          canDeleteFiles && (
            <a
              key="delete"
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.files.confirmDeleteTitle' }),
                  content: intl.formatMessage({ id: 'pages.files.confirmDeleteContent' }),
                  onOk: async () => {
                    await filesControllerRemove({ id: record.id });
                    message.success(intl.formatMessage({ id: 'common.message.deleteSuccess' }));
                    actionRef.current?.reload();
                  },
                });
              }}
            >
              {intl.formatMessage({ id: 'common.delete' })}
            </a>
          ),
        ].filter(Boolean),
    },
  ];

  return (
    <PageContainer>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {canUploadFiles ? (
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {intl.formatMessage({ id: 'pages.files.uploadText' })}
            </p>
            <p className="ant-upload-hint">
              {intl.formatMessage({ id: 'pages.files.uploadHint' })}
            </p>
          </Upload.Dragger>
        ) : null}
        <ProTable<NestWebAPI.FileAssetEntity>
          headerTitle={intl.formatMessage({ id: 'pages.files.title' })}
          actionRef={actionRef}
          rowKey="id"
          search={{ labelWidth: 90 }}
          pagination={{ defaultPageSize: 20, showSizeChanger: true }}
          columns={columns}
          toolBarRender={() => [
            canExportData ? (
              <TableExportButton<NestWebAPI.FileAssetEntity>
                key="export"
                filename="files.csv"
                rows={currentRows}
                columns={[
                  { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                  {
                    title: intl.formatMessage({ id: 'pages.files.fileName' }),
                    dataIndex: 'originalName',
                  },
                  {
                    title: intl.formatMessage({ id: 'pages.files.mimeType' }),
                    dataIndex: 'mimeType',
                  },
                  {
                    title: intl.formatMessage({ id: 'pages.files.category' }),
                    dataIndex: 'category',
                  },
                  { title: intl.formatMessage({ id: 'pages.files.size' }), dataIndex: 'size' },
                  {
                    title: intl.formatMessage({ id: 'pages.files.uploader' }),
                    renderText: (record) => record.uploader?.username ?? record.uploader?.email,
                  },
                  {
                    title: intl.formatMessage({ id: 'pages.files.uploadTime' }),
                    dataIndex: 'createdAt',
                  },
                ]}
              />
            ) : null,
          ]}
          request={async (params) => {
            const [startTime, endTime] = (params.createdAt as string[]) || [];
            const result = unwrapResponse<any>(
              await filesControllerFindAll({
                current: params.current,
                pageSize: params.pageSize,
                keyword: params.keyword as string,
                category: params.category as string,
                mimeType: params.mimeType as string,
                startTime,
                endTime,
              }),
            );
            setCurrentRows(result.data ?? []);
            return {
              data: result.data,
              success: true,
              total: result.pagination.total,
            };
          }}
        />
      </Space>
    </PageContainer>
  );
};

export default FilesPage;
