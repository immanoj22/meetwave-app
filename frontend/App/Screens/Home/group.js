import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast, } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { Images } from "../../Utilities/images";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  update_ChangeCurrentLoc,
  update_ChatFilterHoobies,
  update_ChatMembersList,
  update_CommonFilterPayload,
  update_CommonLocAdd,
  update_CommonLocation,
  update_filterBySearch,
  update_Filtered,
  update_GroupFilter,
  update_NetworkVisible,
  update_PeopleFilterHobbies,
} from "../../Slices/helper";
import { c } from "../../Utilities/colors";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { navigateToFilterPage } from "../../Utilities/filterSheetPresent";
import { resetFilterLocation } from "../../Utilities/resetFilterLocation";
import { bootstrapCurrentLocation } from "../../Utilities/bootstrapCurrentLocation";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DeleteInstance, GetFilteredGroups, GroupJoinandUnjoin, getAllMembersapi } from "../../Actions/hooks";
import { GetItem, RemoveItem, SetItem } from "../../Actions/localstorage";
import { Imageurl } from "../../Actions/constant";
import { JoinRoom } from "../../Actions/socket";
import {
  getChatInstanceId,
  isGroupChatEvent,
  shouldClearTypingIndicator,
} from "../../Utilities/chatNavigation";
import SocketContext from "../../Context/SocketContext";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import { LongPressGestureHandler } from "react-native-gesture-handler";
import AlertPopup from "../../Components/AlertPopup";
import { store } from "../../Slices/index";
import {
  getHobbiesWithMutualSorted,
  hobbyIdString,
} from "../../Utilities/mutualHobbies";

const appendUniqueGroups = (existing, incoming) => {
  const seen = new Set((existing || []).map((item) => String(item?._id)));
  const merged = [...(existing || [])];
  let added = 0;
  for (const item of incoming || []) {
    const id = String(item?._id);
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(item);
      added += 1;
    }
  }
  return { list: merged, added };
};

