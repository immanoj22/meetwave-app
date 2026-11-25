import { View, Text, StyleSheet, TextInput, Pressable, StatusBar, Keyboard, KeyboardAvoidingView } from 'react-native';
import React, { useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { GetItem } from '../../Actions/localstorage';
import { ChangeEmailTransfer } from '../../Actions/hooks';
import { profileSelector } from '../../Slices/profile';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Commonheader from '../../Navigation/commonheader';

const NewEmail = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const userEmail = GetItem("UserEmail")
    const [email, setEmail] = useState("")
    const { profile } = useSelector(profileSelector);

    const handleNewEmailVerify = async () => {
        try {

            if (!email) return;

            let payload = {
                userId: userID ? userID : profile?._id,
                email: userEmail ? userEmail : profile?.email,
                alternativeEmail: email
            }
            const result = await ChangeEmailTransfer(payload)
            if (result?.status) {
                ShowToast(result?.message)
                // navigation.push("Otp", { type: "NewEmailTrans", email: email })
                navigation.navigate("Otp", { type: "NewEmailTrans", email: email })
            } else {
                ShowToast(result?.message)
            }

        } catch (error) {
        }
    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Commonheader
                    title={t('email_change')}
                    onback={handleBack}

                />
                <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>
                    <View>
                        <Text style={styles.title}>{t('Create_New_Email')}</Text>
                    </View>
                    <View style={{ width: "90%", alignSelf: "center", marginTop: "5%" }}>
                        <View style={{ flexDirection: "row", marginBottom: "2%" }}>
                            <Text style={styles.inputpara}>{t('Email')}</Text>
                            {Images.star}
                        </View>
                        <View style={styles.inputcontainer}>
                            <TextInput
                                value={email}
                                placeholderTextColor={"#F7E5D0"}
                                //placeholder={t('EnterNewEmail')}
                                style={styles.inputtxtstyle}
                                keyboardType="email-address"
                                onChangeText={setEmail}
                            />
                        </View>

                    </View>
                    <View style={{ width: "100%", marginTop: "6%" }}>

                        <Pressable
                            onPress={() => email && handleNewEmailVerify()}
                            style={{
                                width: "auto",
                                borderRadius: borderradius * 1.5,
                                backgroundColor: c.white,
                                alignItems: "center",
                                justifyContent: "center",
                                borderColor: c.white,
                                paddingVertical: "3%",
                                paddingHorizontal: "7%",
                                alignSelf: "center",
                                marginTop: "4%"

                            }}>
                            <Text style={{ color: c.black, fontSize: RFValue(14), fontFamily: Fonts.Bold }}>{t('Confirm_email_change')}</Text>
                        </Pressable>

                    </View>

                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

export default NewEmail;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: deviceheight * 0.88,
        justifyContent: "center",
        alignItems: "center",

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
        textAlign: "center"
    },
    title: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(17),
        textAlign: "center"
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
        fontSize: RFValue(14),
        fontFamily: Fonts.Light,
        color: c.white,
        letterSpacing: 0.3,
        textAlign: "justify"
    },
    checkboxtxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(13),
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
    subtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(13),
        textAlign: "center"
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),

    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%",
    },
});
