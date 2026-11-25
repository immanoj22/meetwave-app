

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch } from "react-redux";
import { update_FilterDistance, update_Islocationfilter, update_statusbarcolor } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import { RFPercentage } from 'react-native-responsive-fontsize';
import { InsetMultiSlider, useSliderScrollLock } from "../../Utilities/MultiSliderInset";
import { ResidentialAddress } from "../../Actions/hooks";
import { GetItem, } from "../../Actions/localstorage";
import { useTranslation } from 'react-i18next';

const Locationfilter = ({ visible, onClose, datareturn }) => {

    const { t } = useTranslation();

    const bottomSheetModalRef = useRef();
    const userID = GetItem("UserId")
    const [distance, setDistance] = useState([10]);
    const [currentLoc, setCurrentLoc] = useState("");
    const [currentAdd, setCurrentAdd] = useState("");
    const { scrollEnabled, getSliderProps } = useSliderScrollLock();

    // const dispatch = useDispatch()
    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
            var getad = GetItem("currentLoc")
            setCurrentAdd(getad);
            setCurrentLoc(getad?.formatted_address)

        }, [])
    )

    const dispatch = useDispatch()

    useEffect(() => {
        openBottomSheet();

        return () => {
            const distanceToStore = currentAdd?.formatted_address ? distance[0] : 0;
            dispatch(update_FilterDistance(distanceToStore));
        }
    }, [visible]);
    const snapPoints = useMemo(() => ["60%"], []);

    const openBottomSheet = () => {
        if (visible) {
            bottomSheetModalRef.current.present();
        }
    };

    const navigation = useNavigation()

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={1}
                animatedIndex={{
                    value: 1,
                }}
                opacity={Platform.OS == "android" ? 0.6 : 0.4}>

                <View style={{ height: "100%", alignItems: "center", justifyContent: "center" }} >
                    <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"large"} />
                </View>
            </BottomSheetBackdrop>
        ),
        []
    )

    const handledistancechange = useCallback((newValues) => {
        console.log(newValues);
        setDistance(newValues);
        dispatch(update_FilterDistance(newValues[0]));
    }, []);

    const Round = () => {
        return (
            <View style={{ width: 28, height: 28, backgroundColor: "#fff", borderRadius: borderradius * 5, justifyContent: "center", top: "10%" }} >
                <View style={{ width: 20, height: 20, backgroundColor: c.primary, borderRadius: borderradius * 5, alignSelf: "center" }} />
            </View>
        )
    }


    const handleLocationSend = async () => {
        try {

            let payload = {
                userId: userID,
                homeType: currentLoc ? "change" : "cancel",
                latitude: currentAdd ? currentAdd?.lat : 0,
                longitude: currentAdd ? currentAdd?.long : 0,
            }

            const result = await ResidentialAddress(payload);

            if (result?.status) {
                ShowToast(t('LocationUpdated'))
            }


        } catch (error) {
        }
    }


    return (
        <BottomSheetModalProvider >
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                shouldMeasureContentHeight={true}
                backgroundStyle={{ backgroundColor: c.secondary }}
                enableOverDrag={true}
                enableDynamicSizing={false}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: 'gray' }}
                onDismiss={() => {
                    dispatch(update_Islocationfilter(false));
                    bottomSheetModalRef.current.dismiss();
                }}>
               
                <View style={{ marginHorizontal: "5%", height: "90%", paddingHorizontal: "2.5%" }} >

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"
                        scrollEnabled={scrollEnabled}
                        showsVerticalScrollIndicator={false}
                        style={{ marginTop: "12%" }}>

                        <View style={{ width: "100%", height: "100%", }}>

                            <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
                                <Text style={styles.title}>{t('Change_Your_location')} ?</Text>
                            </View>
                            {currentLoc &&
                                <>
                                    <Pressable onPress={() => { navigation.navigate("LocationHome", { from: "People", setAddress: "currentLoc" }) }} style={{
                                        width: "100%",
                                        justifyContent: "center",
                                        height: deviceheight * 0.0680,
                                        paddingHorizontal: "3%",
                                        borderRadius: borderradius * 0.3,
                                        borderColor: c.white,
                                        borderWidth: 0.9,
                                        marginTop: "8%"
                                    }}>
                                        <Text style={styles.loctxt}>{currentLoc}</Text>
                                        <View style={{ position: "absolute", right: "3%", alignSelf: "center", }} >
                                            {Images.location1}
                                        </View>
                                    </Pressable>

                                    <View style={{ marginTop: "3%", }}>
                                        <Text style={styles.subtitle}>{t('Find_People_Range')}</Text>
                                        <Text style={styles.valueLabel}>{distance[0]} km</Text>
                                        <InsetMultiSlider
                                            {...getSliderProps({
                                            values: distance,
                                            onValuesChange: handledistancechange,
                                            min: 10,
                                            max: 50,
                                            step: 1,
                                            allowOverlap: true,
                                            selectedStyle: styles.selectedTrack,
                                            unselectedStyle: styles.unselectedTrack,
                                            trackStyle: styles.track,
                                            customMarker: Round,
                                            })}
                                        />
                                    </View>
                                </>
                            }
                            <View style={{ marginTop: "6%", flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center" }}>


                                {currentLoc ?

                                    <Pressable onPress={() => {
                                        handleLocationSend()
                                        bottomSheetModalRef.current.dismiss()
                                    }} style={[styles.buttoncontainer, { marginLeft: "5%" }]}>
                                        <Text style={styles.btntxt}>{t('Submit')}</Text>
                                    </Pressable>
                                    :

                                    <>

                                        <Pressable onPress={() => { dispatch(update_Islocationfilter(false)), navigation.navigate("LocationHome", { from: "People", setAddress: "currentLoc" }) }} style={styles.locabutton}>
                                            <Text style={styles.btntxt}>{t('Change')}</Text>
                                        </Pressable>

                                        <Pressable onPress={() => {
                                            handleLocationSend()
                                            dispatch(update_Islocationfilter(false));
                                            dispatch(update_FilterDistance(0))
                                            bottomSheetModalRef.current.dismiss();
                                        }} style={[styles.buttoncontainer, { marginLeft: "5%" }]}>
                                            <Text style={styles.btntxt}>{t('Cancel')}</Text>
                                        </Pressable>
                                    </>

                                }

                            </View>

                        </View>

                    </BottomSheetScrollView>
                </View>
            </BottomSheetModal>
        </BottomSheetModalProvider>

    )
}

