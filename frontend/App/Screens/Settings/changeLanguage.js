import { View, Text, StyleSheet, Pressable, StatusBar, FlatList } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { GetItem, SetItem } from '../../Actions/localstorage';
import { useTranslation } from 'react-i18next';

import i18n from '../../Assets/i18n/i18n';
import { LanguageChange } from '../../Actions/hooks';

const ChangeLanguage = (props) => {

    const { t } = useTranslation();
    const userID = GetItem("UserId")

    const navigation = useNavigation();
    const [languageList, setLanguageList] = useState([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'zh', name: 'Mandarin' },
        { code: 'fr', name: 'French' },
        { code: 'it', name: 'Italian' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ru', name: 'Russian' },
        { code: 'ne', name: 'Nepalese' },
        { code: 'sr', name: 'Serbian' }
    ]);


    const renderLanguageItem = ({ item }) => (
        <Pressable
            onPress={() => {
                changeLanguage(item.code, item.name);
            }}
            style={styles.pressable}>
            <Text style={styles.itemText}>{item.name}</Text>
        </Pressable>
    );


    const changeLanguage = (lng, name) => {
        i18n.changeLanguage(lng);
        SetItem("CurrentLanguage", lng)
        callLangChange(name)
        navigation.goBack()
    };

    const callLangChange = async (name) => {

        let payload = {
            "userId": userID,
            "language": name.toLowerCase(),
        }
        const result = await LanguageChange(payload)

    }

     const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                            <Pressable onPress={handleBack} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>

                        </View>
                    </View>

                    <View style={{ width: "100%", height: deviceheight * 0.88 }}>

                        <FlatList
                            data={languageList}
                            renderItem={renderLanguageItem}
                            keyExtractor={(item) => item.code} // Use the language code as key
                            ListEmptyComponent={<Text style={styles.noDataText}>{t('No_Data_Found')}</Text>}
                            onEndReachedThreshold={0.1}
                            contentContainerStyle={{ paddingBottom: '8%' }}
                        />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export default ChangeLanguage;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: devicewidth,
        height: deviceheight
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
        fontSize: RFValue(19),
        textAlign: "center"
    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0520,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.9,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        marginLeft: "1%"
    },
    genderItem: {
        padding: 10,
        borderBottomWidth: 0.4,
        borderBottomColor: '#ccc',
    },
    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    noDataText: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: 'center',
        marginTop: 20,
    },

    pressable: {
        width: "100%",
        borderColor: "#DEDEDE",
        borderWidth: 0.3,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingVertical: "3.5%"

    },
    itemText: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(18),
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
    },
});
