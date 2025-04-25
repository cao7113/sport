"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface AMapTrackerProps {
  trackPoints: Location[];
  currentLocation: Location | null;
  isTracking: boolean;
}

// 使用 AMap 作为全局变量
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

export default function AMapTracker({
  trackPoints,
  currentLocation,
  isTracking,
}: AMapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // 防止多次初始化
    if (mapInstance) return;

    try {
      const initialCenter = currentLocation
        ? [currentLocation.longitude, currentLocation.latitude]
        : [116.397428, 39.90923]; // 默认北京中心

      // 初始化地图
      const map = new window.AMap.Map(mapRef.current, {
        zoom: 15,
        center: initialCenter,
        resizeEnable: true,
      });

      // 添加地图控件
      map.plugin(["AMap.ToolBar", "AMap.Scale"], () => {
        map.addControl(new window.AMap.ToolBar());
        map.addControl(new window.AMap.Scale());
      });

      setMapInstance(map);

      // 添加当前位置标记
      if (currentLocation) {
        const marker = new window.AMap.Marker({
          position: [currentLocation.longitude, currentLocation.latitude],
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            imageSize: new window.AMap.Size(25, 34),
            image:
              "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
          }),
          offset: new window.AMap.Pixel(-12, -34),
        });
        marker.setMap(map);
        markerRef.current = marker;
      }
    } catch (error) {
      console.error("初始化高德地图失败:", error);
    }

    return () => {
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
      }
    };
  }, [mapLoaded, currentLocation]);

  // 更新轨迹线
  useEffect(() => {
    if (!mapInstance || trackPoints.length < 2) return;

    try {
      // 将轨迹点格式转换为高德地图需要的格式
      const path = trackPoints.map((point) => [
        point.longitude,
        point.latitude,
      ]);

      // 如果已经有轨迹线，更新它
      if (polylineRef.current) {
        polylineRef.current.setPath(path);
      } else {
        // 否则创建新的轨迹线
        const polyline = new window.AMap.Polyline({
          path: path,
          isOutline: true,
          outlineColor: "#ffeeff",
          borderWeight: 1,
          strokeColor: "#3366FF",
          strokeOpacity: 1,
          strokeWeight: 6,
          strokeStyle: "solid",
          lineJoin: "round",
          lineCap: "round",
          zIndex: 50,
        });

        polyline.setMap(mapInstance);
        polylineRef.current = polyline;

        // 调整视图以显示整个轨迹
        mapInstance.setFitView([polyline]);
      }
    } catch (error) {
      console.error("更新轨迹失败:", error);
    }
  }, [trackPoints, mapInstance]);

  // 更新当前位置标记
  useEffect(() => {
    if (!mapInstance || !currentLocation) return;

    try {
      const position = [currentLocation.longitude, currentLocation.latitude];

      if (markerRef.current) {
        // 更新现有标记位置
        markerRef.current.setPosition(position);
      } else {
        // 创建新标记
        const marker = new window.AMap.Marker({
          position: position,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            imageSize: new window.AMap.Size(25, 34),
            image:
              "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
          }),
          offset: new window.AMap.Pixel(-12, -34),
        });
        marker.setMap(mapInstance);
        markerRef.current = marker;
      }

      // 如果正在跟踪，将地图中心设置为当前位置
      if (isTracking) {
        mapInstance.setCenter(position);
      }
    } catch (error) {
      console.error("更新位置标记失败:", error);
    }
  }, [currentLocation, mapInstance, isTracking]);

  return (
    <>
      {/* 引入高德地图SDK */}
      <Script
        src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY"
        onLoad={() => setMapLoaded(true)}
      />
      {/* 高德地图安全密钥配置 */}
      <Script id="amap-security-config" strategy="beforeInteractive">
        {`
          window._AMapSecurityConfig = {
            securityJsCode: 'YOUR_SECURITY_JS_CODE',
          }
        `}
      </Script>

      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }}
      />
    </>
  );
}
