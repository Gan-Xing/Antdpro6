declare namespace PhotoLogs {
  type LocationType = {
    latitude: number;
    longitude: number;
  };

  type Entity = {
    /** ID */
    id: number;
    /** 描述信息 */
    description: string;
    /** 区域 */
    area: string;
    /** 图片URL列表 */
    photos: string[];
    /** 分类 */
    category: '安全' | '质量' | '进度';
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距（米） */
    offset?: number;
    /** 标签列表 */
    tags: string[];
    /** 位置信息 */
    location?: LocationType;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 创建者信息 */
    createdBy: {
      id: number;
      username: string;
      avatar: string;
    };
  };

  type CreateParams = {
    /** 描述信息 */
    description: string;
    /** 区域 */
    area: string;
    /** 图片URL列表 */
    photos: string[];
    /** 分类 */
    category?: '安全' | '质量' | '进度';
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距（米） */
    offset?: number;
    /** 标签列表 */
    tags?: string[];
    /** 位置信息 */
    location?: LocationType;
  };

  type UpdateParams = {
    /** ID */
    id: number;
    /** 描述信息 */
    description?: string;
    /** 区域 */
    area?: string;
    /** 图片URL列表 */
    photos?: string[];
    /** 分类 */
    category?: '安全' | '质量' | '进度';
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距（米） */
    offset?: number;
    /** 标签列表 */
    tags?: string[];
    /** 位置信息 */
    location?: LocationType;
  };

  type QueryParams = {
    /** 当前页码 */
    current?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 区域 */
    area?: string;
    /** 分类 */
    category?: '安全' | '质量' | '进度';
    /** 标签 */
    tags?: string[];
    /** 开始时间 */
    startDate?: string;
    /** 结束时间 */
    endDate?: string;
  };

  type QueryResult = {
    /** 总数 */
    total: number;
    /** 当前页数据 */
    list: Entity[];
  };
}
