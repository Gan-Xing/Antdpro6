declare namespace NestWebAPI {
  type UserStatus = 'active' | 'disabled' | 'resigned';

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
    /** Stable role identity, such as admin or user. */
    code: string;
    name: string;
    /** Role capability pack description. */
    description?: string;
    /** Display order for role lists. */
    sort?: number;
    /** Whether this role can be assigned. */
    enabled?: boolean;
    /** 权限对象数组 */
    permissions?: number[];
  };

  type CreateUserDto = {
    username: string;
    email: string;
    password: string;
    status?: UserStatus;
    avatar?: string;
    gender: string;
    isAdmin?: boolean;
    departmentId?: number;
    roles: number[];
  };

  type ChangePasswordDto = {
    currentPassword: string;
    newPassword: string;
  };

  type CreateDictTypeDto = {
    code: string;
    name: string;
    description?: string;
    enabled?: boolean;
    sort?: number;
  };

  type UpdateDictTypeDto = {
    name?: string;
    description?: string;
    enabled?: boolean;
    sort?: number;
  };

  type CreateDictItemDto = {
    dictTypeId: number;
    code: string;
    label: string;
    value: string;
    color?: string;
    description?: string;
    enabled?: boolean;
    sort?: number;
  };

  type UpdateDictItemDto = {
    label?: string;
    value?: string;
    color?: string;
    description?: string;
    enabled?: boolean;
    sort?: number;
  };

  type DashboardHealthEntity = {
    status: string;
    service: string;
    timestamp: string;
  };

  type DashboardMetricsEntity = {
    users: number | null;
    roles: number | null;
    images: number | null;
    logs: number | null;
  };

  type DashboardRecentLogEntity = {
    id: number;
    username: string;
    requestDescription: string;
    duration: number;
    success: boolean;
    createdAt: string;
  };

  type DashboardSummaryEntity = {
    health: DashboardHealthEntity;
    metrics: DashboardMetricsEntity;
    recentLogs: DashboardRecentLogEntity[];
  };

  type DictTypeEntity = {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
    items?: DictItemEntity[];
  };

  type DictItemEntity = {
    id: number;
    dictTypeId: number;
    code: string;
    label: string;
    value: string;
    color?: string | null;
    description?: string | null;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
    dictType?: DictTypeEntity;
  };

  type DictsControllerFindTypesParams = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    enabled?: boolean;
  };

  type DictsControllerUpdateTypeParams = {
    id: number;
  };

  type DictsControllerRemoveTypeParams = {
    id: number;
  };

  type DictsControllerFindItemsParams = {
    dictTypeId?: number;
    typeCode?: string;
    keyword?: string;
    enabled?: boolean;
  };

  type DictsControllerFindItemsByTypeCodeParams = {
    code: string;
  };

  type DictsControllerUpdateItemParams = {
    id: number;
  };

  type DictsControllerRemoveItemParams = {
    id: number;
  };

  type SystemConfigEntity = {
    id: number;
    key: string;
    name: string;
    value: string;
    valueType: string;
    group: string;
    description?: string | null;
    editable: boolean;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
  };

  type UpdateSystemConfigDto = {
    value: string;
  };

  type SystemConfigControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    group?: string;
    keyword?: string;
    enabled?: boolean;
  };

  type SystemConfigControllerFindOneParams = {
    id: number;
  };

  type SystemConfigControllerUpdateParams = {
    id: number;
  };

  type UploadFileAssetDto = {
    category?: string;
    description?: string;
  };

  type FileAssetEntity = {
    id: number;
    originalName: string;
    filename: string;
    storagePath: string;
    url: string;
    mimeType: string;
    size: number;
    extension?: string | null;
    category?: string | null;
    description?: string | null;
    uploaderId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    uploader?: {
      id: number;
      username?: string | null;
      email?: string | null;
      avatar?: string | null;
    } | null;
  };

  type FileDownloadEntity = {
    id: number;
    originalName: string;
    url: string;
  };

  type FilesControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    category?: string;
    mimeType?: string;
    startTime?: string;
    endTime?: string;
  };

  type FilesControllerFindOneParams = {
    id: number;
  };

  type FilesControllerGetDownloadUrlParams = {
    id: number;
  };

  type FilesControllerRemoveParams = {
    id: number;
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

  type PermissionTreeNodeEntity = {
    key: string;
    title: string;
    permissionId?: number;
    code?: string;
    action?: string;
    path?: string;
    selectable: boolean;
    checkable?: boolean;
    children?: PermissionTreeNodeEntity[];
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
    code: string;
    name: string;
    description?: string | null;
    sort: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    /** 权限对象数组 */
    permissions?: PermissionEntity[];
    /** 用户对象数组 */
    users?: UserEntity[];
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

  type TestSmsDto = {
    /** Phone number used for the SMS provider check. */
    phoneNumber: string;
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
    description?: string;
    sort?: number;
    enabled?: boolean;
    /** 权限对象数组 */
    permissions?: number[];
  };

  type ResetPasswordDto = {
    password: string;
  };

  type UpdateProfileDto = {
    username?: string;
    avatar?: string;
    gender?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };

  type UpdateUserDto = {
    email?: string;
    password?: string;
    roles?: number[];
    status?: UserStatus;
    username?: string;
    avatar?: string;
    gender?: string;
    isAdmin?: boolean;
    departmentId?: number;
  };

  type UpdateUserStatusDto = {
    status: UserStatus;
  };

  type UserEntity = {
    id: number;
    email?: string | null;
    status?: UserStatus | string | null;
    username?: string | null;
    avatar?: string | null;
    gender?: string | null;
    isAdmin: boolean;
    departmentId?: number | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string | null;
    lastLoginIp?: string | null;
    passwordUpdatedAt?: string | null;
    /** 角色对象数组 */
    roles?: RoleEntity[];
    /** 用户文章数组 */
    articles?: any[];
    /** 用户登录日志 */
    loginLogs?: LoginLogEntity[];
    phoneNumber?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    wechatId?: string | null;
    miniWechatId?: string | null;
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

  type UsersControllerUpdateStatusParams = {
    id: number;
  };

  type UsersControllerResetPasswordParams = {
    id: number;
  };

  type LoginLogEntity = {
    id: number;
    userId?: number | null;
    username?: string | null;
    email?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    success: boolean;
    failureCode?: string | null;
    failureReason?: string | null;
    createdAt: string;
  };

  type LoginLogsControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    username?: string;
    email?: string;
    ip?: string;
    success?: boolean;
    startTime?: string;
    endTime?: string;
  };

  type LoginLogsControllerFindOneParams = {
    id: number;
  };

  type ValidateTokenDto = {
    token: string;
    code: string;
    phone: string;
  };
}
