import * as React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { TestBrowser } from '@@/testBrowser';
import { authControllerLogin } from '@/services/nest-web/auth';
import { menusControllerFindUserMenus } from '@/services/nest-web/menus';
import { usersControllerFindCurrent } from '@/services/nest-web/users';
import * as authUtil from '@/utils/auth';

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      ...antd.message,
      error: jest.fn(),
      success: jest.fn(),
    },
  };
});

jest.mock('@/services/nest-web/auth', () => ({
  authControllerLogin: jest.fn(),
  authControllerRegisterByEmail: jest.fn(),
  authControllerValidateCaptchaAndInitiateEmailVerification: jest.fn(),
}));

jest.mock('@/services/nest-web/captcha', () => ({
  captchaControllerGetCaptcha: jest.fn(),
}));

jest.mock('@/services/nest-web/menus', () => ({
  menusControllerFindUserMenus: jest.fn(),
}));

jest.mock('@/services/nest-web/users', () => ({
  usersControllerFindCurrent: jest.fn(),
}));

jest.mock('@/utils/auth', () => ({
  formatToken: jest.fn((token: string) => `Bearer ${token}`),
  getAccessToken: jest.fn(() => 'access-token'),
  getRefreshToken: jest.fn(() => 'refresh-token'),
  removeToken: jest.fn(),
  setToken: jest.fn(),
}));

const token: Auth.Token = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessExpiresIn: 3600,
  refreshExpiresIn: 7200,
};

const renderLoginPage = () => {
  const historyRef = React.createRef<any>();
  const rootContainer = render(
    <TestBrowser
      historyRef={historyRef}
      location={{
        pathname: '/user/login',
      }}
    />,
  );

  return {
    historyRef,
    rootContainer,
  };
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/user/login');
    (authControllerLogin as jest.Mock).mockResolvedValue(token);
    (usersControllerFindCurrent as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      access: 'admin',
    });
    (menusControllerFindUserMenus as jest.Mock).mockResolvedValue([]);
  });

  it('should show login form', async () => {
    const { historyRef, rootContainer } = renderLoginPage();

    await rootContainer.findAllByText('Ant Design');

    act(() => {
      historyRef.current?.push('/user/login');
    });

    expect(rootContainer.baseElement?.querySelector('.ant-pro-form-login-desc')?.textContent).toBe(
      'Ant Design is the most influential web design specification in Xihu district',
    );

    expect(rootContainer.getByPlaceholderText(/邮箱|email/i)).toBeTruthy();
    expect(rootContainer.getByPlaceholderText(/密码|password/i)).toBeTruthy();
    expect(rootContainer.getByRole('tab', { name: /登录|login/i })).toBeTruthy();
    expect(rootContainer.getByRole('tab', { name: /注册|register/i })).toBeTruthy();

    rootContainer.unmount();
  });

  it('should login success', async () => {
    window.history.pushState({}, '', '/user/login?redirect=/user/login');
    const { historyRef, rootContainer } = renderLoginPage();

    await rootContainer.findAllByText('Ant Design');

    const emailInput = await rootContainer.findByPlaceholderText(/邮箱|email/i);

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    });

    const passwordInput = await rootContainer.findByPlaceholderText(/密码|password/i);

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'ant.design' } });
    });

    fireEvent.click(rootContainer.getByRole('button', { name: /login|登录/i }));

    await waitFor(() => {
      expect(authControllerLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin@example.com',
          password: 'ant.design',
        }),
      );
    });

    await waitFor(() => {
      expect(authUtil.setToken).toHaveBeenCalledWith(token);
      expect(usersControllerFindCurrent).toHaveBeenCalled();
      expect(historyRef.current?.location.pathname).toBe('/user/login');
    });

    rootContainer.unmount();
  });
});