export default function Group() {

  const { t } = useTranslation();
  const TAB_KEY = "Chat";
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const [firstLoading, setFirstLoading] = useState(true);

  const [typinguser, setTypinguser] = useState("");

  const User_Id = GetItem("UserId");

  const { socket } = useContext(SocketContext);

  const [maxreached, setMaxreached] = useState(false);
  const [page, setPage] = useState(1);

  const {
    isOnline,
    commonFilterPayload,
    filterBysearch,
    chatMembersList,
    fetchChat,
    filtered,
    isGroupFilter,
    commonLocAdd,
    changeCurrentLoc,
  } = useSelector(
    state => ({
      isOnline: state.helper.isOnline,
      commonFilterPayload: state.helper.commonFilterPayload,
      filterBysearch: state.helper.filterBysearch,
      chatMembersList: state.helper.chatMembersList,
      fetchChat: state.helper.fetchChat,
      filtered: state.helper.filtered,
      isGroupFilter: state.helper.isGroupFilter,
      commonLocAdd: state.helper.commonLocAdd,
      changeCurrentLoc: state.helper.changeCurrentLoc,
    }),
    shallowEqual,
  );

  // Pick the active "search location" for the unfiltered/search feed.
  //
  // Priority matches the advanced filter (changeCurrentLoc → commonLocAdd):
  //   1. `changeCurrentLoc` — updated by the advanced filter map drag,
  //      filter Apply, and Reset → device GPS. This is what the filter
  //      screen's address line is bound to, so the API and UI agree.
  //   2. `commonLocAdd` — updated by the global location picker screens
  //      (LocationHome / MapViewpage / ManualLocation) and used as a
  //      fallback when the filter has never been touched.
  //
  // The previous order had `commonLocAdd` first, which caused the API to
  // use a stale value whenever the user updated their location via the
  // advanced filter (the filter only writes `changeCurrentLoc`).
  const activeLatLong = useMemo(() => {
    // Final fallback: MMKV `currentLoc` (set by bootstrapCurrentLocation when
    // GPS resolves) so the API still receives a valid centre even if Redux
    // hasn't been hydrated yet on a cold start.
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

  // Stable key for the active location; used as an effect dependency so
  // the list refetches when the user changes location (filter / picker /
  // reset → device GPS) without having to navigate away and back.
  //
  // Use 3-decimal (~100m) precision so trivial GPS jitter on every
  // tab-focus bootstrap doesn't keep flipping the key and re-triggering
  // the list fetch (that's what causes the "old list → new list" jump
  // while swiping between tabs).  Raw coords are still passed at full
  // precision into the API call.
  const activeLocKey = useMemo(
    () => (activeLatLong
      ? `${activeLatLong.latitude.toFixed(3)},${activeLatLong.longitude.toFixed(3)}`
      : ""),
    [activeLatLong],
  );

  const profile = useSelector(state => state.profile.profile);

  const [selectMes, setSelectMes] = useState(false);

  const [msgDelete, setMsgDelete] = useState([]);

  const [loading, setLoading] = useState(false);

  const [apiCalled, setApiCalled] = useState(false);

  const [currentIndex, setCurrectIndex] = useState([])
  const loginSts = GetItem("Loginstatus");
  const prevSessionUserRef = useRef(User_Id);
  const endReachLockRef = useRef(false);
  const lastFetchedPageRef = useRef(0);

  const { search, activeTab } = filterBysearch;
  const groupSearchFetchGenRef = useRef(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() =>
    String(search ?? "").trim()
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(String(search ?? "").trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Tracks the dedup key of the last successful page-1 fetch.  Used to:
   *   (1) Skip refetch on tab swipes when nothing relevant has changed
   *       (mirrors what people.js / activites.js do).
   *   (2) Detect "the data currently on screen is for a *different* key"
   *       and clear it before the new fetch lands, so the user doesn't
   *       see the old groups → new groups jump while swiping between tabs.
   */
  const lastSuccessfulGroupFetchKeyRef = useRef(null);

  // New login / logout: drop stale fetch generation and show loader until refetch.
  useEffect(() => {
    if (prevSessionUserRef.current === User_Id) {
      return;
    }
    prevSessionUserRef.current = User_Id;
    groupSearchFetchGenRef.current += 1;
    lastSuccessfulGroupFetchKeyRef.current = null;
    setFirstLoading(true);
    setLoading(false);
    setRefreshing(false);
  }, [User_Id, loginSts]);

  // FIX: do not use `|| {}` — creates new object reference every render.
  const tabFilterPayload = commonFilterPayload?.[TAB_KEY];
  const hasFilter = useMemo(
    () => !!tabFilterPayload && Object.keys(tabFilterPayload).length > 0,
    [tabFilterPayload],
  );

  /** Always latest fetch impls for socket handlers (avoid stale closures). */
  const listFetchFnsRef = useRef({
    getFiltered: async (_page) => { },
    getAll: async (_page) => { },
  });

  const shouldUseFilteredList = useCallback(() => {
    const st = store.getState();
    const s = st?.helper?.filterBysearch?.search ?? "";
    const tabPay = st?.helper?.commonFilterPayload?.[TAB_KEY];
    const hf = !!(tabPay && typeof tabPay === "object" && Object.keys(tabPay).length > 0);
    return hf || String(s).trim() !== "";
  }, []);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreateGroupPress = useCallback(() => {
    if (profile?.plan?.length && profile?.plan[0]?.isActive == "started") {
      navigation.navigate("CreateGroup");
      InteractionManager.runAfterInteractions(() => {
        SetItem("Adddressdata", "");
      });
    } else {
      setIsModalVisible(true);
    }
  }, [navigation, profile?.plan]);

  const isHiddenFromFeed = item => {
    const hideFlags = [
      item?.ishidegroup,
      item?.hide_group,
      item?.hideFromFeeds,
      item?.isHidden,
    ];

    return hideFlags.some(
      flag => flag === true || flag === 'true' || flag === 1 || flag === '1'
    );
  };

  const getCurrentChatMembersList = useCallback(
    () => store.getState()?.helper?.chatMembersList || [],
    [],
  );

  const visibleChatGroups = useMemo(
    () => (chatMembersList || []).filter(
      item => item?.isGroupchat && !isHiddenFromFeed(item)
    ),
    [chatMembersList],
  );

  /** All group hobbies (mutual first) — matches Group Details; +N uses full count. */
  const getDisplayedGroupHobbies = useCallback((groupHobbies) => {
    return getHobbiesWithMutualSorted(profile?.hobbies, groupHobbies);
  }, [profile?.hobbies]);


  useFocusEffect(
    useCallback(() => {
      // Sync Redux activeTab AFTER focus is committed. Doing this from the
      // tab navigator with useNavigationState/screenListeners was racing the
      // pager's commit and snapping the swipe back. From a tab screen's
      // useFocusEffect the dispatch can only run once the tab is fully
      // focused, so the gesture is already settled.
      dispatch(update_filterBySearch({ activeTab: "Chat" }));
    }, [dispatch])
  );

  /**
   * Re-read the device GPS every time this screen is focused.  This catches
   * the "mock-GPS turned off mid-session" case (Redux/MMKV would still hold
   * the fake coords until the app is backgrounded).  We pass
   * `requestIfNeeded:false` so the user is never re-prompted for permission;
   * if permission was previously granted the call completes quickly with a
   * fresh fix.  When the fresh coords differ from what's in Redux, the
   * `activeLocKey` derived above changes and the list refetches automatically.
   *
   * A short cooldown is used to avoid hammering Geolocation if the screen is
   * focused repeatedly within a couple of seconds (e.g. quick tab swipes).
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
      // `silent: true` skips the geocoder loop (fast).  The coords are
      // dispatched immediately, so `activeLatLong` updates as soon as
      // Geolocation returns the fresh fix.
      bootstrapCurrentLocation(dispatch, {
        requestIfNeeded: false,
        silent: true,
      }).catch(() => { });
    }, [dispatch, hasFilter]),
  );

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (!isFocused) {
          // If the chat tab is backgrounded during a session reset,
          // clear the blocking loader immediately so the user doesn't
          // see a stuck spinner when they eventually switch back.
          setFirstLoading(false);
          return;
        }

        if (!isOnline) {
          setFirstLoading(false);
          dispatch(update_NetworkVisible(true));
          return;
        }

        const shouldFilter = hasFilter || debouncedSearchQuery !== "";
        const fetchKey = `${debouncedSearchQuery || ""}|${shouldFilter ? "filtered" : "plain"}|${activeLocKey}`;

        // Same key + non-empty list → tab was already showing fresh data.
        // Skip refetch entirely so swiping back to this tab doesn't cause
        // any visible work.
        if (
          lastSuccessfulGroupFetchKeyRef.current === fetchKey &&
          visibleChatGroups.length > 0
        ) {
          return;
        }

        // Different key but we still have items on screen → those items
        // are stale (different location / filter / search).  Wipe them
        // before kicking the fetch so the user sees a centered loader
        // instead of an "old → new" data swap.  Skip on the very first
        // load (no previous successful key) so existing empty/loading
        // state is preserved.
        const staleData =
          lastSuccessfulGroupFetchKeyRef.current &&
          lastSuccessfulGroupFetchKeyRef.current !== fetchKey &&
          visibleChatGroups.length > 0;

        if (staleData) {
          dispatch(update_ChatMembersList([]));
        }

        dispatch(update_GroupFilter(false));

        setPage(1);
        setMaxreached(false);
        setSelectMes(false);
        lastFetchedPageRef.current = 0;

        // After a stale wipe `visibleChatGroups.length === 0` will be true
        // on the next render, but we check the boolean we already computed
        // so the loader state is right *now*.
        const willShowEmpty = staleData || visibleChatGroups.length === 0;

        // Mark the key BEFORE the fetch resolves so a quick re-focus
        // (swipe-out and swipe-back while still in flight) doesn't kick a
        // second concurrent fetch.  If the fetch ends up empty the list
        // remains empty and the dedup check above still allows the next
        // genuine focus/refresh to refetch (it also requires
        // `visibleChatGroups.length > 0`).
        lastSuccessfulGroupFetchKeyRef.current = fetchKey;

        if (shouldFilter) {
          const myGen = ++groupSearchFetchGenRef.current;
          if (willShowEmpty) {
            setFirstLoading(true);
            setLoading(false);
          } else {
            setFirstLoading(false);
            setLoading(true);
          }
          getFilteredChat(1, myGen);
        } else {
          if (willShowEmpty) {
            setFirstLoading(true);
            setLoading(false);
          } else {
            setFirstLoading(false);
            setLoading(true);
          }
          getAllchats(1);
        }

        if (User_Id) {
          JoinRoom(User_Id);
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

    // Fetch helpers are declared below and close over paging/list state; this
    // effect should only reset when the visible query/filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // FIX: replaced tabFilterPayload object ref with stable hasFilter boolean.
    // `activeLocKey` is included so the list refetches when the user updates
    // their location (filter / picker / reset). Without it, the API call
    // would keep using the location captured at first focus even after the
    // user picked a new one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFocused,
    isOnline,
    loginSts,
    hasFilter,
    debouncedSearchQuery,
    activeLocKey,
    dispatch,
    User_Id,
  ]);

  useEffect(() => {
    handleRemoveDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  // useEffect(() => {

  //   if (!isOnline) {
  //     dispatch(update_NetworkVisible(true));
  //     return
  //   }
  //   dispatch(update_GroupFilter(false));

  //   setPage(1)
  //   setMaxreached(false);



  //   if ((Object.keys(commonFilterPayload)?.length > 0 && commonFilterPayload?.activeTab == "Chat") || search != "") {

  //     setFirstLoading(true);
  //     getFilteredChat(1);

  //   }
  //   else {

  //     getAllchats(1);
  //   }


  //   JoinRoom(User_Id);
  //   setSelectMes(false);


  //   return (() => {
  //     setPage(1)
  //     setMaxreached(false)

  //   })

  // }, [isOnline, loginSts, commonFilterPayload, search])


  // useEffect(() => {
  //   handleRemoveDelete()
  // }, [activeTab])


  // const handleApiCall = async () => {
  //   if ((Object.keys(commonFilterPayload)?.length > 0 && commonFilterPayload?.activeTab == "Chat") || search != "") {
  //     return
  //   }
  //   else {
  //     setPage(1)
  //     getAllchats(1);
  //   }
  // }



  useEffect(() => {
    if (!socket) return;

    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    const refetchChats = () => {
      setPage(1);
      if (shouldUseFilteredList()) {
        listFetchFnsRef.current.getFiltered?.(1);
      } else {
        listFetchFnsRef.current.getAll?.(1);
      }
    };

    const handleInstanceResponse = response => {
      if (response?.isGroupchat) {
        refetchChats();
      }
    };

    const handleNewMembersAdd = response => {
      if (!isGroupChatEvent(response)) {
        return;
      }

      const eventInstanceId = getChatInstanceId(response);
      if (
        eventInstanceId &&
        !chatMembersList?.some(chat => String(chat?._id) === String(eventInstanceId))
      ) {
        return;
      }

      refetchChats();
    };

    const handleInstanceFormatRows = data => {
      if (data?.isGroupchat) {
        refetchChats();
      }
    };

    const handleTyping = data => {
      setTypinguser(data);
    };

    const handleStopTyping = (data) => {
      setTypinguser((prev) =>
        shouldClearTypingIndicator(prev, data, prev?.instanceId) ? "" : prev
      );
    };

    const handleDeleteResponse = () => {
      refetchChats();
    };

    const handleUnjoinGroup = () => {
      refetchChats();
    };

    socket.on("InstanceResponse", handleInstanceResponse);
    socket.on("NEW_MEMBERS_ADD", handleNewMembersAdd);
    socket.on("InstanceFormatRows", handleInstanceFormatRows);
    socket.on("TYPING", handleTyping);
    socket.on("STOPTYPING", handleStopTyping);
    socket.on("deleteResponse_me", handleDeleteResponse);
    socket.on("deleteResponse_every", handleDeleteResponse);
    socket.on("UnjoinGroup", handleUnjoinGroup);

    return () => {
      socket.off("InstanceResponse", handleInstanceResponse);
      socket.off("NEW_MEMBERS_ADD", handleNewMembersAdd);
      socket.off("InstanceFormatRows", handleInstanceFormatRows);
      socket.off("TYPING", handleTyping);
      socket.off("STOPTYPING", handleStopTyping);
      socket.off("deleteResponse_me", handleDeleteResponse);
      socket.off("deleteResponse_every", handleDeleteResponse);
      socket.off("UnjoinGroup", handleUnjoinGroup);
    };
    // Avoid re-registering socket listeners for every list/pagination update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, shouldUseFilteredList, chatMembersList])

  const getAllchats = async (count) => {

    if (count != 1) {
      if (apiCalled || count <= lastFetchedPageRef.current) {
        return;
      }
      setApiCalled(true);

    }

    try {
      let payload = {
        userId: GetItem("UserId"),
        type: "groupchat",
        page: count,
        limit: 10
      };

      // Always scope the chat feed by the user's current effective location
      // (device GPS or manually-picked location). Without this, the backend
      // falls back to the stored user profile location and groups created in
      // another city leak into the feed.
      console.log("activeLatLong----------->>", activeLatLong);
      if (activeLatLong) {
        payload.latitude = activeLatLong.latitude;
        payload.longitude = activeLatLong.longitude;
      }

      if (payload?.page == 1) {
        setMaxreached(false)
      }


      if (!maxreached || count == 1) {

        dispatch(update_Filtered(false));
        const result = await getAllMembersapi(payload);
        console.log("Group screen getAllMembersapi result:", result);

        setPage(count + 1)

        if (result?.status) {
          if (result?.data?.length > 0) {
            const rows = result?.data || [];

            if (rows.length < 10) {
              setMaxreached(true);
            }

            if (count == 1) {
              lastFetchedPageRef.current = 1;
              dispatch(update_ChatMembersList(JSON.parse(JSON.stringify(rows))));
            }
            else {
              const existing = getCurrentChatMembersList();
              const { list, added } = appendUniqueGroups(existing, rows);
              if (added > 0) {
                lastFetchedPageRef.current = count;
                dispatch(update_ChatMembersList(JSON.parse(JSON.stringify(list))));
              } else {
                setMaxreached(true);
              }
            }

          }
          else if (result?.data?.length == 0 && count == 1) {
            setMaxreached(false);
            dispatch(update_ChatMembersList([]));
          }
          else if (result?.data?.length == 0 && count > 1) {
            setMaxreached(true);
          }
        }

      }
    } catch (error) {
    }
    finally {
      setApiCalled(false)
      setFirstLoading(false)
      setLoading(false)
      setRefreshing(false)
    }
  };

  const getFilteredChat = async (count, fetchGen) => {

    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      if (count === 1) {
        setFirstLoading(false);
        setLoading(false);
        setRefreshing(false);
      }
      return
    }

    const query = debouncedSearchQuery;
    const myGen =
      fetchGen ?? (count === 1 ? ++groupSearchFetchGenRef.current : groupSearchFetchGenRef.current);

    try {

      if (count != 1) {
        if (apiCalled || count <= lastFetchedPageRef.current) {
          return;
        }
        setApiCalled(true);
      }

      let payload = {
        userId: User_Id,
        page: count,
        limit: 10,
      }

      if (query !== "") {
        payload.type = "searchgroup";
        payload.chatname = query;
        payload.grouphobbies = []
      }
      else {
        payload.type = "filter";
        payload.chatname = "";
        const hobbyIds = (Array.isArray(tabFilterPayload?.hobbies) ? tabFilterPayload.hobbies : [])
          .map((h) => (typeof h === "string" ? h : h?._id))
          .filter(Boolean);
        payload.grouphobbies = JSON.stringify(hobbyIds);
      }

      if (tabFilterPayload?.latLong) {
        const ll = tabFilterPayload.latLong;
        const lat = ll?.lat ?? ll?.latitude;
        const lng = ll?.long ?? ll?.longitude;
        if (
          lat != null &&
          lng != null &&
          !Number.isNaN(Number(lat)) &&
          !Number.isNaN(Number(lng))
        ) {
          payload.latitude = Number(lat);
          payload.longitude = Number(lng);
        }
      }
      // Fallback: if the user typed in the search bar but did not apply the
      // advanced filter, still scope the search by their current location so
      // results don't span the whole country.
      if ((payload.latitude == null || payload.longitude == null) && activeLatLong) {
        payload.latitude = activeLatLong.latitude;
        payload.longitude = activeLatLong.longitude;
      }
      if (tabFilterPayload?.distance >= 0) {
        payload.distance = tabFilterPayload?.distance
      }

      if (count == 1) {
        setMaxreached(false);
      }
      if (!maxreached || count == 1) {

        dispatch(update_Filtered(true))

        // Diagnostic — confirms the centre & radius leaving the device for
        // every group search (advanced filter, search box, or both).
        console.log("Group screen GetFilteredGroups payload →", {
          type: payload.type,
          page: payload.page,
          chatname: payload.chatname,
          latitude: payload.latitude,
          longitude: payload.longitude,
          distance: payload.distance,
          grouphobbies: payload.grouphobbies,
        });

        const result = await GetFilteredGroups(payload)
        console.log("Group screen GetFilteredGroups result:", result);
        // Backend-side diagnostics (only present for `type=filter` calls).
        // Tells us geoOnlyCount / withBaseFiltersCount / withHobbiesCount so
        // we can see *why* the list is empty without needing backend logs.
        if (result && result._debug) {
          console.log("Group screen GetFilteredGroups _debug →", result._debug);
        }

        if (myGen !== groupSearchFetchGenRef.current) {
          return;
        }

        setPage(payload?.page + 1)

        if (result?.status) {
          const rows = Array.isArray(result?.data) ? result.data : [];

          if (rows.length > 0) {
            if (rows.length < 10) {
              setMaxreached(true);
            }
            if (count == 1) {
              lastFetchedPageRef.current = 1;
              dispatch(update_ChatMembersList(JSON.parse(JSON.stringify(rows))));
            }
            else {
              const existing = getCurrentChatMembersList();
              const { list, added } = appendUniqueGroups(existing, rows);
              if (added > 0) {
                lastFetchedPageRef.current = count;
                dispatch(update_ChatMembersList(JSON.parse(JSON.stringify(list))));
              } else {
                setMaxreached(true);
              }
            }
          }
          else {
            if (count == 1) {
              dispatch(update_ChatMembersList([]));
            }
            if (query !== "") {
              if (count > 1) {
                setMaxreached(true);
              }
            }
            else {
              setMaxreached(true);
            }
          }
        }
      }
    } catch (error) {
    }
    finally {
      if (count === 1) {
        setFirstLoading(false);
        setLoading(false);
        setRefreshing(false);
        setApiCalled(false);
      }
    }
  }

  listFetchFnsRef.current.getFiltered = getFilteredChat;
  listFetchFnsRef.current.getAll = getAllchats;

  const detailfn = (e) => {

    const otherMembers = e?.members.filter((data) => data?._id != User_Id);
    const currentUser = e?.members.find((data) => data?._id == User_Id);
    const updatedMembers = otherMembers.map((membArr) => ({
      _id: membArr?._id,
      name: membArr?.name,
      MychatDiscription: membArr?.MychatDiscription,
      online_status: false,
      bioimage: membArr?.bioimage,
      randomIndex: membArr?.randomIndex,
      username: membArr?.username,
      userblocked: membArr?.userblocked,
      profile: membArr?.profile,
    }));

    if (currentUser) {
      updatedMembers.push({
        _id: currentUser?._id,
        name: currentUser?.name,
        MychatDiscription: currentUser?.MychatDiscription,
        online_status: false,
        bioimage: currentUser?.bioimage,
        randomIndex: currentUser?.randomIndex,
        username: currentUser?.username,
        userblocked: currentUser?.userblocked,
        profile: currentUser?.profile,
      });
    }

    const CurrentMessage = {
      groupmembers: e?.members?.map((data) => data?._id)
    }

    const passLoad = {
      ...e,
      members: updatedMembers,
      CurrentMessage: e?.CurrentMessage || CurrentMessage,
      isPrivate: e?.isPrivate
    }

    if (!e?.isGroupchat) {
      passLoad.profile = updatedMembers[0]?.profile;
      passLoad.randomIndex = updatedMembers[0]?.randomIndex;
      passLoad.chatName = updatedMembers[0]?.username;
    }

    navigation.navigate("GroupDetails", { detail: passLoad, pageFrom: "Chat" });

    // if (e?.isGroupchat && checkUserIdNotPresent(e?.members)) {
    //   return
    // }
    // else {
    //   // navigation.navigate("ChatGroup", { detil: passLoad, pageFrom: "Chat" });
    // navigation.navigate("GroupDetails", { detail: passLoad, pageFrom: "Chat" });
    //   //navigation.navigate("ActivityDetail", { detail: { eventId: e?._id, pageFrom: "ChatGroup" } })
    // }
  };

  const handleScrollEnd = (evt) => {

    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return
    }

    let shouldLoad = false;
    if (evt?.layoutMeasurement && evt?.contentOffset && evt?.contentSize) {
      const { layoutMeasurement, contentOffset, contentSize } = evt;
      shouldLoad =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    } else {
      return;
    }

    if (!shouldLoad) {
      return;
    }

    if (maxreached) {
      setLoading(false);
      return;
    }

    if (apiCalled || endReachLockRef.current) {
      return;
    }

    endReachLockRef.current = true;
    setLoading(true);

    const nextPage = page;
    const done = () => {
      endReachLockRef.current = false;
    };

    if ((hasFilter) || debouncedSearchQuery !== "") {
      getFilteredChat(nextPage).finally(done);
    }
    else {
      getAllchats(nextPage).finally(done);
    }

  };

  const handleDeleteChat = async (e) => {
    const itemId = e?._id;
    const getData = [...chatMembersList];
    const index = getData.findIndex(item => item._id === itemId);

    if (index !== -1) {
      getData[index] = { ...getData[index], isFocusDelete: !getData[index].isFocusDelete };

      dispatch(update_ChatMembersList(getData));
      setMsgDelete((prev) => {
        const itemExists = prev.some((item) => item._id === itemId);
        if (itemExists) {
          return prev.filter((item) => item._id !== itemId);
        } else {
          return [...prev, { _id: itemId }];
        }
      });

      const result = getData.find((item) => item.isFocusDelete);
      setSelectMes(!!result);
    }
  }

  const handleDeleteInstance = async () => {
    try {

      let payload = {
        userId: User_Id,
        instanceId: JSON.stringify(msgDelete),
      }

      const result = await DeleteInstance(payload);
      setSelectMes(false);
      setMsgDelete([]);

      if (result?.status) {

        const filter = chatMembersList?.filter((mem) => {
          return !msgDelete?.some((msg) => msg._id == mem._id);
        });

        dispatch(update_ChatMembersList(filter));

      }

    } catch (error) {
    }
  }

  const handleRemoveDelete = () => {

    const updatedMembersList = JSON.parse(JSON.stringify(chatMembersList)); // Deep copy
    msgDelete.forEach(itemToRemove => {
      const index = updatedMembersList.findIndex(item => item._id === itemToRemove._id);

      if (index !== -1) {
        updatedMembersList[index].isFocusDelete = !updatedMembersList[index].isFocusDelete;
      }
    });


    dispatch(update_ChatMembersList(updatedMembersList));  // Dispatch updated list
    const result = updatedMembersList.find(item => item.isFocusDelete);
    setSelectMes(!!result); // Update selectMes based on isFocusDelete status
    setMsgDelete([]); // Reset msgDelete state
  };

  const handleAlert = () => {

    Alert.alert(t('Holdon!'), t('you_want_deleteChats'), [
      {
        text: t('Cancel'),
        onPress: () => handleRemoveDelete(),
        style: 'cancel',
      },
      {
        text: t('YES'),
        onPress: () => handleDeleteInstance(),
      },
    ]);
  }

  const onRefresh = async () => {

    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return
    }

    setRefreshing(true);
    setPage(1);
    lastFetchedPageRef.current = 0;
    // Reset the dedup tracker so the refetch is allowed even if the active
    // key hasn't changed (pull-to-refresh = "I want fresh data now").
    lastSuccessfulGroupFetchKeyRef.current = null;
    if (visibleChatGroups.length === 0) {
      setFirstLoading(true);
    }

    // Pull-to-refresh = "give me the latest data for where I am right
    // now".  Re-read the device GPS so the request reflects any movement
    // since the screen was last focused.  Bypass the focus cooldown via
    // the same ref used by the focus effect; `silent:false` lets the
    // geocoder retry on transient failures.
    lastGpsRefreshAtRef.current = Date.now();
    try {
      await bootstrapCurrentLocation(dispatch, {
        requestIfNeeded: false,
        silent: false,
      });
    } catch { }

    if ((hasFilter) || debouncedSearchQuery !== "") {
      await getFilteredChat(1);
    }
    else {
      await getAllchats(1);
    }
  };

  const handleGroupJoin = async (data, type, index) => {
    try {

      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return
      }

      let payload = {
        userId: User_Id,
        instanceId: data?._id,
        type: type,
        isGroupchat: true
      }

      setApiCalled(true);
      const result = await GroupJoinandUnjoin(payload);
      setApiCalled(false)



      if (result?.status) {
        if (type == "unjoingroup") {
          //ShowToast(t('You_are_successfully_leave_the') + data?.chatName + t('Conversation'))
        }

        if (data?.isPrivate && type != "unjoingroup") {
          let updatedChatMembersList = [...chatMembersList];
          let local = updatedChatMembersList[index]?.requestedUsers || [];

          let currentMemb = {
            "_id": profile?._id,
            "username": profile?.username,
            "profile": profile?.profile,
            "randomIndex": profile?.randomIndex,
            "userblocked": []
          };

          let updatedMembers = [...local, currentMemb];

          updatedChatMembersList[index] = {
            ...updatedChatMembersList[index],
            requestedUsers: updatedMembers
          };
          console
          dispatch(update_ChatMembersList(updatedChatMembersList));

        }
        else {
          let updatedChatMembersList = chatMembersList?.filter((group) => group?._id != data?._id)
          dispatch(update_ChatMembersList(updatedChatMembersList));
        }


      }
    } catch (error) {
      console.log("Error on handleGroupJoin: ", error);
    }
    finally {
      setApiCalled(false)
      setCurrectIndex((prev) => prev.filter((item) => item != data?._id));
    }
  }

  const checkUserIdPresent = (members) => {
    const isPresent = members?.some(member => member?._id == User_Id);
    return isPresent;
  }

  const checkUserIdNotPresent = (members) => {
    const isPresent = !members?.some(member => member?._id == User_Id);
    return isPresent;
  }

  const callFilter = () => {
    if (debouncedSearchQuery !== "") {
      getFilteredChat(1);
    }
    else {
      navigateToFilterPage(navigation, "Chat");
    }
  }

  const handleNaigatePremium = async () => {
    setIsModalVisible(false)
    navigation.navigate("Premium")
  }


  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={{ flex: 1, height: "100%", width: "100%" }}>
        <View style={{ width: "98%", height: "100%", alignSelf: "center", marginTop: "2%" }}>
          <View style={{ alignItems: "flex-end", marginBottom: "2%" }}>
            {selectMes ? (
              <Pressable onPress={() => handleAlert()} style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 2, alignItems: "center", justifyContent: "center" }} >
                <View style={{ width: "80%", height: "80%", borderRadius: borderradius * 3, backgroundColor: c.secondary, justifyContent: "center", alignItems: "center" }} >
                  {Images.delete}
                </View>
              </Pressable>
            ) : filtered ? (
              <Pressable onPress={() => {

                setFirstLoading(true);

                dispatch(update_ChatFilterHoobies([]))
                dispatch(update_filterBySearch({ search: "" }))

                dispatch(update_CommonFilterPayload({ activeTab: TAB_KEY, clear: true }));
                dispatch(update_PeopleFilterHobbies([]));
                resetFilterLocation(dispatch, TAB_KEY);
                RemoveItem(`RadiusFilter:${TAB_KEY}`);
                RemoveItem(`hobbiesFilter:${TAB_KEY}`);

              }}>
                <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(14), textAlign: "center", }}>{t('Reset')}</Text>
              </Pressable>
            ) : null}
          </View>
          {
            (visibleChatGroups.length === 0 && (firstLoading || loading)) ?
              <View style={{ height: "92.5%", paddingBottom: "2.5%", justifyContent: "center" }} >
                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
              </View>
              :
              <View>
                {visibleChatGroups?.length <= 0 ?
                  <View style={{ height: "81%", justifyContent: "center", alignItems: "center", }}>

                    <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(14), textAlign: "center", }}>
                      {debouncedSearchQuery === "" ? t('NoGroupsFound') : t('NoGroupsMatchYourSeachCriteria')}
                    </Text>
                    {(filtered || !visibleChatGroups?.length) &&
                      <Pressable onPress={() => onRefresh()} style={{ alignSelf: "center", alignContent: "center", justifyContent: "center", marginTop: 10, borderWidth: 1, borderColor: c.white, borderRadius: 30 }}>
                        <Text style={{ fontFamily: Fonts.SemiBold, color: c.white, fontSize: RFValue(16), textAlign: "center", paddingHorizontal: 25, paddingVertical: 4 }}>{t('Retry')}</Text>
                      </Pressable>
                    }
                  </View>
                  :
                  <View style={{ width: "100%", height: "100%" }}>

                    <ScrollView
                      onScroll={({ nativeEvent }) => {
                        if (activeTab == "Chat") {
                          handleScrollEnd(nativeEvent)
                        }
                      }}
                      contentContainerStyle={{ paddingBottom: deviceheight * 0.18 }}
                      scrollEventThrottle={400}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          colors={['#9Bd35A', '#689F38']}
                          progressBackgroundColor="#ffffff"
                        />
                      }
                      showsVerticalScrollIndicator={false}>

                      <View>

                        <View>
                          {visibleChatGroups?.length > 0 &&
                            <>
                              {visibleChatGroups?.map((e, index) => {
                                const displayedGroupHobbies = getDisplayedGroupHobbies(e?.grouphobbies);

                                return (

                                  <React.Fragment key={e?._id || e?.chatId || e?.id || index}>
                                    {
                                      (e?.isGroupchat ||
                                        (!e?.isGroupchat && e?.members?.find((data) => data?._id == User_Id) && e?.CurrentMessage?._id != "")
                                      ) && (
                                        <>
                                          <View style={styles.card}>
                                            <View style={{ flex: 1, }}>

                                              <LongPressGestureHandler
                                                minDurationMs={150}>

                                                <View
                                                  style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, e.isFocusDelete && styles.highlightedButton]}>

                                                  <Pressable style={{ width: "100%" }}
                                                    onPress={() => {
                                                      if (selectMes) {
                                                        if (e?.groupCreater?._id !== User_Id) {
                                                          handleDeleteChat(e, index);
                                                        }
                                                      } else {
                                                        detailfn(e);
                                                      }
                                                    }
                                                    }>
                                                    <View style={{ width: "100%", }}>

                                                      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>

                                                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>

                                                          {e?.isGroupchat && (
                                                            <>
                                                              {e?.Image ? (

                                                                <Image
                                                                  style={{
                                                                    width: devicewidth * 0.14,
                                                                    height: devicewidth * 0.14,
                                                                    borderRadius: borderradius * 5,
                                                                  }}
                                                                  source={{ uri: `${Imageurl}${e?.Image}`, }}
                                                                  resizeMode="cover"
                                                                />
                                                              ) : (
                                                                <View style={{ width: devicewidth * 0.14, height: devicewidth * 0.14, }}>
                                                                  <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5, }}
                                                                    source={randomimages[e?.groupIndex]}
                                                                    resizeMode="cover" />
                                                                </View>
                                                              )}
                                                            </>

                                                          )}

                                                          <View style={{ marginLeft: "5%", flex: 1, minWidth: 0, paddingRight: "2%" }}>
                                                            <Text style={styles.gptitle} numberOfLines={2}>
                                                              {e?.chatName}
                                                            </Text>
                                                            {e?.groupDiscription &&
                                                              <Text style={styles.gpsubtitle} numberOfLines={2}>
                                                                {e?.groupDiscription?.length > 30 ? e?.groupDiscription.slice(0, 27) + "..." : e?.groupDiscription}
                                                              </Text>
                                                            }

                                                          </View>


                                                        </View>

                                                        {e?.CurrentMessage?.chatId != User_Id && e?.UnreadMessageCount != 0 && e?.UnreadMessageCount &&
                                                          <View>
                                                            <View style={{ marginRight: "5%", flexDirection: "row" }}>
                                                              {Images.msgcomment}
                                                              <View style={{
                                                                borderRadius: (devicewidth * 0.15) / 2,
                                                                backgroundColor: "#fff",
                                                                width: devicewidth * 0.06,
                                                                height: devicewidth * 0.06,
                                                                justifyContent: "center"
                                                              }}>

                                                                <Text style={{
                                                                  fontFamily: Fonts.SemiBold,
                                                                  color: c.secondary,
                                                                  fontSize: RFValue(11),
                                                                  textAlign: "center",
                                                                  textAlignVertical: "center"
                                                                }}>
                                                                  {e?.UnreadMessageCount < 99 ? e?.UnreadMessageCount : "99+"}
                                                                </Text></View>
                                                            </View>


                                                          </View>
                                                        }
                                                      </View>

                                                      {/* New UI Add */}

                                                      <View style={styles.cardFooterRow}>

                                                        <View style={styles.cardHobbiesRow}>
                                                          {displayedGroupHobbies.length > 0 && (
                                                            <>
                                                              {displayedGroupHobbies.slice(0, 2).map((hobby, hobbyIndex) => (
                                                                <View key={hobbyIdString(hobby) || hobbyIndex} style={styles.hobbyView}>
                                                                  <Text style={styles.groupNametxt}>{(hobby?.hobbyname ?? hobby?.hobbyName)?.length > 8 ? (hobby?.hobbyname ?? hobby?.hobbyName)?.slice(0, 5) + "..." : (hobby?.hobbyname ?? hobby?.hobbyName)}</Text>
                                                                </View>
                                                              ))}

                                                              {displayedGroupHobbies.length > 2 && (
                                                                <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                                                  <Text style={styles.groupNametxt}>+{displayedGroupHobbies.length - 2}</Text>
                                                                </View>
                                                              )}
                                                            </>
                                                          )}
                                                        </View>

                                                        <View style={styles.cardFooterActions}>
                                                          <View style={styles.cardMemberCount}>
                                                            {Images.groupMembUn}
                                                            <Text style={styles.friendCounttxt}>{e?.members?.length}</Text>
                                                          </View>

                                                          {e?.groupCreater?._id == User_Id ? "" :
                                                            <View style={{}}>
                                                              {e?.isGroupchat ? (
                                                                checkUserIdPresent(e?.requestedUsers) ? (

                                                                  <View style={{
                                                                    width: devicewidth * 0.2,
                                                                    height: devicewidth * 0.065,
                                                                    borderRadius: (devicewidth * 0.15) / 2,
                                                                    backgroundColor: "#fff",
                                                                    alignItems: "center",
                                                                    justifyContent: "center"
                                                                  }}>

                                                                    <Text style={{
                                                                      fontFamily: Fonts.SemiBold,
                                                                      color: c.secondary,
                                                                      width: devicewidth * 0.2,
                                                                      fontSize: RFValue(13),
                                                                      textAlign: "center",
                                                                      alignContent: "center",
                                                                      textAlignVertical: "center",
                                                                      verticalAlign: "middle"
                                                                    }}>
                                                                      {t('Pending')}
                                                                    </Text>
                                                                  </View>
                                                                )
                                                                  :
                                                                  (
                                                                    checkUserIdNotPresent(e?.members) ? (
                                                                      <View style={{
                                                                        width: devicewidth * 0.2,
                                                                        height: devicewidth * 0.065,
                                                                        borderRadius: (devicewidth * 0.15) / 2,
                                                                        backgroundColor: "#fff",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                      }}>
                                                                        {apiCalled && currentIndex?.includes(e._id) ?
                                                                          <View style={{ height: devicewidth * 0.065, paddingBottom: "2.5%", justifyContent: "center" }} >
                                                                            <ActivityIndicator style={{ alignSelf: "center" }} color={c?.primary} size={"small"} />
                                                                          </View>
                                                                          :
                                                                          <Pressable
                                                                            style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
                                                                            onPress={() => {
                                                                              setCurrectIndex((prev) => [...prev, e?._id])
                                                                              handleGroupJoin(e, "joingroup", index)
                                                                            }}>
                                                                            <Text style={{
                                                                              fontFamily: Fonts.SemiBold,
                                                                              color: c.secondary,
                                                                              width: devicewidth * 0.2,
                                                                              fontSize: RFValue(10),
                                                                              textAlign: "center",
                                                                              alignContent: "center",
                                                                              textAlignVertical: "center",
                                                                              verticalAlign: "middle"
                                                                            }}>
                                                                              {t('Join')}
                                                                            </Text>
                                                                          </Pressable>
                                                                        }
                                                                      </View>
                                                                    )
                                                                      :
                                                                      (
                                                                        <View style={{
                                                                          width: devicewidth * 0.2,
                                                                          height: devicewidth * 0.065,
                                                                          borderRadius: (devicewidth * 0.15) / 2,
                                                                          backgroundColor: "#fff",
                                                                          alignItems: "center",
                                                                          justifyContent: "center"
                                                                        }}>
                                                                          {apiCalled && currentIndex?.includes(e._id) ?
                                                                            <View style={{ height: devicewidth * 0.065, paddingBottom: "2.5%", justifyContent: "center" }} >
                                                                              <ActivityIndicator style={{ alignSelf: "center" }} color={c?.primary} size={"small"} />
                                                                            </View>
                                                                            :

                                                                            <Pressable
                                                                              style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
                                                                              onPress={() => {
                                                                                setCurrectIndex((prev) => [...prev, e?._id])
                                                                                handleGroupJoin(e, "unjoingroup", index)
                                                                              }}>
                                                                              <Text style={{
                                                                                fontFamily: Fonts.Medium,
                                                                                color: c.secondary,
                                                                                width: devicewidth * 0.2,
                                                                                fontSize: RFValue(10),
                                                                                textAlign: "center",
                                                                                alignContent: "center",
                                                                                textAlignVertical: "center",
                                                                                verticalAlign: "middle",
                                                                              }}>
                                                                                {t('Leave_Group')}
                                                                              </Text>
                                                                            </Pressable>
                                                                          }
                                                                        </View>
                                                                      )
                                                                  )
                                                              ) : null}
                                                            </View>
                                                          }

                                                        </View>
                                                      </View>
                                                    </View>

                                                  </Pressable>

                                                </View>

                                              </LongPressGestureHandler>

                                            </View>

                                          </View>
                                        </>
                                      )}
                                  </React.Fragment>

                                )
                              }
                              )}
                            </>
                          }

                        </View>
                        {loading && visibleChatGroups?.length > 0 && (
                          <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }}>
                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                          </View>
                        )}
                      </View>

                    </ScrollView>
                  </View>
                }
              </View>
          }
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >

          <SafeAreaProvider>
            <SafeAreaView
              onStartShouldSetResponder={() => setModalVisible(false)}
              style={{ flex: 1 }}
            >
              <View
                onStartShouldSetResponder={() => setModalVisible(false)}
                style={{ flex: 1, }}
              >
                <View style={{
                  width: "100%",
                  position: "absolute",
                  right: "5%",
                  top: "21%",
                  alignItems: "flex-end",
                }}>
                  <View
                    style={{
                      width: "40%",
                      backgroundColor: c.secondary,
                      borderRadius: borderradius * 0.15,
                      justifyContent: "center",
                      paddingHorizontal: "3%",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setModalVisible(!modalVisible);
                        handleCreateGroupPress();
                      }}
                      style={{
                        flexDirection: "row",
                        marginHorizontal: "6%",
                        alignItems: "center",
                        paddingVertical: "10%",
                      }}
                    >
                      <View style={{ marginLeft: "6%" }}>
                        <Text
                          style={{
                            fontSize: RFValue(14),
                            fontFamily: Fonts.Medium,
                            color: c.white,
                          }}
                        >
                          {t('New_Group')}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </SafeAreaProvider>

        </Modal>

        <AlertPopup
          visible={isModalVisible}
          title="Note"
          onSubmit={() => handleNaigatePremium()}
          onClose={() => setIsModalVisible(false)} >
          <Text>{t('You_want_to_ubscribe')}</Text>
        </AlertPopup>

      </View>
      <Pressable
        onPress={handleCreateGroupPress}
        //onPress={() => navigation.navigate("CreateGroup")}
        style={{
          position: "absolute",
          bottom: Platform.OS == "android" ? "31%" : "26%",
          right: "0%",
        }} >
        <View style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 3, backgroundColor: c.white, justifyContent: "center", alignItems: "center", elevation: 1 }} >
          {Images.plusGroup}
        </View>
      </Pressable>
    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: borderradius * 0.4,
    backgroundColor: "#DF8B4D",
    borderColor: "#fff",
    borderWidth: 0.3,
    marginBottom: "4%",
    padding: "3%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center"
  },
  gptitle: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(14),
  },
  gpsubtitle: {
    fontFamily: Fonts.Regular,
    color: c.white,
    fontSize: RFValue(12),
    marginTop: 2,
  },
  cardFooterRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4%',
  },
  cardHobbiesRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    minWidth: 0,
    marginRight: 8,
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  cardMemberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },

  btntxt: {
    color: c.secondary,
    fontSize: RFValue(14),
    fontFamily: Fonts.Medium,
  },
  groupNametxt: {
    color: c.secondary,
    fontSize: RFValue(11),
    padding: 3,
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
  hobbyView: {
    width: "35%",
    height: deviceheight * 0.0355,
    borderRadius: borderradius * 1.4,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
    borderColor: c.white,
    alignSelf: "center",
  },
  organizerbtn: {
    width: "10%",
    borderRadius: borderradius * 0.3,
    height: deviceheight * 0.032,
    borderColor: c.white,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  lasttxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(13),
    marginLeft: "2%",
  },
  highlightedButton: {
    backgroundColor: c.voliet1,
    padding: 5,
    borderRadius: borderradius * 0.5,
  },
  friendCounttxt: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(16),
  },
});
