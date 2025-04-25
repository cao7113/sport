"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker 注册成功:", registration);
          })
          .catch((error) => {
            console.error("Service Worker 注册失败:", error);
          });
      });
    }
  }, []);

  return null; // 此组件不渲染任何内容
}
