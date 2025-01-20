import React, { useState } from 'react';
import { Image } from 'antd';

interface ImagePreviewProps {
  photos: string[];
  thumbnails?: Images.Thumbnail[]; // 就是一个简单的数组
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ photos, thumbnails }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取指定尺寸的缩略图 URL
  const getThumbnailUrl = (size: string): string => {
    console.log('Looking for thumbnail:', {
      size,
      availableThumbnails: thumbnails?.map((t) => ({
        size: t.size,
        url: t.url,
      })),
    });
    const thumbnail = thumbnails?.find((t) => t.size === size);
    console.log('Found thumbnail:', thumbnail);
    const url = thumbnail?.url || photos[0];
    console.log('Using URL:', url);
    return url;
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            width: 64,
            height: 64,
          }}
        >
          <Image
            src={getThumbnailUrl('64x64')}
            alt="缩略图"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 4,
              transition: 'transform 0.2s',
            }}
            preview={{
              visible: false,
              onVisibleChange: (vis) => {
                if (vis) {
                  setCurrentIndex(0);
                  setVisible(true);
                }
              },
            }}
          />
        </div>
      </div>
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            current: currentIndex,
          }}
        >
          <Image
            src={getThumbnailUrl('500x500')}
            preview={{
              src: getThumbnailUrl('500x500'), // 点击放大时也先加载 500x500
            }}
          />
        </Image.PreviewGroup>
      </div>
    </>
  );
};

export default ImagePreview;
