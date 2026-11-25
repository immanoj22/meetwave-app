import React, { useContext } from "react"
import { Text, Pressable } from "react-native"
import { borderradius } from "../Utilities/Dimensions";
import { c } from "../Utilities/colors";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../Utilities/fonts";

const Button = (props) => {
    return (
        <Pressable onPress={() =>props?.onpress()} style={{
            width: "50%",
            borderRadius: borderradius * 1.5,
            backgroundColor: c.white,
            alignItems: "center",
            justifyContent: "center",
            borderColor: c.white,
            padding: "2%",
            shadowOpacity:0.3,
            //shadowColor:c.intermediate,
            alignSelf:"center",
            marginTop: props?.top ? props?.top : 0
        }}>
            <Text style={{ color: c.secondary, fontSize: RFValue(17), fontFamily: Fonts.Bold }}>{props.title}</Text>
        </Pressable>


    )
}
export default Button;

