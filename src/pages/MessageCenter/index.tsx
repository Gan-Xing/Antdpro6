import TableExportButton from '@/components/TableExportButton';
import {
  messagesControllerCancelTodo,
  messagesControllerCompleteTodo,
  messagesControllerFindAll,
  messagesControllerMarkAllRead,
  messagesControllerMarkRead,
} from '@/services/nest-web/messages';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
import { Button, message, Modal, Space, Tabs, Tag, Typography } from 'antd';
import React, { useRef, useState } from 'react';

type MessageCategory = NestWebAPI.MessageEntity['category'];

const messageCategoryMap: Record<MessageCategory, { text: string; color: string }> = {
  SYSTEM: { text: '系统', color: 'blue' },
  SECURITY: { text: '安全', color: 'red' },
  APPROVAL: { text: '审批', color: 'purple' },
  TASK: { text: '任务', color: 'geekblue' },
  CUSTOM: { text: '自定义', color: 'default' },
};

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const renderMessageState = (record: NestWebAPI.MessageEntity) => {
  if (record.cancelledAt) {
    return <Tag color="default">已取消</Tag>;
  }
  if (record.completedAt) {
    return <Tag color="success">已完成</Tag>;
  }
  if (record.type === 'TODO') {
    return <Tag color="processing">待处理</Tag>;
  }
  if (record.readAt) {
    return <Tag color="success">已读</Tag>;
  }
  return <Tag color="warning">未读</Tag>;
};

const queryByTab = (tab: string): Partial<NestWebAPI.MessagesControllerFindAllParams> => {
  if (tab === 'todos') {
    return { type: 'TODO', state: 'pending' };
  }
  if (tab === 'done') {
    return { type: 'TODO', state: 'done' };
  }
  return { type: 'NOTIFICATION' };
};

const MessageCenter: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [activeTab, setActiveTab] = useState('todos');
  const [currentRows, setCurrentRows] = useState<NestWebAPI.MessageEntity[]>([]);

  const reload = () => actionRef.current?.reload();

  const handleMarkRead = async (id: number) => {
    try {
      unwrapResponse(await messagesControllerMarkRead({ id }));
      message.success('已标记为已读');
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '操作失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = unwrapResponse<{ count: number }>(await messagesControllerMarkAllRead());
      message.success(`已标记 ${result.count} 条通知`);
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '操作失败');
    }
  };

  const handleComplete = async (record: NestWebAPI.MessageEntity) => {
    try {
      unwrapResponse(await messagesControllerCompleteTodo({ id: record.id }));
      message.success('待办已完成');
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '操作失败');
    }
  };

  const handleCancel = async (record: NestWebAPI.MessageEntity) => {
    Modal.confirm({
      title: '确认取消待办？',
      content: record.title,
      okText: '确认取消',
      cancelText: '返回',
      onOk: async () => {
        try {
          unwrapResponse(await messagesControllerCancelTodo({ id: record.id }));
          message.success('待办已取消');
          reload();
        } catch (error: any) {
          message.error(error?.response?.data?.message ?? '操作失败');
          return Promise.reject(error);
        }
      },
    });
  };

  const columns: ProColumns<NestWebAPI.MessageEntity>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (dom, record) => (
        <Space size={8}>
          <Typography.Text strong={record.type === 'TODO' && !record.completedAt}>
            {dom}
          </Typography.Text>
          {record.businessType ? (
            <Typography.Text type="secondary" code>
              {record.businessType}
            </Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      valueEnum: {
        SYSTEM: { text: '系统' },
        SECURITY: { text: '安全' },
        APPROVAL: { text: '审批' },
        TASK: { text: '任务' },
        CUSTOM: { text: '自定义' },
      },
      render: (_, record) => {
        const category = messageCategoryMap[record.category];
        return <Tag color={category.color}>{category.text}</Tag>;
      },
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'state',
      hideInSearch: true,
      render: (_, record) => renderMessageState(record),
      width: 90,
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true,
      responsive: ['md'],
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
      render: (_, record) => formatTime(record.createdAt),
    },
    {
      title: '处理时间',
      dataIndex: 'completedAt',
      hideInSearch: true,
      responsive: ['lg'],
      width: 170,
      render: (_, record) => formatTime(record.completedAt ?? record.readAt ?? record.cancelledAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record) => {
        const actions = [];

        if (record.link) {
          actions.push(
            <a key="open" onClick={() => history.push(record.link!)}>
              打开
            </a>,
          );
        }

        if (record.type === 'NOTIFICATION' && !record.readAt) {
          actions.push(
            <a key="read" onClick={() => handleMarkRead(record.id)}>
              标记已读
            </a>,
          );
        }

        if (
          access.canCompleteMessages &&
          record.type === 'TODO' &&
          !record.completedAt &&
          !record.cancelledAt
        ) {
          actions.push(
            <a key="complete" onClick={() => handleComplete(record)}>
              完成
            </a>,
          );
          actions.push(
            <a key="cancel" onClick={() => handleCancel(record)}>
              取消
            </a>,
          );
        }

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          actionRef.current?.reloadAndRest?.();
        }}
        items={[
          { key: 'todos', label: '待办' },
          { key: 'notifications', label: '通知' },
          { key: 'done', label: '已处理' },
        ]}
      />
      <ProTable<NestWebAPI.MessageEntity>
        headerTitle="消息中心"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        columns={columns}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        toolBarRender={() => [
          activeTab === 'notifications' ? (
            <Button key="read-all" onClick={handleMarkAllRead}>
              全部已读
            </Button>
          ) : null,
          access.canExportData ? (
            <TableExportButton<NestWebAPI.MessageEntity>
              key="export"
              filename={`messages-${activeTab}.csv`}
              rows={currentRows}
              columns={[
                { title: 'ID', dataIndex: 'id' },
                { title: '标题', dataIndex: 'title' },
                { title: '分类', dataIndex: 'category' },
                { title: '类型', dataIndex: 'type' },
                { title: '内容', dataIndex: 'content' },
                { title: '创建时间', dataIndex: 'createdAt' },
              ]}
            />
          ) : null,
        ]}
        request={async (params) => {
          const { current, pageSize, keyword, category } = params;
          const result = unwrapResponse<NestWebAPI.MessageListEntity>(
            await messagesControllerFindAll({
              current,
              pageSize,
              keyword,
              category,
              ...queryByTab(activeTab),
            }),
          );
          setCurrentRows(result.data);

          return {
            data: result.data,
            success: true,
            current: result.pagination.current,
            pageSize: result.pagination.pageSize,
            total: result.pagination.total,
          };
        }}
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  );
};

export default MessageCenter;
