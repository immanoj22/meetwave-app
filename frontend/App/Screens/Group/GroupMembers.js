import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import ImageViewer from 'react-native-image-zoom-viewer';
import { ChatImageurl, GroupimgUrl, Imageroute, Imageurl } from '../../Actions/constant';
import { GetItem, SetItem } from '../../Actions/localstorage';
import { AddGroupAdmin, ClearchatFn, DeleteInstance, ExitGroup, GetGroupInfo, PrivateGroupAcceptReject, RemoveFromGroup, RemoveGroupAdmin, ReportToAdmin, UpdateGroupMembers, createUpdateGroupMembers, getAllGroupMembers, getAllMediaApi } from '../../Actions/hooks';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

import GroupPopup from './GroupPopup';
import { GetAllchat, GetSingleChats, helperSelector, update_FetchProfileId, update_Isreportfilter, update_NetworkVisible } from '../../Slices/helper';
import { useDispatch, useSelector } from 'react-redux';
import { randomimages } from '../../Utilities/profileImages';

import { useTranslation } from 'react-i18next';
import Pencilicon from "../../Assets/icons/pencil.svg"
import { profileSelector } from '../../Slices/profile';
import ReportPopUp from './ReportPopUp';
import { hasActiveSubscription } from '../../Actions/config';


