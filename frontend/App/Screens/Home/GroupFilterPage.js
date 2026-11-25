

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    BottomSheetModalProvider,
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetFooter,
    BottomSheetTextInput,
    BottomSheetFlatList
} from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Keyboard } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_GroupFilter, update_HobbieList, update_NetworkVisible, update_GroupFilterHoobies, update_PopularHobbieList, update_statusbarcolor, update_EventFilterHoobies, update_ChatFilterHoobies, update_ProfileHobbies, update_HobbyLimit } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { hobbydataadd, hobbydatasearch } from "../../Actions/hooks";
import { GetItem, SetItem } from "../../Actions/localstorage";
import { Fetchprofile, profileSelector } from "../../Slices/profile";
import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import {
    getHobbyLimitModalMessage,
    isHobbyLimitEnforced,
} from "../../Actions/config";
import AlertPopup from "../../Components/AlertPopup";
import CollapsingHobbySection from "./CollapsingHobbySection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    cleanupFilterSheetOnUnmount,
    scheduleFilterSheetPresent,
} from "../../Utilities/filterSheetPresent";
import {
    buildHobbiesTreeFetchPayload,
    HOBBIES_CACHE_SCHEMA_VERSION,
    persistHobbiesCacheForTab,
} from "../../Utilities/hobbiesFilterCache";

/** Same top gap as CommonFilterPage.People */
const SHEET_TOP_INSET_FRAC = 0.05;
const GROUP_FILTER_EARLY_DISMISS_MS = 2400;
const GROUP_FILTER_FOCUS_DISMISS_GRACE_MS = 1800;

const GROUP_FILTER_HOBBIES_CACHE_KEY = "GroupFilterPage:HobbiesTree:v1";

/**
 * CommonFilterPage persists the tree under tab-specific keys; read any fresh copy so
 * Group / Event / Chat hobby sheets paint immediately (same UX as reopening filters).
 */
function readCachedHobbyTreeForGroupFilter() {
    try {
        const keys = [
            GROUP_FILTER_HOBBIES_CACHE_KEY,
            "CommonFilterPage:HobbiesTree:v1:People",
            "CommonFilterPage:HobbiesTree:v1:Chat",
            "CommonFilterPage:HobbiesTree:v1:Activities",
            "CommonFilterPage:HobbiesTree:v1",
        ];
        for (const k of keys) {
            const c = GetItem(k);
            if (
                c &&
                typeof c === "object" &&
                (c.version === HOBBIES_CACHE_SCHEMA_VERSION || !c.version) &&
                Array.isArray(c.hobbiesList) &&
                c.hobbiesList.length > 0
            ) {
                return {
                    hobbiesList: c.hobbiesList,
                    popularList: Array.isArray(c.popularHobbies) ? c.popularHobbies : [],
                    hobbyLimit: typeof c.hobbyLimit === "number" ? c.hobbyLimit : null,
                };
            }
        }
    } catch { }
    return null;
}

function cloneHobbySelections(list) {
    if (!Array.isArray(list)) return [];
    return list
        .map((item) => ({
            _id: item?._id,
            hobbyName: item?.hobbyName ?? item?.hobbyname,
        }))
        .filter((item) => item?._id != null);
}

function getSubcategoryHobbies(subcategory) {
    if (Array.isArray(subcategory?.Hobbies)) return subcategory.Hobbies;
    if (Array.isArray(subcategory?.hobbies)) return subcategory.hobbies;
    return [];
}

function isDirectHobbyItem(sub) {
    if (getSubcategoryHobbies(sub).length > 0) return false;
    return Boolean(sub?.hobbyname ?? sub?.hobbyName);
}

function categoryHasNestedHobbies(category) {
    return (
        Array.isArray(category?.subcategory) &&
        category.subcategory.some((sub) => getSubcategoryHobbies(sub).length > 0)
    );
}

