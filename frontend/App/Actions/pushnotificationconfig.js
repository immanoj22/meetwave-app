import { useEffect } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { store } from '../Slices';
import { setForegroundnotifiication } from '../Slices/helper';
import { GetItem, SetItem } from './localstorage';
import { pushnotificationapi } from './hooks';
import {
  getChatInstanceId,
  isChatNotificationType,
  normalizeNotificationType,
} from '../Utilities/chatNavigation';

const DEFAULT_CHANNEL_ID = 'messages_v2';
const ANDROID_CHANNEL_IDS = [
  DEFAULT_CHANNEL_ID,
  'messages',
  'default',
  'fcm_fallback_notification_channel',
];
let hasRegisteredPressListeners = false;

const parseRecord = remoteMessage => {
  const rawRecord = remoteMessage?.data?.Records || remoteMessage?.data?.record;

  if (!rawRecord) {
    return null;
  }

  try {
    return JSON.parse(rawRecord);
  } catch (error) {
    return null;
  }
};

const getNotificationContent = remoteMessage => {
  const record = parseRecord(remoteMessage);

  return {
    title:
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'Connect',
    body:
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      remoteMessage?.data?.message ||
      '',
    image:
      Platform.OS === 'android'
        ? remoteMessage?.notification?.android?.imageUrl ||
          remoteMessage?.data?.image
        : remoteMessage?.data?.image,
    record,
  };
};

const shouldSuppressForegroundChatNotification = remoteMessage => {
  if (AppState.currentState !== 'active') {
    return false;
  }

  const activeChatInstanceId = GetItem('ActiveChatInstanceId');
  if (!activeChatInstanceId) {
    return false;
  }

  const record = parseRecord(remoteMessage);
  const type = normalizeNotificationType(record?.type);

  if (!isChatNotificationType(type)) {
    return false;
  }

  const incomingInstanceId = getChatInstanceId(record);
  if (!incomingInstanceId) {
    return false;
  }

  return String(incomingInstanceId) === String(activeChatInstanceId);
};

const getChatNotificationId = instanceId =>
  instanceId ? `chat-${String(instanceId)}` : null;

const getNotificationIdFromRemoteMessage = remoteMessage => {
  const record = parseRecord(remoteMessage);
  const type = normalizeNotificationType(record?.type);

  if (!isChatNotificationType(type)) {
    return null;
  }

  return getChatNotificationId(getChatInstanceId(record));
};

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return DEFAULT_CHANNEL_ID;
  }

  await Promise.all(
    ANDROID_CHANNEL_IDS.map(id =>
      notifee.createChannel({
        id,
        name: id === DEFAULT_CHANNEL_ID ? 'Messages' : 'Default',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      }),
    ),
  );

  return DEFAULT_CHANNEL_ID;
}

export async function clearNotificationBadges() {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
    return;
  }

  await notifee.setBadgeCount(0);
}

export async function incrementNotificationBadge() {
  if (Platform.OS === 'ios') {
    const currentBadgeCount = await notifee.getBadgeCount();
    PushNotificationIOS.setApplicationIconBadgeNumber(currentBadgeCount + 1);
    return;
  }

  const currentBadgeCount = await notifee.getBadgeCount();
  await notifee.setBadgeCount(currentBadgeCount + 1);
}

export async function showLocalNotification(remoteMessage) {
  const channelId = await ensureNotificationChannel();
  const content = getNotificationContent(remoteMessage);
  const notificationId = getNotificationIdFromRemoteMessage(remoteMessage);

  if (!content.title && !content.body) {
    return;
  }

  await notifee.displayNotification({
    ...(notificationId ? { id: notificationId } : {}),
    title: content.title,
    body: content.body,
    data: content.record
      ? { record: JSON.stringify(content.record) }
      : undefined,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      sound: 'default',
      pressAction: {
        id: 'default',
      },
      importance: AndroidImportance.HIGH,
    },
    ios: {
      // Notifee iOS local notifications need an explicit sound to play audio.
      // `foregroundPresentationOptions.sound` only controls presentation while foreground.
      sound: 'default',
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
}

export async function clearChatNotification(instanceId) {
  const notificationId = getChatNotificationId(instanceId);

  if (!notificationId) {
    return;
  }

  try {
    await notifee.cancelNotification(notificationId);
  } catch (error) {}

  try {
    await notifee.cancelDisplayedNotification(notificationId);
  } catch (error) {}

  // Fallback for already-delivered/system-rendered notifications when the chat
  // has been opened and the message is effectively viewed.
  try {
    await notifee.cancelAllDisplayedNotifications();
  } catch (error) {}
}

export async function syncFcmTokenToServer(token) {
  if (!token) {
    return;
  }

  SetItem('Fcmtoken', token);

  const userId = GetItem('UserId');
  if (!userId) {
    return;
  }

  const state = store.getState();
  const pushEnabled = state?.profile?.profile?.pushNotification;

  try {
    const result = await pushnotificationapi({
      userId,
      fcmtoken: token,
      pushNotification: pushEnabled === false ? 'false' : 'true',
    });
    if (result === false) {
      console.warn('syncFcmTokenToServer: pushnotificationapi failed');
    }
  } catch (error) {
    console.warn('syncFcmTokenToServer error:', error?.message);
  }
}

export async function requestPushPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      provisional: true,
    });

    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

export async function getFcmToken() {
  const hasPermission = await requestPushPermission();

  if (!hasPermission) {
    return null;
  }

  await messaging().registerDeviceForRemoteMessages();
  await ensureNotificationChannel();

  const token = await messaging().getToken();

  if (token) {
    SetItem('Fcmtoken', token);
  }

  return token;
}

export async function initializeNotifications() {
  const token = await getFcmToken();

  if (!token) {
    return null;
  }

  await syncFcmTokenToServer(token);

  return token;
}

export async function handleBackgroundMessage(remoteMessage) {
  await ensureNotificationChannel();

  if (!remoteMessage?.notification) {
    await showLocalNotification(remoteMessage);
  }

  await incrementNotificationBadge();
}

function registerNotificationPressListeners() {
  if (hasRegisteredPressListeners) {
    return;
  }

  hasRegisteredPressListeners = true;

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.PRESS) {
      return;
    }

    const record = detail?.notification?.data?.record;
    if (!record) {
      return;
    }

    try {
      store.dispatch(setForegroundnotifiication(JSON.parse(record)));
    } catch (error) {}
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type !== EventType.PRESS) {
      return;
    }

    const record = detail?.notification?.data?.record;
    if (!record) {
      return;
    }

    try {
      store.dispatch(setForegroundnotifiication(JSON.parse(record)));
    } catch (error) {}
  });
}

export function useNotification() {
  useEffect(() => {
    let unsubscribeOnMessage;
    let unsubscribeTokenRefresh;

    const setupNotifications = async () => {
      registerNotificationPressListeners();
      await initializeNotifications();
      await clearNotificationBadges();

      unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
        await syncFcmTokenToServer(token);
      });

      unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        if (shouldSuppressForegroundChatNotification(remoteMessage)) {
          return;
        }

        await showLocalNotification(remoteMessage);
        await incrementNotificationBadge();
      });
    };

    setupNotifications();

    return () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
      }

      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
      }
    };
  }, []);
}
