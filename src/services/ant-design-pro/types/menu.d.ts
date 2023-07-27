declare namespace Menus {
  interface MenusType {
    id: number;
    name: string;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
    permissions: any[]; // TODO: 替换为你实际的类型
    children: MenusType[] | null;
  }
}
