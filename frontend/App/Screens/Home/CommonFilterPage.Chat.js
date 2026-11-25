import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    InteractionManager,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    UIManager,
    View,
    TextInput,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
    helperSelector,
    update_ChangeCurrentLoc,
    update_ChangeTempLoc,
    update_CommonFilter,
    update_CommonFilterPayload,
    update_CommonLocAdd,
    update_CommonLocation,
    update_FilterByGender,
    update_HobbieList,
    update_HobbyLimit,
    update_Isfilter,
    update_Islocationfilter,
    update_NetworkVisible,
    update_PeopleFilterAge,
    update_PeopleFilterHobbies,
    update_PeoplGenderFilter,
    update_PopularHobbieList,
    update_statusbarcolor,
} from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
    borderradius,
    deviceheight,
    devicewidth,
    ShowToast,
} from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from "react-native-collapsible/Accordion";
import Icon from "react-native-vector-icons/FontAwesome6";
import { RFPercentage } from "react-native-responsive-fontsize";
import { hobbydatasearch } from "../../Actions/hooks";
import { GetItem, SetItem } from "../../Actions/localstorage";
import { profileSelector } from "../../Slices/profile";
import { useTranslation } from "react-i18next";
import SwitchToggle from "react-native-switch-toggle";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import getaddressapi from "../../Actions/getaddressapi";
import {
    getHobbyLimitModalMessage,
    isHobbyLimitEnforced,
} from "../../Actions/config";
import AlertPopup from "../../Components/AlertPopup";
import CollapsingHobbySection from "./CollapsingHobbySection";
import GenderInputModal from "./GenderInputModal";
import {
    BottomSheetModalProvider,
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetFooter,
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet/src";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    cleanupFilterSheetOnUnmount,
    scheduleFilterSheetPresent,
} from "../../Utilities/filterSheetPresent";
import { bootstrapCurrentLocation } from "../../Utilities/bootstrapCurrentLocation";
import {
    buildFullHobbiesVisibility,
    buildInitialHobbiesVisibility,
    buildHobbiesTreeFetchPayload,
    HOBBIES_CACHE_SCHEMA_VERSION,
    INITIAL_HOBBY_CHIPS,
    HOBBY_REVEAL_STEP,
    persistHobbiesCacheForTab,
    readHobbiesCacheForTab,
} from "../../Utilities/hobbiesFilterCache";
import {
    FilterAgeDistanceSliders,
    HobbiesTreePlaceholder,
} from "./CommonFilterPerf";

// ─── Constants ────────────────────────────────────────────────────────────────
// Main filter sheet should occupy ~95% of the viewport.
const SHEET_TOP_INSET_FRAC = 0.05;
const HOBBIES_PAGE_SIZE = INITIAL_HOBBY_CHIPS;
const HOBBIES_CACHE_LEGACY = "CommonFilterPage:HobbiesTree:v1";
const HOBBIES_CACHE_KEY = "CommonFilterPage:HobbiesTree:v1:Chat";
const HOBBIES_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const COMMON_FILTER_EARLY_DISMISS_MS = 2400;
const COMMON_FILTER_FOCUS_DISMISS_GRACE_MS = 1800;

// ─── Stable sub-components (defined OUTSIDE to prevent re-creation on render) ──

const Round = () => (
    <View
        style={{
            width: 28,
            height: 28,
            backgroundColor: "#fff",
            borderRadius: borderradius * 5,
            justifyContent: "center",
            top: "10%",
        }}
    >
        <View
            style={{
                width: 20,
                height: 20,
                backgroundColor: c.primary,
                borderRadius: borderradius * 5,
                alignSelf: "center",
            }}
        />
    </View>
);

// Memoized hobby pill for selected hobbies list
const SelectedHobbyPill = React.memo(({ interest, onRemove }) => (
    <Pressable
        style={styles.addcontainer}
        onPress={() => onRemove(interest)}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    >
        <Text style={styles.addbtntxt}>{interest?.hobbyName}</Text>
        <View style={styles.lessbox}>
            <Icon name="minus" size={deviceheight * 0.0158} color="#fff" />
        </View>
    </Pressable>
));

// Memoized hobby button (popular / own / category)
const HobbyButton = React.memo(
    ({ hobby, isAdded, onPress, containerStyle, textStyle }) => (
        <Pressable
            style={containerStyle}
            onPress={() => onPress(hobby)}
            hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
        >
            <Text style={textStyle}>{hobby?.hobbyname}</Text>
            {isAdded ? (
                <View style={styles.greenbox}>
                    <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                </View>
            ) : (
                <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
            )}
        </Pressable>
    ),
    // Custom comparator — only re-render if `isAdded` flips (avoids full hobby list re-render)
    (prev, next) =>
        prev.isAdded === next.isAdded &&
        prev.hobby?._id === next.hobby?._id &&
        prev.containerStyle === next.containerStyle
);

