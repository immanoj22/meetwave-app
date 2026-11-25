import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { GetItem, SetItem } from "../../Actions/localstorage";
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../Utilities/fonts";
import { Images } from "../../Utilities/images";
import { c } from "../../Utilities/colors";
import { borderradius, deviceheight, devicewidth } from "../../Utilities/Dimensions";
import LinearGradient from "react-native-linear-gradient";
import React, { useState } from "react";
import Eyeicon from 'react-native-vector-icons/Ionicons'
import { ScrollView } from "react-native-gesture-handler";
import Button from "../../Components/button";
import { showwarningmessage } from "../../Actions/config";
import { ChangePassApi, ForgotPassword } from "../../Actions/hooks";
import Commonheader from "../../Navigation/commonheader";

const ChangePassword = (props) => {

    const { t } = useTranslation();
    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const userEmail = GetItem("UserEmail")
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);

    const [oldPass, setOldPass] = useState(true);
    const [pass, setPass] = useState(true);
    const [cpass, setCPass] = useState(true);
    const route = useRoute();
    const { type, email } = route?.params || {};
  
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~])[A-Za-z\d!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~]{8,}$/;
    const passwordValidation = passwordRegex.test(password);

    const handleForgotPass = async () => {

        if (!password) {
            showwarningmessage(t('NewPassword_is_required'));
        }
        else if (!passwordValidation) {
            showwarningmessage(t('Password_should_be_at_least_8_characters'));
        }
        else if (!confirmPass) {
            showwarningmessage(t('ConfirmPassword_is_required'));
        }
        else if (confirmPass !== password) {
            showwarningmessage(t('ConfirmPassword_not_match_password'));
        } else {

            var payload = {
                "email": email,
                "newpassword": password,
                "confirmpassword": confirmPass
            }

            setLoading(true)
            result = await ForgotPassword(payload)

            if (result.status) {
                setLoading(false)
                setPassword("")
                setConfirmPass("")
                navigation.navigate("Login")
            } else {
                setLoading(false)
                showwarningmessage(t('Error'), result?.message)
            }



        }
    }

    const handleChangePass = async () => {

        //const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~])[A-Za-z\d!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~]{8,}$/;
        const passwordValidation = passwordRegex.test(password);

        if (!oldPassword) {
            showwarningmessage(t('OldPassword_is_required'));
        }
        else if (!password) {
            showwarningmessage(t('NewPassword_is_required'));
        }
        else if (!passwordValidation) {
            showwarningmessage(t('Password_should_be_at_least_8_characters'));
        }
        else if (!confirmPass) {
            showwarningmessage(t('ConfirmPassword_is_required'));
        }
        else if (confirmPass !== password) {
            showwarningmessage(t('ConfirmPassword_not_match_password'));
        } else {

            var payload = {

                "email": userEmail,
                "oldpassword": oldPassword,
                "newpassword": password,
                "confirmpassword": confirmPass

            }

            setLoading(true)
            result = await ChangePassApi(payload)
            if (result.status) {
                setLoading(false)
                setOldPassword("")
                setPassword("")
                setConfirmPass("")
                showwarningmessage(result?.message)
            } else {
                setLoading(false)
                showwarningmessage(t('Error'), result?.message)
            }

        }

    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                enabled>
                <LinearGradient style={{ width: "100%", height: "100%", }} start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={['#F8BE2D', '#901487']}>
                    <View style={styles.boxcontainer}>

                        <Commonheader
                            title={t('changepassword')}
                            onback={handleBack}
                        />

                        <ScrollView
                            style={{ flex: 0.7 }}
                            contentContainerStyle={{ paddingBottom: deviceheight * 0.08 }}
                            keyboardShouldPersistTaps="handled"
                            scrollIndicatorInsets={false}>
                            <View style={{ width: "90%", alignSelf: "center", }}>

                                {type == "Forgot" ? "" :
                                    <>
                                        <Text style={styles.txtPassw}>{t('oldPassword')}</Text>
                                        <View style={styles.inputcontainerPass}>
                                            <TextInput
                                                value={oldPassword}
                                                onChangeText={setOldPassword}
                                                style={styles.inputtxtstyle}
                                                keyboardType="default"
                                                secureTextEntry={oldPass} />

                                            <Pressable onPress={() => { setOldPass(!oldPass) }} style={{ width: "10%", alignItems: "center" }} >
                                                <Eyeicon name={!oldPass ? 'eye' : 'eye-off'} size={25} color={c.grey} />
                                            </Pressable>
                                        </View>
                                    </>
                                }

                                <Text style={styles.txtPassw}>{t('newPassword')}</Text>

                                <View style={styles.inputcontainerPass}>
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        style={styles.inputtxtstyle}
                                        keyboardType="default"
                                        secureTextEntry={pass} />

                                    <Pressable onPress={() => { setPass(!pass) }} style={{ width: "10%", alignItems: "center" }} >
                                        <Eyeicon name={!pass ? 'eye' : 'eye-off'} size={25} color={c.grey} />
                                    </Pressable>
                                </View>

                                <Text style={styles.txtPassw}>{t('confirmpassword')}</Text>

                                <View style={styles.inputcontainerPass}>

                                    <TextInput
                                        value={confirmPass}
                                        onChangeText={setConfirmPass}
                                        style={styles.inputtxtstyle}
                                        keyboardType="default"
                                        secureTextEntry={cpass} />

                                    <Pressable onPress={() => { setCPass(!cpass) }} style={{ width: "10%", alignItems: "center" }} >
                                        <Eyeicon name={!cpass ? 'eye' : 'eye-off'} size={25} color={c.grey} />
                                    </Pressable>

                                </View>

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
                                        marginTop: "5%"
                                    }}>

                                        <ActivityIndicator size="small" color={c.primary} />
                                    </Pressable> :
                                    <Button top={"8%"} onpress={() => type == "Forgot" ? handleForgotPass() : handleChangePass()} title={t('Submit')} />
                                }

                            </View>
                        </ScrollView>
                      

                    </View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </View>
    )

}

export default ChangePassword

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
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "8%",
        flexDirection: "row",
        alignItems: "center",
        flex: 0.2,
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
        alignSelf: "center",
        justifyContent: "center",
        verticalAlign: "middle"
    },
    txtPassw: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
        paddingBottom: 5,
        marginTop: 20,
        shadowOpacity: 0.1
    },
    inputcontainerPass: {
        width: "100%",
        height: deviceheight * 0.0600,
        paddingHorizontal: "7%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        shadowOpacity: 0.1,
        flexDirection: 'row',
    },
    inputtxtstyle: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%",
    },
    submitBtn: {
        fontFamily: Fonts.Bold,
        color: c.primary,
        fontSize: RFValue(14),
        marginLeft: "2%",
        shadowOpacity: 0.1,
        alignSelf: "center",
    },

})
