import { View, Text, StyleSheet, SafeAreaView, Pressable, Keyboard } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFPercentage } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch } from 'react-redux';
import { update_CommonLocAdd, update_CommonLocation, update_Islocationfilter, update_statusbarcolor } from '../../Slices/helper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SetItem } from '../../Actions/localstorage';
import { useTranslation } from 'react-i18next';
import { GOOGLEAPIKEY } from '../../Actions/constant';



const ManualLocation = (props) => {

    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [keyboardVisible, setKeyboardVisible] = useState(true)
    const [selectPage, setSelectPage] = useState("")
    const [addressLoc, setAddressLoc] = useState("")

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [])
    )

    // useFocusEffect(
    //     React.useCallback(() => {

    //         setSelectPage(props?.route?.params?.from)
    //         setAddressLoc(props?.route?.params?.setAddress)

    //     }, [])
    // )

    useEffect(() => {
        setSelectPage(props?.route?.params?.from);
        setAddressLoc(props?.route?.params?.setAddress);
    }, []);


    const googlePlacesRef = useRef(null);
    const [location, setLocation] = useState("");
    const onselect = async (data, details = null) => {

        if (!details) {
            ShowToast(t('No_details_available'))
            return;
        }
        else {

            googlePlacesRef.current?.setAddressText(details?.formatted_address);
            var address = {
                lat: details?.geometry?.location.lat,
                long: details?.geometry?.location.lng,
                formatted_address: details?.formatted_address,
            }




            console.log("FUllAddress==>", details)
            setLocation(details?.formatted_address)

            if (addressLoc == "currentLoc") {
                SetItem("currentLoc", address)
                dispatch(update_CommonLocation(address?.formatted_address))
                dispatch(update_CommonLocAdd(address))
            }
            else {
                SetItem("Adddressdata", address)
            }

        }
    }

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(false);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(true);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);


    const handleContinue = () => {
        if (location == "") {
            ShowToast(t('Please_enter_your_address'))
            return;
        }
        else {

            if (selectPage == "People") {
                setTimeout(() => {
                    dispatch(update_Islocationfilter(true))
                }, 500)
            }

           // navigation.navigate(selectPage)
           navigation.pop(2)
        }

    };



    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                            {Images.back}
                        </Pressable>
                    </View>

                    <View style={{ width: "100%", height: "85%", marginBottom: "8%" }}>
                        <View style={{ alignItems: "center", justifyContent: "center" }}>

                            <Text style={styles.title}>{t('where_are_you')}</Text>
                            <View style={{ width: "92%", marginTop: "1%" }}>
                                <Text style={styles.subtitle}>{t('set_your_location')}</Text>
                            </View>
                            <View style={{ width: '90%', flexDirection: 'row', alignItems: "center", marginTop: "4%", }}>

                                <GooglePlacesAutocomplete
                                    ref={googlePlacesRef}
                                    placeholder={t('Search')}
                                    fetchDetails={true}
                                    onPress={onselect}
                                    debounce={300}
                                    //listViewDisplayed={false}
                                    query={{
                                        key: GOOGLEAPIKEY,
                                        language: 'en',
                                    }}
                                    enablePoweredByContainer={false}
                                    styles={{
                                        textInputContainer: {
                                            width: '100%',
                                        },
                                        textInput: {
                                            height: 52,
                                            width: 20,
                                            color: '#000',
                                            fontSize: RFValue(14),
                                            fontFamily: Fonts.Regular,
                                            placeholderTextColor: '#888',
                                        },
                                        predefinedPlacesDescription: {
                                            color: '#000',
                                        },
                                        description: {
                                            color: '#000',
                                        },

                                    }}

                                />

                            </View>

                        </View>

                    </View>
                    {keyboardVisible && <View style={{ position: "absolute", left: 0, right: 0, bottom: "3%", alignItems: "center", justifyContent: "center" }}>
                        <Pressable onPress={handleContinue} style={{
                            width: "50%",
                            borderRadius: borderradius * 1.5,
                            backgroundColor: c.white,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2%",
                            alignSelf: "center",

                        }}  >
                            <Text style={{ color: c.secondary, fontSize: RFValue(17), fontFamily: Fonts.Bold }}>{t('Continue')}</Text>
                        </Pressable>
                    </View>}
                </View>
            </LinearGradient>

        </View>
    )
}

export default ManualLocation

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
        textAlign: "center",
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


    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0530,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.5,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        marginLeft: "1%"

    },
    closebox: {
        width: devicewidth * 0.0560,
        height: devicewidth * 0.0560,
        borderRadius: borderradius * 2,
        borderWidth: 0.9,
        borderColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        position: 'absolute',
        right: '3%',
        alignSelf: "center"
    },
    iconContainer: {
        width: devicewidth * 0.10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 10,
        backgroundColor: "red"
    },
});