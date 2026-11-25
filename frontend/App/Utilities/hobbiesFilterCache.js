import { GetItem, SetItem } from "../Actions/localstorage";
import { hobbydatasearch } from "../Actions/hooks";

export const HOBBIES_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
/** Bump when cache shape or fetch strategy changes (e.g. paginated → full tree). */
export const HOBBIES_CACHE_SCHEMA_VERSION = 2;
/** Upper bound when requesting the full hobby tree in one call. */
export const HOBBIES_TREE_FETCH_ALL_LIMIT = 500;

/** Chips shown per section before scroll loads more (all categories are listed). */
export const INITIAL_HOBBY_CHIPS = 24;
/** How many extra chips/categories to reveal per scroll step. */
export const HOBBY_REVEAL_STEP = 24;

const PEOPLE_KEY = "CommonFilterPage:HobbiesTree:v1:People";
const CHAT_KEY = "CommonFilterPage:HobbiesTree:v1:Chat";
const ACTIVITIES_KEY = "CommonFilterPage:HobbiesTree:v1:Activities";
const LEGACY_KEY = "CommonFilterPage:HobbiesTree:v1";
const GROUP_KEY = "GroupFilterPage:HobbiesTree:v1";

const TAB_CACHE_KEYS = {
    People: PEOPLE_KEY,
    Chat: CHAT_KEY,
    Activities: ACTIVITIES_KEY,
};

export function getSubcategoryHobbies(subcategory) {
    if (Array.isArray(subcategory?.Hobbies)) return subcategory.Hobbies;
    if (Array.isArray(subcategory?.hobbies)) return subcategory.hobbies;
    return [];
}

export function categoryHasNestedHobbies(category) {
    return (
        Array.isArray(category?.subcategory) &&
        category.subcategory.some((sub) => getSubcategoryHobbies(sub).length > 0)
    );
}

/** Default: every category row visible; chips grow on expand / scroll. */
export function buildInitialHobbiesVisibility(hobbiesList) {
    const list = Array.isArray(hobbiesList) ? hobbiesList : [];
    return {
        visibleCategoriesCount: list.length,
        visibleHobbyCounts: {},
        visibleCategoryCounts: {},
    };
}

/** Expand-all: show every category and chip (use only when user opts in). */
export function buildFullHobbiesVisibility(hobbiesList) {
    const list = Array.isArray(hobbiesList) ? hobbiesList : [];
    const visibleHobbyCounts = {};
    const visibleCategoryCounts = {};

    for (const category of list) {
        if (!category?._id) continue;
        if (categoryHasNestedHobbies(category)) {
            for (const sub of category.subcategory ?? []) {
                if (!sub?._id) continue;
                const hobbies = getSubcategoryHobbies(sub);
                if (hobbies.length > 0) {
                    visibleHobbyCounts[`${category._id}:${sub._id}`] = hobbies.length;
                }
            }
        } else {
            const flat = Array.isArray(category.subcategory)
                ? category.subcategory
                : [];
            if (flat.length > 0) {
                visibleCategoryCounts[`${category._id}:flat`] = flat.length;
            }
        }
    }

    return {
        visibleCategoriesCount: list.length,
        visibleHobbyCounts,
        visibleCategoryCounts,
    };
}

/** Single-request payload for the full filter hobby tree (empty search). */
export function buildHobbiesTreeFetchPayload(userId, hobbyname = "") {
    const search = (hobbyname ?? "").trim();
    if (search) {
        return {
            userId,
            hobbyname: search,
            page: 1,
            limit: HOBBIES_TREE_FETCH_ALL_LIMIT,
        };
    }
    return {
        userId,
        hobbyname: "",
        page: "all",
        limit: HOBBIES_TREE_FETCH_ALL_LIMIT,
    };
}

function readRawCache(key) {
    try {
        const cached = GetItem(key);
        if (
            cached &&
            typeof cached === "object" &&
            cached.version === HOBBIES_CACHE_SCHEMA_VERSION &&
            Array.isArray(cached.hobbiesList) &&
            cached.hobbiesList.length > 0
        ) {
            return cached;
        }
    } catch {}
    return null;
}

export function readHobbiesCacheForTab(tab = "People") {
    const primaryKey = TAB_CACHE_KEYS[tab] ?? PEOPLE_KEY;
    const keys = [primaryKey, LEGACY_KEY, GROUP_KEY];
    for (const key of keys) {
        const cached = readRawCache(key);
        if (cached) {
            const isFresh =
                Date.now() - (cached.ts ?? 0) < HOBBIES_CACHE_TTL_MS;
            return {
                hobbiesList: cached.hobbiesList,
                popularHobbies: Array.isArray(cached.popularHobbies)
                    ? cached.popularHobbies
                    : [],
                hobbyLimit:
                    typeof cached.hobbyLimit === "number"
                        ? cached.hobbyLimit
                        : 5,
                isFresh,
            };
        }
    }
    return null;
}

export function persistHobbiesCacheForTab(tab, result) {
    const key = TAB_CACHE_KEYS[tab] ?? PEOPLE_KEY;
    const payload = {
        version: HOBBIES_CACHE_SCHEMA_VERSION,
        ts: Date.now(),
        hobbiesList: result?.data ?? [],
        popularHobbies: result?.PopularHobbies ?? [],
        hobbyLimit: result?.HobbyLimit ?? 5,
    };
    try {
        SetItem(key, payload);
        SetItem(GROUP_KEY, payload);
    } catch {}
}

let preloadInFlight = null;

/** Warm hobby tree once after login / home mount when nothing fresh is cached. */
export function preloadHobbiesTreeIfNeeded(userId) {
    if (!userId) return Promise.resolve();
    const people = readHobbiesCacheForTab("People");
    if (people?.isFresh) return Promise.resolve();
    if (preloadInFlight) return preloadInFlight;

    preloadInFlight = hobbydatasearch(buildHobbiesTreeFetchPayload(userId, ""))
        .then((result) => {
            if (result?.status && Array.isArray(result?.data) && result.data.length) {
                persistHobbiesCacheForTab("People", result);
                persistHobbiesCacheForTab("Chat", result);
                persistHobbiesCacheForTab("Activities", result);
            }
        })
        .catch(() => {})
        .finally(() => {
            preloadInFlight = null;
        });

    return preloadInFlight;
}
