import {
  accountControllerChangePassword,
  accountControllerProfile,
  accountControllerUpdateProfile,
} from '@/services/nest-web/account';
import { useDictOptions } from '@/hooks/useDictOptions';
import { clearSessionAndRedirect } from '@/utils/session';
import { unwrapResponse } from '@/utils/apiResponse';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useAccess, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Col, Form, message, Row, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { genderFallbackOptions, renderUserStatus } from '../../Auth/Users/constants';

const formatTime = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User.UsersEntity>();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const intl = useIntl();
  const { setInitialState } = useModel('@@initialState');
  const { canEditProfile, canChangePassword } = useAccess();
  const { options: genderOptions } = useDictOptions('user.gender', genderFallbackOptions);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<User.UsersEntity>(await accountControllerProfile());
      setProfile(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          intl.formatMessage({ id: 'pages.account.profile.loadFailed' }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue(profile);
    }
  }, [profile, profileForm]);

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <ProCard
            title={intl.formatMessage({ id: 'pages.account.profile.title' })}
            loading={loading}
          >
            <ProForm<NestWebAPI.UpdateProfileDto>
              form={profileForm}
              initialValues={profile}
              submitter={{
                render: (_, dom) => (canEditProfile ? dom : false),
              }}
              onFinish={async (values) => {
                try {
                  const nextProfile = unwrapResponse<User.UsersEntity>(
                    await accountControllerUpdateProfile(values),
                  );
                  setProfile(nextProfile);
                  setInitialState((state) => ({
                    ...state,
                    currentUser: {
                      ...state?.currentUser,
                      ...nextProfile,
                    },
                  }));
                  message.success(
                    intl.formatMessage({ id: 'pages.account.profile.updateSuccess' }),
                  );
                  return true;
                } catch (error: any) {
                  message.error(
                    error?.response?.data?.message ??
                      intl.formatMessage({ id: 'pages.account.profile.updateFailed' }),
                  );
                  return false;
                }
              }}
            >
              <ProFormText
                name="username"
                label={intl.formatMessage({ id: 'pages.account.profile.username' })}
                rules={[{ required: true }]}
              />
              <ProFormText
                name="email"
                label={intl.formatMessage({ id: 'pages.account.profile.email' })}
                disabled
              />
              <ProForm.Group>
                <ProFormText
                  name="firstName"
                  label={intl.formatMessage({ id: 'pages.account.profile.firstName' })}
                  width="md"
                />
                <ProFormText
                  name="lastName"
                  label={intl.formatMessage({ id: 'pages.account.profile.lastName' })}
                  width="md"
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormText
                  name="phoneNumber"
                  label={intl.formatMessage({ id: 'pages.account.profile.phoneNumber' })}
                  width="md"
                />
                <ProFormSelect
                  name="gender"
                  label={intl.formatMessage({ id: 'pages.account.profile.gender' })}
                  width="md"
                  options={genderOptions}
                  placeholder={intl.formatMessage({ id: 'common.select.placeholder' })}
                />
              </ProForm.Group>
              <ProFormText
                name="avatar"
                label={intl.formatMessage({ id: 'pages.account.profile.avatar' })}
              />
            </ProForm>
          </ProCard>
        </Col>
        <Col xs={24} xl={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProCard
              title={intl.formatMessage({ id: 'pages.account.status.title' })}
              loading={loading}
            >
              <ProDescriptions<User.UsersEntity>
                column={1}
                dataSource={profile}
                columns={[
                  {
                    title: intl.formatMessage({ id: 'pages.account.status.accountStatus' }),
                    dataIndex: 'status',
                    render: (_, entity) => renderUserStatus(entity.status),
                  },
                  {
                    title: intl.formatMessage({ id: 'pages.account.status.superAdmin' }),
                    dataIndex: 'isAdmin',
                    render: (_, entity) =>
                      entity.isAdmin ? (
                        <Tag color="success">{intl.formatMessage({ id: 'common.yes' })}</Tag>
                      ) : (
                        <Tag>{intl.formatMessage({ id: 'common.no' })}</Tag>
                      ),
                  },
                  {
                    title: intl.formatMessage({ id: 'pages.account.status.lastLogin' }),
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
            </ProCard>
            <ProCard title={intl.formatMessage({ id: 'pages.account.password.title' })}>
              <Alert
                showIcon
                type="info"
                message={intl.formatMessage({ id: 'pages.account.password.notice' })}
                style={{ marginBottom: 16 }}
              />
              <ProForm<NestWebAPI.ChangePasswordDto & { confirmPassword?: string }>
                submitter={{
                  render: (_, dom) => (canChangePassword ? dom : false),
                  submitButtonProps: {
                    children: intl.formatMessage({ id: 'pages.account.password.submit' }),
                  },
                }}
                onFinish={async (values) => {
                  if (values.newPassword !== values.confirmPassword) {
                    message.error(intl.formatMessage({ id: 'pages.account.password.mismatch' }));
                    return false;
                  }

                  try {
                    await accountControllerChangePassword({
                      currentPassword: values.currentPassword,
                      newPassword: values.newPassword,
                    });
                    message.success(intl.formatMessage({ id: 'pages.account.password.success' }));
                    clearSessionAndRedirect();
                    return true;
                  } catch (error: any) {
                    message.error(
                      error?.response?.data?.message ??
                        intl.formatMessage({ id: 'pages.account.password.failed' }),
                    );
                    return false;
                  }
                }}
              >
                <ProFormText.Password
                  name="currentPassword"
                  label={intl.formatMessage({ id: 'pages.account.password.current' })}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'pages.account.password.currentRequired' }),
                    },
                  ]}
                />
                <ProFormText.Password
                  name="newPassword"
                  label={intl.formatMessage({ id: 'pages.account.password.new' })}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'pages.account.password.newRequired' }),
                    },
                    { min: 8, message: intl.formatMessage({ id: 'pages.account.password.min' }) },
                  ]}
                />
                <ProFormText.Password
                  name="confirmPassword"
                  label={intl.formatMessage({ id: 'pages.account.password.confirm' })}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'pages.account.password.confirmRequired' }),
                    },
                  ]}
                />
              </ProForm>
              {!canChangePassword ? (
                <Button disabled block>
                  {intl.formatMessage({ id: 'pages.account.password.noPermission' })}
                </Button>
              ) : null}
            </ProCard>
          </Space>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProfilePage;
