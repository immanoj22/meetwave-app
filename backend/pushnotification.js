// <---------------------------------------------Push Notification-------------------------------------------->
const { JWT } = require('google-auth-library');
const axios = require('axios');
const fs = require("fs")
import config from "./Config/config"
import { isEmpty } from "./Helper/common";
const SERVICE_ACCOUNT_FILE = './firebase-credentials.json'
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE))

const SCOPE = ['https://www.googleapis.com/auth/firebase.messaging']
const FCM_DATA_MAX_BYTES = 3800;

const client = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPE
});

export const isPushNotificationEnabled = (value) =>
  value === true || value === 'true' || value === 1 || value === '1';

export const normalizeFcmTokens = (tokens) => {
  if (!tokens) {
    return [];
  }
  const list = Array.isArray(tokens) ? tokens : [tokens];
  return [...new Set(
    list
      .filter((token) => typeof token === 'string' && token.trim().length > 0)
      .map((token) => token.trim())
  )];
};

const serializeExtraData = (extraData = {}) => {
  try {
    const lean = JSON.parse(JSON.stringify(extraData, (_key, value) => {
      if (value && typeof value === 'object') {
        if (value._bsontype === 'ObjectID' || value._bsontype === 'ObjectId') {
          return String(value);
        }
        if (typeof value.toString === 'function' && value.constructor?.name === 'ObjectId') {
          return String(value);
        }
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));

    let serialized = JSON.stringify(lean);
    if (serialized.length > FCM_DATA_MAX_BYTES) {
      const { members, groupCreater, ...compact } = lean;
      serialized = JSON.stringify(compact);
    }
    if (serialized.length > FCM_DATA_MAX_BYTES) {
      serialized = JSON.stringify({
        type: lean?.type || 'notification',
        _id: lean?._id ? String(lean._id) : '',
      });
    }
    return serialized;
  } catch (error) {
    console.error('serializeExtraData failed:', error?.message);
    return JSON.stringify({ type: extraData?.type || 'notification' });
  }
};

const getBodyText = (content, fileUrls = []) => {
  const safeContent = typeof content === 'string' ? content : '';

  if (!fileUrls?.length) {
    return safeContent;
  }

  const fileTypes = fileUrls.map((fileUrl) => getFileType(fileUrl));
  const isImage = fileTypes.some((t) =>
    ['image', 'heic', 'heif', 'HEIC', 'HEIF'].includes(t)
  );
  const isAudio = fileTypes.includes('audio');
  const isFile = fileTypes.includes('file');
  const isVideo = fileTypes.includes('video');

  let fileText = '';
  if (isAudio) {
    fileText = 'Audio is attached';
  } else if (isFile) {
    fileText = 'File is attached';
  } else if (isImage) {
    fileText = 'Image posted';
  } else if (isVideo) {
    fileText = fileUrls?.length == 1 ? '1 video is attached' : `${fileUrls?.length} videos are attached`;
  } else {
    fileText = `${fileUrls.length} files are attached`;
  }

  return safeContent ? `${safeContent} ${fileText}` : fileText;
};

export const sendPushNotification = async (data) => {
  try {
    const { type, tokens, title, content, fileUrls = [], extraData = {}, userId } = data;
    const tokenList = normalizeFcmTokens(tokens);
    const notificationTitle = typeof title === 'string' ? title.trim() : '';

    if (!tokenList.length || isEmpty(notificationTitle)) {
      console.log('sendPushNotification skipped:', {
        type,
        reason: !tokenList.length ? 'no_tokens' : 'no_title',
        tokenCount: tokenList.length,
      });
      return;
    }

    const Access_tokens = await getAccessToken();
    const Datas = serializeExtraData({ ...extraData, type: extraData?.type || type });
    const bodyText = getBodyText(content, fileUrls || []) || notificationTitle;
    const Files = fileUrls?.map((img) => `${config.CDN_URL}${img}`);
    const imageUrl = fileUrls?.length > 0 ? Files[0] : undefined;
    const tag = userId ? String(userId) : undefined;

    await Promise.all(tokenList.map(async (valueToken) => {
      const message = {
        message: {
          notification: {
            title: notificationTitle,
            body: bodyText,
            ...(imageUrl ? { image: imageUrl } : {}),
          },
          android: {
            priority: 'HIGH',
            notification: {
              channel_id: 'messages_v2',
              sound: 'default',
              ...(tag ? { tag } : {}),
              ...(imageUrl ? { image: imageUrl } : {}),
            },
          },
          apns: {
            payload: {
              aps: {
                'mutable-content': 1,
                sound: 'default',
              },
            },
            ...(imageUrl ? { fcm_options: { image: imageUrl } } : {}),
          },
          token: valueToken,
          data: { Records: Datas },
        },
      };

      try {
        const response = await axios.post(
          `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
          message,
          {
            headers: {
              Authorization: `Bearer ${Access_tokens}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Notification sent:', type, response?.data?.name || 'ok');
      } catch (error) {
        console.error(
          'FCM send failed:',
          type,
          error?.response?.data?.error?.message || error?.message
        );
      }
    }));
  } catch (error) {
    console.error('sendPushNotification error:', error?.message);
  }
};

async function getAccessToken() {
  const tokens = await client.authorize();
  return tokens.access_token;
}

const getFileType = (fileUrl) => {
  const extension = fileUrl?.split('.').pop()?.toLowerCase();

  if (['jpeg', 'jpg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extension)) {
    return 'image';
  }
  else if (['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg', 'mp4', 'mpeg'].includes(extension)) {
    return 'audio';
  }
  else if (['pdf', 'doc', 'docx'].includes(extension)) {
    return 'file';
  }
  else {
    return 'unknown';
  }
};
