import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, Image, Dimensions, ImageBackground, TouchableOpacity, Alert, } from "react-native";
import { textInputPlaceholderCenter } from '../../Utilities/textInputLayout';
import LinearGradient from "react-native-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../Utilities/fonts";
import { c } from "../../Utilities/colors";
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import { Imageroute, Imageurl } from "../../Actions/constant";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { helperSelector, update_FetchProfileId, update_NetworkVisible, update_SingleChatCount, update_followingsDetails } from '../../Slices/helper';
import { useDispatch, useSelector } from "react-redux";
import { GetItem, SetItem } from "../../Actions/localstorage";
import { CommonSearch, hobbydatasearch, userfollowapi, UserUnFollow } from "../../Actions/hooks";
import { TapGestureHandler } from "react-native-gesture-handler";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from "react-i18next";
import Commonheader from "../../Navigation/commonheader";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet/src';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Fetchprofile, profileSelector } from "../../Slices/profile";
import { getMutualHobbiesSorted, hobbyIdString } from "../../Utilities/mutualHobbies";
import {
    getHobbyLimitModalMessage,
    isHobbyLimitEnforced,
} from "../../Actions/config";

const { width } = Dimensions.get('window');

const SEARCH_HOBBY_CACHE_KEYS = [
    "GroupFilterPage:HobbiesTree:v1",
    "CommonFilterPage:HobbiesTree:v1:People",
    "CommonFilterPage:HobbiesTree:v1:Chat",
    "CommonFilterPage:HobbiesTree:v1:Activities",
    "CommonFilterPage:HobbiesTree:v1",
];

function readSearchPageHobbyTree() {
    try {
        for (const k of SEARCH_HOBBY_CACHE_KEYS) {
            const c = GetItem(k);
            if (
                c &&
                typeof c === "object" &&
                Array.isArray(c.hobbiesList) &&
                c.hobbiesList.length > 0
            ) {
                return {
                    hobbiesList: c.hobbiesList,
                    popularHobbies: Array.isArray(c.popularHobbies) ? c.popularHobbies : [],
                };
            }
        }
    } catch {}
    return null;
}

