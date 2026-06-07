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
    canExportSystemLogs: can(currentUser, 'system.logs.export', '导出系统日志'),
    canDeleteSystemLogs: can(currentUser, 'system.logs.delete', '删除系统日志'),
  };
}
