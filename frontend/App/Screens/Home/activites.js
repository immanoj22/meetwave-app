import { Pressable, StyleSheet, Text, View, FlatList, Image, ActivityIndicator, RefreshControl, Platform, Share, SafeAreaView, InteractionManager } from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { Images } from "../../Utilities/images";
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { update_ActivitiesDistance, update_ActivitiesFilterHobbies, update_ChangeCurrentLoc, update_CommonFilterPayload, update_CommonLocAdd, update_CommonLocation, update_EventChatCount, update_EventFilterHoobies, update_filterBySearch, update_FilterDistance, update_NetworkVisible, update_PeopleFilterHobbies, update_statusbarcolor } from '../../Slices/helper';
import { c } from "../../Utilities/colors";
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FilterEventsByHobbies, activitylistapi, eventInterestapi, eventwishlistapi } from "../../Actions/hooks";
import { hasActiveSubscription } from "../../Actions/config";

const toHobbyIds = (hobbies) =>
    (Array.isArray(hobbies) ? hobbies : [])
        .map((h) => (typeof h === "string" ? h : h?._id))
        .filter(Boolean);
import { GetItem, RemoveItem } from "../../Actions/localstorage";
import { Imageroute } from "../../Actions/constant";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import AlertPopup from "../../Components/AlertPopup";
import branch from 'react-native-branch';
import SocketContext from "../../Context/SocketContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "../../Slices/index";
import { resetFilterLocation } from '../../Utilities/resetFilterLocation';
import { bootstrapCurrentLocation } from "../../Utilities/bootstrapCurrentLocation";
import { getMutualHobbiesSorted, hobbyIdString } from "../../Utilities/mutualHobbies";

const appendUniqueActivities = (existing, incoming) => {
    const seen = new Set((existing || []).map((item) => item?._id));
    const merged = [...(existing || [])];
    let added = 0;
    for (const item of incoming || []) {
        if (!seen.has(item?._id)) {
            seen.add(item?._id);
            merged.push(item);
            added += 1;
        }
    }
    return { list: merged, added };
};

/**
 * Read the *currently effective* lat/long straight from the Redux store and
 * MMKV at the moment the API call is built.  Closure-captured values can lag
 * a tick behind a recent state update (e.g. a GPS bootstrap that resolves
 * between render and the click handler firing).  Reading from the store
 * guarantees the freshest coords land in the payload.
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

function formatEventDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options).toUpperCase();
}

const activityAttendeeImgStyle = {
    width: devicewidth * 0.080,
    height: devicewidth * 0.080,
    borderRadius: borderradius * 2,
};

/** flexGrow: content can be shorter than the screen — without it, PTR + tab pager often misbehaves vs ScrollView (People/Groups). */
const listContentStyle = { flexGrow: 1, paddingBottom: "10%" };

