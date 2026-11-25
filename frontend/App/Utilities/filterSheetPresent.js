import { preloadFilterTab } from '../Screens/Home/AsyncCommonFilterPage';
import {
    preloadAllFilterTabs,
    preloadGroupFilterPage,
} from '../Screens/Home/filterPagePreload';

/** Stack routes that host a Gorhom filter bottom sheet. */
export const FILTER_ROUTE_NAMES = [
    "PeopleFilterPage",
    "ChatFilterPage",
    "ActivitiesFilterPage",
    "CommonFilterPage",
];

export const ALL_FILTER_SHEET_ROUTES = [
    ...FILTER_ROUTE_NAMES,
    "GroupfilterPage",
];

const FILTER_TAB_TO_ROUTE = {
    People: "PeopleFilterPage",
    Chat: "ChatFilterPage",
    Activities: "ActivitiesFilterPage",
};

/**
 * Open any filter sheet without stacking People + Group + Event modals.
 * Replaces the top filter when switching types; pops intermediate screens when a
 * filter is buried under Create Event / Create Group.
 */
export function navigateToFilterSheet(navigation, routeName, params) {
    if (routeName === 'GroupfilterPage') {
        preloadGroupFilterPage();
    } else if (FILTER_ROUTE_NAMES.includes(routeName)) {
        const tab =
            routeName === 'ChatFilterPage'
                ? 'Chat'
                : routeName === 'ActivitiesFilterPage'
                  ? 'Activities'
                  : 'People';
        preloadFilterTab(tab);
    }
    preloadAllFilterTabs();

    const state = navigation?.getState?.();
    if (!state?.routes?.length) {
        navigation.navigate(routeName, params);
        return;
    }

    const routes = state.routes;
    const index = state.index ?? routes.length - 1;
    const topName = routes[index]?.name;

    if (ALL_FILTER_SHEET_ROUTES.includes(topName)) {
        if (topName === routeName) {
            navigation.navigate({ name: routeName, params, merge: true });
        } else {
            navigation.replace(routeName, params);
        }
        return;
    }

    const filterIndex = routes.findIndex((r) =>
        ALL_FILTER_SHEET_ROUTES.includes(r.name),
    );
    if (filterIndex >= 0 && filterIndex < index) {
        navigation.pop(index - filterIndex);
        navigation.replace(routeName, params);
        return;
    }

    navigation.navigate(routeName, params);
}

/**
 * Open the home-tab common filter (People / Chat / Activities).
 */
export function navigateToFilterPage(navigation, tab) {
    const resolved = tab ?? 'People';
    preloadFilterTab(resolved);
    preloadAllFilterTabs();
    const target =
        FILTER_TAB_TO_ROUTE[resolved] ?? FILTER_TAB_TO_ROUTE.People;
    navigateToFilterSheet(navigation, target);
}

/**
 * Schedules @gorhom/bottom-sheet present() with retries.
 * Tracks every timeout so unmount / tab switch can cancel stale presents (avoids cross-tab crashes).
 */
export function scheduleFilterSheetPresent({
    sheetRef,
    isMountedRef,
    openedAtRef,
    presentScheduleTokenRef,
    presentCleanupRef,
    updateOpenedAt = true,
    resetAccordion = true,
    onResetAccordion,
}) {
    presentCleanupRef.current?.();
    presentCleanupRef.current = null;

    const pendingTimers = [];

    const tryPresent = (attempt) => {
        if (!isMountedRef.current) return;
        const sheet = sheetRef.current;
        if (sheet?.present) {
            if (updateOpenedAt) openedAtRef.current = Date.now();
            try {
                sheet.present();
            } catch {
                // Ref may not be ready during transparentModal transition.
            }
            if (resetAccordion && typeof onResetAccordion === "function") {
                requestAnimationFrame(() => {
                    if (!isMountedRef.current) return;
                    onResetAccordion();
                });
            }
            return;
        }
        if (attempt < 12) {
            pendingTimers.push(setTimeout(() => tryPresent(attempt + 1), 40));
        }
    };

    const start = () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => tryPresent(0));
        });
    };

    const token = ++presentScheduleTokenRef.current;
    pendingTimers.push(
        setTimeout(() => {
            if (!isMountedRef.current) return;
            if (token !== presentScheduleTokenRef.current) return;
            start();
        }, 0),
    );

    presentCleanupRef.current = () => {
        pendingTimers.forEach((id) => clearTimeout(id));
        pendingTimers.length = 0;
    };
}

export function cleanupFilterSheetOnUnmount({
    isMountedRef,
    presentScheduleTokenRef,
    presentCleanupRef,
    allowGoBackOnDismissRef,
}) {
    isMountedRef.current = false;
    if (allowGoBackOnDismissRef) {
        allowGoBackOnDismissRef.current = true;
    }
    presentScheduleTokenRef.current += 1;
    presentCleanupRef.current?.();
    presentCleanupRef.current = null;
    // Do not call sheet.dismiss() here — it races with the next filter route and
    // can trigger onDismiss → goBack(), popping the screen the user just opened.
}
