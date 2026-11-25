

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput, WINDOW_HEIGHT } from '@gorhom/bottom-sheet/src';
import { BackHandler, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { textInputPlaceholderCenter } from '../../Utilities/textInputLayout';
import { useFocusEffect } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { update_Isfilter, update_Islocationfilter, update_Isreportfilter, update_statusbarcolor } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth } from "../../Utilities/Dimensions";

import { RFPercentage } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';


const ReportPopUp = ({ visible, reportText, setReportText, reportFn }) => {

    const { t } = useTranslation();


    const bottomSheetModalRef = useRef();
    const dispatch = useDispatch()

    // const dispatch = useDispatch()
    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary));
            return () => {
                dispatch(update_Isreportfilter(false));
            };
        }, [dispatch])
    );

    const snapPoints = useMemo(() => ["50%"], []);

    useEffect(() => {
        if (!visible) {
            bottomSheetModalRef.current?.dismiss?.();
            return;
        }
        const frame = requestAnimationFrame(() => {
            bottomSheetModalRef.current?.present?.();
        });
        return () => cancelAnimationFrame(frame);
    }, [visible]);


    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={1}
                animatedIndex={{
                    value: 1,
                }}
                opacity={Platform.OS == "android" ? 0.6 : 0.4}
            >

            </BottomSheetBackdrop>
        ),
        []
    )


    return (
        <BottomSheetModalProvider >
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                shouldMeasureContentHeight={true}
                backgroundStyle={{ backgroundColor: c.secondary }}
                enableOverDrag={true}
                backdropComponent={renderBackdrop}
                enableDynamicSizing={true}
                handleIndicatorStyle={{ backgroundColor: 'gray' }}
                onDismiss={() => dispatch(update_Isreportfilter(false))}
                // keyboardBehavior='none'
                // keyboardBlurBehavior="none"
                keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'fillParent'}
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"

            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>

                    <View style={{ marginHorizontal: "5%", height: "90%", paddingHorizontal: "2.5%" }} >

                        <BottomSheetScrollView
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            style={{ marginTop: "4%" }} >

                            <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                                <View style={{ width: "100%", }}>
                                    <Text style={styles.title}>{t('Report')}:</Text>
                                </View>
                                <View style={styles.inputcontainer}>

                                    <BottomSheetTextInput
                                        placeholderTextColor={"#F7E5D0"}
                                        value={reportText}
                                        onChangeText={setReportText}
                                        placeholder={t('Enter_Valid_Report_detail')}
                                        style={styles.inputtxtstyle}
                                        keyboardType='default'
                                    // keyboardBlurBehavior
                                    // keyboardShouldPersistTaps
                                    />
                                </View>

                                <View style={{ marginTop: "12%", flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", marginBottom: WINDOW_HEIGHT * 0.040 }}>
                                    <Pressable
                                        onPress={() => {
                                            bottomSheetModalRef.current.dismiss()
                                            reportFn()
                                        }}
                                        style={styles.locabutton}>
                                        <Text style={styles.btntxt}>{t('Report')}</Text>
                                    </Pressable>
                                    <Pressable onPress={() => {
                                        bottomSheetModalRef.current.dismiss()

                                    }} style={styles.buttoncontainer}>
                                        <Text style={styles.btntxt}>{t('Cancel')}</Text>
                                    </Pressable>
                                </View>

                            </View>



                        </BottomSheetScrollView>


                    </View>
                </KeyboardAvoidingView>
            </BottomSheetModal>
        </BottomSheetModalProvider>

    )
}

export default ReportPopUp;
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
        marginBottom: "1%",
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
        marginLeft: "3%"

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
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        marginTop: "4%"
    },
    inputtxtstyle: {
        ...textInputPlaceholderCenter,
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%",
    },

})