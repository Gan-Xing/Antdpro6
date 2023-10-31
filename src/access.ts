/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

const checkPermission = (currentUser: User.UsersEntity, name: string) => {
  return (
    currentUser &&
    currentUser.roles?.some(
      (role: any) => role.permissions && !!role.permissions.find((item: any) => item.name === name),
    )
  );
};
export default function access(initialState: { currentUser?: User.UsersEntity } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser?.isAdmin,
    canCreateRole:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '新增角色')),
    canDeleteRole:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '删除角色')),
    canUpdateRole:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '修改角色')),
    canShowRole: currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '查看角色')),
    canCreateUser:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '新增用户')),
    canDeleteUser:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '删除用户')),
    canUpdateUser:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '修改用户')),
    canShowUser: currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '查看用户')),

    canCreateMenu:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '新增菜单')),
    canDeleteMenu:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '删除菜单')),
    canUpdateMenu:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '修改菜单')),
    canShowMenu: currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '查看菜单')),

    canCreatePermission:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '新增权限')),
    canDeletePermission:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '删除权限')),
    canUpdatePermission:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '修改权限')),
    canShowPermission:
      currentUser && (currentUser?.isAdmin || checkPermission(currentUser, '查看权限')),
  };
}
