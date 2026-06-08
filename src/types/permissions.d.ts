declare namespace Permissions {
  interface CreateParams {
    code?: string;
    name: string;
    action: string;
    path: string;
    permissionGroupId: number;
  }
  interface Entity {
    id: number;
    code: string;
    name: string;
    action: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    permissionGroup?: Menus.MenusType;
    permissionGroupId: number;
  }
}