export default function Activities() {

    const { t } = useTranslation();
    const TAB_KEY = "Activities";
    const isFocused = useIsFocused();

    const dispatch = useDispatch()
    const {
        eventChatCount,
        eventStatus,
        filterBysearch,
        isOnline,
        commonFilterPayload,
        changeCurrentLoc,
        commonLocAdd,
        filterDistance,
    } = useSelector(
        state => ({
            eventChatCount: state.helper.eventChatCount,
            eventStatus: state.helper.eventStatus,
            filterBysearch: state.helper.filterBysearch,
            isOnline: state.helper.isOnline,
            commonFilterPayload: state.helper.commonFilterPayload,
            changeCurrentLoc: state.helper.changeCurrentLoc,
            commonLocAdd: state.helper.commonLocAdd,
            filterDistance: state.helper.filterDistance,
        }),
        shallowEqual,
    )

    // Active "search location" for the unfiltered events feed.  Same
    // priority order as group.js / people.js so all three tabs stay in
    // sync: changeCurrentLoc → commonLocAdd → MMKV `currentLoc`.
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

    // Use 3-decimal (~100m) precision for the dedup key so trivial GPS
    // jitter on every tab-focus bootstrap doesn't keep flipping the key and
    // re-triggering the list fetch (that's what causes the "old list → new
    // list" jump while swiping between tabs).  Raw coords are still passed
    // at full precision into the API call.
    const activeLocKey = useMemo(
        () => (activeLatLong
            ? `${activeLatLong.latitude.toFixed(3)},${activeLatLong.longitude.toFixed(3)}`
            : ""),
        [activeLatLong],
    );
    const userID = GetItem("UserId")
    const prevSessionUserRef = useRef(userID);
    const [activityData, setActivityData] = useState([])
    const [loading, setLoading] = useState(false);
    const [emptyMsg, setEmptyMsg] = useState(t('NoActivitiesFound'));
    const [isfilter, setIsFilter] = useState(false);
    const [page, setPage] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const [currentIndex, setCurrectIndex] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false);
    const endReachLockRef = useRef(false);
    const handlersRef = useRef({});
    /** Dedupes tab focus: swipe back to Events should not rerun list API if search/filter/online unchanged. */
    const activityListFetchKeyRef = useRef('');
    const lastSuccessfulActivityListFetchKeyRef = useRef(null);
    const isFocusedRef = useRef(false);
    const { socket } = useContext(SocketContext);
    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            // Sync Redux activeTab AFTER focus is committed. Doing this from
            // the tab navigator with useNavigationState/screenListeners was
            // racing the pager's commit and snapping the swipe back. From a
            // tab screen's useFocusEffect the dispatch can only run once the
            // tab is fully focused, so the gesture is already settled.
            dispatch(update_filterBySearch({ activeTab: 'Activities' }));

            const q = String(
                store.getState()?.helper?.filterBysearch?.search ?? ""
            ).trim();
            if (q) {
                lastSuccessfulActivityListFetchKeyRef.current = null;
            }

            return (() => {
                dispatch(update_ActivitiesFilterHobbies([]));
            })

        }, [dispatch])
    )

    /**
     * Re-read the device GPS every time this screen is focused.  Catches the
     * "mock-GPS turned off mid-session" case (Redux/MMKV would still hold
     * the fake coords until the app is backgrounded).  Mirrors group.js and
     * people.js so the three tabs always agree on the active location.
     */
    const lastGpsRefreshAtRef = useRef(0);
    useFocusEffect(
        useCallback(() => {
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
    const navigation = useNavigation();
    const { search } = filterBysearch;
    const activitySearchFetchGenRef = useRef(0);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() =>
        String(search ?? "").trim()
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(String(search ?? "").trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (prevSessionUserRef.current === userID) {
            return;
        }
        prevSessionUserRef.current = userID;
        lastSuccessfulActivityListFetchKeyRef.current = null;
        activitySearchFetchGenRef.current += 1;
        setActivityData([]);
        setLoading(false);
        setFooterload(false);
        setIsRefreshing(false);

        // If the same user logged back in, the activityListFetchKeyRef might not
        // change (same search, same location). We must explicitly flip the
        // loader to ensure useFocusEffect triggers a fresh load-People.
        if (isFocused) {
            setLoading(true);
        }
    }, [userID, isFocused]);

    // FIX: do not use `|| {}` — creates new object reference every render.
    const tabFilterPayload = commonFilterPayload?.[TAB_KEY];
    const hasFilter = useMemo(
        () => !!tabFilterPayload && Object.keys(tabFilterPayload).length > 0,
        [tabFilterPayload],
    );

    activityListFetchKeyRef.current = `${debouncedSearchQuery}|${hasFilter ? '1' : '0'}|${isOnline ? '1' : '0'}|${activeLocKey}`;
    isFocusedRef.current = isFocused;

    const profile = useSelector(state => state.profile.profile)


    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                if (cancelled || !isFocused) {
                    return;
                }

                if (!isOnline) {
                    dispatch(update_NetworkVisible(true));
                    return
                }

                const key = activityListFetchKeyRef.current;
                if (
                    lastSuccessfulActivityListFetchKeyRef.current === key &&
                    activityData.length > 0
                ) {
                    return;
                }

                // The list we're about to refetch is for a *different* key
                // than the one currently rendered — drop the stale items and
                // show a loader so the user doesn't see "old → new" data
                // swap on screen.  Skip on the very first load (no previous
                // successful key) so the initial mount still uses whatever
                // empty/loading state was set elsewhere.
                if (
                    lastSuccessfulActivityListFetchKeyRef.current &&
                    lastSuccessfulActivityListFetchKeyRef.current !== key &&
                    activityData.length > 0
                ) {
                    setActivityData([]);
                    setMaxreached(false);
                    setLoading(true);
                }

                if (hasFilter) {
                    handleFilterActivityList(1);
                } else {
                    handleActivityList(1);
                }
            });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };

        // List loaders close over pagination state and should not recreate this
        // trigger on every item/page mutation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // FIX: removed `isRefreshing` (changes during pull-refresh causing mid-refresh reload),
        // `updateActivities` (subscribe to primitive signal, not the object — see below),
        // and replaced `tabFilterPayload` with stable `hasFilter` boolean.
        // Dedupe: same fetch key after a successful page-1 load skips refetch (swipe between tabs).
        // Including `activeLocKey` so the list refetches when the user updates
        // their location (filter / picker / reset → device GPS) without having
        // to navigate away and back.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, debouncedSearchQuery, isOnline, hasFilter, TAB_KEY, activeLocKey])


    useEffect(() => {
        if (!socket) return;
        socket.on("unjoinEventGroup", (data) => {
            // handleActivityList(1)
            //dispatch(update_SingleChatCount(data?.SingleChatCounts));
        });

    }, [socket]);

    // useFocusEffect(
    //     React.useCallback(() => {

    //         if (Object.keys(commonFilterPayload).length <= 0) {
    //             if (commonFilterPayload?.activeTab == "Activities") {
    //                 handleActivityList(1)
    //             }
    //         }
    //     }, [])
    // )

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }

                if (!isFocusedRef.current) {
                    // Join/unjoin or filter refresh fired while on another tab — refetch on next Events focus.
                    lastSuccessfulActivityListFetchKeyRef.current = null;
                    return;
                }

                if (hasFilter) {
                    handleFilterActivityList(1);
                }
                else if (eventStatus?.type == "unjoin" || eventStatus?.type == "join") {
                    handleActivityList(1)
                }
            });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };


        // Do not depend on `isFocused`: that retriggers filtered/join refresh on every swipe to Events.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasFilter, eventStatus?.type, eventStatus?.eventId])


    const handleActivityList = async (page) => {
        const myGen =
            page === 1 ? ++activitySearchFetchGenRef.current : activitySearchFetchGenRef.current;
        const query = debouncedSearchQuery;

        try {

            if (page != 1) {
                if (apiCalled) return;
                setApiCalled(true);
            }

            if (!maxreached || page == 1) {
                var payload = {
                    "userId": userID,
                    "eventTitle": query ? query : "",
                    "page": page,
                    "limit": "7"
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
                console.log("Activity list payload (unfiltered) →", payload);
                if (page == 1) {
                    // Keep list visible while refining search (same as Quick Search).
                    if (activityData.length === 0) {
                        setLoading(true);
                    } else {
                        setFooterload(true);
                    }
                    setPage(1)
                    setMaxreached(false)
                }
                else {
                    setFooterload(true)
                }

                const result = await activitylistapi(payload)
                console.log("activetyList : ", result)

                if (myGen !== activitySearchFetchGenRef.current) {
                    return;
                }

                setPage(page)

                if (result?.status) {

                    if (result?.data && result?.data?.length > 0) {
                        const rows = result?.data || [];

                        if (rows.length < 7) {
                            setMaxreached(true)
                        }

                        if (page == 1) {
                            setActivityData(rows);
                        }
                        else {
                            setActivityData((prev) => {
                                const { list, added } = appendUniqueActivities(prev, rows);
                                if (added === 0) {
                                    setMaxreached(true);
                                }
                                return list;
                            });
                        }

                    }
                    else if (page == 1) {
                        setActivityData([]);
                        setMaxreached(true);
                        setEmptyMsg(
                            query
                                ? t("NoActivitiesMatch")
                                : t("NoActivitiesFound")
                        );
                    }
                }
                else if (result?.data?.length == 0) {
                    setMaxreached(true);
                    setActivityData([]);
                    setEmptyMsg(
                        query
                            ? t("NoActivitiesMatch")
                            : t("NoActivitiesFound")
                    );
                }
                // shareLink()
            }
        }
        catch (err) {
            setLoading(false)
            setEmptyMsg(t('NoActivitiesFound'))
        }
        finally {
            if (page === 1) {
                setLoading(false);
                setFooterload(false);
                setIsRefreshing(false);
                setApiCalled(false);
                if (myGen === activitySearchFetchGenRef.current) {
                    lastSuccessfulActivityListFetchKeyRef.current =
                        activityListFetchKeyRef.current;
                }
            } else if (myGen === activitySearchFetchGenRef.current) {
                setFooterload(false);
                setApiCalled(false);
            }
        }
    }

    const handleFilterActivityList = async (count) => {
        const myGen =
            count === 1 ? ++activitySearchFetchGenRef.current : activitySearchFetchGenRef.current;

        try {

            // Pull-to-refresh / page 1 must run even when save/join has apiCalled=true (same tab).
            if (apiCalled && count !== 1) return;
            setApiCalled(true);

            if (!maxreached || count == 1) {

                const ll = tabFilterPayload?.latLong;
                let lat;
                let lng;
                if (ll && typeof ll === "object") {
                    lat = ll.lat ?? ll.latitude;
                    lng = ll.long ?? ll.longitude;
                }
                // Fall back to the screen's active location (device GPS /
                // picker / MMKV) if the filter payload didn't carry coords —
                // prevents stale lat/long when the filter ran before GPS
                // resolved.  Read live from the store so the freshest coords
                // are used (closure may lag).
                if (lat == null || lng == null) {
                    const liveLoc = pickLiveActiveLatLong() || activeLatLong;
                    if (liveLoc) {
                        lat = liveLoc.latitude;
                        lng = liveLoc.longitude;
                    }
                }
                let passload = {
                    userId: userID,
                    latitude:
                        lat != null && lng != null && !Number.isNaN(Number(lat))
                            ? Number(lat)
                            : undefined,
                    longitude:
                        lng != null && lat != null && !Number.isNaN(Number(lng))
                            ? Number(lng)
                            : undefined,
                    distance: tabFilterPayload?.distance,
                    eventhobbies: toHobbyIds(tabFilterPayload?.hobbies),
                    page: count,
                    limit: 10,
                }

                if (count == 1) {
                    if (activityData.length === 0) {
                        setLoading(true);
                    } else {
                        setFooterload(true);
                    }
                    setPage(1)
                }
                else {
                    setFooterload(true)
                }

                setIsFilter(true);


                console.log("Activity filter payload →", passload);
                const result = await FilterEventsByHobbies(passload);

                if (result && result._debug) {
                    console.log("Activities FindNearbyEvents _debug →", result._debug);
                }

                if (myGen !== activitySearchFetchGenRef.current) {
                    return;
                }

                setPage(count)

                if (result?.status) {

                    if (result?.data?.length > 0) {
                        const rows = result?.data || [];

                        if (rows.length < 10) {
                            setMaxreached(true)
                        }

                        if (passload?.page == 1) {
                            setActivityData(rows);
                        }
                        else {
                            setActivityData((prev) => {
                                const { list, added } = appendUniqueActivities(prev, rows);
                                if (added === 0) {
                                    setMaxreached(true);
                                }
                                return list;
                            });
                        }


                        if (result?.data?.length == 4) {
                            setMaxreached(true)
                        }

                    }
                    else {
                        setMaxreached(true);
                        setActivityData([]);
                        setEmptyMsg(
                            debouncedSearchQuery
                                ? t("NoActivitiesMatch")
                                : t("No_Events_Found")
                        );
                    }

                }
                else if (result?.data?.length == 0) {
                    setMaxreached(false);

                }

            }
        } catch (error) {

        }
        finally {
            if (count === 1) {
                setLoading(false);
                setFooterload(false);
                setApiCalled(false);
                setIsRefreshing(false);
                if (myGen === activitySearchFetchGenRef.current) {
                    lastSuccessfulActivityListFetchKeyRef.current =
                        activityListFetchKeyRef.current;
                }
            } else if (myGen === activitySearchFetchGenRef.current) {
                setFooterload(false);
                setApiCalled(false);
            }
        }
    }



    const handleAddInterest = async (item, index) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            var local = [...activityData]
            var payload = {
                "type": !local[index]?.eventinterested.some((data) => data?.userId?._id == userID && data.joinstatus == true) ? "join" : "unjoin",
                "userId": userID,
                "eventId": item?._id
            }
            setApiCalled(true);

            const result = await eventInterestapi(payload);
            if (result?.status) {
                ShowToast(result?.message)

                const eventId = local.findIndex(event => event._id === item._id);
                const eventIndex = local[eventId].eventinterested.findIndex(data => data?.userId?._id === userID);

                if (eventIndex === -1) {
                    local[index].eventinterested.push({
                        userId: {
                            _id: userID,
                            username: profile?.username,
                            profile: profile?.profile,
                        },
                        joinstatus: true
                    });
                } else {
                    local[index].eventinterested = local[index].eventinterested.map(data => {
                        if (data?.userId?._id === userID) {
                            return {
                                ...data,
                                joinstatus: !data.joinstatus
                            };
                        }
                        return data;
                    });
                }

                setActivityData(local);
            }
            else {
                ShowToast(result?.message)
            }
        }
        catch (err) {
            //console.log("error on eventinterestresssss", err);
        }
        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((data) => data?._id != item?._id && data?.type == "join"));
        }

    }


    const handleWishlist = async (item, index) => {

        var local = [...activityData]
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        if (apiCalled) return;

        try {
            var payload = {
                "type": item?.isSaved?.some((data) => data?.status == true && data?.userId == userID) ? "unsave" : "save",
                "userId": userID,
                "eventId": item?._id
            }

            setApiCalled(true)
            const result = await eventwishlistapi(payload)


            if (result?.status) {
                ShowToast(result?.message)
                const userIndex = local[index].isSaved.findIndex(data => data.userId === userID);
                if (userIndex === -1) {
                    local[index].isSaved.push({
                        userId: userID,
                        status: true
                    });
                } else {
                    local[index].isSaved = local[index].isSaved.map(data => {
                        if (data.userId === userID) {
                            return {
                                ...data,
                                status: !data.status
                            };
                        }
                        return data;
                    });
                }
                setActivityData(local);
            }
            else {
                ShowToast(result?.message)
            }
        }
        catch (err) {

        }

        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((data) => data?._id != item?._id && data?.type == "save"));
        }
    }
    const shareLink = async (item) => {

        const propsDTL = item;

        const detail = item;

        const eventId = detail?._id;

        const imgURL = propsDTL?.imageURL ? propsDTL?.imageURL : `${Imageroute?.eventProfile}${propsDTL?.image[0]}`;
        try {

            const branchUniversalObject = await branch.createBranchUniversalObject(`Event/${eventId}`, {
                title: item?.eventTitle,
                contentDescription: item?.description,
                contentImageUrl: imgURL,
                contentMetadata: {
                    customMetadata: {
                        data: JSON.stringify({
                            screen: "ActivityDetail",
                            routeId: eventId,
                            imageURL: imgURL,
                        })

                    },
                },
            });

            // 2. Define link properties
            const linkProperties = {
                // feature: 'share',
                // channel: 'all',
            };

            // 3. Define control parameters (optional, for fallback or deep linking behavior)
            const controlParams = {
                $desktop_url: `https://play.google.com/store/apps/details?id=com.meetwave`, // Fallback URL for desktop users
                $ios_url: `meetwave://product/${eventId}`,                  // iOS app deep link (if applicable)
                $android_url: `meetwave://product/${eventId}`,
                //$game_Id: e.id,              // Android app deep link (if applicable)
            };

            // 4. Generate a short URL
            const { url } = await branchUniversalObject.generateShortUrl(linkProperties, controlParams);

            return url;
            // openShare(url)

        } catch (error) {
            console.log('Error sharing product:', error);
        }
    }

    const openShare = async (item) => {
        const url = await shareLink(item);

        await Share.share({
            message: url,
        })
            //after successful share return result
            .then((result) => console.log(result))
            //If any thing goes wrong it comes here
            .catch((errorMsg) => console.log(errorMsg));
    }

    handlersRef.current.handleActivityList = handleActivityList;
    handlersRef.current.handleFilterActivityList = handleFilterActivityList;
    handlersRef.current.handleWishlist = handleWishlist;
    handlersRef.current.handleAddInterest = handleAddInterest;
    handlersRef.current.openShare = openShare;

    const navigateToDetail = useCallback((item) => {
        navigation.navigate("ActivityDetail", { detail: item });
    }, [navigation]);

    const stableOpenShare = useCallback((item) => {
        void handlersRef.current.openShare?.(item);
    }, []);

    const stableWishlist = useCallback((item, index) => {
        setCurrectIndex((prev) => [...prev, { _id: item?._id, type: "save" }]);
        handlersRef.current.handleWishlist?.(item, index);
    }, []);

    const stableJoinInterest = useCallback((item, index) => {
        setCurrectIndex((prev) => [...prev, { _id: item?._id, type: "join" }]);
        handlersRef.current.handleAddInterest?.(item, index);
    }, []);

    const listKeyExtractor = useCallback((item, index) => {
        const id = item?._id ?? item?.id;
        return id != null ? String(id) : `activity-${index}`;
    }, []);

    const listRenderItem = useCallback(
        ({ item, index }) => (
            <ActivityListCard
                item={item}
                index={index}
                userID={userID}
                profileHobbies={profile?.hobbies}
                apiCalled={apiCalled}
                currentIndex={currentIndex}
                t={t}
                onNavigateDetail={navigateToDetail}
                onShare={stableOpenShare}
                onSave={stableWishlist}
                onJoinLeave={stableJoinInterest}
            />
        ),
        [userID, profile?.hobbies, apiCalled, currentIndex, t, navigateToDetail, stableOpenShare, stableWishlist, stableJoinInterest],
    );

    const listFooter = useCallback(
        () =>
            footerload ? (
                <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }}>
                    <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                </View>
            ) : null,
        [footerload],
    );

    const onListEndReached = useCallback(async () => {
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return;
        }
        if (loading || maxreached || footerload || endReachLockRef.current) return;
        endReachLockRef.current = true;
        try {
            const nextPage = page + 1;
            if (hasFilter) {
                await handlersRef.current.handleFilterActivityList?.(nextPage);
            } else {
                await handlersRef.current.handleActivityList?.(nextPage);
            }
        } finally {
            endReachLockRef.current = false;
        }
    }, [loading, maxreached, footerload, isOnline, hasFilter, page, dispatch]);

    const onListRefresh = useCallback(async () => {
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return;
        }
        // Match People/Groups explicit refresh: allow a new fetch + effect-driven reload.
        lastSuccessfulActivityListFetchKeyRef.current = null;
        setApiCalled(false);
        setIsRefreshing(true);
        setMaxreached(false);
        setPage(1);

        // Pull-to-refresh = "give me the latest data for where I am right
        // now".  Always re-read the device GPS so a user who has moved (or
        // toggled mock-GPS) since the screen was last focused gets results
        // for their current place.  Bypass the 1.5s focus cooldown because
        // the user explicitly asked for fresh data; `silent:false` allows
        // the geocoder to retry on transient failures.
        lastGpsRefreshAtRef.current = Date.now();
        try {
            await bootstrapCurrentLocation(dispatch, {
                requestIfNeeded: false,
                silent: false,
            });
        } catch { }

        try {
            if (hasFilter) {
                await handlersRef.current.handleFilterActivityList?.(1);
            } else {
                await handlersRef.current.handleActivityList?.(1);
            }
        } catch {
            /* API layer already surfaced empty/toast elsewhere */
        } finally {
            setIsRefreshing(false);
        }
    }, [isOnline, hasFilter, dispatch]);


    const handleShowAllFunction = () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        setMaxreached(false);
        setPage(1);
        setIsFilter(!isfilter);

        dispatch(update_CommonFilterPayload({ activeTab: TAB_KEY, clear: true }));
        dispatch(update_PeopleFilterHobbies([]));
        handleActivityList(1);
        resetFilterLocation(dispatch, TAB_KEY);
        RemoveItem(`GenderFilter:${TAB_KEY}`);
        RemoveItem(`RadiusFilter:${TAB_KEY}`);
        RemoveItem(`hobbiesFilter:${TAB_KEY}`);
        RemoveItem(`SelectAge:${TAB_KEY}`);

        dispatch(update_ActivitiesDistance(0))
        dispatch(update_FilterDistance(0));
        dispatch(update_ActivitiesFilterHobbies([]));
    }


    const handleNaigatePremium = async () => {
        setIsModalVisible(false)
        navigation.navigate("Premium")
    }

    /** True until we've completed at least one page-1 fetch for current search/filter/online key (even if zero events). avoids empty-state flash before deferred effect / setLoading kicks in. */
    const activityListStaleForUi =
        lastSuccessfulActivityListFetchKeyRef.current !== activityListFetchKeyRef.current;
    /** Full-screen spinner only when list is empty so pull-to-refresh (loading + data) keeps the FlatList. */
    const showBlockingLoader =
        activityData.length === 0 &&
        (loading || (isFocused && isOnline && activityListStaleForUi));

    const handleCreateEventFunction = () => {
        if (hasActiveSubscription(profile)) {
            // Navigate first so the transition isn't blocked by Redux updates.
            navigation.navigate("EventCreation");
            InteractionManager.runAfterInteractions(() => {
                dispatch(update_EventFilterHoobies([]));
            });
        } else {
            setIsModalVisible(true);
        }
    }


    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <View style={{ flex: 1, height: "100%", width: "100%" }} >

                <View style={{ width: "98%", height: "100%", alignSelf: "center", marginTop: "2%", }}>
                    <View style={{ alignItems: "flex-end", marginBottom: "2%" }}>

                        {isfilter &&
                            <Pressable onPress={() => {
                                setMaxreached(false)
                                handleShowAllFunction()
                            }}
                            >
                                <Text style={{ color: "#fff", fontFamily: Fonts.ExtraBold, fontSize: RFValue(15), }} >
                                    {t('Reset')}
                                </Text>
                            </Pressable>
                        }
                    </View>


                    {showBlockingLoader ? (

                        <ActivityIndicator size="small" color={c.white} style={{ height: Platform.OS == "android" ? deviceheight * 0.6 : deviceheight * 0.6, }} />

                    ) :
                        (activityData.length == 0 ? (
                            <View style={{ height: "68%", justifyContent: "center", alignItems: "center", }}>
                                <View style={{}}>
                                    <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(14), textAlign: "center", }}>
                                        {emptyMsg}
                                    </Text>
                                    {!isfilter &&
                                        <Pressable onPress={() => handleActivityList(1)} style={{ alignSelf: "center", alignContent: "center", justifyContent: "center", marginTop: 10, borderWidth: 1, borderColor: c.white, borderRadius: 30 }}>
                                            <Text style={{ fontFamily: Fonts.SemiBold, color: c.white, fontSize: RFValue(16), textAlign: "center", paddingHorizontal: 25, paddingVertical: 4 }}>{t('Retry')}</Text>
                                        </Pressable>
                                    }
                                </View>


                            </View>
                        ) : (
                            <FlatList
                                style={{ flex: 1 }}
                                data={activityData}
                                renderItem={listRenderItem}
                                keyExtractor={listKeyExtractor}
                                removeClippedSubviews={false}
                                initialNumToRender={6}
                                maxToRenderPerBatch={8}
                                windowSize={9}
                                updateCellsBatchingPeriod={50}
                                onEndReachedThreshold={0.35}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={listContentStyle}
                                onEndReached={onListEndReached}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={onListRefresh}
                                        colors={['#9Bd35A', '#689F38']}
                                        progressBackgroundColor="#ffffff"
                                    />
                                }
                                ListFooterComponent={listFooter}
                            />
                        ))
                    }
                </View>


                <View style={{
                    position: "absolute",
                    //     bottom: Platform.OS == "android" ? deviceheight * 0.15 : deviceheight * 0.03,
                    bottom: Platform.OS == "android" ? deviceheight * 0.15 : deviceheight * 0.12,
                    right: "0%",
                }}>


                    <Pressable
                        //onPress={() => navigation.navigate("EventCreation")} 
                        onPress={() => handleCreateEventFunction()}
                        style={{ marginBottom: 10 }} >

                        <View style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 3, backgroundColor: c.white, justifyContent: "center", alignItems: "center", elevation: 1 }} >
                            {Images.plusGroup}
                        </View>

                    </Pressable>

                    <Pressable onPress={() => navigation.navigate("EventGroupList")} >

                        <View style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 3, backgroundColor: c.white, justifyContent: "center", alignItems: "center", elevation: 1 }} >
                            {Images.chat}
                        </View>
                        {eventChatCount > 0 && (
                            <View style={styles.chatCount} />
                        )}
                    </Pressable>
                </View>

            </View>
            <AlertPopup
                visible={isModalVisible}
                title="Note"
                onSubmit={() => handleNaigatePremium()}
                onClose={() => setIsModalVisible(false)} >
                <Text>{t('You_want_to_ubscribe')}</Text>
            </AlertPopup>
        </SafeAreaProvider>
    )
}


