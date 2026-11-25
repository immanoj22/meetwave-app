import { ActivityIndicator, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { Images } from "../../Utilities/images";
import { useDispatch } from 'react-redux';
import { update_statusbarcolor } from '../../Slices/helper';
import { c } from "../../Utilities/colors";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";
import React, { useRef, useState } from "react";
import { GetItem } from "../../Actions/localstorage";
import { eventlistapi, eventwishlistapi } from "../../Actions/hooks";
import Share from 'react-native-share';
import Comment from "../../comment/Comment";
import { Imageroute } from "../../Actions/constant";
import { useTranslation } from 'react-i18next';
import Commonheader from "../../Navigation/commonheader";
import { showwarningmessage } from "../../Actions/config";

export default function EventWishList() {

    const { t } = useTranslation();

    const dispatch = useDispatch()
    const userID = GetItem("UserId")
    const [eventData, setEventData] = useState([])
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState("")

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            handleEventList()
        }, [])

    )
    const navigation = useNavigation();
    const handleEventList = async (e) => {
        try {
            var payload = {
                "userId": userID,
                "type": "all"
            }

            const result = await eventlistapi(payload)
            const addressdata = await Promise.all(
                result?.data
                    ?.filter(e => e.delete === false) // Filter out items with delete: true
            );

            setEventData(addressdata)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
        }
    }

    function formatDate(dateString) {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).toUpperCase();
    }
    const handleSharefn = async (event) => {
        try {
            const eventLink = `https://example.com/events/${event.id}`; // Static link or use deep linking / dynamic links as needed

            const shareOptions = {
                title: event.eventTitle,
                message: `${t('Check_out_this_event')} ${event.eventTitle}`,
                url: eventLink,
            };
            await Share.open(shareOptions);
        } catch (err) {

        }
    };

    const handleWishlist = async (e) => {

        try {
            var payload = {
                "type": "save",
                "userId": userID,
                "eventId": e?.eventId
            }

            const result = await eventwishlistapi(payload)
            if (result?.status) {
                showwarningmessage(result?.message);
                handleEventList()
            }
            else {
                showwarningmessage(result?.message);
            }
        }
        catch (err) {

        }

    }

    const openComment = (e) => {
        setVisible(true)
        setEvent(e.eventId)
    };

    const [visible, setVisible] = useState(false)

    const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);

        
    return (
        <View style={{ flex: 1 }}>
            <LinearGradient style={{ flex: 1, width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <ImageBackground style={{ width: "100%", height: "100%" }} source={Images.homebg}  >
                   
                    <Commonheader
                        title={t('Saved_Event')}
                        onback={handleBack}
                    />
                    <View style={{ width: "98%", height: "88%", alignSelf: "center", paddingHorizontal: "3%" }}>
                        {loading ? (
                            <ActivityIndicator size="large" color={c.white} />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ marginBottom: "10%" }}>
                                    {eventData.length === 0 ? (
                                        <View style={{ marginTop: "5%" }}>
                                            <Text style={styles.noDataText}>{t('No_Events_Found')}</Text>
                                        </View>
                                    ) : (

                                        eventData?.map((e, index) => (
                                            <Pressable onPress={() => navigation.navigate("ActivityDetail", { detail: e })} key={index} style={styles.card}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Text style={styles.datetxt} >{formatDate(e?.createdAt)}</Text>
                                                    <View style={{ width: "23%", flexDirection: "row", justifyContent: "space-between", }}>
                                                        <Pressable onPress={() => handleSharefn(e)} style={{ marginRight: "0%" }}>
                                                            {Images.share1}
                                                        </Pressable>
                                                        <Pressable onPress={() => handleWishlist(e)}>
                                                            {e.isSaved ? Images.wish : Images.save}
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: "3%", width: "90%" }}>
                                                    <Text style={styles.title}>{e?.eventTitle}</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: "1%" }}>
                                                    {Images.location1}
                                                    <Text style={styles.loctxt}>{e?.formatedaddress}</Text>
                                                </View>
                                                <View style={{ width: "100%", marginTop: "2%", flexDirection: "row", }}>

                                                    <View style={{ width: "22%", }}>
                                                        {e?.eventinterested?.map((item, index) => (
                                                            <Image style={{ width: devicewidth * 0.080, height: devicewidth * 0.080, borderRadius: borderradius * 2 }} source={{ uri: `${Imageroute.PersonalProfile}` + `${item?.userId?.profile}` }} />
                                                        ))}

                                                    </View>
                                                    <View style={{ width: "20%", justifyContent: "center" }}>
                                                        <Text style={styles.friendtxt}>{e?.EventJoinCount} {t('Friends')}</Text>
                                                    </View>
                                                    <Pressable onPress={() => openComment(e)} style={{ width: "68%" }}>{Images.comment}</Pressable>
                                                </View>

                                            </Pressable>
                                        ))
                                    )
                                    }

                                </View>
                            </ScrollView>
                        )
                        }
                    </View>

                </ImageBackground>
            </LinearGradient>
            {event ?
                <Comment visible={visible} onclose={(getvalue) => setVisible(getvalue)} eventid={event} /> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: borderradius * 0.4,
        backgroundColor: "#DF8B4D",
        height: deviceheight * 0.230,
        paddingHorizontal: "3%",
        paddingVertical: "3%",
        marginBottom: "4%"
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
    noDataText: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "center"

    }

})
