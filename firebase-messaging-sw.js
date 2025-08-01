importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDLzmZyt5nZwCk98iZ6wi01y7Jxio1ppZQ",
    authDomain: "fine-bondedwarehouse.firebaseapp.com",
    databaseURL: "https://fine-bondedwarehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fine-bondedwarehouse",
    storageBucket: "fine-bondedwarehouse.appspot.com",
    messagingSenderId: "415417723331",
    appId: "1:415417723331:web:15212f190062886281b576",
    measurementId: "G-SWBR4359JQ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 시간 포맷팅 함수
function formatDateTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 올바른 아이콘 경로 결정 함수
function getIconPath() {
    // 로컬 개발환경과 GitHub Pages 구분
    if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
        return './images/icon.png';  // 로컬 개발환경
    } else {
        return '/WmsMobile/images/icon.png';  // GitHub Pages
    }
}

// 백그라운드 메시지 처리
// firebase-messaging-sw.js에 추가할 코드
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);
  
  // fine2 토픽 감지
  const fromTopic = payload.from || '';
  const isFine2 = (
    fromTopic.includes('fine2') ||
    fromTopic.includes('/topics/fine2') ||
    payload.data?.topic === 'fine2'
  );
  
  if (isFine2) {
    console.log('[SW] fine2 토픽 백그라운드 메시지 감지');
    
    const notificationTitle = payload.notification?.title || 'fine2 알림';
    const notificationBody = payload.notification?.body || '메시지 내용';
    
    // 백그라운드에서 알림 표시
    self.registration.showNotification(`[fine2 백그라운드] ${notificationTitle}`, {
      body: `📢 토픽: ${notificationBody}`,
      icon: '/WmsMobile/images/icon.png',
    //   badge: '/WmsMobile/images/icon.png',
      tag: 'fine2-background',
      requireInteraction: true,
      data: {
        topic: 'fine2',
        timestamp: new Date().toISOString()
      }
    });
  }
});
// 알림 클릭 이벤트 처리
// firebase-messaging-sw.js에 추가해야 할 코드
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'BACKGROUND_MESSAGE') {
    const payload = event.data.payload;
    
    // fine2 토픽 백그라운드 메시지 처리
    if (payload.data?.topic === 'fine2' || payload.from?.includes('fine2')) {
      self.registration.showNotification(`[fine2] ${payload.notification.title}`, {
        body: payload.notification.body,
        icon: '/WmsMobile/images/icon.png',
        badge: '/WmsMobile/images/icon.png',
        tag: 'fine2-background',
        requireInteraction: true,
        actions: [
          { action: 'view', title: '확인' },
          { action: 'close', title: '닫기' }
        ]
      });
    }
  }
});
// 알림 닫기 이벤트 처리
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] 🔕 알림 닫힘:', event?.notification?.data);
});

// 수동 테스트를 위한 메시지 처리
self.addEventListener('message', (event) => {
    console.log('[firebase-messaging-sw.js] 📩 메시지 수신:', event.data);
    
    const iconPath = getIconPath();
    
    if (event.data?.type === 'TEST_NOTIFICATION') {
        console.log('🧪 수동 알림 테스트 요청');
        
        const currentTime = formatDateTime();
        
        const notificationOptions = {
            body: `Service Worker 테스트 알림입니다.\n⏰ 등록시간: ${currentTime}`,
            icon: iconPath,
            badge: iconPath,
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
                console.log('✅ 테스트 알림 표시 완료');
            })
            .catch((error) => {
                console.error('❌ 테스트 알림 표시 실패:', error);
            });
    }
    
    if (event.data?.type === 'FORCE_NOTIFICATION') {
        console.log('🚨 강제 알림 테스트');
        
        const currentTime = formatDateTime();
        
        self.registration.showNotification('🚨 강제 테스트 알림', {
            body: `Service Worker 강제 알림 테스트\n⏰ ${currentTime}`,
            icon: iconPath,
            badge: iconPath,
            requireInteraction: true,
            tag: 'force-test-' + Date.now(),
            vibrate: [300, 200, 300, 200, 300],
            data: {
                timestamp: currentTime,
                type: 'force_test'
            }
        }).then(() => {
            console.log('✅ 강제 알림 표시 완료');
        }).catch((error) => {
            console.error('❌ 강제 알림 실패:', error);
        });
    }
    
    // 즉시 알림 테스트
    if (event.data?.type === 'IMMEDIATE_TEST') {
        console.log('⚡ 즉시 알림 테스트');
        
        self.registration.showNotification('⚡ 즉시 테스트', {
            body: '즉시 표시되는 테스트 알림입니다.',
            icon: iconPath,
            requireInteraction: false,
            tag: 'immediate-test'
        });
    }
});

// Service Worker 라이프사이클 이벤트
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] 🔧 Service Worker 설치 중...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] ✅ Service Worker 활성화됨');
    event.waitUntil(clients.claim());
    
    console.log('🔔 Service Worker 활성화 완료 - 테스트 알림 준비됨');
    console.log('📍 현재 위치:', self.location.hostname);
    console.log('🖼️ 아이콘 경로:', getIconPath());
});

// 전역 오류 처리
self.addEventListener('error', (event) => {
    console.error('[firebase-messaging-sw.js] ❌ Service Worker 오류:', event);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[firebase-messaging-sw.js] ❌ 처리되지 않은 Promise 거부:', event);
});

// 서비스 워커 시작 로그
console.log('[firebase-messaging-sw.js] 🚀 Firebase Messaging Service Worker 시작됨');
console.log('📍 실행 환경:', self.location.hostname);
console.log('🖼️ 사용할 아이콘 경로:', getIconPath());