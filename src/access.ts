/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

type PermissionLike = {
  code?: string;
};

type RoleLike = {
  permissions?: PermissionLike[];
};

const checkPermission = (currentUser: User.UsersEntity | undefined, code: string) => {
  return Boolean(
    currentUser?.roles?.some((role: RoleLike) =>
      role.permissions?.some((permission) => permission.code === code),
    ),
  );
};

const can = (currentUser: User.UsersEntity | undefined, code: string) => {
  return Boolean(currentUser?.isAdmin || checkPermission(currentUser, code));
};
export default function access(initialState: { currentUser?: User.UsersEntity } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: Boolean(currentUser?.isAdmin),
    canCreateRole: can(currentUser, 'auth.roles.create'),
    canDeleteRole: can(currentUser, 'auth.roles.delete'),
    canEditRole: can(currentUser, 'auth.roles.update'),
    canShowRole: can(currentUser, 'auth.roles.view'),

    // 图片管理相关权限
    canCreateImage: can(currentUser, 'resources.images.create'),
    canUpdateImage: can(currentUser, 'resources.images.update'),
    canDeleteImage: can(currentUser, 'resources.images.delete'),
    canViewImage: can(currentUser, 'resources.images.view'),

    canCreateUser: can(currentUser, 'auth.users.create'),
    canDeleteUser: can(currentUser, 'auth.users.delete'),
    canEditUser: can(currentUser, 'auth.users.update'),
    canShowUser: can(currentUser, 'auth.users.view'),
    canDisableUser: can(currentUser, 'auth.users.disable'),
    canResetUserPassword: can(currentUser, 'auth.users.resetPassword'),

    canCreateMenu: can(currentUser, 'auth.menus.create'),
    canDeleteMenu: can(currentUser, 'auth.menus.delete'),
    canEditMenu: can(currentUser, 'auth.menus.update'),
    canShowMenu: can(currentUser, 'auth.menus.view'),

    canCreatePermission: can(currentUser, 'auth.permissions.create'),
    canDeletePermission: can(currentUser, 'auth.permissions.delete'),
    canEditPermission: can(currentUser, 'auth.permissions.update'),
    canShowPermission: can(currentUser, 'auth.permissions.view'),

    // 系统日志管理
    canViewSystemLogs: can(currentUser, 'system.logs.view'),
    canViewSystemLogDetail: can(currentUser, 'system.logs.detail'),
    canExportSystemLogs: can(currentUser, 'system.logs.export'),
    canDeleteSystemLogs: can(currentUser, 'system.logs.delete'),

    canViewDicts: can(currentUser, 'system.dicts.view'),
    canCreateDicts: can(currentUser, 'system.dicts.create'),
    canEditDicts: can(currentUser, 'system.dicts.update'),
    canDeleteDicts: can(currentUser, 'system.dicts.delete'),

    canViewSystemConfig: can(currentUser, 'system.config.view'),
    canEditSystemConfig: can(currentUser, 'system.config.update'),

    canViewFiles: can(currentUser, 'system.files.view'),
    canUploadFiles: can(currentUser, 'system.files.upload'),
    canDownloadFiles: can(currentUser, 'system.files.download'),
    canDeleteFiles: can(currentUser, 'system.files.delete'),

    canViewSystemStatus: can(currentUser, 'system.status.view'),
    canViewSystemVersion: can(currentUser, 'system.version.view'),
    canViewSystemQueues: can(currentUser, 'system.queues.view'),

    // 消息中心
    canViewMessages: can(currentUser, 'message.view'),
    canManageMessages: can(currentUser, 'message.manage'),
    canCompleteMessages: can(currentUser, 'message.complete'),

    // 审批请求
    canViewApprovalRequests: can(currentUser, 'approval.requests.view'),
    canCreateApprovalRequests: can(currentUser, 'approval.requests.create'),
    canApproveApprovalRequests: can(currentUser, 'approval.requests.approve'),
    canRejectApprovalRequests: can(currentUser, 'approval.requests.reject'),
    canCancelApprovalRequests: can(currentUser, 'approval.requests.cancel'),
    canManageApprovalRequests: can(currentUser, 'approval.requests.manage'),
    canExportData: can(currentUser, 'export.data'),

    // 账号安全
    canViewLoginLogs: can(currentUser, 'security.loginLogs.view'),
    canViewProfile: can(currentUser, 'account.profile.view'),
    canEditProfile: can(currentUser, 'account.profile.update'),
    canChangePassword: can(currentUser, 'account.password.change'),
  };
}
