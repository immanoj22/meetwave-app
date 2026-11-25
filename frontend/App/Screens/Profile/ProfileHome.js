import { View, Text, StyleSheet, Pressable, ScrollView, Image, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import SwitchToggle from "react-native-switch-toggle";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_hideinterest, update_hideprofiledetails, update_hobbiepath, update_NetworkVisible, update_persondetailpath, update_statusbarcolor } from '../../Slices/helper';
import { HideEventsInprofile, UserEditAccount } from '../../Actions/hooks';
import { Imageroute } from '../../Actions/constant';
import { GetItem } from '../../Actions/localstorage';
import profile, { Fetchprofile, profileSelector } from '../../Slices/profile';
import { randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';

const ProfileHome = (props) => {
    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [group, setGroup] = useState(false)
    const [interest, setInterest] = useState(true)
    const [profileShow, setProfileShow] = useState(true)
    const { profile } = useSelector(profileSelector)
    const [prfileData, setProfileData] = useState({})
    const userID = GetItem("UserId")
    const { isOnline, hobbieList } = useSelector(helperSelector)
    const [profileSts, setProfileSts] = useState(false);

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


    const handleprofilelist = async () => {
        try {
            setProfileData({ ...profile, "Groupcounts": profile.Groupcounts })
        }
        catch (err) {
            console.log("Error on handleprofilelist: ", err);
        }
    }
    useEffect(() => {
        if (profile) {
            setGroup(profile?.ishideevent);
            setInterest(profile?.ishidehobbies);
            setProfileShow(profile?.ishideprofile);
            setProfileSts(profile?.privacy_status != "public")
            dispatch(update_hideinterest({ interest: profile?.ishidehobbies }))
            dispatch(update_hideprofiledetails({ group: profile?.ishideevent }))
            handleprofilelist()
        }
    }, [profile])


    const handleEditProfile = async () => {
        try {
            if (profile) {
                // navigation.push("PersonDetails")
                navigation.navigate("PersonDetails")
                dispatch(update_persondetailpath("edit"))
            }
        }
        catch (err) {
        }

    }


    const handleHobbieEdit = async () => {
        try {

            if (!isOnline && hobbieList?.length > 0) {
                dispatch(update_hobbiepath("edit"))
                navigation.navigate("SelectInterest")
            }
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (profile) {
                dispatch(update_hobbiepath("edit"))
                navigation.navigate("SelectInterest")
            }

        }
        catch (err) {
        }

    }


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
                ShowToast(result?.message)
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
                ShowToast(payload.privacy_status ? t('You_are_now_using_a_private/public_account') : t('You_are_now_using_a_private/public_account'))
                dispatch(Fetchprofile(userID))
            }
            else {
                ShowToast(result?.message)
            }


        } catch (error) {
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                navigation.goBack()
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction
            );

            return () => backHandler.remove();
        }, [])
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                style={{ width: "100%", height: "100%" }}
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                colors={['#F8BE2D', '#901487']}>

                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <Pressable
                            onPress={() => {

                                if (profile) {

                                    navigation.navigate("ProfileDetail");

                                } else {

                                    navigation.goBack();

                                }
                            }}

                            style={styles.roundbox}>
                            {Images.back}
                        </Pressable>
                    </View>

                    <View style={{ width: "100%", height: "92%", }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: "8%" }}>
                                <View style={{ alignSelf: "center", }}>

                                    <View style={styles.avatorbox}>

                                        {prfileData?.profile !== "" ?

                                            <Image
                                                style={{ width: "100%", height: "99%", borderRadius: borderradius * 1 }}
                                                source={{ uri: `${Imageroute.PersonalProfile}` + `${prfileData?.profile}` }}
                                            //resizeMode='cover' 
                                            />

                                            :

                                            <Image
                                                style={{ width: devicewidth * 0.270, height: devicewidth * 0.270, borderRadius: borderradius * 1 }}
                                                source={randomimages[prfileData?.randomIndex]}
                                                resizeMode="cover" />
                                        }

                                    </View>

                                </View>
                                <View style={{ alignSelf: "center", marginTop: "3%", justifyContent: "center" }}>
                                    <Text style={styles.nametxt}>{t('Profile_Settings')}</Text>
                                </View>

                                {/* <View style={{ width: "90%", alignSelf: "center", marginTop: "8%", }}>
                                    <Text style={styles.title}>{t('About_me')}</Text>
                                </View> */}

                                <Pressable onPress={handleEditProfile} style={[styles.innerbox, { marginTop: "10%" }]}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        {/* {Images.account} */}
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('Personal_Details')}</Text>
                                        </View>
                                    </View>

                                    <View >
                                        {Images.forward}

                                    </View>
                                </Pressable>
                                <Pressable onPress={handleHobbieEdit} style={[styles.innerbox, { marginTop: "4%" }]}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        {/* <Image style={{ width: devicewidth * 0.06, height: devicewidth * 0.06, marginRight: -3 }} source={Images.HobbiesIcon} /> */}
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('MyHobbies')}</Text>
                                            <Text style={styles.activitysubtxt}>{t('select_hobbies_sub_msg')}</Text>
                                        </View>

                                    </View>
                                    <View>
                                        {Images.forward}
                                    </View>
                                </Pressable>


                                {/* <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", }}>
                                    <Text style={styles.title}>{t('Friends')}</Text>
                                </View> */}
                                <View style={styles.line}>
                                </View>

                                <Pressable
                                    onPress={() => navigation.navigate("MyActivites")}
                                    style={[styles.innerbox, { marginTop: "4%" }]}>

                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        {/* {Images.add} */}
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('Book_Mark')}</Text>
                                        </View>

                                    </View>
                                    {Images.forward}
                                </Pressable>

                                {/* <Pressable
                                    onPress={() => navigation.navigate("MyPeople")}

                                    style={[styles.innerbox, { marginTop: "4%" }]}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        {Images.friends}
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('My_Friends')}</Text>
                                        </View>

                                    </View>
                                    {Images.forward}
                                </Pressable> */}

                                <Pressable
                                    onPress={() => navigation.navigate("Privacypage")}
                                    style={[styles.innerbox, { marginTop: "4%" }]}>

                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('Privacy')}</Text>
                                            <Text style={styles.activitysubtxt}>{t('privacy_Control')}</Text></View>
                                    </View>
                                    {Images.forward}
                                </Pressable>

                                <Pressable
                                    onPress={() => navigation.navigate("Premium")}
                                    style={[styles.innerbox, { marginTop: "4%" }]}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        {/* {Images.plan} */}
                                        <View style={{ width: devicewidth * 0.5, paddingHorizontal: "0%" }}>
                                            <Text style={styles.subtitle}>{t('Plan')}</Text>
                                            <Text style={styles.activitysubtxt}>{t('Upgrade_plan_features')}</Text>
                                        </View>

                                    </View>

                                    {Images.forward}
                                    {/* <View >
                                        <Text style={styles.premiumtxt}>{t('Free')}</Text>
                                    </View> */}
                                </Pressable>

                                {/* <View style={{ flexDirection: "row", width: "90%", justifyContent: "space-between", alignSelf: "center", marginTop: "5%" }}>
                                    <View style={{ width: "85%", }}>
                                        <Text style={{
                                            fontFamily: Fonts.Bold,
                                            color: c.white,
                                            fontSize: RFValue(16),
                                        }}>{t('You_want_your_account_to_be_private')}</Text>

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
                                </View> */}



                            </View>
                        </ScrollView>
                    </View>

                </View>
            </LinearGradient>

        </View>
    )
}

