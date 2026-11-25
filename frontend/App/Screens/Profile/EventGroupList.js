import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, RefreshControl, SafeAreaView, ScrollView, FlatList, StyleSheet, Text, TextInput, View, } from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast, } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { Images } from "../../Utilities/images";
import { useDispatch, useSelector } from "react-redux";
import { update_ChatFilterHoobies, update_EventChatList, update_CommonFilter, update_CommonFilterPayload, update_filterBySearch, update_Filtered, update_GroupFilter, update_NetworkVisible, update_PeopleFilterHobbies, update_SeenMsg } from "../../Slices/helper";
import { c } from "../../Utilities/colors";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { DeleteInstance, GetFilteredGroups, GroupJoinandUnjoin, getAllEventChatapi, getAllMembersapi } from "../../Actions/hooks";
import { GetItem } from "../../Actions/localstorage";
import { Imageurl } from "../../Actions/constant";
import { JoinRoom } from "../../Actions/socket";
import { helperSelector } from "../../Slices/helper";
import SocketContext from "../../Context/SocketContext";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import { profileSelector } from "../../Slices/profile";
import { LongPressGestureHandler } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import Commonheader from "../../Navigation/commonheader";
import { getChatInstanceId, isGroupChatEvent } from "../../Utilities/chatNavigation";

