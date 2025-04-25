"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface GeolocationHook {
  location: Location | null;
  speedMps: number | null; // in meters per second
  speedKmh: number | null; // in kilometers per hour
  totalDistance: number; // in meters
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  error: string | null;
  elapsedTime: number; // in seconds
  averageSpeedMps: number | null; // in meters per second
  averageSpeedKmh: number | null; // in kilometers per hour
  trackPoints: Location[]; // 轨迹点数组
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<Location | null>(null);
  const [speedMps, setSpeedMps] = useState<number | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [averageSpeedMps, setAverageSpeedMps] = useState<number | null>(null);
  const [averageSpeedKmh, setAverageSpeedKmh] = useState<number | null>(null);

  // 添加静止检测相关状态
  const [isMoving, setIsMoving] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const locationsRef = useRef<Location[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 添加最近位置缓存，用于平滑计算，减少点数以适应室内
  const lastLocationsRef = useRef<Location[]>([]);

  // 位置平滑处理函数，返回平均位置，减少平滑强度
  const smoothPosition = (newLocation: Location): Location => {
    // 降低为最近3个位置记录用于平滑处理，室内环境更适用
    const MAX_SMOOTH_POINTS = 3;
    lastLocationsRef.current.push(newLocation);

    // 只保留最近的几个点
    if (lastLocationsRef.current.length > MAX_SMOOTH_POINTS) {
      lastLocationsRef.current.shift();
    }

    // 如果数据点太少，不做平滑处理
    if (lastLocationsRef.current.length <= 1) {
      return newLocation;
    }

    // 计算平均位置
    const sumLat = lastLocationsRef.current.reduce(
      (sum, loc) => sum + loc.latitude,
      0
    );
    const sumLng = lastLocationsRef.current.reduce(
      (sum, loc) => sum + loc.longitude,
      0
    );
    const count = lastLocationsRef.current.length;

    return {
      latitude: sumLat / count,
      longitude: sumLng / count,
      timestamp: newLocation.timestamp, // 保留最新的时间戳
    };
  };

  // Process new location data
  const processLocation = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const timestamp = position.timestamp;
    const rawLocation: Location = { latitude, longitude, timestamp };

    // 应用平滑处理，但减少平滑强度
    const smoothedLocation = smoothPosition(rawLocation);

    setLocation(smoothedLocation);

    // 计算当前速度
    if (position.coords.speed !== null && position.coords.speed !== undefined) {
      // 使用设备提供的速度
      const mps = position.coords.speed;
      // 降低速度阈值，使室内走动也能被检测到
      if (mps > 0.05) {
        // 0.05 m/s 约等于 0.18 km/h
        setSpeedMps(mps);
        setSpeedKmh(mps * 3.6);
        setIsMoving(true);
      } else {
        // 即使速度很低也显示实际值，而不是直接设为0
        setSpeedMps(mps);
        setSpeedKmh(mps * 3.6);
        // 只有完全静止才设置为不移动
        setIsMoving(mps > 0);
      }
    } else if (locationsRef.current.length > 0) {
      // 自行计算速度
      const prevLocation =
        locationsRef.current[locationsRef.current.length - 1];
      const timeDiff = (timestamp - prevLocation.timestamp) / 1000;

      if (timeDiff > 0) {
        const distance = calculateDistance(
          prevLocation.latitude,
          prevLocation.longitude,
          smoothedLocation.latitude,
          smoothedLocation.longitude
        );

        const mps = distance / timeDiff;
        // 降低速度阈值检测
        if (mps > 0.05) {
          setSpeedMps(mps);
          setSpeedKmh(mps * 3.6);
          setIsMoving(true);
        } else {
          setSpeedMps(mps);
          setSpeedKmh(mps * 3.6);
          // 只有完全静止才设置为不移动
          setIsMoving(mps > 0);
        }
      }
    }

    // 计算距离并添加到总距离中
    if (locationsRef.current.length > 0) {
      const prevLocation =
        locationsRef.current[locationsRef.current.length - 1];
      const distance = calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        smoothedLocation.latitude,
        smoothedLocation.longitude
      );

      // 调整距离过滤条件，更适合室内环境
      // 1. 降低最小阈值（0.2米，允许小幅移动）
      // 2. 保留最大阈值（100米，过滤GPS跳变）
      // 3. 室内环境可能移动缓慢，放宽移动判定标准
      const minThreshold = 0.2; // 0.2米，更适合检测室内小幅移动
      const maxThreshold = 100; // 100米

      // 放宽添加距离的条件，不再强制要求isMoving为true
      if (distance > minThreshold && distance < maxThreshold) {
        setTotalDistance((prev) => prev + distance);
      }
    }

    locationsRef.current.push(smoothedLocation);
  }, []);

  // Update timer and average speed every second when tracking is active
  useEffect(() => {
    if (isTracking && startTimeRef.current !== null) {
      timerIntervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor(
          (currentTime - startTimeRef.current!) / 1000
        );
        setElapsedTime(elapsed);

        // Calculate average speed in m/s and km/h
        if (elapsed > 0) {
          const avgMps = totalDistance / elapsed;
          setAverageSpeedMps(avgMps);
          setAverageSpeedKmh(avgMps * 3.6); // Convert to km/h
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isTracking, totalDistance]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // 重置所有数据
    setTotalDistance(0);
    locationsRef.current = [];
    lastLocationsRef.current = []; // 重置平滑位置缓存
    setError(null);
    setElapsedTime(0);
    setAverageSpeedMps(null);
    setAverageSpeedKmh(null);
    setSpeedMps(null);
    setSpeedKmh(null);
    setIsMoving(false);
    startTimeRef.current = Date.now();

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        processLocation,
        (err) => {
          setError(`Error accessing location: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );

      setIsTracking(true);
    } catch (err) {
      setError(
        `Failed to start tracking: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, [processLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);

      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    location,
    speedMps,
    speedKmh,
    totalDistance,
    isTracking,
    startTracking,
    stopTracking,
    error,
    elapsedTime,
    averageSpeedMps,
    averageSpeedKmh,
    trackPoints: locationsRef.current, // 暴露轨迹点数组
  };
}
