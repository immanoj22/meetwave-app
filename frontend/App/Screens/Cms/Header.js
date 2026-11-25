import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';

const Header = (props) => {
    const navigation = useNavigation();

    return (
        <View style={{}}>
            <View style={styles.backcontainer}>
                <View style={{ width: "100%", salignSelf: "center", flexDirection: "row",  alignItems: "center", }}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                        {Images.back}
                    </Pressable>
                    <Text style={styles.headertxt}>{props.header}</Text>
                </View>
            </View>

        </View>
    );
}

export default Header;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"blue"
    },
    boxcontainer: {
        flex: 1,
        width: devicewidth,
        height: deviceheight,
      
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
        paddingHorizontal:15,
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
        width:"80%",
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
        textAlign:'center',
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
        fontSize: RFValue(13),
        fontFamily: Fonts.Light,
        color: c.grey,
        letterSpacing: 0.3,
        textAlign: "justify"
    },
});
