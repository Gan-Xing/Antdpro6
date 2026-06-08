import {
  accountControllerChangePassword,
  accountControllerProfile,
  accountControllerUpdateProfile,
} from '@/services/nest-web/account';
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
import { useAccess, useModel } from '@umijs/max';
import { Alert, Button, Col, Form, message, Row, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { genderValueEnum, renderUserStatus } from '../../Auth/Users/constants';

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
  const { setInitialState } = useModel('@@initialState');
  const { canEditProfile, canChangePassword } = useAccess();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<User.UsersEntity>(await accountControllerProfile());
      setProfile(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '个人资料加载失败');
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
          <ProCard title="个人资料" loading={loading}>
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
                  message.success('个人资料已更新');
                  return true;
                } catch (error: any) {
                  message.error(error?.response?.data?.message ?? '个人资料更新失败');
                  return false;
                }
              }}
            >
              <ProFormText name="username" label="用户名" rules={[{ required: true }]} />
              <ProFormText name="email" label="邮箱" disabled />
              <ProForm.Group>
                <ProFormText name="firstName" label="名" width="md" />
                <ProFormText name="lastName" label="姓" width="md" />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormText name="phoneNumber" label="手机号" width="md" />
                <ProFormSelect
                  name="gender"
                  label="性别"
                  width="md"
                  valueEnum={genderValueEnum}
                  placeholder="请选择"
                />
              </ProForm.Group>
              <ProFormText name="avatar" label="头像 URL" />
            </ProForm>
          </ProCard>
        </Col>
        <Col xs={24} xl={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProCard title="账号状态" loading={loading}>
              <ProDescriptions<User.UsersEntity>
                column={1}
                dataSource={profile}
                columns={[
                  {
                    title: '账号状态',
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
            </ProCard>
            <ProCard title="修改密码">
              <Alert
                showIcon
                type="info"
                message="修改密码成功后，当前 refresh token 会失效，需要重新登录。"
                style={{ marginBottom: 16 }}
              />
              <ProForm<NestWebAPI.ChangePasswordDto & { confirmPassword?: string }>
                submitter={{
                  render: (_, dom) => (canChangePassword ? dom : false),
                  submitButtonProps: {
                    children: '修改密码',
                  },
                }}
                onFinish={async (values) => {
                  if (values.newPassword !== values.confirmPassword) {
                    message.error('两次输入的新密码不一致');
                    return false;
                  }

                  try {
                    await accountControllerChangePassword({
                      currentPassword: values.currentPassword,
                      newPassword: values.newPassword,
                    });
                    message.success('密码已修改，请重新登录');
                    clearSessionAndRedirect();
                    return true;
                  } catch (error: any) {
                    message.error(error?.response?.data?.message ?? '密码修改失败');
                    return false;
                  }
                }}
              >
                <ProFormText.Password
                  name="currentPassword"
                  label="当前密码"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                />
                <ProFormText.Password
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '新密码至少 8 位' },
                  ]}
                />
                <ProFormText.Password
                  name="confirmPassword"
                  label="确认新密码"
                  rules={[{ required: true, message: '请再次输入新密码' }]}
                />
              </ProForm>
              {!canChangePassword ? (
                <Button disabled block>
                  当前角色无修改密码权限
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
