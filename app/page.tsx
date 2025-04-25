"use client";

import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import InstallGuide from "./components/InstallGuide";
import AMapTracker from "./components/AMapTracker";

// Helper function to format seconds into HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    remainingSeconds.toString().padStart(2, "0"),
  ].join(":");
}

// 格式化距离函数 - 同时返回米和公里两种单位，均保留两位小数
function formatDistance(meters: number): {
  valueM: string;
  valueKm: string;
} {
  return {
    valueM: meters.toFixed(2),
    valueKm: (meters / 1000).toFixed(2),
  };
}

export default function Home() {
  const {
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
    trackPoints,
  } = useGeolocation();

  // 添加地图显示状态
  const [showMap, setShowMap] = useState(false);

  // 格式化距离数据，同时获取米和公里形式
  const formattedDistance = formatDistance(totalDistance);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header - more compact */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-3 shadow-md">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sport Tracker</h1>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-3 space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
            <p className="font-medium">Error</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* 融合后的时间显示与开始/暂停按钮 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
          <div className="bg-indigo-50 p-2 border-b border-indigo-100">
            <h2 className="text-indigo-800 font-medium text-sm text-center">
              Time
            </h2>
          </div>
          <div className="p-6 text-center relative">
            <p className="text-3xl font-mono font-bold text-indigo-800">
              {formatTime(elapsedTime)}
            </p>

            {/* 开始/暂停按钮悬浮在时间上 */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full p-3 shadow-md hover:from-indigo-700 hover:to-blue-700 transition"
                  aria-label="Start tracking"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full p-3 shadow-md hover:from-red-700 hover:to-red-600 transition"
                  aria-label="Stop tracking"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 地图开关按钮 */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showMap
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 1.586l-4 4H2.586a1 1 0 00-.707 1.707l10.414 10.414a1 1 0 001.414 0l4.293-4.293a1 1 0 000-1.414l-3-3 3-3a1 1 0 00-.707-1.707h-5.586l-4-4zM8.293 6.293L15 13H5.414L12 6.414l-3.707-3.707z"
                clipRule="evenodd"
              />
            </svg>
            <span>{showMap ? "隐藏地图" : "显示地图"}</span>
          </button>
        </div>

        {/* 地图组件 (有条件渲染) */}
        {showMap && (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ height: "400px" }}
          >
            <div className="bg-indigo-50 p-2 border-b border-indigo-100">
              <h2 className="text-indigo-800 font-medium text-sm text-center">
                运动轨迹
              </h2>
            </div>
            <div className="h-full">
              <AMapTracker
                trackPoints={trackPoints}
                currentLocation={location}
                isTracking={isTracking}
              />
            </div>
          </div>
        )}

        {/* Distance and Speed Cards in Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* 改进的距离卡片，同时显示米和公里 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-50 p-2 border-b border-blue-100">
              <h2 className="text-blue-800 font-medium text-sm text-center">
                Distance
              </h2>
            </div>
            <div className="p-3 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-800">
                  {formattedDistance.valueM}
                </span>
                <span className="text-xs text-gray-500">m</span>

                <div className="mt-2 pt-1 border-t border-gray-100">
                  <span className="text-lg font-semibold text-blue-700">
                    {formattedDistance.valueKm}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Speed Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-50 p-2 border-b border-blue-100">
              <h2 className="text-blue-800 font-medium text-sm text-center">
                Speed
              </h2>
            </div>
            <div className="p-2 text-center">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-800">
                  {speedMps !== null ? speedMps.toFixed(2) : "--"}
                </span>
                <span className="text-xs text-gray-500">m/s</span>

                <div className="mt-1 pt-1 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-700">
                    {speedKmh !== null ? speedKmh.toFixed(2) : "--"}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Average Speed & Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average Speed Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-emerald-50 p-2 border-b border-emerald-100">
              <h2 className="text-emerald-800 font-medium text-sm text-center">
                Avg Speed
              </h2>
            </div>
            <div className="p-2 text-center">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-emerald-800">
                  {averageSpeedMps !== null ? averageSpeedMps.toFixed(2) : "--"}
                </span>
                <span className="text-xs text-gray-500">m/s</span>

                <div className="mt-1 pt-1 border-t border-gray-100">
                  <span className="text-sm font-medium text-emerald-700">
                    {averageSpeedKmh !== null
                      ? averageSpeedKmh.toFixed(2)
                      : "--"}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Accuracy Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-50 p-2 border-b border-purple-100">
              <h2 className="text-purple-800 font-medium text-sm text-center">
                Location
              </h2>
            </div>
            <div className="p-2 text-center">
              {location ? (
                <div className="grid grid-rows-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lat:</span>
                    <span className="font-mono">
                      {location.latitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lng:</span>
                    <span className="font-mono">
                      {location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Waiting...</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-2 text-center text-gray-500 text-xs border-t border-gray-200 bg-white">
        <p>Sport Tracker PWA</p>
      </footer>

      {/* 添加安装指南组件 */}
      <InstallGuide />
    </div>
  );
}
