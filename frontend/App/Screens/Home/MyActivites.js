import { Pressable, StyleSheet, Text, View, FlatList, Image, ActivityIndicator, ImageBackground, Share } from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { Images } from "../../Utilities/images";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_NetworkVisible, update_SavedEvents, update_statusbarcolor, update_UpdateActivities } from '../../Slices/helper';
import { c } from "../../Utilities/colors";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import { activitylistapi, eventInterestapi, eventwishlistapi } from "../../Actions/hooks";

import { Imageroute } from "../../Actions/constant";
import LinearGradient from "react-native-linear-gradient";
import { GetItem } from "../../Actions/localstorage";
import { randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import Commonheader from "../../Navigation/commonheader";
import branch from 'react-native-branch';

export default function MyActivites() {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const userID = GetItem("UserId")
    const [interest, setInterest] = useState(false)
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const [eventURL, setEventURL] = useState("")
    const [activityid, setActivityid] = useState("")

    // useFocusEffect(
    //     React.useCallback(() => {
    //         dispatch(update_statusbarcolor(c.primary))
    //     }, [])
    // )

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary));
        }, [dispatch, c.primary])
    );

    const navigation = useNavigation();
    function formatDate(dateString) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).toUpperCase();
    }

    const { filterBysearch, isOnline, savedEvents } = useSelector(helperSelector)

    useEffect(() => {

        handleActivityList(page)
        return (() => {
            dispatch(update_UpdateActivities(activityid));
        })

    }, [isOnline])


    const handleActivityList = async (page) => {

        try {

            if (!isOnline) {
                setLoading(false)
                dispatch(update_NetworkVisible(true));
                return
            }

            if (!maxreached) {

                var payload = {
                    "userId": userID,
                    "eventTitle": "",
                    "page": page,
                    "limit": "37"
                }

                if (page == 1) {
                    setLoading(true)
                }
                else {
                    setFooterload(true)
                }

                const result = await activitylistapi(payload)
                setLoading(false)
                setFooterload(false)


                if (result?.data?.length > 0) {
                    const filteredData = result?.data.filter(item =>
                        item?.isSaved?.some(data => data?.status === true && data?.userId === userID)
                    );

                    // Only set activity data if there are any matching items
                    if (filteredData.length > 0) {
                        var local = [...savedEvents, ...filteredData];
                        if (payload?.page == 1) {
                            dispatch(update_SavedEvents(filteredData))
                        }
                        else {
                            dispatch(update_SavedEvents(local))
                        }
                    } else {
                        dispatch(update_SavedEvents([]))

                    }

                    setPage(page)
                    if (result?.data?.length == 4) {
                        setMaxreached(true)
                    }
                }
                else {
                    setMaxreached(true)
                }

            }
        }
        catch (err) {
            setLoading(false)

        }
    }

    const handleAddInterest = async (item, index) => {
        try {
            var local = [...savedEvents]

            if (!isOnline) {
                setLoading(false)
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;

            setApiCalled(true);

            var payload = {
                "type": !local[index]?.eventinterested.some((data) => data?.userId?._id == userID && data.joinstatus == true) ? "join" : "unjoin",
                "userId": userID,
                "eventId": item?._id
            }

            const result = await eventInterestapi(payload)
            setInterest(true)
            if (result?.status) {
                ShowToast(result?.message)

                local[index].eventinterested = local[index].eventinterested.map((data) => {
                    if (data?.userId?._id === userID) {
                        return {
                            ...data,
                            joinstatus: !data.joinstatus
                        };
                    }
                    return data;
                });

                dispatch(update_SavedEvents(local))
                setActivityid(item?._id)
                dispatch(update_UpdateActivities(item?._id))

            }


            else {
                ShowToast(result?.message)
            }


        }
        catch (err) {

        }
        finally {
            setApiCalled(false);
        }

    }

    const handleWishlist = async (item, index) => {
        var local = [...savedEvents]
        if (!isOnline) {
            setLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }

        if (apiCalled) return;
        setApiCalled(true);

        try {
            var payload = {
                "type": item?.isSaved?.some((data) => data?.status == true && data?.userId == userID) ? "unsave" : "save",
                "userId": userID,
                "eventId": item?._id
            }
            const result = await eventwishlistapi(payload)

            if (result?.status) {
                ShowToast(result?.message)
                const filterFn = savedEvents.filter((data) => data?._id != item?._id);
                dispatch(update_SavedEvents(filterFn))
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }


    }

    const renderFooter = () => {
        return footerload ? (
            <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }} >
                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
            </View>
        ) : null;
    };

    const RenderActivity = ({ item, position }) => (

        <>
            {item?.isSaved?.some((data) => data?.status == true && data?.userId == userID) &&
                <View

                    key={item.id} style={styles.card}>
                    <Pressable onPress={() => navigation.navigate("ActivityDetail", { detail: item })}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.datetxt}>{formatDate(item?.createdAt)}</Text>
                            <View style={{ width: "18%", flexDirection: "row", justifyContent: "space-between" }}>
                                <Pressable style={{ marginRight: "0%" }} onPress={() => shareLink(item)}>
                                    {Images.share}
                                </Pressable>

                                <Pressable onPress={() => handleWishlist(item, position)}>
                                    {item?.isSaved?.length != 0 && item?.isSaved?.some((data) => data?.status == true && data?.userId == userID) ? Images.wish : Images.save}
                                </Pressable>
                            </View>
                        </View>
                        <View style={{ marginTop: "3%", width: "90%" }}>
                            <Text style={styles.title}>{item?.eventTitle}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: "2%" }}>
                            {Images.location1}
                            <Text style={styles.loctxt} numberOfLines={2}>{item.eventAddress}</Text>
                        </View>
                        <View style={{ width: "100%", marginTop: "4%", flexDirection: "row", alignItems: "center", }}>
                            <View style={{ width: "40%", flexDirection: "row", }}>

                                {item?.eventinterested?.length > 0
                                    // && item?.eventinterested?.some(data => data?.joinstatus == true)
                                    &&
                                    (
                                        item?.eventinterested?.slice(0, 3).map((e, index) => (
                                            <>
                                                {e?.joinstatus &&
                                                    <>
                                                        {e?.userId?.profile != "" ?
                                                            <Image
                                                                key={index}
                                                                style={{
                                                                    width: devicewidth * 0.080,
                                                                    height: devicewidth * 0.080,
                                                                    borderRadius: borderradius * 2,
                                                                }}
                                                                source={{ uri: `${Imageroute.PersonalProfile}${e?.userId?.profile}` }}
                                                            />
                                                            :
                                                            <Image
                                                                style={{
                                                                    width: devicewidth * 0.080,
                                                                    height: devicewidth * 0.080,
                                                                    borderRadius: borderradius * 2,
                                                                }}
                                                                source={randomimages[e?.userId?.randomIndex]}
                                                                resizeMode="cover"
                                                            />
                                                        }
                                                    </>
                                                }

                                            </>
                                        ))
                                    )}
                            </View>

                        </View>


                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: "4%", }}>
                            {item?.userId?.hobbies?.length > 0 && (
                                <View style={{ width: "70%", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    {/* Display the first 3 hobbies */}
                                    {item?.userId?.hobbies.slice(0, 2).map((hobby, index) => (
                                        <View key={hobby._id} style={styles.btn}>
                                            <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                        </View>
                                    ))}

                                    {/* If there are more than 3 hobbies, show the +x count */}
                                    {item?.userId?.hobbies.length > 3 && (
                                        <View style={[styles.smallround, { marginLeft: "4%" }]}>
                                            <Text style={styles.btntxt}>+{item?.userId?.hobbies?.length - 3}</Text>
                                        </View>
                                    )}
                                </View>
                            )}


                        </View>
                    </Pressable>


                    {item?.eventinterested?.some(data => data?.userId?._id === userID && data?.joinstatus == true) ?
                        <View style={{ position: "absolute", bottom: "9%", right: "2%", width: "40%", flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                            <View style={{ flexDirection: "row", alignItems: "center", width: "40%", gap: 4, justifyContent: "center" }}>

                                <View>
                                    {Images.groupMembUn}
                                </View>
                                <Text style={styles.friendtxt}>
                                    {item?.eventinterested?.filter(data => data?.joinstatus == true).length}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() =>
                                    handleAddInterest(item, position)
                                }
                                style={{
                                    width: "60%",
                                    borderRadius: borderradius * 1,
                                    backgroundColor: c.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingHorizontal: "4%",
                                    paddingVertical: "4%"
                                }}>
                                <Text style={styles.interesttxt}>{t('Leave_Event')}</Text>
                            </Pressable>
                        </View> :
                        <View style={{ position: "absolute", bottom: "9%", right: "2%", width: "40%", flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                            <View style={{ flexDirection: "row", alignItems: "center", width: "40%", gap: 4, justifyContent: "center" }}>

                                <View>
                                    {Images.groupMemb}
                                </View>
                                <Text style={styles.friendtxt}>
                                    {item?.eventinterested?.filter(data => data?.joinstatus == true).length}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {

                                    handleAddInterest(item, position)
                                }}
                                style={{
                                    width: "60%",
                                    borderRadius: borderradius * 1,
                                    backgroundColor: c.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingHorizontal: "4%",
                                    paddingVertical: "4%"
                                }}>
                                <Text style={styles.interesttxt}>{t('Activity_Join')}</Text>
                            </Pressable>
                        </View>

                    }

                </View>
            }



        </>
    );

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

    // const handleBack = React.useCallback(() => {
    //     navigation.goBack();
    // }, [navigation]);

    const handleBack = () => {
        requestAnimationFrame(() => {
            navigation.goBack();
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient style={{ flex: 1, width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <ImageBackground style={{ width: "100%", height: "100%" }} source={Images.homebg}  >

                    <Commonheader
                        title={t('Book_Mark')}
                        onback={handleBack}
                    />

                    <>

                        {loading ? (
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <ActivityIndicator size="large" color={c.white} />
                            </View>
                        )
                            :
                            savedEvents?.length == 0 ? (
                                <View style={{ height: "70%", alignItems: "center", justifyContent: "center" }}>
                                    <View style={{ marginTop: "5%" }}>
                                        <Text style={styles.noDataText}>{t('No_Events_Bookmarked')}</Text>
                                    </View>
                                </View>
                            )
                                :
                                (
                                    <View style={{ width: "93%", height: "88%", alignSelf: "center", marginTop: "2%" }}>
                                        <FlatList
                                            data={savedEvents}
                                            renderItem={({ item, index }) => <RenderActivity item={item} position={index} />}
                                            keyExtractor={(item) => item.id}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={{ paddingBottom: "10%" }}
                                            onEndReached={() => {
                                                var count = (page === 0 ? 1 : page) + 1;
                                                handleActivityList(count);
                                            }}
                                            ListFooterComponent={renderFooter}
                                        />
                                    </View>
                                )
                        }
                    </>




                </ImageBackground>
            </LinearGradient>

        </View>

    )
}


const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        paddingHorizontal: "3%",
        paddingVertical: "4%",
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
        borderRadius: borderradius * 1.4,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "6%"
    },
    interesttxt: {
        color: c.secondary,
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium
    },
    noDataText: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        textAlign: "center"
    },
    interestbtn1: {
        width: "50%",
        height: deviceheight * 0.0355,
        borderRadius: borderradius * 1.4,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "3%"

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

})
