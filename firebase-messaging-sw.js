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
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 📨 백그라운드 메시지 수신:', payload);
    
    try {
        // 현재 시간 생성
        const currentTime = formatDateTime();
        const iconPath = getIconPath();
        
        // 안전한 알림 제목과 내용 설정
        const notificationTitle = payload?.notification?.title || 
                                 payload?.data?.title || 
                                 'WMS 알림';
        
        let notificationBody = payload?.notification?.body || 
                              payload?.data?.body || 
                              '새로운 메시지가 도착했습니다.';
        
        // 작업상태 업데이트 알림인 경우 등록시간 추가
        if (notificationTitle.includes('작업 상태 업데이트') || 
            notificationTitle.includes('작업 완료') ||
            notificationTitle.includes('컨테이너진입') ||
            notificationTitle.includes('이미지 업로드') ||
            notificationTitle.includes('파일 업로드') ||
            (payload?.data?.type === 'status_update')) {
            notificationBody += `\n⏰ 등록시간: ${currentTime}`;
        }
        
        const notificationIcon = payload?.notification?.icon || 
                               payload?.data?.icon || 
                               iconPath;
        
        const notificationOptions = {
            body: notificationBody,
            icon: notificationIcon,
            badge: iconPath,
            data: {
                ...payload.data,
                timestamp: currentTime,
                receivedAt: Date.now(),
                originalTitle: notificationTitle,
                originalBody: payload?.notification?.body || payload?.data?.body
            },
            requireInteraction: true,
            tag: 'wms-notification-' + Date.now(),
            vibrate: [200, 100, 200, 100, 200],
            silent: false,
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

        console.log('🔔 알림 표시 시도:', {
            title: notificationTitle,
            body: notificationBody,
            icon: notificationIcon,
            timestamp: currentTime
        });
        
        // 알림 표시
        return self.registration.showNotification(notificationTitle, notificationOptions);
        
    } catch (error) {
        console.error('❌ 백그라운드 메시지 처리 오류:', error);
        
        // 오류 발생 시 기본 알림 표시
        const fallbackOptions = {
            body: '메시지를 받았지만 처리 중 오류가 발생했습니다.',
            icon: getIconPath(),
            requireInteraction: true,
            tag: 'error-notification'
        };
        
        return self.registration.showNotification('WMS 알림 오류', fallbackOptions);
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