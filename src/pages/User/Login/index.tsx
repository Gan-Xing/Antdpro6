import Footer from '@/components/Footer';
import { login, register, fetchCaptcha } from '@/services/ant-design-pro/api';
import * as authUtil from '@/utils/auth';
import { LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<Common.ResponseStructure<Auth.Token>>();
  const [loginType, setLoginType] = useState<string>('login');
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const { initialState, setInitialState } = useModel('@@initialState');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const data = await login({ ...values, type: 'email' });

      if (data.data) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        authUtil.setToken(data.data);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      setUserLoginState(data);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };

  const handleRegister = async (values: API.RegisterParams) => {
    try {
      const registerData = {
        ...values,
        captchaToken,
      } as API.RegisterParams;

      const data = await register(registerData);
      if (data.data) {
        message.success('注册成功！');
        // 自动登录
        await handleSubmit({ email: values.email, password: values.password });
      } else {
        message.error('注册失败，请重试！');
      }
    } catch (error) {
      message.error('注册失败，请重试！');
    }
  };

  const success = userLoginState?.success;

  const refreshCaptcha = async () => {
    try {
      const data = await fetchCaptcha();
      if (data) {
        setCaptchaSrc(data.image);
        setCaptchaToken(data.token);
      }
    } catch (error) {
      console.error('Error fetching captcha:', error);
    }
  };

  useEffect(() => {
    if (loginType === 'register') {
      refreshCaptcha();
    }
  }, [loginType]);

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          onFinish={async (values) => {
            if (loginType === 'login') {
              await handleSubmit(values as API.LoginParams);
            } else {
              await handleRegister(values as API.RegisterParams);
            }
          }}
        >
          <Tabs
            activeKey={loginType}
            onChange={setLoginType}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />
          {success && loginType === 'login' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.emailLogin.errorMessage',
                defaultMessage: '邮箱或密码错误',
              })}
            />
          )}
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.email.placeholder',
              defaultMessage: '邮箱',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage id="pages.login.email.required" defaultMessage="请输入邮箱!" />
                ),
              },
              {
                type: 'email',
                message: (
                  <FormattedMessage
                    id="pages.login.email.invalid"
                    defaultMessage="请输入有效的邮箱地址!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
              {
                min: 6,
                message: (
                  <FormattedMessage
                    id="pages.login.password.length"
                    defaultMessage="密码至少6位！"
                  />
                ),
              },
            ]}
          />
          {loginType === 'register' && (
            <>
              <div style={{ display: 'flex', gap: '16px' }}>
                <ProFormText
                  name="lastName"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder="姓"
                  rules={[
                    {
                      required: true,
                      message: '请输入姓!',
                    },
                  ]}
                />
                <ProFormText
                  name="firstName"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder="名"
                  rules={[
                    {
                      required: true,
                      message: '请输入名!',
                    },
                  ]}
                />
              </div>
              <ProFormSelect
                name="country"
                fieldProps={{
                  size: 'large',
                }}
                valueEnum={{
                  CN: {
                    text: '中国 +86',
                  },
                  CI: {
                    text: '科特迪瓦 +225',
                  },
                }}
                placeholder="请选择国家"
                initialValue="CN"
              />
              <ProFormText
                name="phoneNumber"
                fieldProps={{
                  size: 'large',
                  prefix: <PhoneOutlined />,
                }}
                placeholder="手机号码"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号码!',
                  },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码!',
                  },
                ]}
              />
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    cursor: 'pointer',
                    width: '150px',
                    height: '40px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                  }}
                  onClick={refreshCaptcha}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: captchaSrc,
                    }}
                  />
                </div>
                <ProFormText
                  name="captcha"
                  fieldProps={{
                    size: 'large',
                  }}
                  placeholder="验证码"
                  rules={[{ required: true, message: '请输入验证码!' }]}
                />
              </div>
            </>
          )}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
