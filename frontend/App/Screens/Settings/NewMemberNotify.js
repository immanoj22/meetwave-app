import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import React, { useCallback, useState, } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { GetItem } from '../../Actions/localstorage';
import { newUserJoiner } from '../../Actions/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useTranslation } from 'react-i18next';
import SwitchToggle from 'react-native-switch-toggle';
import { InsetMultiSlider } from '../../Utilities/MultiSliderInset';
import Commonheader from '../../Navigation/commonheader';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewMemberNotify = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const [memberNotify, setMemberNotify] = useState(false)
    const [distance, setDistance] = useState([50]);
    const { profile } = useSelector(profileSelector);
    const { isOnline } = useSelector(helperSelector)

    const dispatch = useDispatch()


    useFocusEffect(
        useCallback(() => {
            setMemberNotify(profile?.newjoinerStatus)
            setDistance([profile?.range])
        }, [])
    );


    const handleNewMemberPush = async () => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            var payload = {
                userId: userID,
                range: distance[0],
                newjoinerstatus: memberNotify ? "true" : "false",
            }

            const result = await newUserJoiner(payload)

            if (result?.status) {
                ShowToast(result?.message)
                dispatch(Fetchprofile(userID))
                navigation.goBack();

            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {
        }

    }


    const handledistancechange = useCallback((newValues) => {
        setDistance(newValues);
    }, []);

    const Round = () => {
        return (
            <View style={{ width: 28, height: 28, backgroundColor: "#fff", borderRadius: borderradius * 5, justifyContent: "center", top: "10%" }} >
                <View style={{ width: 20, height: 20, backgroundColor: c.primary, borderRadius: borderradius * 5, alignSelf: "center" }} />
            </View>
        )
    }

    const handleBack = React.useCallback(() => {
        navigation.goBack();
    }, [navigation]);


    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

                <Commonheader
                    onback={handleBack}
                />
                <View style={styles.boxcontainer}>

                    <View style={{ width: "100%", height: deviceheight * 0.87, }}>
                        <View style={styles.boxbtn}>
                            <View style={styles.innerbtn}>
                                <View style={{ alignItems: "center" }}>
                                    <Text style={styles.subtitle}>{t('Enable/Disable')} </Text>
                                </View>

                                <View style={{ width: "15%", }}>
                                    <SwitchToggle
                                        switchOn={memberNotify}
                                        onPress={() => setMemberNotify(!memberNotify)}
                                        circleColorOff='#911687'
                                        circleColorOn="#911687"
                                        backgroundColorOn={c.primary}
                                        backgroundColorOff={c.pink}
                                        containerStyle={{
                                            width: devicewidth * 0.15,
                                            height: devicewidth * 0.074,
                                            borderRadius: 100,
                                            padding: devicewidth * 0.01,

                                        }}
                                        circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                                    />
                                </View>
                            </View>

                        </View>

                        <View style={[styles.boxbtn, { marginTop: "13%" }]}>

                            <View style={styles.innerbtn}>
                                <View style={{ alignItems: "center" }}>
                                    <Text style={styles.subtitle}>{t('Range')}</Text>

                                </View>
                                <View>
                                    <Text style={styles.subtitle}>{distance[0]} {t('km')}</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: "3%", width: "80%", alignSelf: "center" }}>
                                <InsetMultiSlider
                                    values={distance}
                                    onValuesChange={handledistancechange}
                                    min={10}
                                    max={100}
                                    step={1}
                                    allowOverlap={true}
                                    selectedStyle={styles.selectedTrack}
                                    unselectedStyle={styles.unselectedTrack}
                                    trackStyle={styles.track}
                                    customMarker={Round}
                                />
                            </View>

                        </View>

                        <View style={{ position: "absolute", bottom: "10%", alignItems: "center", justifyContent: "center", width: "100%" }}>

                            <Pressable
                                onPress={() => handleNewMemberPush()}
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
                                <Text style={{ color: c.secondary, fontSize: RFValue(20), fontFamily: Fonts.Bold }}>{t('Submit')}</Text>
                            </Pressable>

                        </View>

                    </View>

                </View>
            </LinearGradient>
        </View>
    );
}

export default NewMemberNotify;

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
        fontSize: RFValue(17),
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
    boxbtn: {
        width: "100%", height: deviceheight * 0.0550, alignItems: "center", justifyContent: "center",
    },
    innerbtn: {
        width: "90%", flexDirection: "row", justifyContent: "space-between", alignSelf: "center", alignItems: "center",
    },
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(12),
        textAlign: "center"
    },
    selectedTrack: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 1

    },
    unselectedTrack: {
        backgroundColor: '#E8E6EA',
        borderRadius: borderradius * 1
    },
    track: {
        height: 7,
    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(16),

    },
});