const GroupfilterPage = () => {

    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { page } = route?.params || {};

    const [hobbiesBootstrap] = useState(() => readCachedHobbyTreeForGroupFilter());

    const sheetRef = useRef(null);
    const [activeSections, setActiveSections] = useState([]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion
    const [hobbieLimit, setHobbieLimit] = useState(
        () => hobbiesBootstrap?.hobbyLimit ?? null
    );
    const [pageLoad, setPageLoad] = useState(
        () => !(hobbiesBootstrap?.hobbiesList?.length > 0),
    );
    const [search, setSearch] = useState("")
    const [onSearch, setOnSearch] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [ownHobbies, setOwnHobbies] = useState(false)
    const [areAllOpen, setAreAllOpen] = useState(false);
    const [ownExpanded, setOwnExpanded] = useState(false);
    const [popularExpanded, setPopularExpanded] = useState(false);
    const [pageCount, setPageCount] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const userID = GetItem("UserId")

    const { groupFilterHoobies, eventFilterHoobies, chatFilterHoobies, popularHobbieList, hobbieList, isOnline, filterBysearch, profileHobbies, hobbyLimitCount } = useSelector(helperSelector)
    const { activeTab } = filterBysearch;
    const { profile } = useSelector(profileSelector);

    const [hobbiesList, setHobbiesList] = useState(
        () => hobbiesBootstrap?.hobbiesList ?? []
    );
    const [popularList, setPopularList] = useState(
        () => hobbiesBootstrap?.popularList ?? []
    );
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    const [hobbyLoading, setHobbyLoading] = useState(
        () => !(hobbiesBootstrap?.hobbiesList?.length > 0)
    );
    const hobbiesListRef = useRef(hobbiesBootstrap?.hobbiesList ?? []);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const bottomSheetRef = useRef(null);
    const [modalMsg, setModalMsg] = useState("");

    const didHandleDismissRef = useRef(false);
    const openedAtRef = useRef(Date.now());
    const filterScreenFocusedAtRef = useRef(Date.now());
    const allowGoBackOnDismissRef = useRef(false);
    const isMountedRef = useRef(true);
    const presentScheduleTokenRef = useRef(0);
    const presentCleanupRef = useRef(null);

    useEffect(() => {
        hobbiesListRef.current = hobbiesList;
    }, [hobbiesList]);

    const sheetTopInset = useMemo(
        () => Math.ceil(Math.max(deviceheight * SHEET_TOP_INSET_FRAC, insets.top + 8)),
        [insets.top]
    );

    const safeGoBack = useCallback(() => {
        if (didHandleDismissRef.current) return;
        didHandleDismissRef.current = true;
        allowGoBackOnDismissRef.current = true;
        Keyboard.dismiss();
        if (typeof navigation.isFocused === "function" && !navigation.isFocused()) return;
        if (typeof navigation.canGoBack === "function" && !navigation.canGoBack()) return;
        navigation.goBack();
    }, [navigation]);

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
                        setPopularExpanded(false);
                        setActiveSections([]);
                        setActiveSubcategorySections({});
                    }
                    : undefined,
            });
        },
        [],
    );

    const handleDismiss = useCallback(() => {
        if (!isMountedRef.current) return;
        if (typeof navigation.isFocused === "function" && !navigation.isFocused()) {
            return;
        }
        const openedMsAgo = Date.now() - (openedAtRef.current || 0);
        if (
            !allowGoBackOnDismissRef.current &&
            openedMsAgo < GROUP_FILTER_EARLY_DISMISS_MS
        ) {
            schedulePresentSheet({
                updateOpenedAt: false,
                resetAccordion: false,
            });
            return;
        }
        safeGoBack();
    }, [safeGoBack, schedulePresentSheet, navigation]);

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

    useEffect(() => {
        dispatch(update_statusbarcolor(c.primary));
        if (hobbiesBootstrap?.hobbiesList?.length > 0) {
            try {
                const cached = GetItem(GROUP_FILTER_HOBBIES_CACHE_KEY);
                const cacheFresh =
                    cached &&
                    Date.now() - (cached.ts ?? 0) <
                    12 * 60 * 60 * 1000;
                if (cacheFresh) {
                    setPageLoad(false);
                    setHobbyLoading(false);
                    return;
                }
            } catch { }
        }
        handlehobbysearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, page]);

    useEffect(() => {
        const subcategoryIds = profile?.hobbies?.map((data) => data?._id);
        let result = [];
        if (activeTab == 'Chat') {
            result = groupFilterHoobies?.filter((data) => subcategoryIds?.includes(data?._id)) ?? [];
        } else if (activeTab == "CreateGroup") {
            result = groupFilterHoobies?.filter((data) => subcategoryIds?.includes(data?._id)) ?? [];
        } else if (activeTab == "EventCreation") {
            result = eventFilterHoobies?.filter((data) => subcategoryIds?.includes(data?._id)) ?? [];
        }
        setOwnHobbies(result.length > 0);

        if (page == "group") {
            setSelectedHobbies(cloneHobbySelections(groupFilterHoobies));
        } else if (page == "event") {
            setSelectedHobbies(cloneHobbySelections(eventFilterHoobies));
        } else if (page == "chat") {
            setSelectedHobbies(cloneHobbySelections(chatFilterHoobies));
        } else if (page == "profile") {
            setSelectedHobbies(cloneHobbySelections(profileHobbies));
        }
    }, [page, groupFilterHoobies, eventFilterHoobies, chatFilterHoobies, profileHobbies, activeTab, profile?.hobbies]);

    const handleRemoveInterest = (interestId) => {

        const data = selectedHobbies?.filter(data => data?._id != interestId)
        setSelectedHobbies(data);

        // if (page == "group") {
        //     const data = groupFilterHoobies?.filter(id => id !== interestId)
        //     dispatch(update_GroupFilterHoobies(data));
        // }
        // else if (page == "event") {
        //     const data = eventFilterHoobies?.filter(id => id !== interestId)
        //     dispatch(update_EventFilterHoobies(data));
        // }
        // else if (page == "chat") {
        //     const data = chatFilterHoobies?.filter(id => id !== interestId)
        //     dispatch(update_ChatFilterHoobies(data));
        // }
        // else if (page == "profile") {
        //     const data = profileHobbies?.filter(id => id !== interestId)
        //     dispatch(update_ProfileHobbies(data));
        // }

    };

    const isInterestAdded = (subcategory) => {

        // return selectedHobbies?.includes(subcategory._id);

        return selectedHobbies?.some(hobby => hobby._id == subcategory._id);

        // if (page == "group") {
        //     return groupFilterHoobies?.includes(subcategory._id);
        // }
        // else if (page == "event") {
        //     return eventFilterHoobies?.includes(subcategory._id);
        // }
        // else if (page == "chat") {
        //     return chatFilterHoobies?.includes(subcategory._id);
        // }
        // else if (page == "profile") {
        //     return profileHobbies?.includes(subcategory._id);
        // }
    };

    const mainAccordionSectionCount = Array.isArray(hobbiesList)
        ? hobbiesList.length
        : 0;

    useEffect(() => {
        if (!Array.isArray(hobbiesList) || hobbiesList.length === 0) return;
        setActiveSections((prev) => (prev?.length > 0 ? prev : [0]));
        const first = hobbiesList[0];
        if (!first?._id) return;
        if (!categoryHasNestedHobbies(first)) return;
        const nestedCount = (first.subcategory ?? []).filter(
            (sub) => getSubcategoryHobbies(sub).length > 0,
        ).length;
        if (nestedCount <= 0) return;
        setActiveSubcategorySections((prev) => {
            if (prev[first._id]?.length > 0) return prev;
            return {
                ...prev,
                [first._id]: Array.from({ length: nestedCount }, (_, i) => i),
            };
        });
    }, [hobbiesList]);

    useEffect(() => {
        if (areAllOpen && hobbiesList?.length) {
            setActiveSections(
                Array.from({ length: mainAccordionSectionCount }, (_, i) => i)
            );
            const newActiveSubcategorySections = hobbiesList?.reduce((acc, category) => {
                const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
                if (subcategoryIndexes) {
                    acc[category._id] = subcategoryIndexes;
                }
                return acc;
            }, {});
            setActiveSubcategorySections(newActiveSubcategorySections);
        }
    }, [hobbiesList, areAllOpen, mainAccordionSectionCount])

    const handlehobbysearch = useCallback(async () => {
        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return;
            }
            if (apiCalled) return;
            setApiCalled(true);

            const payload = buildHobbiesTreeFetchPayload(userID, "");
            setPageLoad(true);
            setPageCount(1);
            setMaxreached(true);
            if (!hobbiesListRef.current?.length) {
                setHobbyLoading(true);
            }

            const result = await hobbydatasearch(payload);
            setHobbieLimit(result?.HobbyLimit);

            if (result?.status && result?.data?.length > 0) {
                setPopularList(result?.PopularHobbies ?? []);
                setHobbiesList(result.data);
                const cachePayload = {
                    version: HOBBIES_CACHE_SCHEMA_VERSION,
                    ts: Date.now(),
                    hobbiesList: result.data,
                    popularHobbies: result?.PopularHobbies ?? [],
                    hobbyLimit: result?.HobbyLimit ?? 5,
                };
                try {
                    SetItem(GROUP_FILTER_HOBBIES_CACHE_KEY, cachePayload);
                } catch { }
                persistHobbiesCacheForTab("People", result);
            } else {
                setHobbiesList([]);
                setPopularList([]);
            }
        } catch (err) {
            console.log("Error on handlehobbysearch: ", err);
        } finally {
            setPageLoad(false);
            setFooterload(false);
            setApiCalled(false);
            setHobbyLoading(false);
        }
    }, [dispatch, isOnline, userID]);

    const handlesetfn = (subcategory) => {
        const hobbyLimit = parseInt(hobbieLimit);

        if (selectedHobbies?.some(hobby => hobby?._id == subcategory._id)) {
            const data = selectedHobbies?.filter(data => data?._id !== subcategory._id);
            setSelectedHobbies(data);
        }
        else {
            const limit = hobbyLimit || 5;
            if (
                selectedHobbies?.length >= limit &&
                page != "profile" &&
                isHobbyLimitEnforced(profile)
            ) {
                setModalMsg(getHobbyLimitModalMessage(limit, t));
                setIsModalVisible(true);
                return;
            }

            let setData = {
                _id: subcategory._id,
                hobbyName: subcategory?.hobbyname ?? subcategory?.hobbyName,
            };
            const data = [...selectedHobbies, setData];
            setSelectedHobbies(data);
        }

        // if (page == "group") {

        //     if (groupFilterHoobies?.length >= hobbyLimit) {
        //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
        //         return;
        //     }
        //     if (groupFilterHoobies?.includes(subcategory._id)) {
        //         const data = groupFilterHoobies?.filter(id => id !== subcategory._id);
        //         dispatch(update_GroupFilterHoobies(data));
        //     }
        //     else {
        //         const data = [...groupFilterHoobies, subcategory._id];
        //         dispatch(update_GroupFilterHoobies(data));
        //     }
        // }
        // else if (page == "event") {
        //     if (eventFilterHoobies?.length >= hobbyLimit) {
        //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
        //         return;
        //     }
        //     if (eventFilterHoobies?.includes(subcategory._id)) {
        //         const data = eventFilterHoobies?.filter(id => id !== subcategory._id);
        //         dispatch(update_EventFilterHoobies(data));

        //     } else {
        //         const data = [...eventFilterHoobies, subcategory._id];
        //         dispatch(update_EventFilterHoobies(data));
        //     }
        // }
        // else if (page == "chat") {
        //     if (chatFilterHoobies?.length >= hobbyLimit) {
        //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
        //         return;
        //     }
        //     if (chatFilterHoobies?.includes(subcategory._id)) {
        //         const data = chatFilterHoobies?.filter(id => id !== subcategory._id);
        //         dispatch(update_ChatFilterHoobies(data));

        //     } else {
        //         const data = [...chatFilterHoobies, subcategory._id];
        //         dispatch(update_ChatFilterHoobies(data));
        //     }

        // }
        // else if (page == "profile") {
        //     if (profileHobbies?.length >= hobbyLimit) {
        //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
        //         return;
        //     }
        //     if (profileHobbies?.includes(subcategory._id)) {
        //         const data = profileHobbies?.filter(id => id !== subcategory._id);
        //         dispatch(update_ProfileHobbies(data));

        //     } else {
        //         const data = [...profileHobbies, subcategory._id];
        //         dispatch(update_ProfileHobbies(data));
        //     }
        // }

    };

    const [nestedActiveSections, setNestedActiveSections] = useState([]);

    const renderNestedContent = useCallback((section) => {
        if (Array.isArray(section.content)) {
            return (
                <Accordion
                    sections={section.content}
                    activeSections={nestedActiveSections}
                    renderHeader={renderNestedHeader}
                    renderContent={renderNestedContent}
                    onChange={setNestedActiveSections}
                    underlayColor="transparent"
                    expandMultiple={true}
                />
            );
        } else {
            return (
                <View style={{ padding: 10, }}>
                    <Text style={styles.finalContent}>{section.content}</Text>
                </View>
            );
        }
    }, []);

    const renderNestedHeader = useCallback((section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', }}>
            <Text style={styles.para}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), []);


    const handleCategorySectionChange = useCallback((sectionIndexes) => {
        setActiveSections(sectionIndexes);
        const cats = hobbiesList ?? [];
        setActiveSubcategorySections((prev) => {
            const next = { ...prev };
            sectionIndexes.forEach((idx) => {
                const category = cats[idx];
                if (!category?._id) return;
                const nestedCount = (category.subcategory ?? []).filter(
                    (sub) => getSubcategoryHobbies(sub).length > 0,
                ).length;
                if (nestedCount > 0 && !(next[category._id]?.length > 0)) {
                    next[category._id] = Array.from({ length: nestedCount }, (_, i) => i);
                }
            });
            return next;
        });
    }, [hobbiesList]);

    const handleSubcategorySectionChange = useCallback((categoryId, sections) => {

        setActiveSubcategorySections(prev => ({
            ...prev,
            [categoryId]: sections,
        }))
    }, []);

    const renderHeader = useCallback((section, _, isActive) => (
        <View style={styles.hobbySectionHeaderRow}>
            <Text style={styles.para}>{section?.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), []);

    const renderContent = useCallback((section) => {
        const content = section?.content;
        return (
            <View style={{ paddingBottom: 8 }}>
                {typeof content === "function" ? content() : content}
            </View>
        );
    }, []);

    const renderSubcategoryHeader = useCallback((section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
            <Text style={{
                fontFamily: Fonts.Medium,
                color: "#e3e6e4",
                marginLeft: 20,
                fontSize: RFValue(16),
            }}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), [])

    const renderSubcategoryContent = useCallback((section) => {
        const content = section?.content;
        return (
            <View>
                {typeof content === "function" ? content() : content}
            </View>
        );
    }, []);

    const renderHobbyPill = useCallback(
        (hobby, variant = "default") => (
            <Pressable
                key={String(hobby?._id)}
                style={variant === "popular" ? styles.buttoncontainer2 : styles.buttoncontainer}
                onPress={() => handlesetfn(hobby)}
            >
                <Text style={styles.btntxt}>{hobby?.hobbyname ?? hobby?.hobbyName}</Text>
                {isInterestAdded(hobby) ? (
                    <View style={styles.greenbox}>
                        <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                    </View>
                ) : (
                    <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                )}
            </Pressable>
        ),
        // handlesetfn / isInterestAdded read latest selectedHobbies via render closure each pass
        [selectedHobbies],
    );

    const renderCategoryBody = useCallback(
        (category) => {
            const subs = Array.isArray(category?.subcategory) ? category.subcategory : [];
            const directHobbies = subs.filter(isDirectHobbyItem);
            const hasNested = categoryHasNestedHobbies(category);
            const nestedSubs = hasNested
                ? subs.filter((sub) => getSubcategoryHobbies(sub).length > 0)
                : [];

            return (
                <View>
                    {directHobbies.length > 0 ? (
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 5,
                                marginTop: "2%",
                            }}
                        >
                            {directHobbies.map((hobby) => renderHobbyPill(hobby))}
                        </View>
                    ) : null}
                    {hasNested && nestedSubs.length > 0 ? (
                        <Accordion
                            sections={nestedSubs.map((subcategory) => ({
                                title:
                                    subcategory?.subcategory ??
                                    subcategory?.hobbyname ??
                                    "",
                                content: () => (
                                    <View style={{ marginTop: "2%" }}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                gap: 5,
                                            }}
                                        >
                                            {getSubcategoryHobbies(subcategory).map((hobby) =>
                                                renderHobbyPill(hobby),
                                            )}
                                        </View>
                                    </View>
                                ),
                            }))}
                            activeSections={activeSubcategorySections[category._id] || []}
                            renderHeader={renderSubcategoryHeader}
                            renderContent={renderSubcategoryContent}
                            onChange={(sectionIndexes) =>
                                handleSubcategorySectionChange(category._id, sectionIndexes)
                            }
                            underlayColor={false}
                            expandMultiple={true}
                            duration={220}
                        />
                    ) : null}
                    {!hasNested && subs.length > 0 ? (
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 5,
                                marginTop: "2%",
                            }}
                        >
                            {subs
                                .filter((sub) => sub?.hobbyname ?? sub?.hobbyName)
                                .map((hobby) => renderHobbyPill(hobby))}
                        </View>
                    ) : null}
                    {directHobbies.length === 0 &&
                        !(hasNested && nestedSubs.length > 0) &&
                        !(
                            !hasNested &&
                            subs.some((sub) => sub?.hobbyname ?? sub?.hobbyName)
                        ) ? (
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
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
                </View>
            );
        },
        [
            activeSubcategorySections,
            renderHobbyPill,
            renderSubcategoryHeader,
            renderSubcategoryContent,
            handleSubcategorySectionChange,
            t,
        ],
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
                    {profile.hobbies.map((interest) => renderHobbyPill(interest))}
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
                        {t("No_Data")}
                    </Text>
                </View>
            ),
        [profile?.hobbies, renderHobbyPill, t],
    );

    const popularHobbiesContent = useMemo(
        () =>
            popularList?.length > 0 ? (
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        flexWrap: "wrap",
                        marginTop: "2%",
                        gap: 5,
                    }}
                >
                    {popularList.map((interest) => renderHobbyPill(interest, "popular"))}
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
                        {t("No_Data")}
                    </Text>
                </View>
            ),
        [popularList, renderHobbyPill, t],
    );

    const categorySections = useMemo(
        () =>
            (hobbiesList ?? []).map((category) => ({
                title: category?.category ?? "",
                content: () => renderCategoryBody(category),
            })),
        [hobbiesList, renderCategoryBody],
    );

    const filteredSections = onSearch ? [] : categorySections;

    // const renderBackdrop = useCallback(
    //     (props) => (
    //         <BottomSheetBackdrop
    //             {...props}
    //             appearsOnIndex={1}
    //             animatedIndex={{
    //                 value: 1,
    //             }}
    //             opacity={Platform.OS == "android" ? 0.6 : 0.4}
    //         >
    //             <View style={{ height: "100%", alignItems: "center", justifyContent: "center" }} >
    //                 <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"large"} />
    //             </View>
    //         </BottomSheetBackdrop>
    //     ),
    //     []
    // )


    const handleFilterEvents = async () => {
        try {
            if (!selectedHobbies || selectedHobbies.length === 0) {
                ShowToast(t('Select_Hobbies_to_filter'));
                return;
            }

            if (page === "group") {
                dispatch(update_GroupFilterHoobies(selectedHobbies));
            } else if (page === "event") {
                dispatch(update_EventFilterHoobies(selectedHobbies));
            } else if (page === "chat") {
                dispatch(update_ChatFilterHoobies(selectedHobbies));
            } else if (page === "profile") {
                dispatch(update_ProfileHobbies(selectedHobbies));
            }

            safeGoBack();

        } catch (error) {
            console.log("Error on handleFilterEvents: ", error);
        }
    };


    const toggleAllSections = () => {
        if (areAllOpen) {
            setActiveSections([]);
            setActiveSubcategorySections({});
        } else {
            setActiveSections(
                Array.from({ length: mainAccordionSectionCount }, (_, i) => i)
            );
            const newActiveSubcategorySections = hobbiesList?.reduce((acc, category) => {
                const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
                if (subcategoryIndexes) {
                    acc[category._id] = subcategoryIndexes;
                }
                return acc;
            }, {});
            setActiveSubcategorySections(newActiveSubcategorySections);
        }
        setAreAllOpen(!areAllOpen);
    };


    const handleOwnHobbies = () => {
        if (ownHobbies) {
            setOwnHobbies(false);

            const profileHobbiesIds = profile?.hobbies?.map((data) => data?._id);
            const updatedGroupFilterHoobies = selectedHobbies?.filter((hobby) =>
                !profileHobbiesIds?.includes(hobby?._id)
            );

            setSelectedHobbies(updatedGroupFilterHoobies);

            // if (page == "group") {
            //     updatedGroupFilterHoobies = groupFilterHoobies?.filter((hobbyId) =>
            //         !profileHobbiesIds?.includes(hobbyId)
            //     );

            //     dispatch(update_GroupFilterHoobies(updatedGroupFilterHoobies))

            // }
            // else if (page == "event") {
            //     updatedGroupFilterHoobies = eventFilterHoobies?.filter((hobbyId) =>
            //         !profileHobbiesIds?.includes(hobbyId)
            //     );
            //     dispatch(update_EventFilterHoobies(updatedGroupFilterHoobies))
            // }
            // else if (page == "chat") {
            //     updatedGroupFilterHoobies = chatFilterHoobies?.filter((hobbyId) =>
            //         !profileHobbiesIds?.includes(hobbyId)
            //     );
            //     dispatch(update_ChatFilterHoobies(updatedGroupFilterHoobies))
            // }
            // else if (page == "profile") {
            //     updatedGroupFilterHoobies = profileHobbies?.filter((hobbyId) =>
            //         !profileHobbiesIds?.includes(hobbyId)
            //     );
            //     dispatch(update_ProfileHobbies(updatedGroupFilterHoobies))
            // }

        }
        else {
            const hobbyLimit = parseInt(hobbieLimit);

            const subcategoryIds = profile?.hobbies?.map((data) => ({
                _id: data?._id,
                hobbyName: data?.hobbyname,
            }));

            const updatedGroupFilterHoobies = [
                ...selectedHobbies,
                ...subcategoryIds.filter((data) =>
                    !selectedHobbies.some(hobby => hobby?._id == data._id)
                )
            ];


            const limit = hobbyLimit || 5;
            if (
                updatedGroupFilterHoobies?.length > limit &&
                isHobbyLimitEnforced(profile)
            ) {
                setModalMsg(getHobbyLimitModalMessage(limit, t));
                setIsModalVisible(true);
                return;
            }

            setOwnHobbies(true);
            setSelectedHobbies(updatedGroupFilterHoobies);

            // if (page == "group") {
            //     updatedGroupFilterHoobies = [
            //         ...groupFilterHoobies,
            //         ...subcategoryIds.filter((id) => !groupFilterHoobies.includes(id))
            //     ];

            //     if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
            //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
            //         return;
            //     }
            //     setOwnHobbies(true);

            //     dispatch(update_GroupFilterHoobies(updatedGroupFilterHoobies))

            // }
            // else if (page == "event") {
            //     updatedGroupFilterHoobies = [
            //         ...eventFilterHoobies,
            //         ...subcategoryIds.filter((id) => !eventFilterHoobies.includes(id))
            //     ];

            //     if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
            //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
            //         return;
            //     }
            //     setOwnHobbies(true);

            //     dispatch(update_EventFilterHoobies(updatedGroupFilterHoobies))

            // }
            // else if (page == "chat") {
            //     updatedGroupFilterHoobies = [
            //         ...chatFilterHoobies,
            //         ...subcategoryIds.filter((id) => !chatFilterHoobies.includes(id))
            //     ];

            //     if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
            //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
            //         return;
            //     }
            //     setOwnHobbies(true);
            //     dispatch(update_ChatFilterHoobies(updatedGroupFilterHoobies))
            // }
            // else if (page == "profile") {
            //     updatedGroupFilterHoobies = [
            //         ...profileHobbies,
            //         ...subcategoryIds.filter((id) => !profileHobbies.includes(id))
            //     ];

            //     if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
            //         ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
            //         return;
            //     }
            //     setOwnHobbies(true);
            //     dispatch(update_ProfileHobbies(updatedGroupFilterHoobies))
            // }
        }
    }


    const handleEndReached = async (nativeEvent) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        if (apiCalled) return;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached) {
            setFooterload(true);
            handlehobbysearch();
        } else {
            setFooterload(false);
        }
    }

    const handleUpdatedProfileHobbies = async () => {
        try {
            if (apiCalled) return;
            setApiCalled(true);

            if (selectedHobbies?.length == 0) {
                ShowToast(t('HobbiesRequired'));
                return;
            }

            let selectedIds = selectedHobbies?.map((data) => data?._id)

            let payload = {
                "HobbiesId": selectedIds,
                "userId": userID,
                "type": "edit",
            }

            const result = await hobbydataadd(payload);

            ShowToast(result?.message)
            if (result?.status) {
                dispatch(update_ProfileHobbies([]));
                dispatch(Fetchprofile(userID))
            }

            safeGoBack();

        } catch (error) {
            console.log("Error on handleUpdatedProfileHobbies: ", error);
        }
        finally {
            setApiCalled(false);
        }
    }

    // const filteredHobbies = useMemo(() => {
    //     const result = [];

    //     hobbiesList.forEach(category => {
    //         category.subcategory?.forEach(sub => {
    //             // Nested hobbies
    //             if (Array.isArray(sub.Hobbies)) {
    //                 sub.Hobbies.forEach(hobby => {
    //                     if (hobby.hobbyname.toLowerCase().includes(search.toLowerCase())) {
    //                         result.push({
    //                             _id: hobby._id,
    //                             hobbyname: hobby.hobbyname,
    //                             originalData: hobby
    //                         });
    //                     }
    //                 });
    //             }

    //             // Direct hobby
    //             if (sub.hobbyname && sub.hobbyname.toLowerCase().includes(search.toLowerCase())) {
    //                 result.push({
    //                     _id: sub._id,
    //                     hobbyname: sub.hobbyname,
    //                     originalData: sub
    //                 });
    //             }
    //         });
    //     });

    //     return result;
    // }, [hobbiesList, search]);

    // // Render item function
    // const renderItem = ({ item }) => (
    //     <TouchableOpacity
    //         key={item._id}
    //         onPress={() => handlesetfn(item.originalData)}
    //         style={styles.genderItem}
    //     >
    //         <Text style={styles.genderText}>{item.hobbyname}</Text>
    //     </TouchableOpacity>
    // );

    const handleNaigatePremium = async () => {
        setIsModalVisible(false)
        navigation.navigate("Premium")
    }




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

    const sheetSnapPoints = useMemo(() => ["95%"], []);

    useFocusEffect(
        useCallback(() => {
            didHandleDismissRef.current = false;
            allowGoBackOnDismissRef.current = false;
            filterScreenFocusedAtRef.current = Date.now();
            schedulePresentSheet({
                updateOpenedAt: true,
                resetAccordion: true,
            });
        }, [schedulePresentSheet]),
    );

    const openSearchBox = () => {
        setIsBottomSheetVisible(true);
        bottomSheetRef.current.present();
    };

    const inlineResultsVisible = String(search ?? "").trim().length > 0;

    /** Match CommonFilterPage: clear search when sheet is pulled closed / dismissed. */
    const handleSheetAnimate = useCallback((fromIndex, toIndex) => {
        if (toIndex < fromIndex || toIndex === -1) {
            Keyboard.dismiss();
            setSearch("");
            setIsSearchFocused(false);
        }
    }, []);

    const filteredHobbies = useMemo(() => {
        const result = [];
        const query = String(search ?? "").trim().toLowerCase();
        if (!query) return result;

        (hobbiesList ?? []).forEach(category => {
            (category?.subcategory ?? []).forEach(sub => {
                getSubcategoryHobbies(sub).forEach(hobby => {
                    const name = hobby?.hobbyname ?? hobby?.hobbyName ?? "";
                    if (name.toLowerCase().includes(query)) {
                        result.push({
                            _id: hobby._id,
                            hobbyname: name,
                            originalData: hobby,
                        });
                    }
                });

                const subName = sub?.hobbyname ?? sub?.hobbyName ?? "";
                if (subName && subName.toLowerCase().includes(query)) {
                    result.push({
                        _id: sub._id,
                        hobbyname: subName,
                        originalData: sub,
                    });
                }
            });
        });

        return result;
    }, [hobbiesList, search]);




    // Render item function
    const renderItem = ({ item }) => (

        <TouchableOpacity
            key={item._id}
            onPress={() => handlesetfn(item.originalData)}
            style={styles.genderItem}
        >
            <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between' }}>
                <Text style={styles.genderText}>{item.hobbyname} </Text>
                <View style={{ flexDirection: "row", }}>
                    {isInterestAdded(item?.originalData ?? item) ? (
                        <View style={{
                            width: devicewidth * 0.04,
                            height: devicewidth * 0.04,
                            borderRadius: (devicewidth * 0.15) / 2,
                            backgroundColor: "#47db40",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "2%"
                        }}>
                            <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                        </View>
                    ) : (
                        <View style={{
                            width: devicewidth * 0.04,
                            height: devicewidth * 0.04,
                            borderRadius: (devicewidth * 0.15) / 2,
                            backgroundColor: "#fff",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "2%"
                        }}>
                            <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                        </View>
                    )}
                </View>
            </View>

        </TouchableOpacity>
    );


    return (
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <BottomSheetModalProvider>
                <BottomSheetModal
                    ref={sheetRef}
                    index={0}
                    animateOnMount={true}
                    snapPoints={sheetSnapPoints}
                    enableDynamicSizing={false}
                    stackBehavior="push"
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
                    keyboardBlurBehavior="restore"
                    android_keyboardInputMode="adjustResize"
                    /**
                     * Avoid "interactive" (iOS) and "fillParent" (Android): both reposition the sheet when
                     * the keyboard opens (fillParent snaps to y=0). "extend" keeps the snap and grows the
                     * sheet to clear the keyboard — no small jump toward the top on Search Hobbies focus.
                     */
                    keyboardBehavior="extend"
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={false}
                    topInset={sheetTopInset}
                    detached={false}
                    enableContentPanningGesture={false}
                    activeOffsetY={[-4, 4]}
                    failOffsetX={[-24, 24]}
                    enableHandlePanningGesture={true}
                    handleIndicatorStyle={{ backgroundColor: "gray", width: 48, height: 4 }}
                    handleStyle={{ height: 48 }}
                    onDismiss={handleDismiss}
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
                                    style={styles.submitBtnBottom}
                                    onPress={() =>
                                        !hobbyLoading && page == "profile"
                                            ? handleUpdatedProfileHobbies()
                                            : handleFilterEvents()
                                    }
                                >
                                    <Text style={styles.submitBtnTextBottom}>{t("Submit")}</Text>
                                </Pressable>
                            </View>
                        </BottomSheetFooter>
                    )}
                >
                    <View style={styles.container}>
                        <BottomSheetScrollView
                            nestedScrollEnabled={true}
                            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                            onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                            scrollEventThrottle={32}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="none"
                            scrollEnabled={true}
                            overScrollMode="always"
                            bounces={true}
                            alwaysBounceVertical={true}
                            enableFooterMarginAdjustment={true}
                            style={{ flex: 1, marginTop: 0 }}
                            contentContainerStyle={{
                                paddingBottom: 12,
                            }}
                        >
                            <View style={styles.scrollFrame}>
                                <View style={styles.sheetHeaderRow}>
                                    <View>
                                        <Text style={styles.sheetTitle}>{t("Hobbies")}</Text>
                                        <View style={styles.linebar} />
                                    </View>
                                </View>

                                <View style={{ width: "100%", paddingHorizontal: "2.5%" }}>
                                    <View style={styles.inlineSearchWrap}>
                                        <BottomSheetTextInput
                                            value={search}
                                            onChangeText={setSearch}
                                            placeholder={t("Search_Hobbies")}
                                            placeholderTextColor={"#F7E5D0"}
                                            style={[styles.inputtxtstyle, { width: "100%", paddingRight: 36 }]}
                                            keyboardType="default"
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setIsSearchFocused(false)}
                                            returnKeyType="done"
                                            onSubmitEditing={Keyboard.dismiss}
                                        />
                                        <Pressable
                                            onPress={() => {
                                                if (isSearchFocused || inlineResultsVisible) {
                                                    setSearch("");
                                                    Keyboard.dismiss();
                                                    setIsSearchFocused(false);
                                                }
                                            }}
                                            style={styles.inlineSearchIconBtn}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            {isSearchFocused || inlineResultsVisible ? (
                                                <Icon name="xmark" size={deviceheight * 0.02} color={c.white} />
                                            ) : (
                                                Images.search
                                            )}
                                        </Pressable>
                                    </View>

                                    {inlineResultsVisible && (
                                        <View style={styles.inlineResultsBox}>
                                            <BottomSheetScrollView
                                                nestedScrollEnabled
                                                keyboardShouldPersistTaps="handled"
                                                showsVerticalScrollIndicator={true}
                                                persistentScrollbar={true}
                                            >
                                                {(filteredHobbies ?? []).slice(0, 120).map((item, idx) => {
                                                    const added = isInterestAdded(item?.originalData);
                                                    return (
                                                        <Pressable
                                                            key={String(item?._id ?? idx)}
                                                            onPress={() => handlesetfn(item?.originalData)}
                                                            style={[
                                                                styles.inlineResultRow,
                                                                idx === Math.min(119, (filteredHobbies?.length ?? 0) - 1)
                                                                    ? { borderBottomWidth: 0 }
                                                                    : null,
                                                            ]}
                                                        >
                                                            <Text style={styles.inlineResultText}>
                                                                {item?.hobbyname}
                                                            </Text>
                                                            <View style={styles.inlineResultIconWrap}>
                                                                {added ? (
                                                                    <View style={styles.inlineResultCheck}>
                                                                        <Icon
                                                                            name="check"
                                                                            size={deviceheight * 0.0148}
                                                                            color={c.black}
                                                                        />
                                                                    </View>
                                                                ) : (
                                                                    <View style={styles.inlineResultPlus}>
                                                                        <Icon
                                                                            name="plus"
                                                                            size={deviceheight * 0.0148}
                                                                            color={c.black}
                                                                        />
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </Pressable>
                                                    );
                                                })}
                                            </BottomSheetScrollView>
                                        </View>
                                    )}

                                    <View style={{ marginTop: "2%" }}>
                                        <View style={styles.rowBetween}>
                                            <Pressable onPress={toggleAllSections} style={{ alignItems: "flex-end" }}>
                                                <Text style={styles.toggleLabel}>{t("Expand_all")}</Text>
                                            </Pressable>
                                            <SwitchToggle
                                                switchOn={areAllOpen}
                                                onPress={toggleAllSections}
                                                circleColorOff="#911687"
                                                circleColorOn="#911687"
                                                backgroundColorOn={c.primary}
                                                backgroundColorOff={c.pink}
                                                containerStyle={styles.switchContainer}
                                                circleStyle={styles.switchCircle}
                                            />
                                        </View>

                                        {page != "profile" && (
                                            <View style={styles.rowBetween}>
                                                <Pressable onPress={handleOwnHobbies} style={{ alignItems: "flex-end" }}>
                                                    <Text style={styles.toggleLabel}>{t("Add_own_hobbies")}</Text>
                                                </Pressable>
                                                <SwitchToggle
                                                    switchOn={ownHobbies}
                                                    onPress={handleOwnHobbies}
                                                    circleColorOff="#911687"
                                                    circleColorOn="#911687"
                                                    backgroundColorOn={c.primary}
                                                    backgroundColorOff={c.pink}
                                                    containerStyle={styles.switchContainer}
                                                    circleStyle={styles.switchCircle}
                                                />
                                            </View>
                                        )}

                                        {selectedHobbies?.length > 0 ? (
                                            <View style={styles.selectedWrap}>
                                                {selectedHobbies?.map((interest, index) => (
                                                    <Pressable
                                                        key={String(interest?._id ?? index)}
                                                        style={styles.addcontainer}
                                                        onPress={() => handleRemoveInterest(interest?._id)}
                                                    >
                                                        <Text style={styles.addbtntxt}>{interest?.hobbyName} </Text>
                                                        <View style={styles.lessbox}>
                                                            <Icon
                                                                name="minus"
                                                                size={deviceheight * 0.0158}
                                                                color="#fff"
                                                            />
                                                        </View>
                                                    </Pressable>
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
                                                    {t("No_Data")}
                                                </Text>
                                            </View>
                                        )}

                                        <View>
                                            <Pressable
                                                onPress={() => setOwnExpanded((p) => !p)}
                                                style={styles.hobbySectionHeaderRow}
                                            >
                                                <Text style={styles.para}>{t("OwnHobbies")}</Text>
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

                                        <View>
                                            <Pressable
                                                onPress={() => setPopularExpanded((p) => !p)}
                                                style={styles.hobbySectionHeaderRow}
                                            >
                                                <Text style={styles.para}>{t("Popularhobbies")}</Text>
                                                <View style={styles.swaproundbox}>
                                                    <Icon
                                                        name={
                                                            popularExpanded ? "angle-up" : "angle-down"
                                                        }
                                                        size={devicewidth * 0.04}
                                                        color="#fff"
                                                    />
                                                </View>
                                            </Pressable>
                                            <CollapsingHobbySection expanded={popularExpanded} duration={220}>
                                                {popularHobbiesContent}
                                            </CollapsingHobbySection>
                                        </View>

                                        <View style={styles.fixedContentContainer}>
                                            {hobbyLoading && !(hobbiesList?.length > 0) ? (
                                                <View style={styles.hobbiesInitialLoader}>
                                                    <ActivityIndicator size="large" color={c.white} />
                                                </View>
                                            ) : null}
                                            {categorySections.length > 0 ? (
                                                <Accordion
                                                    key={`group-filter-cats-${categorySections.length}`}
                                                    sections={filteredSections}
                                                    activeSections={activeSections}
                                                    renderHeader={renderHeader}
                                                    renderContent={renderContent}
                                                    onChange={handleCategorySectionChange}
                                                    underlayColor={false}
                                                    expandMultiple={true}
                                                    duration={220}
                                                />
                                            ) : !hobbyLoading ? (
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
                                            {footerload && !onSearch ? (
                                                <View style={styles.endOfListLoader}>
                                                    <ActivityIndicator size="large" color={c.white} />
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </BottomSheetScrollView>

                    </View>
                </BottomSheetModal>

                <AlertPopup
                    visible={isModalVisible}
                    onSubmit={handleNaigatePremium}
                    onClose={() => setIsModalVisible(false)}
                >
                    {modalMsg}
                </AlertPopup>

                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={["90%"]}
                    shouldMeasureContentHeight={true}
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={true}
                    enableDynamicSizing={false}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: "gray" }}
                    handleStyle={{ height: 34 }}
                    onDismiss={() => setIsBottomSheetVisible(false)}
                >
                    <View style={styles.bottomSheetContent}>
                        <View style={styles.searchSheetHeader}>
                            <View style={styles.searchcontainer}>
                                <BottomSheetTextInput
                                    placeholderTextColor={"#F7E5D0"}
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder={t("Search_Interests")}
                                    style={styles.inputtxtstyle}
                                    keyboardType="default"
                                />
                            </View>
                            <View style={{ position: "absolute", right: "6%", alignSelf: "center" }}>
                                {Images.search}
                            </View>
                        </View>

                        <View style={{ width: "100%", height: deviceheight * 0.79, paddingBottom: 2 }}>
                            <BottomSheetFlatList
                                data={filteredHobbies}
                                keyExtractor={(item) => String(item?._id)}
                                renderItem={renderItem}
                                contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 20 }}
                                onEndReachedThreshold={0.1}
                                onEndReached={() => {
                                    if (isBottomSheetVisible && !maxreached) {
                                        handlehobbysearch();
                                    }
                                }}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={
                                    footerload ? (
                                        <ActivityIndicator size="small" color={c.white} />
                                    ) : null
                                }
                            />
                        </View>
                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>
        </View>
    );
}

export default GroupfilterPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: c.secondary,
    },
    scrollFrame: {
        marginHorizontal: "2%",
        position: "relative",
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
    hobbiesInitialLoader: {
        minHeight: 72,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    endOfListLoader: {
        minHeight: 64,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
        marginBottom: 10,
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: c.secondary,
        paddingHorizontal: "5%",
        paddingTop: "2%",
    },
    sheetHeaderRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingTop: 4,
        paddingBottom: 10,
    },
    sheetTitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(18),
    },
    sheetFooter: {
        position: "relative",
        paddingHorizontal: "6%",
        paddingTop: 10,
        backgroundColor: c.secondary,
    },
    submitBtnBottom: {
        alignSelf: "center",
        width: "70%",
        backgroundColor: c.white,
        borderRadius: borderradius * 1.2,
        paddingVertical: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    submitBtnTextBottom: {
        fontFamily: Fonts.SemiBold,
        color: c.secondary,
        fontSize: RFValue(15),
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    loaderWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchTapRow: {
        width: "100%",
        height: deviceheight * 0.05,
        flexDirection: "row",
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        borderRadius: borderradius * 0.5,
        marginTop: 6,
    },
    searchTapText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
        color: c.white,
    },
    inlineSearchWrap: {
        width: "100%",
        height: deviceheight * 0.05,
        borderRadius: borderradius * 0.5,
        borderColor: c.white,
        borderWidth: 0.9,
        justifyContent: "center",
        paddingHorizontal: 12,
        marginTop: "2%",
    },
    inlineSearchIconBtn: {
        position: "absolute",
        right: 12,
        alignSelf: "center",
    },
    inlineResultsBox: {
        marginTop: 10,
        borderColor: "rgba(255,255,255,0.25)",
        borderWidth: 1,
        borderRadius: borderradius * 0.4,
        overflow: "hidden",
        maxHeight: deviceheight * 0.058 * 4.5,
    },
    inlineResultRow: {
        height: deviceheight * 0.058,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
    },
    inlineResultText: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(14),
        width: "86%",
    },
    inlineResultIconWrap: {
        width: "14%",
        alignItems: "flex-end",
    },
    inlineResultPlus: {
        width: devicewidth * 0.04,
        height: devicewidth * 0.04,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "2%",
    },
    inlineResultCheck: {
        width: devicewidth * 0.04,
        height: devicewidth * 0.04,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#47db40",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "2%",
    },
    rowBetween: {
        flexDirection: "row",
        marginTop: "2%",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "3%",
    },
    toggleLabel: {
        fontFamily: Fonts.Bold,
        color: c.primary,
        fontSize: RFValue(14),
    },
    switchContainer: {
        width: devicewidth * 0.16,
        height: devicewidth * 0.074,
        borderRadius: 100,
        padding: devicewidth * 0.01,
    },
    switchCircle: {
        width: devicewidth * 0.055,
        height: devicewidth * 0.055,
        borderRadius: 100,
    },
    selectedWrap: {
        flexDirection: "row",
        width: "100%",
        flexWrap: "wrap",
        marginTop: "2%",
        gap: 5,
    },
    searchSheetHeader: {
        width: "100%",
        flexDirection: "row",
        marginBottom: "4%",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    genderbox: {
        width: "100%",
        height: deviceheight * 0.0830,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        backgroundColor: c.primary,
        marginTop: "3%"
    },
    genderButton: {
        width: "32%",
        alignItems: "center",
        justifyContent: "center",
        height: deviceheight * 0.0830,
        borderRadius: borderradius * 0.6,
    },
    selectedGender: {
        backgroundColor: c.white,
    },
    genderText: {
        fontSize: RFValue(20),
    },
    activegendertxt: {
        fontFamily: Fonts.Bold,
        color: c.black,
    },
    inactivegendertxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(14),
    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(18),
        marginBottom: "1%",
    },
    linebar: {
        width: 60,
        height: 3,
        backgroundColor: c.intermediate,
        marginBottom: "1%",
    },
    valueLabel: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "right",
        marginBottom: "2%",
    },
    slider: {
        width: "100%",
    },
    addcontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',

    },

    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        marginRight: '4%',
        textAlign: "center"

    },
    lessbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.primary,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "center",
        marginLeft: 5
    },
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
        width: "90%"
    },
    buttoncontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    buttoncontainer2: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    btntxt1: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(12),
        marginRight: '4%',
    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        minHeight: 20,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    premiumbutton: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    premiumIcon: {
        width: devicewidth * 0.0550,
        height: devicewidth * 0.0550,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        marginLeft: '3%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -deviceheight * 0.01,
        left: 0,
    },
    headtitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: 'center',
    },
    swaproundbox: {
        width: devicewidth * 0.058,
        height: devicewidth * 0.058,
        borderRadius: (devicewidth * 0.15) / 2,
        borderWidth: 1,
        borderColor: '#fff',
        marginLeft: '2%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbStyle: {
        width: "30%",
        height: "30%",
        borderRadius: 15,
        backgroundColor: "red",
    },
    inputsec: {
        width: "100%",
        alignSelf: "center",
        marginTop: "3%"
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        paddingVertical: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
        paddingHorizontal: 10,
        color: c.white,
        width: "100%",
        marginTop: "1%",
        height: "100%",
    },
    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        marginLeft: 1,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.grey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTrack: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 1

    },
    unselectedTrack: {
        backgroundColor: '#E8E6EA',
        borderRadius: borderradius * 1
    },
    track: {
        height: 7,
    },
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
    hobbyItem: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    bottomSheetContent: {
        flex: 1,
        padding: "3%",
        marginTop: "3%"
    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: deviceheight * 0.0570,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    genderItem: {
        paddingHorizontal: "1%",
        paddingVertical: "2%"
    },
})
