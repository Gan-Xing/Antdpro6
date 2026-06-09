import { usersControllerFindOne } from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';
import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Card, Drawer, Empty, List, message, Space, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { renderUserStatus } from '../constants';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: User.UsersEntity;
  columns: ProDescriptionsItemProps<User.UsersEntity>[];
}

const formatTime = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<User.UsersEntity | undefined>();
  const intl = useIntl();
  const user = detail ?? currentRow;

  useEffect(() => {
    let mounted = true;

    const loadDetail = async () => {
      if (!open || !currentRow?.id) return;

      setLoading(true);
      try {
        const data = unwrapResponse<User.UsersEntity>(
          await usersControllerFindOne({ id: currentRow.id }),
        );
        if (mounted) {
          setDetail(data);
        }
      } catch (error: any) {
        message.error(
          error?.response?.data?.message ??
            intl.formatMessage({ id: 'pages.users.detailLoadFailed' }),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [currentRow?.id, intl, open]);

  const permissions = useMemo(() => {
    const map = new Map<number, NestWebAPI.PermissionEntity>();
    user?.roles?.forEach((role) => {
      role.permissions?.forEach((permission) => {
        map.set(permission.id, permission);
      });
    });
    return Array.from(map.values());
  }, [user?.roles]);

  return (
    <Drawer
      width="72%"
      open={open}
      onClose={onClose}
      title={user?.username ?? user?.email ?? intl.formatMessage({ id: 'pages.users.detailTitle' })}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {user ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProDescriptions<User.UsersEntity>
              column={2}
              dataSource={user}
              columns={[
                { title: intl.formatMessage({ id: 'common.username' }), dataIndex: 'username' },
                {
                  title: intl.formatMessage({ id: 'common.email' }),
                  dataIndex: 'email',
                  copyable: true,
                },
                { title: intl.formatMessage({ id: 'pages.users.gender' }), dataIndex: 'gender' },
                {
                  title: intl.formatMessage({ id: 'common.status' }),
                  dataIndex: 'status',
                  render: (_, entity) => renderUserStatus(entity.status),
                },
                {
                  title: intl.formatMessage({ id: 'pages.users.isSuperAdmin' }),
                  dataIndex: 'isAdmin',
                  render: (_, entity) =>
                    entity.isAdmin ? (
                      <Tag color="success">{intl.formatMessage({ id: 'common.yes' })}</Tag>
                    ) : (
                      <Tag>{intl.formatMessage({ id: 'common.no' })}</Tag>
                    ),
                },
                {
                  title: intl.formatMessage({ id: 'pages.users.recentLogin' }),
                  dataIndex: 'lastLoginAt',
                  render: (_, entity) => formatTime(entity.lastLoginAt),
                },
                {
                  title: intl.formatMessage({ id: 'pages.account.status.lastLoginIp' }),
                  dataIndex: 'lastLoginIp',
                },
                {
                  title: intl.formatMessage({ id: 'pages.account.status.passwordUpdatedAt' }),
                  dataIndex: 'passwordUpdatedAt',
                  render: (_, entity) => formatTime(entity.passwordUpdatedAt),
                },
              ]}
            />
            <Card title={intl.formatMessage({ id: 'pages.users.roles' })}>
              {user.roles?.length ? (
                <Space wrap>
                  {user.roles.map((role) => (
                    <Tag key={role.id} color={role.enabled === false ? 'default' : 'blue'}>
                      {role.name}
                      <Typography.Text code style={{ marginLeft: 6 }}>
                        {role.code}
                      </Typography.Text>
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({ id: 'pages.users.rolesEmpty' })}
                />
              )}
            </Card>
            <Card title={intl.formatMessage({ id: 'pages.roles.permissions' })}>
              {permissions.length ? (
                <Space wrap>
                  {permissions.map((permission) => (
                    <Tag key={permission.id}>
                      {permission.name}
                      <Typography.Text code style={{ marginLeft: 6 }}>
                        {permission.code}
                      </Typography.Text>
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({ id: 'pages.users.permissionsEmpty' })}
                />
              )}
            </Card>
            <Card title={intl.formatMessage({ id: 'pages.users.recentLogin' })}>
              {user.loginLogs?.length ? (
                <List
                  dataSource={user.loginLogs}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color={item.success ? 'success' : 'error'}>
                              {item.success
                                ? intl.formatMessage({ id: 'common.success' })
                                : intl.formatMessage({ id: 'common.failure' })}
                            </Tag>
                            <span>{formatTime(item.createdAt)}</span>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            <span>IP：{item.ip || '-'}</span>
                            <span>
                              {intl.formatMessage({
                                id: 'pages.security.loginLogs.failureReason',
                              })}
                              : {item.failureReason || '-'}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={intl.formatMessage({ id: 'pages.users.loginLogsEmpty' })}
                />
              )}
            </Card>
          </Space>
        ) : (
          <Empty />
        )}
      </Spin>
    </Drawer>
  );
};

export default Show;