// Memoized search result row
const SearchResultItem = React.memo(
    ({ item, isAdded, onPress }) => (
        <TouchableOpacity
            onPress={() => onPress(item)}
            style={styles.selectItem}
        >
            <Text style={styles.listText}>{item.hobbyname}</Text>
            <View
                style={{
                    width: devicewidth * 0.04,
                    height: devicewidth * 0.04,
                    borderRadius: (devicewidth * 0.15) / 2,
                    backgroundColor: isAdded ? "#47db40" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "2%",
                }}
            >
                <Icon
                    name={isAdded ? "check" : "plus"}
                    size={deviceheight * 0.0148}
                    color={c.black}
                />
            </View>
        </TouchableOpacity>
    ),
    (prev, next) =>
        prev.isAdded === next.isAdded && prev.item?._id === next.item?._id
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CommonFilterPage = ({ visible = true, onClose, datareturn }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const mainScrollRef = useRef(null);
    const inlineSearchWrapRef = useRef(null);
    const lastMainScrollYRef = useRef(0);
    const paginationAnchorYRef = useRef(null);
    const beforeKeyboardScrollYRef = useRef(0);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    // Use a ref instead of state for keyboard visibility — state change here
    // triggers a full sheet re-render which causes gesture-system resets and
    // visible "stuck" / stutter on swipe-to-close. The ref is read in callbacks
    // only, never rendered, so no re-render is needed.
    const isKeyboardVisibleRef = useRef(false);
    const [storageReady, setStorageReady] = useState(false);

    const scrollInlineSearchIntoView = useCallback((attempt = 0) => {
        try {
            const node = inlineSearchWrapRef.current;
            const scroll = mainScrollRef.current;
            if (!node || !scroll?.scrollTo) return;

            beforeKeyboardScrollYRef.current = lastMainScrollYRef.current;
            node.measureLayout(
                scroll,
                (x, y) => {
                    if ((!Number.isFinite(y) || y <= 0) && attempt < 2) {
                        setTimeout(() => scrollInlineSearchIntoView(attempt + 1), 50);
                        return;
                    }

                    const currentScrollY = lastMainScrollYRef.current;
                    const yInView = y - currentScrollY;
                    const desiredTop = deviceheight * 0.15;
                    const keyboardRiskLine = deviceheight * 0.35;
                    if (yInView > keyboardRiskLine) {
                        scroll.scrollTo({ y: Math.max(0, y - desiredTop), animated: true });
                    }
                },
                () => { }
            );
        } catch { }
    }, []);

    useEffect(() => {
        const sub = Keyboard.addListener("keyboardDidShow", () => {
            if (isSearchFocused) {
                scrollInlineSearchIntoView(0);
            }
        });
        return () => {
            sub?.remove?.();
        };
    }, [isSearchFocused, scrollInlineSearchIntoView]);

    const restoreScrollAfterKeyboard = useCallback(() => {
        try {
            const scroll = mainScrollRef.current;
            if (!scroll?.scrollTo) return;
            scroll.scrollTo({ y: Math.max(0, beforeKeyboardScrollYRef.current), animated: true });
        } catch { }
    }, []);

    // ── Stable inset-derived values ────────────────────────────────────────
    // footerSpacer = paddingBottom on the scroll content.
    // Breakdown: pinned footer (~72px btn + insets.bottom) + loader slot (80px) + gap (40px) = ~200 + safe area.
    const footerSpacer = useMemo(
        () => 200 + Math.max(insets.bottom, 34),
        [insets.bottom]
    );

    const sheetTopInset = useMemo(() => {
        // Keep a consistent small gap at the top (plus notch safety).
        return Math.ceil(Math.max(deviceheight * SHEET_TOP_INSET_FRAC, insets.top + 8));
    }, [insets.top]);

    // ── API inflight counter (no state — avoids re-renders) ────────────────
    const apiInFlightRef = useRef(0);
    const beginApi = useCallback(() => { apiInFlightRef.current += 1; }, []);
    const endApi = useCallback(() => {
        apiInFlightRef.current = Math.max(0, apiInFlightRef.current - 1);
    }, []);

    const [hobbiesBootstrap] = useState(() => readHobbiesCacheForTab("Chat"));
    const hasCachedTree =
        (hobbiesBootstrap?.hobbiesList?.length ?? 0) > 0 &&
        hobbiesBootstrap?.isFresh;

    // ── Pagination / loading state ─────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [footerload, setFooterload] = useState(false);
    const [searchSheetFooterLoad, setSearchSheetFooterLoad] = useState(false);
    const [maxreached, setMaxreached] = useState(hasCachedTree);
    const [pageLoad, setPageLoad] = useState(() => !hasCachedTree);

    // ── Filter state ───────────────────────────────────────────────────────
    const [distance, setDistance] = useState([50]);
    const [values, setValues] = useState([18, 60]);
    const [isSliderDragging, setIsSliderDragging] = useState(false);
    const [genderArray, setGenderArray] = useState(["male", "female", "others"]);
    const [otherGender, setOtherGender] = useState("");
    const [othersSelected, setOthersSelected] = useState(false);

    // ── Accordion state ────────────────────────────────────────────────────
    // Accordion controls only "Own hobbies + categories" now (Selected/Popular render expanded outside).
    const [activeSections, setActiveSections] = useState([0]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});
    const [areAllOpen, setAreAllOpen] = useState(false);
    const collapseCleanupTimerRef = useRef(null);

    // ── Hobby state ────────────────────────────────────────────────────────
    const [hobbyLimit, setHobbyLimit] = useState(
        () => hobbiesBootstrap?.hobbyLimit ?? 5,
    );
    const [popularHobbies, setPopularHobbies] = useState(
        () => hobbiesBootstrap?.popularHobbies ?? [],
    );
    const [hobbiesList, setHobbiesList] = useState(
        () => hobbiesBootstrap?.hobbiesList ?? [],
    );
    const [selectedHobbiesList, setSelectedHobbiesList] = useState([]);
    const [visibleHobbyCounts, setVisibleHobbyCounts] = useState(() =>
        hasCachedTree
            ? buildInitialHobbiesVisibility(hobbiesBootstrap.hobbiesList).visibleHobbyCounts
            : {},
    );
    const [visibleCategoryCounts, setVisibleCategoryCounts] = useState(() =>
        hasCachedTree
            ? buildInitialHobbiesVisibility(hobbiesBootstrap.hobbiesList).visibleCategoryCounts
            : {},
    );
    const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(() =>
        hasCachedTree
            ? buildInitialHobbiesVisibility(hobbiesBootstrap.hobbiesList).visibleCategoriesCount
            : 0,
    );
    const [renderHobbiesTree, setRenderHobbiesTree] = useState(() => hasCachedTree);
    const hobbiesTreeMountTaskRef = useRef(null);
    const hobbiesListPrimedRef = useRef(false);
    const [hobbyLoading, setHobbyLoading] = useState(() => !hasCachedTree);
    const [revealLoading, setRevealLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(() => !hasCachedTree);

    const finishLoadingAfterPaint = useCallback(() => {
        let cancelled = false;
        let raf1 = null;
        let raf2 = null;

        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                if (cancelled) return;
                setIsLoading(false);
            });
        });

        const timeout = setTimeout(() => {
            if (cancelled) return;
            setIsLoading(false);
        }, 800);

        let task;
        try {
            task = InteractionManager.runAfterInteractions(() => {
                if (cancelled) return;
                setIsLoading(false);
            });
        } catch { }

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            if (raf1 != null) cancelAnimationFrame(raf1);
            if (raf2 != null) cancelAnimationFrame(raf2);
            task?.cancel?.();
        };
    }, []);

    // ── Search / UI state ──────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [onSearch, setOnSearch] = useState(false);
    const [ownHobbies, setOwnHobbies] = useState(false);
    // Secondary "hobby search" bottom sheet removed; search renders inline.
    const [selectedExpanded, setSelectedExpanded] = useState(true);
    const [popularExpanded, setPopularExpanded] = useState(true);
    const [ownExpanded, setOwnExpanded] = useState(false);

    // NOTE: Search mode accordion filtering isn't used for the main list anymore
    // (Selected/Popular always render expanded; accordion holds Own+Categories).

    // ── Location state ─────────────────────────────────────────────────────
    const [location, setLocation] = useState("");
    const [region, setRegion] = useState(null);

    // ── Modal state ────────────────────────────────────────────────────────
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMsg, setModalMsg] = useState("");
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    // ── Refs ───────────────────────────────────────────────────────────────
    const sheetRef = useRef(null);
    const isMountedRef = useRef(true);
    /** Cancel pending InteractionManager / safety timers from a previous schedulePresentSheet. */
    const presentCleanupRef = useRef(null);
    /** Bumps on unmount / rescheduling so stale runAfterInteractions callbacks cannot present(). */
    const presentScheduleTokenRef = useRef(0);
    // const bottomSheetRef = useRef(null);
    const hobbiesLoadedRef = useRef(hasCachedTree);
    const renderLocation = useRef(null);
    const firstRegionChangeHandled = useRef(false);
    const lastAutoLoadRef = useRef(0);
    const revealLoadingTimerRef = useRef(null);
    const sheetMetricsRef = useRef({ layoutH: 0, contentH: 0, offsetY: 0 });

    // ── Stable refs for values read in callbacks (avoids dep churn) ────────
    const selectedHobbiesRef = useRef(selectedHobbiesList);
    useEffect(() => {
        selectedHobbiesRef.current = selectedHobbiesList;
    }, [selectedHobbiesList]);

    const hobbyLimitRef = useRef(hobbyLimit);
    useEffect(() => {
        hobbyLimitRef.current = hobbyLimit;
    }, [hobbyLimit]);

    const pageRef = useRef(page);
    useEffect(() => { pageRef.current = page; }, [page]);

    const maxreachedRef = useRef(maxreached);
    useEffect(() => { maxreachedRef.current = maxreached; }, [maxreached]);

    const footerloadRef = useRef(footerload);
    useEffect(() => { footerloadRef.current = footerload; }, [footerload]);

    const hobbiesListRef = useRef(hobbiesList);
    useEffect(() => { hobbiesListRef.current = hobbiesList; }, [hobbiesList]);

    const hobbyTreeFetchGenRef = useRef(0);

    const visibleCategoriesCountRef = useRef(visibleCategoriesCount);
    useEffect(() => {
        visibleCategoriesCountRef.current = visibleCategoriesCount;
    }, [visibleCategoriesCount]);

    const activeSubcategorySectionsRef = useRef(activeSubcategorySections);
    useEffect(() => {
        activeSubcategorySectionsRef.current = activeSubcategorySections;
    }, [activeSubcategorySections]);

    // ── Selectors ──────────────────────────────────────────────────────────
    // NOTE: Avoid synchronous storage reads during render (they can block the UI thread).
    const userIDRef = useRef(null);
    const addressFilterRef = useRef(null);
    const { profile } = useSelector(profileSelector);

    const showHobbyLimitModal = useCallback(
        (limit) => {
            if (!isHobbyLimitEnforced(profile)) {
                return false;
            }
            setModalMsg(getHobbyLimitModalMessage(limit, t));
            setIsModalVisible(true);
            return true;
        },
        [profile, t],
    );

    const {
        filterBysearch,
        commonLocation,
        commonLocAdd,
        isOnline,
        changeCurrentLoc,
        changeTempLoc,
    } = useSelector(
        (state) => ({
            filterBysearch: state.helper.filterBysearch,
            commonLocation: state.helper.commonLocation,
            commonLocAdd: state.helper.commonLocAdd,
            isOnline: state.helper.isOnline,
            changeCurrentLoc: state.helper.changeCurrentLoc,
            changeTempLoc: state.helper.changeTempLoc,
        }),
        shallowEqual
    );
    const activeTab = "Chat";
    const didHandleDismissRef = useRef(false);
    const openedAtRef = useRef(Date.now());
    const filterScreenFocusedAtRef = useRef(Date.now());
    const allowGoBackOnDismissRef = useRef(false);
    const closeFilterRoute = useCallback(() => {
        if (didHandleDismissRef.current) return;
        didHandleDismissRef.current = true;
        allowGoBackOnDismissRef.current = true;
        Keyboard.dismiss();
        /** Drop map preview so it is not mistaken for a saved filter pin. */
        dispatch(update_ChangeTempLoc(""));
        // Prevent double-pop: if this modal route was already popped (Android back),
        // the sheet's `onDismiss` may still fire after un-focus.
        if (typeof navigation.isFocused === "function" && !navigation.isFocused()) return;
        if (typeof navigation.canGoBack === "function" && !navigation.canGoBack()) return;
        navigation.goBack();
    }, [navigation, dispatch]);

    // ── Per-tab storage keys (prevents cross-tab thrash/glitches) ──────────
    const tabKey = useCallback((base) => `${base}:${activeTab}`, []);
    const getLegacyOrTab = useCallback(
        (base) => {
            const v = GetItem(tabKey(base));
            if (v !== undefined && v !== null && v !== "") return v;
            if (base === "AdddressFilter") return null;
            const legacy = GetItem(base);
            // One-time migrate legacy -> tab-specific to stop future cross-tab churn.
            if (legacy !== undefined && legacy !== null && legacy !== "") {
                try { SetItem(tabKey(base), legacy); } catch { }
            }
            return legacy;
        },
        [tabKey]
    );

    // ── Cache helpers ──────────────────────────────────────────────────────

    const hydrateHobbiesFromCache = useCallback(() => {
        try {
            let cached = GetItem(HOBBIES_CACHE_KEY);
            const hasTree =
                cached &&
                typeof cached === "object" &&
                cached.version === HOBBIES_CACHE_SCHEMA_VERSION &&
                Array.isArray(cached.hobbiesList) &&
                cached.hobbiesList.length > 0;
            if (!hasTree) {
                const legacy = GetItem(HOBBIES_CACHE_LEGACY);
                const legacyOk =
                    legacy &&
                    typeof legacy === "object" &&
                    Array.isArray(legacy.hobbiesList) &&
                    legacy.hobbiesList.length > 0;
                if (legacyOk) {
                    cached = legacy;
                    try {
                        SetItem(HOBBIES_CACHE_KEY, { ...legacy });
                    } catch { }
                }
            }
            if (!cached || typeof cached !== "object") return false;
            const isFresh = Date.now() - (cached?.ts ?? 0) < HOBBIES_CACHE_TTL_MS;
            if (Array.isArray(cached?.hobbiesList) && cached.hobbiesList.length) {
                setHobbiesList(cached.hobbiesList);
                hobbiesLoadedRef.current = true;
                setHobbyLoading(false);
                applyHobbiesVisibility(cached.hobbiesList, false);
                setMaxreached(true);
            }
            if (Array.isArray(cached?.popularHobbies))
                setPopularHobbies(cached.popularHobbies);
            if (typeof cached?.hobbyLimit === "number")
                setHobbyLimit(cached.hobbyLimit);
            return isFresh && Array.isArray(cached?.hobbiesList) && cached.hobbiesList.length > 0;
        } catch {
            return false;
        }
    }, []);

    const persistHobbiesCache = useCallback((result) => {
        persistHobbiesCacheForTab("Chat", result);
    }, []);

    const applyHobbiesVisibility = useCallback((list, fullTree = false) => {
        const vis = fullTree
            ? buildFullHobbiesVisibility(list)
            : buildInitialHobbiesVisibility(list);
        setVisibleCategoriesCount(vis.visibleCategoriesCount);
        setVisibleHobbyCounts(vis.visibleHobbyCounts);
        setVisibleCategoryCounts(vis.visibleCategoryCounts);
    }, []);

    const scheduleHobbiesTreeMount = useCallback(() => {
        if (
            Array.isArray(hobbiesListRef.current) &&
            hobbiesListRef.current.length > 0
        ) {
            setRenderHobbiesTree(true);
            return;
        }
        hobbiesTreeMountTaskRef.current?.cancel?.();
        const task = InteractionManager.runAfterInteractions(() => {
            if (!isMountedRef.current) return;
            requestAnimationFrame(() => {
                if (isMountedRef.current) setRenderHobbiesTree(true);
            });
        });
        hobbiesTreeMountTaskRef.current = task;
    }, []);

    const unloadHobbiesTreeUi = useCallback(() => {
        hobbiesTreeMountTaskRef.current?.cancel?.();
        hobbiesTreeMountTaskRef.current = null;
        setRenderHobbiesTree(false);
        setAreAllOpen(false);
        setActiveSections([]);
        setActiveSubcategorySections({});
        setSelectedExpanded(true);
        setPopularExpanded(true);
        setOwnExpanded(false);
        hobbiesListPrimedRef.current = false;
    }, []);

    // ── Location helpers ───────────────────────────────────────────────────

    const isValidLocationObject = useCallback((loc) => {
        if (!loc || typeof loc !== "object") return false;
        const lat = Number(loc.lat ?? loc.latitude);
        const lng = Number(loc.long ?? loc.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
    }, []);

    const hydrateStoredLocation = useCallback((addr) => {
        try {
            if (!addr || typeof addr !== "object") {
                setLocation("");
                setRegion(null);
                return;
            }

            const alat = addr.lat ?? addr.latitude;
            const alng = addr.long ?? addr.longitude;
            if (
                alat == null ||
                alng == null ||
                Number.isNaN(Number(alat)) ||
                Number.isNaN(Number(alng))
            ) {
                setLocation("");
                setRegion(null);
                return;
            }

            const storedLat = Number(alat);
            const storedLng = Number(alng);
            const formatted_address = addr.formatted_address || "";

            setLocation({ latitude: storedLat, longitude: storedLng });
            setRegion({
                latitude: storedLat,
                longitude: storedLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            dispatch(
                update_ChangeCurrentLoc({
                    lat: storedLat,
                    long: storedLng,
                    latitude: storedLat,
                    longitude: storedLng,
                    formatted_address,
                })
            );
            addressFilterRef.current = addr;
        } catch { }
    }, [dispatch]);

    // ── Effects ────────────────────────────────────────────────────────────

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            cleanupFilterSheetOnUnmount({
                isMountedRef,
                presentScheduleTokenRef,
                presentCleanupRef,
                allowGoBackOnDismissRef,
            });
        };
    }, []);

    const schedulePresentSheet = useCallback(
        ({ updateOpenedAt = true, resetAccordion = true } = {}) => {
            scheduleFilterSheetPresent({
                sheetRef,
                isMountedRef,
                openedAtRef,
                presentScheduleTokenRef,
                presentCleanupRef,
                updateOpenedAt,
                resetAccordion,
                onResetAccordion: resetAccordion
                    ? () => {
                        setAreAllOpen(false);
                        setOwnExpanded(false);
                        setActiveSections([]);
                        setActiveSubcategorySections({});
                    }
                    : undefined,
            });
        },
        [],
    );

    // Mirror the latest Redux location into refs so the focus effect can
    // read the *current* value WITHOUT taking a callback dependency on
    // them. Otherwise every dispatch made by the focus effect itself
    // (`hydrateStoredLocation` → `update_ChangeCurrentLoc`) would change
    // the Redux value, change the callback identity, re-run the focus
    // effect, dispatch again, etc. → "Maximum update depth exceeded".
    const changeCurrentLocRef = useRef(changeCurrentLoc);
    const commonLocAddRef = useRef(commonLocAdd);
    useEffect(() => {
        changeCurrentLocRef.current = changeCurrentLoc;
    }, [changeCurrentLoc]);
    useEffect(() => {
        commonLocAddRef.current = commonLocAdd;
    }, [commonLocAdd]);

    // Track whether we have already triggered a one-shot bootstrap during
    // this focus session so the safety-net doesn't fire repeatedly while
    // GPS resolves.
    const bootstrapRequestedRef = useRef(false);

    // Present whenever this route is focused again (AsyncCommonFilterPage keeps the bundle mounted).
    // Intentionally no useFocusEffect cleanup that clears timers — transparentModal transitions can blur
    // focus for a frame and cancel present(), leaving the sheet permanently dismissed.
    useFocusEffect(
        useCallback(() => {
            didHandleDismissRef.current = false;
            allowGoBackOnDismissRef.current = false;
            filterScreenFocusedAtRef.current = Date.now();
            schedulePresentSheet({
                updateOpenedAt: true,
                resetAccordion: true,
            });
            scheduleHobbiesTreeMount();
            try {
                const genderValue = getLegacyOrTab("GenderFilter");
                const getDistance = getLegacyOrTab("RadiusFilter");
                const selecthobbies = getLegacyOrTab("hobbiesFilter");
                const selectAge = getLegacyOrTab("SelectAge");

                setValues(selectAge?.length > 0 ? selectAge : [18, 60]);
                setSelectedHobbiesList(selecthobbies?.length > 0 ? selecthobbies : []);
                setDistance(getDistance?.length > 0 ? getDistance : [50]);
                setGenderArray(
                    genderValue?.length > 0 ? genderValue : ["male", "female", "others"]
                );
            } catch { }

            // Re-read persisted map pin on every focus. The filter module often stays mounted
            // after goBack(), so the one-time `[storageReady]` restore does not run again and
            // the address line could fall back to device/profile unless we hydrate from MMKV.
            let restoredFromMmkv = false;
            try {
                const stored = getLegacyOrTab("AdddressFilter");
                addressFilterRef.current = stored;
                if (stored && typeof stored === "object") {
                    const alat = stored.lat ?? stored.latitude;
                    const alng = stored.long ?? stored.longitude;
                    if (
                        alat != null &&
                        alng != null &&
                        !Number.isNaN(Number(alat)) &&
                        !Number.isNaN(Number(alng))
                    ) {
                        hydrateStoredLocation(stored);
                        restoredFromMmkv = true;
                    }
                } else {
                    addressFilterRef.current = null;
                }
            } catch { }

            // If we have no saved filter pin AND Redux doesn't already hold
            // a usable location, fall back to the device GPS so the address
            // row never opens stuck on "Change Location". This runs once
            // per focus session via the ref guard so we never trigger an
            // update loop.
            if (!restoredFromMmkv && !bootstrapRequestedRef.current) {
                // Always re-read device GPS on focus (silent, no permission
                // prompt).  This catches the "mock-GPS toggled off mid-
                // session" case where Redux/MMKV would otherwise keep the
                // stale fake-GPS coords.  We use `silent: true` so the
                // address resolution runs in the background via the
                // self-healing effect (immediate coords still dispatched).
                bootstrapRequestedRef.current = true;
                bootstrapCurrentLocation(dispatch, {
                    requestIfNeeded: false,
                    silent: true,
                })
                    .catch(() => { })
                    .finally(() => {
                        setTimeout(() => {
                            bootstrapRequestedRef.current = false;
                        }, 0);
                    });
            }
        }, [
            schedulePresentSheet,
            getLegacyOrTab,
            hydrateStoredLocation,
            dispatch,
        ])
    );

    // Defer storage reads until after first paint to avoid blocking sheet open.
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                userIDRef.current = GetItem("UserId");
                addressFilterRef.current = getLegacyOrTab("AdddressFilter");
            } catch { }
            setStorageReady(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [getLegacyOrTab]);

    useEffect(() => {
        if (!storageReady) return;
        if (!hobbiesLoadedRef.current) {
            const cacheFresh = hydrateHobbiesFromCache();
            if (cacheFresh) {
                hobbiesLoadedRef.current = true;
                setIsLoading(false);
                setPageLoad(false);
                setHobbyLoading(false);
            } else if (visible !== false) {
                handlehobbysearch(1, "");
            }
        } else {
            setIsLoading(false);
            setPageLoad(false);
            setHobbyLoading(false);
        }
        const popularTask = InteractionManager.runAfterInteractions(() => {
            fetchPopularHobbies();
        });
        return () => {
            popularTask?.cancel?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, isOnline, storageReady]);

    // Restore filters from storage on mount
    useEffect(() => {
        if (!storageReady) return;
        const genderValue = getLegacyOrTab("GenderFilter");
        const getDistance = getLegacyOrTab("RadiusFilter");
        const selecthobbies = getLegacyOrTab("hobbiesFilter");
        const selectAge = getLegacyOrTab("SelectAge");

        setValues(selectAge?.length > 0 ? selectAge : [18, 60]);
        setSelectedHobbiesList(selecthobbies?.length > 0 ? selecthobbies : []);
        setDistance(getDistance?.length > 0 ? getDistance : [50]);
        setGenderArray(
            genderValue?.length > 0 ? genderValue : ["male", "female", "others"]
        );
        if (addressFilterRef.current) {
            hydrateStoredLocation(addressFilterRef.current);
        }

        const locationTask = InteractionManager.runAfterInteractions(() => {
            Getcurrentlocation();
        });
        return () => {
            if (renderLocation.current) clearTimeout(renderLocation.current);
            locationTask?.cancel?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageReady]);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => { isKeyboardVisibleRef.current = true; });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => { isKeyboardVisibleRef.current = false; });
        return () => {
            showSub?.remove?.();
            hideSub?.remove?.();
        };
    }, []);

    useEffect(() => {
        const tlat = changeTempLoc?.lat ?? changeTempLoc?.latitude;
        const tlng = changeTempLoc?.long ?? changeTempLoc?.longitude;
        const hasTemp =
            tlat != null &&
            tlng != null &&
            !Number.isNaN(Number(tlat)) &&
            !Number.isNaN(Number(tlng));
        const scopedStoredLoc = isValidLocationObject(addressFilterRef.current)
            ? addressFilterRef.current
            : null;
        const loc = hasTemp ? changeTempLoc : scopedStoredLoc;
        const lat = loc?.lat ?? loc?.latitude;
        const lng = loc?.long ?? loc?.longitude;
        if (
            loc == null ||
            loc === "" ||
            typeof loc !== "object" ||
            lat == null ||
            lng == null ||
            Number.isNaN(Number(lat)) ||
            Number.isNaN(Number(lng))
        ) {
            setLocation("");
            setRegion(null);
            addressFilterRef.current = null;
            return;
        }
        const latN = Number(lat);
        const lngN = Number(lng);
        setRegion({
            latitude: latN,
            longitude: lngN,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setLocation({ latitude: latN, longitude: lngN });
        if (hasTemp) {
            addressFilterRef.current = {
                ...(scopedStoredLoc || {}),
                ...changeTempLoc,
            };
        }
    }, [changeTempLoc, isValidLocationObject]);

    // ── Self-healing reverse-geocode ──────────────────────────────────────
    // The boot-time geocoder can fail (network blip, Google quota, etc.) and
    // leave `changeCurrentLoc.formatted_address` stuck on the "Current
    // location" placeholder.  Whenever we have valid coords but a placeholder
    // address, fire one more reverse-geocode request and write the result
    // back to Redux so the filter header shows the real street.  We track
    // "already tried" by lat/long so this never turns into a render loop.
    const geocodeAttemptRef = useRef("");
    useEffect(() => {
        const source =
            changeCurrentLoc && typeof changeCurrentLoc === "object"
                ? changeCurrentLoc
                : commonLocAdd && typeof commonLocAdd === "object"
                    ? commonLocAdd
                    : null;
        if (!source) return;

        const lat = Number(source.lat ?? source.latitude);
        const lng = Number(source.long ?? source.longitude);
        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            (lat === 0 && lng === 0)
        ) {
            return;
        }

        const address = source.formatted_address;
        // A Plus Code formatted address looks like "QGPC+HG Alathur, …".
        // Treat ONLY that pattern (or the literal placeholder) as "needs
        // re-fetch"; ordinary addresses that happen to contain "+" stay valid.
        const PLUS_CODE_PREFIX = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*/;
        const isPlaceholder =
            !address ||
            typeof address !== "string" ||
            address === "Current location" ||
            PLUS_CODE_PREFIX.test(address);

        if (!isPlaceholder) return;

        const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (geocodeAttemptRef.current === key) return;
        geocodeAttemptRef.current = key;

        let cancelled = false;
        (async () => {
            try {
                const resolved = await getaddressapi(lat, lng);
                if (cancelled) return;
                if (
                    typeof resolved === "string" &&
                    resolved &&
                    !PLUS_CODE_PREFIX.test(resolved) &&
                    resolved !== "Current location"
                ) {
                    const merged = {
                        ...source,
                        lat,
                        long: lng,
                        latitude: lat,
                        longitude: lng,
                        formatted_address: resolved,
                    };
                    dispatch(update_ChangeCurrentLoc(merged));
                    dispatch(update_CommonLocAdd(merged));
                    dispatch(update_CommonLocation(resolved));
                    try {
                        SetItem("currentLoc", merged);
                    } catch { }
                }
            } catch { }
        })();

        return () => {
            cancelled = true;
        };
    }, [changeCurrentLoc, commonLocAdd, dispatch]);

    const getSubcategoryHobbies = useCallback((subcategory) => {
        if (Array.isArray(subcategory?.Hobbies)) return subcategory.Hobbies;
        if (Array.isArray(subcategory?.hobbies)) return subcategory.hobbies;
        return [];
    }, []);

    const categoryHasNestedHobbies = useCallback(
        (category) =>
            Array.isArray(category?.subcategory) &&
            category.subcategory.some((sub) => getSubcategoryHobbies(sub).length > 0),
        [getSubcategoryHobbies],
    );

    // Expand-all effect (category accordion only; Own/Selected/Popular are separate)
    const mainAccordionSectionCount = useMemo(() => {
        const catShown = (hobbiesList ?? []).slice(0, visibleCategoriesCount).length;
        return onSearch ? 0 : catShown;
    }, [hobbiesList, visibleCategoriesCount, onSearch]);

    const applyExpandAll = useCallback(() => {
        setActiveSections(Array.from({ length: mainAccordionSectionCount }, (_, i) => i));
        const next = (hobbiesListRef.current ?? []).reduce((acc, category) => {
            acc[category._id] = category?.subcategory?.map((_, i) => i);
            return acc;
        }, {});
        setActiveSubcategorySections(next);
    }, [mainAccordionSectionCount]);

    useEffect(() => {
        if (!areAllOpen) return;
        applyHobbiesVisibility(hobbiesListRef.current, true);
        applyExpandAll();
    }, [areAllOpen, applyExpandAll, applyHobbiesVisibility]);

    useEffect(() => {
        const list = hobbiesList;
        if (!Array.isArray(list) || list.length === 0 || hobbiesListPrimedRef.current) {
            return;
        }
        hobbiesListPrimedRef.current = true;
        applyHobbiesVisibility(list, false);
        setRenderHobbiesTree(true);
        const first = list[0];
        if (!first?._id) return;
        if (!categoryHasNestedHobbies(first)) {
            const flat = Array.isArray(first.subcategory) ? first.subcategory : [];
            if (flat.length > 0) {
                setVisibleCategoryCounts((prev) => ({
                    ...prev,
                    [`${first._id}:flat`]: flat.length,
                }));
            }
            return;
        }
        const nestedCount = (first.subcategory ?? []).filter(
            (sub) => getSubcategoryHobbies(sub).length > 0,
        ).length;
        if (nestedCount <= 0) return;
        const openIdxs = Array.from({ length: nestedCount }, (_, i) => i);
        setActiveSubcategorySections({ [first._id]: openIdxs });
        setVisibleHobbyCounts((prev) => {
            const next = { ...prev };
            openIdxs.forEach((idx) => {
                const sub = first.subcategory?.[idx];
                if (!sub?._id) return;
                const total = getSubcategoryHobbies(sub).length;
                if (total > 0) next[`${first._id}:${sub._id}`] = total;
            });
            return next;
        });
    }, [
        hobbiesList,
        applyHobbiesVisibility,
        categoryHasNestedHobbies,
        getSubcategoryHobbies,
    ]);

    // ── Data fetching ──────────────────────────────────────────────────────

    /**
     * Fetch the full hobby tree in one request (page "all").
     * Inline search filters client-side from hobbiesList.
     */
    const handlehobbysearch = useCallback(
        async (_count, overrideSearch) => {
            const myGen = ++hobbyTreeFetchGenRef.current;
            try {
                setIsLoading(true);
                beginApi();
                const usedSearch =
                    typeof overrideSearch === "string" ? overrideSearch.trim() : "";
                const payload = buildHobbiesTreeFetchPayload(
                    userIDRef.current,
                    usedSearch
                );

                setPageLoad(true);
                setPage(1);
                if (
                    !Array.isArray(hobbiesListRef.current) ||
                    hobbiesListRef.current.length === 0
                ) {
                    setHobbyLoading(true);
                }

                const result = await hobbydatasearch(payload);
                if (myGen !== hobbyTreeFetchGenRef.current) {
                    return;
                }
                setHobbyLimit(result?.HobbyLimit ?? 5);

                if (result?.status) {
                    if (result?.data?.length > 0) {
                        setPopularHobbies(result?.PopularHobbies);
                        setHobbiesList(result.data);
                        applyHobbiesVisibility(result.data, false);
                        setMaxreached(true);
                        setRenderHobbiesTree(true);
                        if (usedSearch === "") persistHobbiesCache(result);
                    } else {
                        setHobbiesList([]);
                        setPopularHobbies([]);
                        setMaxreached(true);
                    }
                }
            } catch (err) {
                console.log("Error on handlehobbysearch:", err);
            } finally {
                setPageLoad(false);
                setFooterload(false);
                setSearchSheetFooterLoad(false);
                paginationAnchorYRef.current = null;
                endApi();
                setHobbyLoading(false);
                finishLoadingAfterPaint();
            }
        },
        [beginApi, endApi, finishLoadingAfterPaint, persistHobbiesCache, applyHobbiesVisibility]
    );

    const fetchPopularHobbies = useCallback(async () => {
        try {
            if (!isOnline) return;
            setIsLoading(true);
            beginApi();
            const payload = { userId: userIDRef.current, hobbyname: "", page: 1, limit: 5 };
            const result = await hobbydatasearch(payload);
            if (result?.status) {
                setPopularHobbies(result?.PopularHobbies || []);
                const existing = GetItem(HOBBIES_CACHE_KEY);
                SetItem(HOBBIES_CACHE_KEY, {
                    ts: Date.now(),
                    hobbiesList: Array.isArray(existing?.hobbiesList)
                        ? existing.hobbiesList
                        : [],
                    popularHobbies: result?.PopularHobbies ?? [],
                    hobbyLimit: result?.HobbyLimit ?? 5,
                });
            }
        } catch { }
        finally {
            endApi();
            finishLoadingAfterPaint();
        }
    }, [beginApi, endApi, finishLoadingAfterPaint, isOnline]);

    // ── Stable callbacks ───────────────────────────────────────────────────

    const handleRemoveInterest = useCallback((interest) => {
        setSelectedHobbiesList((prev) => {
            const data = prev.filter((h) => h?._id !== interest?._id);
            SetItem(tabKey("hobbiesFilter"), data);
            return data;
        });
    }, [tabKey]);

    // Ref-based check — does NOT subscribe to selectedHobbiesList state
    const isInterestAdded = useCallback(
        (subcategory) =>
            selectedHobbiesRef.current?.some((h) => h._id === subcategory._id),
        []
    );

    // Live check — subscribes to state (used in rendered lists)
    const isInterestAddedLive = useCallback(
        (subcategory) =>
            selectedHobbiesList?.some((h) => h._id === subcategory._id),
        [selectedHobbiesList]
    );

    const handlesetfn = useCallback(
        (subcategory) => {
            setSelectedHobbiesList((prev) => {
                const alreadyAdded = prev.some((h) => h?._id === subcategory._id);
                if (alreadyAdded) {
                    const data = prev.filter((h) => h?._id !== subcategory._id);
                    SetItem(tabKey("hobbiesFilter"), data);
                    return data;
                }
                const limit = hobbyLimitRef.current;
                if (prev.length >= limit && showHobbyLimitModal(limit)) {
                    return prev;
                }
                const data = [
                    ...prev,
                    { _id: subcategory._id, hobbyName: subcategory?.hobbyname },
                ];
                SetItem(tabKey("hobbiesFilter"), data);
                return data;
            });
        },
        [showHobbyLimitModal, tabKey]
    );

    // ── Slider callbacks ───────────────────────────────────────────────────
    const handleValuesChange = useCallback((v) => setValues(v), []);
    const handleValuesChangeFinish = useCallback(
        (v) => {
            SetItem(tabKey("SelectAge"), v);
        },
        [tabKey]
    );
    const handledistancechange = useCallback((v) => setDistance(v), []);
    const handleDistanceChangeFinish = useCallback(
        (v) => {
            SetItem(tabKey("RadiusFilter"), v);
        },
        [tabKey]
    );

    const onAgeFinishStable = useCallback((v) => {
        setValues(v);
        handleValuesChangeFinish(v);
    }, [handleValuesChangeFinish]);

    const onDistanceFinishStable = useCallback((v) => {
        setDistance(v);
        handleDistanceChangeFinish(v);
    }, [handleDistanceChangeFinish]);

    const onSliderDragStartStable = useCallback(() => {
        setIsSliderDragging(true);
    }, []);

    const onSliderDragEndStable = useCallback(() => {
        setIsSliderDragging(false);
    }, []);
    const handleCategorySectionChange = useCallback(
        (sectionIndexes) => {
            setActiveSections(sectionIndexes);
            const cats = hobbiesListRef.current ?? [];
            setActiveSubcategorySections((prev) => {
                const next = { ...prev };
                sectionIndexes.forEach((idx) => {
                    const category = cats[idx];
                    if (!category?._id) return;
                    if (!categoryHasNestedHobbies(category)) {
                        const flat = Array.isArray(category.subcategory)
                            ? category.subcategory
                            : [];
                        if (flat.length > 0) {
                            const key = `${category._id}:flat`;
                            setVisibleCategoryCounts((counts) => ({
                                ...counts,
                                [key]: flat.length,
                            }));
                        }
                        return;
                    }
                    const nestedCount = (category.subcategory ?? []).filter(
                        (sub) => getSubcategoryHobbies(sub).length > 0,
                    ).length;
                    if (nestedCount > 0 && !(next[category._id]?.length > 0)) {
                        next[category._id] = Array.from(
                            { length: nestedCount },
                            (_, i) => i,
                        );
                    }
                });
                return next;
            });
        },
        [categoryHasNestedHobbies, getSubcategoryHobbies],
    );
    const handleSubcategorySectionChange = useCallback(
        (categoryId, sectionIndexes) => {
            setActiveSubcategorySections((prev) => ({
                ...prev,
                [categoryId]: sectionIndexes,
            }));
            const category = (hobbiesListRef.current ?? []).find(
                (c) => c?._id === categoryId,
            );
            if (!category) return;
            setVisibleHobbyCounts((prev) => {
                let next = prev;
                for (const idx of sectionIndexes) {
                    const sub = category?.subcategory?.[idx];
                    if (!sub?._id) continue;
                    const key = `${categoryId}:${sub._id}`;
                    const total = getSubcategoryHobbies(sub).length;
                    if (total > 0 && (prev[key] ?? INITIAL_HOBBY_CHIPS) < total) {
                        if (next === prev) next = { ...prev };
                        next[key] = total;
                    }
                }
                return next;
            });
        },
        [getSubcategoryHobbies],
    );

    const toggleAllSections = useCallback(() => {
        setAreAllOpen((prev) => {
            if (prev) {
                if (collapseCleanupTimerRef.current) {
                    clearTimeout(collapseCleanupTimerRef.current);
                    collapseCleanupTimerRef.current = null;
                }
                // Collapse everything in one render (lighter + smoother).
                setActiveSections([]);
                setSelectedExpanded(false);
                setPopularExpanded(false);
                setOwnExpanded(false);
                // Defer clearing child accordions until the parent collapse animation settles.
                collapseCleanupTimerRef.current = setTimeout(() => {
                    setActiveSubcategorySections({});
                    collapseCleanupTimerRef.current = null;
                }, 220);
            } else {
                setSelectedExpanded(true);
                setPopularExpanded(true);
                setOwnExpanded(true);
            }
            return !prev;
        });
    }, []);

    useEffect(() => {
        return () => {
            if (collapseCleanupTimerRef.current) {
                clearTimeout(collapseCleanupTimerRef.current);
                collapseCleanupTimerRef.current = null;
            }
        };
    }, []);

    const handleOwnHobbies = useCallback(() => {
        try {
            if (ownHobbies) {
                setOwnHobbies(false);
                const profileHobbiesIds = profile?.hobbies?.map((d) => d?._id);
                setSelectedHobbiesList((prev) => {
                    const data = prev.filter((h) => !profileHobbiesIds?.includes(h?._id));
                    SetItem(tabKey("hobbiesFilter"), data);
                    return data;
                });
            } else {
                const limit = hobbyLimitRef.current;
                const subcategoryIds = profile?.hobbies?.map((d) => ({
                    _id: d?._id,
                    hobbyName: d?.hobbyname,
                }));
                const updated = [
                    ...selectedHobbiesRef.current,
                    ...subcategoryIds.filter(
                        (d) =>
                            !selectedHobbiesRef.current.some((h) => h?._id === d._id)
                    ),
                ];
                if (updated.length > limit && showHobbyLimitModal(limit)) {
                    return;
                }
                setOwnHobbies(true);
                SetItem(tabKey("hobbiesFilter"), updated);
                setSelectedHobbiesList(updated);
            }
        } catch (e) {
            console.log("Error on handleOwnHobbies:", e);
        }
    }, [ownHobbies, profile?.hobbies, showHobbyLimitModal, tabKey]);

    const handleSearchFunction = useCallback(() => {
        try {
            const selectedIds = selectedHobbiesRef.current?.map((d) => d?._id);
            const limit = hobbyLimitRef.current;

            if (selectedIds?.length > limit && showHobbyLimitModal(limit)) {
                return;
            }

            /**
             * Build the lat/long the search should run against.  We *intentionally*
             * read coords from multiple sources (and IGNORE whatever the address
             * label looks like) so a stale / placeholder "Current location" string
             * never causes us to drop the geo filter.
             *
             *   1. The pin the user is currently dragging on the map.
             *   2. Redux `changeCurrentLoc` (set by GPS bootstrap or map drag).
             *   3. Redux `commonLocAdd` (global app location).
             *   4. The MMKV-persisted filter pin (`AdddressFilter`).
             *   5. The MMKV-persisted device location (`currentLoc`).
             */
            const candidateSources = [
                changeTempLoc,
                addressFilterRef.current,
                commonLocAdd,
                GetItem("currentLoc"),
            ];
            let pickedLoc = null;
            let pickedLat = null;
            let pickedLng = null;
            for (const src of candidateSources) {
                if (!src || typeof src !== "object") continue;
                const sLat = src.lat ?? src.latitude;
                const sLng = src.long ?? src.longitude;
                const nLat = Number(sLat);
                const nLng = Number(sLng);
                if (
                    Number.isFinite(nLat) &&
                    Number.isFinite(nLng) &&
                    !(nLat === 0 && nLng === 0)
                ) {
                    pickedLoc = src;
                    pickedLat = nLat;
                    pickedLng = nLng;
                    break;
                }
            }

            const normalizedLatLong =
                pickedLat != null && pickedLng != null
                    ? {
                        ...(pickedLoc || {}),
                        lat: pickedLat,
                        long: pickedLng,
                        latitude: pickedLat,
                        longitude: pickedLng,
                        formatted_address:
                            pickedLoc?.formatted_address ??
                            (typeof commonLocation === "string"
                                ? commonLocation
                                : "") ??
                            "",
                    }
                    : null;

            const payload = {
                userId: userIDRef.current,
                hobbies: selectedIds,
                distance: distance[0],
                address: normalizedLatLong?.formatted_address,
                latLong: normalizedLatLong,
                activeTab,
            };

            // Diagnostic: leaves a one-line trail every time the user submits the
            // advanced filter so we can confirm coords / distance / hobbies
            // actually reach the backend.
            console.log("CommonFilterPage.Chat handleSearchFunction →", {
                latitude: normalizedLatLong?.latitude,
                longitude: normalizedLatLong?.longitude,
                distance: distance[0],
                hobbies: selectedIds,
                address: normalizedLatLong?.formatted_address,
            });

            if (activeTab === "People") {
                const genders = othersSelected
                    ? [...genderArray, otherGender]
                    : [...genderArray];
                if (genders.length === 0) {
                    ShowToast(t("SelectGender"));
                    return;
                }
                try {
                    SetItem(tabKey("GenderFilter"), genders);
                } catch { }
                payload.gender = genders;
                payload.agestart = values[0];
                payload.ageend = values[1];
            }

            if (selectedHobbiesRef.current?.length > 0) {
                try {
                    SetItem(tabKey("hobbiesFilter"), selectedHobbiesRef.current);
                    SetItem(tabKey("RadiusFilter"), distance);
                    SetItem(tabKey("SelectAge"), values);
                } catch { }
                if (
                    normalizedLatLong &&
                    typeof normalizedLatLong === "object" &&
                    (normalizedLatLong.lat ?? normalizedLatLong.latitude) !=
                    null &&
                    (normalizedLatLong.long ?? normalizedLatLong.longitude) !=
                    null
                ) {
                    try {
                        SetItem("AdddressFilter", normalizedLatLong);
                        SetItem(tabKey("AdddressFilter"), normalizedLatLong);
                        addressFilterRef.current = normalizedLatLong;
                    } catch { }
                    dispatch(update_ChangeCurrentLoc(normalizedLatLong));
                }
                dispatch(update_ChangeTempLoc(""));
                dispatch(update_CommonFilterPayload(payload));
                closeFilterRoute();
            } else {
                ShowToast(t("HobbiesRequired"));
            }
        } catch (e) {
            console.log("Error on handleSearchFunction:", e);
        }
    }, [
        genderArray,
        values,
        distance,
        otherGender,
        othersSelected,
        changeCurrentLoc,
        changeTempLoc,
        commonLocAdd,
        commonLocation,
        activeTab,
        tabKey,
        showHobbyLimitModal,
        dispatch,
        closeFilterRoute,
    ]);

    // ── Auto-load more (scroll-driven, using refs to avoid dep churn) ──────

    const maybeAutoLoadHobbies = useCallback(() => {
        const now = Date.now();
        if (now - lastAutoLoadRef.current < 400) return;
        lastAutoLoadRef.current = now;

        const startRevealLoading = () => {
            setRevealLoading(true);
            if (revealLoadingTimerRef.current)
                clearTimeout(revealLoadingTimerRef.current);
            revealLoadingTimerRef.current = setTimeout(
                () => setRevealLoading(false),
                450
            );
        };

        const hobbies = hobbiesListRef.current;
        const catCount = visibleCategoriesCountRef.current;

        // Reveal more hobbies while scrolling
        let didIncrease = false;
        if (Array.isArray(hobbies) && hobbies.length > 0) {
            const visible = hobbies.slice(0, catCount);
            const hobbyKeysToBump = [];
            const flatKeysToBump = [];

            for (const category of visible) {
                if (!category?._id) continue;
                const hasNested = !!category?.subcategory?.[0]?.Hobbies;
                if (hasNested) {
                    const openIdxs =
                        activeSubcategorySectionsRef.current?.[category._id] || [];
                    for (const idx of openIdxs) {
                        const sub = category?.subcategory?.[idx];
                        if (!sub?._id) continue;
                        const allHobbies = Array.isArray(sub?.Hobbies) ? sub.Hobbies : [];
                        hobbyKeysToBump.push({
                            key: `${category._id}:${sub._id}`,
                            total: allHobbies.length,
                        });
                    }
                } else {
                    const list = Array.isArray(category?.subcategory)
                        ? category.subcategory
                        : [];
                    flatKeysToBump.push({
                        key: `${category._id}:flat`,
                        total: list.length,
                    });
                }
            }

            if (hobbyKeysToBump.length > 0) {
                setVisibleHobbyCounts((prev) => {
                    let next = prev;
                    for (const { key, total } of hobbyKeysToBump) {
                        const shown = prev[key] ?? INITIAL_HOBBY_CHIPS;
                        if (shown < total) {
                            if (next === prev) next = { ...prev };
                            next[key] = Math.min(shown + HOBBY_REVEAL_STEP, total);
                            didIncrease = true;
                        }
                    }
                    return next;
                });
            }
            if (flatKeysToBump.length > 0) {
                setVisibleCategoryCounts((prev) => {
                    let next = prev;
                    for (const { key, total } of flatKeysToBump) {
                        const shown = prev[key] ?? INITIAL_HOBBY_CHIPS;
                        if (shown < total) {
                            if (next === prev) next = { ...prev };
                            next[key] = Math.min(shown + HOBBY_REVEAL_STEP, total);
                            didIncrease = true;
                        }
                    }
                    return next;
                });
            }
        }
        if (didIncrease) {
            startRevealLoading();
        }
    }, []);

    const handleHobbySheetScroll = useCallback(
        ({ nativeEvent }) => {
            if (!nativeEvent) return;
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            sheetMetricsRef.current = {
                layoutH: layoutMeasurement?.height ?? sheetMetricsRef.current.layoutH,
                contentH: contentSize?.height ?? sheetMetricsRef.current.contentH,
                offsetY: contentOffset?.y ?? sheetMetricsRef.current.offsetY,
            };
            const atBottom =
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 8;
            if (atBottom) maybeAutoLoadHobbies();
        },
        []
    );
    const handleHobbySheetLayout = useCallback(
        (e) => {
            const h = e?.nativeEvent?.layout?.height ?? 0;
            if (h <= 0) return;
            sheetMetricsRef.current.layoutH = h;
            const { contentH } = sheetMetricsRef.current;
            if (contentH > 0 && contentH <= h + 8) maybeAutoLoadHobbies();
        },
        []
    );

    const handleHobbySheetContentSizeChange = useCallback(
        (_, h) => {
            if (typeof h !== "number" || h <= 0) return;
            sheetMetricsRef.current.contentH = h;
            const { layoutH } = sheetMetricsRef.current;
            if (layoutH > 0 && h <= layoutH + 8) maybeAutoLoadHobbies();
        },
        []
    );

    // (Removed) handleSearchEndReached: was only for secondary search sheet pagination.

    // ── Location ───────────────────────────────────────────────────────────

    const requestLocationPermission = useCallback(async () => {
        try {
            const permission =
                Platform.OS === "ios"
                    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
            const result = await check(permission);
            if (result === RESULTS.DENIED) {
                const req = await request(permission);
                if (req === RESULTS.GRANTED) return true;
                Alert.alert(
                    t("PermissionDenied"),
                    t("Location_access _Please_enable_settings."),
                    [
                        { text: t("Cancel"), style: "cancel" },
                        { text: t("OpenSettings"), onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            } else if (result === RESULTS.GRANTED) {
                return true;
            } else if (
                result === RESULTS.BLOCKED ||
                result === RESULTS.LIMITED
            ) {
                Alert.alert(
                    t("PermissionBlocked"),
                    t("Location_access_blocked_Please_enable_settings"),
                    [
                        { text: t("Cancel"), style: "cancel" },
                        { text: t("OpenSettings"), onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            }
            return false;
        } catch {
            return false;
        }
    }, [t]);

    const Getcurrentlocation = useCallback(async () => {
        try {
            const storedAddr =
                addressFilterRef.current ?? getLegacyOrTab("AdddressFilter");
            if (storedAddr) {
                hydrateStoredLocation(storedAddr);
            }
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;
            if (
                activeTab === "People" ||
                activeTab === "Events" ||
                activeTab === "Chat"
            ) {
                dispatch(update_Islocationfilter(true));
            }
        } catch { }
    }, [
        requestLocationPermission,
        hydrateStoredLocation,
        activeTab,
        dispatch,
        getLegacyOrTab,
    ]);

    const handleRegionChangeComplete = useCallback(
        (region) => {
            const { latitude, longitude } = region;
            if (!firstRegionChangeHandled.current) {
                firstRegionChangeHandled.current = true;
                return;
            }
            if (renderLocation.current) clearTimeout(renderLocation.current);
            renderLocation.current = setTimeout(async () => {
                setLocation({ latitude, longitude });
                const address = await getaddressapi(latitude, longitude);
                // If the geocoder failed or returned a Plus Code we still want
                // the lat/long to flow to the rest of the app — fall back to a
                // friendly label so the filter never displays nothing.
                const PLUS_CODE_PREFIX = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*/;
                const safeAddress =
                    typeof address === "string" &&
                        address &&
                        !PLUS_CODE_PREFIX.test(address)
                        ? address
                        : "Current location";
                const addressData = {
                    lat: latitude,
                    long: longitude,
                    latitude,
                    longitude,
                    formatted_address: safeAddress,
                };
                dispatch(update_ChangeCurrentLoc(addressData));
                if (
                    activeTab === "People" ||
                    activeTab === "Activities" ||
                    activeTab === "Chat"
                ) {
                    dispatch(update_Islocationfilter(true));
                }
            }, 3000);
        },
        [activeTab, dispatch]
    );

    const handleNaigatePremium = useCallback(() => {
        setIsModalVisible(false);
        navigation.navigate("Premium");
    }, [navigation]);

    // ── Bottom sheet helpers ───────────────────────────────────────────────

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                pressBehavior="none"
                opacity={Platform.OS === "android" ? 0.5 : 0.35}
            />
        ),
        []
    );

    // (Removed) secondary hobby-search bottom sheet snapPoints/openSearchBox (inline search now).

    // ── Hobbies tree flattener (for search sheet) ──────────────────────────

    const flattenHobbiesTree = useCallback((tree) => {
        const out = [];
        const seen = new Set();
        const displayName = (h) => {
            if (typeof h?.hobbyname === "string" && h.hobbyname.trim())
                return h.hobbyname.trim();
            if (typeof h?.hobbyName === "string" && h.hobbyName.trim())
                return h.hobbyName.trim();
            return "";
        };
        const canonicalId = (h) => {
            const raw = h?._id ?? h?.id;
            return raw !== undefined && raw !== null ? String(raw) : "";
        };
        const push = (h) => {
            const id = canonicalId(h);
            const label = displayName(h);
            if (!id || !label || seen.has(id)) return;
            seen.add(id);
            out.push({ ...h, _id: h?._id ?? h?.id, hobbyname: label });
        };
        for (const category of tree ?? []) {
            for (const sub of category?.subcategory ?? []) {
                const nested = Array.isArray(sub?.Hobbies)
                    ? sub.Hobbies
                    : Array.isArray(sub?.hobbies)
                        ? sub.hobbies
                        : [];
                push(sub);
                for (const hobby of nested) push(hobby);
            }
        }
        return out;
    }, []);

    // ── Accordion header/content renders ──────────────────────────────────

    const renderHeader = useCallback(
        (section, index) => {
            const isActive = Array.isArray(activeSections) && activeSections.includes(index);
            return (
                <View style={styles.hobbySectionHeaderRow}>
                    <Text style={styles.para}>{section?.title}</Text>
                    <View style={styles.swaproundbox}>
                        <Icon
                            name={isActive ? "angle-up" : "angle-down"}
                            size={devicewidth * 0.04}
                            color="#fff"
                        />
                    </View>
                </View>
            );
        },
        [activeSections]
    );

    const renderContent = useCallback((section) => {
        const content = section?.content;
        return (
            <View style={{ paddingBottom: 8 }}>
                {typeof content === "function" ? content() : content}
            </View>
        );
    }, []);

    const renderSubcategoryHeader = useCallback(
        (section, _, isActive) => (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: "3%",
                    justifyContent: "space-between",
                }}
            >
                <Text
                    style={{
                        fontFamily: Fonts.Medium,
                        color: "#e3e6e4",
                        marginLeft: 20,
                        fontSize: RFValue(16),
                    }}
                >
                    {section.title}
                </Text>
                <View style={styles.swaproundbox}>
                    <Icon
                        name={isActive ? "angle-up" : "angle-down"}
                        size={devicewidth * 0.04}
                        color="#fff"
                    />
                </View>
            </View>
        ),
        []
    );

    const renderSubcategoryContent = useCallback((section) => {
        const content = section?.content;
        return (
            <View>{typeof content === "function" ? content() : content}</View>
        );
    }, []);

    // ── Search sheet FlatList renderItem ───────────────────────────────────

    const renderItem = useCallback(
        ({ item }) => {
            const added = isInterestAddedLive(item);
            return (
                <TouchableOpacity
                    onPress={() => handlesetfn(item)}
                    style={styles.genderItem}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text style={styles.genderText}>{item.hobbyname}</Text>
                        <View
                            style={{
                                width: devicewidth * 0.04,
                                height: devicewidth * 0.04,
                                borderRadius: (devicewidth * 0.15) / 2,
                                backgroundColor: added ? "#47db40" : "#fff",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: "2%",
                            }}
                        >
                            <Icon
                                name={added ? "check" : "plus"}
                                size={deviceheight * 0.0148}
                                color={c.black}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [isInterestAddedLive, handlesetfn]
    );

    // ── Accordion sections (split to minimise re-builds) ──────────────────

    const selectedContent = useMemo(
        () =>
            selectedHobbiesList?.length > 0 ? (
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        flexWrap: "wrap",
                        marginTop: "2%",
                        gap: 5,
                    }}
                >
                    {selectedHobbiesList.map((interest, index) => (
                        <SelectedHobbyPill
                            key={interest._id ?? index}
                            interest={interest}
                            onRemove={handleRemoveInterest}
                        />
                    ))}
                </View>
            ) : (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Text
                        style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}
                    >
                        {t("None_Selected")}
                    </Text>
                </View>
            ),
        [selectedHobbiesList, handleRemoveInterest, t]
    );

    const popularContent = useMemo(
        () =>
            popularHobbies?.length > 0 ? (
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        flexWrap: "wrap",
                        marginTop: "2%",
                        gap: 5,
                    }}
                >
                    {popularHobbies.map((interest) => (
                        <HobbyButton
                            key={interest._id}
                            hobby={interest}
                            isAdded={isInterestAddedLive(interest)}
                            onPress={handlesetfn}
                            containerStyle={styles.buttoncontainer2}
                            textStyle={styles.populartxt}
                        />
                    ))}
                </View>
            ) : (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Text
                        style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}
                    >
                        {t("None_Selected")}
                    </Text>
                </View>
            ),
        [popularHobbies, isInterestAddedLive, handlesetfn, t]
    );

    const ownHobbiesContent = useMemo(
        () =>
            profile?.hobbies?.length > 0 ? (
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        flexWrap: "wrap",
                        marginTop: "2%",
                        gap: 5,
                    }}
                >
                    {profile.hobbies.map((interest) => (
                        <HobbyButton
                            key={interest._id}
                            hobby={interest}
                            isAdded={isInterestAddedLive(interest)}
                            onPress={handlesetfn}
                            containerStyle={styles.buttoncontainer}
                            textStyle={styles.btntxt}
                        />
                    ))}
                </View>
            ) : (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Text
                        style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}
                    >
                        {t("None_Selected")}
                    </Text>
                </View>
            ),
        [profile?.hobbies, isInterestAddedLive, handlesetfn, t],
    );

    const categorySections = useMemo(
        () =>
            (hobbiesList ?? []).slice(0, visibleCategoriesCount).map((category) => ({
                title: category.category,
                content: () => (
                    <View>
                        {categoryHasNestedHobbies(category) ? (
                            <Accordion
                                sections={(category.subcategory ?? []).map((subcategory) => ({
                                    title: subcategory?.subcategory,
                                    content: () => {
                                        const key = `${category._id}:${subcategory._id}`;
                                        const shown =
                                            visibleHobbyCounts[key] ?? INITIAL_HOBBY_CHIPS;
                                        const hobbies = getSubcategoryHobbies(subcategory);
                                        return (
                                            <View style={{ marginTop: "2%" }}>
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                        flexWrap: "wrap",
                                                        gap: 5,
                                                    }}
                                                >
                                                    {hobbies.slice(0, shown).map((hobby) => (
                                                        <HobbyButton
                                                            key={hobby._id}
                                                            hobby={hobby}
                                                            isAdded={isInterestAddedLive(hobby)}
                                                            onPress={handlesetfn}
                                                            containerStyle={styles.buttoncontainer}
                                                            textStyle={styles.btntxt}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    },
                                }))}
                                activeSections={
                                    activeSubcategorySections[category._id] || []
                                }
                                renderHeader={renderSubcategoryHeader}
                                renderContent={renderSubcategoryContent}
                                onChange={(s) =>
                                    handleSubcategorySectionChange(category._id, s)
                                }
                                underlayColor={false}
                                expandMultiple={true}
                                duration={220}
                            />
                        ) : (
                            (() => {
                                const key = `${category._id}:flat`;
                                const shown =
                                    visibleCategoryCounts[key] ?? INITIAL_HOBBY_CHIPS;
                                const list = Array.isArray(category.subcategory)
                                    ? category.subcategory
                                    : [];
                                return (
                                    <View style={{ marginTop: "2%" }}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                gap: 5,
                                            }}
                                        >
                                            {list.slice(0, shown).map((hobby) => (
                                                <HobbyButton
                                                    key={hobby._id}
                                                    hobby={hobby}
                                                    isAdded={isInterestAddedLive(hobby)}
                                                    onPress={handlesetfn}
                                                    containerStyle={styles.buttoncontainer}
                                                    textStyle={styles.btntxt}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                );
                            })()
                        )}
                    </View>
                ),
            })),
        [
            hobbiesList,
            visibleCategoriesCount,
            activeSubcategorySections,
            isInterestAddedLive,
            handlesetfn,
            renderSubcategoryHeader,
            renderSubcategoryContent,
            handleSubcategorySectionChange,
            visibleHobbyCounts,
            visibleCategoryCounts,
            categoryHasNestedHobbies,
            getSubcategoryHobbies,
        ]
    );

    const filteredSections = onSearch ? [] : categorySections;
    const hasHobbies = Array.isArray(hobbiesList) && hobbiesList.length > 0;
    const showHobbiesInitialLoader =
        (isLoading || hobbyLoading) && !hasHobbies;
    const showHobbiesPaginationLoader =
        !onSearch &&
        (footerload ||
            revealLoading ||
            searchSheetFooterLoad ||
            (pageLoad && hasHobbies) ||
            (isLoading && hasHobbies && !pageLoad && !hobbyLoading));

    const searchInterestsFiltered = useMemo(() => {
        const flat = flattenHobbiesTree(hobbiesList);
        const q = (search ?? "").trim().toLowerCase();
        if (!q) return flat;
        return flat.filter((h) =>
            (h?.hobbyname ?? "").toLowerCase().includes(q)
        );
    }, [hobbiesList, search, flattenHobbiesTree]);

    const prevHasInlineResultsRef = useRef(false);
    useEffect(() => {
        const hasNow = String(search ?? "").trim().length > 0;
        if (hasNow !== prevHasInlineResultsRef.current) {
            prevHasInlineResultsRef.current = hasNow;
        }
    }, [search]);

    const handleInlineSearchSelect = useCallback(
        (item) => {
            handlesetfn(item);
            // Keep search open for multi-select; don't force-scroll to top.
        },
        [handlesetfn]
    );

    // ── Main sheet snap points (fixed height; never content-sized) ─────────
    const sheetSnapPoints = useMemo(() => ["95%"], []);

    const handleDismiss = useCallback(() => {
        if (!isMountedRef.current) return;
        if (typeof navigation.isFocused === "function" && !navigation.isFocused()) {
            return;
        }
        // If the sheet dismisses unexpectedly during mount/open animation,
        // don't pop the screen — immediately re-present to avoid "disappearing".
        const openedMsAgo = Date.now() - (openedAtRef.current || 0);
        if (
            !allowGoBackOnDismissRef.current &&
            openedMsAgo < COMMON_FILTER_EARLY_DISMISS_MS
        ) {
            schedulePresentSheet({
                updateOpenedAt: false,
                resetAccordion: false,
            });
            return;
        }
        closeFilterRoute();
    }, [closeFilterRoute, schedulePresentSheet, navigation]);

    const handleSheetAnimate = useCallback((fromIndex, toIndex) => {
        if (toIndex < fromIndex || toIndex === -1) {
            Keyboard.dismiss();
            setSearch("");
            setIsSearchFocused(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            hobbiesTreeMountTaskRef.current?.cancel?.();
        };
    }, []);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <BottomSheetModalProvider>
            <BottomSheetModal
                ref={sheetRef}
                index={0}
                animateOnMount={true}
                stackBehavior="push"
                snapPoints={sheetSnapPoints}
                enableDynamicSizing={false}
                animationConfigs={{
                    damping: 36,
                    stiffness: 180,
                    mass: 0.8,
                    overshootClamping: false,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                }}
                enablePanDownToClose={true}
                closeThreshold={0.05}
                enableBlurKeyboardOnGesture={true}
                onAnimate={handleSheetAnimate}
                onDismiss={handleDismiss}
                backgroundStyle={{ backgroundColor: c.secondary }}
                enableOverDrag={false}
                topInset={sheetTopInset}
                detached={false}
                enableContentPanningGesture={false}
                activeOffsetY={[-4, 4]}
                failOffsetX={[-24, 24]}
                enableHandlePanningGesture={true}
                handleStyle={{ height: 48 }}
                handleIndicatorStyle={{
                    backgroundColor: "gray",
                    width: 48,
                    height: 4,
                }}
                keyboardBehavior={
                    Platform.OS === "android" ? "fillParent" : "interactive"
                }
                /**
                 * CRITICAL FIX — keyboardBlurBehavior="restore" (was "none").
                 *
                 * "none" means when the sheet is dragged while the keyboard is open,
                 * the keyboard stays visible and fights the pan gesture — the two
                 * animation systems conflict and the sheet freezes / re-renders jankily.
                 *
                 * "restore" tells the library: dismiss the keyboard first, then let
                 * the sheet drag proceed smoothly.
                 */
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
                footerComponent={(footerProps) => (
                    <BottomSheetFooter {...footerProps} bottomInset={0}>
                        <View
                            style={[
                                styles.sheetFooter,
                                {
                                    paddingTop: 16,
                                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                                },
                            ]}
                        >
                            <Pressable
                                onPress={handleSearchFunction}
                                style={styles.searchBtnBottom}
                            >
                                <Text style={styles.searchBtnTextBottom}>
                                    {t("Search")}
                                </Text>
                            </Pressable>
                        </View>
                    </BottomSheetFooter>
                )}
            >
                <View style={styles.container}>

                    <View style={styles.scrollFrame}>
                        <BottomSheetScrollView
                            ref={mainScrollRef}
                            nestedScrollEnabled={true}
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                            }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="none"
                            scrollEventThrottle={32}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={!isSliderDragging}
                            overScrollMode="always"
                            bounces={true}
                            alwaysBounceVertical={false}
                            onScroll={(e) => {
                                lastMainScrollYRef.current = e?.nativeEvent?.contentOffset?.y ?? 0;
                                handleHobbySheetScroll(e);
                            }}
                            onLayout={handleHobbySheetLayout}
                            onContentSizeChange={handleHobbySheetContentSizeChange}
                            // enableFooterMarginAdjustment automatically injects padding equal
                            // to the BottomSheetFooter height so content isn't hidden under it.
                            // We do NOT add footerSpacer here — that would double-count and push
                            // the loader too far up into the invisible zone.
                            enableFooterMarginAdjustment={true}
                            style={{ flex: 1, marginTop: 0 }}
                            contentContainerStyle={{
                                paddingBottom: 12,
                            }}
                        >
                            <View style={{ width: "100%", paddingHorizontal: "2.5%" }}>
                                {activeTab === "People" && (
                                    <>
                                        <Text style={styles.title}>
                                            {t("Looking_to_Connect")}
                                        </Text>
                                        <View style={styles.genderbox}>
                                            {["male", "female", "others"].map((gen) => (
                                                <Pressable
                                                    key={gen}
                                                    style={[
                                                        styles.genderButton,
                                                        genderArray?.includes(gen) &&
                                                        styles.selectedGender,
                                                    ]}
                                                    onPress={() => {
                                                        const updated = genderArray?.includes(gen)
                                                            ? genderArray.filter((g) => g !== gen)
                                                            : [...genderArray, gen];
                                                        setGenderArray(updated);
                                                        SetItem(tabKey("GenderFilter"), updated);
                                                    }}
                                                >
                                                    <View style={styles.genderContent}>
                                                        <Text
                                                            style={[
                                                                styles.genderText,
                                                                genderArray?.includes(gen)
                                                                    ? styles.activegendertxt
                                                                    : styles.inactivegendertxt,
                                                            ]}
                                                        >
                                                            {t(
                                                                gen.charAt(0).toUpperCase() +
                                                                gen.slice(1)
                                                            )}
                                                        </Text>
                                                        {genderArray?.includes(gen) && (
                                                            <View style={styles.greenbox}>
                                                                <Icon
                                                                    name="check"
                                                                    size={deviceheight * 0.0148}
                                                                    color={c.black}
                                                                />
                                                            </View>
                                                        )}
                                                    </View>
                                                </Pressable>
                                            ))}
                                        </View>

                                        <FilterAgeDistanceSliders
                                            showAge={true}
                                            ageValues={values}
                                            distanceValues={distance}
                                            onAgeFinish={onAgeFinishStable}
                                            onDistanceFinish={onDistanceFinishStable}
                                            onSliderDragStart={onSliderDragStartStable}
                                            onSliderDragEnd={onSliderDragEndStable}
                                            t={t}
                                            styles={styles}
                                        />
                                    </>
                                )}

                                {(activeTab === "People" ||
                                    activeTab === "Chat" ||
                                    activeTab === "Activities") && (
                                        <>
                                            {activeTab !== "People" ? (
                                                <FilterAgeDistanceSliders
                                                    showAge={false}
                                                    ageValues={values}
                                                    distanceValues={distance}
                                                    onAgeFinish={onAgeFinishStable}
                                                    onDistanceFinish={onDistanceFinishStable}
                                                    onSliderDragStart={onSliderDragStartStable}
                                                    onSliderDragEnd={onSliderDragEndStable}
                                                    t={t}
                                                    styles={styles}
                                                />
                                            ) : null}

                                            <Pressable
                                                onPress={() => {
                                                    if (
                                                        !profile?.plan?.length ||
                                                        profile?.plan[0]?.isActive !== "started"
                                                    )
                                                        return;
                                                    const ml =
                                                        changeTempLoc?.lat ??
                                                        changeTempLoc?.latitude ??
                                                        addressFilterRef.current?.lat ??
                                                        addressFilterRef.current?.latitude ??
                                                        (typeof commonLocAdd === "object" ? commonLocAdd?.lat ?? commonLocAdd?.latitude : null) ??
                                                        GetItem("currentLoc")?.lat ??
                                                        GetItem("currentLoc")?.latitude;
                                                    const mg =
                                                        changeTempLoc?.long ??
                                                        changeTempLoc?.longitude ??
                                                        addressFilterRef.current?.long ??
                                                        addressFilterRef.current?.longitude ??
                                                        (typeof commonLocAdd === "object" ? commonLocAdd?.long ?? commonLocAdd?.longitude : null) ??
                                                        GetItem("currentLoc")?.long ??
                                                        GetItem("currentLoc")?.longitude;
                                                    const mapCoords =
                                                        ml != null &&
                                                            mg != null &&
                                                            !Number.isNaN(Number(ml)) &&
                                                            !Number.isNaN(Number(mg))
                                                            ? {
                                                                latitude: Number(ml),
                                                                longitude: Number(mg),
                                                            }
                                                            : location;
                                                    navigation.navigate("MapViewpage", {
                                                        from: activeTab,
                                                        setAddress: "commonFilterPage",
                                                        coordinates: mapCoords,
                                                    });
                                                }}
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                    marginTop: "3%",
                                                    marginBottom: "5%",
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                        position: "relative",
                                                        alignSelf: "flex-start",
                                                        alignItems: "center",
                                                        width: "100%",
                                                    }}
                                                >
                                                    {Images.location_Icon}
                                                    <Text style={styles.locationtxt}>
                                                        {/* Show whatever address we have, in priority order:
                                                        1. The pin the user is currently dragging
                                                        2. The applied filter / device GPS (changeCurrentLoc)
                                                        3. The global app location (commonLocAdd / commonLocation)
                                                        4. A friendly "Current location" label when we only have coords
                                                        5. Final placeholder "Change Location" when nothing exists */}
                                                        {changeTempLoc?.formatted_address ||
                                                            addressFilterRef.current?.formatted_address ||
                                                            (typeof commonLocAdd === "object" && commonLocAdd?.formatted_address) ||
                                                            (GetItem("currentLoc")?.formatted_address) ||
                                                            ((typeof commonLocAdd === "object" &&
                                                                ((commonLocAdd?.lat ?? commonLocAdd?.latitude) != null)) ||
                                                                ((GetItem("currentLoc")?.lat ?? GetItem("currentLoc")?.latitude) != null)
                                                                ? "Current location"
                                                                : t("ChangeLocation"))}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            <View style={styles.linebar2} />
                                        </>
                                    )}

                                {renderHobbiesTree ? (
                                    <>
                                        {/* Inline hobbies search */}
                                        <View style={{ marginTop: "3%", width: "100%" }}>
                                            <View
                                                ref={inlineSearchWrapRef}
                                                style={{
                                                    height: deviceheight * 0.05,
                                                    borderRadius: borderradius * 0.5,
                                                    borderColor: c.white,
                                                    borderWidth: 0.9,
                                                    justifyContent: "center",
                                                    paddingHorizontal: 12,
                                                    marginTop: "2%",
                                                }}
                                            >
                                                <BottomSheetTextInput
                                                    value={search}
                                                    onChangeText={setSearch}
                                                    placeholder={t("Search_Hobbies")}
                                                    placeholderTextColor={"#F7E5D0"}
                                                    style={[styles.inputtxtstyle, { width: "100%", paddingRight: 36 }]}
                                                    keyboardType="default"
                                                    onFocus={() => {
                                                        setIsSearchFocused(true);
                                                        // Give layout/keyboard a moment to settle before measuring.
                                                        setTimeout(() => {
                                                            scrollInlineSearchIntoView();
                                                        }, 50);
                                                    }}
                                                    onBlur={() => {
                                                        setIsSearchFocused(false);
                                                        restoreScrollAfterKeyboard();
                                                    }}
                                                />
                                                <Pressable
                                                    onPress={() => {
                                                        if (isSearchFocused || String(search ?? "").trim().length > 0) {
                                                            setSearch("");
                                                            Keyboard.dismiss();
                                                            setIsSearchFocused(false);
                                                        }
                                                    }}
                                                    style={{ position: "absolute", right: 12, alignSelf: "center" }}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    {isSearchFocused || String(search ?? "").trim().length > 0 ? (
                                                        <Icon name="xmark" size={deviceheight * 0.02} color={c.white} />
                                                    ) : (
                                                        Images.search
                                                    )}
                                                </Pressable>
                                            </View>

                                            {String(search ?? "").trim().length > 0 && (
                                                <View
                                                    style={{
                                                        marginTop: 10,
                                                        borderColor: "rgba(255,255,255,0.25)",
                                                        borderWidth: 1,
                                                        borderRadius: borderradius * 0.4,
                                                        overflow: "hidden",
                                                        // ~4.5 rows visible, then scroll
                                                        maxHeight: deviceheight * 0.058 * 4.5,
                                                    }}
                                                >
                                                    <BottomSheetScrollView
                                                        nestedScrollEnabled
                                                        keyboardShouldPersistTaps="handled"
                                                        showsVerticalScrollIndicator={true}
                                                        persistentScrollbar={true}
                                                    >
                                                        {(searchInterestsFiltered ?? [])
                                                            .slice(0, 80)
                                                            .map((item, idx) => {
                                                                const added = isInterestAddedLive(item);
                                                                return (
                                                                    <Pressable
                                                                        key={String(item?._id ?? idx)}
                                                                        onPress={() => handleInlineSearchSelect(item)}
                                                                        style={{
                                                                            height: deviceheight * 0.058,
                                                                            paddingHorizontal: 12,
                                                                            flexDirection: "row",
                                                                            alignItems: "center",
                                                                            justifyContent: "space-between",
                                                                            borderBottomWidth:
                                                                                idx ===
                                                                                    Math.min(
                                                                                        79,
                                                                                        (searchInterestsFiltered?.length ?? 0) - 1
                                                                                    )
                                                                                    ? 0
                                                                                    : 1,
                                                                            borderBottomColor:
                                                                                "rgba(255,255,255,0.12)",
                                                                        }}
                                                                    >
                                                                        <Text style={styles.genderText}>
                                                                            {item?.hobbyname}
                                                                        </Text>
                                                                        <View
                                                                            style={{
                                                                                width: devicewidth * 0.04,
                                                                                height: devicewidth * 0.04,
                                                                                borderRadius:
                                                                                    (devicewidth * 0.15) / 2,
                                                                                backgroundColor: added
                                                                                    ? "#47db40"
                                                                                    : "#fff",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                marginLeft: "2%",
                                                                            }}
                                                                        >
                                                                            <Icon
                                                                                name={added ? "check" : "plus"}
                                                                                size={deviceheight * 0.0148}
                                                                                color={c.black}
                                                                            />
                                                                        </View>
                                                                    </Pressable>
                                                                );
                                                            })}
                                                    </BottomSheetScrollView>
                                                </View>
                                            )}
                                        </View>

                                        {/* Own hobbies toggle */}
                                        <View
                                            style={{
                                                width: "100%",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginVertical: "2.5%",
                                            }}
                                        >
                                            {profile?.hobbies?.length > 0 && (
                                                <View
                                                    style={{
                                                        width: "100%",
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "flex-start",
                                                    }}
                                                >
                                                    <View style={{ flex: 1, marginTop: "3%" }}>
                                                        <Text
                                                            style={{
                                                                fontFamily: Fonts.Bold,
                                                                color: c.primary,
                                                                fontSize: RFValue(13),
                                                            }}
                                                        >
                                                            {" "}
                                                            {t("AddOwnHobbies")}{" "}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                fontFamily: Fonts.Bold,
                                                                color: c.white,
                                                                fontSize: RFValue(12),
                                                            }}
                                                        >
                                                            {" "}
                                                            {t("Add_hobbies_selected_in_your_profile")}{" "}
                                                        </Text>
                                                    </View>
                                                    <SwitchToggle
                                                        switchOn={ownHobbies}
                                                        onPress={handleOwnHobbies}
                                                        circleColorOff="#911687"
                                                        circleColorOn="#911687"
                                                        backgroundColorOn={c.primary}
                                                        backgroundColorOff={c.pink}
                                                        containerStyle={{
                                                            width: devicewidth * 0.16,
                                                            height: devicewidth * 0.07,
                                                            borderRadius: 100,
                                                            padding: devicewidth * 0.01,
                                                        }}
                                                        circleStyle={{
                                                            width: devicewidth * 0.05,
                                                            height: devicewidth * 0.05,
                                                            borderRadius: 100,
                                                        }}
                                                    />
                                                </View>
                                            )}
                                        </View>

                                        {/* Expand All (for Own + categories) */}
                                        {hasHobbies && (
                                            <View
                                                style={{
                                                    width: "100%",
                                                    flexDirection: "row",
                                                    paddingBottom: "3%",
                                                    paddingTop: "3%",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    backgroundColor: c.secondary,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontFamily: Fonts.Bold,
                                                        color: c.primary,
                                                        fontSize: RFValue(14),
                                                    }}
                                                >
                                                    {t("Expand_all")}
                                                </Text>
                                                <SwitchToggle
                                                    switchOn={areAllOpen}
                                                    onPress={toggleAllSections}
                                                    circleColorOff="#911687"
                                                    circleColorOn="#911687"
                                                    backgroundColorOn={c.primary}
                                                    backgroundColorOff={c.pink}
                                                    containerStyle={{
                                                        width: devicewidth * 0.16,
                                                        height: devicewidth * 0.07,
                                                        borderRadius: 100,
                                                        padding: devicewidth * 0.01,
                                                        marginLeft: 10,
                                                    }}
                                                    circleStyle={{
                                                        width: devicewidth * 0.05,
                                                        height: devicewidth * 0.05,
                                                        borderRadius: 100,
                                                    }}
                                                />
                                            </View>
                                        )}

                                        {/* Selected + Popular (collapsible headers) */}
                                        <View>
                                            <Pressable
                                                onPress={() => setSelectedExpanded((p) => !p)}
                                                style={styles.hobbySectionHeaderRow}
                                            >
                                                <Text style={styles.para}>{t("Selected hobbies")}</Text>
                                                <View style={styles.swaproundbox}>
                                                    <Icon
                                                        name={selectedExpanded ? "angle-up" : "angle-down"}
                                                        size={devicewidth * 0.04}
                                                        color="#fff"
                                                    />
                                                </View>
                                            </Pressable>
                                            <CollapsingHobbySection expanded={selectedExpanded} duration={220}>
                                                {selectedContent}
                                            </CollapsingHobbySection>
                                        </View>

                                        <View>
                                            <Pressable
                                                onPress={() => setPopularExpanded((p) => !p)}
                                                style={styles.hobbySectionHeaderRow}
                                            >
                                                <Text style={styles.para}>{t("Popular")}</Text>
                                                <View style={styles.swaproundbox}>
                                                    <Icon
                                                        name={popularExpanded ? "angle-up" : "angle-down"}
                                                        size={devicewidth * 0.04}
                                                        color="#fff"
                                                    />
                                                </View>
                                            </Pressable>
                                            <CollapsingHobbySection expanded={popularExpanded} duration={220}>
                                                {popularContent}
                                            </CollapsingHobbySection>
                                        </View>

                                        <View>
                                            <Pressable
                                                onPress={() => setOwnExpanded((p) => !p)}
                                                style={styles.hobbySectionHeaderRow}
                                            >
                                                <Text style={styles.para}>{t("Own Hobbies")}</Text>
                                                <View style={styles.swaproundbox}>
                                                    <Icon
                                                        name={ownExpanded ? "angle-up" : "angle-down"}
                                                        size={devicewidth * 0.04}
                                                        color="#fff"
                                                    />
                                                </View>
                                            </Pressable>
                                            <CollapsingHobbySection expanded={ownExpanded} duration={220}>
                                                {ownHobbiesContent}
                                            </CollapsingHobbySection>
                                        </View>

                                        <View
                                            style={styles.fixedContentContainer}
                                            onLayout={() => {
                                                // Accordion starts collapsed by default now.
                                            }}
                                        >
                                            {showHobbiesInitialLoader ? (
                                                <View style={styles.hobbiesInitialLoader}>
                                                    <ActivityIndicator
                                                        size="large"
                                                        color={c.white}
                                                    />
                                                </View>
                                            ) : null}
                                            {categorySections.length > 0 ? (
                                                <Accordion
                                                    key={`filter-cats-${categorySections.length}-${visibleCategoriesCount}`}
                                                    sections={filteredSections}
                                                    activeSections={activeSections}
                                                    renderHeader={renderHeader}
                                                    renderContent={renderContent}
                                                    onChange={handleCategorySectionChange}
                                                    underlayColor="transparent"
                                                    expandMultiple={true}
                                                    duration={220}
                                                />
                                            ) : !showHobbiesInitialLoader ? (
                                                <View
                                                    style={{
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        minHeight: 48,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontFamily: Fonts.Regular,
                                                            color: c.white,
                                                            fontSize: RFValue(16),
                                                        }}
                                                    >
                                                        {t("No_Data")}
                                                    </Text>
                                                </View>
                                            ) : null}
                                            {showHobbiesPaginationLoader ? (
                                                <View style={styles.endOfListLoader}>
                                                    <ActivityIndicator
                                                        size="large"
                                                        color={c.white}
                                                    />
                                                </View>
                                            ) : null}
                                        </View>
                                    </>
                                ) : (hobbyLoading || isLoading) && !hasHobbies ? (
                                    <HobbiesTreePlaceholder
                                        label={t("Loading_hobbies") || "Loading hobbies…"}
                                        styles={styles}
                                    />
                                ) : null}

                            </View>
                        </BottomSheetScrollView>
                    </View>

                    <GenderInputModal
                        visible={genderModalVisible}
                        onClose={() => {
                            setGenderModalVisible(false);
                            setOthersSelected(false);
                            setOtherGender("");
                        }}
                        onSubmit={() => {
                            if (otherGender?.length <= 0) setOthersSelected(false);
                            setGenderModalVisible(false);
                        }}
                        value={otherGender}
                        updateFn={setOtherGender}
                    />

                    {/* (Removed) Secondary hobby-search bottom sheet */}
                </View>
            </BottomSheetModal>

            <AlertPopup
                visible={isModalVisible}
                onSubmit={handleNaigatePremium}
                onClose={() => setIsModalVisible(false)}
            >
                {modalMsg}
            </AlertPopup>
        </BottomSheetModalProvider>
    );
};

