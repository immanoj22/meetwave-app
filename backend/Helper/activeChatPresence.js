const activeChatPresence = new Map();

export const getUserActiveChatInstance = (userId) => {
    if (!userId) {
        return null;
    }
    return activeChatPresence.get(String(userId)) || null;
};

export const setUserActiveChatInstance = (userId, instanceId) => {
    if (!userId || !instanceId) {
        return;
    }
    activeChatPresence.set(String(userId), String(instanceId));
};

export const clearUserActiveChatInstance = (userId, instanceId = null) => {
    if (!userId) {
        return;
    }

    const normalizedUserId = String(userId);
    if (
        instanceId &&
        activeChatPresence.get(normalizedUserId) !== String(instanceId)
    ) {
        return;
    }

    activeChatPresence.delete(normalizedUserId);
};
