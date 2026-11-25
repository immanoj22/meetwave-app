import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { devicewidth } from "../../Utilities/Dimensions";
import { c } from "../../Utilities/colors";
import { Images } from "../../Utilities/images";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { useState } from "react";
import { t } from "i18next";

const GenderInputModal = ({ visible, title, onClose, children, value, updateFn, onSubmit }) => {


    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}>

            <View style={styles.overlay}>

                <View style={styles.modalBox}>

                    <Pressable
                        onPress={onClose}
                        style={{ borderColor: c.white, borderRadius: 25, borderWidth: 0, width: "12.1%", elevation: 1, backgroundColor: c.secondary, alignSelf: "flex-end" }}>{Images.close}
                    </Pressable>

                    <Text style={{ fontFamily: Fonts.Medium, fontSize: RFValue(14), marginTop: 10, color: c.intermediate }}>{t('Please_identify_the_gender_by_which_you_identify')}</Text>

                    <View style={{ borderColor: c.secondary, borderWidth: 1, borderRadius: 10, marginVertical: 15 }}>
                        <TextInput
                            placeholderTextColor={c.orange}
                            placeholder="Enter Gender"
                            style={styles.inputtxtstyle}
                            value={value}
                            onChangeText={(text) => updateFn(text)}
                            keyboardType='default'>
                        </TextInput>
                    </View>

                    <Pressable onPress={onSubmit}
                        style={{ backgroundColor: c.secondary, borderRadius: 15 }}>
                        <Text style={styles.button}>{t('Submit')}</Text>
                    </Pressable>
                </View>

            </View>
        </Modal>
    )
}
export default GenderInputModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: devicewidth * 0.90,
        backgroundColor: c.white,
        borderRadius: 10,
        padding: 20,
    },
    inputtxtstyle: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
        color: c.black,
        width: '100%',
        padding: 10,
        paddingLeft: 10
    },
    button: {
        color: c.white,
        padding: 13,
        verticalAlign: "middle",
        fontFamily: Fonts.Medium,
        fontSize: RFValue(14),
        alignSelf: "center"
    }

})