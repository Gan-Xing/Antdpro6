import React, { useState, useEffect } from 'react';
import { Image } from 'antd';

interface ImagePreviewProps {
  photos: string[];
  thumbnails?: Images.Thumbnail[]; // 就是一个简单的数组
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ photos, thumbnails }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 64, height: 48 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) {
        // xs: 2列显示
        setContainerSize({ width: 200, height: 150 });
      } else if (width < 768) {
        // sm: 3列显示
        setContainerSize({ width: 160, height: 120 });
      } else if (width < 992) {
        // md: 4列显示
        setContainerSize({ width: 120, height: 90 });
      } else {
        // lg: 全部显示
        setContainerSize({ width: 100, height: 75 });
      }
    };

    // 初始检查
    handleResize();

    // 监听变化
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 获取指定尺寸的缩略图 URL
  const getThumbnailUrl = (size: string): string => {
    // console.log('Looking for thumbnail:', {
    //   size,
    //   availableThumbnails: thumbnails?.map((t) => ({
    //     size: t.size,
    //     url: t.url,
    //   })),
    // });
    const thumbnail = thumbnails?.find((t) => t.size === size);
    // console.log('Found thumbnail:', thumbnail);
    const url = thumbnail?.url || photos[0];
    // console.log('Using URL:', url);
    return url;
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            width: containerSize.width,
            height: containerSize.height,
          }}
        >
          <Image
            src={getThumbnailUrl('500x500')}
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
