import { store } from '../Slices';
import { GetItem } from '../Actions/localstorage';
import { getAllMembersapi, getSingleInitialchatdata } from '../Actions/hooks';

export function memberMatchesUserId(member, userId) {
    if (!member || userId == null || userId === '') {
        return false;
    }
    const uid = String(userId);
    return normalizeChatUserId(member) === uid;
}

export function getOtherChatMember(members, currentUserId) {
    if (!Array.isArray(members)) {
        return null;
    }
    return members.find((m) => !memberMatchesUserId(m, currentUserId)) ?? null;
}

export function normalizeMemberIds(members) {
    if (!Array.isArray(members)) {
        return [];
    }
    return [...new Set(
        members
            .map((member) => normalizeChatUserId(member))
            .filter(Boolean)
    )];
}

export function normalizeChatUserId(id) {
    if (id == null) {
        return '';
    }
    if (typeof id === 'object') {
        const nestedId = id._id ?? id.id ?? id.userId ?? id.chatId;
        return nestedId != null && nestedId !== '' ? normalizeChatUserId(nestedId) : '';
    }
    return String(id);
}

export function hasUserSeenMessage(seenStatus, userId) {
    const target = normalizeChatUserId(userId);
    if (!target) {
        return false;
    }
    return (seenStatus ?? []).some(
        (status) => normalizeChatUserId(status?.seen ?? status) === target
    );
}

export function isReaderInMessageAudience(message, readerId) {
    const reader = normalizeChatUserId(readerId);
    if (!reader) {
        return false;
    }

    const audience = message?.groupmembers;
    if (!Array.isArray(audience) || audience.length === 0) {
        return true;
    }

    return audience.some((member) => normalizeChatUserId(member) === reader);
}

export function getMessageReceiptMembers(message, chatMembers, currentUserId) {
    const audience = Array.isArray(message?.groupmembers) && message.groupmembers.length > 0
        ? message.groupmembers
        : chatMembers;

    if (!Array.isArray(audience)) {
        return [];
    }

    return audience.filter((member) => !memberMatchesUserId(member, currentUserId));
}

export function isGroupChatMember(userId, chatMembers) {
    if (!userId || !Array.isArray(chatMembers)) {
        return false;
    }
    return chatMembers.some((member) => memberMatchesUserId(member, userId));
}

export function markOutgoingMessagesSeenBy(messages, readerId, currentUserId) {
    const reader = normalizeChatUserId(readerId);
    const self = normalizeChatUserId(currentUserId);
    if (!reader || !Array.isArray(messages)) {
        return messages;
    }

    let didUpdate = false;
    const nextMessages = messages.map((msg) => {
        const senderId = normalizeChatUserId(msg?.chatId?._id ?? msg?.chatId);
        if (senderId !== self || hasUserSeenMessage(msg?.seenStatus, reader)) {
            return msg;
        }

        if (!isReaderInMessageAudience(msg, readerId)) {
            return msg;
        }

        didUpdate = true;
        const seenStatus = Array.isArray(msg.seenStatus) ? [...msg.seenStatus] : [];
        return {
            ...msg,
            seenStatus: [
                ...seenStatus,
                { seen: readerId, date: new Date().toISOString() },
            ],
        };
    });

    return didUpdate ? nextMessages : messages;
}

export function allMembersSeenMessage(members, seenStatus, currentUserId) {
    const memberIds = members
        ?.map((member) => normalizeChatUserId(member))
        ?.filter((memberId) => memberId && memberId !== normalizeChatUserId(currentUserId));
    return memberIds?.every((memberId) => hasUserSeenMessage(seenStatus, memberId));
}

export function isOutgoingChatMessage(message, currentUserId) {
    const senderId = normalizeChatUserId(message?.chatId?._id ?? message?.chatId);
    return senderId === normalizeChatUserId(currentUserId);
}

export function getReadReceiptKeys(message) {
    const keys = [];
    const id = String(message?._id ?? '');
    if (id) {
        keys.push(id);
    }
    const clientMessageId = message?.messageId ? String(message.messageId) : '';
    if (clientMessageId) {
        keys.push(`mid:${clientMessageId}`);
    }
    return keys;
}

export function buildReadReceiptMapFromMessages(messages, peerUserId, currentUserId) {
    if (!Array.isArray(messages) || !peerUserId) {
        return {};
    }

    return messages.reduce((acc, message) => {
        if (!isOutgoingChatMessage(message, currentUserId)) {
            return acc;
        }

        const isRead = hasUserSeenMessage(message?.seenStatus, peerUserId);
        getReadReceiptKeys(message).forEach((key) => {
            acc[key] = isRead;
        });
        return acc;
    }, {});
}

