import {
    AppState,
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { borderradius, deviceheight, devicewidth, } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { Images } from "../../Utilities/images";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { update_SingleChatMembersList, update_filterBySearch, update_NetworkVisible } from "../../Slices/helper";
import { c } from "../../Utilities/colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DeleteInstance, getSingleInitialchatdata } from "../../Actions/hooks";
import { GetItem } from "../../Actions/localstorage";

import { Imageurl } from "../../Actions/constant";
import { JoinRoom } from "../../Actions/socket";
import {
    getChatInstanceId,
    isGroupChatEvent,
    memberMatchesUserId,
    normalizeChatUserId,
    shouldClearTypingIndicator,
} from "../../Utilities/chatNavigation";
import SocketContext from "../../Context/SocketContext";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import LinearGradient from 'react-native-linear-gradient';
import Commonheader from "../../Navigation/commonheader";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet/src";
import { runOnJS } from "react-native-worklets";


export default function SingleChat() {

    const { t } = useTranslation();

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

    const { isOnline, filterBysearch, singleChatMembersList, filtered } = useSelector(
        state => ({
            isOnline: state.helper.isOnline,
            filterBysearch: state.helper.filterBysearch,
            singleChatMembersList: state.helper.singleChatMembersList,
            filtered: state.helper.filtered,
        }),
        shallowEqual,
    );

    const profile = useSelector(state => state.profile.profile);

    const [selectMes, setSelectMes] = useState(false);

    const [msgDelete, setMsgDelete] = useState([]);

    const [loading, setLoading] = useState(false);

    const [apiCalled, setApiCalled] = useState(false);
    const appStateRef = useRef(AppState.currentState);
    const liveOnlineStatusRef = useRef({});

    const loginSts = GetItem("Loginstatus");

    const { activeTab } = filterBysearch;

    const [search, setSearch] = useState("");

    useFocusEffect(
        useCallback(() => {
            dispatch(update_filterBySearch({ activeTab: "SingleChat" }));
        }, [dispatch])
    )

    useEffect(() => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        setPage(1)
        setMaxreached(false);
        setFirstLoading(true);

        getAllchats(1);

        JoinRoom(User_Id);
        setSelectMes(false);

        return (() => {
            setPage(1)
            setMaxreached(false)
        })

    // Fetch callback closes over pagination/list state; keep this trigger scoped
    // to the inputs that should reset the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, loginSts, search]) //fetchSingleChat

    useEffect(() => {
        if (!socket) return;

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        const handleInstanceResponse = (response) => {

            if (!response?.isGroupchat) {
                const senderId = normalizeChatUserId(
                    response?.chatId ??
                    response?.resp?.chatId ??
                    response?.data?.chatId
                );
                if (senderId && senderId !== normalizeChatUserId(User_Id)) {
                    liveOnlineStatusRef.current[senderId] = true;
                    dispatch(update_SingleChatMembersList(
                        singleChatMembersList.map((chat) => ({
                            ...chat,
                            members: Array.isArray(chat?.members)
                                ? chat.members.map((member) =>
                                    memberMatchesUserId(member, senderId)
                                        ? { ...member, online_status: true }
                                        : member
                                )
                                : chat?.members,
                        }))
                    ));
                }
                setPage(1)
                getAllchats(1);
            }
        };

        const handleNewMembersAdd = (response) => {
            if (isGroupChatEvent(response)) {
                return;
            }

            const eventInstanceId = getChatInstanceId(response);
            if (
                eventInstanceId &&
                !singleChatMembersList?.some(
                    (chat) => String(chat?._id) === String(eventInstanceId)
                )
            ) {
                return;
            }

            setPage(1)
            getAllchats(1);
        };

        const handleInstanceFormatRows = (data) => {
            if (!data?.isGroupchat) {
                setPage(1)
                getAllchats(1);
            }
        };

        const handleTyping = (data) => {
            setTypinguser(data);
            if (data?.id) {
                liveOnlineStatusRef.current[normalizeChatUserId(data.id)] = true;
                dispatch(update_SingleChatMembersList(
                    singleChatMembersList.map((chat) => ({
                        ...chat,
                        members: Array.isArray(chat?.members)
                            ? chat.members.map((member) =>
                                memberMatchesUserId(member, data.id)
                                    ? { ...member, online_status: true }
                                    : member
                            )
                            : chat?.members,
                    }))
                ));
            }
        };

        const handleStopTyping = (data) => {
            setTypinguser((prev) =>
                shouldClearTypingIndicator(prev, data, prev?.instanceId) ? "" : prev
            );
        };

        const handleDeleteResponse = () => {
            setPage(1)
            getAllchats(1);
        };

        const handleOnlineOffline = (data) => {
            if (!data?.userId) {
                return;
            }

            liveOnlineStatusRef.current[normalizeChatUserId(data.userId)] = !!data.online_status;
            dispatch(update_SingleChatMembersList(
                singleChatMembersList.map((chat) => {
                    if (!Array.isArray(chat?.members)) {
                        return chat;
                    }

                    const hasMember = chat.members.some((member) =>
                        memberMatchesUserId(member, data.userId)
                    );
                    if (!hasMember) {
                        return chat;
                    }

                    return {
                        ...chat,
                        members: chat.members.map((member) =>
                            memberMatchesUserId(member, data.userId)
                                ? {
                                    ...member,
                                    online_status: !!data.online_status,
                                    lastSeenDate:
                                        data?.resp?.lastSeenDate ??
                                        member?.lastSeenDate,
                                  }
                                : member
                        ),
                    };
                })
            ));
        };

        socket.on("InstanceResponse", handleInstanceResponse);
        socket.on("NEW_MEMBERS_ADD", handleNewMembersAdd);
        socket.on("InstanceFormatRows", handleInstanceFormatRows);
        socket.on("TYPING", handleTyping);
        socket.on("STOPTYPING", handleStopTyping);
        socket.on("deleteResponse_me", handleDeleteResponse);
        socket.on("deleteResponse_every", handleDeleteResponse);
        socket.on("ONLINE_OFFLINE", handleOnlineOffline);

        return () => {
            socket.off("InstanceResponse", handleInstanceResponse);
            socket.off("NEW_MEMBERS_ADD", handleNewMembersAdd);
            socket.off("InstanceFormatRows", handleInstanceFormatRows);
            socket.off("TYPING", handleTyping);
            socket.off("STOPTYPING", handleStopTyping);
            socket.off("deleteResponse_me", handleDeleteResponse);
            socket.off("deleteResponse_every", handleDeleteResponse);
            socket.off("ONLINE_OFFLINE", handleOnlineOffline);
        };
    // Socket handlers intentionally share the latest list fetch behavior without
    // re-registering listeners on every pagination/list state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, singleChatMembersList])

    const applyLiveOnlineStatuses = useCallback((chats) => {
        if (!Array.isArray(chats)) {
            return [];
        }

        return chats.map((chat) => {
            if (!Array.isArray(chat?.members)) {
                return chat;
            }

            let changed = false;
            const members = chat.members.map((member) => {
                const memberId = normalizeChatUserId(member);
                if (!memberId || liveOnlineStatusRef.current[memberId] == null) {
                    return member;
                }

                const onlineStatus = liveOnlineStatusRef.current[memberId];
                if (member?.online_status === onlineStatus) {
                    return member;
                }

                changed = true;
                return {
                    ...member,
                    online_status: onlineStatus,
                };
            });

            return changed ? { ...chat, members } : chat;
        });
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            const wasBackgrounded = appStateRef.current.match(/inactive|background/);
            const isNowActive = nextAppState === 'active';

            if (wasBackgrounded && isNowActive && isOnline) {
                setPage(1);
                setMaxreached(false);
                getAllchats(1);
            }

            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isOnline]);


    const getAllchats = async (count) => {

        if (apiCalled) return;
        setApiCalled(true);

        try {

            let payload = {
                userId: GetItem("UserId"),
                searchText: search,
                page: count,
                limit: 10
            };

            if (payload?.page == 1) {
                setMaxreached(false)
            }

            if (!maxreached || count == 1) {

                const result = await getSingleInitialchatdata(payload);

                if (result?.status) {

                    console.log("ChatList________", result?.data[0]);

                    if (result?.data?.length > 0) {

                        if (payload?.page == 1) {
                            const local = applyLiveOnlineStatuses([...(result?.data || [])]);
                            dispatch(update_SingleChatMembersList(local));
                        }
                        else {
                            let local = applyLiveOnlineStatuses([...singleChatMembersList, ...(result?.data || [])]);
                            dispatch(update_SingleChatMembersList(local));
                        }

                        setPage(payload?.page + 1)
                    }
                    else if (search != "") {
                        dispatch(update_SingleChatMembersList([]))
                    }
                    else {
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
        }
    };

    const detailfn = (e) => {

        const otherMembers = e?.members.filter((data) => data?._id != User_Id);
        const currentUser = e?.members.find((data) => data?._id == User_Id);

        const updatedMembers = otherMembers.map((membArr) => ({
            _id: membArr?._id,
            name: membArr?.name,
            MychatDiscription: membArr?.MychatDiscription,
            online_status: membArr?.online_status ?? false,
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
                online_status: currentUser?.online_status ?? false,
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
            CurrentMessage: e?.CurrentMessage || CurrentMessage
        }

        if (!e?.isGroupchat) {
            passLoad.profile = updatedMembers[0]?.profile;
            passLoad.randomIndex = updatedMembers[0]?.randomIndex;
            passLoad.chatName = updatedMembers[0]?.username;
        }

        if (e?.isGroupchat && checkUserIdNotPresent(e?.members)) {
            return
        }
        else {
            navigation.navigate("ChatGroup", { detil: passLoad, pageFrom: "SingleChat" });
        }
    };

    const handleScrollEnd = (nativeEvent) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached) {

            setLoading(true);
            getAllchats(page);

        }
    };

    const handleDeleteChat = async (e) => {
        const itemId = e?._id;
        const getData = [...singleChatMembersList];

        const index = getData.findIndex(item => item._id === itemId);

        if (index !== -1) {
            getData[index] = { ...getData[index], isFocusDelete: !getData[index].isFocusDelete };

            dispatch(update_SingleChatMembersList(getData));

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

            let local = msgDelete?.map((data) => data?._id);

            let payload = {
                userId: User_Id,
                instanceId: JSON.stringify(local),
            }

            const result = await DeleteInstance(payload);

            setSelectMes(false);
            setMsgDelete([]);

            if (result?.status) {

                const deletedIds = msgDelete?.map(msg => msg._id);
                const filteredList = singleChatMembersList?.filter(chat => !deletedIds.includes(chat._id));

                dispatch(update_SingleChatMembersList(filteredList));

            }

        } catch (error) {
            console.log("Error on handleDeleteInstance:", error);
        }
    }

    const handleCancelSelection = useCallback(() => {
        dispatch(
            update_SingleChatMembersList(
                singleChatMembersList.map(item => ({ ...item, isFocusDelete: false })),
            ),
        );
        setSelectMes(false);
        setMsgDelete([]);
    }, [singleChatMembersList, dispatch]);

    const handleRemoveDelete = () => {
        handleCancelSelection();
    };


    const handleAlert = () => {
        Alert.alert(t('Holdon!'), t('you_want_deleteChats?'), [
            {
                text: t('Cancel'),
                onPress: () => handleRemoveDelete(),
                style: 'cancel',
            },
            {
                text: ('YES'),
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
        setPage(1)
        await getAllchats(1);
        setRefreshing(false);
    };

    const checkUserIdNotPresent = (members) => {
        const isPresent = !members.some(member => member._id == User_Id);
        return isPresent;
    }

    const checkIsblocked = (members) => {
        try {

            let mem = members?.find((data) => data?._id != profile?._id)

            if (mem?.userblocked?.includes(profile?._id)) {
                return true;
            }

            return false;

        } catch (error) {
            console.log("Error on checkIsblocked: ", error)
        }
    }

    const deleteAnim = useRef(new Animated.Value(0)).current;
    const DELETE_BTN_SIZE = devicewidth * 0.11;

    useEffect(() => {
        Animated.timing(deleteAnim, {
            toValue: selectMes ? 1 : 0,
            duration: 220,
            useNativeDriver: false,
        }).start();
    }, [selectMes, deleteAnim]);

    const handleBack = React.useCallback(() => {
        if (selectMes) {
            handleCancelSelection();
            return;
        }
        navigation.goBack();
    }, [navigation, selectMes, handleCancelSelection]);

    const deleteSlotWidth = deleteAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, DELETE_BTN_SIZE],
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <Commonheader
                    onback={handleBack}
                    title={t("Chat")} />

                <View style={styles.toolbarRow}>
                    <View style={styles.searchFlex}>
                        <Pressable style={styles.searchcontainer}>
                            {Images.search1}
                            <TextInput
                                placeholderTextColor={'#F7E5D0'}
                                placeholder="Search"
                                value={search}
                                style={styles.inputtxtstyle}
                                onChangeText={setSearch}
                                editable={!selectMes}
                            />
                        </Pressable>
                        {search !== "" && !selectMes ? (
                            <Pressable style={styles.closebox} onPress={() => setSearch("")}>
                                {Images.close1}
                            </Pressable>
                        ) : null}
                    </View>

                    <Animated.View
                        style={{
                            width: deleteSlotWidth,
                            opacity: deleteAnim,
                            marginLeft: deleteAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 6],
                            }),
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                        pointerEvents={selectMes ? 'auto' : 'none'}
                    >
                        <Pressable
                            onPress={() => msgDelete.length > 0 && handleAlert()}
                            style={styles.deleteFab}
                            disabled={msgDelete.length === 0}
                        >
                            {Images.delete}
                        </Pressable>
                    </Animated.View>
                </View>

                {
                    firstLoading ?
                        <View style={styles.listContainer}>
                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                        </View>
                        :
                        <View style={styles.listContainer}>
                            {singleChatMembersList?.length <= 0 ?
                                <View
                                    style={{ width: "98%", height: "100%", alignItems: "center", justifyContent: "center", alignSelf: "center" }} >

                                    <Text style={{
                                        fontFamily: Fonts.Bold,
                                        color: c.white,
                                        height: "35%",
                                        fontSize: RFValue(14),
                                        verticalAlign: "top"
                                    }} >
                                        {t('No_chat_found')}
                                        {/* {search == "" ? "No Groups Found" : "No Groups Match Your Seach Criteria"} */}
                                    </Text>
                                </View>
                                :
                                <View style={{ width: "98%", height: "100%", alignSelf: "center", }}>

                                    <FlatList
                                        data={singleChatMembersList}
                                        keyExtractor={(item, index) => item?._id ? item._id.toString() : index.toString()}
                                        initialNumToRender={10}
                                        windowSize={5}
                                        maxToRenderPerBatch={10}
                                        onScroll={({ nativeEvent }) => {
                                            if (activeTab == "SingleChat") {
                                                handleScrollEnd(nativeEvent)
                                            }
                                        }}
                                        scrollEventThrottle={16}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                colors={['#9Bd35A', '#689F38']}
                                                progressBackgroundColor="#ffffff"
                                            />
                                        }
                                        showsVerticalScrollIndicator={false}
                                        ListFooterComponent={
                                            loading ? (
                                                <View style={{ paddingBottom: 20, paddingTop: 10, alignSelf: "center" }} >
                                                    {/* <ActivityIndicator color={"#fff"} size="small" /> */}
                                                </View>
                                            ) : null
                                        }
                                        contentContainerStyle={{ paddingBottom: "15%", paddingTop: "3%" }}
                                        renderItem={({ item: e, index }) => {
                                            if (!(e?.isGroupchat || (!e?.isGroupchat && e?.members?.find((data) => data?._id == User_Id) && e?.CurrentMessage?._id != ""))) return null;

                                            const member = e?.members?.find((data) => data?._id != User_Id);
                                            let profile = member?.profile || "";
                                            let randomIndex = member?.randomIndex || "";
                                            let username = member?.username || "";

                                            const longPressGesture = Gesture.LongPress()
                                                .minDuration(150)
                                                .onEnd(() => {
                                                    if (!filtered && e?.groupCreater?._id !== User_Id) {
                                                        runOnJS(handleDeleteChat)(e, index);
                                                    }
                                                });

                                            return (
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={{ flex: 1, }}>


                                                        <GestureDetector
                                                            gesture={longPressGesture}
                                                            minDurationMs={150}
                                                            onActivated={() => !filtered && e?.groupCreater?._id != User_Id && handleDeleteChat(e, index)}
                                                        >
                                                            <View
                                                                key={index}
                                                                style={[
                                                                    {
                                                                        flexDirection: "row",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                        marginBottom: "6%",
                                                                    },
                                                                    e.isFocusDelete && styles.highlightedButton
                                                                ]}
                                                            >
                                                                <Pressable onPress={() => {
                                                                    if (selectMes) {
                                                                        if (e?.groupCreater?._id !== User_Id) {
                                                                            handleDeleteChat(e, index);
                                                                        }
                                                                    } else {
                                                                        detailfn(e);
                                                                    }
                                                                }}>
                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                                        <View
                                                                            style={{
                                                                                flexDirection: "row",
                                                                                alignItems: "center",
                                                                                width: "90%",
                                                                            }}
                                                                        >
                                                                            {e?.isGroupchat ? (
                                                                                <>
                                                                                    {e?.Image ? (
                                                                                        <View
                                                                                            style={{
                                                                                                width: devicewidth * 0.14,
                                                                                                height: devicewidth * 0.14,
                                                                                            }}
                                                                                        >

                                                                                            <Image
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: "100%",
                                                                                                    borderRadius: borderradius * 5,
                                                                                                }}
                                                                                                source={{
                                                                                                    uri: `${Imageurl}${e?.Image}`,
                                                                                                }}
                                                                                                resizeMode="cover"
                                                                                            />
                                                                                        </View>
                                                                                    ) : (
                                                                                        <View
                                                                                            style={{
                                                                                                width: devicewidth * 0.14,
                                                                                                height: devicewidth * 0.14,
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: "100%",
                                                                                                    borderRadius: borderradius * 5,
                                                                                                }}
                                                                                                source={randomimages[e?.groupIndex]}
                                                                                                resizeMode="cover"
                                                                                            />
                                                                                        </View>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    {profile ? (
                                                                                        <View
                                                                                            style={{
                                                                                                width: devicewidth * 0.14,
                                                                                                height: devicewidth * 0.14,
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: "100%",
                                                                                                    borderRadius: borderradius * 5,
                                                                                                }}
                                                                                                source={{
                                                                                                    uri: `${Imageurl}${profile}`,
                                                                                                }}
                                                                                                resizeMode="cover"
                                                                                            />
                                                                                        </View>
                                                                                    ) : (
                                                                                        <View
                                                                                            style={{
                                                                                                width: devicewidth * 0.14,
                                                                                                height: devicewidth * 0.14,
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: "100%",
                                                                                                    borderRadius: borderradius * 5,
                                                                                                }}
                                                                                                source={randomimages[randomIndex]}
                                                                                                resizeMode="cover"
                                                                                            />
                                                                                        </View>
                                                                                    )}
                                                                                </>
                                                                            )}


                                                                            <View style={{ width: "100%", paddingHorizontal: "3%" }}>
                                                                                <Text style={styles.gptitle}>
                                                                                    {e?.isGroupchat ? e?.chatName : username}
                                                                                </Text>

                                                                                {!checkIsblocked(e?.members) &&
                                                                                    <>
                                                                                        {e?._id == typinguser?.instanceId ? (
                                                                                            <>
                                                                                                <Text style={styles.gpsubtitle}>
                                                                                                    {e?.isGroupchat
                                                                                                        ? `${typinguser?.name} ${t('is_typing...')} `
                                                                                                        : t('typing...')}
                                                                                                </Text>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                {e?.CurrentMessage?.messageDelete?.some(
                                                                                                    (data) =>
                                                                                                        data.action === "me" &&
                                                                                                        data.id == User_Id
                                                                                                ) ? (
                                                                                                    <Text style={styles.gpsubtitle}>
                                                                                                        {t('message_deleted')}
                                                                                                    </Text>
                                                                                                ) : e?.CurrentMessage?.messageDelete?.some(
                                                                                                    (data) => data.action === "every"
                                                                                                ) ? (
                                                                                                    <Text style={styles.gpsubtitle}>
                                                                                                        {t('This_message_was_deleted')}
                                                                                                    </Text>
                                                                                                ) : (

                                                                                                    <>
                                                                                                        {e?.CurrentMessage?.groupmembers?.includes(User_Id) &&
                                                                                                            <>
                                                                                                                {e?.CurrentMessage?.messageData ?

                                                                                                                    <Text
                                                                                                                        style={styles.gpsubtitle}
                                                                                                                        numberOfLines={1}
                                                                                                                    >
                                                                                                                        {e?.CurrentMessage?.messageData?.length > 40 ?
                                                                                                                            `${e.CurrentMessage?.messageData.slice(
                                                                                                                                0,
                                                                                                                                40
                                                                                                                            )}...`
                                                                                                                            : e?.CurrentMessage?.messageData
                                                                                                                        }
                                                                                                                    </Text>
                                                                                                                    :
                                                                                                                    <>
                                                                                                                        {e?.CurrentMessage?.text !== "" ? (
                                                                                                                            <Text
                                                                                                                                style={styles.gpsubtitle}
                                                                                                                                numberOfLines={1}
                                                                                                                            >
                                                                                                                                <>
                                                                                                                                    {e?.CurrentMessage?.text?.length >
                                                                                                                                        40
                                                                                                                                        ? `${e.CurrentMessage?.text.slice(
                                                                                                                                            0,
                                                                                                                                            40
                                                                                                                                        )}...`
                                                                                                                                        : e?.CurrentMessage?.text}
                                                                                                                                </>
                                                                                                                            </Text>
                                                                                                                        )
                                                                                                                            :
                                                                                                                            e?.CurrentMessage?.file?.length >
                                                                                                                                0 ? (
                                                                                                                                <View
                                                                                                                                    style={{
                                                                                                                                        width: devicewidth * 0.15,
                                                                                                                                        height: devicewidth * 0.1,
                                                                                                                                        flexDirection: "row",
                                                                                                                                        alignItems: "center",
                                                                                                                                        gap: 5,
                                                                                                                                    }}
                                                                                                                                >
                                                                                                                                    {Images.gallery_new}
                                                                                                                                    <Text style={styles.gpsubtitle}>
                                                                                                                                        {t('Photo')}
                                                                                                                                    </Text>
                                                                                                                                </View>
                                                                                                                            ) :
                                                                                                                                e?.CurrentMessage?.voicerecord?.length > 0 &&
                                                                                                                                (
                                                                                                                                    <View
                                                                                                                                        style={{
                                                                                                                                            width: devicewidth * 0.15,
                                                                                                                                            height: devicewidth * 0.1,
                                                                                                                                            flexDirection: "row",
                                                                                                                                            alignItems: "center",
                                                                                                                                            gap: 5,
                                                                                                                                        }}
                                                                                                                                    >
                                                                                                                                        {Images.AudioMic}
                                                                                                                                        <Text style={styles.gpsubtitle}>
                                                                                                                                            {t('Audio')}
                                                                                                                                        </Text>
                                                                                                                                    </View>
                                                                                                                                )}
                                                                                                                    </>
                                                                                                                }
                                                                                                            </>
                                                                                                        }
                                                                                                    </>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                }

                                                                            </View>

                                                                        </View>
                                                                        {!checkIsblocked(e?.members) && e?.CurrentMessage?.chatId != User_Id && e?.UnreadMessageCount != 0 && e?.UnreadMessageCount &&
                                                                            <View style={{
                                                                                width: devicewidth * 0.07,
                                                                                height: devicewidth * 0.07,
                                                                                borderRadius: (devicewidth * 0.15) / 2,
                                                                                backgroundColor: "#fff",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}>

                                                                                <Text style={{
                                                                                    fontFamily: Fonts.SemiBold,
                                                                                    color: c.secondary,
                                                                                    fontSize: RFValue(14),
                                                                                }}>
                                                                                    {e?.UnreadMessageCount < 99 ? e?.UnreadMessageCount : "99+"}
                                                                                </Text>


                                                                            </View>
                                                                        }
                                                                    </View>
                                                                </Pressable>
                                                            </View>
                                                        </GestureDetector>

                                                    </View>

                                                </View>
                                            )
                                        }}
                                    />
                                </View>
                            }
                        </View>
                }
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >

                    <SafeAreaProvider>
                        <View style={{ flex: 1 }} edges={['top', 'bottom']}
                            onStartShouldSetResponder={() => setModalVisible(false)}
                        >
                            <View
                                onStartShouldSetResponder={() => setModalVisible(false)}
                                style={{ flex: 1, }} >

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
                                                navigation.navigate("CreateGroup");
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
                        </View>
                    </SafeAreaProvider>

                </Modal>

            </LinearGradient>

        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({
    gptitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },
    gpsubtitle: {
        width: WINDOW_WIDTH * 0.6,
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
        paddingLeft: 0,
    },
    btn: {
        width: "23%",
        borderRadius: borderradius * 1,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        padding: "2.5%",
        alignSelf: "center",
    },
    btntxt: {
        color: c.secondary,
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
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
        // textAlign: "center"
    },
    highlightedButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderColor: 'rgba(255, 255, 255, 0.55)',
        borderWidth: 1,
        borderRadius: borderradius * 0.5,
    },
    toolbarRow: {
        width: '94%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: deviceheight * 0.056,
        marginTop: 4,
        marginBottom: 8,
        paddingRight: 0,
    },
    searchFlex: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteFab: {
        width: devicewidth * 0.11,
        height: devicewidth * 0.11,
        borderRadius: borderradius * 3,
        backgroundColor: c.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    listContainer: {
        flex: 1,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "10%",
        // flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0
    },
    headertxt: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
    },

    searchcontainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0560,
        paddingLeft: '2.5%',
        paddingRight: '2%',
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(15.5),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        height: "100%",
        marginLeft: "1%"

    },
    closebox: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        alignItems: "center",
        justifyContent: "center",
        position: 'absolute',
        right: '3%',
        alignSelf: "center",

    }

});
