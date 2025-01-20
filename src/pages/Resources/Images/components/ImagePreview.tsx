import React, { useState } from 'react';
import { Image } from 'antd';

interface ImagePreviewProps {
  photos: string[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ photos }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {photos.map((photo, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              cursor: 'pointer',
              width: 64,
              height: 64,
            }}
          >
            <Image
              src={photo}
              alt={`图片${index + 1}`}
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
                    setCurrentIndex(index);
                    setVisible(true);
                  }
                },
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            current: currentIndex,
          }}
        >
          {photos.map((photo, index) => (
            <Image key={index} src={photo} />
          ))}
        </Image.PreviewGroup>
      </div>
    </>
  );
};

export default ImagePreview;
