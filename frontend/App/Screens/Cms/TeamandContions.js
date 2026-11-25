import { View, StyleSheet, ScrollView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import { GetItem } from '../../Actions/localstorage';
import { GetCMSpages } from '../../Actions/hooks';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import RenderHTML from 'react-native-render-html';

const Teamacondition = (props) => {
    const { t } = useTranslation();

    const [cmsList, setCmsList] = useState("")
    const userID = GetItem("UserId")
    const { isOnline } = useSelector(helperSelector)

    const [cmsListData, setCmsListData] = useState([]);
    const { params } = props.route;
    const [loading, setLoading] = useState(false);
    useFocusEffect(
        React.useCallback(() => {
            setCmsList(params);
        }, [params])
    );

    // useEffect(() => {
    //     GetCMS();
    // }, [])

    useEffect(() => {
        const fetchCmsList = async () => {
            await GetCMS();
        };
        fetchCmsList();
    }, []);

    const GetCMS = async () => {

        try {
            setLoading(true)
            const result = await GetCMSpages()

            if (result?.status) {
                if (result?.data?.length > 0) {
                    // setCmsListData(result?.data);
                    setLoading(false)
                    if (props.route.params?.name === "PrivacyPolicy") {
                        setCmsListData(result?.data.filter(p => p.identifier === 'privacypolicy'))
                    } else if (props.route.params?.name === "Teama") {
                        setCmsListData(result?.data.filter(p => p.identifier === 'termsandcondition'))
                    } else if (props.route.params?.name === "guidelines") {
                        setCmsListData(result?.data.filter(p => p.identifier === 'meetwaveguidelines'))
                    } else if (props.route.params?.name === "about") {
                        setCmsListData(result?.data.filter(p => p.identifier === 'about'))
                    }

                }
            }

        } catch (error) {
            setLoading(false)
            console.log("Error on getFaqList: ", error);
        }

    }

    const stripHtmlTags = (html) => {
        return html.replace(/<[^>]+>/g, '');
    };

    const getHeaderTitle = (item) => {
        if (item?.identifier === 'termsandcondition') {
            return t('Terms_and_Condition');
        }
        return item?.Title;
    };

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
    };


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                {loading ?
                    <View style={{ width: '90%', position: 'absolute', bottom: '7%', alignSelf: 'center', height: deviceheight * 0.9, justifyContent: "center" }}>
                        <ActivityIndicator size="large" color={c.white} />
                    </View>
                    :
                    <>
                        {cmsListData.map((e, index) => (
                            <View style={styles.boxcontainer}>
                                <Header header={getHeaderTitle(e)} />
                                <View style={{ width: "100%", height: deviceheight * 0.85, }}>
                                    {/* {cmsListData.map((e, index) => ( */}
                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        <View style={{ marginBottom: "8%" }}>
                                            <View style={{ width: "90%", alignSelf: "center", marginTop: "3%" }}>
                                                {/* <Text style={styles.paratxt}>{stripHtmlTags(e.Content)}</Text> */}
                                                <RenderHTML contentWidth={width} baseStyle={styles.paratxt} tagsStyles={tagsStyles} source={{ html: e.Content?.includes('<p>') || e.Content?.includes('<br') ? e.Content : e.Content?.replace(/\\n/g, '<br />') }} />
                                            </View>
                                        </View>
                                    </ScrollView>
                                    {/* ))} */}
                                </View>

                            </View>
                        ))}
                    </>

                }




            </LinearGradient>
        </View>
    );
}

export default Teamacondition;

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
        fontFamily: Fonts.Medium,
        color: c.white,
        letterSpacing: 0.3,
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
