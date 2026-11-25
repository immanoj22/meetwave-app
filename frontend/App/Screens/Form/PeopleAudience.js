import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, ActivityIndicator, Platform, KeyboardAvoidingView, Alert, Share, Keyboard } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useFocusEffect, useRoute, useIsFocused } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_FetchProfileId, update_Isreportfilter, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { DeleteInstance, GetJoinedGroup, GetlikeData, GetMyCreateGroup, GetUserfollowing, ReportToAdmin, RequestedUserslists, GetGroupInfo } from '../../Actions/hooks';
import { GetItem } from '../../Actions/localstorage';
import { Imageroute, Imageurl } from '../../Actions/constant';
import { randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import { profileSelector } from '../../Slices/profile';
import Commonheader from '../../Navigation/commonheader';
import { showwarningmessage } from '../../Actions/config';
import AlertPopup from '../../Components/AlertPopup';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import branch from 'react-native-branch';
import ReportPopUp from '../Group/ReportPopUp';

const PeopleAudience = () => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [dispatch])
    )

    const route = useRoute();
    const { type, userData } = route?.params || {};
    const { isOnline, isreportfilter } = useSelector(helperSelector)
    const { profile } = useSelector(profileSelector);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debouncedSearchRef = useRef("");
    const isFocused = useIsFocused();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        debouncedSearchRef.current = debouncedSearch;
    }, [debouncedSearch]);
    const [reportText, setReportText] = useState("")
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [maxreached, setMaxreached] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [emptyMsg, setEmptyMsg] = useState("No People Found");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const [eventURL, setEventURL] = useState("")
    const [groupMembers, setGroupMembers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false)
    const [data, setData] = useState({})


    // useFocusEffect(
    //     React.useCallback(() => {

    //         let cancelled = false;

    //         requestAnimationFrame(() => {
    //             if (cancelled) return;

    //             setGroup([]);

    //             if (!isOnline) {
    //                 dispatch(update_NetworkVisible(true));
    //                 return;
    //             }

    //             switch (type) {
    //                 case "Requested Friends":
    //                     handleGetFollowers(1);
    //                     break;

    //                 case "My Friends":
    //                     handleGetFollowing(1);
    //                     break;

    //                 case "Likes":
    //                     handleGetLikeData(1);
    //                     break;

    //                 case "Groups":
    //                     setEmptyMsg("No Group Found");
    //                     handleGetMyGroup(1);
    //                     break;

    //                 case "ShowAll":
    //                     handleShowAllUser(1);
    //                     break;

    //                 case "Joined Groups":
    //                     setEmptyMsg("No Group Found");
    //                     handleJoinedGroup(1);
    //                     break;
    //             }
    //         });

    //         return () => {
    //             cancelled = true;
    //             setMaxreached(false);
    //             setLoading(false);
    //         };

    //     }, [type, isOnline, search])
    // );


    const [group, setGroup] = useState([]);
    const userId = GetItem("UserId")

    const mergeUniqueById = (existing = [], incoming = []) => {
        return [...new Map([...existing, ...incoming].map((item) => [item?._id, item])).values()];
    };

    const handleGetFollowers = async (count) => {
        try {

            let payload = {
                userId: userId,
                page: count,
                searchRequsers: debouncedSearchRef.current,
                limit: 20
            }

            if (!maxreached || count == 1) {
                setLoading(true)
                const result = await RequestedUserslists(payload);

                if (result?.status) {
                    setPage(count)
                    let data = result?.data[0];
                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 20) {
                            setMaxreached(true);
                        }
                        setGroupMembers(data?.members ? data?.members : []);
                        const followers = [
                            ...new Map(
                                result?.data?.map((folo) => [folo?.from?._id,
                                {
                                    _id: folo?.from?._id,
                                    title: folo?.from?.username,
                                    subtitle: folo?.from?.name,
                                    image: folo?.from?.profile,
                                    ImagePath: '/PersonalProfile/',
                                    randomIndex: folo?.from?.randomIndex,
                                    blockedSts: folo?.from?.blockStatus,
                                },
                                ])
                            ).values(),];

                        if (count == 1) {
                            setGroup(followers);
                        }
                        else {
                            setGroup((prev) => mergeUniqueById(prev, followers));
                        }
                    }
                    else if (debouncedSearchRef.current != "") {
                        setGroup([])
                    }
                    else {
                        setMaxreached(true);
                    }

                }
            }


        } catch (error) {

        }
        finally {
            setLoading(false);
            setFirstLoading(false)
        }
    }

    const handleGetFollowing = async (count) => {
        try {

            let payload = {
                userId: userId,
                page: count,
                searchFollowing: debouncedSearchRef.current,
                limit: 20,
            }

            if (!maxreached || count == 1) {

                setLoading(true)
                const result = await GetUserfollowing(payload);
                if (result?.status) {
                    setPage(count)

                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 20) {
                            setMaxreached(true);
                        }

                        const followers = [...new Map(result?.data?.map((folo) => [
                            folo?.to?._id, {
                                _id: folo?.to?._id,
                                title: folo?.to?.username,
                                subtitle: folo?.to?.name,
                                image: folo?.to?.profile,
                                ImagePath: '/PersonalProfile/',
                                randomIndex: folo?.to?.randomIndex,
                                blockedSts: folo?.to?.blockStatus,
                            }
                        ])).values(),];

                        if (count == 1) {
                            setGroup(followers);
                        }
                        else {
                            setGroup((prev) => mergeUniqueById(prev, followers));
                        }

                    }
                    else if (debouncedSearchRef.current != "") {
                        setGroup([])
                    }
                    else {
                        setMaxreached(true);
                    }
                }
            }
        } catch (error) {

        }
        finally {
            setFirstLoading(false)
            setLoading(false)
        }
    }

    const handleGetLikeData = async (count) => {
        try {

            let payload = {
                userId: userId,
                page: count,
                searchLikes: debouncedSearchRef.current,
                limit: 20
            }

            if (!maxreached || count == 1) {
                setLoading(true)
                const result = await GetlikeData(payload);

                if (result?.status) {
                    setPage(count)
                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 20) {
                            setMaxreached(true);
                        }

                        const followers = [...new Map(result?.data?.map((folo) =>
                            [folo?.userId?._id, {
                                _id: folo?.userId?._id,
                                title: folo?.userId?.username,
                                subtitle: folo?.userId?.name,
                                image: folo?.userId?.profile,
                                ImagePath: '/PersonalProfile/',
                                randomIndex: folo?.userId?.randomIndex,
                                blockedSts: folo?.userId?.blockStatus,
                            }]
                        )).values(),];

                        if (count == 1) {
                            setGroup(followers);
                        }
                        else {
                            setGroup((prev) => mergeUniqueById(prev, followers));
                        }

                    }
                    else if (debouncedSearchRef.current != "") {
                        setGroup([])
                    }
                    else {
                        setMaxreached(true);
                    }
                }
            }
        } catch (error) {

        }
        finally {
            setLoading(false)
            setFirstLoading(false)
        }
    }

    const handleGetMyGroup = async (count) => {
        try {

            let payload = {
                userId: userId,
                page: count,
                searchMygroup: debouncedSearchRef.current,
                limit: 20
            }
            if (!maxreached || count == 1) {
                setLoading(true)
                const result = await GetMyCreateGroup(payload);

                if (result?.status) {
                    setPage(count)
                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 20) {
                            setMaxreached(true);
                        }

                        const followers = [...new Map(result?.data?.map((folo) =>
                            [folo?._id, {
                                _id: folo?._id,
                                title: folo?.chatName,
                                subtitle: folo?.groupDiscription,
                                image: folo?.Image,
                                ImagePath: '/GroupImage/',
                                randomIndex: folo?.groupIndex ? folo?.groupIndex : 3,
                                data: folo,
                                blockedSts: folo?.isblocked,
                            }]
                        )).values()];
                        if (count == 1) {
                            setGroup(followers);
                        }
                        else {
                            setGroup((prev) => mergeUniqueById(prev, followers));
                        }

                    }
                    else if (debouncedSearchRef.current != "") {
                        setGroup([])
                    }
                    else {
                        setMaxreached(true);
                    }

                }
            }
        } catch (error) {

        }
        finally {
            setLoading(false)
            setFirstLoading(false)
        }
    }

    const handleShowAllUser = async () => {
        try {

            const followers = [...new Map(userData?.map((folo) => [
                folo?.toDetails?._id, {
                    _id: folo?.toDetails?._id,
                    title: folo?.toDetails?.username,
                    subtitle: folo?.toDetails?.name,
                    image: folo?.toDetails?.profile,
                    ImagePath: '/PersonalProfile/',
                    randomIndex: folo?.toDetails?.randomIndex,
                    blockedSts: folo?.toDetails?.blockStatus,
                }])).values()];

            const filterData = followers?.filter(name => name?.title?.toLowerCase()?.includes(debouncedSearchRef.current?.toLowerCase()))
            setGroup(filterData);
            setFirstLoading(false)
        } catch (error) {

        }
    }

    const handleJoinedGroup = async (count) => {
        try {

            let payload = {
                userId: userId,
                page: count,
                searchJoingroup: debouncedSearchRef.current,
                limit: 20
            }

            if (!maxreached || count == 1) {

                setLoading(true)

                const result = await GetJoinedGroup(payload);

                if (result?.status) {
                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 20) {
                            setMaxreached(true);
                        }

                        const joinedGroup = [...new Map(result?.data?.map((grp) => [
                            grp?._id, {
                                _id: grp?._id,
                                title: grp?.chatName,
                                subtitle: grp?.groupDiscription,
                                image: grp?.Image,
                                ImagePath: '/GroupImage/',
                                randomIndex: grp?.groupIndex ? grp?.groupIndex : 3,
                                data: grp,
                                blockedSts: grp?.isblocked,
                            }])).values(),]
                            ;

                        if (count == 1) {
                            setGroup(joinedGroup);
                        }
                        else {
                            setGroup((prev) => mergeUniqueById(prev, joinedGroup));
                        }
                    }
                    else if (debouncedSearchRef.current != "") {
                        setGroup([])
                    }
                    else {
                        setMaxreached(true);
                    }

                }
            }

        } catch (error) {

        }
        finally {
            setFirstLoading(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return;
        }

        setPage(1);
        setMaxreached(false);

        let cancelled = false;
        const frameId = requestAnimationFrame(() => {
            if (cancelled) {
                return;
            }

            switch (type) {
                case "Requested Friends":
                    handleGetFollowers(1);
                    break;
                case "My Friends":
                    handleGetFollowing(1);
                    break;
                case "Likes":
                    handleGetLikeData(1);
                    break;
                case "Groups":
                    setEmptyMsg("No Group Found");
                    handleGetMyGroup(1);
                    break;
                case "ShowAll":
                    handleShowAllUser();
                    break;
                case "Joined Groups":
                    setEmptyMsg("No Group Found");
                    handleJoinedGroup(1);
                    break;
                default:
                    break;
            }
        });

        return () => {
            cancelled = true;
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, type, isOnline, isFocused]);

    const handleGroupProfile = (e) => {

        const payload = {
            ...e?.data,
            isGroupchat: true,
            ImagePath: '/GroupImage/',
        }

        if (type == "Groups" ? e?.data?.members?.some((data) => data._id == userId) : e?.data?.members?.includes(userId)) {
            navigation.navigate("GroupDetails", { detail: payload, pageFrom: "Chat" })
        }
        else {
            showwarningmessage(t('You_have_left_this_group'))
        }


    }

    const handleViewPerson = (e) => {
        if (e?._id == userId) return;
        dispatch(update_FetchProfileId(e?._id))
        navigation.navigate("HomeDetail", { detail: e, type: type })
    }


    const handleEndReached = async (nativeEvent) => {
        if (!isOnline) {
            setGroup([])
            dispatch(update_NetworkVisible(true));
            return
        }

        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached && !loading) {

            var count = page + 1

            if (type == "Requested Friends") {
                handleGetFollowers(count);
            }
            else if (type == "My Friends") {
                handleGetFollowing(count)
            }
            else if (type == "Likes") {
                handleGetLikeData(count)
            }
            else if (type == "Groups") {
                handleGetMyGroup(count)
            }
            else if (type == "ShowAll") {
                handleShowAllUser(count);
            }
            else if (type == "Joined Groups") {
                handleJoinedGroup(count)
            }

        }

    }

    const handleNaigatePremium = async () => {
        setIsModalVisible(false)
        navigation.navigate("Premium")
    }

    const handleAlert = (e) => {
        Alert.alert(t('Delete_Grp'), t('you_delete_created_group'), [
            {
                text: t('Cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: t('YES'),
                onPress: () => handleDeleteGroup(e),
            },
        ]);
    }

    const editGroup = async (e) => {

        const data = e?.data;

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        let merged = data || {};
        try {
            if (userId && e?._id) {
                const result = await GetGroupInfo({ userId, groupId: e._id });
                if (result?.status && result?.data?.[0]) {
                    merged = { ...(data || {}), ...result.data[0] };
                }
            }
        } catch (err) {
            console.log('PeopleAudience editGroup GetGroupInfo', err);
        }


        let passload = {
            groupId: e?._id,
            groupName: merged?.chatName,
            groupDesc: merged?.groupDiscription,
            groupMembers: merged?.members,
            groupProfile: merged?.Image ? `${Imageurl}${merged?.Image}` : "",
            groupIndex: merged?.groupIndex,
            groupHobbies: merged?.grouphobbies,
            groupStatus: merged?.isPrivate,
            groupHideStatus: merged?.ishidegroup,
            groupLocation: merged?.location,
            groupAddress: merged?.groupAddress,
            groupImages: merged?.groupImages,
        }

        console.log("SendEdit ===> ", passload)
        navigation.navigate("CreateGroup", { grpDetail: passload, editSts: true })

    }

    const handleDeleteGroup = async (e) => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                userId: userId,
                instanceId: [e]
            }
            console.log("DeleteGroup==> ", payload)

            const result = await DeleteInstance(payload);
            if (result?.status) {
                ShowToast(result?.message)
                //navigation.navigate("Chat")
                navigation.navigate("Homescreen", {
                    screen: "Chat",
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
        }

    }


    const handleReportGroup = async (e) => {
        setData(e);
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
                report_from: userId,
                report_to: data?._id,
                message: reportText,
                type: "group",
                to: userId,
            }

            Keyboard.dismiss()
            console.log("ReportToAdminpayload==> ", payload)

            const result = await ReportToAdmin(payload);

            if (result.status) {
                ShowToast(t('GroupReportedSuccessfully'))
            }
            else {
            }

            setReportText("")
        } catch (error) {
            console.log("ReportToAdminError==> ", error)
        }
        finally {
            setApiCalled(false)
        }
    }



    const shareLink = async (e) => {

        const propsDTL = e?.data;
        const imgURL = `${Imageroute?.groupBioImagePath}${propsDTL?.groupImages}`;

        console.log("ImageURLGroupShare==>", imgURL, propsDTL);

        try {

            const createBranchUniversalObject = await branch.createBranchUniversalObject(`Group/${propsDTL?._id}`, {

                title: propsDTL?.chatName,
                contentDescription: propsDTL?.groupDiscription,
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
            console.log("CreateShareOption==>", url);
            setEventURL(url)
            openShare(url)
        } catch (error) {
            console.log('Error sharing product:', error);
        }
    }


    const openShare = async (url) => {
        console.log("ShareOptionUrl==>", url);
        Share.share({
            message: url,
        })
            //after successful share return result
            .then((result) => console.log(result))
            //If any thing goes wrong it comes here
            .catch((errorMsg) => console.log(errorMsg));
    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>

                    <Commonheader
                        title={(type == "Groups" ? "My Groups" : type)}
                        onback={handleBack}
                    />

                    <View style={{ width: "90%", marginTop: 10, alignSelf: "center", height: "7%", alignItems: "center", justifyContent: "center", }}>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: "center" }}>
                            <Pressable style={styles.searchcontainer}>
                                {Images.search1}
                                <TextInput
                                    placeholderTextColor={'#F7E5D0'}
                                    placeholder="Search"
                                    value={search}
                                    style={styles.inputtxtstyle}
                                    onChangeText={setSearch}
                                />
                            </Pressable>

                            {search &&
                                <Pressable style={styles.closebox} onPress={() => setSearch("")}>
                                    {Images.close1}
                                </Pressable>
                            }
                        </View>
                    </View>


                    {
                        // firstLoading ?
                        //     <View style={{ height: "92.5%", paddingBottom: "2.5%", justifyContent: "center" }} >
                        //         <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                        //     </View>
                        //     :
                        <View style={{ width: "100%", height: "100%" }}>

                            {!group ?

                                <View style={{ width: "100%", height: "60%", alignItems: "center", justifyContent: "center" }} >
                                    <Text style={{
                                        fontFamily: Fonts.Bold,
                                        color: c.white,
                                        fontSize: RFValue(14),
                                        textAlign: "center",
                                    }} >
                                        {emptyMsg}
                                    </Text>
                                </View>

                                :

                                <View style={{ width: "100%", height: "81%", }}>
                                    <ScrollView
                                        onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                                        scrollEventThrottle={16}
                                        showsVerticalScrollIndicator={false}>

                                        {
                                            type == "Groups" || type == "Joined Groups" ?

                                                <View style={{ marginBottom: "15%", marginTop: "2%" }}>
                                                    <View style={{ width: "90%", alignSelf: "center", }}>
                                                        <View>

                                                            {group?.map((e, index) => (

                                                                <Pressable
                                                                    onPress={() => {
                                                                        const isGroup = type == "Groups" || type == "Joined Groups";
                                                                        const isBlocked = e?.blockedSts && e?.blockedSts != "unblocked";

                                                                        console.log("Clear__________", (e?.blockedSts != undefined || e?.blockedSts != "unblocked"), isGroup, isBlocked, e?.blockedSts);

                                                                        if (isGroup) {
                                                                            if (isBlocked) {
                                                                                showwarningmessage(t('AdminBlocked_thisGroup'));
                                                                            } else {
                                                                                handleGroupProfile(e);
                                                                            }
                                                                        } else {
                                                                            if (isBlocked) {
                                                                                showwarningmessage(t('UserBlocked_byAdmin'));
                                                                            } else {
                                                                                handleViewPerson(e);
                                                                            }
                                                                        }
                                                                    }}

                                                                    key={index}
                                                                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "3%" }}>

                                                                    <View style={styles.card}>


                                                                        <View style={{ flexDirection: "row", alignItems: "center", width: "100%", }}>
                                                                            <>
                                                                                {e?.image ? (
                                                                                    <View style={{
                                                                                        width: devicewidth * 0.14,
                                                                                        height: devicewidth * 0.14,
                                                                                    }} >

                                                                                        <Image
                                                                                            style={{
                                                                                                width: "100%",
                                                                                                height: "100%",
                                                                                                borderRadius: borderradius * 5,
                                                                                            }}
                                                                                            source={{
                                                                                                uri: `${Imageurl}${e?.image}`,
                                                                                            }}
                                                                                            resizeMode="cover"
                                                                                        />

                                                                                    </View>
                                                                                ) : (
                                                                                    <View
                                                                                        style={{
                                                                                            width: devicewidth * 0.14,
                                                                                            height: devicewidth * 0.14,
                                                                                        }} >
                                                                                        <Image
                                                                                            style={{
                                                                                                width: "100%",
                                                                                                height: "100%",
                                                                                                borderRadius: borderradius * 5,
                                                                                            }}
                                                                                            source={randomimages[e?.randomIndex]}
                                                                                            resizeMode="cover"
                                                                                        />
                                                                                    </View>
                                                                                )}
                                                                            </>
                                                                            <View style={{ flex: 8, marginLeft: "4%", }}>

                                                                                <Text style={styles.gptitle}>
                                                                                    {e?.title?.length > 40 ? e.title.slice(0, 37) + "..." : e.title}
                                                                                </Text>

                                                                                <Text style={styles.gpsubtitle}>

                                                                                    {
                                                                                        ((type != "Groups" && type == "Joined Groups") || e?.data?.members?.some((data) => data._id == userId))
                                                                                            ?
                                                                                            (e?.subtitle?.length > 40 ? e.subtitle.slice(0, 37) + "..." : e.subtitle)
                                                                                            :
                                                                                            t('You_left_this_group')}
                                                                                </Text>

                                                                            </View>

                                                                            <View style={{ flex: 2, flexDirection: "row", justifyContent: "flex-end", }}>
                                                                                <Pressable
                                                                                    onPress={() => shareLink(e)}
                                                                                    style={{ marginRight: "0%" }}>
                                                                                    {Images.share}
                                                                                </Pressable>
                                                                                <Menu style={{ marginLeft: 10 }} >
                                                                                    <MenuTrigger>
                                                                                        {Images.dot}
                                                                                    </MenuTrigger>
                                                                                    <MenuOptions
                                                                                        optionsContainerStyle={{
                                                                                            backgroundColor: 'white',
                                                                                            padding: 3,
                                                                                            borderRadius: 5,
                                                                                            width: 150,
                                                                                            paddingHorizontal: 20,
                                                                                            paddingVertical: 5,
                                                                                            shadowColor: '#000',
                                                                                            shadowOffset: { width: 0, height: 2 },
                                                                                            shadowOpacity: 0.2,
                                                                                            shadowRadius: 5,
                                                                                            elevation: 5,
                                                                                            marginHorizontal: 12
                                                                                        }}>
                                                                                        {e?.data?.groupCreater == userId ?
                                                                                            <>
                                                                                                <MenuOption onSelect={() => editGroup(e)} >
                                                                                                    <View style={{ alignItems: 'flex-start', justifyContent: 'center', padding: 5 }}>
                                                                                                        <Text style={{ color: c.secondary, fontFamily: Fonts.SemiBold, fontSize: RFValue(15) }}>{t('Edit')}</Text>
                                                                                                    </View>
                                                                                                </MenuOption>

                                                                                                <MenuOption onSelect={() => handleAlert(e?._id)} >
                                                                                                    <View style={{ alignItems: 'flex-start', justifyContent: 'center', padding: 5 }}>
                                                                                                        <Text style={{ color: c.secondary, fontFamily: Fonts.SemiBold, fontSize: RFValue(15), }}>{t('Delete')}</Text>
                                                                                                    </View>
                                                                                                </MenuOption>
                                                                                            </>

                                                                                            :

                                                                                            <MenuOption onSelect={() => handleReportGroup(e)} >
                                                                                                <View style={{ alignItems: 'flex-start', justifyContent: 'center', padding: 5 }}>
                                                                                                    <Text style={{ color: c.secondary, fontFamily: Fonts.SemiBold, fontSize: RFValue(15), }}>{t('Report_Grp')}</Text>
                                                                                                </View>
                                                                                            </MenuOption>
                                                                                        }


                                                                                    </MenuOptions>
                                                                                </Menu>
                                                                            </View>

                                                                        </View>



                                                                        <View style={{ width: "100%", alignSelf: "center", justifyContent: "space-between" }}>

                                                                            <View style={{ width: "65%", flexDirection: "row", marginTop: "4%", justifyContent: "space-between", }}>

                                                                                {e?.data?.grouphobbies?.length > 0 && (

                                                                                    <View style={{ flex: 0.8, flexDirection: "row", alignItems: "center", width: "50%", gap: 5 }}>
                                                                                        {/* Display the first 3 hobbies */}
                                                                                        {e?.data?.grouphobbies?.slice(0, 2).map((hobby, index) => (
                                                                                            <View key={hobby._id} style={styles.hobbyView}>
                                                                                                <Text style={styles.groupNametxt}>{hobby?.hobbyname?.length > 8 ? hobby?.hobbyname?.slice(0, 5) + "..." : hobby?.hobbyname}</Text>
                                                                                            </View>
                                                                                        ))}

                                                                                        {e?.data?.grouphobbies.length > 3 && (
                                                                                            <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                                                                                <Text style={styles.groupNametxt}>+{e?.data?.grouphobbies?.length - 3}</Text>
                                                                                            </View>
                                                                                        )}
                                                                                    </View>
                                                                                )}

                                                                            </View>


                                                                            <View style={{ width: "40%", position: "absolute", bottom: "0.5%", right: "1%", flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", }}>
                                                                                <View style={{ flexDirection: "row", alignItems: "center", width: "20%", gap: 4, justifyContent: "flex-start", marginRight: "15%" }}>
                                                                                    {Images.groupMembUn}
                                                                                    <Text style={styles.friendCounttxt}>{e?.data?.members?.length}</Text>
                                                                                </View>



                                                                            </View>

                                                                        </View>


                                                                    </View>

                                                                </Pressable>
                                                            ))}
                                                        </View>



                                                    </View>

                                                    {loading &&
                                                        <View style={{ height: "88%", paddingBottom: "2.5%", paddingHorizontal: "3%" }} >
                                                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"large"} />
                                                        </View>
                                                    }
                                                </View>


                                                :

                                                <View style={{ marginBottom: "15%", marginTop: "2%" }}>
                                                    <View style={{ width: "90%", alignSelf: "center", }}>
                                                        <View>

                                                            {console.log("typeGroup==>", group)}
                                                            {console.log("typeGroup2==>", type)}
                                                            {group?.map((e, index) => (e?.title &&
                                                                <Pressable
                                                                    onPress={() => {
                                                                        const isGroup = type == "Groups" || type == "Joined Groups";
                                                                        const isBlocked = e?.blockedSts && e?.blockedSts != "unblocked";

                                                                        console.log("Clear__________", (e?.blockedSts != undefined || e?.blockedSts != "unblocked"), isGroup, isBlocked, e?.blockedSts);

                                                                        if (isGroup) {
                                                                            if (isBlocked) {
                                                                                showwarningmessage(t('AdminBlocked_thisGroup'));
                                                                            } else {
                                                                                handleGroupProfile(e);
                                                                            }
                                                                        } else {
                                                                            if (isBlocked) {
                                                                                showwarningmessage(t('UserBlocked_byAdmin'));
                                                                            } else {
                                                                                handleViewPerson(e);
                                                                            }
                                                                        }
                                                                    }}

                                                                    key={index}
                                                                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "8%" }}>

                                                                    <View style={{ flexDirection: "row", alignItems: "center", width: "100%", }}>
                                                                        <>
                                                                            {e?.image ? (
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
                                                                                            uri: `${Imageurl}${e?.image}`,
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
                                                                                        source={randomimages[e?.randomIndex]}
                                                                                        resizeMode="cover"
                                                                                    />
                                                                                </View>
                                                                            )}
                                                                        </>
                                                                        <View style={{ marginLeft: "4%", }}>
                                                                            <Text style={styles.gptitle}>
                                                                                {e?.title?.length > 40 ? e.title.slice(0, 37) + "..." : e.title}
                                                                            </Text>

                                                                            <Text style={styles.gpsubtitle}>
                                                                                {((type != "Groups" && type != "Joined Groups") || e?.data?.members?.includes(userId))
                                                                                    ? (e?.subtitle?.length > 40 ? e.subtitle.slice(0, 37) + "..." : e.subtitle)
                                                                                    : t('You_left_this_group')}
                                                                            </Text>

                                                                        </View>

                                                                    </View>

                                                                </Pressable>
                                                            ))}
                                                        </View>



                                                    </View>

                                                    {loading &&
                                                        <View style={{ height: "88%", paddingBottom: "2.5%", paddingHorizontal: "3%" }} >
                                                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"large"} />
                                                        </View>
                                                    }
                                                </View>

                                        }
                                    </ScrollView>
                                </View>
                            }
                        </View>
                    }


                    {type == "Groups" || type == "Joined Groups" ?
                        <>
                            <View style={{
                                position: "absolute",
                                bottom: Platform.OS == "android" ? deviceheight * 0.15 : deviceheight * 0.02,
                                right: "2%"
                            }}>

                                <Pressable onPress={() => profile?.plan?.length && profile?.plan[0]?.isActive == "started" ? navigation.navigate("CreateGroup") : setIsModalVisible(true)} style={{}} >

                                    <View style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 3, backgroundColor: c.white, justifyContent: "center", alignItems: "center", elevation: 1 }} >
                                        {Images.plusGroup}
                                    </View>

                                </Pressable>
                            </View>
                        </>
                        : ""}


                </View >

                <AlertPopup
                    visible={isModalVisible}
                    title="Note"
                    onSubmit={() => handleNaigatePremium()}
                    onClose={() => setIsModalVisible(false)} >
                    <Text>{t('You_want_to_ubscribe')}</Text>
                </AlertPopup>

                <ReportPopUp
                    visible={isreportfilter}
                    reportText={reportText}  // Pass the reportText from the parent state
                    setReportText={setReportText}
                    reportFn={() => handleReport()} // For report
                />

            </LinearGradient >

        </KeyboardAvoidingView>
    )
}

export default PeopleAudience

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        borderColor: "#fff",
        borderWidth: 0.3,
        padding: "3%",
        flexDirection: "column",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
        alignSelf: 'center'
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
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%",
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
        height: "12%",
        //flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center'
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

    editbox: {
        width: devicewidth * 0.09,
        height: devicewidth * 0.09,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
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
        backgroundColor: c.searchbg,
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

    },
    friendCounttxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },

});
