import { View, Text, StyleSheet, Pressable, ScrollView, Image, Keyboard, Platform, TouchableOpacity, Modal, Linking, Alert, ActivityIndicator, Share, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { hasActiveSubscription } from '../../Actions/config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_ChatMembersList, update_EventStatus, update_FetchProfileId, update_Isreportfilter, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { EventDetails, ReportToAdmin, groupMembersapi, eventcommentlistapi, eventdeleteapi, GroupJoinandUnjoin, GetGroupInfo, DeleteInstance } from '../../Actions/hooks';
import { GetItem } from '../../Actions/localstorage';
import Comment from '../../comment/Comment';
import { Imageroute, Imageurl } from '../../Actions/constant';
import Swiper from 'react-native-swiper';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import profileImagePath, { localrandomindex, randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import { profileSelector } from '../../Slices/profile';
import branch from 'react-native-branch';
import ReportPopUp from '../Group/ReportPopUp';
import { getHobbiesWithMutualSorted, hobbyIdString } from '../../Utilities/mutualHobbies';

/** Route already carries enough to paint GroupDetails without blocking on GetGroupInfo */
function hasUsableGroupPrefill(d) {
    if (!d || !d._id) return false;
    if (typeof d.chatName === 'string' && d.chatName.trim().length > 0) return true;
    if (Array.isArray(d.members) && d.members.length > 0) return true;
    if (d.Image != null && String(d.Image).trim().length > 0) return true;
    if (Array.isArray(d.groupImages) && d.groupImages.length > 0) return true;
    if (typeof d.groupDiscription === 'string' && d.groupDiscription.trim().length > 0)
        return true;
    return false;
}

const GroupDetails = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const [data, setData] = useState({})

    const [groupMembers, setGroupMembers] = useState([]);
    const [reguestedMembers, setRequestedMembers] = useState([]);
    const [groupHobbies, setGroupHobbies] = useState([]);
    const [creator, setCreator] = useState();
    const dispatch = useDispatch()
    const userID = GetItem("UserId")
    const [apiCalled, setApiCalled] = useState(false)
    const [currentIndex, setCurrectIndex] = useState([])

    const { profile } = useSelector(profileSelector);
    const sortedGroupHobbies = useMemo(
        () => getHobbiesWithMutualSorted(profile?.hobbies, groupHobbies),
        [profile?.hobbies, groupHobbies],
    );
    const [eventURL, setEventURL] = useState("")
    const [pageLoad, setPageLoad] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const swiperRef = useRef(null);

    const [groupId, setGroupId] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            dispatch(update_EventStatus({}))

        }, [])

    )

    useEffect(() => {
        const detail = props?.route?.params?.detail;
        if (!detail?._id) {
            setPageLoad(true);
            getEventDetails();
            return;
        }

        setGroupId(detail._id);

        if (hasUsableGroupPrefill(detail)) {
            setData(detail);
            setGroupMembers(detail?.members ?? []);
            setRequestedMembers(detail?.requestedUsers ?? []);
            setGroupHobbies(detail?.grouphobbies ?? []);
            setCreator(detail?.userId ?? detail?.groupCreater?._id);
            if (Array.isArray(detail?.groupImages) && detail.groupImages.length > 0) {
                const path = Imageroute?.eventProfile;
                setImagePrevUrl(
                    detail.groupImages.map(fn => ({ url: `${path}${fn}` })),
                );
            } else {
                setImagePrevUrl([]);
            }
            setPageLoad(false);
        } else {
            setPageLoad(true);
        }

        getEventDetails();
    }, [props?.route?.params?.detail]);

    const getEventDetails = async () => {
        try {

            let groupID = props?.route?.params?.detail?._id;

            if (!groupID) {
                setPageLoad(false);
                return;
            }

            const snapshotId = groupID;

            setGroupId(groupID);

            let payload = {
                userId: GetItem('UserId') ? GetItem('UserId') : profile?._id,
                groupId: groupID
            };
            const result = await GetGroupInfo(payload);

            if (snapshotId !== props?.route?.params?.detail?._id) {
                return;
            }

            if (result?.status) {
                let data = result?.data[0];

                if (data?.event_status == "finished") {
                    //ShowToast(t('EventExpired'))
                    navigation.navigate("Homescreen");
                    return
                }
                else {
                    setData(data);
                    setGroupMembers(data?.members ? data?.members : []);
                    setRequestedMembers(data?.requestedUsers ? data?.requestedUsers : []);
                    setGroupHobbies(data?.grouphobbies ? data?.grouphobbies : []);
                    setCreator(data?.userId);
                    handleImagePreview(data?.groupImages)
                    //shareLink()
                }
            }
            else {
                let data = props?.route?.params?.detail
                setData(data);
                setGroupMembers(data?.members ? data?.members : []);
                setRequestedMembers(data?.requestedUsers ? data?.requestedUsers : []);
                setGroupHobbies(data?.grouphobbies ? data?.grouphobbies : []);
                setCreator(data?.groupCreater?._id);
                handleImagePreview(data?.groupImages)
            }



        } catch (error) {
            console.log("Error on getEventDetails: ", error)
        }
        finally {
            setPageLoad(false);
        }
        //shareLink()
    }

    const [visible, setVisible] = useState(false)
    const [mediaVisible, setMediaVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [imagePrevUrl, setImagePrevUrl] = useState([]);

    const [reportVisible, setReportVisible] = useState(false);
    const [reportText, setReportText] = useState("")


    const formatDateTime = (dateTime) => {
        if (!dateTime) {
            return { formattedDate: 'Invalid Date', formattedTime: '' };
        }

        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
            return { formattedDate: 'Invalid Date', formattedTime: '' };
        }

        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

        const formattedDate = new Intl.DateTimeFormat('en-US', optionsDate).format(date);
        const formattedTime = new Intl.DateTimeFormat('en-US', optionsTime).format(date);

        return { formattedDate, formattedTime };
    };

    const { formattedDate: startFormattedDate, formattedTime: startFormattedTime } = formatDateTime(data?.startDate);
    const { formattedDate: endFormattedDate, formattedTime: endFormattedTime } = formatDateTime(data?.endDate);

    const handleImagePreview = async (fileName) => {

        if (!Array.isArray(fileName) || fileName.length === 0) {
            setImagePrevUrl([]);
            return;
        }

        const path = Imageroute?.eventProfile

        const imageObjects = fileName.map(fileNames => ({
            url: `${path}${fileNames}`
        }));

        // Update the state
        setImagePrevUrl(imageObjects);
    }

    const openImageSlider = (index) => {
        setMediaVisible(true);
        setCurrentImageIndex(index)
    }

    const handleViewProfile = (data) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        dispatch(update_FetchProfileId(data?._id))

        navigation.navigate("HomeDetail", { detail: data })
    }



    const handleAddInterest = async (type) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {

                userId: userID,
                instanceId: data?._id,
                type: type,
                isGroupchat: true
            }

            if (apiCalled) return;
            setApiCalled(true)


            const result = await GroupJoinandUnjoin(payload)

            if (result?.status) {
                let members = []
                if (type == "unjoingroup") {
                    //ShowToast(t('You_are_successfully_leave_the') + " " + data?.chatName + t('Conversation'))
                    members = groupMembers.filter((data) => data?._id != userID);

                    let local = [data, ...chatMembersList]
                    dispatch(update_ChatMembersList(local));
                    navigation.navigate("Chat")
                }
                else {
                    members = [...groupMembers, {
                        "_id": userID,
                        "online_status": profile?.online_status,
                        "randomIndex": profile?.randomIndex,
                        "username": profile?.username,
                        "profile": profile?.profile,
                        "userblocked": [],
                    }];

                    let local = chatMembersList?.filter((item) => item?._id != data?._id);
                    dispatch(update_ChatMembersList(local));
                }

                if (data?.isPrivate) {

                    let reqMembers = [...reguestedMembers, {
                        "_id": userID,
                        "online_status": profile?.online_status,
                        "randomIndex": profile?.randomIndex,
                        "username": profile?.username,
                        "name": profile?.username,
                        "bioimage": [],
                        "profile": profile?.profile,
                        "userblocked": [],
                    }]

                    setRequestedMembers(reqMembers);
                } else {
                    setGroupMembers(members);
                }
            }
            else {
                ShowToast(result?.message)
            }
        }
        catch (error) {
        }
        finally {
            setApiCalled(false)
            setCurrectIndex((prev) => prev.filter((item) => item?._id != data?._id));
        }
    }

    const openMaps = (latitude, longitude) => {
        const latLng = `${longitude},${latitude}`;

        // For iOS (Apple Maps) with a pin
        const appleMapsUrl = `http://maps.apple.com/?ll=${latLng}&q=${latLng}`;

        // For Android and Google Maps on iOS with a pin
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
        // Platform-specific redirection
        if (Platform.OS === 'ios') {
            Linking.openURL(appleMapsUrl).catch((err) => console.error('Error opening Apple Maps:', err));
        } else {
            Linking.openURL(googleMapsUrl).catch((err) => console.error('Error opening Google Maps:', err));
        }
    };


    const handleModelOpen = () => {
        setModalVisible(!modalVisible);
    }

    const handleReportEvent = async () => {
        setModalVisible(false);
        dispatch(update_Isreportfilter(true))
    }

    const handleReport = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;
            setApiCalled(true)

            let payload = {
                report_from: userID,
                report_to: data?._id,
                message: reportText,
                type: "group",
                to: userID,
            }

            Keyboard.dismiss()

            const result = await ReportToAdmin(payload);

            if (result.status) {
                ShowToast(t('GroupReportedSuccessfully'))
            }
            else {
            }

            setReportText("")
        } catch (error) {

        }
        finally {
            setApiCalled(false)
        }
    }

    const { isreportfilter, isOnline, chatMembersList } = useSelector(helperSelector)

    const handleAlert = () => {
        setModalVisible(false)
        Alert.alert(t('Delete_Grp'), t('you_delete_created_group'), [
            {
                text: t('Cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: t('YES'),
                onPress: () => handleDeleteGroup(),
            },
        ]);
    }


    const handleDeleteGroup = async () => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let member = data?.members?.map((mem) => mem?._id)

            let payload = {
                userId: userID,
                instanceId: [data?._id]
            }

            const result = await DeleteInstance(payload);
            if (result?.status) {
                ShowToast(result?.message)
                // navigation.navigate("Chat")
                navigation.navigate("Homescreen", {
                    screen: "Chat",
                });
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
            console.log("handleDeleteGroup______", err);
        }
        finally {
            setApiCalled(false)
        }

    }

    const handleNavigateFunction = async () => {
        setModalVisible(false);
        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        const swappedCoordinates = data?.location?.coordinates ?
            [data.location.coordinates[1], data.location.coordinates[0]] :
            [0, 0];

        navigation.navigate("EventCreation", {
            edit: {
                ...data,
                location: {
                    ...data.location,
                    coordinates: swappedCoordinates
                }
            }
        });
    }

    const editGroup = async (data) => {
        if (!hasActiveSubscription(profile)) {
            Alert.alert(t('Note'), t('You_want_to_ubscribe'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('OK'), onPress: () => navigation.navigate('Premium') },
            ]);
            return;
        }

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        let merged = data;
        try {
            const uid = GetItem('UserId') ? GetItem('UserId') : profile?._id;
            if (uid && data?._id) {
                const payload = { userId: uid, groupId: data._id };
                const result = await GetGroupInfo(payload);
                if (result?.status && result?.data?.[0]) {
                    merged = { ...data, ...result.data[0] };
                }
            }
        } catch (error) {
            console.log('editGroup GetGroupInfo', error);
        }

        let passload = {
            groupId: merged?._id,
            groupName: merged?.chatName,
            groupDesc: merged?.groupDiscription,
            groupMembers: groupMembers,
            groupProfile: merged?.Image ? `${Imageurl}${merged?.Image}` : "",
            groupIndex: merged?.groupIndex,
            groupHobbies: merged?.grouphobbies,
            groupStatus: merged?.isPrivate,
            groupHideStatus: merged?.ishidegroup,
            groupLocation: merged?.location,
            groupAddress: merged?.groupAddress,
            groupImages: merged?.groupImages,
        }

        navigation.navigate("CreateGroup", { grpDetail: passload, editSts: true })
    }

    const handleChatNavigation = async () => {
        try {

            navigation.navigate("ChatGroup", { detil: data, pageFrom: "Chat" });

        } catch (error) {
            console.log("Error on handleChatNavigation: ", error)
        }
    }

    // const shareLink = async () => {

    //     const propsDTL = props?.route?.params?.detail;
    //     // const imgURL = `${Imageroute?.groupBioImagePath}${propsDTL?.groupImages}`;

    //     console.log("PropsDTL_____", propsDTL);

    //     // const imgURL = propsDTL?.Image ? propsDTL?.Image : `${Imageroute?.groupBioImagePath}${propsDTL?.Image}`;
    //     const imgURL =  `${Imageroute?.eventProfile}${data?.groupImages[0]}`;


    //     // const imgURL = `${Imageroute?.groupBioImagePath}${propsDTL?.groupImages[0]}`;

    //     console.log("IMageURlGroupp_____", imgURL);

    //     const detail = props?.route?.params?.detail;
    //     const groupId = detail?._id;


    //     try {

    //         const branchUniversalObject = await branch.createBranchUniversalObject(`Group/${groupId}`, {

    //             title: data?.eventTitle,
    //             contentDescription: data?.description,
    //             contentImageUrl: imgURL,
    //             contentMetadata: {
    //                 customMetadata: {
    //                     data: JSON.stringify({
    //                         screen: "GroupDetails",
    //                         routeId: groupId,
    //                         imageURL: imgURL,
    //                     })

    //                 },
    //             },
    //         });

    //         // 2. Define link properties
    //         const linkProperties = {
    //             // feature: 'share',
    //             // channel: 'all',
    //         };

    //         // 3. Define control parameters (optional, for fallback or deep linking behavior)
    //         const controlParams = {
    //             $desktop_url: `https://play.google.com/store/apps/details?id=com.meetwave`, // Fallback URL for desktop users
    //             $ios_url: `meetwave://product/${groupId}`,                  // iOS app deep link (if applicable)
    //             $android_url: `meetwave://product/${groupId}`,
    //             //$game_Id: e.id,              // Android app deep link (if applicable)
    //         };

    //         // 4. Generate a short URL
    //         const { url } = await branchUniversalObject.generateShortUrl(linkProperties, controlParams);
    //         setEventURL(url)
    //         return url;

    //     } catch (error) {
    //         console.log('Error sharing product:', error);
    //     }
    // }


    const shareLink = async (e) => {

        const propsDTL = props?.route?.params?.detail;

        const imgURL = `${Imageroute?.eventProfile}${data?.groupImages[0]}`;

        try {

            const createBranchUniversalObject = await branch.createBranchUniversalObject(`Group/${propsDTL?._id}`, {

                title: data?.eventTitle,
                contentDescription: data?.description,
                contentImageUrl: imgURL,
                contentMetadata: {
                    customMetadata: {
                        data: JSON.stringify({
                            screen: "GroupDetails",
                            routeId: propsDTL?._id,
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
                $ios_url: `meetwave://product/${propsDTL?._id}`,                  // iOS app deep link (if applicable)
                $android_url: `meetwave://product/${propsDTL?._id}`,
                //$game_Id: e.id,              // Android app deep link (if applicable)
            };

            // 4. Generate a short URL
            const { url } = await createBranchUniversalObject.generateShortUrl(linkProperties, controlParams);
            setEventURL(url)
            // openShare(url)
            return url;
        } catch (error) {
            console.log('Error sharing product:', error);
        }
    }

    const openShare = async () => {

        const url = await shareLink();

        await Share.share({
            message: url,
        })
            //after successful share return result
            .then((result) => console.log(result))
            //If any thing goes wrong it comes here
            .catch((errorMsg) => console.log(errorMsg));
    }

    // return (
    //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }} >
    //         <Pressable onPress={() => props?.navigation?.goBack()} >
    //             <Text>Navi</Text>
    //         </Pressable>
    //     </View>
    // )

    return (
        <>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    {pageLoad ?
                        <>
                            <View style={styles.backcontainer}>
                                <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                    <Pressable
                                        onPress={() => navigation.goBack()}
                                        style={styles.roundbox}>
                                        {Images.back}
                                    </Pressable>
                                </View>
                            </View>

                            <View style={{ height: "100%", paddingBottom: "2.5%", justifyContent: "center" }} >
                                <ActivityIndicator size="large" color={c.white} />
                            </View>
                        </>
                        :
                        <>
                            <View style={styles.backcontainer}>
                                {/* <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                    <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                        {Images.back}
                                    </Pressable>
                                    <View style={{ alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                        <Text style={styles.title}>{data?.chatName} </Text>
                                        {data?.isPrivate &&
                                            <>
                                                {Images.WhiteLock}
                                            </>
                                        }

                                    </View>
                                    <View style={{ flexDirection: "row", width: "17%", justifyContent: "space-between" }}>
                                      
                                        <Pressable onPress={() => openShare()}>
                                            {Images.share}
                                        </Pressable>

                                        <Pressable style={{}} onPress={() => handleModelOpen()}>
                                            {Images.tripledot}
                                        </Pressable>

                                    </View>

                                </View> */}

                                <View style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: 12
                                }}>

                                    {/* 🔹 LEFT : BACK BUTTON */}
                                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                                        <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                            {Images.back}
                                        </Pressable>
                                    </View>

                                    {/* 🔹 CENTER : TITLE + LOCK */}
                                    <View style={{
                                        flex: 3,
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Text
                                            style={styles.title}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {data?.chatName}
                                        </Text>

                                        {data?.isPrivate && (
                                            <View style={{ marginLeft: 6 }}>
                                                {Images.WhiteLock}
                                            </View>
                                        )}
                                    </View>

                                    {/* 🔹 RIGHT : SHARE + MENU */}
                                    <View style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        alignItems: "center"
                                    }}>
                                        <Pressable onPress={() => openShare()} style={{ marginRight: 12 }}>
                                            {Images.share}
                                        </Pressable>

                                        <Pressable onPress={() => handleModelOpen()}>
                                            {Images.tripledot}
                                        </Pressable>
                                    </View>
                                </View>

                            </View>

                            <View style={{ width: "100%", height: "88%" }}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{ marginBottom: "10%" }}>
                                        <View style={{ width: "90%", alignSelf: "center", }}>

                                            <View style={{ width: "100%", height: deviceheight * 0.26 }}>
                                                <Swiper
                                                    ref={swiperRef}
                                                    style={{ height: "auto" }}
                                                    showsButtons={false}
                                                    autoplay={false}
                                                    autoplayTimeout={3}
                                                    loop={true}
                                                    dotColor={c.primary}
                                                    activeDotColor="#fff"
                                                    paginationStyle={{
                                                        bottom: -20,
                                                    }}
                                                >
                                                    {Array.isArray(data?.groupImages) && data?.groupImages?.length > 0 ? (
                                                        data?.groupImages?.map((item, index) => (
                                                            <TouchableWithoutFeedback
                                                                key={index}
                                                                delayPressIn={50}
                                                                onPress={() => {
                                                                    openImageSlider(index);
                                                                }}
                                                            >
                                                                <View style={{ width: "100%", height: "90%", borderRadius: borderradius * 0.8, overflow: "hidden", }}>
                                                                    <Image
                                                                        source={{ uri: `${Imageroute?.eventProfile}${item}` }}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                        }}
                                                                        resizeMode="contain"
                                                                    />
                                                                </View>
                                                            </TouchableWithoutFeedback>
                                                        ))
                                                    ) : (
                                                        <Text
                                                            style={{
                                                                textAlign: "center",
                                                                color: "#fff",
                                                                fontSize: RFValue(12),
                                                            }}
                                                        >
                                                            {t("No_Photo_Found")}
                                                        </Text>
                                                    )}
                                                </Swiper>
                                            </View>


                                            <View style={{ marginTop: "6%" }}>
                                                <Text style={styles.abouttxt}>{t('Description')}</Text>
                                            </View>
                                            <View style={{ marginTop: "2%" }}>
                                                <Text style={styles.paratxt}>{data?.groupDiscription}</Text>
                                            </View>

                                            <View style={{ marginTop: "7%", }}>
                                                <Text style={styles.create}>{t('Group_Creator')}</Text>
                                                <Pressable onPress={() => { data?.groupCreater?._id != userID && handleViewProfile(data?.groupCreater) }}>
                                                    <View style={{
                                                        width: "100%",
                                                        flexDirection: "row",
                                                        marginTop: "4%",
                                                        gap: 7,
                                                        alignItems: "center",

                                                    }}>

                                                        {data?.groupCreater?.profile ?
                                                            <Image
                                                                style={{
                                                                    width: devicewidth * 0.100,
                                                                    height: devicewidth * 0.100,
                                                                    borderRadius: borderradius * 2
                                                                }}
                                                                source={{ uri: `${Imageroute.PersonalProfile}${data?.groupCreater?.profile}` }}
                                                            />
                                                            :
                                                            <Image
                                                                style={{
                                                                    width: devicewidth * 0.130,
                                                                    height: devicewidth * 0.130,
                                                                    borderRadius: borderradius * 2,
                                                                }}
                                                                source={randomimages[data?.groupCreater?.randomIndex]}
                                                                resizeMode='cover'
                                                            />
                                                        }

                                                        <Text style={styles.nametxt}>{data?.groupCreater?.username}</Text>
                                                    </View>
                                                </Pressable>
                                            </View>


                                            <View style={{ marginTop: "3%" }}>
                                                <Text style={styles.create}>{t('Members')}: {groupMembers?.length}</Text>
                                            </View>

                                            <View style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                marginTop: "6%",
                                                gap: 5,
                                            }}>

                                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>

                                                    <View style={{ width: "100%", flexDirection: "row", gap: 5 }}>

                                                        {groupMembers?.length > 0 && (

                                                            groupMembers?.map((e, index) => (
                                                                <Pressable onPress={() => e?._id != userID && handleViewProfile(e)}>

                                                                    {e?.profile ? (
                                                                        <Image
                                                                            style={{
                                                                                width: devicewidth * 0.130,
                                                                                height: devicewidth * 0.130,
                                                                                borderRadius: borderradius * 2,
                                                                            }}
                                                                            source={{ uri: `${Imageroute.PersonalProfile}${e?.profile}` }}
                                                                        />
                                                                    ) : (
                                                                        <Image
                                                                            style={{
                                                                                width: devicewidth * 0.130,
                                                                                height: devicewidth * 0.130,
                                                                                borderRadius: borderradius * 2,
                                                                            }}
                                                                            source={randomimages[e?.randomIndex]}
                                                                            resizeMode='cover'
                                                                        />
                                                                    )}

                                                                </Pressable>
                                                            ))
                                                        )}

                                                    </View>
                                                </ScrollView>

                                            </View>

                                            <View style={{ marginTop: "7%", }}>
                                                <Text style={styles.create}>{t('Hobbies')}</Text>

                                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: "3%", gap: 10 }}>
                                                    {sortedGroupHobbies.length > 0 && (
                                                        sortedGroupHobbies.map((e, index) => (
                                                            <View
                                                                key={hobbyIdString(e) || index}
                                                                style={[
                                                                    styles.smallbtnOuter,
                                                                    e.isMutual && styles.smallbtnMutualOuter,
                                                                ]}
                                                            >
                                                                <View
                                                                    style={[
                                                                        styles.smallbtn,
                                                                        e.isMutual && styles.smallbtnMutualInner,
                                                                    ]}
                                                                >
                                                                    <Text style={styles.smallbtntxt}>{e?.hobbyname ?? e?.hobbyName}</Text>
                                                                </View>
                                                            </View>
                                                        ))
                                                    )}
                                                </View>
                                            </View>



                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: "4%", width: "100%", }}>
                                                {data?.groupCreater?._id != userID &&
                                                    <>
                                                        {groupMembers?.some(memb => memb?._id == userID) ?
                                                            (
                                                                <View style={styles.interestbtn} >
                                                                    {apiCalled && currentIndex?.includes(data?._id) ?
                                                                        <ActivityIndicator style={{ alignSelf: "center", }} color={c?.secondary} size={"small"} />
                                                                        :
                                                                        <Pressable
                                                                            onPress={() => {
                                                                                setCurrectIndex((prev) => [...prev, data?._id])
                                                                                handleAddInterest("unjoingroup")
                                                                            }}
                                                                        >
                                                                            <Text style={styles.interesttxt}>{t('Leave_Group')}</Text>
                                                                        </Pressable>
                                                                    }
                                                                </View>
                                                            )
                                                            :

                                                            (reguestedMembers?.some(memb => memb?._id == userID) ?

                                                                <View style={styles.interestbtn}  >
                                                                    {apiCalled && currentIndex?.includes(data?._id) ?
                                                                        <ActivityIndicator style={{ alignSelf: "center" }} color={c?.secondary} size={"small"} />
                                                                        // ""
                                                                        :
                                                                        <View
                                                                        // onPress={() => {
                                                                        //     setCurrectIndex((prev) => [...prev, data?._id])
                                                                        //     handleAddInterest("joingroup")
                                                                        // }}
                                                                        >
                                                                            <Text style={styles.interesttxt}>{t('Pending')}</Text>
                                                                        </View>
                                                                    }
                                                                </View>
                                                                :
                                                                <View style={styles.interestbtn}  >
                                                                    {apiCalled && currentIndex?.includes(data?._id) ?
                                                                        <ActivityIndicator style={{ alignSelf: "center" }} color={c?.secondary} size={"small"} />
                                                                        // ""
                                                                        :
                                                                        <Pressable
                                                                            onPress={() => {
                                                                                setCurrectIndex((prev) => [...prev, data?._id])
                                                                                handleAddInterest("joingroup")
                                                                            }}
                                                                        >
                                                                            <Text style={styles.interesttxt}>{t('Join_Group')}</Text>
                                                                        </Pressable>
                                                                    }
                                                                </View>

                                                            )
                                                        }
                                                    </>
                                                }



                                                {groupMembers?.some(event => event?._id == userID) &&
                                                    (
                                                        <View style={{ flexDirection: "row", width: "70%", marginTop: "3%", justifyContent: "flex-end" }}>
                                                            <Pressable onPress={() => handleChatNavigation()} style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <View style={{ marginRight: "5%" }}>{Images.comment}</View>
                                                                <Text style={{
                                                                    fontFamily: Fonts.Bold,
                                                                    color: c.white,
                                                                    fontSize: RFValue(15),
                                                                }}>{t('Group_Chat')}</Text>
                                                            </Pressable>
                                                        </View>
                                                    )
                                                }

                                            </View>

                                        </View>

                                    </View>
                                </ScrollView>
                            </View>
                        </>
                    }

                </View>
                {data?._id ?
                    <Comment visible={visible} onclose={(getvalue) => setVisible(getvalue)} eventid={data?._id} /> : null}

            </LinearGradient>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <SafeAreaProvider>
                    <SafeAreaView onStartShouldSetResponder={() => setModalVisible(false)} style={{ flex: 1, }} >
                        <View onStartShouldSetResponder={() => setModalVisible(false)} style={{ flex: 1, backgroundColor: 'green ' }} >
                            <View style={{
                                width: "30%",
                                position: "absolute",
                                right: "6%",
                                top: "8%",
                                backgroundColor: c.secondary,
                                borderRadius: borderradius * 0.150,
                                justifyContent: "center",
                            }}>


                                {data?.groupCreater?._id == userID ?
                                    <>
                                        <Pressable onPress={() => {
                                            editGroup(data);
                                            setModalVisible(false)
                                        }} style={{ flexDirection: "row", marginHorizontal: "6%", alignItems: "center", paddingVertical: "10%" }}>
                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Edit')}</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable onPress={handleAlert} style={{ flexDirection: "row", alignItems: "center", paddingVertical: "10%" }}>
                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>  {t('Delete')}</Text>
                                            </View>
                                        </Pressable>
                                    </>

                                    :
                                    <Pressable onPress={handleReportEvent} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: "10%" }}>
                                        <View style={{}}>
                                            <Text onPress={handleReportEvent} style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Report_Grp')}</Text>
                                        </View>

                                    </Pressable>
                                }


                            </View>
                        </View>


                    </SafeAreaView>
                </SafeAreaProvider>


            </Modal>

            <ReportPopUp
                visible={isreportfilter}
                reportText={reportText}  // Pass the reportText from the parent state
                setReportText={setReportText}
                reportFn={() => handleReport()} // For report
            />


            {imagePrevUrl?.length > 0 &&

                <Modal visible={mediaVisible} transparent={true} onRequestClose={() => setMediaVisible(false)}>
                    {imagePrevUrl?.length > 1 ?
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            // onClick={() => setVisible(false)}
                            index={currentImageIndex}
                            swipeDownThreshold={400}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setMediaVisible(false)
                            }}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                        :
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            // onClick={() => setVisible(false)}
                            index={currentImageIndex}
                            swipeDownThreshold={400}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setMediaVisible(false)
                            }}
                            renderIndicator={() => null}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                    }

                    <View style={{ width: "100%", height: 100, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 0, left: 0, right: 0, }}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setMediaVisible(false)}>
                            {Images.back}
                        </TouchableOpacity>

                    </View>
                </Modal>
            }

        </>

    )
}

