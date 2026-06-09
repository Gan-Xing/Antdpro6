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
import { history, useAccess, useIntl } from '@umijs/max';
import { Button, message, Modal, Space, Tabs, Tag, Typography } from 'antd';
import React, { useRef, useState } from 'react';

type MessageCategory = NestWebAPI.MessageEntity['category'];

const messageCategoryMap: Record<MessageCategory, { messageId: string; color: string }> = {
  SYSTEM: { messageId: 'pages.messages.category.system', color: 'blue' },
  SECURITY: { messageId: 'pages.messages.category.security', color: 'red' },
  APPROVAL: { messageId: 'pages.messages.category.approval', color: 'purple' },
  TASK: { messageId: 'pages.messages.category.task', color: 'geekblue' },
  CUSTOM: { messageId: 'pages.messages.category.custom', color: 'default' },
};

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const renderMessageState = (record: NestWebAPI.MessageEntity, intl: ReturnType<typeof useIntl>) => {
  if (record.cancelledAt) {
    return (
      <Tag color="default">{intl.formatMessage({ id: 'pages.messages.state.cancelled' })}</Tag>
    );
  }
  if (record.completedAt) {
    return (
      <Tag color="success">{intl.formatMessage({ id: 'pages.messages.state.completed' })}</Tag>
    );
  }
  if (record.type === 'TODO') {
    return (
      <Tag color="processing">{intl.formatMessage({ id: 'pages.messages.state.pending' })}</Tag>
    );
  }
  if (record.readAt) {
    return <Tag color="success">{intl.formatMessage({ id: 'pages.messages.state.read' })}</Tag>;
  }
  return <Tag color="warning">{intl.formatMessage({ id: 'pages.messages.state.unread' })}</Tag>;
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

const getDisplayTitle = (record: NestWebAPI.MessageEntity, intl: ReturnType<typeof useIntl>) => {
  if (record.businessType !== 'approval_request') {
    return record.title;
  }

  const pendingPrefix = '待审批：';
  if (record.title?.startsWith(pendingPrefix)) {
    return intl.formatMessage(
      { id: 'pages.messages.approval.pendingTitle' },
      { title: record.title.slice(pendingPrefix.length) },
    );
  }

  const titleMap: Record<string, string> = {
    审批请求已取消: 'pages.messages.approval.cancelledTitle',
    审批请求已通过: 'pages.messages.approval.approvedTitle',
    审批请求已驳回: 'pages.messages.approval.rejectedTitle',
  };
  const messageId = titleMap[record.title ?? ''];

  return messageId ? intl.formatMessage({ id: messageId }) : record.title;
};

const MessageCenter: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('todos');
  const [currentRows, setCurrentRows] = useState<NestWebAPI.MessageEntity[]>([]);

  const reload = () => actionRef.current?.reload();

  const handleMarkRead = async (id: number) => {
    try {
      unwrapResponse(await messagesControllerMarkRead({ id }));
      message.success(intl.formatMessage({ id: 'pages.messages.markReadSuccess' }));
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? intl.formatMessage({ id: 'common.failure' }));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = unwrapResponse<{ count: number }>(await messagesControllerMarkAllRead());
      message.success(
        intl.formatMessage({ id: 'pages.messages.markAllReadSuccess' }, { count: result.count }),
      );
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? intl.formatMessage({ id: 'common.failure' }));
    }
  };

  const handleComplete = async (record: NestWebAPI.MessageEntity) => {
    try {
      unwrapResponse(await messagesControllerCompleteTodo({ id: record.id }));
      message.success(intl.formatMessage({ id: 'pages.messages.completeSuccess' }));
      reload();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? intl.formatMessage({ id: 'common.failure' }));
    }
  };

  const handleCancel = async (record: NestWebAPI.MessageEntity) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.messages.confirmCancelTitle' }),
      content: getDisplayTitle(record, intl),
      okText: intl.formatMessage({ id: 'pages.messages.confirmCancelOk' }),
      cancelText: intl.formatMessage({ id: 'common.back' }),
      onOk: async () => {
        try {
          unwrapResponse(await messagesControllerCancelTodo({ id: record.id }));
          message.success(intl.formatMessage({ id: 'pages.messages.cancelSuccess' }));
          reload();
        } catch (error: any) {
          message.error(
            error?.response?.data?.message ?? intl.formatMessage({ id: 'common.failure' }),
          );
          return Promise.reject(error);
        }
      },
    });
  };

  const columns: ProColumns<NestWebAPI.MessageEntity>[] = [
    {
      title: intl.formatMessage({ id: 'common.keyword' }),
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: intl.formatMessage({ id: 'common.title' }),
      dataIndex: 'title',
      ellipsis: true,
      render: (_, record) => (
        <Space size={8}>
          <Typography.Text strong={record.type === 'TODO' && !record.completedAt}>
            {getDisplayTitle(record, intl)}
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
      title: intl.formatMessage({ id: 'common.category' }),
      dataIndex: 'category',
      valueEnum: {
        SYSTEM: { text: intl.formatMessage({ id: 'pages.messages.category.system' }) },
        SECURITY: { text: intl.formatMessage({ id: 'pages.messages.category.security' }) },
        APPROVAL: { text: intl.formatMessage({ id: 'pages.messages.category.approval' }) },
        TASK: { text: intl.formatMessage({ id: 'pages.messages.category.task' }) },
        CUSTOM: { text: intl.formatMessage({ id: 'pages.messages.category.custom' }) },
      },
      render: (_, record) => {
        const category = messageCategoryMap[record.category];
        return <Tag color={category.color}>{intl.formatMessage({ id: category.messageId })}</Tag>;
      },
      width: 90,
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'state',
      hideInSearch: true,
      render: (_, record) => renderMessageState(record, intl),
      width: 90,
    },
    {
      title: intl.formatMessage({ id: 'common.content' }),
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true,
      responsive: ['md'],
    },
    {
      title: intl.formatMessage({ id: 'common.createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
      render: (_, record) => formatTime(record.createdAt),
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.decidedAt' }),
      dataIndex: 'completedAt',
      hideInSearch: true,
      responsive: ['lg'],
      width: 170,
      render: (_, record) => formatTime(record.completedAt ?? record.readAt ?? record.cancelledAt),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      valueType: 'option',
      width: 180,
      render: (_, record) => {
        const actions = [];

        if (record.link) {
          actions.push(
            <a key="open" onClick={() => history.push(record.link!)}>
              {intl.formatMessage({ id: 'common.open' })}
            </a>,
          );
        }

        if (record.type === 'NOTIFICATION' && !record.readAt) {
          actions.push(
            <a key="read" onClick={() => handleMarkRead(record.id)}>
              {intl.formatMessage({ id: 'pages.messages.markRead' })}
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
              {intl.formatMessage({ id: 'pages.messages.complete' })}
            </a>,
          );
          actions.push(
            <a key="cancel" onClick={() => handleCancel(record)}>
              {intl.formatMessage({ id: 'common.cancel' })}
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
          { key: 'todos', label: intl.formatMessage({ id: 'pages.messages.tab.todos' }) },
          {
            key: 'notifications',
            label: intl.formatMessage({ id: 'pages.messages.tab.notifications' }),
          },
          { key: 'done', label: intl.formatMessage({ id: 'pages.messages.tab.done' }) },
        ]}
      />
      <ProTable<NestWebAPI.MessageEntity>
        headerTitle={intl.formatMessage({ id: 'pages.messages.title' })}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        columns={columns}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        toolBarRender={() => [
          activeTab === 'notifications' ? (
            <Button key="read-all" onClick={handleMarkAllRead}>
              {intl.formatMessage({ id: 'pages.messages.markAllRead' })}
            </Button>
          ) : null,
          access.canExportData ? (
            <TableExportButton<NestWebAPI.MessageEntity>
              key="export"
              filename={`messages-${activeTab}.csv`}
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                {
                  title: intl.formatMessage({ id: 'common.title' }),
                  renderText: (record) => getDisplayTitle(record, intl),
                },
                { title: intl.formatMessage({ id: 'common.category' }), dataIndex: 'category' },
                { title: intl.formatMessage({ id: 'common.type' }), dataIndex: 'type' },
                { title: intl.formatMessage({ id: 'common.content' }), dataIndex: 'content' },
                { title: intl.formatMessage({ id: 'common.createdAt' }), dataIndex: 'createdAt' },
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
