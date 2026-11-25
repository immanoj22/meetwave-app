import axios from 'axios';
import { GOOGLEAPIKEY } from './constant';
const API_KEY = GOOGLEAPIKEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reverse-geocodes a (lat, lng) pair via the Google Geocoding API.
 *
 * Returns `null` (never throws) on failure so callers can fall back to a
 * placeholder.  Retries once after a short delay on transient failures.
 * Verbose `console.log` lines (prefixed `[getaddressapi]`) print Google's
 * raw `status` / `error_message` so production debugging is possible from
 * Metro / device logs.
 */
const getaddressapi = async (latitude, longitude) => {
  console.log('[getaddressapi] called →', {
    latitude,
    longitude,
    apiKeyPresent: !!API_KEY,
    apiKeyLength: typeof API_KEY === 'string' ? API_KEY.length : 0,
  });

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log('[getaddressapi] invalid coordinates →', {
      latitude,
      longitude,
    });
    return null;
  }
  if (!API_KEY) {
    console.log('[getaddressapi] missing GLEKEY in .env — cannot call Google Geocoding API');
    return null;
  }

  const callOnce = async () => {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: { latlng: `${lat},${lng}`, key: API_KEY },
        timeout: 8000,
      },
    );
    return response?.data;
  };

  // A Plus Code looks like `XXXX+XX` at the start of the formatted address
  // (e.g. "QGPC+HG Alathur, Tamil Nadu, India").  Google returns it as one of
  // the results when the exact lat/long doesn't fall on a known street.  We
  // want to skip those in favour of street / locality / area results.
  const PLUS_CODE_PREFIX = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*/;
  const isPlusCodeResult = (r) => {
    if (!r) return true;
    if (Array.isArray(r.types) && r.types.includes('plus_code')) return true;
    if (PLUS_CODE_PREFIX.test(String(r.formatted_address ?? ''))) return true;
    return false;
  };
  const stripPlusCode = (addr) => String(addr ?? '').replace(PLUS_CODE_PREFIX, '').trim();

  // Preferred types in priority order (most specific → least specific).
  const PREFERRED_TYPES = [
    'street_address',
    'premise',
    'subpremise',
    'route',
    'intersection',
    'neighborhood',
    'sublocality',
    'sublocality_level_1',
    'locality',
    'administrative_area_level_3',
    'administrative_area_level_2',
    'administrative_area_level_1',
  ];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const data = await callOnce();
      const status = data?.status;
      const errMsg = data?.error_message;
      const results = Array.isArray(data?.results) ? data.results : [];
      console.log('[getaddressapi] response →', {
        attempt,
        status,
        error_message: errMsg,
        results_count: results.length,
        first_address: results?.[0]?.formatted_address,
        all_addresses: results.map((r) => ({
          types: r?.types,
          addr: r?.formatted_address,
        })),
      });

      if (status === 'OK' && results.length > 0) {
        let chosen = null;
        // 1. Prefer the most specific available type.
        for (const wanted of PREFERRED_TYPES) {
          const hit = results.find(
            (r) =>
              Array.isArray(r?.types) &&
              r.types.includes(wanted) &&
              !isPlusCodeResult(r),
          );
          if (hit?.formatted_address) {
            chosen = hit.formatted_address;
            break;
          }
        }
        // 2. Otherwise any result that isn't a Plus Code.
        if (!chosen) {
          const hit = results.find((r) => !isPlusCodeResult(r));
          if (hit?.formatted_address) chosen = hit.formatted_address;
        }
        // 3. Final fallback: strip the Plus Code prefix from result[0] so we
        //    still return something useful (e.g. "Alathur, Tamil Nadu, India").
        if (!chosen) {
          chosen = stripPlusCode(results[0]?.formatted_address);
        }

        if (chosen) {
          console.log('[getaddressapi] resolved →', chosen);
          return chosen;
        }
      }

      if (status !== 'UNKNOWN_ERROR' && status !== 'OVER_QUERY_LIMIT') {
        return null;
      }
    } catch (error) {
      console.log('[getaddressapi] request failed →', {
        attempt,
        message: error?.message,
        code: error?.code,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
      });
    }
    if (attempt === 1) await sleep(500);
  }
  console.log('[getaddressapi] gave up after retries');
  return null;
};

export default getaddressapi;
