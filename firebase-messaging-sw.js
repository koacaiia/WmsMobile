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

// 백그라운드 메시지 처리 개선
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    // 현재 시간 생성
    const currentTime = formatDateTime();
    
    // 알림 제목과 내용 설정
    const notificationTitle = payload.notification?.title || payload.data?.title || 'WMS 알림';
    let notificationBody = payload.notification?.body || payload.data?.body || '새로운 메시지가 도착했습니다.';
    
    // 작업상태 업데이트 알림인 경우 등록시간 추가
    if (notificationTitle.includes('작업 상태 업데이트') || 
        notificationTitle.includes('작업 완료') ||
        notificationTitle.includes('컨테이너진입') ||
        payload.data?.type === 'status_update') {
        notificationBody += `\n등록시간: ${currentTime}`;
    }
    
    const notificationIcon = payload.notification?.icon || payload.data?.icon || '/WmsMobile/images/icon.png';
    
    const notificationOptions = {
        body: notificationBody,
        icon: notificationIcon,
        badge: '/WmsMobile/images/icon.png',
        data: {
            ...payload.data,
            timestamp: currentTime,
            receivedAt: Date.now()
        },
        requireInteraction: true,
        tag: 'wms-notification',
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: '열기'
            },
            {
                action: 'close',
                title: '닫기'
            }
        ]
    };

    console.log('Showing notification with timestamp:', notificationTitle, notificationOptions);
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        // 메인 앱 열기
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // 이미 열린 탭이 있으면 포커스
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('/WmsMobile/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // 새 탭 열기
                if (clients.openWindow) {
                    return clients.openWindow('/WmsMobile/');
                }
            })
        );
    }
});

// 알림 닫기 이벤트 처리
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

// 수동 알림 테스트 함수
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TEST_NOTIFICATION') {
        console.log('Manual notification test requested');
        
        const currentTime = formatDateTime();
        
        const notificationOptions = {
            body: `테스트 알림입니다.\n등록시간: ${currentTime}`,
            icon: '/WmsMobile/images/icon.png',
            badge: '/WmsMobile/images/icon.png',
            requireInteraction: true,
            tag: 'test-notification',
            vibrate: [200, 100, 200],
            data: {
                timestamp: currentTime,
                type: 'test'
            }
        };
        
        self.registration.showNotification('테스트 알림', notificationOptions);
    }
});