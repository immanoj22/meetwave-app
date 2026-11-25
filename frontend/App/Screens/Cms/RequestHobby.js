import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { GetItem } from "../../Actions/localstorage";
import LinearGradient from "react-native-linear-gradient";
import Commonheader from "../../Navigation/commonheader";
import { borderradius, deviceheight } from "../../Utilities/Dimensions";
import { c } from "../../Utilities/colors";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../Utilities/fonts";
import React, { useState } from "react";
import { showwarningmessage } from "../../Actions/config";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_NetworkVisible } from "../../Slices/helper";
import { callRequestHobby } from "../../Actions/hooks";

const RequestHobby = (props) => {

    const { t } = useTranslation();
    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const [desc, setDesc] = useState("")
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false);
    const { isOnline } = useSelector(helperSelector)

    const handlefeedback = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (loading) return;

            setLoading(true);

            if (desc == "") {
                showwarningmessage(t('feedback_Required'))
                return
            }

            var payload = {
                userId: userID,
                hobbyfeedback: desc,
            }
            Keyboard.dismiss()

            const result = await callRequestHobby(payload)

            console.log("GET-Result ==>",result)

            if (result?.status) {
                setDesc("")
                showwarningmessage(result?.message);
               // navigation.navigate("SettingPage")
            }
            else {
                showwarningmessage(result?.message);
            }

        }
        catch (err) {
        }
        finally {
            setLoading(false);
        }
    }

    const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);

    return (
        <View styles={styles.container}>
            <LinearGradient style={styles.linerContainer} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    
                    <Commonheader
                        title={t('Feedback/Request_Hobby')}
                        onback={handleBack}
                    />

                    <View style={{width:"90%",alignSelf:"center",marginTop:"10%"}}>

                        <Text style={styles.inputpara}>{t('feedback')}</Text>

                        <View style={styles.recContainer}>

                            <TextInput
                                placeholderTextColor={"#F7E5D0"}
                                style={styles.inputtxtstyle}
                                value={desc}
                                onChangeText={setDesc}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top" />
                        </View>

                        <Pressable
                            style={styles.btnSubmit}
                            onPress={handlefeedback}>
                            <Text style={styles.savetxt}>{t('Submit')}</Text>
                        </Pressable>

                    </View>
                </View>

            </LinearGradient>
        </View>
    )

}

export default RequestHobby

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    linerContainer: {
        width: "100%",
        height: "100%"
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    recContainer: {

        width: "100%",
        alignItems: "center",
        height: deviceheight * 0.250,
        paddingHorizontal: "3%",
        paddingVertical: "4%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        marginTop:"3%"
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%"
    },
    btnSubmit: {
        padding: "2.5%",
        backgroundColor: c.secondary,
        width: "40%",
        borderRadius: borderradius * 0.6,
        alignItems: "center",
        alignSelf:"center",
        justifyContent: "center",
        marginTop:"6%"
    },
    inputpara: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },
  savetxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(15),
  },
})