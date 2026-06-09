import TableExportButton from '@/components/TableExportButton';
import {
  approvalRequestsControllerApprove,
  approvalRequestsControllerCancel,
  approvalRequestsControllerComment,
  approvalRequestsControllerCreate,
  approvalRequestsControllerFindAll,
  approvalRequestsControllerFindOne,
  approvalRequestsControllerReject,
} from '@/services/nest-web/approvalRequests';
import { rolesControllerFindAll } from '@/services/nest-web/roles';
import { usersControllerFindAll } from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess, useIntl, useLocation, useModel } from '@umijs/max';
import {
  Button,
  Drawer,
  Input,
  message,
  Modal,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

type ApprovalRequestStatus = NestWebAPI.ApprovalRequestEntity['status'];
type ApprovalActionType = NestWebAPI.ApprovalActionEntity['action'];

const statusMap: Record<
  ApprovalRequestStatus,
  { text: string; color: string; status: 'Processing' | 'Success' | 'Error' | 'Default' }
> = {
  PENDING: { text: 'pages.approvals.status.pending', color: 'processing', status: 'Processing' },
  APPROVED: { text: 'pages.approvals.status.approved', color: 'success', status: 'Success' },
  REJECTED: { text: 'pages.approvals.status.rejected', color: 'error', status: 'Error' },
  CANCELLED: { text: 'pages.approvals.status.cancelled', color: 'default', status: 'Default' },
};

const actionMap: Record<ApprovalActionType, string> = {
  SUBMIT: 'pages.approvals.action.submit',
  APPROVE: 'pages.approvals.action.approve',
  REJECT: 'pages.approvals.action.reject',
  CANCEL: 'pages.approvals.action.cancel',
  COMMENT: 'pages.approvals.action.comment',
};

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const approverText = (
  record: NestWebAPI.ApprovalRequestEntity,
  intl: ReturnType<typeof useIntl>,
) => {
  if (record.approverType === 'USER') {
    return (
      record.approverUser?.username ??
      record.approverUser?.email ??
      intl.formatMessage({ id: 'pages.approvals.userFallback' }, { id: record.approverUserId })
    );
  }
  return intl.formatMessage(
    { id: 'pages.approvals.rolePrefix' },
    { role: record.approverRoleCode ?? '-' },
  );
};

const ApprovalRequestsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const location = useLocation();
  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentUser?.id;
  const [activeScope, setActiveScope] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentApproval, setCurrentApproval] = useState<NestWebAPI.ApprovalRequestEntity>();
  const [currentRows, setCurrentRows] = useState<NestWebAPI.ApprovalRequestEntity[]>([]);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  const reload = () => actionRef.current?.reload();

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          usersControllerFindAll(),
          rolesControllerFindAll(),
        ]);
        const users = unwrapResponse<NestWebAPI.UserEntity[]>(usersResponse);
        const roles = unwrapResponse<NestWebAPI.RoleEntity[]>(rolesResponse);
        setUserOptions(
          users
            .filter((user) => user.status === 'active')
            .map((user) => ({
              label:
                user.username ||
                user.email ||
                intl.formatMessage({ id: 'pages.approvals.userFallback' }, { id: user.id }),
              value: user.id,
            })),
        );
        setRoleOptions(
          roles
            .filter((role) => role.enabled)
            .map((role) => ({
              label: `${role.name} (${role.code})`,
              value: role.code,
            })),
        );
      } catch (error) {
        setUserOptions([]);
        setRoleOptions([]);
      }
    };

    loadOptions();
  }, [intl]);

  useEffect(() => {
    const id = Number(new URLSearchParams(location.search).get('id'));
    if (!id) {
      return;
    }

    approvalRequestsControllerFindOne({ id })
      .then((response) => {
        setCurrentApproval(unwrapResponse<NestWebAPI.ApprovalRequestEntity>(response));
        setDetailOpen(true);
      })
      .catch((error: any) => {
        message.error(
          error?.response?.data?.message ??
            intl.formatMessage({ id: 'pages.approvals.detailLoadFailed' }),
        );
      });
  }, [intl, location.search]);

  const openDetail = async (record: NestWebAPI.ApprovalRequestEntity) => {
    try {
      const detail = unwrapResponse<NestWebAPI.ApprovalRequestEntity>(
        await approvalRequestsControllerFindOne({ id: record.id }),
      );
      setCurrentApproval(detail);
      setDetailOpen(true);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.approvals.detailLoadFailed' }),
      );
    }
  };

  const runAction = (
    record: NestWebAPI.ApprovalRequestEntity,
    action: 'approve' | 'reject' | 'cancel' | 'comment',
  ) => {
    const labels = {
      approve: intl.formatMessage({ id: 'pages.approvals.action.approve' }),
      reject: intl.formatMessage({ id: 'pages.approvals.action.reject' }),
      cancel: intl.formatMessage({ id: 'pages.approvals.action.cancel' }),
      comment: intl.formatMessage({ id: 'pages.approvals.action.comment' }),
    };
    let comment = '';

    Modal.confirm({
      title: intl.formatMessage(
        { id: 'pages.approvals.actionModalTitle' },
        { action: labels[action] },
      ),
      content: (
        <Input.TextArea
          rows={4}
          placeholder={
            action === 'approve'
              ? intl.formatMessage({ id: 'pages.approvals.optionalApprovePlaceholder' })
              : intl.formatMessage({ id: 'pages.approvals.commentPlaceholder' })
          }
          onChange={(event) => {
            comment = event.target.value;
          }}
        />
      ),
      okText: labels[action],
      cancelText: intl.formatMessage({ id: 'common.back' }),
      onOk: async () => {
        try {
          if (action === 'approve') {
            await approvalRequestsControllerApprove({ id: record.id }, { comment });
          }
          if (action === 'reject') {
            await approvalRequestsControllerReject({ id: record.id }, { comment });
          }
          if (action === 'cancel') {
            await approvalRequestsControllerCancel({ id: record.id }, { comment });
          }
          if (action === 'comment') {
            await approvalRequestsControllerComment({ id: record.id }, { comment });
          }

          message.success(intl.formatMessage({ id: 'pages.approvals.actionSuccess' }));
          reload();
          if (detailOpen) {
            await openDetail(record);
          }
        } catch (error: any) {
          message.error(
            error?.response?.data?.message ??
              intl.formatMessage({ id: 'pages.approvals.actionFailed' }),
          );
          return Promise.reject(error);
        }
      },
    });
  };

  const canCancelRecord = (record: NestWebAPI.ApprovalRequestEntity) =>
    record.status === 'PENDING' &&
    (access.canCancelApprovalRequests ||
      access.canManageApprovalRequests ||
      record.applicantId === currentUserId);

  const columns: ProColumns<NestWebAPI.ApprovalRequestEntity>[] = [
    {
      title: intl.formatMessage({ id: 'common.keyword' }),
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: intl.formatMessage({ id: 'common.title' }),
      dataIndex: 'title',
      ellipsis: true,
      render: (dom, record) => (
        <a
          onClick={() => {
            openDetail(record);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'common.status' }),
      dataIndex: 'status',
      width: 110,
      valueEnum: {
        PENDING: {
          text: intl.formatMessage({ id: statusMap.PENDING.text }),
          status: statusMap.PENDING.status,
        },
        APPROVED: {
          text: intl.formatMessage({ id: statusMap.APPROVED.text }),
          status: statusMap.APPROVED.status,
        },
        REJECTED: {
          text: intl.formatMessage({ id: statusMap.REJECTED.text }),
          status: statusMap.REJECTED.status,
        },
        CANCELLED: {
          text: intl.formatMessage({ id: statusMap.CANCELLED.text }),
          status: statusMap.CANCELLED.status,
        },
      },
      render: (_, record) => (
        <Tag color={statusMap[record.status].color}>
          {intl.formatMessage({ id: statusMap[record.status].text })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.businessType' }),
      dataIndex: 'businessType',
      width: 130,
      render: (_, record) => (
        <Typography.Text code style={{ fontSize: 12 }}>
          {record.businessType}
        </Typography.Text>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.applicant' }),
      dataIndex: 'applicantId',
      hideInSearch: true,
      width: 130,
      render: (_, record) => record.applicant?.username ?? record.applicant?.email ?? '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.approver' }),
      dataIndex: 'approverRoleCode',
      hideInSearch: true,
      width: 160,
      render: (_, record) => approverText(record, intl),
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
      render: (_, record) => formatTime(record.createdAt),
    },
    {
      title: intl.formatMessage({ id: 'pages.approvals.decidedAt' }),
      dataIndex: 'decidedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      responsive: ['lg'],
      width: 170,
      render: (_, record) => formatTime(record.decidedAt),
    },
    {
      title: intl.formatMessage({ id: 'common.action' }),
      valueType: 'option',
      width: 230,
      render: (_, record) => {
        const actions = [
          <a key="detail" onClick={() => openDetail(record)}>
            {intl.formatMessage({ id: 'common.detail' })}
          </a>,
        ];

        if (record.status === 'PENDING' && access.canApproveApprovalRequests) {
          actions.push(
            <a key="approve" onClick={() => runAction(record, 'approve')}>
              {intl.formatMessage({ id: 'pages.approvals.action.approve' })}
            </a>,
          );
        }

        if (record.status === 'PENDING' && access.canRejectApprovalRequests) {
          actions.push(
            <a key="reject" onClick={() => runAction(record, 'reject')}>
              {intl.formatMessage({ id: 'pages.approvals.action.reject' })}
            </a>,
          );
        }

        if (canCancelRecord(record)) {
          actions.push(
            <a key="cancel" onClick={() => runAction(record, 'cancel')}>
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
        activeKey={activeScope}
        onChange={(key) => {
          setActiveScope(key);
          actionRef.current?.reloadAndRest?.();
        }}
        items={[
          { key: 'all', label: intl.formatMessage({ id: 'pages.approvals.scope.all' }) },
          { key: 'mine', label: intl.formatMessage({ id: 'pages.approvals.scope.mine' }) },
          { key: 'pending', label: intl.formatMessage({ id: 'pages.approvals.scope.pending' }) },
        ]}
      />
      <ProTable<NestWebAPI.ApprovalRequestEntity>
        headerTitle={intl.formatMessage({ id: 'pages.approvals.title' })}
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        columns={columns}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        toolBarRender={() => [
          access.canCreateApprovalRequests ? (
            <Button key="create" type="primary" onClick={() => setCreateOpen(true)}>
              {intl.formatMessage({ id: 'pages.approvals.create' })}
            </Button>
          ) : null,
          access.canExportData ? (
            <TableExportButton<NestWebAPI.ApprovalRequestEntity>
              key="export"
              filename={`approval-requests-${activeScope}.csv`}
              rows={currentRows}
              columns={[
                { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
                { title: intl.formatMessage({ id: 'common.title' }), dataIndex: 'title' },
                { title: intl.formatMessage({ id: 'common.status' }), dataIndex: 'status' },
                {
                  title: intl.formatMessage({ id: 'pages.approvals.businessType' }),
                  dataIndex: 'businessType',
                },
                {
                  title: intl.formatMessage({ id: 'pages.approvals.businessId' }),
                  dataIndex: 'businessId',
                },
                {
                  title: intl.formatMessage({ id: 'pages.approvals.applicant' }),
                  renderText: (record) => record.applicant?.username,
                },
                {
                  title: intl.formatMessage({ id: 'pages.approvals.approver' }),
                  renderText: (record) => approverText(record, intl),
                },
                {
                  title: intl.formatMessage({ id: 'pages.approvals.createdAt' }),
                  dataIndex: 'createdAt',
                },
              ]}
            />
          ) : null,
        ]}
        request={async (params) => {
          const { current, pageSize, keyword, status, businessType } = params;
          const result = unwrapResponse<NestWebAPI.ApprovalRequestListEntity>(
            await approvalRequestsControllerFindAll({
              current,
              pageSize,
              keyword,
              status,
              businessType,
              mine: activeScope === 'mine' ? true : undefined,
              pendingForMe: activeScope === 'pending' ? true : undefined,
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

      <ModalForm<NestWebAPI.CreateApprovalRequestDto>
        title={intl.formatMessage({ id: 'pages.approvals.createTitle' })}
        open={createOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCreateOpen(false),
        }}
        initialValues={{
          businessType: 'general',
          approverType: 'USER',
        }}
        onFinish={async (values) => {
          try {
            await approvalRequestsControllerCreate(values);
            message.success(intl.formatMessage({ id: 'pages.approvals.submitSuccess' }));
            setCreateOpen(false);
            reload();
            return true;
          } catch (error: any) {
            message.error(
              error?.response?.data?.message ??
                intl.formatMessage({ id: 'pages.approvals.submitFailed' }),
            );
            return false;
          }
        }}
      >
        <ProFormText
          name="title"
          label={intl.formatMessage({ id: 'common.title' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.approvals.titleRequired' }),
            },
          ]}
        />
        <ProFormText
          name="businessType"
          label={intl.formatMessage({ id: 'pages.approvals.businessType' })}
          tooltip={intl.formatMessage({ id: 'pages.approvals.businessTypeTooltip' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.approvals.businessTypeRequired' }),
            },
          ]}
        />
        <ProFormText
          name="businessId"
          label={intl.formatMessage({ id: 'pages.approvals.businessId' })}
        />
        <ProFormSelect
          name="approverType"
          label={intl.formatMessage({ id: 'pages.approvals.approverType' })}
          valueEnum={{
            USER: intl.formatMessage({ id: 'pages.approvals.approverType.user' }),
            ROLE: intl.formatMessage({ id: 'pages.approvals.approverType.role' }),
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.approvals.approverTypeRequired' }),
            },
          ]}
        />
        <ProFormDependency name={['approverType']}>
          {({ approverType }) =>
            approverType === 'ROLE' ? (
              <ProFormSelect
                name="approverRoleCode"
                label={intl.formatMessage({ id: 'pages.approvals.approverRole' })}
                showSearch
                options={roleOptions}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'pages.approvals.approverRoleRequired' }),
                  },
                ]}
              />
            ) : (
              <ProFormSelect
                name="approverUserId"
                label={intl.formatMessage({ id: 'pages.approvals.approverUser' })}
                showSearch
                options={userOptions}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'pages.approvals.approverUserRequired' }),
                  },
                ]}
              />
            )
          }
        </ProFormDependency>
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'pages.approvals.description' })}
          fieldProps={{ rows: 4 }}
        />
      </ModalForm>

      <Drawer
        width={720}
        open={detailOpen}
        title={intl.formatMessage({ id: 'pages.approvals.detailTitle' })}
        onClose={() => {
          setDetailOpen(false);
          setCurrentApproval(undefined);
        }}
        destroyOnClose
        extra={
          currentApproval ? (
            <Space>
              {currentApproval.status === 'PENDING' && access.canApproveApprovalRequests ? (
                <Button type="primary" onClick={() => runAction(currentApproval, 'approve')}>
                  {intl.formatMessage({ id: 'pages.approvals.action.approve' })}
                </Button>
              ) : null}
              {currentApproval.status === 'PENDING' && access.canRejectApprovalRequests ? (
                <Button danger onClick={() => runAction(currentApproval, 'reject')}>
                  {intl.formatMessage({ id: 'pages.approvals.action.reject' })}
                </Button>
              ) : null}
              {canCancelRecord(currentApproval) ? (
                <Button onClick={() => runAction(currentApproval, 'cancel')}>
                  {intl.formatMessage({ id: 'common.cancel' })}
                </Button>
              ) : null}
              <Button onClick={() => runAction(currentApproval, 'comment')}>
                {intl.formatMessage({ id: 'pages.approvals.action.comment' })}
              </Button>
            </Space>
          ) : null
        }
      >
        <ProDescriptions<NestWebAPI.ApprovalRequestEntity>
          column={1}
          dataSource={currentApproval}
          columns={[
            { title: intl.formatMessage({ id: 'common.id' }), dataIndex: 'id' },
            { title: intl.formatMessage({ id: 'common.title' }), dataIndex: 'title' },
            {
              title: intl.formatMessage({ id: 'common.status' }),
              dataIndex: 'status',
              render: (_, entity) =>
                entity?.status ? (
                  <Tag color={statusMap[entity.status].color}>
                    {intl.formatMessage({ id: statusMap[entity.status].text })}
                  </Tag>
                ) : (
                  '-'
                ),
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.businessType' }),
              dataIndex: 'businessType',
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.businessId' }),
              dataIndex: 'businessId',
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.applicant' }),
              dataIndex: 'applicantId',
              render: (_, entity) =>
                entity?.applicant?.username ?? entity?.applicant?.email ?? entity?.applicantId,
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.approver' }),
              dataIndex: 'approverRoleCode',
              render: (_, entity) => (entity ? approverText(entity, intl) : '-'),
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.createdAt' }),
              dataIndex: 'createdAt',
              render: (_, entity) => formatTime(entity?.createdAt),
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.decidedAt' }),
              dataIndex: 'decidedAt',
              render: (_, entity) => formatTime(entity?.decidedAt),
            },
            {
              title: intl.formatMessage({ id: 'pages.approvals.description' }),
              dataIndex: 'description',
            },
          ]}
        />
        <Typography.Title level={5} style={{ marginTop: 24 }}>
          {intl.formatMessage({ id: 'pages.approvals.actionRecords' })}
        </Typography.Title>
        <Timeline
          items={(currentApproval?.actions ?? []).map((action) => ({
            color:
              action.action === 'APPROVE'
                ? 'green'
                : action.action === 'REJECT'
                  ? 'red'
                  : action.action === 'CANCEL'
                    ? 'gray'
                    : 'blue',
            children: (
              <Space direction="vertical" size={2}>
                <Typography.Text>
                  {intl.formatMessage({ id: actionMap[action.action] })} ·{' '}
                  {action.actor?.username ??
                    action.actor?.email ??
                    intl.formatMessage(
                      { id: 'pages.approvals.userFallback' },
                      { id: action.actorId },
                    )}
                </Typography.Text>
                <Typography.Text type="secondary">{formatTime(action.createdAt)}</Typography.Text>
                {action.comment ? (
                  <Typography.Paragraph>{action.comment}</Typography.Paragraph>
                ) : null}
              </Space>
            ),
          }))}
        />
      </Drawer>
    </PageContainer>
  );
};

export default ApprovalRequestsPage;
