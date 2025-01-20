import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { message } from 'antd';
import 'ol/ol.css';

interface MapPickerProps {
  value?: { latitude: number; longitude: number };
  locations?: { latitude: number; longitude: number }[];
  onChange?: (location: { latitude: number; longitude: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ value, locations = [], onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [markerLayer, setMarkerLayer] = useState<VectorLayer<VectorSource> | null>(null);

  // 更新所有标记的函数
  const updateMarkers = (
    vectorSource: VectorSource,
    points: { latitude: number; longitude: number }[],
  ) => {
    vectorSource.clear();
    points.forEach((point) => {
      const coordinate = fromLonLat([point.longitude, point.latitude]);
      vectorSource.addFeature(
        new Feature({
          geometry: new Point(coordinate),
        }),
      );
    });
  };

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || map) return;

    // 创建标记图层
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
        }),
      }),
    });

    // 创建地图实例
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attributions: '© CRBC',
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-2.8, 8.04]), // 默认邦杜库中心
        zoom: 12,
      }),
    });

    setMap(mapInstance);
    setMarkerLayer(vectorLayer);

    // 添加点击事件
    mapInstance.on('click', (evt) => {
      const coordinate = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      const location = {
        longitude: coordinate[0],
        latitude: coordinate[1],
      };
      onChange?.(location);
    });

    // 如果有初始值，添加标记
    if (value) {
      const coordinate = fromLonLat([value.longitude, value.latitude]);
      vectorSource.addFeature(
        new Feature({
          geometry: new Point(coordinate),
        }),
      );
      mapInstance.getView().setCenter(coordinate);
    }

    // 如果有位置列表，添加所有标记
    if (locations.length > 0) {
      updateMarkers(vectorSource, locations);
      // 将地图中心设置为第一个位置
      const firstLocation = locations[0];
      const coordinate = fromLonLat([firstLocation.longitude, firstLocation.latitude]);
      mapInstance.getView().setCenter(coordinate);
    }

    return () => {
      mapInstance.setTarget(undefined);
    };
  }, []);

  // 当locations变化时更新标记位置
  useEffect(() => {
    if (!map || !markerLayer) return;

    const vectorSource = markerLayer.getSource();
    if (!vectorSource) return;

    updateMarkers(vectorSource, locations);

    // 如果有位置，将地图缩放到包含所有标记的范围
    if (locations.length > 0) {
      const extent = vectorSource.getExtent();
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 15,
      });
    }
  }, [locations]);

  // 获取当前位置
  const handleGetCurrentLocation = () => {
    if (!map || !markerLayer) return;

    if (!('geolocation' in navigator)) {
      message.error('您的浏览器不支持地理位置功能');
      return;
    }

    message.loading('正在获取位置...', 0);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        message.destroy();
        const location = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        onChange?.(location);

        const coordinate = fromLonLat([location.longitude, location.latitude]);
        const vectorSource = markerLayer.getSource();
        if (!vectorSource) return;

        vectorSource.clear();
        vectorSource.addFeature(
          new Feature({
            geometry: new Point(coordinate),
          }),
        );
        map.getView().setCenter(coordinate);
        map.getView().setZoom(15);

        message.success('位置获取成功');
      },
      (error) => {
        message.destroy();
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message.error('获取位置失败：您拒绝了位置访问权限');
            break;
          case error.POSITION_UNAVAILABLE:
            message.error('获取位置失败：位置信息不可用');
            break;
          case error.TIMEOUT:
            message.error('获取位置失败：请求超时');
            break;
          default:
            message.error('获取位置失败：' + error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      <div style={{ marginTop: 8 }}>
        <a onClick={handleGetCurrentLocation} style={{ cursor: 'pointer' }}>
          获取当前位置
        </a>
      </div>
    </div>
  );
};

export default MapPicker;