export function applyPeerReadReceipts(readMap, messages, readerId, currentUserId) {
    if (!Array.isArray(messages)) {
        return readMap;
    }

    const reader = normalizeChatUserId(readerId);
    if (!reader) {
        return readMap;
    }

    const next = { ...(readMap ?? {}) };
    let changed = false;

    messages.forEach((message) => {
        if (!isOutgoingChatMessage(message, currentUserId)) {
            return;
        }

        getReadReceiptKeys(message).forEach((key) => {
            if (!next[key]) {
                next[key] = true;
                changed = true;
            }
        });
    });

    return changed ? next : readMap;
}

export function isMessageReadByPeer(message, peerUserId, currentUserId, chatMembers, isGroupchat) {
    if (!isOutgoingChatMessage(message, currentUserId)) {
        return false;
    }

    if (isGroupchat) {
        const receiptMembers = getMessageReceiptMembers(message, chatMembers, currentUserId);
        if (!receiptMembers.length) {
            return false;
        }
        return allMembersSeenMessage(receiptMembers, message?.seenStatus, currentUserId);
    }

    return hasUserSeenMessage(message?.seenStatus, peerUserId);
}

export function shouldShowTypingInChat(data, chatInstanceId, currentUserId) {
    if (!data || !chatInstanceId) {
        return false;
    }
    if (data?.id != null && String(data.id) === String(currentUserId)) {
        return false;
    }
    if (!data?.instanceId) {
        return true;
    }
    return String(data.instanceId) === String(chatInstanceId);
}

export function shouldClearTypingIndicator(prev, stopData, chatInstanceId) {
    if (!prev) {
        return false;
    }

    if (stopData?.forceClear === true) {
        return true;
    }

    const chatId = chatInstanceId ? String(chatInstanceId) : '';
    const stopChatId = stopData?.instanceId ? String(stopData.instanceId) : null;
    const prevChatId = prev?.instanceId ? String(prev.instanceId) : null;

    if (stopChatId) {
        if (chatId && stopChatId !== chatId && stopChatId !== prevChatId) {
            return false;
        }
        return true;
    }

    if (chatId && prevChatId && prevChatId !== chatId) {
        return false;
    }
    if (stopData?.id && prev?.id && String(stopData.id) !== String(prev.id)) {
        return false;
    }
    return true;
}

export function getChatInstanceId(payload) {
    const rawInstance = payload?.instanceId;
    const candidates = [
        payload?._id,
        typeof rawInstance === 'object' ? rawInstance?._id : rawInstance,
        payload?.chatGroupId,
        payload?.resp?.instanceId?._id,
        payload?.resp?.instanceId,
    ];
    const instanceId = candidates.find((value) => value != null && value !== '');
    return instanceId != null ? String(instanceId) : null;
}

export function isGroupChatEvent(payload) {
    const raw =
        payload?.instanceId && typeof payload.instanceId === 'object'
            ? payload.instanceId
            : payload;

    return (
        raw?.isGroupchat === true ||
        raw?.isGroupchat === 'true' ||
        raw?.isGroupchat === 1
    );
}

const CHAT_NOTIFICATION_TYPES = new Set(['chat', 'chatting']);

export function normalizeNotificationType(type) {
    if (type == null || type === '') {
        return '';
    }
    return String(type).trim();
}

export function isChatNotificationType(type) {
    return CHAT_NOTIFICATION_TYPES.has(normalizeNotificationType(type).toLowerCase());
}

export async function fetchChatDetailByInstanceId(instanceId) {
    return fetchChatFromApi(instanceId);
}

export function parseNotificationPayload(raw) {
    if (raw == null || raw === '') {
        return null;
    }
    if (typeof raw === 'object') {
        if (raw?.record != null) {
            return parseNotificationPayload(raw.record);
        }
        if (raw?.Records != null) {
            return parseNotificationPayload(raw.Records);
        }
        if (raw?.data != null && typeof raw.data === 'object') {
            const nested = raw.data?.record ?? raw.data?.Records;
            if (nested != null) {
                return parseNotificationPayload(nested);
            }
        }
        return raw;
    }
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return null;
}

function extractInstanceId(payload) {
    const raw = payload?._doc ?? payload;
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const id = raw?._id ?? raw?.instanceId ?? raw?.chatGroupId;
    return id != null && id !== '' ? String(id) : null;
}

function isSameProfilePath(a, b) {
    if (!a || !b) {
        return false;
    }
    return String(a).trim() === String(b).trim();
}

function reorderSingleChatMembers(members, currentUserId) {
    if (!Array.isArray(members) || !members.length) {
        return [];
    }

    const uid = String(currentUserId || '');
    const other = getOtherChatMember(members, uid);
    const self = members.find((member) => memberMatchesUserId(member, uid));
    const rest = members.filter(
        (member) =>
            member &&
            !memberMatchesUserId(member, uid) &&
            member !== other,
    );

    const ordered = [];
    if (other) {
        ordered.push(other);
    }
    if (self) {
        ordered.push(self);
    }
    ordered.push(...rest);

    return ordered.length ? ordered : members.filter(Boolean);
}

