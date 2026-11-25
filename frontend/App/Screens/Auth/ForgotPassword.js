import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { c } from "../../Utilities/colors";
import { Fonts } from "../../Utilities/fonts";
import LinearGradient from "react-native-linear-gradient";
import { borderradius, deviceheight } from "../../Utilities/Dimensions";
import Button from "../../Components/button";
import { showwarningmessage } from "../../Actions/config";
import { SendOTPApi } from "../../Actions/hooks";

const ForgotPassword = () => {

    const navigation = useNavigation();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false)

    const handleChangeText = (text) => {
        // Update state with trimmed and lowercased text
        setEmail(text.toLowerCase().trim());
    };

    const handleForgotRequest = async () => {
        setModalVisible(!modalVisible);

        try {

            if (!email) {
                showwarningmessage(t('Please_enter_your_email.'))
            }
            else if (!/^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
                showwarningmessage(t('PleaseEnter_valid-email'));

            } else {

                var payload = {
                    "email": email
                }

                setLoading(true)
                const result = await SendOTPApi(payload)

                if (result.status) {
                    setLoading(false)
                    navigation.navigate("VerificationOTP", { email: email })
                } else {
                    setLoading(false)
                    showwarningmessage(t('Error'), result?.message)
                }
            }

        } catch (err) {
            setLoading(false)
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
                <LinearGradient style={{ width: "100%", height: "100%", }} start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={['#F8BE2D', '#901487']}>

                    <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>
                        <View>
                            <Text style={styles.title}>{t('forgot_Password')}</Text>
                        </View>
                        <View style={{ width: "90%", alignSelf: "center", marginTop: "15%" }}>
                            <View style={{ flexDirection: "row", marginBottom: "2%" }}>
                                <Text style={styles.inputpara}>{t('Email')}</Text>
                            </View>
                            <View style={styles.inputcontainer}>

                                <TextInput
                                    placeholderTextColor={"#F7E5D0"}
                                    value={email}
                                    onChangeText={handleChangeText}
                                    style={styles.inputtxtstyle}
                                    keyboardType="email-address"
                                />
                            </View>

                        </View>

                        <View>
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
                                    <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                                </Pressable> :
                                <Button top={"5%"} onpress={handleForgotRequest} title={t('Submit')} />
                            }
                        </View>

                    </View>

                    <Pressable
                        style={{ flex: 0.1, alignItems: "center", justifyContent: "center", width: "100%", shadowOpacity: 0.1 }}
                        onPress={() => navigation.navigate("Login")} >
                        <Text style={styles.signintxt}>{t('back_to_login')}</Text>
                        {/* <View style={styles.line}></View> */}
                    </Pressable>

                </LinearGradient>
            </KeyboardAvoidingView>


        </View>


    )
}
export default ForgotPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 0.9,
        width: "100%",
        justifyContent: "center",
    },
    title: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: "center",
        shadowOpacity: 0.1
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0600,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        shadowOpacity: 0.1
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
        paddingBottom: 5,
        shadowOpacity: 0.1
    },
    txtPassw: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
        paddingBottom: 5,
        marginTop: 10,
        shadowOpacity: 0.1
    },
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        shadowOpacity: 0.1
    },
    signintxt: {
        fontFamily: Fonts.Bold,
        color: c.primary,
        fontSize: RFValue(14),
        marginLeft: "2%",
        shadowOpacity: 0.1
    },
    line: {
        width: "15%",
        height: 1.5,
        backgroundColor: c.intermediate,
        marginTop: 1,
        alignContent: "center",
        justifyContent: "center",
        shadowOpacity: 0.1,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    inputtxtstyle: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%",
        //  backgroundColor:"blue"
    },

})