export default Locationfilter;
const styles = StyleSheet.create({
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(18),
    },
    loctxt: {
        width: "80%",
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,


    },
    genderbox: {
        width: "100%",
        height: deviceheight * 0.0830,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        backgroundColor: c.primary,
        marginTop: "3%"
    },
    genderButton: {
        width: "32%",
        alignItems: "center",
        justifyContent: "center",
        height: deviceheight * 0.0830,
        borderRadius: borderradius * 0.6,
    },
    selectedGender: {
        backgroundColor: c.white,
    },
    genderText: {
        fontSize: RFValue(16),
    },
    activegendertxt: {
        fontFamily: Fonts.Bold,
        color: c.black,
    },
    inactivegendertxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(14),
    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    valueLabel: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "right",
        marginBottom: "2%",
    },
    slider: {
        width: "100%",
    },
    addcontainer: {
        width: '46%',
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        height: deviceheight * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',

    },
    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.secondary,
        fontSize: RFValue(13),
        marginRight: '4%',

    },
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
    },
    buttoncontainer: {
        width: '38%',
        borderRadius: borderradius * 0.6,
        backgroundColor: c.white,
        height: deviceheight * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',

    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),

    },
    locabutton: {
        width: '38%',
        borderRadius: borderradius * 0.6,
        backgroundColor: c.primary,
        height: deviceheight * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',

    },
    premiumIcon: {
        width: devicewidth * 0.0480,
        height: devicewidth * 0.0480,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        marginLeft: '3%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -deviceheight * 0.01,
        left: 0,
    },
    headtitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: 'center',
    },
    swaproundbox: {
        width: devicewidth * 0.058,
        height: devicewidth * 0.058,
        borderRadius: (devicewidth * 0.15) / 2,
        borderWidth: 1,
        borderColor: '#fff',
        marginLeft: '2%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbStyle: {
        width: "30%",
        height: "30%",
        borderRadius: 15,
        backgroundColor: "red",
    },
    inputsec: {
        width: "100%",
        alignSelf: "center",
        marginTop: "3%"
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        paddingVertical: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
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
})