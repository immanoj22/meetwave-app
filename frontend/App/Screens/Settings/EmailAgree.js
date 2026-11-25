import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import React, { useEffect, useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { GetItem } from '../../Actions/localstorage';
import { GetCMSpages, TransferEmailCancel, UserEmailTransfrer } from '../../Actions/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useTranslation } from 'react-i18next';
import Commonheader from '../../Navigation/commonheader';
import RenderHTML from 'react-native-render-html';
import Loadercomponent from '../../Components/loadercomponent';

const EmailAgree = (props) => {
    const { emailType } = props?.route?.params || {};

    const { t } = useTranslation();


    const navigation = useNavigation();
    const [isChecked, setChecked] = useState(false);

    const userID = GetItem("UserId")
    const userEmail = GetItem("UserEmail")

    const route = useRoute();


    const { profile } = useSelector(profileSelector);
    const { isOnline } = useSelector(helperSelector)

    const [apiCalled, setApiCalled] = useState(false);
    const [cmsLoading, setCmsLoading] = useState(true);

    const dispatch = useDispatch()
    const [cmsListData, setCmsListData] = useState([]);

    const handleVerifyEMail = async () => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                userId: userID ? userID : profile?._id,
                email: userEmail ? userEmail : profile?.email,
            }

            setApiCalled(true);

            const result = await UserEmailTransfrer(payload);

            if (result?.status) {
                // navigation.push("Otp", { type: "EmailTrans", email: profile?.email })
                navigation.navigate("Otp", { type: "EmailTrans", email: profile?.email })

            }

        } catch (error) {
            console.log("Error on handleVerifyEmail: ", error);
        }
        finally {
            setApiCalled(false);
        }

    }

    const cancelEmail = () => {
        Alert.alert(t('Logout'), t('Are_you_sure_you_want_to_cancel_the_Email_Change_Request'), [
            {
                text: t('Cancel'),
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: t('OK'), onPress: () => cacelEmailREquest() },
        ]);
    }

    const cacelEmailREquest = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            let payload = {
                userId: profile?._id,
                email: profile?.email,
                transferAction: "cancel",
            }
            setApiCalled(true)
            const result = await TransferEmailCancel(payload);

            if (result?.status) {
                dispatch(Fetchprofile(profile?._id))
                ShowToast(result?.messager)
                navigation.goBack();
            }

        } catch (error) {
        }
        finally {
            setApiCalled(false);
        }
    }


    useEffect(() => {
        GetCMS();
    }, [props])

    const GetCMS = async () => {

        try {

            const result = await GetCMSpages()
            if (result?.status) {

                if (result?.data?.length > 0 && emailType == "change") {
                    const filtered = result?.data.filter(p => p.identifier === 'emailtransfer')

                    setCmsListData(filtered)
                }
                else if (result?.data?.length > 0 && emailType == "cancel") {
                    const filtered = result?.data.filter(p => p.identifier === 'emailtransfercancel')
                    setCmsListData(filtered)
                }
            }

        } catch (error) {
            console.log("Error on getFaqList: ", error);
        } finally {
            setCmsLoading(false);
        }

    }

    const stripHtmlTags = (html) => {
        return html.replace(/<[^>]+>/g, '');
    };

    const { width } = Dimensions.get('window');

    const tagsStyles = {
        p: { color: 'white', fontSize: RFValue(13), fontFamily: Fonts.Medium },
        b: { color: 'white', fontSize: RFValue(13), fontFamily: Fonts.Medium },
    };


    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <View style={{ flex: 1 }} >
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <Commonheader
                    title={emailType == "change" ? t('email_change') : t('cancel_email')}
                    onback={handleBack}
                />
                <Loadercomponent visible={cmsLoading} onClose={() => {}} />

                <View style={{ flex: 1 }} >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ marginBottom: "8%" }}>
                            <View style={{ width: "90%", alignSelf: "center", marginTop: "3%" }}>
                                {cmsListData[0]?.Content ?
                                    <RenderHTML contentWidth={width} baseStyle={styles.paratxt} tagsStyles={tagsStyles}
                                        source={{ html: cmsListData[0]?.Content }} /> : null}
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <View style={{ height: deviceheight * 0.2, alignItems: "center", justifyContent: "center" }} >
                    {emailType == "change" ?
                        <Pressable onPress={() => setChecked(!isChecked)} style={{ flexDirection: "row", alignItems: "center", width: "auto", alignSelf: "center", }}>
                            <View style={{ width: 25, height: 25, borderRadius: 5, borderWidth: 1, borderColor: c.primary, marginRight: "2.5%", justifyContent: "center", alignItems: "center" }} >
                                {isChecked ? <Icon name="check" size={16} color="#fff" /> : null}
                            </View>
                            <Text style={styles.checkboxtxt}>{t('Confirm_email_change')}</Text>
                        </Pressable> :
                        null}


                    {emailType == "cancel" ?
                        <Pressable
                            onPress={() => !apiCalled && cancelEmail()}
                            style={{
                                width: "50%",
                                borderRadius: borderradius * 1.5,
                                backgroundColor: c.white,
                                alignItems: "center",
                                justifyContent: "center",
                                borderColor: c.white,
                                padding: "2%",
                                alignSelf: "center",
                                marginTop: "4%"

                            }}>
                            {apiCalled ?
                                <ActivityIndicator style={{ alignSelf: "center" }} color={c.primary} size={"small"} />
                                :
                                <Text style={{ color: c.secondary, fontSize: RFValue(20), fontFamily: Fonts.Bold }}>{t('Cancel')}</Text>
                            }
                        </Pressable>
                        :
                        <Pressable
                            onPress={() => isChecked && !apiCalled && handleVerifyEMail()}
                            style={{
                                width: "50%",
                                borderRadius: borderradius * 1.5,
                                backgroundColor: c.white,
                                alignItems: "center",
                                justifyContent: "center",
                                borderColor: c.white,
                                padding: "2%",
                                alignSelf: "center",
                                marginTop: "4%"

                            }}>
                            {apiCalled ?
                                <ActivityIndicator style={{ alignSelf: "center" }} color={c.primary} size={"small"} />
                                :
                                <Text style={{ color: c.secondary, fontSize: RFValue(20), fontFamily: Fonts.Bold }}>{t('Submit')}</Text>
                            }
                        </Pressable>
                    }
                </View>
            </LinearGradient >
        </View >
    )
}

export default EmailAgree


const styles = StyleSheet.create({
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

});
