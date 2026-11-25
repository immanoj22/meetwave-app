import { GetItem } from "../Actions/localstorage";

export const DEFAULT_NEARBY_RADIUS_KM = 50;

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeLatLong = (location) => {
    if (!location || typeof location !== "object") {
        return null;
    }

    const latitude = toNumber(location.lat ?? location.latitude);
    const longitude = toNumber(location.long ?? location.longitude);

    if (latitude == null || longitude == null) {
        return null;
    }

    return {
        ...location,
        lat: latitude,
        long: longitude,
        latitude,
        longitude,
    };
};

export const getStoredRadiusForTab = (tabKey, fallback = DEFAULT_NEARBY_RADIUS_KM) => {
    const tabRadius = GetItem(`RadiusFilter:${tabKey}`);
    const legacyRadius = GetItem("RadiusFilter");
    const source = Array.isArray(tabRadius) && tabRadius.length > 0
        ? tabRadius[0]
        : Array.isArray(legacyRadius) && legacyRadius.length > 0
            ? legacyRadius[0]
            : fallback;

    const radius = toNumber(source);
    return radius == null ? fallback : radius;
};

export const buildNearbyPayload = ({
    primaryLocation,
    fallbackLocation,
    tabKey,
    fallbackRadius = DEFAULT_NEARBY_RADIUS_KM,
}) => {
    const normalized = normalizeLatLong(primaryLocation) ?? normalizeLatLong(fallbackLocation);
    const radius = getStoredRadiusForTab(tabKey, fallbackRadius);

    return {
        latitude: normalized?.latitude,
        longitude: normalized?.longitude,
        distance: radius,
        latLong: normalized,
    };
};
