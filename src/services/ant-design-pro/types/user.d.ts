declare namespace User {
  type CurrentUser = {
    id: number;
    email: string;
    status: string;
    username: string;
    gender: number;
    departmentId: number;
    isAdmin: boolean;
    avatar: string;
    roles?: any;
    createdAt: Date;
    updatedAt: Date;
    articles?: any;
  };
  //   type CurrentUser = {
  //     id?: number;
  //     name?: string;
  //     avatar?: string;
  //     userid?: string;
  //     email?: string;
  //     signature?: string;
  //     title?: string;
  //     group?: string;
  //     tags?: { key?: string; label?: string }[];
  //     notifyCount?: number;
  //     unreadCount?: number;
  //     country?: string;
  //     access?: string;
  //     geographic?: {
  //       province?: { label?: string; key?: string };
  //       city?: { label?: string; key?: string };
  //     };
  //     address?: string;
  //     phone?: string;
  //     isAdmin?: boolean;
  //     roles?: any;
  //   };
}