const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        paddingHorizontal: "3%",
        paddingVertical: "4%",
        marginBottom: "4%",
        borderColor: "#fff",
        borderWidth: 0.3,
    },
    datetxt: {
        fontFamily: Fonts.Light,
        color: "#E0D3D3",
        fontSize: RFValue(14),
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),


    },
    loctxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
        marginLeft: "1.3%",
        width: "90%"
    },
    friendtxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },
    btn: {
        width: "28%",
        height: deviceheight * 0.0355,
        borderRadius: borderradius * 1.4,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        alignSelf: "center",
    },
    btntxt: {
        color: c.secondary,
        fontSize: RFValue(11),
        fontFamily: Fonts.Medium
    },
    smallround: {
        width: devicewidth * 0.07,
        height: devicewidth * 0.07,
        borderRadius: borderradius * 5,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center"
    },
    interestbtn: {
        width: "100%",
        borderRadius: borderradius * 1.4,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "6%"
    },
    interesttxt: {
        color: c.secondary,
        fontSize: RFValue(10),
        fontFamily: Fonts.Medium
    },
    noDataText: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "center"
    },

    interestbtn1: {
        width: "50%",
        height: deviceheight * 0.0355,
        borderRadius: borderradius * 1.4,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "3%"
    },
    chatCount: {
        position: "absolute",
        right: 0,
        top: 0,
        backgroundColor: c.secondary,
        width: 11,
        height: 11,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center"
    },


})

