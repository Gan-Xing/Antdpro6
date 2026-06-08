/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

type PermissionLike = {
  code?: string;
  name?: string;
};

type RoleLike = {
  permissions?: PermissionLike[];
};

const checkPermission = (
  currentUser: User.UsersEntity | undefined,
  code: string,
  fallbackName?: string,
) => {
  return Boolean(
    currentUser?.roles?.some((role: RoleLike) =>
      role.permissions?.some(
        (permission) => permission.code === code || permission.name === fallbackName,
      ),
    ),
  );
};

const can = (currentUser: User.UsersEntity | undefined, code: string, fallbackName: string) => {
  return Boolean(currentUser?.isAdmin || checkPermission(currentUser, code, fallbackName));
};
export default function access(initialState: { currentUser?: User.UsersEntity } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: Boolean(currentUser?.isAdmin),
    canCreateRole: can(currentUser, 'auth.roles.create', '新增角色'),
    canDeleteRole: can(currentUser, 'auth.roles.delete', '删除角色'),
    canEditRole: can(currentUser, 'auth.roles.update', '编辑角色'),
    canShowRole: can(currentUser, 'auth.roles.view', '查看角色'),

    // 图片管理相关权限
    canCreateImage: can(currentUser, 'resources.images.create', '新增图片'),
    canUpdateImage: can(currentUser, 'resources.images.update', '更新图片'),
    canDeleteImage: can(currentUser, 'resources.images.delete', '删除图片'),
    canViewImage: can(currentUser, 'resources.images.view', '查看图片列表'),

    canCreateUser: can(currentUser, 'auth.users.create', '新增用户'),
    canDeleteUser: can(currentUser, 'auth.users.delete', '删除用户'),
    canEditUser: can(currentUser, 'auth.users.update', '编辑用户'),
    canShowUser: can(currentUser, 'auth.users.view', '查看用户'),
    canDisableUser: can(currentUser, 'auth.users.disable', '启停用户'),
    canResetUserPassword: can(currentUser, 'auth.users.resetPassword', '重置用户密码'),

    canCreateMenu: can(currentUser, 'auth.menus.create', '新增菜单'),
    canDeleteMenu: can(currentUser, 'auth.menus.delete', '删除菜单'),
    canEditMenu: can(currentUser, 'auth.menus.update', '编辑菜单'),
    canShowMenu: can(currentUser, 'auth.menus.view', '查看菜单'),

    canCreatePermission: can(currentUser, 'auth.permissions.create', '新增权限'),
    canDeletePermission: can(currentUser, 'auth.permissions.delete', '删除权限'),
    canEditPermission: can(currentUser, 'auth.permissions.update', '编辑权限'),
    canShowPermission: can(currentUser, 'auth.permissions.view', '查看权限'),

    // 系统日志管理
    canViewSystemLogs: can(currentUser, 'system.logs.view', '查看系统日志'),
    canViewSystemLogDetail: can(currentUser, 'system.logs.detail', '查看系统日志详情'),
    canExportSystemLogs: can(currentUser, 'system.logs.export', '导出系统日志'),
    canDeleteSystemLogs: can(currentUser, 'system.logs.delete', '删除系统日志'),

    canViewDicts: can(currentUser, 'system.dicts.view', '查看字典'),
    canCreateDicts: can(currentUser, 'system.dicts.create', '新增字典'),
    canEditDicts: can(currentUser, 'system.dicts.update', '编辑字典'),
    canDeleteDicts: can(currentUser, 'system.dicts.delete', '删除字典'),

    canViewSystemConfig: can(currentUser, 'system.config.view', '查看系统参数'),
    canEditSystemConfig: can(currentUser, 'system.config.update', '编辑系统参数'),

    canViewFiles: can(currentUser, 'system.files.view', '查看文件'),
    canUploadFiles: can(currentUser, 'system.files.upload', '上传文件'),
    canDownloadFiles: can(currentUser, 'system.files.download', '下载文件'),
    canDeleteFiles: can(currentUser, 'system.files.delete', '删除文件'),

    canViewSystemStatus: can(currentUser, 'system.status.view', '查看系统状态'),
    canViewSystemVersion: can(currentUser, 'system.version.view', '查看版本信息'),
    canViewSystemQueues: can(currentUser, 'system.queues.view', '查看队列状态'),

    // 消息中心
    canViewMessages: can(currentUser, 'message.view', '查看消息'),
    canManageMessages: can(currentUser, 'message.manage', '管理消息'),
    canCompleteMessages: can(currentUser, 'message.complete', '完成待办'),

    // 审批请求
    canViewApprovalRequests: can(currentUser, 'approval.requests.view', '查看审批请求'),
    canCreateApprovalRequests: can(currentUser, 'approval.requests.create', '创建审批请求'),
    canApproveApprovalRequests: can(currentUser, 'approval.requests.approve', '通过审批请求'),
    canRejectApprovalRequests: can(currentUser, 'approval.requests.reject', '驳回审批请求'),
    canCancelApprovalRequests: can(currentUser, 'approval.requests.cancel', '取消审批请求'),
    canManageApprovalRequests: can(currentUser, 'approval.requests.manage', '管理全部审批请求'),
    canExportData: can(currentUser, 'export.data', '导出数据'),

    // 账号安全
    canViewLoginLogs: can(currentUser, 'security.loginLogs.view', '查看登录日志'),
    canViewProfile: can(currentUser, 'account.profile.view', '查看个人资料'),
    canEditProfile: can(currentUser, 'account.profile.update', '编辑个人资料'),
    canChangePassword: can(currentUser, 'account.password.change', '修改个人密码'),
  };
}
