import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFPercentage } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Button from '../../Components/button';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { update_statusbarcolor } from '../../Slices/helper';
import { useTranslation } from 'react-i18next';
import { UserPlanLists } from '../../Actions/hooks';
import Purchases from "react-native-purchases";
import { REVENUECAT_ANDROIDAPIKEY } from "@env"
import { GetItem } from '../../Actions/localstorage';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { socket } from '../../Actions/socket';
import { shownegativemessage, showpossitvemessage } from '../../Actions/config';
import Loadercomponent from '../../Components/loadercomponent';
const TIMEOUT_MS = 10_000;

const Premium = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const userid = GetItem("UserId")
    const [planList, setPlanList] = useState([]);
    const [planHeader, setPlanHeader] = useState();
    useFocusEffect(
        React.useCallback(() => {
            socket.on('purchaseResponse', (data) => {
                cleanup()
                if (data?.status) {
                    showpossitvemessage(t('Success!'), t('Plan_purchased_successfully'))
                    navigation.goBack()
                    const userid = GetItem("UserId")
                    dispatch(Fetchprofile(userid))

                }
                else {
                    shownegativemessage(t('Failure!'), data?.message)
                }
            })
            dispatch(update_statusbarcolor(c.primary))
            revenuecat()
            // getPlanDetails()
            return () => {
                socket.off("purchaseResponse")
                cleanup()
                dispatch(Fetchprofile(userid));
            }
        }
            , [])
    )

    const callPlanList = async () => {

        try {
            const result = await UserPlanLists();


            if (result?.status) {
                setPlanList(result?.data[0].plan_days[0].plansBenifits);
                setPlanHeader(result?.data[0].plan_description)
            }

        } catch (error) {
            console.log("Error on getPlanList: ", error);
        }
    }

    useEffect(() => {
        callPlanList();
    }, [])




    const { profile } = useSelector(profileSelector)
    const [loader, setLoader] = useState(false)
    const revenuecat = async () => {
        try {
            setLoader(true)
            if (Platform.OS === 'ios') {
                const res = await Purchases.configure({ apiKey: "appl_FHVHKXQBbCIjulQKhzOySJncZpx" });
            } else if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: "goog_FamIHcVQVOZPGmNACybOMIITetO" });
            }
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
            const result = await Purchases.getOfferings()

            console.log("result--->", result);

            const resturure = result.current.availablePackages?.map((e) => {

                return ({
                    days: e?.packageType == "ANNUAL" ? "365" : (e?.packageType == "MONTHLY") ? "30" : e?.packageType,
                    price: e?.product?.priceString,
                    plan: e
                })
            })

            // const resturure = data?.map((e) => {
            //     return ({
            //         days: e?.packageType == "ANNUAL" ? "365" : (e?.packageType == "MONTHLY") ? "30" : e?.packageType,
            //         price: e?.product?.priceString,
            //         plan: e
            //     })
            // })
            setLoader(false)

            setPremiumPlans(resturure)


        }
        catch (err) {
            setLoader(false)
            console.log("error", err);

        }
    }

    const [premiumPlans, setPremiumPlans] = useState([]);


    const stripHtmlTags = (html) => {
        return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '); // This regex removes everything between < > (HTML tags)
    };

    const [selectedplan, setSelectedplan] = useState(0)
    const timeoutRef = useRef(null)
    const planselect = async () => {
        try {
            setBuymodal(true)
            const result = premiumPlans[selectedplan].plan

            const userid = profile?._id
            await Purchases.logIn(userid)
            const attributes = {
                userId: userid,
                planId: result?.offeringIdentifier,
                subPlanId: Platform.OS == "android" ? result?.product?.defaultOption?.id : result?.product?.identifier
            }

            // return
            await Purchases.setAttributes(attributes)
            await Purchases.syncPurchases()
            await Purchases.purchasePackage(result);
            await Purchases.logOut()

            timeoutRef.current = setTimeout(() => {
                console.warn('Socket response timed out');
                cleanup()
                shownegativemessage(t('Failure!'), t('Something_went_wrong_contact_meetwave_support_team'))
                navigation.goBack()
                dispatch(Fetchprofile(userid))
                // You can also show an Alert here:
                // Alert.alert('Oops', 'Purchase is taking too long. Please try again.');
            }, TIMEOUT_MS);
        } catch (error) {
            await Purchases.logOut()
            console.log("errorPlan", error);
            cleanup()
            setBuymodal(false)

        }

    }

    const cleanup = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setBuymodal(false);
    };
    const [buymodal, setBuymodal] = useState(false)


    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                {!loader ?
                    <View style={styles.boxcontainer}>
                        <View style={styles.topcontainer}>
                            <Pressable onPress={() => navigation.goBack()}>
                                {Images.close}
                            </Pressable>

                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ width: "100%", height: "92%", marginBottom: "3%", }}>
                                <View style={{ width: "80%", alignSelf: "center", marginTop: "5%" }}>
                                    <Text style={styles.title}>{stripHtmlTags(planHeader)}</Text>
                                    {/* <Text style={styles.subtitle}>{t('This_is_premium_plan')}</Text> */}
                                </View>

                                <View style={{ width: "90%", alignSelf: "center", marginTop: "5%" }}>
                                    {premiumPlans?.map((data, index) => {
                                        return (< Pressable onPress={() => setSelectedplan(index)} style={index == selectedplan ? styles.selected_card : styles.card} key={index} >
                                            <View style={{
                                                width: "80%", flexDirection: "row",
                                                justifyContent: "space-between", alignSelf: "center", alignItems: "center"
                                            }}>
                                                <View style={{ width: "40%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                                                    <View>
                                                        {index == 0 ? Images.annual : Images.donate}
                                                    </View>

                                                    <View style={{ marginLeft: "6%" }}>
                                                        <Text style={styles.cardtitle}>{t('Days')}</Text>
                                                        <Text style={styles.cardsubtitle}>{data?.days}</Text>
                                                    </View>

                                                </View>
                                                <View style={{ width: "40%", }}>
                                                    <Text style={styles.cardcontent}>{t('Price')}</Text>
                                                    <Text style={styles.cardcontent}>{data?.price}</Text>
                                                </View>

                                            </View>

                                            {index == 0 &&
                                                <View style={{ width: devicewidth * 0.3, height: deviceheight * 0.05, backgroundColor: "#000", position: "absolute", left: "10%", top: "-18%", borderRadius: borderradius * 3, alignItems: "center", justifyContent: "center" }} >
                                                    <Text style={styles.cardcontent}>{t('MostPopular')}</Text>
                                                </View>}
                                        </Pressable>)
                                    }
                                    )}
                                    {/* <Pressable style={styles.procard}>
                                    <View style={styles.mostPopularContainer}>
                                        <Text style={styles.mostPopularText}>{t('most_popular')}</Text>
                                    </View>
                                    <View style={{
                                        width: "80%", flexDirection: "row",
                                        justifyContent: "space-between", alignSelf: "center", alignItems: "center"
                                    }}>
                                        <View style={{ width: "40%", flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                            <View>
                                                {Images.unlock}
                                            </View>

                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={styles.cardtitle}>{t('unlock')}</Text>
                                                <Text style={styles.cardsubtitle}>{t('pro')}</Text>
                                            </View>

                                        </View>
                                        <View style={{ width: "40%" }}>
                                            <Text style={styles.cardcontent}>Lorem Ipsum Is Text</Text>
                                        </View>
                                    </View>

                                </Pressable> */}


                                    {/* <Pressable style={styles.card}>
                                    <View style={{
                                        width: "80%", flexDirection: "row",
                                        justifyContent: "space-between", alignSelf: "center", alignItems: "center"
                                    }}>
                                        <View style={{ width: "40%", flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                            <View>
                                                {Images.wait}
                                            </View>

                                            <View style={{ marginLeft: "6%" }}>
                                                <Text style={styles.cardtitle}>Wait</Text>
                                                <Text style={styles.cardsubtitle}>44secs</Text>
                                            </View>

                                        </View>
                                        <View style={{ width: "40%", }}>
                                            <Text style={styles.cardcontent}>Lorem Ipsum Is Text</Text>
                                        </View>
                                    </View>

                                </Pressable> */}

                                    {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{
                                        fontFamily: Fonts.Bold,
                                        color: c.white,
                                        fontSize: RFValue(14),
                                        marginRight: "2%"
                                    }}>{t('cancel_anytime')}</Text>
                                    {Images.infocircle}
                                </View> */}
                                    <Text style={{ color: "#fff", fontFamily: Fonts.Bold, fontSize: RFValue(15), marginVertical: "5%" }} >{t('PlanBenifits')}</Text>

                                    <ScrollView style={{ flex: 0.7, width: "90%", alignSelf: "center", }} showsVerticalScrollIndicator={false} scrollIndicatorInsets={false}>
                                        {planList.map((plan, index) => (
                                            <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: "2%", }}>
                                                <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), justifyContent: 'center', marginTop: 5 }} >*  </Text>
                                                <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), }} >{plan?.benefit}</Text>
                                            </View>
                                        ))}
                                    </ScrollView>


                                    {/* <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), marginTop: "2.5%" }} >{t('Unlimited_choose_hobbies')}</Text>
                                    <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), marginTop: "2.5%" }} >{t('UnlimitedGroupCreates')}</Text>
                                    <Text style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), marginTop: "2.5%" }} >{t('UnlimitedEventCreates')}</Text> */}

                                </View>
                            </View>
                        </ScrollView >
                        <View style={{ position: "absolute", left: 0, right: 0, bottom: "3%", alignItems: "center", justifyContent: "center" }}>
                            <Button onpress={() => planselect()} title={t('go_Premium')} />
                        </View>
                    </View >
                    :
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}  >
                        <ActivityIndicator size={"small"} color={"#fff"} />
                    </View>}
            </LinearGradient >
            <Loadercomponent visible={buymodal} onClose={setBuymodal} />
        </View >
    )
}