export default ProfileHome

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
        fontSize: RFValue(20),


    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(17),

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
    avatorbox: {
        width: devicewidth * 0.30,
        height: devicewidth * 0.30,
        borderRadius: devicewidth * 0.15,
        //  backgroundColor: c.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#fff",
        borderWidth: 2,
        overflow: 'hidden'
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
        fontSize: RFValue(20),
    },
    connectxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(15),
    },
    countrytxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        textAlign: "center"
    },
    dotstyle: {
        width: devicewidth * 0.0180,
        borderWidth: 0.5,
        borderColor: "#fff",
        height: deviceheight * 0.0100,
        borderRadius: borderradius * 0.4,
        backgroundColor: "#fff",
        alignSelf: "center",
        marginLeft: "2%"
    },
    changebtn: {
        width: "28%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.secondary,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        padding: "1.5%",
        marginLeft: "4%"
    },

    innerbox: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        alignItems: "center",
        padding: "1%",

    },
    tickbox: {
        width: devicewidth * 0.0550,
        height: devicewidth * 0.0550,
        borderRadius: borderradius * 2,
        backgroundColor: c.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    premiumtxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(15),
    },
    edittxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(15),
        textDecorationLine: "underline"
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    activitysubtxt: {
        fontSize: RFValue(11),
        fontFamily: Fonts.Regular,
        color: "#DEDEDE",
        width: "90%"

    },
    organizerbtn: {
        width: '10%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0360,
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",


    },
    lasttxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(14),
        marginLeft: "3%",
        textAlign: "center"
    }


});
