import {
  AppstoreOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useAccess, useModel } from '@umijs/max';
import { Alert, Button, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { appControllerGetHealth } from '@/services/nest-web/app';
import { imagesControllerFindAll } from '@/services/nest-web/images';
import { rolesControllerFindAll } from '@/services/nest-web/roles';
import { systemLogControllerFindAll } from '@/services/nest-web/systemLog';
import { usersControllerFindAllPaged } from '@/services/nest-web/users';
import { unwrapResponse } from '@/utils/apiResponse';

type DashboardMetric = {
  key: string;
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
};

type RecentLog = {
  id: number;
  requestDescription?: string;
  username?: string;
  success?: boolean;
  createdAt?: string;
};

const emptyValue = '-';

const resolveTotal = (payload: any) => {
  const data = unwrapResponse<any>(payload);

  return (
    data?.pagination?.total ??
    data?.total ??
    (Array.isArray(data?.data) ? data.data.length : undefined) ??
    (Array.isArray(data) ? data.length : undefined) ??
    0
  );
};

const Dashboard: React.FC = () => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ status?: string; service?: string }>({});
  const [metrics, setMetrics] = useState<Record<string, number | string>>({});
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      const nextMetrics: Record<string, number | string> = {};

      const healthResult = await appControllerGetHealth({ skipErrorHandler: true }).catch(
        () => undefined,
      );

      if (mounted) {
        setHealth(unwrapResponse<any>(healthResult ?? {}));
      }

      if (access.canShowUser) {
        const users = await usersControllerFindAllPaged(
          { current: 1, pageSize: 1 },
          { skipErrorHandler: true },
        ).catch(() => undefined);
        nextMetrics.users = users ? resolveTotal(users) : emptyValue;
      }

      if (access.canShowRole) {
        const roles = await rolesControllerFindAll({ skipErrorHandler: true }).catch(
          () => undefined,
        );
        nextMetrics.roles = roles ? resolveTotal(roles) : emptyValue;
      }

      if (access.canViewImage) {
        const images = await imagesControllerFindAll(
          { current: 1, pageSize: 1 },
          { skipErrorHandler: true },
        ).catch(() => undefined);
        nextMetrics.images = images ? resolveTotal(images) : emptyValue;
      }

      if (access.canViewSystemLogs) {
        const logs = await systemLogControllerFindAll(
          { page: 1, pageSize: 5 },
          { skipErrorHandler: true },
        ).catch(() => undefined);
        const logData = unwrapResponse<any>(logs ?? {});
        nextMetrics.logs = logs ? resolveTotal(logs) : emptyValue;
        if (mounted) {
          setRecentLogs(logData?.data ?? []);
        }
      }

      if (mounted) {
        setMetrics(nextMetrics);
        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [access.canShowRole, access.canShowUser, access.canViewImage, access.canViewSystemLogs]);

  const metricCards = useMemo<DashboardMetric[]>(
    () => [
      {
        key: 'health',
        title: '服务状态',
        value: health.status === 'ok' ? '正常' : '待检查',
        description: health.service ?? 'NestWeb API',
        icon: <CheckCircleOutlined />,
      },
      {
        key: 'users',
        title: '用户',
        value: metrics.users ?? emptyValue,
        description: access.canShowUser ? '当前系统用户总数' : '无用户统计权限',
        icon: <TeamOutlined />,
      },
      {
        key: 'roles',
        title: '角色',
        value: metrics.roles ?? emptyValue,
        description: access.canShowRole ? '可维护的角色数量' : '无角色统计权限',
        icon: <SafetyCertificateOutlined />,
      },
      {
        key: 'images',
        title: '资源',
        value: metrics.images ?? emptyValue,
        description: access.canViewImage ? '图片资源数量' : '无资源统计权限',
        icon: <PictureOutlined />,
      },
    ],
    [access.canShowRole, access.canShowUser, access.canViewImage, health, metrics],
  );

  const quickEntries = [
    {
      title: '用户管理',
      description: '维护系统用户、角色绑定和状态',
      path: '/auth/users',
      enabled: access.canShowUser,
    },
    {
      title: '角色管理',
      description: '维护角色编码、显示名和权限分配',
      path: '/auth/roles',
      enabled: access.canShowRole,
    },
    {
      title: '系统日志',
      description: '查看接口调用、登录和操作记录',
      path: '/system/logs',
      enabled: access.canViewSystemLogs,
    },
    {
      title: '资源管理',
      description: '管理图片资源和工程记录素材',
      path: '/resources/images',
      enabled: access.canViewImage,
    },
  ];

  return (
    <PageContainer title="工作台" content="集中查看系统状态、关键资源和常用管理入口。">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          showIcon
          type={health.status === 'ok' ? 'success' : 'warning'}
          message={`当前登录用户：${initialState?.currentUser?.username ?? '未知用户'}`}
          description="工作台只展示当前账号有权限读取的数据；没有对应权限的模块会显示为不可用。"
        />

        <Row gutter={[16, 16]}>
          {metricCards.map((item) => (
            <Col xs={24} sm={12} xl={6} key={item.key}>
              <ProCard loading={loading && item.key !== 'health'} bordered>
                <Space align="start" size={16}>
                  <div style={{ fontSize: 28, color: '#1677ff' }}>{item.icon}</div>
                  <Statistic title={item.title} value={item.value} />
                </Space>
                <Typography.Text type="secondary">{item.description}</Typography.Text>
              </ProCard>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <ProCard title="快捷入口" bordered extra={<AppstoreOutlined />}>
              <Row gutter={[12, 12]}>
                {quickEntries.map((entry) => (
                  <Col xs={24} md={12} key={entry.path}>
                    <ProCard
                      bordered
                      hoverable={entry.enabled}
                      onClick={() => {
                        if (entry.enabled) {
                          history.push(entry.path);
                        }
                      }}
                      style={{ cursor: entry.enabled ? 'pointer' : 'not-allowed' }}
                    >
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Typography.Text strong>{entry.title}</Typography.Text>
                          <Tag color={entry.enabled ? 'blue' : 'default'}>
                            {entry.enabled ? '可访问' : '无权限'}
                          </Tag>
                        </Space>
                        <Typography.Text type="secondary">{entry.description}</Typography.Text>
                      </Space>
                    </ProCard>
                  </Col>
                ))}
              </Row>
            </ProCard>
          </Col>

          <Col xs={24} xl={10}>
            <ProCard
              title="最近日志"
              bordered
              extra={<FileTextOutlined />}
              loading={loading && access.canViewSystemLogs}
            >
              {access.canViewSystemLogs ? (
                <List
                  dataSource={recentLogs}
                  locale={{ emptyText: '暂无日志' }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color={item.success ? 'success' : 'error'}>
                              {item.success ? '成功' : '失败'}
                            </Tag>
                            <Typography.Text ellipsis>
                              {item.requestDescription ?? `日志 #${item.id}`}
                            </Typography.Text>
                          </Space>
                        }
                        description={`${item.username ?? '系统'} · ${item.createdAt ?? ''}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Space direction="vertical">
                  <Typography.Text type="secondary">当前账号没有系统日志查看权限。</Typography.Text>
                  <Button disabled>查看系统日志</Button>
                </Space>
              )}
            </ProCard>
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
};

export default Dashboard;
