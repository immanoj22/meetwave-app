import OTPTextInput from 'react-native-otp-textinput';
import { Fonts, Fontsize } from '../../../Utilities/fonts';
import { borderradius, deviceheight, devicewidth } from '../../../Utilities/Dimensions';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Pressable, ActivityIndicator, ScrollView, Keyboard } from "react-native";
import React, { useRef, useState } from 'react';
import { c } from '../../../Utilities/colors';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { t } from 'i18next';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { GetItem } from '../../../Actions/localstorage';
import { showwarningmessage } from '../../../Actions/config';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Button from '../../../Components/button';
import { ResendOtpVerify, VerifyOTP } from '../../../Actions/hooks';
import Commonheader from '../../../Navigation/commonheader';

const VerificationOTP = (props) => {

    const [otp, setOtp] = useState("")
    const otpInput = useRef("");
    const userID = GetItem("UserId")
    const userEmail = GetItem("UserEmail")
    const route = useRoute();
    const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [timerFinished, setTimerFinished] = useState(true)
    const [userMail, setUserMail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const { email } = route?.params || {};

    useFocusEffect(
        React.useCallback(() => {
            setUserMail(GetItem("UserEmail"))
            setUserMail(email)
            return (() => {
                setOtp(['', '', '', '']);
            })

        }, [])
    )

    const handleOtpChange = (otp) => {
        setOtp(otp)
    };

    const handlePaste = async () => {
        const otp = await Clipboard.getString();
        if (otp && otp.length === 6) { // Assuming OTP length is 4
            otpInput.current.setValue(otp);
            Clipboard.setString(''); // Reset/clear clipboard
        }

    };

    const handleResendOtp = async () => {
        try {

            var payload = {
                "email": userMail ? userMail : GetItem("UserEmail"),
            }
            const result = await ResendOtpVerify(payload)
            setOtp(["", "", "", ""])
            setLoading(true)

            if (result?.status) {
                showwarningmessage(t('OTP_value_is_required'));
                setTimerFinished(false); //otp timer loop
                setLoading(false)
            }
            else {
                showwarningmessage(result?.message);
                setLoading(false)
            }
        }
        catch {
            showwarningmessage(t('Failed_resendOTP'));
            setLoading(false)
        }
    }


    const handleVerifyOtp = async () => {

        if (otp === '') {
            showwarningmessage(t('OTP_value_is_required'));t
        }
        else if (otp.length < 4) {
            showwarningmessage(t('Please-4-digitOTP'));
        }
        else {
            var payload = {
                "email": userMail ? userMail : GetItem("UserEmail"),
                "OTP": otp
            }
            const result = await VerifyOTP(payload)
            if (result?.status) {
                navigation.navigate("ChangePassword", { type: "Forgot", email: userMail })
                showwarningmessage(result?.message);
                setLoading(false)
            }
            else {
                showwarningmessage(result?.message);
                setLoading(false)
            }
        }

    }

    const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);
        

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>

                <LinearGradient style={{ width: "100%", height: "100%", }} start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={['#F8BE2D', '#901487']}>

                    <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>

                        <Commonheader
                            istitle={false}
                            onback={handleBack}
                        />

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ height: "100%", alignSelf: 'center', justifyContent: 'center', marginTop: 40 }}>
                                <View style={{ alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.title}>{t('Verification_Code')}</Text>
                                    <View style={{ width: "100%", alignSelf: "center", marginTop: "1%", alignItems: 'center' }}>
                                        <Text style={styles.subtitle}>{t('Enter_4_digit_Code')}</Text>
                                        <Text style={styles.emailtitle}>{userMail =="" ? userMail : GetItem("UserEmail")}</Text>
                                    </View>
                                </View>
                                <View style={{ width: "60%", alignSelf: "center", }} >

                                    <OTPTextInput
                                        ref={otpInput}
                                        defaultValue={otpInput.current}
                                        handleTextChange={handleOtpChange}
                                        autoFocus
                                        onFocus={handlePaste}
                                        inputCount={4}
                                        tintColor={c.white}
                                        containerStyle={{ width: "100%", alignSelf: "center" }}
                                        textInputStyle={{ width: devicewidth * 0.15, height: deviceheight * 0.0660, backgroundColor: "transparent", borderWidth: 0.5, bordercolor: "#6D40FF", borderRadius: 5, color: c.white, fontSize: RFValue(14), fontFamily: Fonts.Regular }}
                                    />

                                    <View style={{ alignItems: "center", justifyContent: "center", marginTop: "8%", flexDirection: "row",alignItems:'center',alignContent:'center',minHeight:98 }}>
                                        <Text style={styles.bottomtxt}>{t('Did_get_code')}?</Text>
                                        {timerFinished ? (
                                            <Pressable style={{ marginLeft: "2%", paddingVertical: 3 }} onPress={() => handleResendOtp()}>
                                                <Text style={styles.signintxt}>{t('Resend_it')}</Text>
                                            </Pressable>
                                        ) :

                                            (

                                                <View style={{ marginLeft: "2%", marginVertical: "8%" }}>

                                                    <CountdownCircleTimer
                                                        isPlaying
                                                        duration={300} // 60 seconds
                                                        size={55}
                                                        strokeWidth={4}
                                                        colors={c.primary}
                                                        onComplete={() => setTimerFinished(true)}>
                                                        {({ remainingTime }) => (
                                                            <Text style={{ color: c.white, fontSize: RFValue(14), fontFamily: Fonts.Regular }}>{remainingTime}s</Text>
                                                        )}
                                                    </CountdownCircleTimer>
                                                </View>
                                            )}

                                    </View>

                                </View>

                            </View>
                        </ScrollView>
                        <View style={{ width: '90%', position: 'absolute', bottom: '7%', alignSelf: 'center', height: deviceheight * 0.08, justifyContent: "center" }}>
                            {loading ?

                                <Pressable style={{
                                    width: "50%",
                                    borderRadius: borderradius * 1.5,
                                    backgroundColor: c.white,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderColor: c.white,
                                    padding: "2%",
                                    alignSelf: "center",
                                }}>
                                    <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                                </Pressable>
                                :
                                <Button onpress={() => handleVerifyOtp()} title={'Verify'} />

                            }
                        </View>
                    </View>
                </LinearGradient>

            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default VerificationOTP;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backcontainer: {
        width: "100%",
        paddingTop: "6.2%",
        height: "15%"
    },
    boxcontainer: {
        width: "100%",
        height: "100%",
        alignItems: "center",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center"
    },
    signintxt: {
        fontFamily: Fonts.Bold,
        color: c.primary,
        fontSize: RFValue(14),
        marginLeft: "2%",
        shadowOpacity: 0.1,
    },
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        shadowOpacity: 0.1,
        fontSize: RFValue(14),
    },
    title: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(30),
        textAlign: "center"
    },
    subtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "70%",
        fontSize: RFValue(15),
        textAlign: "center"
    },
    emailtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(18),
        textAlign: "center",
        marginTop: "3%"
    },
})
