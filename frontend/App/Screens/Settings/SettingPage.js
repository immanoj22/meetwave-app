import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { ShowToast, ShowToastMgs, borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_ChatMembersList, update_filterBySearch, update_IsLogin, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { Clearlocal, GetItem, SetItem } from '../../Actions/localstorage';
import { clear_Redux, Fetchprofile, profileSelector } from '../../Slices/profile';
import { UserEnableDisable, logoutapi, pushnotificationapi } from '../../Actions/hooks';
import SwitchToggle from "react-native-switch-toggle";
import { useTranslation } from 'react-i18next';
import Commonheader from '../../Navigation/commonheader';
import { getFcmToken } from '../../Actions/pushnotificationconfig';

const SettingPage = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    const userID = GetItem("UserId")
    const userEmail = GetItem("UserEmail")
    const fcmtoken = GetItem("Fcmtoken")
    const [switchon, setSwitchOn] = useState(false)
    const [emailon, setEmailOn] = useState(false)
    const [tfaStatus, setTfaStatus] = useState(false)
    const { profile } = useSelector(profileSelector)
    const { isOnline } = useSelector(helperSelector)
    const [distance, setDistance] = useState([10]);
    const [apiCalled, setApiCalled] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))

        }, [])
    )

    // useEffect(() => {
    //     setSwitchOn(profile?.pushNotification)
    //     setEmailOn(profile?.emailUpdates)
    //     setTfaStatus(profile?.TFA)
    // }, [profile])

    useEffect(() => {
        setSwitchOn(profile?.pushNotification ?? false)
        setEmailOn(profile?.emailUpdates ?? false)
        setTfaStatus(profile?.TFA ?? false)
    }, [profile])

    const logoutfn = () => {
        Alert.alert(t('Logout'), t('Are_you_sure_you_want_to_logout'), [
            {
                text: t('Cancel'),
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: t('OK'), onPress: () => yesfn() },
        ]);

    }


    const yesfn = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            const token = await getFcmToken()
            var payload = {
                "userId": userID,
                "fcmtoken": token || '',
                "email": userEmail
            }

            setApiCalled(true);

            const result = await logoutapi(payload)
            if (result?.status) {

                Clearlocal()
                dispatch(clear_Redux())
                dispatch(update_IsLogin(false))
                dispatch(update_ChatMembersList([]));
                dispatch(update_filterBySearch({ search: "" }));
                SetItem("hobbyAlert", false)
                navigation?.navigate("Splash")
                ShowToast(result?.message)
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

    const handlePush = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            const token = await getFcmToken();
            var payload = {
                "userId": userID,
                "pushNotification": !switchon ? "true" : "false",
                "fcmtoken": token || '',
            }
            const result = await pushnotificationapi(payload)
            if (result?.status) {
                setSwitchOn(!switchon)
                ShowToast(result?.message)
                dispatch(Fetchprofile(userID))

            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }

    const handleTFAUpdate = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "userId": userID,
                "TFA": !tfaStatus ? "true" : "false",
            }

            const result = await UserEnableDisable(payload)
            if (result?.status) {
                setTfaStatus(!tfaStatus)
                ShowToastMgs(result?.message);
                dispatch(Fetchprofile(userID))
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }

    const handledistancechange = useCallback((newValues) => {
        setDistance(newValues);
    }, []);

    const Round = () => {
        return (
            <View style={{ width: 28, height: 28, backgroundColor: "#fff", borderRadius: borderradius * 5, justifyContent: "center", top: "10%" }} >
                <View style={{ width: 20, height: 20, backgroundColor: c.primary, borderRadius: borderradius * 5, alignSelf: "center" }} />
            </View>
        )
    }

    // const handleBack = React.useCallback(() => {
    //     navigation.goBack();
    // }, [navigation]);

    const handleBack = React.useCallback(
        () => navigation.goBack(),
        [navigation]
    );

    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>

                    <Commonheader
                        title={t('Settings')}
                        //onback={() => navigation.goBack()}
                        onback={handleBack}
                    />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ width: "100%", height: "92%", marginBottom: "8%", }}>
                            <View style={{ width: "90%", alignSelf: "center", marginTop: "8%", marginBottom: "3%" }}>
                                <Text style={styles.title}>{t('Preferences')}</Text>
                            </View>

                            <View style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Push_Notifi')}</Text>
                                    </View>

                                    <View style={{ width: "15%" }}>
                                        <SwitchToggle
                                            switchOn={switchon}
                                            onPress={handlePush}
                                            circleColorOff='#911687'
                                            circleColorOn="#911687"
                                            backgroundColorOn={c.primary}
                                            backgroundColorOff={c.pink}
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

                            <Pressable onPress={() => navigation.navigate("NewMemberNotify")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('NewUserNotification')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", marginBottom: "4%" }}>
                                <Text style={styles.title}>{t('changepassword')}</Text>
                            </View>

                            <Pressable onPress={() => navigation.navigate("ChangePassword")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('changepassword')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", marginBottom: "4%" }}>
                                <Text style={styles.title}>{t('Security')}</Text>
                            </View>

                            <View style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('2FA')}</Text>
                                    </View>

                                    <View style={{ width: "15%" }}>
                                        <SwitchToggle
                                            switchOn={tfaStatus}
                                            onPress={handleTFAUpdate}
                                            circleColorOff='#911687'
                                            circleColorOn="#911687"
                                            backgroundColorOn={c.primary}
                                            backgroundColorOff={c.pink}
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

                            <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", marginBottom: "4%" }}>
                                <Text style={styles.title}>{t('Language')}</Text>
                            </View>
                            <Pressable onPress={() => navigation.navigate("ChangeLanguage")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('ChangeLanguage')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>


                            <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", marginBottom: "4%" }}>
                                <Text style={styles.title}>{t('Support')}</Text>
                            </View>

                            {/* <Pressable onPress={() => navigation.navigate("CmsPage", { name: t('AboutMeetwave') })} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('About_Meetwave')}</Text>
                                    </View>
                                    {Images.forward}

                                </View>
                            </Pressable> */}

                            {/* <Pressable onPress={() => navigation.navigate("Teamacondition", { name: t('about') })} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('About_Meetwave')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("HelpPage")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Get_Help')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>

                            </Pressable> */}

                            <Pressable onPress={() => navigation.navigate("Teamacondition", { name: t('guidelines') })} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('meetwave_guidelines')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("FaqPage")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Get_Faq')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>

                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("RequestHobby")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Feedback/Request_Hobby')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>

                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("Teamacondition", { name: t('PrivacyPolicy') })} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Privacy_Policy')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("Teamacondition", { name: t('Teama') })} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Terms_and_Condition')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>
                            </Pressable>

                            {/* <Pressable onPress={() => navigation.navigate("FeedBack")} style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Give_Feedback')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>

                            </Pressable>
                            <View style={styles.boxbtn}>
                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Rate_Meetwave')}</Text>
                                    </View>
                                </View>

                            </View> */}

                            {profile?.transferAction == "change" ?
                                <Pressable
                                    onPress={() => navigation.navigate("EmailAgree", { emailType: "cancel" })}
                                    style={styles.boxbtn}>
                                    <View style={styles.innerbtn}>
                                        <View style={{ alignItems: "center" }}>
                                            <Text style={styles.subtitle}>{t('Cancel_email_change')}</Text>
                                        </View>
                                        {Images.forward}
                                    </View>
                                </Pressable>

                                :

                                <Pressable
                                    onPress={() => navigation.navigate("EmailAgree", { name: "Email changes", emailType: "change" })}
                                    style={styles.boxbtn}>
                                    <View style={styles.innerbtn}>
                                        <View style={{ alignItems: "center" }}>
                                            <Text style={styles.subtitle}>{t('request_email_change')}</Text>
                                        </View>
                                        {Images.forward}
                                    </View>
                                </Pressable>
                            }

                            <Pressable
                                onPress={() => navigation.navigate("CmsPage", { name: "Delete Account" })}
                                style={styles.boxbtn}>

                                <View style={styles.innerbtn}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.subtitle}>{t('Delete_Acc')?.length > 35 ? t('Delete_Acc')?.slice(0, 35) + "..." : t('Delete_Acc')}</Text>
                                    </View>
                                    {Images.forward}
                                </View>

                            </Pressable>

                            <View style={{ alignItems: "center", justifyContent: "center", marginTop: "5%" }}>

                                <Pressable
                                    onPress={() => !apiCalled && logoutfn()}
                                    style={{
                                        width: "40%",
                                        borderRadius: borderradius * 1.5,
                                        backgroundColor: c.black,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderColor: c.white,
                                        padding: "2%",
                                        alignSelf: "center",

                                    }}>
                                    {apiCalled ?
                                        <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                        :
                                        <Text style={{ color: c.white, fontSize: RFValue(20), fontFamily: Fonts.Bold }}>{t('Logout')}</Text>
                                    }
                                </Pressable>
                                {/* <View style={{ marginTop: "4%" }}>
                                    <Text style={styles.bottomtxt}>Meetwave v.2021.1.1 (00001)</Text>
                                    <Text style={styles.bottomtxt}>Meetwave LLC</Text>
                                </View> */}
                            </View>
                        </View>

                    </ScrollView>

                </View>
            </LinearGradient>

        </View>
    )
}

export default SettingPage

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
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(22),
    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(16),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "8%",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: "6%",

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
    line: {
        width: "100%",
        borderWidth: 0.2,
        borderColor: "#DEDEDE",
        marginTop: "4%"
    },
    switchtxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(16),
    },
    subheading: {
        width: "90%",
        alignSelf: "center",
        marginTop: "1.5%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    boxbtn: {
        width: "100%", height: deviceheight * 0.0550, borderColor: "#DEDEDE", borderWidth: 0, alignItems: "center", justifyContent: "center",
    },
    innerbtn: {
        width: "90%", flexDirection: "row", justifyContent: "space-between", alignSelf: "center", alignItems: "center",
    },
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(12),
        textAlign: "center"
    },
    selectedTrack: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 1

    },
    unselectedTrack: {
        backgroundColor: '#E8E6EA',
        borderRadius: borderradius * 1
    },
    track: {
        height: 7,
    },
});