export default GroupDetails

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    title: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(16),

    },
    create: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(16),

    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(17),

    },
    datetxt: {
        fontFamily: Fonts.Light,
        color: c.grey,
        fontSize: RFValue(15),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "12%",
        flexDirection: "row",
        alignItems: "center",


    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: "6%",

    },
    locationtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),

    },
    locationtxt1: {
        width: "90%",
        fontFamily: Fonts.Regular,
        color: "#E0D3D3",
        fontSize: RFValue(14),

    },

    dotstyle: {
        width: "2%",
        borderWidth: 0.5,
        borderColor: "#fff",
        height: deviceheight * 0.0070,
        borderRadius: borderradius * 0.4,
        backgroundColor: c.grey,
        alignSelf: "center",
        marginLeft: "1.5%"
    },
    qstbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "2%"



    },
    abouttxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(17),

    },
    paratxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Light,
        color: c.grey,
        letterSpacing: 0.3,
        textAlign: "justify"
    },
    seetxt: {
        fontFamily: Fonts.SemiBold,
        color: c.primary,
        fontSize: RFValue(17),

    },
    activityContainer: {
        flexDirection: 'row',
        marginTop: "3%",
    },
    activityBox: {
        width: devicewidth * 0.560,
        marginRight: 10,
        backgroundColor: "#901A79",
        borderRadius: borderradius * 0.5,
        paddingHorizontal: "2%",
        paddingVertical: "2%",
        height: deviceheight * 0.2
    },
    activityImage: {
        width: '100%',
        height: deviceheight * 0.15,
        borderRadius: borderradius * 0.5
    },
    activityDate: {
        fontFamily: Fonts.Light,
        color: c.grey,
        fontSize: RFValue(12),
    },
    activityTitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(13),
        marginTop: "3%"

    },
    activityloctxt: {
        fontFamily: Fonts.Regular,
        color: "#E0D3D3",
        fontSize: RFValue(12),
        marginTop: "1%"

    },
    friendtxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),

    },
    avatorbox: {
        width: devicewidth * 0.110,
        height: devicewidth * 0.110,
        borderRadius: (devicewidth * 0.12) / 2,
        backgroundColor: c.primary,
        marginLeft: '4%',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#fff",
        borderWidth: 1
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        borderRadius: borderradius * 0.6,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        backgroundColor: "#C77F86",
        borderWidth: 0.9,

    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "83%",

    },
    cmttxt: {
        textAlign: "center",
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white
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

    },
    timetxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
    },
    msgbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2%"

    },
    msgtxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(10),
    },
    nametxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(16),


    },
    interestbtn: {
        width: "30%",
        borderRadius: borderradius * 1.4,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "3%"
    },
    interesttxt: {
        color: c.secondary,
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium
    },
    backButton: {

        left: "6%",
        top: "38%",
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.8%",
    },
    smallbtnOuter: {
        width: '31%',
        height: deviceheight * 0.0480,
        alignSelf: 'center',
        marginBottom: '4%',
        borderRadius: borderradius * 0.9,
        overflow: 'hidden',
    },
    smallbtnMutualOuter: {
        padding: c.mutualProfileChipBorderWidth,
        backgroundColor: c.mutualProfileRingGreen,
    },
    smallbtn: {
        flex: 1,
        width: '100%',
        borderRadius: borderradius * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.white,
        flexDirection: 'row',
    },
    smallbtnMutualInner: {
        borderRadius: Math.max(0, borderradius * 0.9 - c.mutualProfileChipBorderWidth),
    },
    smallbtntxt: {
        fontFamily: Fonts.Regular,
        color: c.pink,
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium,
        marginRight: '2%',
        textAlign: 'center'
    },



});
