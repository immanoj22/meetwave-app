import { View, Text, StyleSheet, SafeAreaView, Pressable, Alert, Platform, Linking } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFPercentage } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch } from 'react-redux';
import { update_CommonLocAdd, update_CommonLocation, update_Islocationfilter, update_statusbarcolor } from '../../Slices/helper';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS, } from 'react-native-permissions';
import getaddressapi from '../../Actions/getaddressapi';
import { SetItem } from '../../Actions/localstorage';
import { useTranslation } from 'react-i18next';


const LocationHome = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectPage, setSelectPage] = useState("")
    const [addressLoc, setAddressLoc] = useState("")

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [])
    )
    useFocusEffect(
        React.useCallback(() => {

            setSelectPage(props?.route?.params?.from)

            setAddressLoc(props?.route?.params?.setAddress)
        }, [])
    )

    const requestLocationPermission = async () => {
        try {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

            const result = await check(permission);

            if (result === RESULTS.DENIED) {
                const requestResult = await request(permission);
                if (requestResult === RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert(
                        t('PermissionDenied'),
                        t('Location_access _Please_enable_settings.'),
                        [
                            {
                                text: t('Cancel'),
                                style: "cancel"
                            },
                            {
                                text: t('OpenSettings'),
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                    return false;
                }
            } else if (result === RESULTS.GRANTED) {
                return true;
            } else if (result === RESULTS.BLOCKED || result === RESULTS.LIMITED) {
                Alert.alert(
                    t('PermissionDenied'),
                    t('Location_access _Please_enable_settings.'),
                    [
                        {
                            text: t('Cancel'),
                            style: "cancel"
                        },
                        {
                            text: t('OpenSettings'),
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
                return false;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };


    const Getcurrentlocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            return;
        }

        setLoading(true);

        try {
            const position = await new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (error) => reject(error)
                );
            });

            const { latitude, longitude } = position;
            setLocation({ latitude, longitude });
            const address = await getaddressapi(latitude, longitude);

            var addressdata = {
                lat: latitude,
                long: longitude,
                formatted_address: address
            }

            if (addressLoc == "currentLoc") {
                SetItem("currentLoc", addressdata)

                dispatch(update_CommonLocation(addressdata?.formatted_address))
                dispatch(update_CommonLocAdd(addressdata))
            }
            else {
                SetItem("Adddressdata", addressdata)
            }
            if (selectPage == "People" || selectPage == "Activities" || selectPage == "Chat") {
                dispatch(update_Islocationfilter(true))
            }

            navigation.goBack()

        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                            {Images.back}
                        </Pressable>
                    </View>

                    <View style={{ width: "100%", height: "85%", marginBottom: "8%" }}>
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <View>
                                {Images.location2}
                            </View>
                            <Text style={styles.title}>{t('enable_loc')}</Text>
                            <View style={{ width: "92%", marginTop: "1%" }}>
                                <Text style={styles.subtitle}>{t('choose_loc_start')}</Text>
                            </View>

                            <Pressable onPress={Getcurrentlocation} style={{
                                width: "72%",
                                borderRadius: borderradius * 1.5,
                                backgroundColor: c.secondary,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "3.2%",
                                alignSelf: "center",
                                marginTop: "8%"

                            }}>
                                <Text style={{ color: c.white, fontSize: RFValue(16), fontFamily: Fonts.Bold }}>{t('allow_loc_acc')}</Text>
                            </Pressable>
                            <Pressable onPress={() => navigation.navigate("ManualLocation", { from: selectPage, setAddress: addressLoc })} style={{ marginTop: "5%" }}>
                                <Text style={{ color: c.primary, fontSize: RFValue(16), fontFamily: Fonts.Bold }}>{t('enter_loc_manually')}</Text>
                            </Pressable>
                        </View>

                    </View>
                </View>
            </LinearGradient>

        </View>
    )
}

export default LocationHome

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
        fontSize: RFValue(26),
        textAlign: "center"
    },
    subtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(15),
        textAlign: "center",
        letterSpacing: 0.1
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.1),
    },
    backcontainer: {
        width: "100%",
        paddingTop: "6.2%",
        height: "15%",
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
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2),
    },
    profilebox: {
        width: devicewidth * 0.24,
        height: devicewidth * 0.24,
        borderRadius: (devicewidth * 0.15) / 1.3,
        backgroundColor: c.primary,
    },
    editbox: {
        width: devicewidth * 0.07,
        height: devicewidth * 0.07,
        borderRadius: borderradius * 2,
        backgroundColor: c.secondary,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: "3%",
        right: 0,
    },
    inputsec: {
        width: "90%",
        alignSelf: "center",
        marginTop: "3%"
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%"
    },
    dobcontainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    activegender: {
        width: "30%",
        height: deviceheight * 0.0500,
        backgroundColor: c.secondary,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.secondary,
        borderWidth: 0.9,
        justifyContent: "center"
    },
    gendertxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
    },
    inactivegender: {
        width: "30%",
        height: deviceheight * 0.0500,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        justifyContent: "center"
    },
    privacytxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
    },
    privacytxt1: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        textDecorationLine: "underline"
    },
    privacytxt2: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        textDecorationLine: "underline"
    },
    btnbox: {
        width: "38%",
        height: deviceheight * 0.0500,
        paddingHorizontal: "2%",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        justifyContent: "center",
    },
    btntxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(14),
    },
    // Custom styles for the date picker
    datePicker: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 0.5,
    },
    loctxt: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
    }
});
