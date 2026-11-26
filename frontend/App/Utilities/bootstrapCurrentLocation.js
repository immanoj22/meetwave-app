import { Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import getaddressapi from '../Actions/getaddressapi';
import { GetItem, SetItem } from '../Actions/localstorage';
import {
    update_ChangeCurrentLoc,
    update_CommonLocAdd,
    update_CommonLocation,
} from '../Slices/helper';

function normalizeLocation(loc) {
    if (!loc || typeof loc !== 'object') {
        return null;
    }

    const latitude = Number(loc.lat ?? loc.latitude);
    const longitude = Number(loc.long ?? loc.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
    }

    return {
        lat: latitude,
        long: longitude,
        latitude,
        longitude,
        formatted_address: loc.formatted_address ?? '',
    };
}

async function ensureLocationPermission(requestIfNeeded = true) {
    try {
        const permission =
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

        const current = await check(permission);

        if (current === RESULTS.GRANTED) {
            return true;
        }

        if (!requestIfNeeded || current === RESULTS.BLOCKED || current === RESULTS.LIMITED) {
            return false;
        }

        const requested = await request(permission);
        return requested === RESULTS.GRANTED;
    } catch {
        return false;
    }
}

function getCurrentCoordinates() {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (pos) => resolve(pos?.coords),
            (error) => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
                forceRequestLocation: false,
                showLocationDialog: false,
            },
        );
    });
}

function isSimilarLocation(l1, l2) {
    if (!l1 || !l2) return false;
    const lat1 = l1.lat ?? l1.latitude;
    const lon1 = l1.long ?? l1.longitude;
    const lat2 = l2.lat ?? l2.latitude;
    const lon2 = l2.long ?? l2.longitude;

    // Roughly 100m threshold (0.001 degrees)
    return Math.abs(lat1 - lat2) < 0.001 && Math.abs(lon1 - lon2) < 0.001;
}

function pushLocationToStore(dispatch, loc) {
    dispatch(update_ChangeCurrentLoc(loc));
    dispatch(update_CommonLocAdd(loc));
    dispatch(update_CommonLocation(loc?.formatted_address ?? ''));
}

/**
 * Ensures the app has a valid location in Redux with minimal "glitches" (double renders).
 * Logic:
 * 1. Read stored location.
 * 2. Try to get a fresh location coordinates.
 * 3. Only push to Redux once per bootstrap phase if possible.
 */
export async function bootstrapCurrentLocation(dispatch, options = {}) {
    const {
        requestIfNeeded = true,
        /**
         * `silent` short-circuits the geocoder retries (used by hot paths such
         * as the group screen's focus refresh).  Coords are dispatched
         * immediately; the address resolution still happens in the background
         * via the per-screen self-healing effect.
         */
        silent = false,
    } = options;
    const stored = normalizeLocation(GetItem('currentLoc'));

    // On initial bootstrap, we might want to push stored location immediately
    // so the UI isn't completely empty, BUT the user explicitly asked for "one time render".
    // So we will wait to see if we can get a fresh one first.

    const granted = await ensureLocationPermission(requestIfNeeded);

    if (!granted) {
        if (stored) {
            pushLocationToStore(dispatch, stored);
            return { usedStored: true, resolvedFresh: false };
        }
        return { usedStored: false, resolvedFresh: false };
    }

    try {
        // Fetch fresh coordinates
        const coords = await getCurrentCoordinates();
        const freshBase = normalizeLocation(coords);

        if (!freshBase) {
            if (stored) pushLocationToStore(dispatch, stored);
            return { usedStored: !!stored, resolvedFresh: false };
        }

        // Check if fresh coords are significantly different from stored.
        const similar = isSimilarLocation(freshBase, stored);

        // Step 1 — push coordinates to Redux IMMEDIATELY so every consumer
        // (group feed, filter address line, etc.) sees a usable location
        // without having to wait on the Google geocoder.  We use a friendly
        // placeholder so the filter screen never falls through to the
        // "ChangeLocation" label.  The placeholder is replaced with the
        // real street address as soon as the geocode round-trip completes.
        const placeholderAddress =
            (similar && stored?.formatted_address) ||
            'Current location';
        const immediateLocation = {
            ...freshBase,
            formatted_address: placeholderAddress,
        };
        pushLocationToStore(dispatch, immediateLocation);

        // Step 2 — only the geocoded address is awaited.  This blocks just
        // long enough to swap the placeholder for the real address; it does
        // NOT block any other API the app may already have fired off using
        // the coords we just dispatched.
        // Step 2 — resolve a real street address.  We try up to 3 times with
        // a small back-off because the very first call can fail right at app
        // launch (network not fully ready, Google quota warm-up, etc.).
        // A Plus Code looks like `XXXX+XX` at the very start of the address
        // (e.g. "QGPC+HG Alathur, Tamil Nadu, India").  Treat *only* those as
        // unresolved; any other address that happens to contain a "+" should
        // still be accepted.
        const PLUS_CODE_PREFIX = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*/;
        const isUsableAddress = (s) =>
            typeof s === 'string' &&
            s.length > 0 &&
            s !== 'Current location' &&
            !PLUS_CODE_PREFIX.test(s);

        let resolvedAddress = null;
        if (!silent && (!similar || !stored?.formatted_address)) {
            for (let attempt = 1; attempt <= 3; attempt += 1) {
                try {
                    const formattedAddress = await getaddressapi(
                        freshBase.latitude,
                        freshBase.longitude,
                    );
                    if (isUsableAddress(formattedAddress)) {
                        resolvedAddress = formattedAddress;
                        break;
                    }
                } catch (e) {
                    console.warn('Bootstrap: address fetch failed', e);
                }
                if (attempt < 3) {
                    await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
                }
            }
            // If every attempt failed but we previously cached a good address
            // for (approximately) the same coords, reuse it — better than the
            // placeholder.
            if (!resolvedAddress && similar && stored?.formatted_address) {
                resolvedAddress = stored.formatted_address;
            }
        } else if (similar && stored?.formatted_address) {
            resolvedAddress = stored.formatted_address;
        }

        const finalAddress = resolvedAddress || placeholderAddress;
        const finalLocation = {
            ...freshBase,
            formatted_address: finalAddress,
        };

        if (finalLocation.formatted_address !== placeholderAddress) {
            pushLocationToStore(dispatch, finalLocation);
        }

        // Only persist a *real* address to MMKV; never persist the placeholder
        // so the next cold start doesn't latch onto the placeholder forever.
        if (resolvedAddress) {
            SetItem('currentLoc', finalLocation);
        } else {
            // Persist coords only so the next launch still has a starting
            // point, but with the previously-known real address (if any).
            SetItem('currentLoc', {
                ...freshBase,
                formatted_address: stored?.formatted_address || '',
            });
        }

        return {
            usedStored: false,
            resolvedFresh: true,
            resolvedAddress: !!resolvedAddress,
        };
    } catch (error) {
        console.warn("Bootstrap: coordinate fetch failed", error);
        if (stored) {
            pushLocationToStore(dispatch, stored);
            return { usedStored: true, resolvedFresh: false };
        }
        return { usedStored: false, resolvedFresh: false };
    }
}
