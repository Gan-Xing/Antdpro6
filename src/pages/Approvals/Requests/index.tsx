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
import { useAccess, useLocation, useModel } from '@umijs/max';
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
  PENDING: { text: '待审批', color: 'processing', status: 'Processing' },
  APPROVED: { text: '已通过', color: 'success', status: 'Success' },
  REJECTED: { text: '已驳回', color: 'error', status: 'Error' },
  CANCELLED: { text: '已取消', color: 'default', status: 'Default' },
};

const actionMap: Record<ApprovalActionType, string> = {
  SUBMIT: '提交',
  APPROVE: '通过',
  REJECT: '驳回',
  CANCEL: '取消',
  COMMENT: '评论',
};

const formatTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const approverText = (record: NestWebAPI.ApprovalRequestEntity) => {
  if (record.approverType === 'USER') {
    return (
      record.approverUser?.username ?? record.approverUser?.email ?? `用户#${record.approverUserId}`
    );
  }
  return `角色：${record.approverRoleCode ?? '-'}`;
};

const ApprovalRequestsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
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
              label: user.username || user.email || `用户#${user.id}`,
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
  }, []);

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
        message.error(error?.response?.data?.message ?? '审批详情加载失败');
      });
  }, [location.search]);

  const openDetail = async (record: NestWebAPI.ApprovalRequestEntity) => {
    try {
      const detail = unwrapResponse<NestWebAPI.ApprovalRequestEntity>(
        await approvalRequestsControllerFindOne({ id: record.id }),
      );
      setCurrentApproval(detail);
      setDetailOpen(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '审批详情加载失败');
    }
  };

  const runAction = (
    record: NestWebAPI.ApprovalRequestEntity,
    action: 'approve' | 'reject' | 'cancel' | 'comment',
  ) => {
    const labels = {
      approve: '通过',
      reject: '驳回',
      cancel: '取消',
      comment: '评论',
    };
    let comment = '';

    Modal.confirm({
      title: `${labels[action]}审批请求`,
      content: (
        <Input.TextArea
          rows={4}
          placeholder={action === 'approve' ? '可选：填写处理意见' : '请填写原因或说明'}
          onChange={(event) => {
            comment = event.target.value;
          }}
        />
      ),
      okText: labels[action],
      cancelText: '返回',
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

          message.success('操作成功');
          reload();
          if (detailOpen) {
            await openDetail(record);
          }
        } catch (error: any) {
          message.error(error?.response?.data?.message ?? '操作失败');
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
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: '标题',
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
      title: '状态',
      dataIndex: 'status',
      width: 110,
      valueEnum: {
        PENDING: { text: statusMap.PENDING.text, status: statusMap.PENDING.status },
        APPROVED: { text: statusMap.APPROVED.text, status: statusMap.APPROVED.status },
        REJECTED: { text: statusMap.REJECTED.text, status: statusMap.REJECTED.status },
        CANCELLED: { text: statusMap.CANCELLED.text, status: statusMap.CANCELLED.status },
      },
      render: (_, record) => (
        <Tag color={statusMap[record.status].color}>{statusMap[record.status].text}</Tag>
      ),
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      width: 130,
      render: (_, record) => (
        <Typography.Text code style={{ fontSize: 12 }}>
          {record.businessType}
        </Typography.Text>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantId',
      hideInSearch: true,
      width: 130,
      render: (_, record) => record.applicant?.username ?? record.applicant?.email ?? '-',
    },
    {
      title: '审批人',
      dataIndex: 'approverRoleCode',
      hideInSearch: true,
      width: 160,
      render: (_, record) => approverText(record),
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
      dataIndex: 'decidedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      responsive: ['lg'],
      width: 170,
      render: (_, record) => formatTime(record.decidedAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 230,
      render: (_, record) => {
        const actions = [
          <a key="detail" onClick={() => openDetail(record)}>
            详情
          </a>,
        ];

        if (record.status === 'PENDING' && access.canApproveApprovalRequests) {
          actions.push(
            <a key="approve" onClick={() => runAction(record, 'approve')}>
              通过
            </a>,
          );
        }

        if (record.status === 'PENDING' && access.canRejectApprovalRequests) {
          actions.push(
            <a key="reject" onClick={() => runAction(record, 'reject')}>
              驳回
            </a>,
          );
        }

        if (canCancelRecord(record)) {
          actions.push(
            <a key="cancel" onClick={() => runAction(record, 'cancel')}>
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
        activeKey={activeScope}
        onChange={(key) => {
          setActiveScope(key);
          actionRef.current?.reloadAndRest?.();
        }}
        items={[
          { key: 'all', label: '全部相关' },
          { key: 'mine', label: '我的申请' },
          { key: 'pending', label: '待我审批' },
        ]}
      />
      <ProTable<NestWebAPI.ApprovalRequestEntity>
        headerTitle="审批请求"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 90 }}
        columns={columns}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
        toolBarRender={() => [
          access.canCreateApprovalRequests ? (
            <Button key="create" type="primary" onClick={() => setCreateOpen(true)}>
              新建审批
            </Button>
          ) : null,
          access.canExportData ? (
            <TableExportButton<NestWebAPI.ApprovalRequestEntity>
              key="export"
              filename={`approval-requests-${activeScope}.csv`}
              rows={currentRows}
              columns={[
                { title: 'ID', dataIndex: 'id' },
                { title: '标题', dataIndex: 'title' },
                { title: '状态', dataIndex: 'status' },
                { title: '业务类型', dataIndex: 'businessType' },
                { title: '业务 ID', dataIndex: 'businessId' },
                { title: '申请人', renderText: (record) => record.applicant?.username },
                { title: '审批人', renderText: approverText },
                { title: '创建时间', dataIndex: 'createdAt' },
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
        title="新建审批请求"
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
            message.success('审批请求已提交');
            setCreateOpen(false);
            reload();
            return true;
          } catch (error: any) {
            message.error(error?.response?.data?.message ?? '提交失败');
            return false;
          }
        }}
      >
        <ProFormText
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入审批标题' }]}
        />
        <ProFormText
          name="businessType"
          label="业务类型"
          tooltip="用于二开时关联真实业务模块，例如 user_change、contract_review。"
          rules={[{ required: true, message: '请输入业务类型' }]}
        />
        <ProFormText name="businessId" label="业务 ID" />
        <ProFormSelect
          name="approverType"
          label="审批人类型"
          valueEnum={{
            USER: '指定用户',
            ROLE: '指定角色',
          }}
          rules={[{ required: true, message: '请选择审批人类型' }]}
        />
        <ProFormDependency name={['approverType']}>
          {({ approverType }) =>
            approverType === 'ROLE' ? (
              <ProFormSelect
                name="approverRoleCode"
                label="审批角色"
                showSearch
                options={roleOptions}
                rules={[{ required: true, message: '请选择审批角色' }]}
              />
            ) : (
              <ProFormSelect
                name="approverUserId"
                label="审批用户"
                showSearch
                options={userOptions}
                rules={[{ required: true, message: '请选择审批用户' }]}
              />
            )
          }
        </ProFormDependency>
        <ProFormTextArea name="description" label="说明" fieldProps={{ rows: 4 }} />
      </ModalForm>

      <Drawer
        width={720}
        open={detailOpen}
        title="审批请求详情"
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
                  通过
                </Button>
              ) : null}
              {currentApproval.status === 'PENDING' && access.canRejectApprovalRequests ? (
                <Button danger onClick={() => runAction(currentApproval, 'reject')}>
                  驳回
                </Button>
              ) : null}
              {canCancelRecord(currentApproval) ? (
                <Button onClick={() => runAction(currentApproval, 'cancel')}>取消</Button>
              ) : null}
              <Button onClick={() => runAction(currentApproval, 'comment')}>评论</Button>
            </Space>
          ) : null
        }
      >
        <ProDescriptions<NestWebAPI.ApprovalRequestEntity>
          column={1}
          dataSource={currentApproval}
          columns={[
            { title: 'ID', dataIndex: 'id' },
            { title: '标题', dataIndex: 'title' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (_, entity) =>
                entity?.status ? (
                  <Tag color={statusMap[entity.status].color}>{statusMap[entity.status].text}</Tag>
                ) : (
                  '-'
                ),
            },
            { title: '业务类型', dataIndex: 'businessType' },
            { title: '业务 ID', dataIndex: 'businessId' },
            {
              title: '申请人',
              dataIndex: 'applicantId',
              render: (_, entity) =>
                entity?.applicant?.username ?? entity?.applicant?.email ?? entity?.applicantId,
            },
            {
              title: '审批人',
              dataIndex: 'approverRoleCode',
              render: (_, entity) => (entity ? approverText(entity) : '-'),
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              render: (_, entity) => formatTime(entity?.createdAt),
            },
            {
              title: '处理时间',
              dataIndex: 'decidedAt',
              render: (_, entity) => formatTime(entity?.decidedAt),
            },
            { title: '说明', dataIndex: 'description' },
          ]}
        />
        <Typography.Title level={5} style={{ marginTop: 24 }}>
          处理记录
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
                  {actionMap[action.action]} ·{' '}
                  {action.actor?.username ?? action.actor?.email ?? `用户#${action.actorId}`}
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
