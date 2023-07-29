declare namespace Menus {
  interface MenusType {
    id: number;
    name: string;
    parentId: number | null;
    path: string;
    createdAt: string;
    updatedAt: string;
    permissions: any[]; // TODO: 替换为你实际的类型
    parent: MenusType | null;
    children: MenusType[] | null;
  }
}
