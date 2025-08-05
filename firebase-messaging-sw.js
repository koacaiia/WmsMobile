importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js');

// Firebase 설정 (main.js와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyDLzmZyt5nZwCk98iZ6wi01y7Jxio1ppZQ",
  authDomain: "fine-bondedwarehouse.firebaseapp.com",
  databaseURL: "https://fine-bondedwarehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fine-bondedwarehouse",
  storageBucket: "fine-bondedwarehouse.appspot.com",
  messagingSenderId: "415417723331",
  appId: "1:415417723331:web:15212f190062886281b576"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 아이콘 경로 결정 함수
function getIconPath() {
  // 로컬 개발환경과 GitHub Pages 구분
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return './images/icon.png';  // 로컬 개발환경
  } else {
    return '/WmsMobile/images/icon.png';  // GitHub Pages
  }
}

// 시간 포맷 함수
function formatDateTime() {
  const now = new Date();
  return now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.notification?.title || 'WMS 알림';
  const notificationOptions = {
    body: payload.notification?.body || '메시지 내용',
    icon: getIconPath(),
    tag: 'wms-notification',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: '📱 열기'
      },
      {
        action: 'close',
        title: '❌ 닫기'
      }
    ]
  };

  // fine2 토픽 메시지 감지
  const fromTopic = payload.from || '';
  const isFine2 = (
    fromTopic.includes('fine2') ||
    fromTopic.includes('/topics/fine2') ||
    payload.data?.topic === 'fine2'
  );
  
  if (isFine2) {
    console.log('[SW] fine2 토픽 백그라운드 메시지 감지');
    notificationOptions.body = `[fine2] ${notificationOptions.body}`;
    notificationOptions.tag = 'fine2-notification';
    notificationOptions.badge = getIconPath();
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 알림 클릭됨:', event.notification);
  
  event.notification.close();
  
  const action = event.action;
  
  if (action === 'view' || !action) {
    // 앱 열기
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // 이미 열린 창이 있으면 포커스
          for (const client of clientList) {
            if (client.url.includes('WmsMobile') && 'focus' in client) {
              return client.focus();
            }
          }
          // 새 창 열기
          if (clients.openWindow) {
            const url = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1'
              ? 'http://127.0.0.1:5500/WmsMobile/'
              : 'https://koacaiia.github.io/WmsMobile/';
            return clients.openWindow(url);
          }
        })
    );
  }
  // close 액션은 기본적으로 알림만 닫힘
});

// 알림 닫기 이벤트 처리
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 알림 닫힘:', event?.notification?.data);
});

// Service Worker 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker 설치 중...');
  event.waitUntil(self.skipWaiting());
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker 활성화됨');
  event.waitUntil(clients.claim());
});

// 전역 오류 처리
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker 오류:', event.error);
});

// 처리되지 않은 Promise 오류 처리
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] 처리되지 않은 Promise 거부:', event.reason);
  event.preventDefault();
});

// 수동 테스트를 위한 메시지 처리
self.addEventListener('message', (event) => {
  console.log('[SW] 메시지 수신:', event.data);
  
  if (event.data?.type === 'TEST_NOTIFICATION') {
    console.log('[SW] 테스트 알림 요청');
    
    const currentTime = formatDateTime();
    
    const notificationOptions = {
      body: `Service Worker 테스트 알림입니다.\n⏰ 등록시간: ${currentTime}`,
      icon: getIconPath(),
      requireInteraction: true,
      tag: 'test-notification-' + Date.now(),
      vibrate: [200, 100, 200],
      data: {
        timestamp: currentTime,
        type: 'test',
        testId: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: '📱 열기'
        },
        {
          action: 'close',
          title: '❌ 닫기'
        }
      ]
    };
    
    self.registration.showNotification('🧪 SW 테스트 알림', notificationOptions)
      .then(() => {
        console.log('[SW] 테스트 알림 표시 완료');
      })
      .catch((error) => {
        console.error('[SW] 테스트 알림 표시 실패:', error);
      });
  }
  
  if (event.data?.type === 'FORCE_NOTIFICATION') {
    console.log('[SW] 강제 알림 테스트');
    
    const currentTime = formatDateTime();
    
    self.registration.showNotification('🚨 강제 테스트 알림', {
      body: `Service Worker 강제 알림 테스트\n⏰ ${currentTime}`,
      icon: getIconPath(),
      requireInteraction: true,
      tag: 'force-test-' + Date.now(),
      vibrate: [300, 200, 300, 200, 300],
      data: {
        timestamp: currentTime,
        type: 'force_test'
      }
    }).then(() => {
      console.log('[SW] 강제 알림 표시 완료');
    }).catch((error) => {
      console.error('[SW] 강제 알림 실패:', error);
    });
  }
});

console.log('[SW] firebase-messaging-sw.js 로드 완료');