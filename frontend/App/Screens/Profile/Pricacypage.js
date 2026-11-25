import { Pressable, StyleSheet, Text, View } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { Images } from "../../Utilities/images";
import { devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { GetItem } from "../../Actions/localstorage";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { c } from "../../Utilities/colors";
import { useTranslation } from "react-i18next";
import SwitchToggle from "react-native-switch-toggle";
import React, { useEffect, useState } from "react";
import { HideEventsInprofile, hideHobbies, HideProfile, UserEditAccount } from "../../Actions/hooks";
import { Fetchprofile, profileSelector } from "../../Slices/profile";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_hideinterest, update_hideprofiledetails, update_NetworkVisible, update_statusbarcolor } from "../../Slices/helper";


const Privacypage = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const dispatch = useDispatch()
    const { profile } = useSelector(profileSelector)

    const [group, setGroup] = useState(false)
    const [interest, setInterest] = useState(true)
    const [profileShow, setProfileShow] = useState(true)
    const { isOnline } = useSelector(helperSelector)
    const [profileSts, setProfileSts] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            setProfileSts(profile?.privacy_status != "public")
        }, [])
    )

    useEffect(() => {
        if (profile) {
            setGroup(profile?.ishideevent);
            setInterest(profile?.ishidehobbies);
            setProfileShow(profile?.ishideprofile);

            dispatch(update_hideinterest({ interest: profile?.ishidehobbies }))
            dispatch(update_hideprofiledetails({ group: profile?.ishideevent }))
        }
    }, [profile])




    const handleGroupProfile = async () => {
        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "userId": userID,
                "hide_event": !group
            }
            const result = await HideEventsInprofile(payload)
            if (result?.status) {
                setGroup(!group);
                dispatch(Fetchprofile(userID))
               // ShowToast(result?.message)
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }
    const handleHobbiesShow = async () => {
        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "userId": userID,
                "hide_hobbies": !interest,
            }
            const result = await hideHobbies(payload)
            if (result?.status) {
                setInterest(!interest)
                dispatch(Fetchprofile(userID))
               // ShowToast(result?.message)
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }
    const handleProfileShow = async () => {
        try {
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "userId": userID,
                "hide_profile": !profileShow,
            }
            const result = await HideProfile(payload)
            if (result?.status) {
                setProfileShow(!profileShow)
                dispatch(Fetchprofile(userID))
                // ShowToast(result?.message)
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }

    const handleProfileStatus = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                userId: userID,
                privacy_status: profile?.privacy_status == "public" ? true : false
            }

            setProfileSts(!profileSts);

            const result = await UserEditAccount(payload);
            if (result?.status) {
                //    ShowToast(payload.privacy_status ? "You are now a Private account." : "You are now a Public account.")
                //  ShowToast(payload.privacy_status ? t('You_are_now_using_a_private/public_account') : t('You_are_now_using_a_private/public_account'))
                dispatch(Fetchprofile(userID))
            }
            else {
                ShowToast(result?.message)
            }


        } catch (error) {
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <Pressable
                            onPress={() => {
                                navigation.goBack();
                            }}

                            style={styles.roundbox}>
                            {Images.back}
                        </Pressable>
                    </View>

                    <Text style={styles.title}>{t('Privacy')}</Text>

                    <View style={{ width: "90%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", marginTop: "10%" }}>
                        <View style={{ width: "85%" }}>
                            <Text style={styles.inputpara}>{t('Hide_events_Profile')}</Text>
                            {/* <Text style={styles.activitysubtxt}>{t('Grop_desc')}.
                                {t('Free_for_days')}</Text> */}
                        </View>
                        <View style={{ width: "15%" }}>
                            <SwitchToggle
                                switchOn={group}
                                onPress={() => {
                                    setGroup(!group);
                                    setTimeout(() => {
                                        handleGroupProfile()
                                    }, 250)
                                }}
                                circleColorOff='#911687'
                                circleColorOn="#911687"
                                backgroundColorOn='#F8BE2D'
                                backgroundColorOff='#F87FBF'
                                containerStyle={{
                                    width: devicewidth * 0.16,
                                    height: devicewidth * 0.074,
                                    borderRadius: 100,
                                    padding: devicewidth * 0.01,

                                }}
                                circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                            />
                        </View>

                    </View>

                    <View style={{ width: "90%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", marginTop: "3%" }}>
                        <View style={{ width: "85%" }}>
                            <Text style={styles.inputpara}>{t('Show_interests_Profile')}</Text>
                            {/* <Text style={styles.activitysubtxt}>{t('The_best_of_Meetwave')}.
                                {t('Free_for_days')}</Text> */}
                        </View>
                        <View style={{ width: "15%" }}>
                            <SwitchToggle
                                switchOn={interest}
                                onPress={() => {
                                    setInterest(!interest);
                                    setTimeout(() => {
                                        handleHobbiesShow()
                                    }, 250)
                                }}
                                circleColorOff='#911687'
                                circleColorOn="#911687"
                                backgroundColorOn='#F8BE2D'
                                backgroundColorOff='#F87FBF'
                                containerStyle={{
                                    width: devicewidth * 0.15,
                                    height: devicewidth * 0.074,
                                    borderRadius: 100,
                                    padding: devicewidth * 0.01,

                                }}
                                circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                            />
                        </View>

                    </View>

                    <View style={{ flexDirection: "row", width: "90%", justifyContent: "space-between", alignSelf: "center", marginTop: "5%" }}>
                        <View style={{ width: "85%", }}>
                            <Text style={{
                                fontFamily: Fonts.Bold,
                                color: c.white,
                                fontSize: RFValue(16),
                            }}>{t('You_want_your_account_to_be_private')}</Text>

                            <Text style={styles.activitysubtxt}>{t('private_sub_text')}</Text>
                        </View>
                        <View style={{ width: "15%", }}>
                            <SwitchToggle
                                switchOn={profileSts}
                                onPress={() => {
                                    handleProfileStatus()
                                }}
                                circleColorOff='#911687'
                                circleColorOn="#911687"
                                backgroundColorOn='#F8BE2D'
                                backgroundColorOff='#F87FBF'
                                containerStyle={{
                                    width: devicewidth * 0.15,
                                    height: devicewidth * 0.074,
                                    borderRadius: 100,
                                    padding: devicewidth * 0.01,

                                }}
                                circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                            />
                        </View>
                    </View>

                    <View style={{ width: "90%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", marginTop: "3%" }}>
                        <View style={{ width: "85%" }}>
                            <Text style={styles.inputpara}>{t('Show_Profile')}</Text>
                            <Text style={styles.activitysubtxt}>{t('Selecting_prevent_profile')}</Text>
                        </View>
                        <View style={{ width: "15%" }}>
                            <SwitchToggle
                                switchOn={profileShow}
                                onPress={() => {
                                    setProfileShow(!profileShow);
                                    setTimeout(() => {
                                        handleProfileShow()
                                    }, 250)
                                }}
                                // circleColorOff='white'
                                // circleColorOn="white"
                                // backgroundColorOn='red'
                                // backgroundColorOff='red'

                                circleColorOff='#911687'
                                circleColorOn="#911687"
                                backgroundColorOn='#F8BE2D'
                                backgroundColorOff='#F87FBF'

                                containerStyle={{
                                    width: devicewidth * 0.15,
                                    height: devicewidth * 0.074,
                                    borderRadius: 100,
                                    padding: devicewidth * 0.01,

                                }}
                                circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                            />
                        </View>

                    </View>

                </View>

            </LinearGradient>
        </View>
    )
}
export default Privacypage
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "8%",
        paddingTop: "4%",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(20),
        alignSelf: "center",
        marginTop: "1%"
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
    },
    activitysubtxt: {
        fontSize: RFValue(11),
        fontFamily: Fonts.Regular,
        color: "#DEDEDE",
        width: "90%"

    },
})