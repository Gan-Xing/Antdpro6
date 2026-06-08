import Footer from '@/components/Footer';
import { SelectLang } from '@/components/RightContent';
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  LinkOutlined,
  PictureOutlined,
  AuditOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  SafetyOutlined,
  SettingOutlined,
  TableOutlined,
  ProfileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import * as React from 'react';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import { menusControllerFindUserMenus } from './services/nest-web/menus';
import { usersControllerFindCurrent } from './services/nest-web/users';
import { unwrapResponse } from './utils/apiResponse';
import { errorConfig } from './utils/request/requestErrorConfig';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const menuIconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  FolderOutlined: <FolderOutlined />,
  PictureOutlined: <PictureOutlined />,
  AuditOutlined: <AuditOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />,
  ControlOutlined: <ControlOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  SettingOutlined: <SettingOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  table: <TableOutlined />,
  TableOutlined: <TableOutlined />,
  UserOutlined: <UserOutlined />,
};

const resolveMenuIcon = (icon: unknown): React.ReactNode | undefined => {
  if (typeof icon !== 'string') {
    return icon as React.ReactNode;
  }

  return menuIconMap[icon] ?? undefined;
};

const processRemoteMenuData = (menuItem: any): any => {
  const newMenuItem = {
    ...menuItem,
    icon: resolveMenuIcon(menuItem.icon),
    locale: menuItem.name,
  };

  if (newMenuItem.children) {
    newMenuItem.children = newMenuItem.children.map(processRemoteMenuData);
  }

  return newMenuItem;
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: User.UsersEntity;
  loading?: boolean;
  fetchUserInfo?: () => Promise<User.UsersEntity | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await usersControllerFindCurrent({
        skipErrorHandler: true,
      });
      return unwrapResponse<User.UsersEntity>(msg as any);
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => (isDev ? [<SelectLang key="SelectLang" />] : []),
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    menu: {
      params: {
        userId: initialState?.currentUser?.id,
      },
      request: async () => {
        // 添加判断，如果没有用户信息则不请求
        if (!initialState?.currentUser) {
          return [];
        }
        const data = unwrapResponse<any[]>(await menusControllerFindUserMenus());
        return (data || []).map(processRemoteMenuData);
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username ?? undefined,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev ? (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          ) : null}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
