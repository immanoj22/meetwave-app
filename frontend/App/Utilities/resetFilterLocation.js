import { Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import getaddressapi from '../Actions/getaddressapi';
import { RemoveItem, SetItem } from '../Actions/localstorage';
import {
    update_ChangeCurrentLoc,
    update_ChangeTempLoc,
    update_CommonLocAdd,
    update_CommonLocation,
} from '../Slices/helper';

export function isFilterLocationEmpty(loc) {
    if (loc == null || loc === '') {
        return true;
    }
    if (typeof loc !== 'object') {
        return true;
    }
    const lat = loc.lat ?? loc.latitude;
    return lat == null || lat === '' || Number.isNaN(Number(lat));
}

async function isLocationGranted() {
    try {
        const permission =
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        const result = await check(permission);
        return result === RESULTS.GRANTED;
    } catch {
        return false;
    }
}

function getDeviceCoordinates() {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (pos) => resolve(pos?.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    });
}

/**
 * On feed Reset: clear filter location, then set current device address if
 * location permission is already granted; otherwise leave empty ("Change location").
 */
export async function resetFilterLocation(dispatch, tabKey) {
    dispatch(update_ChangeTempLoc(''));
    dispatch(update_ChangeCurrentLoc(''));
    dispatch(update_CommonLocation(''));
    dispatch(update_CommonLocAdd(''));

    RemoveItem('AdddressFilter');
    if (tabKey) {
        RemoveItem(`AdddressFilter:${tabKey}`);
    }

    const granted = await isLocationGranted();
    if (!granted) {
        return;
    }

    try {
        const coords = await getDeviceCoordinates();
        const latitude = Number(coords?.latitude);
        const longitude = Number(coords?.longitude);
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return;
        }

        let formatted_address = await getaddressapi(latitude, longitude);
        if (!formatted_address || String(formatted_address).includes('+')) {
            formatted_address = '';
        }

        const addressData = {
            lat: latitude,
            long: longitude,
            latitude,
            longitude,
            formatted_address,
        };

        dispatch(update_ChangeCurrentLoc(addressData));
        if (tabKey) {
            SetItem(`AdddressFilter:${tabKey}`, addressData);
        }
    } catch {
        /* keep cleared → "Change location" */
    }
}
