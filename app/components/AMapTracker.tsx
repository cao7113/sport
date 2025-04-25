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

// Define types for AMap to avoid using any
interface AMapType {
  Map: new (
    container: HTMLDivElement,
    options: Record<string, unknown>
  ) => AMapInstance;
  Marker: new (options: Record<string, unknown>) => AMapMarker;
  Polyline: new (options: Record<string, unknown>) => AMapPolyline;
  Icon: new (options: Record<string, unknown>) => unknown;
  Size: new (width: number, height: number) => unknown;
  Pixel: new (x: number, y: number) => unknown;
  ToolBar: new () => unknown;
  Scale: new () => unknown;
}

interface AMapInstance {
  plugin: (plugins: string[], callback: () => void) => void;
  addControl: (control: unknown) => void;
  setCenter: (position: [number, number]) => void;
  setFitView: (overlays: unknown[]) => void;
  destroy: () => void;
}

interface AMapMarker {
  setPosition: (position: [number, number]) => void;
  setMap: (map: AMapInstance | null) => void;
}

interface AMapPolyline {
  setPath: (path: [number, number][]) => void;
  setMap: (map: AMapInstance | null) => void;
}

// 使用 AMap 作为全局变量
declare global {
  interface Window {
    AMap: AMapType;
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
  const [mapInstance, setMapInstance] = useState<AMapInstance | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const polylineRef = useRef<AMapPolyline | null>(null);
  const markerRef = useRef<AMapMarker | null>(null);
  // Create a ref to hold the map instance for cleanup
  const mapInstanceRef = useRef<AMapInstance | null>(null);

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // 防止多次初始化
    if (mapInstance) return;

    let map: AMapInstance | null = null;

    try {
      const initialCenter = currentLocation
        ? [currentLocation.longitude, currentLocation.latitude]
        : [116.397428, 39.90923]; // 默认北京中心

      // 初始化地图
      map = new window.AMap.Map(mapRef.current, {
        zoom: 15,
        center: initialCenter,
        resizeEnable: true,
      });

      // 添加地图控件
      map.plugin(["AMap.ToolBar", "AMap.Scale"], () => {
        if (map) {
          map.addControl(new window.AMap.ToolBar());
          map.addControl(new window.AMap.Scale());
        }
      });

      // Store in ref for cleanup
      mapInstanceRef.current = map;
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

    // Fix the cleanup function by using the ref
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        setMapInstance(null);
      }
    };
  }, [mapLoaded, currentLocation, mapInstance]);

  // 更新轨迹线
  useEffect(() => {
    if (!mapInstance || trackPoints.length < 2) return;

    try {
      // 将轨迹点格式转换为高德地图需要的格式
      const path = trackPoints.map((point) => [
        point.longitude,
        point.latitude,
      ]) as [number, number][];

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
      const position: [number, number] = [
        currentLocation.longitude,
        currentLocation.latitude,
      ];

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
  }, [currentLocation, isTracking, mapInstance]);

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
