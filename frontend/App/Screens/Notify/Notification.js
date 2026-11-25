import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar, Image, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { update_FetchProfileId, update_followStatus, update_NetworkVisible, update_Notification, update_statusbarcolor } from '../../Slices/helper';
import { GetItem } from '../../Actions/localstorage';
import { GetAllNotification, PrivateUserAccFollow, UserFollowBack, UserUnFollow } from '../../Actions/hooks';
import { Imageurl } from '../../Actions/constant';
import { Fetchprofile } from '../../Slices/profile';
import { randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import Commonheader from '../../Navigation/commonheader';
import { resolveChatDetailFromNotificationAsync } from '../../Utilities/chatNavigation';

const Notification = () => {

    const { t } = useTranslation();

    const profile = useSelector(state => state.profile.profile);

    const { notification, isOnline, notificationRender } = useSelector(
        state => ({
            notification: state.helper.notification,
            isOnline: state.helper.isOnline,
            notificationRender: state.helper.notificationRender,
        }),
        shallowEqual,
    )

    const navigation = useNavigation();
    const [join, setJoin] = useState(false)
    const [loading, setLoading] = useState(true);
    const route = useRoute()
    const { userid, type } = route?.params || {}

    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [maxreached, setMaxreached] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const [footerLoading, setFooterLoading] = useState(false);
    const userId = GetItem('UserId');

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [dispatch])
    )

    useEffect(() => {

        setPage(1)
        dispatch(update_Notification([]));
        handleNotification(1)

    // Notification loader closes over paging state; reset only on network or
    // explicit notification refresh signals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, notificationRender])

    const [refreshing, setRefreshing] = useState(false);

    const handleNotification = async (count) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }


            if (!maxreached || count == 1) {
                let payload = {
                    userId: userId ? userId : userid,
                    page: count,
                    limit: 10
                }

                if (apiCalled) return;
                setApiCalled(true);

                const result = await GetAllNotification(payload);

                if (result?.status) {

                    if (count == 1) {
                        setMaxreached(false);
                        setLoading(true);
                    }
                    else {
                        setFooterLoading(true);
                    }

                    if (result?.data?.length > 0) {
                        if (result?.data?.length < 10) {
                            setMaxreached(true);
                        }

                        const data = result?.data

                        if (count == 1) {
                            dispatch(update_Notification(data));

                        }
                        else {

                            let local = [...notification, ...data]
                            dispatch(update_Notification(local));

                        }
                    }
                    else if (page == 1) {
                        dispatch(update_Notification([]));
                    }

                    dispatch(Fetchprofile(userId))
                }

            }


        } catch (error) {
        }
        finally {
            setRefreshing(false); // Stop refreshing
            setLoading(false)
            setApiCalled(false);
            setFooterLoading(false);
        }
    }

    const handleUserUnFollow = async (e) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                from: userId,
                to: e?.from,
                userId: userId,
                request_id: e?._id,
                accept: "unfollowed"
            }

            const result = await UserUnFollow(payload);

            setJoin(true);
            setPage(1)
            handleNotification(1)
            dispatch(update_followStatus("Unfollow"));
            dispatch(Fetchprofile(userId))

        } catch (error) {
        }
    }

    const handleUserFollow = async (e) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }


            let payload = {
                from: userId,
                to: e?.from,
                userId: userId,
                Followback: "completed",
            };


            const result = await UserFollowBack(payload);

            setJoin(true);
            setPage(1)
            handleNotification(1)
            dispatch(update_followStatus("Follow"));
            dispatch(Fetchprofile(userId))


        } catch (error) {
            console.log("Error on handleUserFollow Notification: ", error);
        }
    }

    const handlePrivateUserAccFollow = async (e) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {

                from: userId,
                to: e?.from,
                request_id: e?._id,
                accept: "followed",
                userId: userId,
            }

            const result = await PrivateUserAccFollow(payload);
            setPage(1)
            handleNotification(1)
            dispatch(update_followStatus("Private Acc Follow"));
            dispatch(Fetchprofile(userId))


        } catch (error) {
            console.log("error on handlePrivateUserAccFollow", error);
        }
    }

    const handleRedirect = async (e) => {

        let payload = {
            ...e?.From_Details, // Spread properties from From_Details
            followingsDetails: (e?.notificationsDetails && e?.notificationsDetails?.status != "pending") ? {
                ...e.notificationsDetails // Spread properties from notificationsDetails
            } : false // Use false if notificationsDetails is not present
        };


        dispatch(update_FetchProfileId(payload?._id))

        // {
        //     e?.type == "Emailtransfer" ? "" :
        //         navigation.navigate("HomeDetail", { detail: payload, })
        // }

        console.log("CallData==>", e)

        if (e?.type == "Event") {
            let eventId = {
                _id: e?.eventId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("ActivityDetail", { detail: eventId, })
        }
        else if (e?.type == "Event Edit") {
            let eventId = {
                _id: e?.eventId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("ActivityDetail", { detail: eventId, })
        }

        else if (e?.type == "Event") {
            let eventId = {
                _id: e?.eventId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("ActivityDetail", { detail: eventId, })
        }

        else if (e?.type == "Event Add") {
            let eventId = {
                _id: e?.eventId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("ActivityDetail", { detail: eventId, })
        }

        else if (e?.type == "Followback") {
            navigation.navigate("HomeDetail", { detail: payload, })
        }
        else if (e?.type == "Emailtransfer") {
            console.log("Emailtransfer payload: ", payload);
        }
        else if (e?.type == "Add New Group") {
            let eventId = {
                _id: e?.groupId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("GroupDetails", { detail: eventId, })

        }
        else if (e?.type == "Edit New Group") {
            console.log("Connect-->", e)
            let eventId = {
                _id: e?.groupId,
                userId: GetItem('UserId'),
            }
            navigation.navigate("GroupDetails", { detail: eventId, })

        }
        else if (e?.type === 'chat' || e?.type === 'Chatting') {
            const detil = await resolveChatDetailFromNotificationAsync(e);
            if (!detil?._id) {
                return;
            }
            navigation.navigate('ChatGroup', {
                detil,
                pageFrom: 'Notification',
                refreshKey: Date.now(),
            });
        }
        else {
            navigation.navigate("HomeDetail", { detail: payload, })
        }
    }

    const formatDate = (date) => {
        try {
            // Ensure that date is a valid Date object
            if (!(date instanceof Date) || isNaN(date)) {
                throw new Error("Invalid Date object");
            }

            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day} ${getMonthName(date.getMonth())} ${year}`;
        } catch (error) {
            return ""; // Return an empty string or a fallback value
        }
    };

    const getMonthName = (monthIndex) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[monthIndex];
    };

    const groupNotificationsByDate = (notifications) => {


        return notifications.reduce((acc, notification) => {
            try {
                const notificationDate = new Date(notification.createdAt);
                if (isNaN(notificationDate.getTime())) {
                    throw new Error("Invalid date in notification");
                }

                const now = new Date();
                const isToday = notificationDate.toDateString() === now.toDateString();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const isYesterday = notificationDate.toDateString() === yesterday.toDateString();

                const dateKey = isToday
                    ? t('Today')
                    : isYesterday
                        ? t('Yesterday')
                        : formatDate(notificationDate);

                // Initialize the array for this date if it doesn't exist
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(notification);
                return acc;
            } catch (error) {

                return acc; // Skip this notification and continue
            }
        }, {});
    };

    const groupedNotifications = groupNotificationsByDate(notification);

    const handleEndReached = (nativeEvent) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (apiCalled) return;

        var count = page + 1
        if (isEndReached && !maxreached) {
            setPage(count);
            handleNotification(count)
        }

    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    {/* <View style={styles.backcontainer}>
                        <View style={{ width: "70%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Pressable onPress={() => {
                                type == "notify" ?
                                    navigation.navigate("ProfileDetail")
                                    :
                                    navigation.goBack()
                            }} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>
                            <Text style={styles.headertxt}>{t('Notifications')}</Text>
                        </View>
                    </View> */}

                    <Commonheader
                        title={t('Notifications')}
                        onback={() => {
                            type == "notify" ?
                                navigation.navigate("ProfileDetail")
                                :
                                handleBack()
                        }}
                    />
                    {loading &&
                        <View style={{ height: "88%", paddingBottom: "2.5%", paddingHorizontal: "3%" }} >
                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                        </View>
                    }

                    {notification.length > 0 ?
                        <View style={{ width: "100%", height: deviceheight * 0.88, }}>
                            <ScrollView
                                onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                                scrollEventThrottle={16}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setMaxreached(false)
                                            setRefreshing(true);
                                            setPage(1)
                                            handleNotification(1)
                                        }}
                                    />
                                }
                                showsVerticalScrollIndicator={false}>

                                <View style={{ marginBottom: "25%", }}>

                                    <Pressable>
                                        <View style={{ width: "92%", alignSelf: "center", marginTop: "0%" }}>
                                            <>
                                                {Object.entries(groupedNotifications).map(([item, notifications]) => (
                                                    <View
                                                        key={item}
                                                        style={{ marginBottom: "6%" }}>

                                                        <Text style={styles.dateHeader}>{item}</Text>
                                                        <View style={{ height: 1, backgroundColor: c.grey, marginVertical: 5, }} />

                                                        {notifications.map((e, index) => (

                                                            <Pressable
                                                                onPress={() =>
                                                                    isOnline && handleRedirect(e)
                                                                }
                                                                key={index} style={{ marginTop: "8%", }}>

                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-around' }}>
                                                                        <View style={{ width: deviceheight * 0.066, height: deviceheight * 0.066, borderRadius: borderradius * 5, }} >
                                                                            {
                                                                                e?.From_Details?.profile != "" ?

                                                                                    <View style={{ width: devicewidth * 0.140, height: devicewidth * 0.140 }}>
                                                                                        <Image
                                                                                            style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                                            source={{ uri: `${Imageurl}${e?.From_Details?.profile}` }}
                                                                                            resizeMode="cover" />
                                                                                    </View>
                                                                                    :
                                                                                    <View style={{ width: devicewidth * 0.140, height: devicewidth * 0.140 }}>
                                                                                        <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                                            source={randomimages[e?.From_Details?.randomIndex]}
                                                                                            resizeMode="cover" />
                                                                                    </View>
                                                                            }
                                                                        </View>

                                                                        <View style={{ marginLeft: "5%", }}>

                                                                            {e?.userId == userId && e?.type == "Emailtransfer" || e?.type == "Emailtransfercancel" ?
                                                                                <Text style={styles.gptitle}>{t('You')}</Text>
                                                                                :
                                                                                <Text style={styles.gptitle}>
                                                                                    {e?.From_Details?.username}
                                                                                </Text>
                                                                            }

                                                                            {/* {e?.type == "Emailtransfer" || e?.type == "Emailtransfercancel"
                                                                            || e?.type == "Add New Group" || e?.type == "New user joined" || e?.type == "New user joined" || e?.type == "Followback" || e?.type == "Event"
                                                                            ?
                                                                            <Text style={styles.gpsubtitle} >{e?.message}</Text>
                                                                            :

                                                                            <Text style={styles.gpsubtitle} numberOfLines={1}>{e?.message}</Text>
                                                                        } */}
                                                                            <Text style={styles.gpsubtitlems} >{e?.message}</Text>
                                                                        </View>


                                                                    </View>


                                                                    {e?.type == "like" && e?.type != "Follow" &&
                                                                        <Pressable style={styles.likebtn}>
                                                                            {Images.like1_fillIcon}
                                                                        </Pressable>
                                                                    }
                                                                </View>

                                                                <View style={{ alignItems: 'center' }}>

                                                                    {e?.type != "like" && e?.type != "Event" && e?.type != "User" &&
                                                                        <>
                                                                            {(e?.notificationsDetails || e?.status == "private") ?

                                                                                <>
                                                                                    {e?.notificationsDetails && e?.type !== "like" && e?.type !== "Event" && e?.type !== "User" &&

                                                                                        <>
                                                                                            {(e?.notificationsDetails?.status == "completed" && e?.notificationsDetails?.from == userId) && e?.type == "Follow" &&
                                                                                                <>

                                                                                                    <Pressable style={styles.btn}>
                                                                                                        <Text style={styles.btntxt}>{t('Following')}</Text>
                                                                                                    </Pressable>
                                                                                                </>
                                                                                            }

                                                                                        </>
                                                                                    }

                                                                                    {e?.status == "private" && e?.type != "User" && e?.type !== "like" && e?.type !== "Event" && !(e?.notificationsDetails?.status == "completed") &&
                                                                                        <>
                                                                                            {e?.followUserId?.status == "pending" &&
                                                                                                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-around" }}>
                                                                                                    <Pressable onPress={() => handlePrivateUserAccFollow(e?.followUserId)} style={styles.confirmbtn}>
                                                                                                        <Text style={styles.confirmbtntxt}>{t('Accept')}</Text>
                                                                                                    </Pressable>
                                                                                                    {/* <Pressable onPress={() => handleUserUnFollow(e?.followUserId)} style={styles.confirmbtn1}>
                                                                                                    {Images.close4}
                                                                                                </Pressable> */}
                                                                                                    <Pressable onPress={() => handleUserUnFollow(e?.followUserId)} style={styles.confirmbtn}>
                                                                                                        <Text style={styles.confirmbtntxt}>{t('Delete')}</Text>
                                                                                                    </Pressable>
                                                                                                </View>
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                </>
                                                                                :
                                                                                <>
                                                                                    {e?.type != "like" && e?.type != "User" && e?.type != "Event" && e?.type != "Emailtransfercancel" && e?.type != "Emailtransfer" ? "" :
                                                                                        <Pressable onPress={() => handleUserFollow(e)} style={styles.followbtn}>
                                                                                            <Text style={styles.followbtntxt}>{t('follow_back')}</Text>
                                                                                        </Pressable>
                                                                                    }

                                                                                </>
                                                                            }
                                                                        </>
                                                                    }
                                                                </View>
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                ))}
                                            </>
                                        </View>
                                    </Pressable>

                                </View>

                                {footerLoading &&
                                    <View style={{ height: "88%", paddingBottom: "2.5%", paddingHorizontal: "3%" }} >
                                        <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                    </View>
                                }

                            </ScrollView>

                        </View>

                        :

                        <>

                            <View style={{ width: "100%", height: deviceheight * 0.88, alignItems: "center", justifyContent: "center" }} >

                                <Text style={{
                                    fontFamily: Fonts.ExtraBold,
                                    color: c.white,
                                    fontSize: RFValue(16),
                                }}>{t('No_Notifications')}</Text>

                            </View>


                        </>
                    }



                </View>
            </LinearGradient>

        </View>
    )
}

export default Notification

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: devicewidth,
        height: deviceheight
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),


    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(12),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: deviceheight * 0.120,
        flexDirection: "row",
        alignItems: "center",

    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    headertxt: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
        textAlign: "center"
    },
    avatorbox: {
        width: devicewidth * 0.30,
        height: devicewidth * 0.30,
        borderRadius: (devicewidth * 0.12) / 2,
        backgroundColor: c.primary,
        marginLeft: '4%',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#fff",
        borderWidth: 2
    },
    editbox: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: "0%",
        right: -10,
    },
    nametxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(22),
    },
    gendertxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(14),
    },
    connectxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    countrytxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),

    },
    roundbox1: {
        width: devicewidth * 0.110,
        height: devicewidth * 0.110,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    btn: {
        width: "25%",
        borderRadius: borderradius * 0.5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        padding: "1.5%",
        alignSelf: "center",
    },
    btntxt: {
        color: c.secondary,
        fontSize: RFValue(11.5),
        fontFamily: Fonts.Medium
    },
    parabox: {
        width: "90%",
        alignSelf: "center",
        borderRadius: borderradius * 0.3,
        backgroundColor: "#CA6859",
        paddingHorizontal: "4%",
        paddingVertical: "4%",
        marginVertical: "4%"


    },
    headingtxt: {
        fontSize: RFValue(16),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    paratxt: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Light,
        color: c.white,
        letterSpacing: 0.1,
        textAlign: "justify"
    },
    smallbtn: {
        width: '31%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0480,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    smallbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(11),
        marginRight: '2%',
    },
    addround: {
        width: devicewidth * 0.09,
        height: devicewidth * 0.09,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.secondary,
        alignItems: "center",
        justifyContent: "center",

    },
    cancelround: {
        width: devicewidth * 0.09,
        height: devicewidth * 0.09,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#FF0000",
        alignItems: "center",
        justifyContent: "center",

    },
    gptitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),

    },
    gpsubtitle: {
        fontFamily: Fonts.Regular,
        color: c.grey,
        fontSize: RFValue(13),
        width: devicewidth * 0.40
    },
    gpsubtitlems: {
        fontFamily: Fonts.Regular,
        color: c.grey,
        fontSize: RFValue(13),
        width: devicewidth * 0.70
    },
    likebtn: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
    },
    followbtn: {
        width: "auto",
        borderRadius: borderradius * 0.5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        paddingHorizontal: "1.5%",
        paddingVertical: "2%",
        alignSelf: "flex-start",
        marginLeft: 75,
        marginTop: 3
    },
    followbtntxt: {
        color: c.secondary,
        fontSize: RFValue(11.5),
        fontFamily: Fonts.Medium

    },
    confirmbtn: {
        borderRadius: borderradius * 0.5,
        backgroundColor: c.white,
        alignItems: "flex-start",
        justifyContent: "center",
        borderColor: c.white,
        paddingHorizontal: 10,
        paddingVertical: 6

    },
    confirmbtn1: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        borderRadius: borderradius * 5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        padding: "1%",

    },
    confirmbtntxt: {
        color: c.secondary,
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium,
        paddingHorizontal: 20
    },
    dateHeader: {
        color: c.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.Black,
        alignSelf: "center",
    }


});