export default function Searchpage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [search_bot, setSearchBot] = useState("");
    const [searchByHobbies, setSearchByHobbies] = useState(false);
    const { t } = useTranslation();

    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const [page, setPage] = useState(1)
    const [people, setPeople] = useState([])

    //loaders
    const [loading, setLoading] = useState(false);
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [endReached, setEndReached] = useState(false);

    const dispatch = useDispatch()

    const [emptyMsg, setEmptyMsg] = useState(t('No_Users_Found'));
    const [firstLoading, setFirstLoading] = useState(false);
    const [isfilter, setIsFilter] = useState(false);
    const [apiCalled, setApiCalled] = useState(false)
    const [currentIndex, setCurrectIndex] = useState([])
    const { isOnline } = useSelector(helperSelector)
    const [hobbiesBootstrap] = useState(() => readSearchPageHobbyTree());
    const [hobbiesList, setHobbiesList] = useState(
        () => hobbiesBootstrap?.hobbiesList ?? []
    );
    const hobbiesListRef = useRef(hobbiesBootstrap?.hobbiesList ?? []);
    /** Full hobby tree is always fetched with empty `hobbyname`; `search_bot` filters locally only. */
    const hobbyTreeFetchGenRef = useRef(0);
    const hobbyTreeLastLoadedPageRef = useRef(0);
    const friendSearchGenRef = useRef(0);
    const selectedHobbiesListRef = useRef(selectedHobbiesList);
    const endReachLockRef = useRef(false);
    const [selectedHobbiesList, setSelectedHobbiesList] = useState([]);
    const { followingsDetails } = useSelector(helperSelector);
    const [hobbyLoading, setHobbyLoading] = useState(
        () => !(hobbiesBootstrap?.hobbiesList?.length > 0)
    );
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const bottomSheetRef = useRef(null);
    const [pageLoad, setPageLoad] = useState(true);
    const [hobbyLimit, setHobbyLimt] = useState(5);
    const [popularHobbies, setPopularHobbies] = useState(
        () => hobbiesBootstrap?.popularHobbies ?? []
    );
    const [editable, setEditable] = useState(true);
    const { profile } = useSelector(profileSelector);

    const hobbySearchMissingSelection =
        searchByHobbies && !(selectedHobbiesList?.length > 0);

    const selectedHobbyIdsKey = useMemo(
        () => selectedHobbiesList.map((h) => hobbyIdString(h)).join(","),
        [selectedHobbiesList]
    );

    const stopSearchLoaders = useCallback(() => {
        setLoading(false);
        setFirstLoading(false);
        setFooterload(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        hobbiesListRef.current = hobbiesList;
    }, [hobbiesList]);

    useEffect(() => {
        selectedHobbiesListRef.current = selectedHobbiesList;
    }, [selectedHobbiesList]);

    useEffect(() => {
        if (!followingsDetails || Object.keys(followingsDetails).length === 0) {
            return;
        }

        // Batch updates into one state pass to avoid N re-renders.
        setPeople(prevPeople => {
            if (!Array.isArray(prevPeople) || prevPeople.length === 0) {
                return prevPeople;
            }

            let hasChanges = false;
            const next = prevPeople.map(person => {
                const nextDetails = followingsDetails[person?._id];
                if (!nextDetails || person?.followingsDetails === nextDetails) {
                    return person;
                }
                hasChanges = true;
                return { ...person, followingsDetails: nextDetails };
            });

            return hasChanges ? next : prevPeople;
        });
    }, [followingsDetails]);

    // useEffect(() => {
    //     handlehobbysearch(1);
    // }, [selectedHobbiesList])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);


    useEffect(() => {

        if (!isOnline) {
            setFirstLoading(false);
            setLoading(false);
            dispatch(update_NetworkVisible(true));
            return;
        }

        if (searchByHobbies) {
            if (!(selectedHobbiesList?.length > 0)) {
                friendSearchGenRef.current += 1;
                stopSearchLoaders();
                setPeople([]);
                setMaxreached(false);
                setPage(1);
                setEmptyMsg(t("None_Selected"));
                return;
            }
            handleFriendList(1);
            return;
        }

        if (debouncedSearch !== "") {
            handleFriendList(1);
        } else {
            setLoading(false);
            setFirstLoading(false);
            setPeople([]);
            setEmptyMsg(t("No_Users_Found"));
        }

    // This effect intentionally tracks search/filter inputs only; the loader
    // functions close over pagination state that should not retrigger fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, searchByHobbies, selectedHobbyIdsKey, stopSearchLoaders, t])

    const prefetchHobbies = useCallback(() => {
        if (!isOnline) {
            return;
        }
        setTimeout(() => {
            handlehobbysearch(1);
        }, 0);
        // handlehobbysearch is declared below; safe to call from here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);


    function getStableHeight(itemId) {
        const values = [0.225, 0.3, 0.275];
        const source = String(itemId || "");
        let hash = 0;

        for (let i = 0; i < source.length; i++) {
            hash = (hash * 31 + source.charCodeAt(i)) % values.length;
        }

        return values[Math.abs(hash) % values.length];
    }

    const handleFriendList = async (page) => {
        const myGen =
            page === 1 ? ++friendSearchGenRef.current : friendSearchGenRef.current;
        const hobbiesForSearch = selectedHobbiesListRef.current;

        try {
            if (searchByHobbies && !(hobbiesForSearch?.length > 0)) {
                stopSearchLoaders();
                if (page > 1) {
                    setMaxreached(true);
                }
                return;
            }

            if (!maxreached || page == 1) {
                const selectedID = hobbiesForSearch?.map((data) => data?._id);
                const payload = {
                    userId: GetItem("UserId"),
                    type: searchByHobbies ? "hobbies" : "users",
                    selectedHobbyId: JSON.stringify(selectedID),
                    page: page,
                    limit: 10,
                };

                if (searchByHobbies) {
                    payload.hobbyname = debouncedSearch;
                } else {
                    payload.name = debouncedSearch;
                }

                if (page == 1) {
                    setMaxreached(false);
                    setPage(1);
                    if (searchByHobbies) {
                        setPeople([]);
                        setFirstLoading(true);
                    } else if (people.length === 0) {
                        setFirstLoading(true);
                    } else {
                        setLoading(true);
                    }
                } else {
                    setFooterload(true);
                }

                const result = await CommonSearch(payload);

                if (myGen !== friendSearchGenRef.current) {
                    return;
                }

                setFooterload(false);
                setPage(page);
                setFirstLoading(false);

                dispatch(update_SingleChatCount(result?.SingleChatCounts));

                if (result?.data?.length > 0) {
                    if (result?.data?.length < 10) {
                        setMaxreached(true);
                    }

                    const convert = result?.data
                        ?.filter((e) => e.username)
                        ?.map((e) => ({
                            ...e,
                            height: getStableHeight(e?._id),
                        }));

                    if (page == 1) {
                        setPeople(convert);
                    } else {
                        setPeople((prevPeople) => {
                            const existingIds = new Set(
                                prevPeople.map((person) => person._id)
                            );
                            const newPeople = convert.filter(
                                (person) => !existingIds.has(person._id)
                            );
                            if (newPeople.length === 0) {
                                setMaxreached(true);
                            }
                            return [...prevPeople, ...newPeople];
                        });
                    }
                } else if (page == 1) {
                    setPeople([]);
                    setEmptyMsg(t("No_Users_Found"));
                } else {
                    setMaxreached(true);
                }
            }
        } catch (err) {
            if (myGen === friendSearchGenRef.current) {
                setFooterload(false);
                setFirstLoading(false);
            }
        } finally {
            if (myGen === friendSearchGenRef.current) {
                setLoading(false);
                setRefreshing(false);
                setFooterload(false);
                setFirstLoading(false);
                setIsFilter(false);
            }
        }
    };

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
                dispatch(update_followingsDetails({ id: e?._id, newDetails: result?.data }));
                dispatch(Fetchprofile(userID))

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
                ShowToast(t('Unfollowed') + " " + `${item?.username}`)
                dispatch(update_followingsDetails({ id: item?._id, newDetails: result?.data }));
                dispatch(Fetchprofile(userID))

            }

        } catch (error) {
        }
        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((data) => data != item._id));
        }
    }

    const updateFollowingsDetails = (id, newDetails) => {
        setPeople(prevPeople => {
            return prevPeople.map(person => {
                if (person._id === id) {
                    // If the IDs match, return a new object with updated followingsDetails
                    return {
                        ...person,
                        followingsDetails: newDetails // Update the followingsDetails
                    };
                }
                // Otherwise, return the person unchanged
                return person;
            });
        });
    };

    const numColumns = 2;

    const renderItems = () => {
        const handleHomeDetailFn = (item) => {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            dispatch(update_FetchProfileId(item?._id))
            navigation.navigate("HomeDetail", { detail: item, })
        };

        const columns = Array.from({ length: numColumns }, () => []);
        const columnHeights = Array(numColumns).fill(0);

        (people || []).forEach((item) => {
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            columns[shortestColumnIndex].push(item);
            columnHeights[shortestColumnIndex] += (item?.height || 0) * width * 0.2 + 10;
        });


        return columns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.column} >
                {column.map((item, index) => {
                    const mutualHobbies = getMutualHobbiesSorted(profile?.hobbies, item?.hobbies);
                    const showPlusBadge = mutualHobbies.length > 2;
                    const dualHobbies = mutualHobbies.length >= 2;
                    const firstPillMaxWidth = showPlusBadge ? "38%" : "52%";
                    return (
                    <TapGestureHandler key={String(item._id ?? item.id ?? index)} onActivated={() => { handleHomeDetailFn(item) }}>

                        <View
                            style={[styles.item,
                            {
                                height: item.height * width * 2,
                                backgroundColor: item.color,
                                borderColor: c.grey,
                                borderWidth: Platform.OS == 'android' ? 0.2 : 0.25,

                            },
                            ]}
                        >
                            <ImageBackground
                                resizeMode={!item?.profile ? "contain" : "cover"}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    zIndex: 9999,
                                    elevation: 5,
                                    justifyContent: "center",
                                }}
                                imageStyle={{ borderRadius: borderradius * 0.5 }}
                                borderRadius={borderradius * 0.5}
                                source={
                                    !(item?.profile)
                                        ? randomimages[item?.randomIndex]
                                        : { uri: `${Imageroute.PersonalProfile}${item?.profile}` }
                                }
                            >
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
                                                        <TapGestureHandler onActivated={() => {
                                                            setCurrectIndex((prev) => [...prev, item?._id])
                                                            handleUserUnFollowRequest(item)
                                                        }} >
                                                            <View style={{ marginLeft: "4%", }}>
                                                                {Images.profiletick}
                                                            </View>
                                                        </TapGestureHandler>

                                                        :

                                                        <TapGestureHandler onActivated={() => {
                                                            setCurrectIndex((prev) => [...prev, item?._id])
                                                            handleUserUnFollowRequest(item)
                                                        }} >
                                                            <View style={{ marginLeft: "4%", }}>
                                                                {Images.profilepending}
                                                            </View>
                                                        </TapGestureHandler>

                                                    }

                                                </>
                                                :
                                                <>
                                                    <TapGestureHandler onActivated={() => {
                                                        setCurrectIndex((prev) => [...prev, item?._id])
                                                        handleUserFollow(item)
                                                    }} >
                                                        <View style={{ marginLeft: "4%", }}>
                                                            {Images.profilereq}
                                                        </View>
                                                    </TapGestureHandler>
                                                </>
                                            }
                                        </>
                                    }
                                </View>

                                <View style={{ width: "100%", position: "absolute", bottom: 0, left: 0, right: 0, justifyContent: "space-around", paddingHorizontal: "5%", paddingVertical: "2.5%", marginTop: 5 }} >
                                    <Text style={{ color: "#fff", fontFamily: Fonts.SemiBold, fontSize: RFValue(15), marginBottom: 3 }} >{item?.username}</Text>
                                    {mutualHobbies.length > 0 && (
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }} >
                                            {mutualHobbies.slice(0, 2).map((hobby, hIdx) => {
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
                                                    : hIdx === 0
                                                    ? {
                                                          ...basePill,
                                                          flexGrow: 0,
                                                          flexShrink: 0,
                                                          maxWidth: firstPillMaxWidth,
                                                      }
                                                    : { ...basePill, flex: 1, minWidth: 0, flexShrink: 1 };
                                                return (
                                                <View key={hobbyIdString(hobby) || hIdx} style={pillStyle} >
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
                    </TapGestureHandler>
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

        const canLoadMore =
            searchByHobbies
                ? selectedHobbiesListRef.current?.length > 0
                : debouncedSearch !== "";

        if (
            isEndReached &&
            !loading &&
            !maxreached &&
            canLoadMore &&
            !endReachLockRef.current
        ) {
            endReachLockRef.current = true;
            const nextPage = page + 1; // Increment page directly
            setLoading(true); // Set loading state before fetching data
            handleFriendList(nextPage).finally(() => {
                endReachLockRef.current = false;
            });
        } else {
            setFooterload(false);
        }


    };

    const handleReferesh = () => {

        if (!isOnline) {
            setFirstLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }
        if (searchByHobbies) {
            if (!(selectedHobbiesList?.length > 0)) {
                friendSearchGenRef.current += 1;
                stopSearchLoaders();
                setPeople([]);
                setEmptyMsg(t("None_Selected"));
                return;
            }
            setRefreshing(true);
            setIsFilter(false);
            handleFriendList(1);
            return;
        }

        if (debouncedSearch !== "") {
            setRefreshing(true);
            setIsFilter(false);
            handleFriendList(1);
        } else {
            setPeople([]);
            setEmptyMsg(t("No_Users_Found"));
        }
    }


    const handlehobbysearch = async (count) => {
        const myGen = ++hobbyTreeFetchGenRef.current;
        try {
            if (!maxreached || count == 1) {

                var payload = {
                    "userId": userID,
                    "hobbyname": "",
                    "page": count,
                    "limit": 20
                }

                if (count == 1) {
                    hobbyTreeLastLoadedPageRef.current = 0;
                    setPageLoad(true)
                    setPage(1)
                    setMaxreached(false)
                    if (!hobbiesListRef.current?.length) {
                        setHobbyLoading(true);
                    }
                }
                else {
                    setFooterload(true)
                }

                const result = await hobbydatasearch(payload)

                if (myGen !== hobbyTreeFetchGenRef.current) {
                    return;
                }

                setPage(count)
                setHobbyLimt(result?.HobbyLimit);

                if (result?.status) {
                    if (result?.data?.length > 0) {
                        if (result?.data?.length < payload?.limit) {
                            setMaxreached(true);
                        }
                        hobbyTreeLastLoadedPageRef.current = count;
                        setPopularHobbies(result?.PopularHobbies);
                        if (count == 1) {
                            setHobbiesList(result?.data);
                            try {
                                SetItem("GroupFilterPage:HobbiesTree:v1", {
                                    ts: Date.now(),
                                    hobbiesList: result.data,
                                    popularHobbies: result?.PopularHobbies ?? [],
                                    hobbyLimit: result?.HobbyLimit ?? 5,
                                });
                            } catch {}
                        }
                        else {
                            setHobbiesList((prev) => [
                                ...(Array.isArray(prev) ? prev : []),
                                ...(Array.isArray(result?.data) ? result.data : []),
                            ]);
                        }
                    }
                    else if (count == 1) {
                        setHobbiesList([]);
                        setPopularHobbies([]);
                    }
                    else {
                        setMaxreached(true);
                    }
                }

                setPageLoad(false)
            }

        }
        catch (err) {
            console.log("Error on handlehobbysearchStack: ", err);
        }
        finally {
            if (myGen === hobbyTreeFetchGenRef.current) {
                setPageLoad(false)
                setFooterload(false)
                setHobbyLoading(false);
            }
        }
    }

    const snapPoints = useMemo(() => ["90%"], []);

    const openSearchBox = () => {
        setIsBottomSheetVisible(true);
        bottomSheetRef.current.present();
        prefetchHobbies();
    };

    const filteredHobbies = useMemo(() => {
        const result = [];

        const q = String(search_bot ?? "").trim().toLowerCase();

        hobbiesList.forEach(category => {
            category.subcategory?.forEach(sub => {
                // Nested hobbies
                if (Array.isArray(sub.Hobbies)) {
                    sub.Hobbies.forEach(hobby => {
                        const name = String(hobby?.hobbyname ?? "").toLowerCase();
                        if (name.includes(q)) {
                            result.push({
                                _id: hobby._id,
                                hobbyname: hobby.hobbyname,
                                originalData: hobby
                            });
                        }
                    });
                }

                // Direct hobby
                const subName = String(sub?.hobbyname ?? "").toLowerCase();
                if (subName && subName.includes(q)) {
                    result.push({
                        _id: sub._id,
                        hobbyname: sub.hobbyname,
                        originalData: sub
                    });
                }
            });
        });

        return result;
    }, [hobbiesList, search_bot]);


    const handleRemoveInterest = useCallback((interest) => {
        const id = hobbyIdString(interest);
        setSelectedHobbiesList((prev) =>
            prev.filter((h) => hobbyIdString(h) !== id)
        );
    }, []);

    const isInterestAdded = useCallback(
        (subcategory) => {
            const id = hobbyIdString(subcategory);
            if (!id) return false;
            return selectedHobbiesList.some(
                (hobby) => hobbyIdString(hobby) === id
            );
        },
        [selectedHobbiesList]
    );

    const handlesetfn = useCallback(
        (subcategory) => {
            const id = hobbyIdString(subcategory);
            if (!id) return;

            if (selectedHobbiesList.some((hobby) => hobbyIdString(hobby) === id)) {
                setSelectedHobbiesList((prev) =>
                    prev.filter((h) => hobbyIdString(h) !== id)
                );
                return;
            }

            try {
                if (
                    selectedHobbiesList?.length >= hobbyLimit &&
                    isHobbyLimitEnforced(profile)
                ) {
                    // Second arg skips ShowToast formatMessage (which lowercases Meetwave / To).
                    ShowToast(getHobbyLimitModalMessage(hobbyLimit, t), true);
                    return;
                }

                const setData = {
                    _id: subcategory._id,
                    hobbyname:
                        subcategory?.hobbyname ?? subcategory?.hobbyName ?? "",
                };
                setSelectedHobbiesList((prev) => [...prev, setData]);
            } catch (error) {
                console.log("Error-->", error);
            }
        },
        [selectedHobbiesList, hobbyLimit, profile?.plan, t]
    );

    const renderItem = useCallback(
        ({ item }) => (
        <TouchableOpacity
            key={item._id}
            onPress={() => handlesetfn(item.originalData ?? item)}
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

        </TouchableOpacity >
    ),
        [handlesetfn, isInterestAdded]
    );

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={Platform.OS === "android" ? 0.6 : 0.4}
            />
        ),
        []
    );






    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Commonheader
                    title={t('Quick_Search')}
                    onback={() => navigation.goBack()
                    }
                />

                <View style={{ width: "90%", alignSelf: "center", marginBottom: deviceheight * 0.03, alignItems: "center", justifyContent: "center", }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: "center", marginTop: 10 }}>

                        <Pressable style={styles.searchcontainer} onPress={() => {
                            if (searchByHobbies) {
                                openSearchBox()
                            }
                        }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: "100%" }}>

                                <View style={{ width: "10%", justifyContent: "center" }}>{Images.search1}</View>

                                <TextInput
                                    placeholderTextColor={'#F7E5D0'}
                                    placeholder={t('Quick_Search')}
                                    value={search}
                                    editable={!searchByHobbies}
                                    EventGroupList style={styles.inputtxtstyle}
                                    onChangeText={setSearch}
                                />

                                <View style={{ width: "10%", alignItems: "center", padding: "4%", }}>
                                    {search != "" &&
                                        <Pressable
                                            style={{
                                                width: devicewidth * 0.0530,
                                                height: devicewidth * 0.0530,
                                                borderRadius: borderradius * 2,
                                                borderWidth: 0.9,
                                                borderColor: c.white,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                            onPress={() => setSearch("")}>
                                            {Images.close1}
                                        </Pressable>


                                    }
                                </View>

                            </View>
                        </Pressable>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>

                        <Pressable onPress={() => {
                            setSearch("")
                            setSearchByHobbies(false)
                            setEditable(true)
                            setSelectedHobbiesList([])
                        }}
                            style={[
                                styles.selectType,
                                !searchByHobbies && styles.activeType
                            ]}
                        >
                            <Text style={styles.typeName}>{t('Search_user_name')}</Text>
                        </Pressable>

                        <Pressable onPress={() => {
                            setSearchByHobbies(true);
                            setEditable(false);
                            openSearchBox();
                        }}
                            style={[
                                styles.selectType,
                                searchByHobbies && styles.activeType
                            ]}
                        >
                            <Text style={styles.typeName}>{t('Search_by_hobby')}</Text>
                        </Pressable>

                    </View>

                </View>

                <View style={{ width: "90%", height: deviceheight * 0.70, justifyContent: "center", alignSelf: "center", }}>

                    {people?.length == 0 ?

                        <View style={{ width: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: "6%" }}>
                            {firstLoading ? (
                                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                            ) : (
                                <Text style={styles.emptyStateText}>
                                    {emptyMsg}
                                </Text>
                            )}
                        </View>

                        :

                        <View style={{ flex: 1 }} >

                            <ScrollView
                                onScroll={({ nativeEvent }) => {
                                    handleScrollEnd(nativeEvent)
                                }}

                                style={{ flex: 0.9 }}
                                scrollEventThrottle={16}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setPage(1)
                                            setMaxreached(false)
                                            handleReferesh()
                                        }}
                                    />
                                } >
                                <View style={styles.container}>
                                    {renderItems()}
                                </View>
                                {(firstLoading || (!maxreached && (loading || footerload))) && (
                                    <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }} >
                                        <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                    </View>
                                )}
                                <View style={{ paddingBottom: deviceheight * 0.14, }}></View>
                            </ScrollView>

                        </View>
                    }
                </View>
            </LinearGradient>


            <BottomSheetModalProvider >
                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    shouldMeasureContentHeight={true}
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={true}
                    enableDynamicSizing={false}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: 'gray' }}
                    onDismiss={() => {
                        setIsBottomSheetVisible(false);
                    }}
                >
                    <View style={styles.bottomSheetContent}>
                        <View style={{ width: '100%', flexDirection: 'row', marginBottom: '4%', alignItems: "center", justifyContent: "center" }}>
                            <Pressable style={[styles.searchcontainer, { justifyContent: "center" }]}>
                                <TextInput
                                    placeholderTextColor={'#F7E5D0'}
                                    value={search_bot}
                                    onChangeText={setSearchBot}
                                    placeholder={t('Search_Interests')}
                                    style={styles.inputtxtstyle}
                                    keyboardType='default'
                                />
                            </Pressable>
                            <Pressable style={{ position: 'absolute', right: '3%', alignSelf: 'center' }}>
                                {Images.search}
                            </Pressable>
                        </View>

                        {selectedHobbiesList?.length > 0 ? (
                            <View style={styles.selectedWrap}>
                                {selectedHobbiesList.map((interest, index) => (
                                    <Pressable
                                        key={hobbyIdString(interest) || String(index)}
                                        style={styles.addcontainer}
                                        onPress={() => handleRemoveInterest(interest)}
                                    >
                                        <Text style={styles.addbtntxt}>
                                            {interest?.hobbyname ??
                                                interest?.hobbyName ??
                                                ""}
                                        </Text>
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
                        ) : null}

                        <View style={{ width: "100%", height: deviceheight * 0.79, paddingBottom: 2 }}>
                            <BottomSheetFlatList
                                data={filteredHobbies}
                                keyExtractor={item => String(item._id)}
                                renderItem={renderItem}
                                extraData={selectedHobbyIdsKey}
                                contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 20 }}
                                onEndReachedThreshold={0.1}
                                onEndReached={() => {
                                    if (
                                        !isBottomSheetVisible ||
                                        maxreached ||
                                        hobbyLoading ||
                                        pageLoad ||
                                        footerload
                                    ) {
                                        return;
                                    }
                                    const last = hobbyTreeLastLoadedPageRef.current;
                                    if (last < 1) {
                                        return;
                                    }
                                    handlehobbysearch(last + 1);
                                }}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={footerload ? (
                                    <ActivityIndicator size="small" color={c.white} />
                                ) : null}
                            />

                        </View>

                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>

        </KeyboardAvoidingView>
    )

}
const styles = StyleSheet.create({

    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "10%",
        //flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },

    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0,
    },

    headertxt: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
    },

    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0560,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },

    selectType: {
        width: '49%',
        alignItems: 'center',
        flexDirection: "row",
        height: deviceheight * 0.0500,
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },

    activeType: {
        backgroundColor: c.intermediate,
    },

    inputtxtstyle: {
        ...textInputPlaceholderCenter,
        fontSize: RFValue(15.5),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '80%',
        marginTop: 3,
        height: "100%",
    },

    typeName: {
        width: "100%",
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        textAlign: "center",
        textAlignVertical: "center",
    },

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
        marginTop: "2.5%",
        overflow: "hidden",
    },
    bottomSheetContent: {
        flex: 1,
        padding: "3%",
        marginTop: "3%"
    },
    genderItem: {
        paddingHorizontal: "1%",
        paddingVertical: "2%"
    },
    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    emptyStateText: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "center",
        marginBottom: 16,
    },
    selectedWrap: {
        flexDirection: "row",
        width: "100%",
        flexWrap: "wrap",
        marginBottom: "3%",
        gap: 5,
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
        marginBottom: "2%",
    },
    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        marginRight: "4%",
        textAlign: "center",
    },
    lessbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: (devicewidth * 0.05) / 2,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
    },


})
