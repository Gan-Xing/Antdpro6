declare namespace Images {
  type Category = 'progress' | 'safety' | 'quality';

  type LocationType = {
    latitude: number;
    longitude: number;
  };

  type Thumbnail = {
    size: string;
    path: string;
    url?: string;
  };

  type Entity = {
    /** ID */
    id: number;
    /** 描述信息 */
    description?: string;
    /** 区域 */
    area?: string;
    /** 图片URL列表 */
    photos: string[];
    /** 缩略图列表 */
    thumbnails?: Thumbnail[];
    /** 分类 */
    category?: Category;
    /** 桩号 */
    stakeNumber?: string;
    /** 偏距（米） */
    offset?: number | string;
    /** 标签列表 */
    tags?: string[];
    /** 位置信息 */
    location?: LocationType | string;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 创建者ID */
    createdById: number;
    /** 创建者信息 */
    createdBy: {
      id: number;
      username: string;
      avatar?: string;
    };
  };

  type CreateParams = Omit<NestWebAPI.CreateImageDto, 'location' | 'offset'> & {
    location?: LocationType;
    offset?: number | string;
  };

  type UpdateParams = Omit<NestWebAPI.UpdateImageDto, 'location' | 'offset'> & {
    id: number;
    location?: LocationType | string;
    offset?: number | string;
  };
}
