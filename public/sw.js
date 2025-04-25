// Sport Tracker PWA Service Worker
// 处理缓存、离线访问和推送通知功能

// 定义缓存名称和要缓存的资源
const CACHE_NAME = "sport-tracker-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-384x384.png",
  "/icon-512x512.png",
];

// 安装 Service Worker 并缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("已打开缓存");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("预缓存资源失败:", err);
      })
  );
  // 确保新的 Service Worker 会立即激活
  self.skipWaiting();
});

// 激活服务工作线程并清理旧缓存
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除不在白名单中的缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 确保激活后立即控制所有客户端页面
  self.clients.claim();
});

// 处理网络请求，实现离线优先策略
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果在缓存中找到响应，则返回缓存的版本
      if (response) {
        return response;
      }

      // 否则发起网络请求
      return fetch(event.request)
        .then((response) => {
          // 检查我们是否收到了有效响应
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // 克隆响应（因为响应是流，只能使用一次）
          const responseToCache = response.clone();

          // 将响应添加到缓存中以备将来使用
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 如果网络请求失败，尝试返回离线页面
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});

// 处理推送通知
self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || "Sport Tracker 有新消息",
        icon: data.icon || "/icon-512x512.png",
        badge: "/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          url: data.url || "/",
        },
      };
      event.waitUntil(
        self.registration.showNotification(
          data.title || "Sport Tracker",
          options
        )
      );
    } catch (e) {
      console.error("推送通知解析错误:", e);
    }
  }
});

// 处理通知点击事件
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // 检查通知数据中是否有URL
  const urlToOpen = event.notification.data?.url || "/";

  // 打开或聚焦到应用的窗口
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // 检查是否已有打开的窗口并聚焦
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // 如果没有打开的窗口，则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
