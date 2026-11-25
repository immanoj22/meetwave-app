import { View, Text, StyleSheet, Pressable, ScrollView, Image, Keyboard, Platform, TouchableOpacity, Modal, Linking, Alert, ActivityIndicator, Share, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_EventStatus, update_FetchProfileId, update_Isreportfilter, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { EventDetails, ReportToAdmin, eventInterestapi, eventdeleteapi } from '../../Actions/hooks';
import { GetItem } from '../../Actions/localstorage';
import Comment from '../../comment/Comment';
import { Imageroute } from '../../Actions/constant';
import Swiper from 'react-native-swiper';
import ImageViewer from 'react-native-image-zoom-viewer';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { all } from 'axios';
import ReportPopUp from '../Group/ReportPopUp';
import profileImagePath, { localrandomindex, randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import { profileSelector } from '../../Slices/profile';
import branch from 'react-native-branch';
import { hasActiveSubscription } from '../../Actions/config';
import { getHobbiesWithMutualSorted, hobbyIdString } from '../../Utilities/mutualHobbies';

const ActivityDetail = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const [data, setData] = useState({})
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [eventInterest, setEventIntrest] = useState([]);
    const [creator, setCreator] = useState();
    const [randomIndex, setRandomIndex] = useState(0);
    const dispatch = useDispatch()
    const userID = GetItem("UserId")

    const [apiCalled, setApiCalled] = useState(false)
    const [currentIndex, setCurrectIndex] = useState([])

    const { profile } = useSelector(profileSelector);
    const sortedEventHobbies = useMemo(
        () => getHobbiesWithMutualSorted(profile?.hobbies, data?.eventhobbies),
        [profile?.hobbies, data?.eventhobbies],
    );
    const [eventURL, setEventURL] = useState("")

    const [pageLoad, setPageLoad] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const swiperRef = useRef(null);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            dispatch(update_EventStatus({}))

            // setData(props?.route?.params?.detail)
            // setEventIntrest(props?.route?.params?.detail?.eventinterested ? props?.route?.params?.detail?.eventinterested : [])
            // setCreator(props?.route?.params?.detail?.userId);
            // handleImagePreview(props?.route?.params?.detail?.image)

        }, [])

    )

    useEffect(() => {
        getEventDetails();
    }, [props?.route?.params?.detail]);

    const getEventDetails = async () => {
        try {


            let eventID = props?.route?.params?.detail?.pageFrom == "ChatGroup" ? props?.route?.params?.detail?.eventId : props?.route?.params?.detail?._id;
            let payload = {
                userId: GetItem('UserId') ? GetItem('UserId') : profile?._id,
                eventId: eventID
            };


            setPageLoad(true);
            const result = await EventDetails(payload);

            if (result?.status) {
                let data = result?.data[0];

                if (data?.event_status == "finished") {
                    ShowToast(t('EventExpired'))
                    navigation.navigate("Homescreen");
                    return
                }
                else {
                    setData(data);
                    setEventIntrest(data?.eventinterested ? data?.eventinterested : []);
                    setCreator(data?.userId);
                    handleImagePreview(data?.image)
                    // shareLink()
                }
            }

        } catch (error) {
            console.log("Error on getEventDetails: ", error)
        }
        finally {
            setPageLoad(false);
        }
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



    const handleAddInterest = async (value) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "type": eventInterest.some((data) => data?._id == userID && data.joinstatus == true) ? "unjoin" : "join",
                "userId": userID,
                "eventId": data?._id
            }

            if (apiCalled) return;
            setApiCalled(true)


            const result = await eventInterestapi(payload)


            if (result?.status) {

                dispatch(update_EventStatus(payload))
                ShowToast(result?.message)

                let members = result?.data?.eventinterested?.map((data) => ({
                    _id: data?.userId?._id,
                    name: data?.userId?.name,
                    username: data?.userId?.username,
                    randomIndex: data?.userId?.randomIndex,
                    profile: data?.userId?.profile,
                    MychatDiscription: data?.userId?.MychatDiscription,
                    userblocked: data?.userId?.userblocked,
                    joinstatus: data?.joinstatus,
                }))

                setEventIntrest(members)
                { value == 1 ? navigation.navigate("Events") : "" }


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
                type: "event",
                to: data?.userId?._id,
            }

            Keyboard.dismiss()

            const result = await ReportToAdmin(payload);

            if (result.status) {
                ShowToast(t('EventReportedSuccessfully'))
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

    const { isreportfilter, isOnline } = useSelector(helperSelector)

    const handleAlert = () => {
        Alert.alert(t('Delete_Eve'), t('you_delete_created_event'), [
            {
                text: t('Cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: t('YES'),
                onPress: () => handleDeleteEvent(),
            },
        ]);
    }


    const handleDeleteEvent = async () => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            if (apiCalled) return;
            setApiCalled(true)


            var payload = {
                "userId": userID,
                "eventId": data?._id
            }

            const result = await eventdeleteapi(payload)
            if (result?.status) {
                ShowToast(result?.message)
                navigation.navigate("Activities")

            }
            else {
                ShowToast(result?.message)
            }


        }
        catch (err) {

        }
        finally {
            setApiCalled(false)
        }

    }

    const handleNavigateFunction = async () => {
        setModalVisible(false);
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

    const handleChatNavigation = async () => {
        try {


            let creator = data?.userId;

            let objCreator = [{
                _id: creator?._id,
                userId: creator,
                joinstatus: true,
            }]


            let eventMemb = [...eventInterest, ...objCreator]

            const otherMembers = eventMemb?.filter((data) => data?._id != userID);
            const currentUsr = eventMemb?.find((data) => data?._id == userID);

            const updatedMem = otherMembers?.map((membArr) => ({
                _id: membArr?.userId?._id,
                name: membArr?.userId?.name,
                username: membArr?.userId?.username,
                profile: membArr?.userId?.profile,
                MychatDiscription: membArr?.userId?.MychatDiscription,
                online_status: false,
                bioimage: membArr?.userId?.bioimage,
                randomIndex: membArr?.userId?.randomIndex,
                userblocked: membArr?.userId?.userblocked,
            }));

            if (currentUsr) {
                updatedMem.push({
                    _id: currentUsr?._id,
                    name: currentUsr?.name,
                    MychatDiscription: currentUsr?.MychatDiscription,
                    online_status: false,
                    bioimage: currentUsr?.bioimage,
                    randomIndex: currentUsr?.randomIndex,
                    username: currentUsr?.username,
                    userblocked: currentUsr?.userblocked,
                    profile: currentUsr?.profile,
                })
            }


            let passLoad = {
                _id: data?.group?._id,
                eventId: {
                    _id: data?._id
                },
                chatName: data?.eventTitle,
                isGroupchat: true,
                Image: "",
                CurrentMessage: {},
                ImagePath: "/GroupImage/",
                groupIndex: "",
                members: updatedMem,
                groupAdmin: [],
                groupCreater: {},
                UnreadMessageCount: 0,
                Image: data?.eventprofile,
                groupIndex: data?.eventRandomIndex ? data?.eventRandomIndex : 3,
                isPrivate: data?.privacy_status,
            }

            navigation.navigate("ChatGroup", { detil: passLoad, pageFrom: "Event" })
        } catch (error) {
            console.log("Error on handleChatNavigation: ", error)
        }
    }

    const shareLink = async () => {

        const propsDTL = props?.route?.params?.detail;
        const imgURL = propsDTL?.imageURL ? propsDTL?.imageURL : `${Imageroute?.eventProfile}${propsDTL?.image[0]}`;


        const detail = props?.route?.params?.detail;
        const eventId = detail?._id;


        try {

            const branchUniversalObject = await branch.createBranchUniversalObject(`Event/${eventId}`, {
                title: data?.eventTitle,
                contentDescription: data?.description,
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
            setEventURL(url);
            return url;

            //openShare(url)

            // 5. Open the native share dialog
            // await branchUniversalObject.showShareSheet(linkProperties, controlParams, {
            //     // messageHeader: `Check out this product: ${"product.name"}`,
            //     // messageBody: `${product.description}\n\nView more here: ${url}`,
            // });


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


    return (
        <>

            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    {pageLoad ?
                        <>
                            <View style={styles.backcontainer}>
                                <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                    <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
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
                                <View style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: 12
                                }}>
                                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                                        <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                            {Images.back}
                                        </Pressable>
                                    </View>
                                    <View style={{
                                        flex: 3,
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <Text
                                            style={styles.title}
                                            numberOfLines={1}
                                            ellipsizeMode="tail">{data?.eventTitle} </Text>
                                        {data?.privacy_status == "private" &&
                                            <>
                                                {Images.WhiteLock}
                                            </>
                                        }

                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        alignItems: "center"
                                    }}>
                                        <Pressable style={{ marginRight: 12 }} onPress={() => openShare()}>
                                            {Images.share}
                                        </Pressable>
                                        <Pressable style={{}} onPress={() => handleModelOpen()}>
                                            {Images.tripledot}
                                        </Pressable>

                                    </View>

                                </View>
                            </View>

                            <View style={{ width: "100%", height: "88%" }}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{ marginBottom: "10%" }}>
                                        <View style={{ width: "90%", alignSelf: "center", }}>

                                            <View style={{ width: '100%', height: deviceheight * 0.260, }}>
                                                <Swiper
                                                    ref={swiperRef}
                                                    style={{ height: deviceheight * 0.230 }}
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
                                                    {
                                                        (Array.isArray(data?.image) && data?.image?.length > 0)
                                                            ?
                                                            data?.image?.map((item, index) => (
                                                                <TouchableWithoutFeedback
                                                                    key={index}
                                                                    delayPressIn={50}
                                                                    onPress={() => {
                                                                        openImageSlider(index);
                                                                    }}
                                                                >
                                                                    <View key={index} style={{ width: "100%", height: "90%", borderRadius: borderradius * 0.8, overflow: "hidden" }}>
                                                                        <Image
                                                                            style={{
                                                                                height: "100%",
                                                                                width: '100%',
                                                                            }}
                                                                            source={{ uri: `${Imageroute?.eventProfile}${item}` }}
                                                                            resizeMode="contain"
                                                                        />
                                                                    </View>
                                                                </TouchableWithoutFeedback>

                                                            ))
                                                            :
                                                            <Text style={{ textAlign: "center", color: "#fff", fontSize: RFValue(12) }}>{t('No_Photo_Found')}</Text>
                                                    }
                                                </Swiper>
                                            </View>

                                            <View style={{ marginTop: "6%" }}>
                                                <Text style={styles.abouttxt}>{t('Description')}</Text>
                                            </View>
                                            <View style={{ marginTop: "2%" }}>
                                                <Text style={styles.paratxt}>{data?.description}</Text>
                                            </View>

                                            <View style={{ marginTop: "7%", }}>
                                                <Text style={styles.create}>{t('Event_Admin')}</Text>
                                                <Pressable onPress={() => { data?.userId?._id != userID && handleViewProfile(creator) }}>
                                                    <View style={{
                                                        width: "100%",
                                                        flexDirection: "row",
                                                        marginTop: "4%",
                                                        gap: 7,
                                                        alignItems: "center",
                                                    }}>

                                                        {data?.userId?.profile ?

                                                            <Image
                                                                style={{
                                                                    width: devicewidth * 0.100,
                                                                    height: devicewidth * 0.100,
                                                                    borderRadius: borderradius * 2
                                                                }}
                                                                source={{ uri: `${Imageroute.PersonalProfile}${data?.userId?.profile}` }}
                                                            />
                                                            :
                                                            <Image
                                                                style={{
                                                                    width: devicewidth * 0.130,
                                                                    height: devicewidth * 0.130,
                                                                    borderRadius: borderradius * 2,
                                                                }}
                                                                source={randomimages[data?.userId?.randomIndex]}
                                                                resizeMode='cover'
                                                            />
                                                        }

                                                        <Text style={styles.nametxt}>{data?.userId?.username}</Text>
                                                    </View>
                                                </Pressable>
                                            </View>
                                            <View style={{ marginTop: "5%", width: "100%" }}>
                                                <Text style={styles.create}>{t('Location')}</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: "1%" }}>
                                                    <Text style={[styles.locationtxt1]}>{data?.eventAddress}</Text>
                                                    <Pressable
                                                        onPress={() => openMaps(data?.location?.coordinates[0], data?.location?.coordinates[1])}
                                                    >
                                                        {Images.Pointer}
                                                    </Pressable>
                                                </View>

                                            </View>


                                            <View style={{ marginTop: "3%" }}>
                                                <Text style={styles.create}>{t('Members')}</Text>
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

                                                        {eventInterest?.filter(data => data?.joinstatus === true).length > 0 && (
                                                            eventInterest?.filter(e => e?.joinstatus === true)?.map((e, index) => (
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

                                            <View style={{ marginTop: "4%" }}>
                                                <Text style={styles.subtitle}>
                                                    {data?.EventJoinCount ? `${data.EventJoinCount}` : `${eventInterest?.filter(e => e?.joinstatus === true).length}`} {t('Activity_Members')}
                                                </Text>

                                            </View>

                                            <View style={{ marginTop: "7%", }}>
                                                <Text style={styles.create}>{t('Hobbies')}</Text>

                                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: "3%", gap: 10 }}>
                                                    {sortedEventHobbies.length > 0 && (
                                                        sortedEventHobbies.map((e, index) => (
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


                                            <View style={{ flexDirection: "row", marginTop: "4%", alignItems: "center", width: "100%", }}>
                                                <View style={{ width: "8%", }}>
                                                    {Images.date}
                                                </View>
                                                <View style={{ width: "92%", }}>
                                                    <Text style={styles.datetxt}>{`${startFormattedDate} ${startFormattedTime}`}</Text>
                                                </View>


                                            </View>
                                            <View style={{ flexDirection: "row", marginTop: "4%", alignItems: "center" }}>
                                                <View style={{ width: "8%", }}>
                                                    {Images.date}
                                                </View>
                                                <View style={{ width: "92%", }}>
                                                    <Text style={styles.datetxt}>{`${endFormattedDate} ${endFormattedTime}`}</Text>
                                                </View>

                                            </View>

                                            {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: "4%" }}>
                                        <Text style={styles.subtitle}>{t('Discussions')}</Text>
                                    </View> */}

                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: "4%", width: "100%", }}>
                                                {data?.userId?._id != userID &&
                                                    <>
                                                        {eventInterest?.some(event =>
                                                            event?._id === userID && event?.joinstatus === true
                                                        ) || data?._id === userID ?
                                                            (
                                                                <View
                                                                    style={styles.interestbtn}
                                                                >
                                                                    {apiCalled && currentIndex?.includes(data?._id) ?
                                                                        <ActivityIndicator style={{ alignSelf: "center", }} color={c?.secondary} size={"small"} />
                                                                        :
                                                                        <Pressable
                                                                            onPress={() => {
                                                                                setCurrectIndex((prev) => [...prev, data?._id])
                                                                                handleAddInterest(1)
                                                                            }}
                                                                        >
                                                                            <Text style={styles.interesttxt}>{t('Leave_Event')}</Text>
                                                                        </Pressable>
                                                                    }
                                                                </View>
                                                            )
                                                            :
                                                            (
                                                                <View
                                                                    style={styles.interestbtn}
                                                                >
                                                                    {apiCalled && currentIndex?.includes(data?._id) ?
                                                                        <ActivityIndicator style={{ alignSelf: "center" }} color={c?.secondary} size={"small"} />
                                                                        // ""
                                                                        :
                                                                        <Pressable
                                                                            onPress={() => {
                                                                                setCurrectIndex((prev) => [...prev, data?._id])
                                                                                handleAddInterest(0)
                                                                            }}
                                                                        >
                                                                            <Text style={styles.interesttxt}>{t('Activity_Join')}</Text>
                                                                        </Pressable>
                                                                    }
                                                                </View>

                                                            )
                                                        }
                                                    </>
                                                }



                                                {eventInterest?.some(event =>
                                                    event?._id === userID && event?.joinstatus === true
                                                ) || data?._id === userID ? (
                                                    <View style={{ flexDirection: "row", width: "70%", marginTop: "3%", justifyContent: "flex-end" }}>
                                                        <Pressable onPress={() => handleChatNavigation()} style={{ flexDirection: "row", alignItems: "center" }}>
                                                            <View style={{ marginRight: "5%" }}>{Images.comment}</View>
                                                            <Text style={{
                                                                fontFamily: Fonts.Bold,
                                                                color: c.white,
                                                                fontSize: RFValue(15),
                                                            }}>{t('Event_Chat')}</Text>
                                                        </Pressable>

                                                    </View>


                                                ) : (
                                                    <></>
                                                )}

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
                    setModalVisible(!modalVisible);
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




                                {data?.userId?._id == userID ?
                                    <>
                                        <Pressable onPress={handleNavigateFunction} style={{ flexDirection: "row", marginHorizontal: "6%", alignItems: "center", paddingVertical: "10%" }}>
                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Edit')}</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable onPress={handleAlert} style={{ flexDirection: "row", marginHorizontal: "6%", alignItems: "center", paddingVertical: "10%" }}>
                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Delete')}</Text>
                                            </View>
                                        </Pressable>
                                    </>
                                    :
                                    <Pressable onPress={handleReportEvent} style={{ flexDirection: "row", justifyContent: "center", alignSelf: "center", paddingVertical: "10%" }}>
                                        <View style={{}}>
                                            <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Report_Event')}</Text>
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

                    <View style={{ width: "100%", height: 100, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 15, left: 0, right: 0, }}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setMediaVisible(false)}>
                            {Images.back}
                        </TouchableOpacity>

                    </View>
                </Modal>
            }

        </>

    )
}

export default ActivityDetail

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
        textAlign: 'center',
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium,
        marginRight: '2%',
    },


});
