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
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { message } from 'antd';
import 'ol/ol.css';
import { useIntl } from '@umijs/max';

interface MapPickerProps {
  value?: { latitude: number; longitude: number };
  locations?: { latitude: number; longitude: number }[];
  onChange?: (location: { latitude: number; longitude: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ value, locations = [], onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [markerLayer, setMarkerLayer] = useState<VectorLayer<VectorSource> | null>(null);
  const intl = useIntl();

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || map) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.8)',
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 2,
          }),
        }),
      }),
    });

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
        center: fromLonLat([-2.8, 8.04]),
        zoom: 12,
      }),
    });

    setMap(mapInstance);
    setMarkerLayer(vectorLayer);

    mapInstance.on('click', (evt) => {
      const coordinate = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      const location = {
        longitude: coordinate[0],
        latitude: coordinate[1],
      };
      onChange?.(location);
    });

    return () => {
      mapInstance.setTarget(undefined);
    };
  }, []);

  // 处理标记更新
  useEffect(() => {
    if (!markerLayer || !map) return;

    const source = markerLayer.getSource();
    if (!source) return;

    source.clear();

    if (value) {
      const coordinate = fromLonLat([value.longitude, value.latitude]);
      source.addFeature(
        new Feature({
          geometry: new Point(coordinate),
        }),
      );
      map.getView().setCenter(coordinate);
      map.getView().setZoom(14);
    }

    if (locations.length > 0) {
      locations.forEach((location) => {
        const coordinate = fromLonLat([location.longitude, location.latitude]);
        source.addFeature(
          new Feature({
            geometry: new Point(coordinate),
          }),
        );
      });

      if (!value && locations.length > 0) {
        const firstLocation = locations[0];
        const coordinate = fromLonLat([firstLocation.longitude, firstLocation.latitude]);
        map.getView().setCenter(coordinate);
      }
    }
  }, [value, locations, map, markerLayer]);

  // 获取当前位置
  const handleGetCurrentLocation = () => {
    if (!map || !markerLayer) return;

    if (!('geolocation' in navigator)) {
      message.error(
        intl.formatMessage({
          id: 'pages.resources.images.location.error',
          defaultMessage: '您的浏览器不支持地理位置功能',
        }),
      );
      return;
    }

    message.loading({
      content: intl.formatMessage({
        id: 'pages.resources.images.location.getting',
        defaultMessage: '正在获取位置...',
      }),
      key: 'getLocation',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        message.destroy('getLocation');
        const location = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        onChange?.(location);
        message.success(
          intl.formatMessage({
            id: 'pages.resources.images.location.success',
            defaultMessage: '位置获取成功',
          }),
        );
      },
      (error) => {
        message.destroy('getLocation');
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message.error(
              intl.formatMessage({
                id: 'pages.resources.images.location.error.denied',
                defaultMessage: '获取位置失败：您拒绝了位置访问权限',
              }),
            );
            break;
          case error.POSITION_UNAVAILABLE:
            message.error(
              intl.formatMessage({
                id: 'pages.resources.images.location.error.unavailable',
                defaultMessage: '获取位置失败：位置信息不可用',
              }),
            );
            break;
          case error.TIMEOUT:
            message.error(
              intl.formatMessage({
                id: 'pages.resources.images.location.error.timeout',
                defaultMessage: '获取位置失败：请求超时',
              }),
            );
            break;
          default:
            message.error(
              intl.formatMessage({
                id: 'pages.resources.images.location.error',
                defaultMessage: '获取位置失败：',
              }) + error.message,
            );
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
      <div style={{ marginTop: '10px' }}>
        <a onClick={handleGetCurrentLocation} style={{ cursor: 'pointer' }}>
          {intl.formatMessage({
            id: 'pages.resources.images.getCurrentLocation',
            defaultMessage: '获取当前位置',
          })}
        </a>
        {value && (
          <div style={{ marginTop: '5px' }}>
            <small>
              {intl.formatMessage(
                {
                  id: 'pages.resources.images.location.current',
                  defaultMessage: '当前位置: {latitude}, {longitude}',
                },
                {
                  latitude: value.latitude.toFixed(6),
                  longitude: value.longitude.toFixed(6),
                },
              )}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
