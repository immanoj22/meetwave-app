


import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Fonts } from '../Utilities/fonts'
import { c } from '../Utilities/colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { useNavigation } from '@react-navigation/native'
import { deviceheight, devicewidth } from '../Utilities/Dimensions'
import { Images } from '../Utilities/images'

const Commonheader = ({
    title,
    onback,
    isback = true,
    istitle = true,
    height,
    width
}) => {
    const backButtonSize = devicewidth * 0.10;

    return (
        <View style={{
            width: width ?? "90%",
            alignSelf: "center",
            height: height ?? deviceheight * 0.1,
            flexDirection: "row",
            alignItems: "center",
        }} >
            <View style={{ width: isback ? backButtonSize : 0 }}>
                {isback ? (
                    <Pressable
                        onPress={onback}
                        style={{
                            width: backButtonSize,
                            height: backButtonSize,
                            borderRadius: backButtonSize / 2,
                            backgroundColor: "#fff",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        {Images.back}
                    </Pressable>
                ) : null}
            </View>

            {istitle ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 }}>
                    <Text
                        numberOfLines={2}
                        style={{
                            fontFamily: Fonts.ExtraBold,
                            color: c.white,
                            fontSize: RFValue(19),
                            textAlign: "center",
                        }}>{title}</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }} />
            )}

            <View style={{ width: isback ? backButtonSize : 0 }} />
        </View>
    )
}

export default Commonheader