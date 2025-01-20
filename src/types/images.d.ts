declare namespace Images {
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
}