export default Premium

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
        textAlign: "center",
        marginBottom: 10

    },
    subtitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(18),
        textAlign: "center",
        marginTop: "0.5%"
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.1),
    },
    topcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "8%",
        justifyContent: "center",
        alignItems: "flex-end",

    },
    procard: {
        width: "100%",
        height: deviceheight * 0.150,
        justifyContent: "center",
        borderRadius: borderradius * 0.5,
        borderColor: "#87216B",
        backgroundColor: "#C66B59",
        borderWidth: 1,
        position: "relative",
        marginBottom: "4%"


    },
    cardtitle: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(14),

    },
    cardsubtitle: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(22),
    },
    cardcontent: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(13),
        textAlign: "center"
    },
    mostPopularContainer: {
        position: "absolute",
        top: -20,
        left: "5%",
        backgroundColor: c.black,
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: "6%",
        paddingVertical: "2%"
    },
    mostPopularText: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(11),
    },
    card: {
        width: "100%",
        height: deviceheight * 0.150,
        justifyContent: "center",
        borderRadius: borderradius * 0.5,
        borderColor: "#fff",
        borderWidth: 1,
        marginBottom: "4%",

    },
    selected_card: {
        width: "100%",
        height: deviceheight * 0.150,
        justifyContent: "center",
        borderRadius: borderradius * 0.5,
        borderColor: c.secondary,
        borderWidth: 2,
        marginBottom: "4%",
        backgroundColor: "#C66B59",

    }
});
