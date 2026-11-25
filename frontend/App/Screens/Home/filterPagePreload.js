import { preloadAllCommonFilterTabs, preloadFilterTab } from './AsyncCommonFilterPage';
import { preloadHobbiesTreeIfNeeded } from '../../Utilities/hobbiesFilterCache';

let groupFilterPromise = null;

/** Preload Create Group / Create Event hobby filter bundle. */
export function preloadGroupFilterPage() {
    if (groupFilterPromise) return groupFilterPromise;
    groupFilterPromise = import('./GroupFilterPage').then((module) => module.default);
    return groupFilterPromise;
}

/** Warm all home-tab filter bundles in parallel. */
export function preloadAllFilterTabs() {
    return preloadAllCommonFilterTabs();
}

/** Call from home / create flows so filter icons open instantly. */
export function warmAllFilterSheets(userId) {
    preloadAllFilterTabs();
    preloadGroupFilterPage();
    if (userId) {
        preloadHobbiesTreeIfNeeded(userId);
    }
}
