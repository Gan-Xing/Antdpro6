declare namespace Menus {
  interface MenusType {
    id: number;
    code: string;
    name: string;
    parentId: number | null;
    path: string;
    icon?: string | null;
    sort: number;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
    permissions: Permissions.Entity[];
    parent: MenusType | null;
    children: MenusType[] | null;
  }
}
