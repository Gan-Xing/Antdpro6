declare namespace NestWebAPI {
  type ArticleEntity = {
    id: number;
    title: string;
    description?: string;
    body: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    authorId?: number;
    author?: UserEntity;
  };

  type ArticlesControllerFindOneParams = {
    id: number;
  };

  type ArticlesControllerRemoveParams = {
    id: number;
  };

  type ArticlesControllerUpdateParams = {
    id: number;
  };

  type BatchIdsDto = {
    ids: number[];
  };

  type CaptchaControllerValidateCaptchaParams = {
    token: string;
    input: string;
  };

  type CreateArticleDto = {
    title: string;
    description?: string;
    body: string;
    published?: boolean;
  };

  type CreateImageDto = {
    /** 图片描述 */
    description: string;
    /** 区域/位置信息 */
    area: string;
    /** 图片URL数组 */
    photos: string[];
    /** GPS位置信息 */
    location?: LocationDto;
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距 */
    offset?: number;
    /** 分类 */
    category?: 'progress' | 'safety' | 'quality';
    /** 标签数组 */
    tags?: string[];
  };

  type CreateMenuDto = {
    code?: string;
    name: string;
    parentId?: number;
    path: string;
    icon?: string;
    sort?: number;
    visible?: boolean;
  };

  type CreatePermissionDto = {
    code?: string;
    name: string;
    action: string;
    path: string;
    permissionGroupId: number;
  };

  type CreatePermissionGroupDto = {
    code?: string;
    name: string;
    path: string;
    parentId?: number;
    /** 权限对象数组 */
    permissions?: number[];
    icon?: string;
    sort?: number;
    visible?: boolean;
  };

  type CreateRoleDto = {
    name: string;
    /** 权限对象数组 */
    permissions?: number[];
  };

  type CreateUserDto = {
    username: string;
    email: string;
    password: string;
    status: string;
    avatar: string;
    gender: string;
    isAdmin: boolean;
    departmentId: number;
    roles: number[];
  };

  type ImagesControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    description?: string;
    area?: string;
    category?: 'progress' | 'safety' | 'quality';
    stakeNumber?: string;
    tags?: string[];
    createdBy?: string;
    startDate?: string;
    endDate?: string;
  };

  type ImagesControllerFindOneParams = {
    id: number;
  };

  type ImagesControllerRemoveParams = {
    id: number;
  };

  type ImagesControllerUpdateParams = {
    id: number;
  };

  type LocationDto = {
    /** 纬度 */
    latitude: number;
    /** 经度 */
    longitude: number;
  };

  type LoginDto = {
    email: string;
    password: string;
  };

  type MenusControllerFindAllPagedParams = {
    pageSize?: number;
    current?: number;
    name?: string;
  };

  type MenusControllerFindOneParams = {
    id: number;
  };

  type MenusControllerRemoveParams = {
    id: number;
  };

  type MenusControllerUpdateParams = {
    id: number;
  };

  type PermissionEntity = {
    id: number;
    code: string;
    name: string;
    action: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    permissionGroupId: number;
    /** 角色对象数组 */
    roles?: any[][];
  };

  type PermissiongroupsControllerFindOneParams = {
    id: number;
  };

  type PermissiongroupsControllerRemoveParams = {
    id: number;
  };

  type PermissiongroupsControllerUpdateParams = {
    id: number;
  };

  type PermissionsControllerFindOneParams = {
    id: number;
  };

  type PermissionsControllerRemoveParams = {
    id: number;
  };

  type PermissionsControllerUpdateParams = {
    id: number;
  };

  type RefreshTokenDto = {
    refreshToken: string;
  };

  type RegisterByEmailDto = {
    token: string;
    code: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
    phoneNumber: string;
  };

  type RegisterDto = {
    username: string;
    email: string;
    password: string;
    country?: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  };

  type RoleEntity = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    /** 权限对象数组 */
    permissions?: any[][];
    /** 用户对象数组 */
    users?: any[][];
  };

  type RolesControllerFindOneParams = {
    id: number;
  };

  type RolesControllerRemoveParams = {
    id: number;
  };

  type RolesControllerUpdateParams = {
    id: number;
  };

  type SignUpFormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    country: string;
    phoneNumber: string;
    captcha: string;
    captchaToken: string;
  };

  type SystemLogControllerClearParams = {
    days: number;
  };

  type SystemLogControllerExportParams = {
    endTime?: string;
    startTime?: string;
    status?: number;
    method?: string;
    requestUrl?: string;
    username?: string;
    userId?: number;
  };

  type SystemLogControllerFindAllParams = {
    pageSize?: number;
    page?: number;
    endTime?: string;
    startTime?: string;
    status?: number;
    method?: string;
    requestUrl?: string;
    username?: string;
    userId?: number;
  };

  type SystemLogControllerFindOneParams = {
    id: number;
  };

  type Token = {
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
  };

  type UpdateArticleDto = {
    title?: string;
    description?: string;
    body?: string;
    published?: boolean;
  };

  type UpdateImageDto = {
    /** 图片描述 */
    description?: string;
    /** 区域/位置信息 */
    area?: string;
    /** 图片URL数组 */
    photos?: string[];
    /** GPS位置信息 */
    location?: LocationDto;
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距 */
    offset?: number;
    /** 分类 */
    category?: 'progress' | 'safety' | 'quality';
    /** 标签数组 */
    tags?: string[];
  };

  type UpdateMenuDto = {
    code?: string;
    name?: string;
    parentId?: number;
    path?: string;
    icon?: string;
    sort?: number;
    visible?: boolean;
  };

  type UpdatePermissionDto = {
    code?: string;
    name?: string;
    action?: string;
    path?: string;
    permissionGroupId?: number;
  };

  type UpdatePermissionGroupDto = {
    code?: string;
    name?: string;
    path?: string;
    parentId?: number;
    /** 权限对象数组 */
    permissions?: number[];
    icon?: string;
    sort?: number;
    visible?: boolean;
  };

  type UpdateRoleDto = {
    name?: string;
    /** 权限对象数组 */
    permissions?: number[];
  };

  type UpdateUserDto = {
    email?: string;
    password?: string;
    roles?: number[];
    status?: string;
    username?: string;
    avatar?: string;
    gender?: string;
    isAdmin?: boolean;
    departmentId?: number;
  };

  type UserEntity = {
    id: number;
    email: string;
    status: string;
    username: string;
    avatar: string;
    gender: string;
    isAdmin: boolean;
    departmentId: number;
    createdAt: string;
    updatedAt: string;
    /** 角色对象数组 */
    roles?: any[][];
    /** 用户文章数组 */
    articles?: any[][];
    phoneNumber: string;
    firstName: string;
    lastName: string;
    wechatId: string;
    miniWechatId: string;
  };

  type UsersControllerFindAllPagedParams = {
    current: number;
    pageSize: number;
    sorter?: string;
    name?: string;
  };

  type UsersControllerFindOneParams = {
    id: number;
  };

  type UsersControllerRemoveParams = {
    id: number;
  };

  type UsersControllerUpdateParams = {
    id: number;
  };

  type ValidateTokenDto = {
    token: string;
    code: string;
    phone: string;
  };
}
