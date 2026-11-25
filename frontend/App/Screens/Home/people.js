import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, ImageBackground, Pressable, ActivityIndicator, RefreshControl, BackHandler, Alert, Platform, Touchable } from 'react-native';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { Images } from '../../Utilities/images';
import { c } from '../../Utilities/colors';
import { Fonts } from '../../Utilities/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { update_ChangeCurrentLoc, update_CommonFilter, update_CommonFilterPayload, update_CommonLocAdd, update_CommonLocation, update_FetchProfileId, update_FilterByGender, update_FilterDistance, update_NetworkVisible, update_PeoplGenderFilter, update_PeopleFilterAge, update_PeopleFilterHobbies, update_PopularHobbieList, update_SingleChatCount, update_filterBySearch, update_statusbarcolor } from '../../Slices/helper';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { FindEventsNearBy, UserUnFollow, friendlistapi, userfollowapi } from '../../Actions/hooks';
import { GetItem, RemoveItem, SetItem } from '../../Actions/localstorage';
import { Imageroute } from '../../Actions/constant';
import { randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import { profileSelector } from '../../Slices/profile';
import { getMutualHobbiesSorted, hobbyIdString } from '../../Utilities/mutualHobbies';
import { resetFilterLocation } from '../../Utilities/resetFilterLocation';
import { bootstrapCurrentLocation } from '../../Utilities/bootstrapCurrentLocation';
import { store } from '../../Slices/index';

/**
 * Read the *currently effective* lat/long straight from the Redux store and
 * MMKV at the moment the API call is built.  Closure-captured `activeLatLong`
 * can lag a tick behind a recent state update (e.g. a GPS bootstrap that
 * resolves between render and the click handler firing).  Reading from the
 * store guarantees the freshest coords land in the payload.
 *
 * Priority mirrors `activeLatLong` (changeCurrentLoc → commonLocAdd → MMKV)
 * and skips `[0,0]` Null-Island values.
 */
const pickLiveActiveLatLong = () => {
    const helper = store.getState()?.helper || {};
    const mmkvLoc = (() => {
        try {
            return GetItem("currentLoc");
        } catch {
            return null;
        }
    })();
    const sources = [helper.changeCurrentLoc, helper.commonLocAdd, mmkvLoc];
    for (const src of sources) {
        if (!src || typeof src !== "object") continue;
        const lat = src.lat ?? src.latitude;
        const lng = src.long ?? src.longitude;
        const nLat = Number(lat);
        const nLng = Number(lng);
        if (
            Number.isFinite(nLat) &&
            Number.isFinite(nLng) &&
            !(nLat === 0 && nLng === 0)
        ) {
            return { latitude: nLat, longitude: nLng };
        }
    }
    return null;
};

const normalizeHobbyIds = (hobbies) => {
    if (!Array.isArray(hobbies)) {
        return [];
    }

    return hobbies
        .map((hobby) => hobbyIdString(hobby))
        .filter(Boolean);
};

const getMatchingHobbyCount = (selectedHobbyIds, userHobbies) => {
    if (!(selectedHobbyIds instanceof Set) || selectedHobbyIds.size === 0 || !Array.isArray(userHobbies)) {
        return 0;
    }

    let count = 0;
    for (const hobby of userHobbies) {
        if (selectedHobbyIds.has(hobbyIdString(hobby))) {
            count += 1;
        }
    }
    return count;
};

const sortPeopleByHobbyMatch = (list) => {
    return [...list].sort((a, b) => {
        const byMatchCount = (b?._filterMatchCount || 0) - (a?._filterMatchCount || 0);
        if (byMatchCount !== 0) {
            return byMatchCount;
        }
        return String(a?.username || "").localeCompare(String(b?.username || ""), undefined, {
            sensitivity: "base",
        });
    });
};

const isHiddenProfileAccount = (user) => {
    const hiddenFlags = [
        user?.ishideprofile,
        user?.hide_profile,
        user?.hideProfile,
        user?.isHiddenProfile,
    ];

    return hiddenFlags.some(
        (flag) => flag === true || flag === "true" || flag === 1 || flag === "1",
    );
};

const { width } = Dimensions.get('window');

const People = () => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const TAB_KEY = "People";
    const userID = GetItem("UserId")
    const [page, setPage] = useState(1)
    const [people, setPeople] = useState([])

    //loaders
    const [loading, setLoading] = useState(true);
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch()

    const [emptyMsg, setEmptyMsg] = useState("");
    const [reTryOption, setreTryOption] = useState("0");
    const [firstLoading, setFirstLoading] = useState(true);
    const [isfilter, setIsFilter] = useState(false);
    const [apiCalled, setApiCalled] = useState(false)
    const [currentIndex, setCurrectIndex] = useState([])
    const lastLoadKeyRef = useRef("");
    /**
     * Dedup key of the last *completed* page-1 fetch.  Used by the UI loader
     * (`showBlockingLoader` below) to keep the centered spinner visible
     * during the window between tab focus and the fetch actually starting,
     * and to flip back to the empty-state once the fetch has finished even
     * if it returned zero results.  Mirrors `lastSuccessfulActivityListFetchKeyRef`
     * in activites.js.
     */
    const lastSuccessfulPeopleFetchKeyRef = useRef(null);
    const prevSessionUserRef = useRef(userID);
    const endReachLockRef = useRef(false);
    const pageRef = useRef(1);

    const { filterBysearch, filterDistance, isOnline, commonFilterPayload, followingsDetails, changeCurrentLoc, commonLocAdd } = useSelector(
        state => ({
            filterBysearch: state.helper.filterBysearch,
            filterDistance: state.helper.filterDistance,
            isOnline: state.helper.isOnline,
            commonFilterPayload: state.helper.commonFilterPayload,
            followingsDetails: state.helper.followingsDetails,
            changeCurrentLoc: state.helper.changeCurrentLoc,
            commonLocAdd: state.helper.commonLocAdd,
        }),
        shallowEqual,
    );
    const { profile } = useSelector(profileSelector);
    const { search, activeTab } = filterBysearch;

    // Pick the active "search location" for the default (unfiltered) feed.
    // Mirrors the priority used in group.js so all three tabs agree on which
    // coordinates to send: changeCurrentLoc (advanced-filter map / device
    // GPS) → commonLocAdd (global location picker) → MMKV `currentLoc`
    // (bootstrap fallback).  When no valid coords exist, we omit lat/long so
    // the backend falls back to the user's stored profile location.
    const activeLatLong = useMemo(() => {
        const mmkvLoc = (() => {
            try {
                return GetItem("currentLoc");
            } catch {
                return null;
            }
        })();
        const sources = [changeCurrentLoc, commonLocAdd, mmkvLoc];
        for (const src of sources) {
            if (!src || typeof src !== "object") continue;
            const lat = src.lat ?? src.latitude;
            const lng = src.long ?? src.longitude;
            const nLat = Number(lat);
            const nLng = Number(lng);
            if (
                Number.isFinite(nLat) &&
                Number.isFinite(nLng) &&
                !(nLat === 0 && nLng === 0)
            ) {
                return { latitude: nLat, longitude: nLng };
            }
        }
        return null;
    }, [commonLocAdd, changeCurrentLoc]);

    // Use 3-decimal (~100m) precision for the dedup key so the trivial
    // GPS jitter that fires on every tab-focus bootstrap doesn't change the
    // key and re-trigger the list fetch.  This is what causes the visible
    // "old list → new list" jump while swiping between tabs.  The raw
    // `activeLatLong` is still passed at full precision into the API call;
    // only the dedup key is rounded.
    const activeLocKey = useMemo(
        () => (activeLatLong
            ? `${activeLatLong.latitude.toFixed(3)},${activeLatLong.longitude.toFixed(3)}`
            : ""),
        [activeLatLong],
    );
    // FIX: Do NOT use `|| {}` here — that creates a new object reference on
    // every render, which makes tabFilterPayload always appear "changed" to
    // useCallback/useEffect dependency checks, causing loadPeople to recreate
    // and re-fire on every Redux state update (including activeTab syncs from
    // useFocusEffect). Instead read it as undefined when absent and check with
    // a stable boolean derived via useMemo.
    const tabFilterPayload = commonFilterPayload?.[TAB_KEY];
    const hasFilter = useMemo(
        () => !!tabFilterPayload && Object.keys(tabFilterPayload).length > 0,
        [tabFilterPayload],
    );

    const filterPayloadKey = useMemo(
        () => (tabFilterPayload ? JSON.stringify(tabFilterPayload) : ""),
        [tabFilterPayload],
    );
    const selectedFilterHobbyIds = useMemo(
        () => normalizeHobbyIds(tabFilterPayload?.hobbies),
        [tabFilterPayload?.hobbies],
    );
    const hasPeopleSearchFilters = hasFilter || selectedFilterHobbyIds.length > 0;

    /** Same shape as the dedup string used inside loadPeople — derived in
     * render so JSX (the centered loader) can compare against the last
     * successful fetch ref.  Mirrors activites.js. */
    const currentLoadKey = useMemo(
        () => `${search || ""}-${activeLocKey}-${hasFilter ? `filtered:${filterPayloadKey}` : "plain"}`,
        [search, activeLocKey, hasFilter, filterPayloadKey],
    );

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        setMaxreached(false);
        lastLoadKeyRef.current = "";
    }, [search, filterDistance, filterPayloadKey, activeLocKey]);

    useEffect(() => {
        if (prevSessionUserRef.current === userID) {
            return;
        }
        prevSessionUserRef.current = userID;
        lastLoadKeyRef.current = "";
        lastSuccessfulPeopleFetchKeyRef.current = null;
        setPeople([]);
        setFirstLoading(true);
    }, [userID]);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            // Sync Redux activeTab AFTER focus is committed. Doing this from
            // the tab navigator with useNavigationState/screenListeners was
            // racing the pager's commit and snapping the swipe back. From a
            // tab screen's useFocusEffect the dispatch can only run once the
            // tab is fully focused, so the gesture is already settled.
            dispatch(update_filterBySearch({ activeTab: 'People' }));
        }, [dispatch])
    )

    /**
     * Re-read the device GPS every time this screen is focused.  This catches
     * the "mock-GPS turned off mid-session" case (Redux/MMKV would still hold
     * the fake coords until the app is backgrounded).  `requestIfNeeded:false`
     * never re-prompts for permission; `silent:true` skips the geocoder loop
     * so we get the fresh fix as fast as possible.  When the fresh coords
     * differ from what's in Redux, `activeLocKey` changes and the list
     * refetches automatically via the loader effect below.
     */
    const lastGpsRefreshAtRef = useRef(0);
    useFocusEffect(
        React.useCallback(() => {
            if (hasFilter) {
                return;
            }
            const now = Date.now();
            if (now - lastGpsRefreshAtRef.current < 1500) {
                return;
            }
            lastGpsRefreshAtRef.current = now;
            bootstrapCurrentLocation(dispatch, {
                requestIfNeeded: false,
                silent: true,
            }).catch(() => { });
        }, [dispatch, hasFilter]),
    );

    /* ---------------- UPDATE FOLLOWING DETAILS ---------------- */
    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!followingsDetails || Object.keys(followingsDetails).length === 0)
            return;

        setPeople(prevPeople => {
            if (prevPeople.length === 0) {
                return prevPeople;
            }

            let hasChanges = false;
            const updatedPeople = prevPeople.map(person => {
                const nextDetails = followingsDetails[person._id];

                if (!nextDetails || person.followingsDetails === nextDetails) {
                    return person;
                }

                hasChanges = true;
                return {
                    ...person,
                    followingsDetails: nextDetails,
                };
            });

            return hasChanges ? updatedPeople : prevPeople;
        });
    }, [activeTab, followingsDetails]);


    // useEffect(() => {
    //     // Iterate over followingsDetails and update the state for each person
    //     for (const [id, newDetails] of Object.entries(followingsDetails)) {
    //         updateFollowingsDetails(id, newDetails);
    //     }
    // }, [followingsDetails]);


    /* ---------------- HARDWARE BACK HANDLER ---------------- */
    useFocusEffect(
        React.useCallback(() => {

            const backAction = () => {
                Alert.alert(t('Holdon!'), t('Are_you_sure_want_exit?'), [
                    {
                        text: t('Cancel'),
                        style: 'cancel',
                    },
                    {
                        text: t('YES'),
                        onPress: () => BackHandler.exitApp(),
                    },
                ]);
                return true;
            };

            const subscription =
                BackHandler.addEventListener(
                    'hardwareBackPress',
                    backAction
                );

            return () => subscription.remove();
        }, [t])
    );

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const backAction = () => {

    //             Alert.alert(t('Holdon!'), t('Are_you_sure_want_exit?'), [
    //                 {
    //                     text: t('Cancel'),
    //                     onPress: () => null,
    //                     style: 'cancel',
    //                 },
    //                 {
    //                     text: t('YES'),
    //                     onPress: () => BackHandler.exitApp(),
    //                 },
    //             ]);
    //             return true;
    //         };

    //         const backHandler = BackHandler.addEventListener(
    //             'hardwareBackPress',
    //             backAction
    //         );

    //         return () => backHandler.remove();
    //     }, [])
    // );

    /* ---------------- MAIN DATA LOADER (FIXED OVERLOAD) ---------------- */

    const loadPeople = React.useCallback(() => {
        if (activeTab !== TAB_KEY) {
            // If the user has switched tabs, they are no longer waiting for
            // a full-screen loader on *this* tab.  Clear the blocking state
            // so if they switch back later they don't see a stuck spinner.
            setFirstLoading(false);
            setLoading(false);
            return;
        }

        if (!isOnline) {
            setFirstLoading(false);
            setLoading(false);
            dispatch(update_NetworkVisible(true));
            return;
        }

        // FIX: use stable `hasFilter` boolean (not tabFilterPayload object ref).
        // Remove `people.length` dep — it is not a query input and caused the
        // callback to recreate after every page load, producing re-fetch loops.
        // Gate with lastLoadKeyRef string comparison instead.
        const loadKey = currentLoadKey;

        if (lastLoadKeyRef.current === loadKey && people.length > 0) {
            return;
        }

        // The list we're about to refetch is for a *different* key than the
        // one currently rendered — drop the stale items and show a centered
        // loader so the user doesn't see "old → new" data swap on screen.
        // (When `lastLoadKeyRef.current === ""` the list is either empty or
        // a fresh mount, so there's nothing to clean up.)
        if (lastLoadKeyRef.current && lastLoadKeyRef.current !== loadKey && people.length > 0) {
            setPeople([]);
            setMaxreached(false);
            setFirstLoading(true);
        }

        lastLoadKeyRef.current = loadKey;

        if (hasFilter) {
            handleFilterFriendList(1);
        } else {
            handleFriendList(1);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        activeTab,
        isFocused,
        isOnline,
        hasFilter,
        search,
        TAB_KEY,
        filterPayloadKey,
        activeLocKey,
        currentLoadKey,
    ]);


    /* Trigger loader */
    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                if (cancelled) return;
                loadPeople();
            });
        }, 0);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [loadPeople]);

    function getStableCardHeight(seed) {
        const values = [0.225, 0.3, 0.275];
        const normalizedSeed = String(seed || "");
        let hash = 0;

        for (let i = 0; i < normalizedSeed.length; i += 1) {
            hash = ((hash << 5) - hash) + normalizedSeed.charCodeAt(i);
            hash |= 0;
        }

        const index = Math.abs(hash) % values.length;
        return values[index];
    }

    const handleFriendList = async (page) => {
        try {

            if (!maxreached || page == 1) {

                var payload = {
                    "userId": userID,
                    "name": (search || ""),
                    "page": page,
                    "limit": 10
                }
                // Send the active search location so the backend can filter
                // the discovery feed by radius from the user's *current*
                // place (device GPS or location picker), not by their stored
                // profile coords.  Mirrors the change made for Groups.
                //
                // Read live from the store rather than the closure-captured
                // `activeLatLong` so a refresh fired right after a GPS
                // bootstrap (which writes to Redux) picks up the fresh coords
                // immediately instead of waiting for the next render.
                const liveLoc = pickLiveActiveLatLong() || activeLatLong;
                if (liveLoc) {
                    payload.latitude = liveLoc.latitude;
                    payload.longitude = liveLoc.longitude;
                    if (filterDistance != null && filterDistance !== "") {
                        payload.distance = filterDistance;
                    }
                }
                console.log("People list payload (unfiltered) →", payload);
                if (page == 1) {
                    setFirstLoading(true);
                    setMaxreached(false);
                }
                else {
                    setFooterload(true)
                }
                const result = await friendlistapi(payload)

                setFooterload(false)

                dispatch(update_SingleChatCount(result?.SingleChatCounts));

                if (result?.data?.length > 0) {
                    if (result?.data?.length < 10) {
                        setMaxreached(true);
                    }

                    const convert = result?.data?.filter(e => e.username && !isHiddenProfileAccount(e))?.map((e) => ({
                        ...e,
                        height: getStableCardHeight(e?._id || e?.username)
                    }));
                    setreTryOption("1")
                    if (page == 1) {
                        setPeople(convert);
                    }
                    else {
                        setPeople((prevPeople) => {
                            const seen = new Set(prevPeople.map(p => p?._id));
                            const next = [...prevPeople];
                            for (const person of convert) {
                                if (!seen.has(person?._id)) {
                                    seen.add(person?._id);
                                    next.push(person);
                                }
                            }
                            return next;
                        });
                    }

                    setPage(page)
                    pageRef.current = page
                    setFirstLoading(false);
                }
                else if (search != "") {
                    setPeople([]);
                    setFirstLoading(false);
                    setEmptyMsg(t('NoUserMatch_your_filter_criteria'))
                    if (page > 1) {
                        setMaxreached(true);
                    }
                }
                else {
                    setreTryOption("1")
                    setEmptyMsg(t('No_Members_Found_People_Page'))
                    // Clear the visible list on page 1 so a refresh that
                    // returns no people for the *new* location doesn't leave
                    // the previous location's list on screen.
                    if (page == 1) {
                        setPeople([]);
                        setFirstLoading(false);
                    }
                    if (page > 1) {
                        setMaxreached(true);
                    }
                }
            }

        }
        catch (err) {
            setFooterload(false)
            setFirstLoading(false);
        }
        finally {
            setLoading(false)
            setRefreshing(false)
            setFooterload(false)
            setFirstLoading(false);
            setIsFilter(false)
            // Mark the fetch as complete for the UI loader so the centered
            // spinner switches over to the list / empty-state (even if the
            // result was zero items).  Using `lastLoadKeyRef` (set when the
            // fetch was kicked off) handles the case where `currentLoadKey`
            // shifts mid-flight.
            if (page == 1 && lastLoadKeyRef.current) {
                lastSuccessfulPeopleFetchKeyRef.current = lastLoadKeyRef.current;
            }
        }
    }

    const showAllMembers = async (page) => {

        if (reTryOption == 1) {

            if (hasPeopleSearchFilters) {
                setIsFilter(true)
                handleFilterFriendList(1)
            }
        } else {


            try {

                var payload = {
                    "userId": userID,
                    "name": (search || ""),
                    "page": page,
                    "limit": "8"
                }
                if (page == 1) {
                    setFirstLoading(true);
                }
                else {
                    setFooterload(true)
                }

                const result = await friendlistapi(payload)
                setLoading(false)

                setFooterload(false)
                if (result?.data?.length > 0) {
                    const convert = result?.data?.filter(e => e.username && !isHiddenProfileAccount(e))?.map((e) => ({
                        ...e,
                        height: getStableCardHeight(e?._id || e?.username)
                    }));

                    setPeople(convert);
                    setPage(page)
                    pageRef.current = page
                    setFirstLoading(false);

                }
                else {
                    setMaxreached(true)
                }

            }
            catch (err) {

                setFooterload(false)
                setFirstLoading(false);
            }
            finally {
                setLoading(false)
                setRefreshing(false)
                setFooterload(false)
                setFirstLoading(false);
            }
        }
    }

    const handleFilterFriendList = async (count) => {
        try {

            // tabFilterPayload is defined here because this function is only called
            // when hasFilter is true. The || {} guard is kept for safety only.
            const activeFilter = tabFilterPayload || {};
            const ll = activeFilter?.latLong;
            let lat;
            let lng;
            if (ll && typeof ll === "object") {
                lat = ll.lat ?? ll.latitude;
                lng = ll.long ?? ll.longitude;
            }
            // Fall back to the screen's active location (device GPS / picker /
            // MMKV) if the filter payload didn't carry coords for some
            // reason — prevents stale lat/long when filter ran before GPS
            // resolved.  Read live from the store so a refresh fired right
            // after a fresh GPS bootstrap picks up the new coords without
            // waiting for React to re-render.
            if (lat == null || lng == null) {
                const liveLoc = pickLiveActiveLatLong() || activeLatLong;
                if (liveLoc) {
                    lat = liveLoc.latitude;
                    lng = liveLoc.longitude;
                }
            }
            const selectedHobbyIds = normalizeHobbyIds(activeFilter?.hobbies);
            const selectedHobbyIdSet = new Set(selectedHobbyIds);
            let passload = {
                userId: userID,
                gender: activeFilter?.gender,
                agestart: activeFilter?.agestart,
                ageend: activeFilter?.ageend,
                latitude:
                    lat != null && lng != null && !Number.isNaN(Number(lat))
                        ? Number(lat)
                        : undefined,
                longitude:
                    lng != null && lat != null && !Number.isNaN(Number(lng))
                        ? Number(lng)
                        : undefined,
                distance: activeFilter?.distance,
                hobbies: selectedHobbyIds,
                page: count,
                limit: 10,
            }

            console.log("Payload_filtering_list:", passload);

            if (!maxreached || count == 1) {

                if (count == 1) {
                    setFirstLoading(true);
                    setMaxreached(false);
                }
                else {
                    setFooterload(true)
                }

                setIsFilter(true)

                const result = await FindEventsNearBy(passload);

                if (result && result._debug) {
                    console.log("People FilterUsersNearLocation _debug →", result._debug);
                }

                setFooterload(false)

                if (result?.data?.length > 0) {

                    if (result?.data?.length < 10) {
                        setMaxreached(true);
                    }

                    const convert = (result?.data || [])
                        .filter(e => e.username && !isHiddenProfileAccount(e))
                        .map((e) => {
                            const filterMatchCount = getMatchingHobbyCount(selectedHobbyIdSet, e?.hobbies);
                            return {
                                ...e,
                                height: getStableCardHeight(e?._id || e?.username),
                                _filterMatchCount: filterMatchCount,
                            };
                        })
                        .filter((e) => {
                            if (selectedHobbyIdSet.size === 0) {
                                return true;
                            }
                            return e._filterMatchCount > 0;
                        });

                    if (passload?.page == 1) {
                        setPeople(sortPeopleByHobbyMatch(convert))
                    }
                    else {
                        setPeople((prevPeople) => {
                            const seen = new Set(prevPeople.map(p => p?._id));
                            const next = [...prevPeople];
                            for (const person of convert) {
                                if (!seen.has(person?._id)) {
                                    seen.add(person?._id);
                                    next.push(person);
                                }
                            }
                            return sortPeopleByHobbyMatch(next);
                        });
                    }
                    setPage(count)
                    pageRef.current = count
                }
                else if (count == 1) {
                    setPeople([]);
                    setEmptyMsg(t('NoUserMatch_your_filter_criteria'))
                    setreTryOption("1")
                    setPage(1)
                    pageRef.current = 1
                }
                else {
                    setMaxreached(true);
                }


            }
        } catch (error) {
            console.log("Error on handleFilterFriendList:", error);
        }
        finally {
            setLoading(false)
            setRefreshing(false);
            setFirstLoading(false);
            setFooterload(false);
            // Same as handleFriendList — flip the UI from loader to list /
            // empty-state once the page-1 fetch is done.
            if (count == 1 && lastLoadKeyRef.current) {
                lastSuccessfulPeopleFetchKeyRef.current = lastLoadKeyRef.current;
            }
        }

    }


    const handleUserFollow = async (e) => {
        try {

            if (apiCalled) {
                ShowToast(t('Inprogress,Wait_for_some_time'))
                return;
            }

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "from": userID,
                "to": e?._id,
                "userId": userID,

            }
            setApiCalled(true)

            const result = await userfollowapi(payload)
            if (result?.status) {
                ShowToast(result?.message)
                setPeople(prevPeople => {
                    return prevPeople.map(person => {
                        if (person._id === e?._id) {
                            // If the IDs match, return a new object with updated followingsDetails
                            return {
                                ...person,
                                followingsDetails: result?.data // Update the followingsDetails
                            };
                        }
                        // Otherwise, return the person unchanged
                        return person;
                    });
                });
            }
            else {
                ShowToast(result?.message)
            }


        }
        catch (err) {

        }
        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((data) => data != e?._id));
        }
    }


    const handleUserUnFollowRequest = async (item) => {
        try {
            if (apiCalled) {
                ShowToast(t('Inprogress,Wait_for_some_time'))
                return;
            }

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                from: userID,
                to: item?._id,
                userId: userID,
                request_id: item?.followingsDetails?._id,
                accept: "unfollowed"
            }

            setApiCalled(true)
            const result = await UserUnFollow(payload);

            if (result.status) {
                // ShowToast(`Unfollowed ${item?.username}`)
                ShowToast(`${item?.username} Unfriended`, "normal")
                setPeople(prevPeople => {
                    return prevPeople.map(person => {
                        if (person._id === item?._id) {
                            return {
                                ...person,
                                followingsDetails: result?.data
                            };
                        }

                        return person;
                    });
                });

            }

        } catch (error) {
        }
        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((data) => data != item._id));
        }
    }


    const numColumns = 2;

    const handleHomeDetailFn = useCallback((item) => {
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return;
        }

        dispatch(update_FetchProfileId(item?._id));
        navigation.navigate("HomeDetail", { detail: item });
    }, [dispatch, isOnline, navigation]);

    const columns = useMemo(() => {
        const nextColumns = Array.from({ length: numColumns }, () => []);

        (people || []).forEach((item, index) => {
            const columnIndex = index % numColumns;
            nextColumns[columnIndex].push(item);
        });

        return nextColumns;
    }, [people]);

    const renderItems = () => {
        return columns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.column}>
                {column.map((item) => {
                    const mutualHobbies = getMutualHobbiesSorted(profile?.hobbies, item?.hobbies);
                    const showPlusBadge = mutualHobbies.length > 2;
                    const dualHobbies = mutualHobbies.length >= 2;
                    const firstPillMaxWidth = showPlusBadge ? "38%" : "52%";
                    return (
                        <Pressable
                            key={item._id}
                            onPress={() => handleHomeDetailFn(item)}
                        >
                            <View
                                style={[
                                    styles.item,
                                    {
                                        height: item.height * width * 2,
                                        backgroundColor: item.color,
                                        borderColor: c.grey,
                                        borderWidth: Platform.OS === 'android' ? 0.2 : 0.25,
                                    },
                                ]}>

                                <ImageBackground
                                    resizeMode={!item?.profile ? 'contain' : 'cover'}
                                    style={{ width: "100%", height: "100%", zIndex: 9999, elevation: 5, justifyContent: "center", }} borderRadius={borderradius * 0.5} source={
                                        !(item?.profile)
                                            ? randomimages[item?.randomIndex]
                                            :
                                            { uri: `${Imageroute.PersonalProfile}${item?.profile}` }
                                    }  >
                                    <View
                                        style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, position: "absolute", top: "2.5%", right: "2.5%", alignItems: "center", borderRadius: borderradius * 5, justifyContent: "center", borderColor: item?.Mutualfriends?.length > 0 ? c.mutualBadgeGreen : null, borderWidth: item?.Mutualfriends?.length > 0 ? c.mutualBadgeBorderWidth : null, backgroundColor: c.secondary, zIndex: 9999 }} >
                                        {apiCalled && currentIndex?.includes(item._id) ?
                                            <View style={{ height: "92.5%", paddingBottom: "2.5%", justifyContent: "center" }} >
                                                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                            </View>
                                            :
                                            <>
                                                {item?.followingsDetails != null && item?.followingsDetails?.status != "unfollowed" && item?.followingsDetails?.status != "reject" ?
                                                    <>
                                                        {item?.followingsDetails?.status == "completed" ?
                                                            <Pressable onPress={() => {
                                                                setCurrectIndex((prev) => [...prev, item?._id])
                                                                handleUserUnFollowRequest(item)
                                                            }} >
                                                                <View style={{ marginLeft: "4%", }}>
                                                                    {Images.profiletick}
                                                                </View>
                                                            </Pressable>

                                                            :

                                                            <Pressable onPress={() => {
                                                                setCurrectIndex((prev) => [...prev, item?._id])
                                                                handleUserUnFollowRequest(item)
                                                            }} >
                                                                <View style={{ marginLeft: "4%", }}>
                                                                    {Images.profilepending}
                                                                </View>
                                                            </Pressable>

                                                        }

                                                    </>
                                                    :
                                                    <>
                                                        <Pressable onPress={() => {
                                                            setCurrectIndex((prev) => [...prev, item?._id])
                                                            handleUserFollow(item)
                                                        }} >
                                                            <View style={{ marginLeft: "4%", }}>
                                                                {Images.profilereq}
                                                            </View>
                                                        </Pressable>
                                                    </>
                                                }
                                            </>
                                        }
                                    </View>

                                    <View style={{ width: "100%", position: "absolute", bottom: 0, left: 0, right: 0, justifyContent: "space-around", paddingHorizontal: "5%", paddingVertical: "2.5%", marginTop: 5 }} >
                                        <Text style={{ color: "#fff", fontFamily: Fonts.SemiBold, fontSize: RFValue(15), marginBottom: 3 }} >{item?.username}</Text>
                                        {mutualHobbies.length > 0 && (
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }} >
                                                {mutualHobbies.slice(0, 2).map((hobby, index) => {
                                                    const basePill = {
                                                        paddingVertical: 5,
                                                        borderRadius: borderradius * 5,
                                                        backgroundColor: "#d2d2d5",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        paddingHorizontal: 5,
                                                    };
                                                    const pillStyle = !dualHobbies
                                                        ? { ...basePill, flex: 1, minWidth: 0 }
                                                        : index === 0
                                                            ? {
                                                                ...basePill,
                                                                flexGrow: 0,
                                                                flexShrink: 0,
                                                                maxWidth: firstPillMaxWidth,
                                                            }
                                                            : { ...basePill, flex: 1, minWidth: 0, flexShrink: 1 };
                                                    return (
                                                        <View key={hobbyIdString(hobby) || index} style={pillStyle} >
                                                            <Text
                                                                numberOfLines={1}
                                                                ellipsizeMode="tail"
                                                                style={{ color: "#000", fontFamily: Fonts.Regular, fontSize: RFValue(9), width: "100%", textAlign: "center" }}
                                                            >{hobby?.hobbyname ?? hobby?.hobbyName}</Text>
                                                        </View>
                                                    );
                                                })}

                                                {mutualHobbies.length > 2 && (
                                                    <View style={{ flexShrink: 0, paddingVertical: 4, paddingHorizontal: 8, justifyContent: "center", alignItems: "center", backgroundColor: "#d2d2d5", borderRadius: borderradius * 5 }} >
                                                        <Text style={{ color: "#000", fontFamily: Fonts.Regular, fontSize: RFValue(9) }} >+{mutualHobbies.length - 2}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>

                                </ImageBackground>

                            </View>
                        </Pressable>
                    );
                })}
            </View>
        ));
    };


    const handleScrollEnd = (nativeEvent) => {

        if (!isOnline) {
            setFirstLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }


        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !loading && !maxreached && !endReachLockRef.current) {
            endReachLockRef.current = true;
            const nextPage = pageRef.current + 1;
            setLoading(true); // Set loading state before fetching data
            const unlock = () => {
                endReachLockRef.current = false;
            };
            if (hasFilter) {
                handleFilterFriendList(nextPage).finally(unlock);
            }
            else {
                handleFriendList(nextPage).finally(unlock);
            }
        }
    };


    const handleReferesh = async (count) => {

        if (!isOnline) {
            setFirstLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }
        setRefreshing(true)
        lastLoadKeyRef.current = "";
        // Flip the loader on synchronously — without this the user sees the
        // empty-state / old list for the duration of the GPS bootstrap and
        // the API call, which feels like the Retry click "did nothing".
        lastSuccessfulPeopleFetchKeyRef.current = null;
        setFirstLoading(true);
        setPage(1);
        pageRef.current = 1;

        // Pull-to-refresh = "give me the latest data for where I am right
        // now".  Always re-read the device GPS so a user who has moved (or
        // toggled mock-GPS) since the screen was last focused gets results
        // for their current place.  This bypasses the 1.5s focus cooldown
        // because the user explicitly asked for fresh data.  `silent:false`
        // allows the geocoder to retry on transient failures.
        lastGpsRefreshAtRef.current = Date.now();
        try {
            await bootstrapCurrentLocation(dispatch, {
                requestIfNeeded: false,
                silent: false,
            });
        } catch { }

        if (hasFilter) {
            setIsFilter(true)
            handleFilterFriendList(1)
        }
        else {
            setIsFilter(false)
            handleFriendList(1)
        }

    }


    const handleShowAll = () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        setreTryOption("0")
        lastLoadKeyRef.current = "";
        dispatch(update_FilterDistance(0));
        setMaxreached(false);
        setPage(1);
        pageRef.current = 1;
        setIsFilter(!isfilter)
        showAllMembers(1);

        dispatch(update_CommonFilterPayload({ activeTab: TAB_KEY, clear: true }));
        dispatch(update_FilterByGender([]))
        dispatch(update_PeoplGenderFilter([]))
        dispatch(update_PeopleFilterAge([18, 30]))
        dispatch(update_PeopleFilterHobbies([]))
        resetFilterLocation(dispatch, TAB_KEY);
        RemoveItem(`GenderFilter:${TAB_KEY}`);
        RemoveItem(`RadiusFilter:${TAB_KEY}`);
        RemoveItem(`hobbiesFilter:${TAB_KEY}`);
        RemoveItem(`SelectAge:${TAB_KEY}`);
    }


    /** Loader still owes the user a fetch result for the *current* key.  Same
     * shape activites.js uses to keep the centered spinner visible during
     * the window between focus and the deferred page-1 fetch actually
     * starting (otherwise the user sees the empty-state / old list flash
     * before the loader kicks in). */
    const peopleListStaleForUi =
        lastSuccessfulPeopleFetchKeyRef.current !== currentLoadKey;
    const showBlockingLoader =
        people.length === 0 &&
        (firstLoading || loading || refreshing || (isFocused && isOnline && peopleListStaleForUi));

    return (

        <View style={{ flex: 1, }} >
            <View style={{ width: devicewidth * 0.9, height: Platform.OS == "android" ? "7.5%" : "5%", flexDirection: "row", alignItems: "center", marginHorizontal: "2%", }} >

                <Text style={{ width: "50%", color: "#fff", fontFamily: Fonts.Medium, fontSize: RFValue(15), }} >{t('People_People_Nearby')}</Text>
                {/* (reTryOption == "1" && Object.keys(commonFilterPayload).length > 0) && */}
                {(reTryOption == "1" && hasFilter) &&
                    <Pressable onPress={() => handleShowAll()} style={{ width: "50%", alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(14), textAlign: "center", }}>{t('Reset')}</Text>
                    </Pressable>}
            </View>

            {
                showBlockingLoader ?
                    <View style={{ height: "92.5%", justifyContent: "center", paddingVertical: "3%", }} >
                        <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                    </View>
                    :
                    <View style={{ height: "100%", }}>

                        {people?.length == 0 ?

                            <View style={{ height: "54.5%", justifyContent: "center", alignItems: "center" }} >
                                <Text style={{
                                    fontFamily: Fonts.Bold,
                                    color: c.white,
                                    fontSize: RFValue(14),
                                    textAlign: "center",
                                }} >
                                    {emptyMsg}
                                </Text>


                                {reTryOption == "1" &&
                                    <Pressable onPress={() => handleReferesh(1)} style={{ alignSelf: "center", alignContent: "center", justifyContent: "center", marginTop: 10, borderWidth: 1, borderColor: c.white, borderRadius: 30 }}>
                                        <Text style={{ fontFamily: Fonts.SemiBold, color: c.white, fontSize: RFValue(16), textAlign: "center", paddingHorizontal: 25, paddingVertical: 4 }}>{t('Retry')}</Text>
                                    </Pressable>
                                }

                            </View>

                            :

                            <View style={{ flex: 1 }} >
                                <ScrollView
                                    onScroll={({ nativeEvent }) => {
                                        handleScrollEnd(nativeEvent)
                                    }}
                                    style={{ flex: 0.9 }}
                                    contentContainerStyle={{ paddingBottom: deviceheight * 0.1 }}
                                    scrollEventThrottle={16}
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={() => {
                                                setPage(1)
                                                pageRef.current = 1
                                                setMaxreached(false)
                                                handleReferesh(1)
                                            }}
                                        />
                                    }
                                >
                                    <View style={styles.container}>
                                        {renderItems()}
                                    </View>
                                    {!maxreached && (loading || footerload) &&
                                        <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }} >
                                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                        </View>}
                                    <View style={{ paddingBottom: deviceheight * 0.15, }}>

                                    </View>
                                </ScrollView>

                            </View>
                        }
                    </View>
            }


        </View >

    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 5,
        elevation: 5,
    },
    item: {
        width: '100%',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderradius * 0.5,
        marginTop: "2.5%"
    },
});

export default People;
