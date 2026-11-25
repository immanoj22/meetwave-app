import { View, Text, Modal, StyleSheet, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Fonts } from '../../Utilities/fonts';
import { useTranslation } from 'react-i18next';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { useDispatch, useSelector } from "react-redux";
import { GetItem } from '../../Actions/localstorage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { helperSelector, update_FilterDistance, update_Islocationfilter, update_statusbarcolor } from '../../Slices/helper';
import { ResidentialAddress } from '../../Actions/hooks';
import { Images } from '../../Utilities/images';
import { InsetMultiSlider } from '../../Utilities/MultiSliderInset';
import Closeicon from "../../Assets/icons/close2.svg"

const LocationPopup = ({ visible, onclose, }) => {
    const { t } = useTranslation();

    const { profile } = useSelector(profileSelector)
    const userID = GetItem("UserId")
    const [distance, setDistance] = useState([10]);
    const [currentLoc, setCurrentLoc] = useState("");
    const [currentAdd, setCurrentAdd] = useState("");

    const { islocationfilter } = useSelector(helperSelector)

    const { filterBysearch } = useSelector(helperSelector)


    const { activeTab } = filterBysearch;

    // alert(visible)
    const [visibleState, setVisibleState] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute = 60 seconds
    const [timerRunning, setTimerRunning] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            
            dispatch(update_statusbarcolor(c.primary))
            var getad = GetItem("currentLoc")

            setTimeLeft(60)
            setCurrentAdd(getad);
            setCurrentLoc(getad?.formatted_address)
            setVisibleState(islocationfilter)

        }, [islocationfilter])
    )


    useEffect(() => {
        if (islocationfilter) {
            setTimerRunning(true);
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setTimerRunning(false);
                        // Close the popup when the timer hits 0
                        dispatch(update_Islocationfilter(false));
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            // Cleanup interval on unmount or when popup is closed
            return () => clearInterval(timer);
        }
    }, [islocationfilter]);

    const dispatch = useDispatch()
    const navigation = useNavigation()
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


    const handleLocationSend = async (type) => {
        try {

            let payload = {
                userId: userID,
                homeType: currentLoc ? "change" : "cancel",
                latitude: currentAdd ? currentAdd?.lat : 0,
                longitude: currentAdd ? currentAdd?.long : 0,
            }

            const result = await ResidentialAddress(payload);

            if (type != "cancel") {
                if (result?.status && payload?.homeType != "cancel") {
                    ShowToast(t('CurrentLocationUpdated'))
                }

                const distanceToStore = currentAdd?.formatted_address ? distance[0] : 10;
                dispatch(update_FilterDistance(distanceToStore));
                dispatch(Fetchprofile(userID))
            }
            else {
                dispatch(update_FilterDistance(0));
                dispatch(Fetchprofile(userID))
            }

        } catch (error) {
        }
    }



    return (
        <View style={styles.btncontainer}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={islocationfilter}
                onRequestClose={() => {
                    dispatch(update_Islocationfilter(false));
                }} >
                    
                <View style={styles.container}>
                    <View style={styles.modalcontainer}>
                        <View style={{ width: "100%", alignItems: "flex-end", }}>
                            <Pressable onPress={() => {
                                handleLocationSend("cancel")
                                dispatch(update_Islocationfilter(false));
                                dispatch(update_FilterDistance(0))

                            }} style={{
                                width: devicewidth * 0.08,
                                height: devicewidth * 0.08,
                                borderRadius: (devicewidth * 0.15) / 2,
                                backgroundColor: c.white,
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <Closeicon width={devicewidth * 0.0880} height={devicewidth * 0.0880} />
                            </Pressable>
                        </View>
                        
                        {!currentLoc &&
                            <View style={{ width: "100%", marginTop: "4.5%",alignItems:'center' }}>
                                <Text style={styles.title}>{t('Change_Your_location')} ?</Text>
                            </View>
                        }
                       
                        <View style={{ width: "100%", marginTop: "3%" }}>

                            {currentLoc &&
                                <>
                                    <Pressable onPress={() => {
                                        dispatch(update_Islocationfilter(false)),
                                            navigation.navigate("LocationHome", { from: activeTab, setAddress: "currentLoc" })
                                    }}
                                        style={{
                                            width: "100%",
                                            justifyContent: "center",
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
                                            values={distance}
                                            onValuesChange={handledistancechange}
                                            min={10}
                                            max={50}
                                            step={1}
                                            allowOverlap={true}
                                            selectedStyle={styles.selectedTrack}
                                            unselectedStyle={styles.unselectedTrack}
                                            trackStyle={styles.track}
                                            customMarker={Round}
                                        />
                                    </View>
                                </>
                            }
                            <View style={{ marginTop: "6%", flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", width: "100%", }}>


                                {currentLoc ?

                                    <Pressable onPress={() => {
                                        handleLocationSend("submit")
                                        dispatch(update_Islocationfilter(false));
                                    }} style={[styles.buttoncontainer, { marginLeft: "5%" }]}>
                                        <Text style={styles.btntxt}>{t('Submit')}</Text>
                                    </Pressable>

                                    :

                                    <>
                                        <Pressable onPress={() => { dispatch(update_Islocationfilter(false)), navigation.navigate("LocationHome", { from: activeTab, setAddress: "currentLoc" }) }} style={styles.locabutton}>
                                            <Text style={styles.btntxt}>{t('Change')}</Text>
                                        </Pressable>
                                    </>

                                }

                            </View>

                        </View>

                    </View>

                </View>
            </Modal>
        </View>
    )
}

export default LocationPopup
const styles = StyleSheet.create({
    btncontainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

    },
    modalcontainer: {
        backgroundColor: c.secondary,
        width: '93%',
        borderRadius: borderradius * 0.6,
        paddingHorizontal: "4%",
        paddingVertical: "4%",


    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    loctxt: {
        width: "80%",
        verticalAlign: 'middle',
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        paddingVertical: 10,
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
        width: '30%',
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
        width: '30%',
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

});