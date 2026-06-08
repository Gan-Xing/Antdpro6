declare namespace Roles {
  interface UpdateParams {
    id?: string | number;
    name: string;
    description?: string;
    sort?: number;
    enabled?: boolean;
    permissions?: number[];
  }
  interface CreateParams extends UpdateParams {
    code: string;
  }
  interface Entity {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    sort: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    permissions?: Permissions.Entity[];
    users?: User.UsersEntity[];
  }
}
