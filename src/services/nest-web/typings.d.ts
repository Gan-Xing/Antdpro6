declare namespace NestWebAPI {
  type ApprovalActionDto = {
    comment?: string;
  };

  type ApprovalActionEntity = {
    id: number;
    requestId: number;
    actorId: number;
    action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'COMMENT';
    comment?: string;
    createdAt: string;
    actor?: ApprovalUserSummaryEntity;
  };

  type ApprovalRequestEntity = {
    id: number;
    title: string;
    description?: string;
    businessType: string;
    businessId?: string;
    payload?: Record<string, any>;
    applicantId: number;
    approverType: 'USER' | 'ROLE';
    approverUserId?: number;
    approverRoleCode?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    decidedAt?: string;
    applicant?: ApprovalUserSummaryEntity;
    approverUser?: ApprovalUserSummaryEntity;
    actions?: ApprovalActionEntity[];
  };

  type ApprovalRequestListEntity = {
    data: ApprovalRequestEntity[];
    pagination: ApprovalRequestPaginationEntity;
  };

  type ApprovalRequestPaginationEntity = {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  type ApprovalRequestsControllerApproveParams = {
    id: number;
  };

  type ApprovalRequestsControllerCancelParams = {
    id: number;
  };

  type ApprovalRequestsControllerCommentParams = {
    id: number;
  };

  type ApprovalRequestsControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    businessType?: string;
    applicantId?: number;
    approverRoleCode?: string;
    mine?: boolean;
    pendingForMe?: boolean;
    keyword?: string;
  };

  type ApprovalRequestsControllerFindOneParams = {
    id: number;
  };

  type ApprovalRequestsControllerRejectParams = {
    id: number;
  };

  type ApprovalUserSummaryEntity = {
    id: number;
    username?: string;
    email?: string;
  };

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

  type ChangePasswordDto = {
    currentPassword: string;
    newPassword: string;
  };

  type CreateApprovalRequestDto = {
    title: string;
    description?: string;
    businessType: string;
    businessId?: string;
    approverType: 'USER' | 'ROLE';
    approverUserId?: number;
    approverRoleCode?: string;
    payload?: Record<string, any>;
  };

  type CreateArticleDto = {
    title: string;
    description?: string;
    body: string;
    published?: boolean;
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

  type CreateDictTypeDto = {
    code: string;
    name: string;
    description?: string;
    enabled?: boolean;
    sort?: number;
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
    status?: 'active' | 'disabled' | 'resigned';
    avatar: string;
    gender: string;
    isAdmin: boolean;
    departmentId: number;
    roles: number[];
  };

  type DashboardHealthEntity = {
    status: string;
    service: string;
    timestamp: string;
  };

  type DashboardMetricsEntity = {
    users: number;
    roles: number;
    images: number;
    logs: number;
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

  type DictItemEntity = {
    id: number;
    dictTypeId: number;
    code: string;
    label: string;
    value: string;
    color?: string;
    description?: string;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
    dictType?: Record<string, any>;
  };

  type DictsControllerFindItemsByTypeCodeParams = {
    code: string;
  };

  type DictsControllerFindItemsParams = {
    dictTypeId?: number;
    typeCode?: string;
    keyword?: string;
    enabled?: boolean;
  };

  type DictsControllerFindTypeParams = {
    id: number;
  };

  type DictsControllerFindTypesParams = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    enabled?: boolean;
  };

  type DictsControllerRemoveItemParams = {
    id: number;
  };

  type DictsControllerRemoveTypeParams = {
    id: number;
  };

  type DictsControllerUpdateItemParams = {
    id: number;
  };

  type DictsControllerUpdateTypeParams = {
    id: number;
  };

  type DictTypeEntity = {
    id: number;
    code: string;
    name: string;
    description?: string;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
    items?: any[][];
  };

  type FileAssetEntity = {
    id: number;
    originalName: string;
    filename: string;
    storagePath: string;
    url: string;
    mimeType: string;
    size: number;
    extension?: string;
    category?: string;
    description?: string;
    uploaderId?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    uploader?: Record<string, any>;
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

  type LoginLogEntity = {
    id: number;
    userId?: number;
    username?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    success: boolean;
    failureCode?: string;
    failureReason?: string;
    createdAt: string;
  };

  type LoginLogListEntity = {
    data: LoginLogEntity[];
    pagination: LoginLogPaginationEntity;
  };

  type LoginLogPaginationEntity = {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
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

  type MessageEntity = {
    id: number;
    userId: number;
    title: string;
    content?: string;
    type: 'NOTIFICATION' | 'TODO';
    category: 'SYSTEM' | 'SECURITY' | 'APPROVAL' | 'TASK' | 'CUSTOM';
    link?: string;
    businessType?: string;
    businessId?: string;
    readAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    createdById?: number;
    createdAt: string;
    updatedAt: string;
  };

  type MessageListEntity = {
    data: MessageEntity[];
    pagination: MessagePaginationEntity;
  };

  type MessagePaginationEntity = {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  type MessagesControllerCancelTodoParams = {
    id: number;
  };

  type MessagesControllerCompleteTodoParams = {
    id: number;
  };

  type MessagesControllerFindAllParams = {
    current?: number;
    pageSize?: number;
    type?: 'NOTIFICATION' | 'TODO' | 'notification' | 'todo';
    category?:
      | 'SYSTEM'
      | 'SECURITY'
      | 'APPROVAL'
      | 'TASK'
      | 'CUSTOM'
      | 'system'
      | 'security'
      | 'approval'
      | 'task'
      | 'custom';
    state?: 'unread' | 'read' | 'pending' | 'done' | 'cancelled';
    keyword?: string;
    businessType?: string;
    businessId?: string;
    scope?: 'mine' | 'all';
  };

  type MessagesControllerMarkReadParams = {
    id: number;
  };

  type MessageUnreadCountEntity = {
    unreadNotifications: number;
    pendingTodos: number;
    total: number;
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

  type QueueStatusEntity = {
    name: string;
    status: 'ok' | 'error';
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    error?: string;
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

  type ResetPasswordDto = {
    password: string;
  };

  type RoleEntity = {
    id: number;
    code: string;
    name: string;
    description?: string;
    sort: number;
    enabled: boolean;
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

  type SystemConfigEntity = {
    id: number;
    key: string;
    name: string;
    value: string;
    valueType: string;
    group: string;
    description?: string;
    editable: boolean;
    enabled: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
  };

  type SystemDependencyHealthEntity = {
    status: 'ok' | 'error';
    latencyMs: number;
    error?: string;
  };

  type SystemLogControllerClearParams = {
    days: number;
  };

  type SystemLogControllerExportParams = {
    userId?: number;
    username?: string;
    requestUrl?: string;
    method?: string;
    status?: number;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number;
  };

  type SystemLogControllerFindAllParams = {
    userId?: number;
    username?: string;
    requestUrl?: string;
    method?: string;
    status?: number;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number;
  };

  type SystemLogControllerFindOneParams = {
    id: number;
  };

  type SystemLogDetailResponseDto = {
    id: number;
    username: string;
    country: string;
    city: string;
    isp: string;
    requestDescription: string;
    duration: number;
    success: boolean;
    createdAt: string;
    userId: number;
    requestUrl: string;
    method: string;
    status: number;
    ip: string;
    userAgent?: string;
    requestData?: Record<string, any>;
    errorMsg?: string;
  };

  type SystemLogListResponseDto = {
    total: number;
    data: SystemLogResponseDto[];
    page: number;
    pageSize: number;
  };

  type SystemLogResponseDto = {
    id: number;
    username: string;
    country: string;
    city: string;
    isp: string;
    requestDescription: string;
    duration: number;
    success: boolean;
    createdAt: string;
  };

  type SystemQueuesEntity = {
    status: 'ok' | 'error';
    queues: QueueStatusEntity[];
    totals: Record<string, any>;
  };

  type SystemStatusDependenciesEntity = {
    database: SystemDependencyHealthEntity;
    redis: SystemDependencyHealthEntity;
    rabbitmq: SystemDependencyHealthEntity;
    minio: SystemDependencyHealthEntity;
    queue: SystemDependencyHealthEntity;
  };

  type SystemStatusEntity = {
    status: 'ok' | 'error';
    checkedAt: string;
    dependencies: SystemStatusDependenciesEntity;
  };

  type SystemVersionEntity = {
    service: string;
    version: string;
    nodeVersion: string;
    env: string;
    commitSha: string;
    buildTime: string;
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

  type UpdateDictItemDto = {
    label?: string;
    value?: string;
    color?: string;
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

  type UpdateProfileDto = {
    username?: string;
    avatar?: string;
    gender?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };

  type UpdateRoleDto = {
    name?: string;
    description?: string;
    sort?: number;
    enabled?: boolean;
    /** 权限对象数组 */
    permissions?: number[];
  };

  type UpdateSystemConfigDto = {
    value: string;
  };

  type UpdateUserDto = {
    email?: string;
    password?: string;
    roles?: number[];
    status?: 'active' | 'disabled' | 'resigned';
    username?: string;
    avatar?: string;
    gender?: string;
    isAdmin?: boolean;
    departmentId?: number;
  };

  type UpdateUserStatusDto = {
    status: 'active' | 'disabled' | 'resigned';
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
    lastLoginAt?: string;
    lastLoginIp?: string;
    passwordUpdatedAt?: string;
    /** 角色对象数组 */
    roles?: UserRoleEntity[];
    /** 用户文章数组 */
    articles?: Record<string, any>[];
    /** 用户登录日志 */
    loginLogs?: LoginLogEntity[];
    phoneNumber: string;
    firstName: string;
    lastName: string;
    wechatId: string;
    miniWechatId: string;
  };

  type UserRoleEntity = {
    id: number;
    code: string;
    name: string;
    description?: string;
    sort: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    /** 权限对象数组 */
    permissions?: PermissionEntity[];
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

  type UsersControllerResetPasswordParams = {
    id: number;
  };

  type UsersControllerUpdateParams = {
    id: number;
  };

  type UsersControllerUpdateStatusParams = {
    id: number;
  };

  type ValidateTokenDto = {
    token: string;
    code: string;
    phone: string;
  };

  type WechatCodeDto = {
    /** WeChat mini-program temporary login code. */
    code: string;
  };
}
