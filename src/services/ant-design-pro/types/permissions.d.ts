declare namespace Permissions {
  interface CreateParams {
    name: string;
    action: string;
    path: string;
    permissionGroupId: number;
  }
}