export default function EventGroupList() {

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

    const { isOnline, commonFilterPayload } = useSelector(helperSelector);

    const { profile } = useSelector(profileSelector);

    const [selectMes, setSelectMes] = useState(false);

    const [msgDelete, setMsgDelete] = useState([]);

    const [loading, setLoading] = useState(false);

    const [apiCalled, setApiCalled] = useState(false);

    const [currentIndex, setCurrectIndex] = useState([])

    const loginSts = GetItem("Loginstatus");

    const { filterBysearch, eventChatList, fetchChat, filtered, isGroupFilter } = useSelector(helperSelector);

    const { activeTab } = filterBysearch;
    const tabFilterPayload = commonFilterPayload?.[activeTab] || {};
    const [search, setSearch] = useState("");


    useEffect(() => {

        JoinRoom(User_Id);
        setSelectMes(false);

    }, [isOnline, loginSts])

    useEffect(() => {
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        dispatch(update_GroupFilter(false));

        setPage(1)
        setMaxreached(false);

        if (search != "") {
            setFirstLoading(true);
            getFilteredChat(1);

        }
        else {
            getAllchats(1);
        }

        return (() => {
            setPage(1);
            setMaxreached(false);
        })

    }, [tabFilterPayload, search])



    useEffect(() => {
        if (!socket) return;

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        socket.on("InstanceResponse", (response) => {

            if (response?.isGroupchat) {
                setPage(1)
                getAllchats(1);
            }
        });

        socket.on("NEW_MEMBERS_ADD", (response) => {
            if (!isGroupChatEvent(response)) {
                return;
            }

            const eventInstanceId = getChatInstanceId(response);
            if (
                eventInstanceId &&
                !eventChatList?.some((chat) => String(chat?._id) === String(eventInstanceId))
            ) {
                return;
            }

            setPage(1)
            getAllchats(1);
        });

        socket.on("InstanceFormatRows", (data) => {
            if (data?.isGroupchat) {
                setPage(1)
                getAllchats(1);
            }
        });

        socket.on("TYPING", (data) => {
            setTypinguser(data);
        });

        socket.on("STOPTYPING", (data) => {
            setTypinguser("");
        });

        socket.on("deleteResponse_me", (data) => {
            setPage(1)
            getAllchats(1);
        });

        socket.on("deleteResponse_every", (data) => {
            setPage(1)
            getAllchats(1);
        });
    }, [socket])

    const getAllchats = async (count) => {

        if (count != 1) {
            if (apiCalled) return;
            setApiCalled(true);

        }

        try {
            let payload = {
                userId: GetItem("UserId"),
                page: count,
                limit: 10,
                // search: search,
            };

            if (payload?.page == 1) {
                setMaxreached(false)
            }


            if (!maxreached || count == 1) {

                dispatch(update_Filtered(false));
                const result = await getAllEventChatapi(payload);
                setPage(count + 1)

                if (result?.status) {
                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 10) {
                            setMaxreached(true);
                        }

                        if (count == 1) {
                            const local = [...(result?.data || [])];
                            dispatch(update_EventChatList(local));
                        }
                        else {
                            let local = [...eventChatList, ...(result?.data || [])];
                            dispatch(update_EventChatList(local));
                        }

                    }
                    dispatch(update_filterBySearch({ search: "" }))
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

    const getFilteredChat = async (count) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        try {

            if (count != 1) {
                if (apiCalled) return;
                setApiCalled(true);
            }

            let payload = {
                userId: User_Id,
                page: count,
                limit: 10,
            }

            if (search != "") {
                payload.type = "searcheventgroup";
                payload.chatname = search;
            }


            if (count == 1) {
                setMaxreached(false);
            }
            if (!maxreached || count == 1) {

                dispatch(update_Filtered(true))

                const result = await GetFilteredGroups(payload)
                setPage(payload?.page + 1)

                if (result?.status) {

                    if (result?.data) {
                        if (count == 1) {
                            const local = [...(result?.data || [])];
                            dispatch(update_EventChatList(local));
                        }
                        else {
                            let local = [...eventChatList, ...(result?.data || [])];
                            dispatch(update_EventChatList(local));
                            setPage(count + 1);
                        }
                    }
                    else if (search != "") {
                        dispatch(update_EventChatList([]));
                    }
                    else {
                        setMaxreached(true);
                    }
                }
            }
        } catch (error) {
        }
        finally {
            setFirstLoading(false);
            setLoading(false)
            setRefreshing(false)
            setApiCalled(true);
        }
    }

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
            Image: e?.eventId?.eventprofile,
            groupIndex: e?.eventId?.eventRandomIndex,
            isEvent: true,
            members: updatedMembers,
            CurrentMessage: e?.CurrentMessage || CurrentMessage,
            isPrivate: e?.isPrivate
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
            navigation.navigate("ChatGroup", { detil: passLoad, pageFrom: "Event" });
        }
    };

    const handleScrollEnd = () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        setLoading(true);
        getAllchats(page);
    };


    const onRefresh = async () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        setRefreshing(true);
        setPage(1)
        setFirstLoading(true);

        await getAllchats(1);
    };




    const checkUserIdNotPresent = (members) => {
        const isPresent = !members.some(member => member?._id == User_Id);
        return isPresent;
    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <View style={{ flex: 1 }}>

            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Commonheader
                    title={t('EventGroupChat')}
                    onback={handleBack}
                />


                <View style={{ width: "90%", alignSelf: "center", height: "9%", alignItems: "center", justifyContent: "center", }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: "center" }}>
                        <Pressable style={styles.searchcontainer}>
                            {Images.search1}
                            <TextInput
                                placeholderTextColor={'#F7E5D0'}
                                placeholder="Search"
                                value={search}
                                EventGroupList
                                style={styles.inputtxtstyle}
                                onChangeText={setSearch}
                            />
                        </Pressable>

                        <Pressable style={styles.closebox} >
                            {search != "" &&
                                <Pressable onPress={() => setSearch("")}>
                                    {Images.close1}
                                </Pressable>
                            }
                        </Pressable>

                    </View>
                </View>

                <View style={{ flex: 1, height: "100%", width: "100%", padding: 10 }}>
                    <View style={{ alignItems: "flex-end" }}>
                    </View>
                    {
                        firstLoading ?
                            <View style={{ height: "92.5%", paddingBottom: "2.5%", justifyContent: "center" }} >
                                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                            </View>
                            :
                            <View>
                                {eventChatList?.length <= 0 || eventChatList?.chatName ?
                                    <View style={{ width: "98%", height: "90%", alignItems: "center", justifyContent: "center" }}>
                                        <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(14), textAlign: "center", }}>
                                            {search == "" ? t('NoEventChatFound') : t('NoEventChatMatchYourSeachCriteria')}
                                        </Text>

                                    </View>
                                    :


                                    <View style={{ width: "98%", height: "100%", alignSelf: "center", }}>

                                        <FlatList
                                            data={eventChatList}
                                            keyExtractor={(item, index) => item?._id ? item._id.toString() : index.toString()}
                                            initialNumToRender={10}
                                            windowSize={5}
                                            maxToRenderPerBatch={10}
                                            onScroll={({ nativeEvent }) => {
                                                if (activeTab == "Chat") {
                                                    handleScrollEnd(nativeEvent)
                                                }
                                            }}
                                            onEndReached={handleScrollEnd}
                                            onEndReachedThreshold={0.5}
                                            contentContainerStyle={{ paddingBottom: deviceheight * 0.15 }}
                                            scrollEventThrottle={16}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={refreshing}
                                                    onRefresh={onRefresh}
                                                    colors={['#9Bd35A', '#689F38']}
                                                    progressBackgroundColor="#ffffff"
                                                />
                                            }
                                            ListFooterComponent={
                                                loading ? (
                                                    <View style={{ paddingBottom: 20, paddingTop: 10, alignSelf: "center" }} >
                                                        <ActivityIndicator color={"#fff"} size="small" />
                                                    </View>
                                                ) : null
                                            }
                                            showsVerticalScrollIndicator={false}
                                            renderItem={({ item: e, index }) => {
                                                if (!(e?.isGroupchat || (!e?.isGroupchat && e?.members?.find((data) => data?._id == User_Id) && e?.CurrentMessage?._id != ""))) return null;
                                                return (
                                                    <View style={styles.card}>
                                                        <View style={{ flex: 1, }}>

                                                            <LongPressGestureHandler
                                                                minDurationMs={150}>
                                                                <View
                                                                    style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, e.isFocusDelete && styles.highlightedButton]}>

                                                                    <Pressable style={{ width: "100%" }}
                                                                        onPress={() => {
                                                                            detailfn(e);
                                                                        }
                                                                        }>
                                                                        <View style={{ width: "100%", }}>

                                                                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>

                                                                                <View style={{ flexDirection: "row", alignItems: "center", }}>

                                                                                    {/* {e?.isGroupchat && (
                                                                                                                            <>
                                                                                                                                {e?.Image ? (

                                                                                                                                    <Image
                                                                                                                                        style={{
                                                                                                                                            width: devicewidth * 0.14,
                                                                                                                                            height: devicewidth * 0.14,
                                                                                                                                            borderRadius: borderradius * 5,
                                                                                                                                        }}
                                                                                                                                        source={{ uri: ${e?.Image}`, }}
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

                                                                                                                        )} */}

                                                                                    <View style={{ marginLeft: "5%" }}>
                                                                                        <Text style={styles.gptitle}>
                                                                                            {e?.isGroupchat ? e?.chatName : username}
                                                                                        </Text>
                                                                                        {e?.groupDiscription &&
                                                                                            <Text style={styles.gpsubtitle}>
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

                                                                            <View style={{ width: "100%", alignSelf: "center", justifyContent: "space-between" }}>

                                                                                <View style={{ width: "65%", flexDirection: "row", marginTop: "4%", justifyContent: "space-between", }}>

                                                                                    {e?.grouphobbies?.length > 0 && (

                                                                                        <View style={{ flex: 0.8, flexDirection: "row", alignItems: "center", width: "50%", gap: 5 }}>

                                                                                            {e?.grouphobbies?.slice(0, 2).map((hobby, index) => (
                                                                                                <View key={hobby._id} style={styles.hobbyView}>
                                                                                                    <Text style={styles.groupNametxt}>{hobby?.hobbyname?.length > 8 ? hobby?.hobbyname?.slice(0, 5) + "..." : hobby?.hobbyname}</Text>
                                                                                                </View>
                                                                                            ))}

                                                                                            {e?.grouphobbies.length > 3 && (
                                                                                                <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                                                                                    <Text style={styles.groupNametxt}>+{e?.grouphobbies?.length - 3}</Text>
                                                                                                </View>
                                                                                            )}
                                                                                        </View>
                                                                                    )}

                                                                                </View>


                                                                                <View style={{ width: "40%", position: "absolute", bottom: "0.5%", right: "1%", flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", }}>
                                                                                    <View style={{ flexDirection: "row", alignItems: "center", width: "20%", gap: 4, justifyContent: "flex-start", marginRight: "15%" }}>
                                                                                        {Images.groupMembUn}
                                                                                        <Text style={styles.friendCounttxt}>{e?.members?.length}</Text>
                                                                                    </View>

                                                                                    {/* {e?.groupCreater?._id == User_Id ? "" :
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
                                                                                                                                                Pending
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
                                                                                                                                                                fontSize: RFValue(13),
                                                                                                                                                                textAlign: "center",
                                                                                                                                                                alignContent: "center",
                                                                                                                                                                textAlignVertical: "center",
                                                                                                                                                                verticalAlign: "middle"
                                                                                                                                                            }}>
                                                                                                                                                                Join
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
                                                                                                                                                                    fontFamily: Fonts.SemiBold,
                                                                                                                                                                    color: c.secondary,
                                                                                                                                                                    width: devicewidth * 0.2,
                                                                                                                                                                    fontSize: RFValue(13),
                                                                                                                                                                    textAlign: "center",
                                                                                                                                                                    alignContent: "center",
                                                                                                                                                                    textAlignVertical: "center",
                                                                                                                                                                    verticalAlign: "middle"
                                                                                                                                                                }}>
                                                                                                                                                                    Leave Join
                                                                                                                                                                </Text>
                                                                                                                                                            </Pressable>
                                                                                                                                                        }
                                                                                                                                                    </View>
                                                                                                                                                )
                                                                                                                                        )
                                                                                                                                ) : null}
                                                                                                                            </View>
                                                                                                                        } */}

                                                                                </View>

                                                                            </View>
                                                                        </View>

                                                                    </Pressable>

                                                                </View>
                                                            </LongPressGestureHandler>

                                                        </View>

                                                    </View>
                                                )
                                            }}
                                        />
                                    </View>
                                }
                            </View>
                    }

                </View>
            </LinearGradient>


        </View>
    )
}
const styles = StyleSheet.create({

    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "10%",
        // flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
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
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        borderColor: "#fff",
        borderWidth: 0.3,
        marginTop: "3%",
        padding: "3%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center"
    },
    gptitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },
    gpsubtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
        // marginRight:"5%"
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
    inputtxtstyle: {
        fontSize: RFValue(15.5),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        height: "100%",
        marginLeft: "1%"

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
