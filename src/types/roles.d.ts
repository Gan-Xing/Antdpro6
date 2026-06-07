declare namespace Roles {
  interface UpdateParams {
    id?: string | number;
    name: string;
    permissions?: number[];
  }
  interface CreateParams extends UpdateParams {
    code: string;
  }
  interface Entity {
    id: number;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    permissions: Permissions.Entity[];
    users: User.UsersEntity[];
  }
}
