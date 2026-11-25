import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import React, { useEffect, useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Header from './Header';
import { GetItem } from '../../Actions/localstorage';
import { deleteaccountapi, GetCMSpages } from '../../Actions/hooks';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { showwarningmessage } from '../../Actions/config';
import RenderHTML from 'react-native-render-html';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loadercomponent from '../../Components/loadercomponent';

const CmsPage = (props) => {

    const { t } = useTranslation();
    const navigation = useNavigation();
    const [cmsList, setCmsList] = useState("")
    const [isChecked, setChecked] = useState(false);
    const userID = GetItem("UserId")
    const { isOnline } = useSelector(helperSelector)
    const dispatch = useDispatch()
    const [delLoading, setDelLoading] = useState(false);
    const [cmsListData, setCmsListData] = useState([]);
    const [cmsLoading, setCmsLoading] = useState(true);

    const { width } = Dimensions.get('window');

    const tagsStyles = {
        p: {
            color: 'white',
            fontSize: RFValue(13),
            fontFamily: Fonts.Medium,
            lineHeight: RFValue(22),
            marginTop: 0,
            marginBottom: RFValue(14),
        },
        b: { color: 'white', fontSize: RFValue(13), fontFamily: Fonts.Medium },
        li: {
            color: 'white',
            fontSize: RFValue(13),
            fontFamily: Fonts.Medium,
            lineHeight: RFValue(22),
            marginBottom: RFValue(8),
        },
        ul: {
            marginTop: 0,
            marginBottom: RFValue(14),
        },
        ol: {
            marginTop: 0,
            marginBottom: RFValue(14),
        },
        br: {
            marginBottom: RFValue(8),
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setCmsList(props.route.params)
            setDelLoading(false);
            setChecked(false);

        }, [])

    )


    useEffect(() => {
        GetCMS();
    }, [])


    const GetCMS = async () => {

        try {
            const result = await GetCMSpages()
            console.log("DeletRes--> ", result)
            if (result?.status) {
                if (result?.data?.length > 0) {
                    // setCmsListData(result?.data);

                    console.log("DeletRes--> ", result)

                    if (props.route.params?.name === "Delete Account") {
                        setCmsListData(result?.data.filter(p => p.identifier === 'deleteaccount'))
                    }

                }
            }

        } catch (error) {
            console.log("Error on getFaqList: ", error);
        } finally {
            setCmsLoading(false);
        }

    }



    const handledeletefn = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                "userId": userID,
            }

            setDelLoading(true);

            const result = await deleteaccountapi(payload);

            if (result?.status) {
                showwarningmessage(result?.message);
                navigation?.push("Otp", { key: "accDelete" })

            }
            else {
                showwarningmessage(result?.message);
            }

        }
        catch (err) {
            console.log("Error on handledeletefn: ", err);
        }
        finally {
            setDelLoading(false);
        }

    }


    const CustomCheckBox = ({ isChecked, onToggle }) => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
                onPress={onToggle}>

                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Icon name="check" size={16} color="#fff" />}
                </View>

            </TouchableOpacity>
        );
    };

    const stripHtmlTags = (html) => {
        return html.replace(/<[^>]+>/g, '');
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Loadercomponent visible={cmsLoading} onClose={() => {}} />

                {cmsListData.map((e, index) => (
                    <View style={styles.boxcontainer}>

                        {/* <Header header={props?.route?.params?.name ? props?.route?.params?.name : "Privacy Policy"} /> */}
                        <Header header={e.Title} />

                        <View style={{ width: "100%", height: deviceheight * 0.80, }}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ marginBottom: "8%" }}>
                                    <View style={{ width: "90%", alignSelf: "center", marginTop: "3%" }}>
                                        <RenderHTML
                                            contentWidth={width}
                                            baseStyle={styles.paratxt}
                                            tagsStyles={tagsStyles}
                                            source={{
                                                html: e.Content?.includes('<p>') || e.Content?.includes('<br')
                                                    ? e.Content
                                                    : e.Content?.replace(/\\n/g, '<br />')
                                            }}
                                        />
                                    </View>
                                </View>
                            </ScrollView>



                            {props?.route?.params?.name == "Delete Account" &&
                                <View style={{ position: "absolute", bottom: "5%", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                    {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <CustomCheckBox isChecked={isChecked} onToggle={() => setChecked(!isChecked)} />
                                        <Text style={styles.checkboxtxt}>{t('delect_acc_confirm')}</Text>
                                    </View> */}
                                    <Pressable onPress={() => setChecked(!isChecked)} style={{ flexDirection: "row", alignItems: "center", width: "auto", alignSelf: "center", }}>
                                        <View style={{ width: 25, height: 25, borderRadius: 5, borderWidth: 1, borderColor: c.primary, marginRight: "2.5%", justifyContent: "center", alignItems: "center" }} >
                                            {isChecked ? <Icon name="check" size={16} color="#fff" /> : null}
                                        </View>
                                        <Text style={styles.checkboxtxt}>{t('delect_acc_confirm')}</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => { delLoading ? "" : isChecked ? handledeletefn() : showwarningmessage(t('Kindly_agree')) }}
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
                                        {delLoading ?
                                            <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                                            :
                                            <Text style={{ color: c.secondary, fontSize: RFValue(20), fontFamily: Fonts.Bold }}>{t('Submit')}</Text>
                                        }
                                    </Pressable>

                                </View>

                            }
                        </View>

                    </View>
                ))}
            </LinearGradient>
        </SafeAreaProvider>
    );
}

export default CmsPage;

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
        width: "90%",
        alignSelf: "center",
        height: deviceheight * 0.120,
        flexDirection: "row",
        alignItems: "center",
    },
    roundbox: {
        width: devicewidth * 0.12,
        height: devicewidth * 0.12,
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
        fontSize: RFValue(14),
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
