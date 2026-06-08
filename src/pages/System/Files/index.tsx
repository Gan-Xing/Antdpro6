import {
  filesControllerFindAll,
  filesControllerGetDownloadUrl,
  filesControllerRemove,
  filesControllerUpload,
} from '@/services/nest-web/files';
import { unwrapResponse } from '@/utils/apiResponse';
import { InboxOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Modal, Space, Tag, Upload, message } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import React, { useRef } from 'react';

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const FilesPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { canUploadFiles, canDownloadFiles, canDeleteFiles } = useAccess();

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
      message.error(error?.response?.data?.message ?? '下载地址获取失败');
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
        message.success('上传成功');
        actionRef.current?.reload();
      } catch (error: any) {
        onError?.(error);
        message.error(error?.response?.data?.message ?? '上传失败');
      }
    }) satisfies UploadProps['customRequest'],
  };

  const columns: ProColumns<NestWebAPI.FileAssetEntity>[] = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      ellipsis: true,
      render: (dom, record) => (
        <a onClick={() => handleDownload(record)}>{dom || record.filename}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      width: 180,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (_, record) => record.category || '-',
    },
    {
      title: '大小',
      dataIndex: 'size',
      search: false,
      width: 110,
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: '上传人',
      dataIndex: ['uploader', 'username'],
      search: false,
      width: 130,
      render: (_, record) => record.uploader?.username || record.uploader?.email || '-',
    },
    {
      title: '状态',
      dataIndex: 'deletedAt',
      search: false,
      width: 90,
      render: (_, record) =>
        record.deletedAt ? <Tag>已删除</Tag> : <Tag color="success">可用</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      width: 180,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) =>
        [
          canDownloadFiles && (
            <a key="download" onClick={() => handleDownload(record)}>
              下载
            </a>
          ),
          canDeleteFiles && (
            <a
              key="delete"
              onClick={() => {
                Modal.confirm({
                  title: '确认删除文件？',
                  content: '删除会移除存储对象，并在文件中心标记为已删除。',
                  onOk: async () => {
                    await filesControllerRemove({ id: record.id });
                    message.success('删除成功');
                    actionRef.current?.reload();
                  },
                });
              }}
            >
              删除
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
            <p className="ant-upload-text">拖拽文件到这里，或点击上传</p>
            <p className="ant-upload-hint">单文件上限 50MB。文件中心会作为后续知识库附件复用。</p>
          </Upload.Dragger>
        ) : null}
        <ProTable<NestWebAPI.FileAssetEntity>
          headerTitle="文件中心"
          actionRef={actionRef}
          rowKey="id"
          search={{ labelWidth: 90 }}
          pagination={{ defaultPageSize: 20, showSizeChanger: true }}
          columns={columns}
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
