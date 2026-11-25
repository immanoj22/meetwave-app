import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Fonts } from "../../Utilities/fonts"
import { c } from "../../Utilities/colors"
import { RFValue } from "react-native-responsive-fontsize"
import { deviceheight, devicewidth } from "../../Utilities/Dimensions"
import LinearGradient from "react-native-linear-gradient"
import { useTranslation } from "react-i18next"
import { useNavigation } from "@react-navigation/native"
import AntDesign from 'react-native-vector-icons/AntDesign';
import React, { useEffect, useState } from "react";
import { GetAllCmsLists, Getfaqlist } from "../../Actions/hooks"
import Commonheader from "../../Navigation/commonheader"
import RenderHTML from 'react-native-render-html';

const FaqPage = () => {

    const { t } = useTranslation();
    const navigation = useNavigation();
    const [expanded, setExpanded] = useState(null);
    const [faqList, setFaqList] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleExpand = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    useEffect(() => {
        const fetchFaqList = async () => {
            await getFaqList();
        };
        fetchFaqList();
    }, []);

    const getFaqList = async () => {
        try {
            setLoading(true);
            const result = await Getfaqlist();
            if (result?.status) {

                if (result?.data?.length > 0) {
                    setFaqList(result?.data);
                }
                setLoading(false);
            }

        } catch (error) {
            setLoading(false);
            console.log("Error on getFaqList: ", error);
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


        <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
            <View style={styles.boxcontainer}>

                <Commonheader
                    istitle={false}
                    onback={handleBack}
                />
                {loading ?
                    <View style={{ width: '90%', position: 'absolute', bottom: '7%', alignSelf: 'center', height: deviceheight * 0.9, justifyContent: "center" }}>
                        <ActivityIndicator size="large" color={c.white} />
                    </View>
                    :
                    <ScrollView style={{ flex: 0.7, width: "100%", paddingHorizontal: 20, alignSelf: "center", }} showsVerticalScrollIndicator={false} scrollIndicatorInsets={false}>
                        {faqList.map((faq, index) => (
                            <View key={index} style={styles.faqItem}>
                                <TouchableOpacity style={styles.question} onPress={() => toggleExpand(index)}>
                                    <Text style={styles.questionText}>{faq?.question}</Text>
                                    <AntDesign name={expanded == index ? 'minus' : 'plus'} size={20} color={c.white} />
                                </TouchableOpacity>

                                {expanded == index &&
                                    <RenderHTML contentWidth={width} baseStyle={styles.answer} tagsStyles={tagsStyles}
                                        source={{ html: faq?.answer }} />
                                }
                            </View>
                        ))}
                    </ScrollView>
                }
            </View>
        </LinearGradient>

    )

}
export default FaqPage

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "8%",
        flexDirection: "row",
        alignItems: "center",
        flex: 0.2
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
    faqItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    question: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        fontFamily: Fonts.Medium
    },
    questionText: {
        width: "90%",
        fontSize: RFValue(13),
        fontWeight: '500',
        color: c.white,
        fontFamily: Fonts.Medium
    },
    answer: {
        fontSize: RFValue(14),
        color: c.grey,
        marginTop: 5,
        textAlign: "justify",
        fontFamily: Fonts.Medium
    },
    title: {
        fontSize: RFValue(22),
        fontFamily: Fonts.Medium,
        marginBottom: 20,
        textAlign: 'center',
        color: c.orange
    },
})