import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { borderradius, devicewidth } from "./Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "./fonts";
import Close3icon from "../Assets/icons/close3.svg";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_IsOnline, update_NetworkVisible } from "../Slices/helper";
import { useTranslation } from "react-i18next";

const Offline = ({ isConnected }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-1000)).current;
    const shake = useRef(new Animated.Value(0)).current;
    const { networkVisible } = useSelector(helperSelector)
    const dispatch = useDispatch();
    const { t } = useTranslation();


    useEffect(() => {

        dispatch(update_IsOnline(isConnected));

        if (isConnected) {
            shake.setValue(0);
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -1000,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                dispatch(update_NetworkVisible(false));
            });



        }
        else {

            dispatch(update_NetworkVisible(true));

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start();
        }

    }, [isConnected]);


    useEffect(() => {
        if (networkVisible) {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(shake, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [networkVisible])

    const rotateZ = shake.interpolate({
        inputRange: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1],
        outputRange: ["0deg", "-4deg", "4deg", "-4deg", "4deg", "-4deg", "0deg"],
    });

    const transform = [{ translateY }, { scale }, { rotateZ }];

    const handleClose = () => {
        console.log("Close button clicked");
        dispatch(update_NetworkVisible(false));
    };

    if (!networkVisible) return null;

    return (
        <>
            {!isConnected ? (
                <Animated.View style={[styles.offlineContainer, { transform }]}>
                    <Text style={styles.offlineText}>{t('No_Internet_Connection')}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Close3icon width={devicewidth * 0.076} height={devicewidth * 0.076} />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Animated.View style={[styles.onlineContainer, { transform }]}>
                    <Text style={styles.offlineText}>{t('You_are_connected')}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Close3icon width={devicewidth * 0.076} height={devicewidth * 0.076} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: "#D07C51",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "90%",
        paddingHorizontal: "4%",
        position: "absolute",
        bottom: 20,
        left: "5%",
        borderRadius: borderradius * 0.3,
        height: 40,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    offlineText: {
        color: "#fff",
        fontSize: RFValue(12),
        fontFamily: Fonts.Medium,
        width: "90%",
        textAlign: "center",
    },
    onlineContainer: {
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        width: "90%",
        position: "absolute",
        bottom: 20,
        left: "5%",
        borderRadius: borderradius * 0.3,
        height: 40,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    closeButton: {
        padding: 10, // Increase touchable area
        zIndex: 20,
    },
});

export default Offline;
