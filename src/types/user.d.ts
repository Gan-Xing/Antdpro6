declare namespace User {
  type Status = 'active' | 'disabled' | 'resigned';

  interface UsersEntity {
    id: number;
    email?: string | null;
    password?: string;
    status?: Status | string | null;
    username?: string | null;
    avatar?: string | null;
    gender?: string | null;
    isAdmin: boolean;
    departmentId?: number | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastLoginAt?: Date | string | null;
    lastLoginIp?: string | null;
    passwordUpdatedAt?: Date | string | null;
    roles?: Roles.Entity[];
    articles?: any;
    loginLogs?: NestWebAPI.LoginLogEntity[];
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    wechatId?: string | null;
    miniWechatId?: string | null;
  }

  interface BaseCreateUserParams {
    email: string;
    password: string;
  }

  type CreateUserParams = BaseCreateUserParams & Partial<Omit<UsersEntity, 'email' | 'password'>>;

  type UpdateUserParams = Partial<UsersEntity>;
}