export default CommonFilterPage;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.secondary,
    },
    fixedContentContainer: {
        width: "100%",
        minWidth: "100%",
        position: "relative",
    },
    hobbySectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: "3%",
        justifyContent: "space-between",
    },
    scrollFrame: {
        flex: 1,
        marginHorizontal: "2%",
        position: "relative",
    },
    hobbiesInitialLoader: {
        minHeight: 72,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    endOfListLoader: {
        minHeight: 72,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 8,
    },
    sheetFooter: {
        position: "relative",
        paddingHorizontal: "6%",
        paddingTop: 10,
        backgroundColor: c.secondary,
    },
    searchBtnBottom: {
        alignSelf: "center",
        width: "70%",
        backgroundColor: c.white,
        borderRadius: borderradius * 1.2,
        paddingVertical: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBtnTextBottom: {
        fontFamily: Fonts.SemiBold,
        color: c.secondary,
        fontSize: RFValue(15),
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15.5),
    },
    locationtxt: {
        width: "98%",
        fontFamily: Fonts.Bold,
        color: c.white,
        paddingLeft: 5,
        fontSize: RFValue(13.5),
    },
    genderbox: {
        width: "100%",
        height: deviceheight * 0.085,
        padding: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        borderColor: c.white,
        borderWidth: 1.8,
        backgroundColor: c.primary,
        marginTop: "3%",
    },
    genderButton: {
        flex: 1,
        marginHorizontal: "1%",
        paddingVertical: "2%",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        height: deviceheight * 0.065,
        borderRadius: borderradius * 0.6,
    },
    selectedGender: {
        backgroundColor: c.white,
    },
    activegendertxt: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(16),
        color: c.black,
        verticalAlign: "middle",
    },
    inactivegendertxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        verticalAlign: "middle",
        fontSize: RFValue(16),
    },
    lableHearder: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: "2%",
    },
    lablesubtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        flex: 0.7,
    },
    valueLabel: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "right",
        flex: 0.3,
    },
    linebar2: {
        width: "100%",
        padding: 2,
        borderRadius: 5,
        backgroundColor: c.intermediate,
        marginTop: "2%",
        marginBottom: "2%",
    },
    addcontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        alignSelf: "center",
        flexDirection: "row",
        marginBottom: "4%",
    },
    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
    },
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
        width: "90%",
    },
    buttoncontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        flexDirection: "row",
        marginBottom: "4%",
    },
    buttoncontainer2: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        alignSelf: "center",
        flexDirection: "row",
        marginBottom: "4%",
    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        minHeight: 20,
        marginRight: "4%",
    },
    populartxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        marginRight: "4%",
    },
    swaproundbox: {
        width: devicewidth * 0.058,
        height: devicewidth * 0.058,
        borderRadius: (devicewidth * 0.15) / 2,
        borderWidth: 1,
        borderColor: "#fff",
        marginLeft: "2%",
        alignItems: "center",
        justifyContent: "center",
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "90%",
        height: "100%",
    },
    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.grey,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    lessbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginLeft: 5,
    },
    selectedTrack: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 1,
    },
    unselectedTrack: {
        backgroundColor: "#E8E6EA",
        borderRadius: borderradius * 1,
    },
    track: { height: 7 },
    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    listText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        marginVertical: "2.5%",
        color: c.white,
    },
    selectItem: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    bottomSheetContent: {
        flex: 1,
        padding: "3%",
        marginTop: "3%",
    },
    searchcontainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: deviceheight * 0.057,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    genderItem: {
        paddingHorizontal: "1%",
        paddingVertical: "2%",
    },
    genderContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});
