import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, ScrollView, StatusBar } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from 'react-i18next';

const GroupList = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const group = [
        {
            title: "Team Meetwave",
            subtitle: "Select the date",
            time: "3",
            msg: "3"
        },
        {
            title: "Team Meetwave",
            subtitle: "Select the date",
            time: "2",
            msg: "5"
        },
        {
            title: "Team Meetwave",
            subtitle: "Select the date",
            time: "4",
            msg: "4"
        },
        {
            title: "Team Meetwave",
            subtitle: "Select the date",
            time: "3",
            msg: "3"
        },
        {
            title: "Team Meetwave",
            subtitle: "Select the date",
            time: "2",
            msg: "5"
        },

    ]
    return (
        <View style={styles.container}>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>
                            <Pressable onPress={() => navigation.navigate("CreateGroup")} style={styles.editbox}>
                                {Images.edit2}
                            </Pressable>

                        </View>
                    </View>

                    <View style={{ width: "100%", height: "88%", }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: "10%", marginTop: "4%" }}>
                                <View style={{ width: "90%", alignSelf: "center", }}>
                                    <View style={{ width: '100%', flexDirection: 'row', alignItems: "center" }}>
                                        <Pressable style={styles.searchcontainer}>
                                            {Images.search1}
                                            <TextInput
                                                placeholderTextColor={'#F7E5D0'}
                                                placeholder="Search"
                                                style={styles.inputtxtstyle}
                                            />
                                        </Pressable>
                                        <Pressable style={styles.closebox}>
                                            {Images.close1}
                                        </Pressable>
                                    </View>
                                    {group.map((e, index) => (
                                        <Pressable onPress={() => navigation.navigate("ChatGroup")} key={index} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "8%" }}>


                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                {Images.group}
                                                <View style={{ marginLeft: "4%" }}>
                                                    <Text style={styles.gptitle}>{e.title}</Text>
                                                    <Text style={styles.gpsubtitle}>{e.subtitle}</Text>
                                                </View>

                                            </View>

                                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                                <Text style={styles.timetxt}>{e.time} {t('min_ago')}</Text>
                                                <View style={styles.msgbox}>
                                                    <Text style={styles.msgtxt}>{e.msg}</Text>
                                                </View>
                                            </View>

                                        </Pressable>
                                    ))}


                                </View>

                            </View>
                        </ScrollView>
                    </View>



                </View>
            </LinearGradient>

        </View>
    )
}

export default GroupList

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
        fontSize: RFValue(16),


    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(12),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "12%",
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
        fontSize: RFValue(19),
        textAlign: "center"
    },

    editbox: {
        width: devicewidth * 0.09,
        height: devicewidth * 0.09,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",

    },

    gptitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),


    },
    gpsubtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),

    },
    timetxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
    },
    msgbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2%"

    },
    msgtxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(10),
    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0530,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.9,
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
    }



});