const activityCardFooterAbs = {
    position: "absolute",
    bottom: "9%",
    right: "2%",
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
};

const activityJoinBtnWrap = {
    width: "60%",
    borderRadius: borderradius * 1,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "4%",
    paddingVertical: "4%",
};

function ActivityListCard({
    item,
    index,
    userID,
    profileHobbies,
    apiCalled,
    currentIndex,
    t,
    onNavigateDetail,
    onShare,
    onSave,
    onJoinLeave,
}) {
    const joinedInterested = useMemo(
        () => (item?.eventinterested ?? []).filter((d) => d?.joinstatus == true),
        [item?.eventinterested],
    );

    const joinedCount = joinedInterested.length;
    const isUserJoined = joinedInterested.some((d) => d?.userId?._id == userID);

    const saveLoading =
        apiCalled && currentIndex?.some((data) => data?._id == item?._id && data?.type == "save");
    const joinLoading =
        apiCalled && currentIndex?.some((data) => data?._id == item?._id && data?.type == "join");
    const displayedEventHobbies = useMemo(
        () => getMutualHobbiesSorted(profileHobbies, item?.eventhobbies),
        [item?.eventhobbies, profileHobbies],
    );

    return (
        <View style={styles.card}>
            <Pressable onPress={() => onNavigateDetail(item)}>
                <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={styles.datetxt}>{formatEventDate(item?.startDate)}</Text>

                        <View style={{ width: "20%", flexDirection: "row", justifyContent: "space-between" }}>
                            <Pressable style={{ marginRight: "0%", padding: "5%" }} onPress={() => onShare(item)}>
                                {Images.share}
                            </Pressable>
                            {saveLoading ? (
                                <ActivityIndicator style={{ alignSelf: "center" }} color={c?.secondary} size={"small"} />
                            ) : (
                                <View style={{ padding: "5%" }}>
                                    <Pressable onPress={() => onSave(item, index)}>
                                        {item?.isSaved?.length != 0 &&
                                            item?.isSaved?.some((data) => data?.status == true && data?.userId == userID)
                                            ? Images.wish
                                            : Images.save}
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={{ marginTop: "3%", width: "90%" }}>
                        <Text style={styles.title}>{item?.eventTitle}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: "2%" }}>
                        {Images.location1}
                        <Text style={styles.loctxt} numberOfLines={2}>
                            {item?.eventAddress}
                        </Text>
                    </View>
                    <View style={{ width: "100%", marginTop: "4%", flexDirection: "row", alignItems: "center" }}>
                        {joinedCount > 0 && (
                            <View style={{ width: "40%", flexDirection: "row" }}>
                                {joinedInterested.slice(0, 3).map((e, avIndex) => (
                                    <React.Fragment key={e?.userId?._id || e?._id || avIndex}>
                                        {e?.userId?.profile ? (
                                            <Image
                                                style={activityAttendeeImgStyle}
                                                source={{ uri: `${Imageroute.PersonalProfile}${e?.userId?.profile}` }}
                                            />
                                        ) : (
                                            <Image
                                                style={activityAttendeeImgStyle}
                                                source={randomimages[e?.userId?.randomIndex]}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: "4%" }}>
                        {displayedEventHobbies.length > 0 && (
                            <View style={{ width: "70%", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                {displayedEventHobbies.slice(0, 2).map((hobby, hobbyIndex) => (
                                    <View key={hobbyIdString(hobby) || hobbyIndex} style={styles.btn}>
                                        <Text style={styles.btntxt}>
                                            {(hobby?.hobbyname ?? hobby?.hobbyName)?.length > 8
                                                ? (hobby?.hobbyname ?? hobby?.hobbyName)?.slice(0, 5) + "..."
                                                : (hobby?.hobbyname ?? hobby?.hobbyName)}
                                        </Text>
                                    </View>
                                ))}
                                {displayedEventHobbies.length > 2 && (
                                    <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                        <Text style={styles.btntxt}>+{displayedEventHobbies.length - 2}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>

            <>
                {isUserJoined ? (
                    <View style={activityCardFooterAbs}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                width: "40%",
                                gap: 4,
                                justifyContent: "center",
                            }}
                        >
                            <View>{Images.groupMembUn}</View>
                            <Text style={styles.friendtxt}>{joinedCount}</Text>
                        </View>

                        <View style={activityJoinBtnWrap}>
                            {joinLoading ? (
                                <ActivityIndicator style={{ alignSelf: "center" }} color={c?.secondary} size={"small"} />
                            ) : (
                                <Pressable
                                    style={{ width: "100%", height: "100%", alignItems: "center" }}
                                    onPress={() => onJoinLeave(item, index)}
                                >
                                    <Text style={styles.interesttxt}>{t('Leave_Event')}</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={activityCardFooterAbs}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                width: "40%",
                                gap: 4,
                                justifyContent: "center",
                            }}
                        >
                            <View>{Images.groupMemb}</View>
                            <Text style={styles.friendtxt}>{joinedCount}</Text>
                        </View>

                        {item?.userId?._id === userID ? (
                            " "
                        ) : (
                            <View style={activityJoinBtnWrap}>
                                {joinLoading ? (
                                    <ActivityIndicator
                                        style={{ alignSelf: "center" }}
                                        color={c?.secondary}
                                        size={"small"}
                                    />
                                ) : (
                                    <Pressable
                                        style={{ width: "100%", height: "100%", alignItems: "center" }}
                                        onPress={() => onJoinLeave(item, index)}
                                    >
                                        {isUserJoined ? (
                                            <Text style={styles.interesttxt}>{t('Leave_Event')}</Text>
                                        ) : (
                                            <Text style={styles.interesttxt}>{t('Activity_Join')}</Text>
                                        )}
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </>
        </View>
    );
}
