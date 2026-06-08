/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'DashboardOutlined',
    component: './Dashboard',
  },
  {
    path: '/message-center',
    name: 'messageCenter',
    access: 'canViewMessages',
    icon: 'BellOutlined',
    component: './MessageCenter',
  },
  {
    path: '/auth',
    name: 'auth',
    icon: 'table',
    routes: [
      {
        path: '/auth/users',
        name: 'users',
        access: 'canShowUser',
        component: './Auth/Users',
      },
      {
        path: '/auth/roles',
        name: 'roles',
        access: 'canShowRole',
        component: './Auth/Roles',
      },
      {
        path: '/auth/permissions',
        name: 'permissions',
        access: 'canShowPermission',
        component: './Auth/Permissions',
      },
      {
        path: '/auth/menus',
        name: 'menus',
        access: 'canShowMenu',
        component: './Auth/Menus',
      },
    ],
  },
  {
    path: '/resources',
    name: 'resources',
    icon: 'FolderOutlined',
    routes: [
      {
        path: '/resources/images',
        name: 'images',
        access: 'canViewImage',
        icon: 'PictureOutlined',
        component: './Resources/Images',
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    icon: 'SettingOutlined', // 使用更通用的“设置”图标
    routes: [
      {
        path: '/system/logs',
        name: 'logs',
        access: 'canViewSystemLogs',
        icon: 'FileTextOutlined', // 更适合日志的文本文件图标
        component: './System/SystemLogs',
      },
      {
        path: '/system/dicts',
        name: 'dicts',
        access: 'canViewDicts',
        icon: 'ProfileOutlined',
        component: './System/Dicts',
      },
      {
        path: '/system/config',
        name: 'config',
        access: 'canViewSystemConfig',
        icon: 'ControlOutlined',
        component: './System/Config',
      },
      {
        path: '/system/files',
        name: 'files',
        access: 'canViewFiles',
        icon: 'CloudUploadOutlined',
        component: './System/Files',
      },
      {
        path: '/system/status',
        name: 'status',
        access: 'canViewSystemStatus',
        icon: 'DashboardOutlined',
        component: './System/Status',
      },
      {
        path: '/system/version',
        name: 'version',
        access: 'canViewSystemVersion',
        icon: 'InfoCircleOutlined',
        component: './System/Version',
      },
      {
        path: '/system/queues',
        name: 'queues',
        access: 'canViewSystemQueues',
        icon: 'ClusterOutlined',
        component: './System/Queues',
      },
    ],
  },
  {
    path: '/security',
    name: 'security',
    icon: 'SafetyOutlined',
    routes: [
      {
        path: '/security/login-logs',
        name: 'loginLogs',
        access: 'canViewLoginLogs',
        icon: 'AuditOutlined',
        component: './Security/LoginLogs',
      },
    ],
  },
  {
    path: '/approvals/requests',
    name: 'approvalRequests',
    access: 'canViewApprovalRequests',
    icon: 'AuditOutlined',
    component: './Approvals/Requests',
  },
  {
    path: '/account/profile',
    name: 'profile',
    access: 'canViewProfile',
    hideInMenu: true,
    component: './Account/Profile',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/403',
    hideInMenu: true,
    component: './403',
  },
  {
    path: '/500',
    hideInMenu: true,
    component: './500',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
