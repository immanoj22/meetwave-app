import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, StatusBar } from 'react-native';
import React, { useEffect, useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GetItem } from '../../Actions/localstorage';
import { UserEditAccount } from '../../Actions/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import SwitchToggle from 'react-native-switch-toggle';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useTranslation } from 'react-i18next';
import Commonheader from '../../Navigation/commonheader';

const ToggleAccount = (props) => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const userID = GetItem("UserId")
    const [profileSts, setProfileSts] = useState(false);
    const route = useRoute();
    const { data } = route?.params || {};

    useEffect(() => {
        setProfileSts(data != "public")
    }, [data])

    const dispatch = useDispatch()


    const { profile } = useSelector(profileSelector);
    const { isOnline } = useSelector(helperSelector);


    const handleProfileStatus = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            setProfileSts(!profileSts);

            let payload = {
                userId: userID,
                privacy_status: profile?.privacy_status == "public" ? true : false
            }

            const result = await UserEditAccount(payload);

            if (result?.status) {
                ShowToast(payload.privacy_status ? t('You_are_now_a_Private_account') : t('You_are_now_a_Public_account'))
                dispatch(Fetchprofile(userID))
                navigation.navigate("ProfileHome")
            }
            else {
                ShowToast(result?.message)
            }


        } catch (error) {
        }
    }

      const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Commonheader
                    title={t('Profile_Status')}
                    onback={handleBack}
                />
                <View style={styles.boxcontainer}>


                    <View style={{ width: "100%", height: deviceheight * 0.88, }}>
                        <View style={{ flexDirection: "row", width: "90%", justifyContent: "space-between", alignSelf: "center", }}>
                            <View>
                                <Text style={{
                                    fontFamily: Fonts.Bold,
                                    color: c.white,
                                    fontSize: RFValue(16),
                                }}>{t('Your_account_is')} {profile?.privacy_status == "public" ? t('Public') : t('Private')}</Text>
                            </View>
                            <View style={{ width: "15%", }}>
                                <SwitchToggle
                                    switchOn={profileSts}
                                    onPress={() => {
                                        handleProfileStatus()
                                    }}
                                    circleColorOff='#911687'
                                    circleColorOn="#911687"
                                    backgroundColorOn={c.pink}
                                    backgroundColorOff={c.white}
                                    containerStyle={{
                                        width: devicewidth * 0.16,
                                        height: devicewidth * 0.076,
                                        borderRadius: 100,
                                        padding: devicewidth * 0.01,

                                    }}
                                    circleStyle={{ width: devicewidth * 0.065, height: devicewidth * 0.065, borderRadius: 100 }}
                                />
                            </View>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: "8%" }}>
                                <View style={{ width: "90%", alignSelf: "center", marginTop: "4%", }}>
                                    <Text style={styles.paratxt}>Lorem Ipsum is simply dummy text of the printing and typesetting to
                                        industry. Lorem Ipsum has been the industry's standard dummy here
                                        text ever since the 1500s, when an unknown printer took a galley it’s
                                        of type and scrambled it to make a type specimen book. It has been
                                        survived not only five centuries, but also the leap into electronic and
                                        typesetting, remaining essentially unchanged. It was popularised it’s
                                        in the 1960s with the release of Letraset sheets containing Lorem it’s
                                        Ipsum passages, and more recently with desktop publishing software
                                        like Aldus PageMaker including versions of Lorem Ipsum.</Text>

                                </View>
                            </View>
                        </ScrollView>

                    </View>

                </View>
            </LinearGradient>
        </View>
    );
}

export default ToggleAccount;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: devicewidth,
        height: deviceheight
    },
    nametxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(17),
    },
    subtxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(12),
    },
    backcontainer: {
        width: "100%",
        alignSelf: "center",
        height: deviceheight * 0.120,
        flexDirection: "row",
        alignItems: "center",
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
    },
    title: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },
    heading: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(26),
        width: "90%",
        marginTop: "2%"
    },
    imageContainer: {
        width: "95%",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginTop: "5%",
        gap: 10
    },
    imageWrapper: {
        position: 'relative'
    },
    addbox: {
        position: 'absolute',
        bottom: "3%",
        right: 0,
        backgroundColor: c.secondary,
        borderRadius: borderradius * 2,
        alignItems: "center",
        justifyContent: "center",
        width: devicewidth * 0.0630,
        height: devicewidth * 0.0630,
    },
    dashbox: {
        width: devicewidth * 0.170,
        height: devicewidth * 0.170,
        borderRadius: borderradius * 1.7,
        borderColor: c.white,
        borderWidth: 3.8,
        borderStyle: 'dashed',
        alignItems: "center",
        justifyContent: "center",

    },
    paratxt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Regular,
        color: c.white,
        letterSpacing: 0.3,
        textAlign: "justify"
    },
    checkboxtxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(14),
    },
    checkbox: {
        width: 27,
        height: 27,
        borderWidth: 1.3,
        borderColor: c.primary,
        borderRadius: 4,
        marginRight: "2.5%",
    },
    checkboxChecked: {
        alignItems: "center",
        justifyContent: "center"
    },
});
