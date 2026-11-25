import { ActivityIndicator, Alert, Image, ImageBackground, Keyboard, Modal, Pressable, RefreshControl, Share, StyleSheet, Text, TextInput, View, InteractionManager } from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { Images } from "../../Utilities/images";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_EventFilterHoobies, update_Isreportfilter, update_MyEvents, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { c } from "../../Utilities/colors";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { GetItem } from "../../Actions/localstorage";
import { eventdeleteapi, eventlistapi, ReportToAdmin, Upcominglistapi } from "../../Actions/hooks";
import Comment from "../../comment/Comment";
import { Imageroute } from "../../Actions/constant";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useTranslation } from 'react-i18next';
import { FlashList } from "@shopify/flash-list";
import { randomimages } from "../../Utilities/profileImages";
import { profileSelector } from "../../Slices/profile";
import AlertPopup from "../../Components/AlertPopup";
import branch from 'react-native-branch';
import ReportPopUp from "../Group/ReportPopUp";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { hasActiveSubscription, showwarningmessage } from '../../Actions/config';

export default function UpcomingEvent(props) {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const userID = GetItem("UserId")
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState("")
    const [refreshing, setRefreshing] = useState(false);
    const { isreportfilter, isOnline } = useSelector(helperSelector)
    const { profile } = useSelector(profileSelector);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [eventURL, setEventURL] = useState("")
    const [myEvents, setMyEvents] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [reportText, setReportText] = useState("")
    const [apiCalled, setApiCalled] = useState(false)
    const [data, setData] = useState({})
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debouncedSearchRef = useRef("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        debouncedSearchRef.current = debouncedSearch;
    }, [debouncedSearch]);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [dispatch])
    )

    const navigation = useNavigation();

    const handleEventList = async (data) => {
        try {

            if (!isOnline) {
                setLoading(false)
                dispatch(update_NetworkVisible(true));
                return
            }

            const searchTerm = data?.search ?? debouncedSearchRef.current ?? "";

            let payload = {
                "searchEvent": searchTerm
            }

            if ((myEvents?.length ?? 0) > 0) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const result = await Upcominglistapi(payload)

            console.log("UpcomingRes->", result)
            //setMyEvents(result?.data)
            if (result == false) {
                setMyEvents("")
            } else {
                setMyEvents(result?.data)
            }

            setLoading(false)
        }
        catch (err) {
            setLoading(false)

        }
        finally {
            setRefreshing(false); // Stop refreshing
        }
    }

    useEffect(() => {
        if (!isOnline) {
            setLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }
        handleEventList({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, isOnline])

    function formatDate(dateString) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).toUpperCase();
    }

    const handleSearch = (text) => {
        setSearch(text);
    }

    const handleDeleteEvent = async (Id) => {

        try {
            var payload = {
                "userId": userID,
                "eventId": Id
            }

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            const result = await eventdeleteapi(payload)
            if (result?.status) {
                const filterarr = myEvents.filter(val => val.eventId !== Id)
                dispatch(update_MyEvents(filterarr))
                showwarningmessage(result?.message);
            }
            else {
                showwarningmessage(result?.message);

            }
        }
        catch (err) {

        }

    }

    const [visible, setVisible] = useState(false)

    const handleAlert = (e) => {
        Alert.alert(t('Delete_Eve'), t('you_delete_created_event'), [
            {
                text: t('Cancel'),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: t('YES'),
                onPress: () => handleDeleteEvent(e),
            },
        ]);
    }

    const handleNavigateFunction = async (e) => {
        if (!hasActiveSubscription(profile)) {
            setIsModalVisible(true);
            return;
        }
        const swappedCoordinates = e?.location?.coordinates ?
            [e.location.coordinates[1], e.location.coordinates[0]] :
            [0, 0];

        navigation.navigate("EventCreation", {
            edit: {
                ...e,
                location: {
                    ...e.location,
                    coordinates: swappedCoordinates
                }
            }
        });
    }


    const handleCreateEventFunction = () => {
        if (profile?.plan?.length && profile?.plan[0]?.isActive == "started") {
            // Navigate first so the transition isn't blocked by Redux updates.
            navigation.navigate("EventCreation");
            InteractionManager.runAfterInteractions(() => {
                dispatch(update_EventFilterHoobies([]));
            });
        } else {
            setIsModalVisible(true);
        }
    }

    const handleNaigatePremium = async () => {
        setIsModalVisible(false)
        navigation.navigate("Premium")
    }

    const shareLink = async (item) => {

        const propsDTL = item;
        const imgURL = propsDTL?.imageURL ? propsDTL?.imageURL : `${Imageroute?.eventProfile}${propsDTL?.image[0]}`;
        try {

            const branchUniversalObject = await branch.createBranchUniversalObject(`Event/${propsDTL?._id}`, {
                title: item?.eventTitle,
                contentDescription: item?.description,
                contentImageUrl: imgURL,
                contentMetadata: {
                    customMetadata: {
                        data: JSON.stringify({
                            screen: "ActivityDetail",
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
            const { url } = await branchUniversalObject.generateShortUrl(linkProperties, controlParams);
            setEventURL(url)
            openShare(url)

        } catch (error) {
            console.log('Error sharing product:', error);
        }
    }

    const openShare = async (url) => {

        Share.share({
            message: url,
        })
            //after successful share return result
            .then((result) => console.log(result))
            //If any thing goes wrong it comes here
            .catch((errorMsg) => console.log(errorMsg));
    }

    const handleModelOpen = (item) => {
        setModalVisible(!modalVisible);
        setData(item);
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
            console.log("ReportError==>", error)
        }
        finally {
            setApiCalled(false)
        }
    }

    return (

        <View style={{ flex: 1 }}>
            <LinearGradient style={{ flex: 1, width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <ImageBackground style={{ width: "100%", height: "100%" }} source={Images.homebg}  >
                    <View style={styles.backcontainer}>
                        <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

                            <Pressable onPress={() => navigation.navigate("ProfileDetail")} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>

                            <View style={{ width: "79%" }}>
                                <Text style={styles.headertxt}>{t('Upcoming_events')}</Text>
                            </View>

                            <Pressable onPress={() => handleCreateEventFunction()} style={{ width: "10%", }}>
                                {/* <View style={styles.organizerbtn}>
                                    <Icon name="plus" size={deviceheight * 0.0140} color={c.white} />
                                </View> */}
                            </Pressable>
                        </View>
                    </View>

                    <View style={{ width: "90%", marginTop: 10, alignSelf: "center", height: "7%", alignItems: "center", justifyContent: "center", }}>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: "center" }}>
                            <Pressable style={styles.searchcontainer}>
                                {Images.search1}
                                <TextInput
                                    placeholderTextColor={'#F7E5D0'}
                                    placeholder="Search"
                                    value={search}
                                    style={styles.inputtxtstyle}
                                    onChangeText={handleSearch}
                                />
                            </Pressable>

                            {search &&
                                <Pressable style={styles.closebox} onPress={() => handleSearch("")}>
                                    {Images.close1}
                                </Pressable>
                            }
                        </View>
                    </View>

                    <View style={{ width: "98%", height: "88%", alignSelf: "center", paddingHorizontal: "3%", marginTop: 10 }}>
                        {loading ? (

                            <ActivityIndicator size="large" color={c.white} />
                        ) : (
                            <>


                                {myEvents?.length === 0 ? (
                                    <View style={{ height: "80%", width: "100%", alignItems: "center", justifyContent: "center" }}>

                                        <Text style={styles.noDataText}>{t('No_Events_Found')}</Text>

                                    </View>

                                ) : (
                                    <FlashList
                                        data={myEvents}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={handleEventList}
                                            />
                                        }
                                        showsVerticalScrollIndicator={false}
                                        renderItem={({ item }) =>

                                            <View style={{ marginBottom: "0%" }}>
                                                {
                                                    <View
                                                        style={styles.card}>

                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Text style={styles.datetxt} >{formatDate(item?.startDate)}</Text>
                                                            <View style={{ width: "17%", marginHorizontal: 12, justifyContent: "space-between", flexDirection: "row", }}>
                                                                <Pressable
                                                                    onPress={() => shareLink(item)}
                                                                    style={{ marginRight: "0%" }}>
                                                                    {Images.share}
                                                                </Pressable>
                                                                <Pressable style={{}} onPress={() => handleModelOpen(item)}>
                                                                    {Images.tripledot}
                                                                </Pressable>
                                                            </View>
                                                        </View>

                                                        <Pressable onPress={() => navigation.navigate("ActivityDetail", { detail: item })}>
                                                            <View style={{ marginTop: "3%", width: "90%" }}>
                                                                <Text style={styles.title}>{item?.eventTitle}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: "1%" }}>
                                                                {Images.location1}
                                                                <Text style={styles.loctxt}>{item?.eventAddress}</Text>
                                                            </View>
                                                            <View style={{ width: "100%", marginTop: "3%", flexDirection: "row", }}>

                                                                {item?.EventJoinCount != 0 &&
                                                                    <View style={{ width: "70%", flexDirection: "row", }}>

                                                                        {item?.eventinterested?.filter(data => data?.joinstatus === true).length > 0 && (
                                                                            item?.eventinterested
                                                                                ?.filter(data => data?.joinstatus === true)
                                                                                ?.slice(0, 3)
                                                                                .map((e, index) => (
                                                                                    <>
                                                                                        {e?.userId?.profile ? (
                                                                                            <Image
                                                                                                style={{
                                                                                                    width: devicewidth * 0.080,
                                                                                                    height: devicewidth * 0.080,
                                                                                                    borderRadius: borderradius * 2,
                                                                                                }}
                                                                                                source={{ uri: `${Imageroute.PersonalProfile}${e?.userId?.profile}` }}
                                                                                            />
                                                                                        ) : (
                                                                                            <Image
                                                                                                style={{
                                                                                                    width: devicewidth * 0.080,
                                                                                                    height: devicewidth * 0.080,
                                                                                                    borderRadius: borderradius * 2,
                                                                                                }}
                                                                                                source={randomimages[e?.userId?.randomIndex]}
                                                                                            />
                                                                                        )}
                                                                                    </>
                                                                                ))
                                                                        )}
                                                                    </View>
                                                                }

                                                            </View>

                                                        </Pressable>


                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: "4%" }}>
                                                            {item?.eventhobbies?.length > 0 && (
                                                                <View style={{ width: "70%", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                                    {item?.eventhobbies.slice(0, 2).map((hobby, index) => (
                                                                        <View key={hobby._id} style={styles.btn}>
                                                                            <Text style={styles.btntxt}>{hobby?.name?.length > 8 ? hobby?.name?.slice(0, 5) + "..." : hobby?.name}</Text>
                                                                        </View>
                                                                    ))}
                                                                    {item?.eventhobbies.length > 3 && (
                                                                        <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                                                            <Text style={styles.btntxt}>+{item?.eventhobbies?.length - 3}</Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}
                                                        </View>

                                                        <View style={{ position: "absolute", bottom: "9%", right: "0%", width: "40%", flexDirection: "row", justifyContent: "flex-end" }}>
                                                            <View style={{ flexDirection: "row", width: "40%", gap: 4, alignItems: "center" }}>

                                                                <View>

                                                                    {item?.eventinterested?.length > 0 ?
                                                                        <>
                                                                            {Images.groupMembUn}
                                                                        </>
                                                                        :
                                                                        <>
                                                                            {Images.groupMemb}
                                                                        </>

                                                                    }
                                                                </View>
                                                                <Text style={styles.friendtxt}>
                                                                    {item?.eventinterested?.filter(data => data?.joinstatus == true).length}
                                                                </Text>
                                                            </View>

                                                        </View>

                                                    </View>

                                                }

                                            </View>
                                        }
                                    />

                                )}
                            </>
                        )
                        }
                    </View>



                </ImageBackground>
            </LinearGradient>

            <View style={{
                position: "absolute",
                bottom: Platform.OS == "android" ? deviceheight * 0.15 : deviceheight * 0.02,
                right: "2%",
            }}>

                <Pressable onPress={() => handleCreateEventFunction()} style={{}} >

                    <View style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, borderRadius: borderradius * 3, backgroundColor: c.white, justifyContent: "center", alignItems: "center", elevation: 1 }} >
                        {Images.plusGroup}
                    </View>

                </Pressable>
            </View>

            <AlertPopup
                visible={isModalVisible}
                title={t('Note')}
                onSubmit={() => handleNaigatePremium()}
                onClose={() => setIsModalVisible(false)} >
                <Text>{t('You_want_to_ubscribe')}</Text>
            </AlertPopup>

            {event ?
                <Comment visible={visible} onclose={(getvalue) => setVisible(getvalue)} eventid={event} /> : null}

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


                                <Pressable onPress={handleReportEvent} style={{ flexDirection: "row", justifyContent: "center", alignSelf: "center", paddingVertical: "10%" }}>
                                    <View style={{}}>
                                        <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.white }}>{t('Report_Event')}</Text>
                                    </View>
                                </Pressable>

                                {/* {data?._id == userID &&
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
                                } */}


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
        </View>


    )
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        height: "auto",
        paddingHorizontal: "3%",
        paddingVertical: "3%",
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
        fontSize: RFValue(12),

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
        height: deviceheight * 0.0355,
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
    backcontainer: {
        width: "98%",
        alignSelf: "center",
        height: "12%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "3%",
    },
    roundbox: {
        width: "12%",
        height: devicewidth * 0.11,
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
    noDataText: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        verticalAlign: "middle"
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
    organizerbtn: {
        width: '95%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0320,
        borderColor: c.white,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",


    },
    lasttxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        marginLeft: "4%",
    },

})
