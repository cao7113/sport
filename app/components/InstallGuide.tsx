"use client";

import { useState, useEffect } from "react";
// Removed unused import: Image

// Add type declaration for Safari's standalone mode property
// This extends the Navigator interface to include the iOS Safari-specific property
interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

export default function InstallGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // 在组件挂载时检测是否为 standalone 模式
  useEffect(() => {
    // 检测 iOS 或 iPadOS 是否以 standalone 模式运行
    const isIOSStandalone =
      (window.navigator as SafariNavigator).standalone === true;

    // 检测其他平台的 standalone 模式
    const isOtherStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    setIsStandalone(isIOSStandalone || isOtherStandalone);
  }, []);

  // 显示 toast 提示
  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000); // 3秒后自动隐藏
  };

  return (
    <>
      {/* 安装按钮 - 根据是否为 standalone 模式显示不同图标和行为 */}
      <button
        onClick={isStandalone ? showToast : () => setIsOpen(true)}
        className="fixed bottom-16 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg z-10"
        aria-label={isStandalone ? "已安装提示" : "安装指南"}
      >
        {isStandalone ? (
          // 已安装模式下显示勾选图标
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          // 未安装模式下显示加号图标
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </button>

      {/* Standalone 模式下的 Toast 提示 */}
      {toastVisible && (
        <div className="fixed bottom-28 right-4 left-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded shadow-lg z-20 max-w-md mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                应用已安装到主屏幕！您正在使用独立应用模式。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 安装指南弹窗（只在非 standalone 模式显示） */}
      {!isStandalone && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  安装到 iPhone 主屏幕
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-gray-600">
                在 iPhone 上，您可以将 Sport Tracker
                添加到主屏幕，像原生应用一样使用：
              </p>

              <ol className="space-y-6">
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 text-indigo-800 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">在 Safari 浏览器中打开本应用</p>
                    <p className="text-sm text-gray-500">
                      此功能仅在 Safari 浏览器中有效，其他浏览器不支持
                    </p>
                    <div className="mt-2 bg-gray-100 rounded-lg p-2 flex justify-center">
                      <svg
                        className="w-16 h-16"
                        viewBox="0 0 24 24"
                        fill="#006CFF"
                      >
                        <path d="M12,21.8c-0.2,0-0.3,0-0.5-0.1c-1.9-1-10.5-6.2-10.5-14C1,3.1,5.1,1,7.8,1c1.6,0,3.1,0.5,4.2,1.6C13.1,1.5,14.6,1,16.2,1 C18.9,1,23,3.1,23,7.7c0,7.7-8.6,13-10.5,14C12.3,21.8,12.2,21.8,12,21.8z" />
                      </svg>
                    </div>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 text-indigo-800 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">点击分享按钮</p>
                    <p className="text-sm text-gray-500">
                      在 Safari 底部栏点击分享图标（方框加上箭头）
                    </p>
                    <div className="mt-2 bg-gray-100 rounded-lg p-2 flex justify-center">
                      <svg
                        className="w-16 h-16"
                        viewBox="0 0 24 24"
                        fill="#007AFF"
                      >
                        <path d="M16,2.012h-8c-3.3,0-6,2.7-6,6v8c0,3.3,2.7,6,6,6h8c3.3,0,6-2.7,6-6v-8C22,4.712,19.3,2.012,16,2.012z M16.5,11.012h-3.5v-3.5 c0-0.3-0.2-0.5-0.5-0.5s-0.5,0.2-0.5,0.5v3.5h-3.5c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5h3.5v3.5c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5 v-3.5h3.5c0.3,0,0.5-0.2,0.5-0.5S16.8,11.012,16.5,11.012z" />
                      </svg>
                    </div>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 text-indigo-800 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">选择&quot;添加到主屏幕&quot;</p>
                    <p className="text-sm text-gray-500">
                      在分享菜单中向下滑动，找到并点击&quot;添加到主屏幕&quot;选项
                    </p>
                    <div className="mt-2 bg-gray-100 rounded-lg p-2 flex justify-center">
                      <svg
                        className="w-16 h-16"
                        viewBox="0 0 24 24"
                        fill="#007AFF"
                      >
                        <path d="M12,1c-5.5,0-10,4.5-10,10v7.5c0,1.9,1.6,3.5,3.5,3.5h13c1.9,0,3.5-1.6,3.5-3.5V11C22,5.5,17.5,1,12,1z M16.8,16.2 c-0.2,0.2-0.5,0.3-0.7,0.3s-0.5-0.1-0.7-0.3L13,13.8V20c0,0.6-0.4,1-1,1s-1-0.4-1-1v-6.2l-2.4,2.4c-0.4,0.4-1,0.4-1.4,0 s-0.4-1,0-1.4l4-4c0.1-0.1,0.2-0.2,0.3-0.2c0.2-0.1,0.5-0.1,0.8,0c0.1,0.1,0.2,0.1,0.3,0.2l4,4C17.2,15.2,17.2,15.8,16.8,16.2z" />
                      </svg>
                    </div>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3 text-indigo-800 font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">确认添加</p>
                    <p className="text-sm text-gray-500">
                      确认应用名称（如需可以修改），然后点击右上角的&quot;添加&quot;
                    </p>
                    <div className="mt-2 bg-gray-100 rounded-lg p-2 flex justify-center">
                      <svg
                        className="w-16 h-16"
                        viewBox="0 0 24 24"
                        fill="#34C759"
                      >
                        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M17.3,8.6l-6.8,6.8c-0.2,0.2-0.5,0.3-0.7,0.3 s-0.5-0.1-0.7-0.3l-3.4-3.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l2.7,2.7l6.1-6.1c0.4-0.4,1-0.4,1.4,0S17.7,8.2,17.3,8.6z" />
                      </svg>
                    </div>
                  </div>
                </li>
              </ol>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">完成！</h3>
                <p className="text-sm text-blue-600">
                  现在您可以在主屏幕上找到 Sport Tracker
                  图标，点击它将以全屏独立应用模式打开，无浏览器界面，体验更接近原生应用！
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
