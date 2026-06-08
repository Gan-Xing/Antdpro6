import { usersControllerFindOne } from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';
import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
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
        message.error(error?.response?.data?.message ?? '用户详情加载失败');
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
  }, [currentRow?.id, open]);

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
      title={user?.username ?? user?.email ?? '用户详情'}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {user ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProDescriptions<User.UsersEntity>
              column={2}
              dataSource={user}
              columns={[
                { title: '用户名', dataIndex: 'username' },
                { title: '邮箱', dataIndex: 'email', copyable: true },
                { title: '性别', dataIndex: 'gender' },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (_, entity) => renderUserStatus(entity.status),
                },
                {
                  title: '超级管理员',
                  dataIndex: 'isAdmin',
                  render: (_, entity) =>
                    entity.isAdmin ? <Tag color="success">是</Tag> : <Tag>否</Tag>,
                },
                {
                  title: '最近登录',
                  dataIndex: 'lastLoginAt',
                  render: (_, entity) => formatTime(entity.lastLoginAt),
                },
                { title: '最近登录 IP', dataIndex: 'lastLoginIp' },
                {
                  title: '密码更新时间',
                  dataIndex: 'passwordUpdatedAt',
                  render: (_, entity) => formatTime(entity.passwordUpdatedAt),
                },
              ]}
            />
            <Card title="角色">
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
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无角色" />
              )}
            </Card>
            <Card title="权限">
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
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无权限" />
              )}
            </Card>
            <Card title="最近登录">
              {user.loginLogs?.length ? (
                <List
                  dataSource={user.loginLogs}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color={item.success ? 'success' : 'error'}>
                              {item.success ? '成功' : '失败'}
                            </Tag>
                            <span>{formatTime(item.createdAt)}</span>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            <span>IP：{item.ip || '-'}</span>
                            <span>失败原因：{item.failureReason || '-'}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无登录记录" />
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