/** Normalize 1:1 chat detail so header always shows the other user, not self. */
export function normalizeSingleChatDetailForOpen(detil, currentUserId, loggedInProfile) {
    if (!detil || detil.isGroupchat) {
        return detil;
    }

    const uid = String(currentUserId || '');
    const loggedInProfilePath = loggedInProfile?.profile ?? loggedInProfile;
    let members = Array.isArray(detil.members) ? detil.members.filter(Boolean) : [];

    const notifUsername = detil.username || detil.chatName || '';
    const notifProfile = detil.profile || '';
    const notifRandomIndex = detil.randomIndex;
    const topLevelLooksLikeSelf = isSameProfilePath(
        notifProfile,
        loggedInProfilePath,
    );

    if (
        members.length === 0 &&
        notifUsername &&
        notifProfile &&
        !topLevelLooksLikeSelf
    ) {
        members = [
            {
                username: notifUsername,
                name: notifUsername,
                profile: notifProfile,
                randomIndex: notifRandomIndex,
            },
        ];
    }

    const orderedMembers = reorderSingleChatMembers(members, uid);
    const peer = getOtherChatMember(orderedMembers, uid);

    const peerProfile =
        peer?.profile &&
        !isSameProfilePath(peer.profile, loggedInProfilePath)
            ? peer.profile
            : topLevelLooksLikeSelf
              ? peer?.profile || ''
              : notifProfile && !topLevelLooksLikeSelf
                ? notifProfile
                : peer?.profile || '';

    return {
        ...detil,
        members: orderedMembers,
        profile: peerProfile,
        username: peer?.username || peer?.name || notifUsername || detil.username,
        randomIndex: peer?.randomIndex ?? notifRandomIndex ?? detil.randomIndex,
        chatName:
            peer?.username ||
            peer?.name ||
            notifUsername ||
            detil.chatName ||
            'Chat',
    };
}

async function fetchChatFromApi(instanceId) {
    const userId = GetItem('UserId');
    if (!userId || !instanceId) {
        return null;
    }

    try {
        const [groupResult, singleResult] = await Promise.all([
            getAllMembersapi({
                userId,
                type: 'groupchat',
                page: 1,
                limit: 50,
            }),
            getSingleInitialchatdata({
                userId,
                searchText: '',
                page: 1,
                limit: 50,
            }),
        ]);

        const combined = [
            ...(Array.isArray(groupResult?.data) ? groupResult.data : []),
            ...(Array.isArray(singleResult?.data) ? singleResult.data : []),
        ];

        return combined.find((c) => String(c?._id) === String(instanceId)) || null;
    } catch {
        return null;
    }
}

function buildStubFromNotification(raw) {
    const instanceId = extractInstanceId(raw);
    if (!instanceId) {
        return null;
    }

    const isGroupchat =
        raw?.isGroupchat === true ||
        raw?.isGroupchat === 'true' ||
        raw?.isGroupchat === 1;

    return {
        _id: instanceId,
        chatName: raw?.chatName || raw?.username || 'Chat',
        isGroupchat,
        Image: raw?.Image || '',
        groupIndex: raw?.groupIndex ?? '',
        groupDiscription: raw?.groupDiscription || '',
        profile: raw?.profile || '',
        username: raw?.username || '',
        randomIndex: raw?.randomIndex ?? '',
        members: Array.isArray(raw?.members) ? raw.members : [],
        type: 'chat',
    };
}

export function resolveChatDetailFromNotification(payload) {
    const raw = payload?._doc || payload;
    const instanceId = extractInstanceId(raw);
    if (!instanceId) {
        return raw;
    }

    const helper = store.getState()?.helper || {};
    const lists = [
        ...(helper.singleChatMembersList || []),
        ...(helper.chatMembersList || []),
    ];
    const match = lists.find((c) => String(c?._id) === String(instanceId));
    const resolved = match || buildStubFromNotification(raw) || raw;
    const userId = GetItem('UserId');
    const loggedInProfile = store.getState()?.profile?.profile;

    return normalizeSingleChatDetailForOpen(resolved, userId, loggedInProfile);
}

export async function resolveChatDetailFromNotificationAsync(payload) {
    const raw = payload?._doc ?? payload;
    const userId = GetItem('UserId');
    const loggedInProfile = store.getState()?.profile?.profile;
    let detil = resolveChatDetailFromNotification(payload);

    const peer = getOtherChatMember(detil?.members, userId);
    const hasPeerProfile =
        peer?.profile &&
        !isSameProfilePath(peer.profile, loggedInProfile?.profile);

    if (detil?.isGroupchat || (peer && hasPeerProfile)) {
        return detil;
    }

    const instanceId = extractInstanceId(raw);
    if (!instanceId) {
        return detil;
    }

    const fromApi = await fetchChatFromApi(instanceId);
    detil = fromApi || detil;

    return normalizeSingleChatDetailForOpen(detil, userId, loggedInProfile);
}
