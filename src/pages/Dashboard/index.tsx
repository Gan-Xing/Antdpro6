import {
  AppstoreOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useAccess, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { dashboardControllerSummary } from '@/services/nest-web/dashboard';
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

const Dashboard: React.FC = () => {
  const access = useAccess();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ status?: string; service?: string }>({});
  const [metrics, setMetrics] = useState<Record<string, number | string | null>>({});
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      const summaryResult = await dashboardControllerSummary({ skipErrorHandler: true }).catch(
        () => undefined,
      );
      const summary = unwrapResponse<NestWebAPI.DashboardSummaryEntity | undefined>(summaryResult);

      if (mounted) {
        setHealth(summary?.health ?? {});
        setMetrics(summary?.metrics ?? {});
        setRecentLogs(summary?.recentLogs ?? []);
        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const metricCards = useMemo<DashboardMetric[]>(
    () => [
      {
        key: 'health',
        title: intl.formatMessage({ id: 'pages.dashboard.metric.health' }),
        value:
          health.status === 'ok'
            ? intl.formatMessage({ id: 'pages.dashboard.metric.health.ok' })
            : intl.formatMessage({ id: 'pages.dashboard.metric.health.check' }),
        description: health.service ?? 'NestWeb API',
        icon: <CheckCircleOutlined />,
      },
      {
        key: 'users',
        title: intl.formatMessage({ id: 'pages.dashboard.metric.users' }),
        value: access.canShowUser ? (metrics.users ?? emptyValue) : emptyValue,
        description: access.canShowUser
          ? intl.formatMessage({ id: 'pages.dashboard.metric.users.description' })
          : intl.formatMessage({ id: 'pages.dashboard.metric.users.noPermission' }),
        icon: <TeamOutlined />,
      },
      {
        key: 'roles',
        title: intl.formatMessage({ id: 'pages.dashboard.metric.roles' }),
        value: access.canShowRole ? (metrics.roles ?? emptyValue) : emptyValue,
        description: access.canShowRole
          ? intl.formatMessage({ id: 'pages.dashboard.metric.roles.description' })
          : intl.formatMessage({ id: 'pages.dashboard.metric.roles.noPermission' }),
        icon: <SafetyCertificateOutlined />,
      },
      {
        key: 'images',
        title: intl.formatMessage({ id: 'pages.dashboard.metric.resources' }),
        value: access.canViewImage ? (metrics.images ?? emptyValue) : emptyValue,
        description: access.canViewImage
          ? intl.formatMessage({ id: 'pages.dashboard.metric.resources.description' })
          : intl.formatMessage({ id: 'pages.dashboard.metric.resources.noPermission' }),
        icon: <PictureOutlined />,
      },
    ],
    [access.canShowRole, access.canShowUser, access.canViewImage, health, intl, metrics],
  );

  const quickEntries = [
    {
      title: intl.formatMessage({ id: 'menu.auth.users' }),
      description: intl.formatMessage({ id: 'pages.dashboard.quick.users.description' }),
      path: '/auth/users',
      enabled: access.canShowUser,
    },
    {
      title: intl.formatMessage({ id: 'menu.auth.roles' }),
      description: intl.formatMessage({ id: 'pages.dashboard.quick.roles.description' }),
      path: '/auth/roles',
      enabled: access.canShowRole,
    },
    {
      title: intl.formatMessage({ id: 'menu.system.logs' }),
      description: intl.formatMessage({ id: 'pages.dashboard.quick.logs.description' }),
      path: '/system/logs',
      enabled: access.canViewSystemLogs,
    },
    {
      title: intl.formatMessage({ id: 'menu.resources' }),
      description: intl.formatMessage({ id: 'pages.dashboard.quick.resources.description' }),
      path: '/resources/images',
      enabled: access.canViewImage,
    },
  ];

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'pages.dashboard.title' })}
      content={intl.formatMessage({ id: 'pages.dashboard.content' })}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          showIcon
          type={health.status === 'ok' ? 'success' : 'warning'}
          message={intl.formatMessage(
            { id: 'pages.dashboard.alert.currentUser' },
            {
              username:
                initialState?.currentUser?.username ??
                intl.formatMessage({ id: 'pages.dashboard.alert.unknownUser' }),
            },
          )}
          description={intl.formatMessage({ id: 'pages.dashboard.alert.description' })}
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
            <ProCard
              title={intl.formatMessage({ id: 'pages.dashboard.quick.title' })}
              bordered
              extra={<AppstoreOutlined />}
            >
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
                            {entry.enabled
                              ? intl.formatMessage({ id: 'pages.dashboard.quick.accessible' })
                              : intl.formatMessage({ id: 'pages.dashboard.quick.forbidden' })}
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
              title={intl.formatMessage({ id: 'pages.dashboard.recentLogs.title' })}
              bordered
              extra={<FileTextOutlined />}
              loading={loading && access.canViewSystemLogs}
            >
              {access.canViewSystemLogs ? (
                <List
                  dataSource={recentLogs}
                  locale={{
                    emptyText: intl.formatMessage({ id: 'pages.dashboard.recentLogs.empty' }),
                  }}
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
                            <Typography.Text ellipsis>
                              {item.requestDescription ??
                                intl.formatMessage(
                                  { id: 'pages.dashboard.recentLogs.fallback' },
                                  { id: item.id },
                                )}
                            </Typography.Text>
                          </Space>
                        }
                        description={`${
                          item.username ??
                          intl.formatMessage({
                            id: 'pages.dashboard.recentLogs.system',
                          })
                        } · ${item.createdAt ?? ''}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Space direction="vertical">
                  <Typography.Text type="secondary">
                    {intl.formatMessage({ id: 'pages.dashboard.recentLogs.noPermission' })}
                  </Typography.Text>
                  <Button disabled>
                    {intl.formatMessage({ id: 'pages.dashboard.recentLogs.view' })}
                  </Button>
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