const GroupMembers = () => {

    const { t } = useTranslation();
    const navigation = useNavigation();
    const [visible, setVisible] = useState(false);
    const [staticVisible, setStaticVisible] = useState(false);

    const user_Id = GetItem('UserId');

    const route = useRoute();

    const { detail } = route?.params || {};

    const [groupMembers, setGroupMembers] = useState([]);

    const [ImagePath, setImagePath] = useState("");

    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState("");

    const [reportText, setReportText] = useState("")

    const { isreportfilter, isOnline } = useSelector(helperSelector)
    const { profile } = useSelector(profileSelector)
    const [apiCalled, setApiCalled] = useState(false);

    const [reqUser, setReqUser] = useState([]);

    useEffect(() => {

        getGroupMembers();

        getAllMedia()

        setReqUser(detail?.requestedUsers)

    }, [detail])

    SetItem("AdminID", detail?.groupCreater?._id)

    const [admin, setAdmin] = useState([]);

    const [imagePrevUrl, setImagePrevUrl] = useState([]);

    const [staticImagePrevUrl, setStaticImagePrevUrl] = useState([]);

    const dispatch = useDispatch()

    const getGroupMembers = async () => {

        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            if (apiCalled) return;

            setApiCalled(true)
            let payload = {
                userId: user_Id,
                instanceId: detail?._id
            }
            setLoading(true);
            const result = await getAllGroupMembers(payload);

            setAdmin(result?.data?.groupAdmin)

            const currentUser = result?.data?.members.filter(member => member._id == user_Id);
            const otherMembers = result?.data?.members.filter(member => member._id != user_Id);

            setGroupMembers([...currentUser, ...otherMembers]);

            setImagePath(result?.ImagePath);

            setLoading(false);

        } catch (error) {
            setLoading(false);
        }
        finally {
            setApiCalled(false)
        }
    }

    const getAllMedia = async () => {

        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            setApiCalled(true)

            let payload = {
                userId: user_Id,
                instanceId: detail?._id
            }
            const result = await getAllMediaApi(payload);

            console.log("Result------", result);

            const path = ChatImageurl;

            handleImagePreview(result?.data, path)


        } catch (error) {

        }
        finally {
            setApiCalled(false)
        }
    }

    const handleImagePreview = async (fileName, path) => {


        const imageObjects = fileName.map(fileNames => ({
            url: `${Imageroute?.groupBioImagePath}${fileNames}`
        }));

        // Update the state
        setImagePrevUrl(prev => [...prev, ...imageObjects]);

    }

    const handleStaticImagePreview = async (id) => {
        let imageObjects = [{
            url: '',
            props: {
                source: randomimages[id]
            }
        }]

        // Update the state
        setStaticImagePrevUrl(imageObjects);
    }

    const handleAddAdmin = async (data) => {

        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            if (apiCalled) return;

            setApiCalled(true)

            let member = [data?._id]

            let payload = {
                userId: user_Id,
                instanceId: detail?._id,
                members: member
            }

            const result = await AddGroupAdmin(payload);

            if (result) {

                setAdmin((prev) => [...prev, data?._id]);
            }


        } catch (error) {
        }
        finally {
            setApiCalled(false)
        }

    }

    const handleRemoveAdmin = async (data) => {

        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            setApiCalled(true)

            let member = [data?._id]

            let payload = {
                userId: user_Id,
                instanceId: detail?._id,
                members: member
            }

            const result = await RemoveGroupAdmin(payload);

            if (result) {
                setAdmin((prev) => prev.filter((item) => item !== data?._id));
            }


        } catch (error) {

        }
        finally {
            setApiCalled(false)
        }

    }

    const handleRemoveFromGroup = async (data) => {

        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            if (apiCalled) return;

            setApiCalled(true)

            let memberIds = groupMembers
                .filter((user) => user._id != data._id)
                .map((user) => user._id);

            let payload = {
                userId: user_Id,
                instanceId: detail?._id,
                members: memberIds,
                oldMembRemove: data._id,
                type: "Remove"
            }


            const result = await RemoveFromGroup(payload);

            if (result) {

                setGroupMembers(prevGroupMembers =>
                    prevGroupMembers.filter(user => user._id !== data._id)
                );

                setAdmin((prev) => prev.filter((item) => item !== data?._id));
            }

        } catch (error) {

        }
        finally {
            setApiCalled(false)
        }

    }

    const sendMessageTo = async (data) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        if (apiCalled) return;

        setApiCalled(true)

        try {

            let memb = [user_Id, data?._id]

            let payload = {
                userId: user_Id,
                isGroupchat: false,
                members: JSON.stringify(memb),
            }

            const result = await UpdateGroupMembers(payload);

            if (result?.status) {
                navigation.navigate("Chat");
            }
            else {
                let passload = {

                    _id: result?.data?._id,
                    profile: data?.profile,
                    name: data?.name,
                    members: [{
                        id: data?._id,
                        name: data?.name,
                        username: data?.username,
                        MychatDiscription: data?.MychatDiscription
                    }],
                    randomIndex: data?.randomIndex,
                    ImagePath: "/PersonalProfile/",
                    isGroupchat: false,

                };

                navigation.navigate("ChatGroup", { detil: passload })

            }

        } catch (error) {
        }
        finally {
            setApiCalled(false)
        }
    }



    const inviteNewmembers = async (d) => {

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

        const groupDetail = d || detail;
        let merged = groupDetail;
        try {
            if (user_Id && groupDetail?._id) {
                const result = await GetGroupInfo({
                    userId: user_Id,
                    groupId: groupDetail._id,
                });
                if (result?.status && result?.data?.[0]) {
                    merged = { ...groupDetail, ...result.data[0] };
                }
            }
        } catch (err) {
            console.log('GroupMembers inviteNewmembers GetGroupInfo', err);
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



    const onExitGroup = async () => {
        try {
            // Get the IDs of other members in the group excluding the current user

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            setApiCalled(true)

            let memberIds = groupMembers
                .filter((user) => user._id !== user_Id)
                .map((user) => user._id);

            let payload = {
                instanceId: detail?._id,
                userId: user_Id
            }

            // Remove the user from the group
            const result = await ExitGroup(payload);

            if (result?.status) {
                // Update the group members state
                // Check if the user is an admin
                if (admin?.length !== 0 && admin.includes(user_Id)) {
                    // Check if there are other admins
                    const otherAdmins = admin.filter((id) => id !== user_Id);

                    // If there are no other admins, select a random member to promote
                    if (otherAdmins.length === 0) {
                        // Select a random member from group members
                        const randomMember = memberIds[Math.floor(Math.random() * memberIds.length)];

                        // Only add a new admin if the random member is not the current user
                        if (randomMember && randomMember !== user_Id) {
                            let payload = {
                                _id: randomMember,
                            };
                            handleAddAdmin(payload);
                        }
                    }
                }

                setGroupMembers((prevGroupMembers) =>
                    prevGroupMembers.filter((user) => user._id !== user_Id)
                );
                setAdmin((prevAdmin) =>
                    prevAdmin.filter((admins) => admins !== user_Id)
                )


                dispatch(GetAllchat(1));

                navigation.navigate("Chat")

            }
            else {
                ShowToast(t('ErrorExiting_group'))
            }

        } catch (error) {
        }
        finally {
            setApiCalled(false)
        }
    };

    const onDeleteGroup = async () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }
        if (apiCalled) return;

        setApiCalled(true)

        try {

            let payload = {
                userId: user_Id,
                instanceId: [detail?._id],
            }

            const result = await DeleteInstance(payload);

            if (result?.status) {
                navigation.navigate("Chat")
            }

        } catch (error) {
        }

    }


    const onReportGroup = async () => {
        dispatch(update_Isreportfilter(true))
    }

    const onBlockGroup = async () => {
        alert("Blocked !!");
    }

    const onClearChat = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            setApiCalled(true)

            let payload = {
                instanceId: detail?._id,
                userId: user_Id,
            }

            const result = await ClearchatFn(payload);

            if (result?.status) {
                ShowToast(t('Chat_data_cleared'))
                navigation.navigate("Chat");
            }
            else {
                ShowToast(t('Chat_not_cleared'))
            }

        } catch (error) {
        }
        finally {
            setApiCalled(false)
        }
    }

    const handleProfileView = (e, condition) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        const userBlocked = profile?.userblocked?.filter((user) => user == e?._id)

        if (userBlocked?.length > 0) {
            ShowToast(t('ThisUserBlockedYou'))
            return
        }

        let payload;
        if (condition) {

            payload = {
                _id: e?.members[0]?._id,
            }
            dispatch(update_FetchProfileId(e?.members[0]?._id))
        }
        else {
            payload = e;
            dispatch(update_FetchProfileId(e?._id))

        }

        navigation.navigate("HomeDetail", { detail: payload })

    }

    const handleAlert = (data, callback) => {
        Alert.alert(t('DeleteGroup'), data, [
            {
                text: t('Cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: t('YES'),
                onPress: () => callback(),
            },
        ]);
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
                report_from: user_Id,
                report_to: detail?.isGroupchat ? detail?._id : detail?.members[0]?._id,
                message: reportText,
                type: detail?.isGroupchat ? "group" : "singlechat",
                to: detail?.isGroupchat ? user_Id : detail?.members[0]?._id,
            }

            const result = await ReportToAdmin(payload);

            if (result?.status) {

                if (detail?.isGroupchat) {
                    dispatch(GetAllchat(1));
                    navigation.navigate("Chat");
                }
                else {
                    dispatch(GetSingleChats(1));
                    navigation.navigate("SingleChat");
                }

                setReportText("")
            }

        } catch (error) {
            console.log("Error on handleReport: ", error);
        }
        finally {
            setApiCalled(false)
        }
    }

    const handleAcceptOrReject = async (data, type) => {

        console.log("Accept or Reject Payload: ", { data, type });

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;
            setApiCalled(true)

            let payload = {
                userId: data?._id,
                instanceId: detail?._id,
                type: type
            }


            const result = await PrivateGroupAcceptReject(payload);

            if (result?.status) {

                if (type == "accept") {
                    setGroupMembers([...groupMembers, data])
                }

                setReqUser(prevGroupMembers =>
                    prevGroupMembers.filter(user => user._id != data._id)
                );

                navigation.navigate("Homescreen", {
                    screen: "Chat",
                });
            }

        } catch (error) {
            console.log("Error on handleAcceptOrReject: ", error)
        }
        finally {
            setApiCalled(false)
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>

                            <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>

                            <Pressable style={{ padding: "1%", alignItems: "center" }} onPress={() => {
                                setModalVisible(!modalVisible);
                            }} >
                                {Images.dot1}
                            </Pressable>
                        </View>
                    </View>

                    <View style={{ width: "100%", height: "90%" }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: "15%" }}>
                                <View style={{ width: "92%", alignSelf: "center", }}>
                                    <View style={{ alignItems: "center", justifyContent: "center", }}>

                                        {detail?.isGroupchat ?

                                            <>
                                                {detail?.Image ?
                                                    <Pressable
                                                        onPress={() => {
                                                            setImagePrevUrl([])
                                                            handleImagePreview([detail?.Image], GroupimgUrl)
                                                            setVisible(true)
                                                        }}
                                                        style={{ width: "22%", }}>
                                                        <View style={{ width: devicewidth * 0.190, height: devicewidth * 0.190, }}>
                                                            <Image
                                                                style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }} source={{ uri: `${Imageurl}${detail?.Image}` }}
                                                                resizeMode="cover"
                                                            />
                                                        </View>
                                                    </Pressable>

                                                    :
                                                    <View style={{ width: devicewidth * 0.190, height: devicewidth * 0.190 }}>
                                                        <Pressable onPress={() => {
                                                            handleStaticImagePreview(detail?.groupIndex)
                                                            setStaticVisible(true)
                                                        }}>
                                                            <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                source={randomimages[detail?.groupIndex]}
                                                                resizeMode="cover" />
                                                        </Pressable>
                                                    </View>

                                                }
                                            </>
                                            :


                                            <>
                                                {detail?.profile ?
                                                    <Pressable
                                                        onPress={() => {
                                                            handleProfileView(detail, true)
                                                        }}
                                                        style={{ width: "22%" }}>
                                                        <Image
                                                            source={{ uri: `${Imageurl}${detail?.profile}` }}
                                                            style={{ width: devicewidth * 0.190, height: devicewidth * 0.190, borderRadius: borderradius * 5 }}
                                                        />
                                                    </Pressable>

                                                    :

                                                    <View style={{ width: devicewidth * 0.190, height: devicewidth * 0.190 }}>
                                                        <Pressable onPress={() => {
                                                            handleStaticImagePreview(detail?.randomIndex)
                                                            setStaticVisible(true)
                                                        }}>
                                                            <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                source={randomimages[detail?.randomIndex]}
                                                                resizeMode="cover" />
                                                        </Pressable>
                                                    </View>

                                                }
                                            </>
                                        }


                                        <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center", gap: 6 }}>
                                            <Text style={styles.title}>{detail?.chatName ? detail?.chatName : detail?.username}</Text>
                                            {detail?.isGroupchat && admin?.some((data) => data == user_Id) &&
                                                <Pressable
                                                    style={{
                                                        width: devicewidth * 0.09,
                                                        height: devicewidth * 0.09,
                                                        borderRadius: (devicewidth * 0.15) / 2,
                                                        padding: "5%",
                                                        backgroundColor: c.secondary,
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                    onPress={() => {
                                                        if (admin?.some((data) => data === user_Id)) {
                                                            inviteNewmembers(detail);
                                                        }
                                                    }}
                                                >
                                                    <Pencilicon width={devicewidth * 0.055} height={devicewidth * 0.055} />
                                                </Pressable>}
                                        </View>

                                        <Text style={styles.subhead}>{detail?.isGroupchat ? detail?.groupDiscription : detail?.members[0]?.MychatDiscription}</Text>

                                    </View>



                                    {detail?.isGroupchat &&
                                        <>
                                            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginTop: "6%" }}>
                                                <Text style={styles.subtitle}>{t('Group')} {t('Activity_Members')}: ({groupMembers?.length})</Text>

                                            </View>
                                            {loading ?
                                                <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                                                :

                                                <View style={{ marginTop: "3%", width: "100%" }}>

                                                    {groupMembers
                                                        ?.map((e, index) => (

                                                            <>
                                                                <Menu style={{}} >

                                                                    <MenuTrigger key={index} triggerOnLongPress={() => { }} >


                                                                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: "5%", width: "100%", justifyContent: "space-between", }}>

                                                                            {e?.profile ?
                                                                                <Pressable onPress={() => { e?._id != user_Id && handleProfileView(e, false) }}>
                                                                                    <Image
                                                                                        // source={{ uri: `${Imageurl}${ImagePath}${e?.profile}` }}
                                                                                        source={{ uri: `${Imageurl}${e?.profile}` }}
                                                                                        style={{ width: devicewidth * 0.160, height: devicewidth * 0.160, borderRadius: borderradius * 2 }}
                                                                                    /></Pressable>

                                                                                :
                                                                                <Pressable onPress={() => { e?._id != user_Id && handleProfileView(e, false) }}>
                                                                                    <View style={{ width: devicewidth * 0.150, height: devicewidth * 0.150 }}>

                                                                                        <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                                            source={randomimages[e?.randomIndex]}
                                                                                            resizeMode="cover" />
                                                                                    </View></Pressable>

                                                                            }
                                                                            <View style={{ width: "55%" }}>
                                                                                <Text style={styles.gptitle}>{e?._id == user_Id ? "You" : e?.username}</Text>
                                                                                <Text style={styles.gpsubtitle}>{e?.MychatDiscription}</Text>
                                                                            </View>
                                                                            <View style={{ width: "24%", }}>
                                                                                {admin?.some((data) => data == e?._id) &&
                                                                                    <View style={{ width: "100%", backgroundColor: c.secondary, borderRadius: borderradius * 2, alignItems: "center", justifyContent: "center", padding: "2.5%" }}>
                                                                                        <Text style={styles.gpsubtitle1}>{t('Admin')}</Text>
                                                                                    </View>
                                                                                }
                                                                            </View>

                                                                        </View>

                                                                    </MenuTrigger>

                                                                    {e?.blockStatus == "unblocked" &&
                                                                        <MenuOptions optionsContainerStyle={{
                                                                            backgroundColor: 'white',
                                                                            padding: e._id !== user_Id ? 3 : 0,
                                                                            borderRadius: 5,
                                                                            minWidth: "50%",
                                                                            shadowColor: '#000',
                                                                            shadowOffset: { width: 0, height: 2 },
                                                                            shadowOpacity: 0.2,
                                                                            shadowRadius: 5,
                                                                            elevation: 5,
                                                                            marginHorizontal: "0%"
                                                                        }}>
                                                                            {e._id != user_Id &&
                                                                                <MenuOption
                                                                                    onSelect={() => {

                                                                                        sendMessageTo(e)
                                                                                    }}
                                                                                >
                                                                                    <View style={{
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',

                                                                                    }}>
                                                                                        <Text style={{ color: c.primary, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>
                                                                                            {t('Message_to')} {e?.username.length > 5 ? e?.username.slice(0, 5) + '...' : e?.username}
                                                                                        </Text>

                                                                                    </View>
                                                                                </MenuOption>
                                                                            }
                                                                            {e._id != user_Id &&
                                                                                <MenuOption
                                                                                    onSelect={() => {

                                                                                        handleProfileView(e, false)
                                                                                    }}
                                                                                >
                                                                                    <View style={{
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',

                                                                                    }}>
                                                                                        <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>
                                                                                            {t('View')} {e?.username?.length > 5 ? e?.username?.slice(0, 5) + '...' : e?.username} {t('Profile')}
                                                                                        </Text>

                                                                                    </View>
                                                                                </MenuOption>
                                                                            }
                                                                            {admin?.some((data) => data == user_Id) && e?._id != detail?.groupCreater?._id && e?._id != user_Id &&
                                                                                <>
                                                                                    <>
                                                                                        {admin?.some((data) => data == e?._id) ?

                                                                                            <MenuOption
                                                                                                onSelect={() => {
                                                                                                    handleRemoveAdmin(e)
                                                                                                }}
                                                                                            >
                                                                                                <View style={{

                                                                                                    alignItems: 'center',
                                                                                                    justifyContent: 'center',

                                                                                                }}>
                                                                                                    <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>{t('Remove_Admin')}</Text>
                                                                                                </View>
                                                                                            </MenuOption>

                                                                                            :
                                                                                            <MenuOption
                                                                                                onSelect={() => {
                                                                                                    handleAddAdmin(e)
                                                                                                }}
                                                                                            >
                                                                                                <View style={{
                                                                                                    alignItems: 'center',
                                                                                                    justifyContent: 'center',

                                                                                                }}>
                                                                                                    <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>{t('Make_Admin')}</Text>
                                                                                                </View>
                                                                                            </MenuOption>
                                                                                        }
                                                                                    </>
                                                                                    {e?._id != detail?.groupCreater?._id &&
                                                                                        <MenuOption
                                                                                            onSelect={() => {
                                                                                                handleRemoveFromGroup(e)
                                                                                            }}
                                                                                        >
                                                                                            <View style={{
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center',

                                                                                            }}>
                                                                                                <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>{t('Remove_Group')}</Text>
                                                                                            </View>
                                                                                        </MenuOption>
                                                                                    }
                                                                                </>
                                                                            }

                                                                        </MenuOptions>
                                                                    }


                                                                </Menu>
                                                            </>
                                                        ))}
                                                </View>
                                            }
                                        </>

                                    }


                                    {detail?.isGroupchat && reqUser?.length > 0 && admin?.some((data) => data == user_Id) &&
                                        <>
                                            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginTop: "6%" }}>
                                                <Text style={styles.subtitle}>{t('RequestedUser')} ({reqUser?.length})</Text>
                                            </View>

                                            <View style={{ marginTop: "3%" }}>
                                                {reqUser?.map((mem, index) => (
                                                    <>
                                                        <Menu key={index} >
                                                            <MenuTrigger triggerOnLongPress={() => { }} >
                                                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: "5%", width: "100%", justifyContent: "space-between" }}>
                                                                    {mem?.profile ?

                                                                        <Image
                                                                            source={{ uri: `${Imageurl}${mem?.profile}` }}
                                                                            style={{ width: devicewidth * 0.160, height: devicewidth * 0.160, borderRadius: borderradius * 2 }}
                                                                        />
                                                                        :

                                                                        <View style={{ width: devicewidth * 0.150, height: devicewidth * 0.150 }}>
                                                                            <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                                source={randomimages[mem?.randomIndex]}
                                                                                resizeMode="cover" />
                                                                        </View>
                                                                    }

                                                                    <View style={{ width: "55%", }}>
                                                                        <Text style={styles.gptitle}>{mem?.username}</Text>
                                                                        <Text style={styles.gpsubtitle}>{mem?.MychatDiscription}</Text>
                                                                    </View>

                                                                    <View style={{ flexDirection: "row", alignItems: "center", width: "24%", justifyContent: "space-around", }}>
                                                                        <Pressable style={styles.confirmbtn1}
                                                                            onPress={() => {
                                                                                handleAcceptOrReject(mem, "accept")
                                                                            }} >

                                                                            {Images.tick1}
                                                                        </Pressable>
                                                                        <Pressable style={styles.confirmbtn2}
                                                                            onPress={() => {
                                                                                handleAcceptOrReject(mem, "reject")
                                                                            }}
                                                                        >
                                                                            {Images.close4}
                                                                        </Pressable>
                                                                    </View>
                                                                </View>
                                                            </MenuTrigger>

                                                            {mem?.blockStatus == "unblocked" && (
                                                                <MenuOptions optionsContainerStyle={{
                                                                    backgroundColor: 'white',
                                                                    padding: mem._id !== user_Id ? 3 : 0,
                                                                    borderRadius: 5,
                                                                    width: 150,
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 2 },
                                                                    shadowOpacity: 0.2,
                                                                    shadowRadius: 5,
                                                                    elevation: 5,
                                                                    marginHorizontal: 12
                                                                }}
                                                                >
                                                                    {mem._id != user_Id && (
                                                                        <MenuOption
                                                                            onSelect={() => {
                                                                                handleProfileView(mem, false)
                                                                            }}
                                                                        >
                                                                            <View style={{
                                                                                alignItems: "center",
                                                                                justifyContent: "center"
                                                                            }}>
                                                                                <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>
                                                                                    {t('View')} {mem?.username?.length > 5 ? mem?.username?.slice(0, 5) + '...' : mem?.username} {t('Profile')}
                                                                                </Text>
                                                                            </View>
                                                                        </MenuOption>
                                                                    )}
                                                                </MenuOptions>
                                                            )}
                                                        </Menu>
                                                    </>
                                                ))}
                                            </View>
                                        </>
                                    }

                                    {!detail?.isGroupchat &&
                                        (
                                            <>
                                                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginTop: "10%" }}>
                                                    {/* <Text style={styles.subtitle}>{t('Media_Shared')}</Text> */}
                                                    <Text style={styles.subtitle}>{t('Photosshared')}</Text>
                                                </View>

                                                <View style={{ width: "100%", flexDirection: "row", marginTop: "8%", flexWrap: "wrap", justifyContent: "space-between" }}>
                                                    {imagePrevUrl?.length == 0 &&
                                                        <View style={{ position: "absolute", top: "40%", left: 0, right: 0 }}>
                                                            <Text style={{
                                                                fontFamily: Fonts.Regular,
                                                                color: c.white,
                                                                fontSize: RFValue(16),
                                                                textAlign: "center"
                                                            }}>
                                                                {t('No_Photo_Found')}
                                                            </Text>
                                                        </View>
                                                    }
                                                    {imagePrevUrl?.slice(0, 3).map((imageObj, index) => (
                                                        <Pressable onPress={() => setVisible(true)} style={{ width: "20%" }}>
                                                            <View key={index} style={{ width: "22%", }}>
                                                                <Image
                                                                    source={{ uri: imageObj.url }}
                                                                    resizeMode='cover'
                                                                    style={{ height: devicewidth * 0.200, width: devicewidth * 0.200, borderRadius: borderradius * 0.5 }}
                                                                />
                                                            </View>
                                                        </Pressable>
                                                    ))}

                                                    {imagePrevUrl?.length > 3 && (
                                                        <Pressable onPress={() => setVisible(true)} style={{ width: "22%" }}>
                                                            <>
                                                                <Image
                                                                    source={{ uri: imagePrevUrl[3].url }}
                                                                    resizeMode='cover'
                                                                    style={{ height: devicewidth * 0.200, width: "100%", borderRadius: borderradius * 0.5 }}
                                                                    blurRadius={5}
                                                                />
                                                                <View style={{ position: "absolute", top: "40%", left: 0, right: 0 }}>
                                                                    <Text style={{
                                                                        fontFamily: Fonts.Regular,
                                                                        color: c.white,
                                                                        fontSize: RFValue(16),
                                                                        textAlign: "center"
                                                                    }}>
                                                                        {imagePrevUrl.length - 3}+
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        </Pressable>

                                                    )}
                                                </View>
                                            </>
                                        )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>


                </View>

            </LinearGradient>

            <GroupPopup
                modalVisible={modalVisible}
                cretor={detail?.groupCreater?._id != user_Id}
                moreOpt={detail?.isGroupchat}
                exitFn={() => handleAlert("Are you sure you want to exit from this group?", onExitGroup)} // For exit group
                deleteFn={() => handleAlert("Are you sure you want to delete from this group?", onDeleteGroup)} // For deleted group
                redirectFn={() => handleProfileView(detail, true)}
                reportFn={() => handleAlert("Are you sure you want to report?", onReportGroup)} // For report
                blockFn={() => handleAlert("Are you sure you want to block user?", onBlockGroup)}
                clearChatFn={() => handleAlert("Are you sure you want to Clear Chat?", onClearChat)}
                setModalVisible={(e) => setModalVisible(e)}
            />

            <ReportPopUp
                visible={isreportfilter}
                reportText={reportText}  // Pass the reportText from the parent state
                setReportText={setReportText}
                reportFn={() => handleReport()} // For report
            />


            <Modal visible={staticVisible ? staticVisible : visible} transparent={true} onRequestClose={() => {
                setImagePrevUrl([])
                getAllMedia()
                staticVisible ? setStaticVisible(false) : setVisible(false)
            }}>
                <ImageViewer
                    imageUrls={staticVisible ? staticImagePrevUrl : imagePrevUrl}
                    swipeDownThreshold={400}
                    enableSwipeDown={true}
                    onSwipeDown={() => {
                        setStaticImagePrevUrl([])
                        setImagePrevUrl([])
                        getAllMedia()
                        staticVisible ? setStaticVisible(false) : setVisible(false)
                    }}
                    renderIndicator={() => null}
                    saveToLocalByLongPress={false}
                    onLongPress={() => { }}
                />

                <View style={{ width: "100%", height: 90, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: Platform.OS == "android" ? "0%" : "5%", left: "0%", right: 0 }}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        staticVisible ? setStaticVisible(false) : setVisible(false)
                    }}>
                        {Images.back}
                    </TouchableOpacity>

                </View>
            </Modal>

        </View>
    )
}

export default GroupMembers

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%",

    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(24),
        textAlign: "center",
        marginTop: "1%",

    },
    subhead: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(15),
        textAlign: "center",
        marginTop: "1%",
        width: "100%"

    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "11%",
        flexDirection: "row",
        alignItems: "center",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        padding: "6%",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    locationtxt: {
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
        color: c.primary,
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
        fontSize: RFValue(14),

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
        width: "70%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.6,
        alignItems: "center",
        borderColor: c.white,
        backgroundColor: "#C77F86",
        borderWidth: 0.9,
        marginLeft: "3%"
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%"
    },
    roundbox1: {
        width: devicewidth * 0.107,
        height: devicewidth * 0.107,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    btntxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(15),
        textAlign: "center"

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
    gpsubtitle1: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),

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
    confirmbtn2: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        borderRadius: borderradius * 5,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        padding: "1%",
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

    }
});
