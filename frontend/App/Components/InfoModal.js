import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { c } from "../Utilities/colors";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../Utilities/fonts";
import { devicewidth } from "../Utilities/Dimensions";
import { t } from "i18next";

const InfoModal = ({ visible, title, content, onClose, children }) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose} >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    {/* <Text style={styles.title}>{title}</Text> */}
                    {/* <Text style={styles.content}>{content}</Text> */}
                    <Text style={styles.content}>Please select <Text style={styles.contentall}>all</Text> hobbies that apply to you</Text>
                    <Text style={styles.content}>This will allow other users to find you when they search for those hobbies</Text>
                    <Text style={styles.content}>You can adjust these at any time in your profile settings</Text>

                    <Pressable onPress={onClose}
                        style={{ backgroundColor: c.secondary, borderRadius: 15, marginTop: 15, marginHorizontal: 40 }}>
                        <Text style={styles.button}>{t('Continue')}</Text>
                    </Pressable>

                </View>
            </View>
        </Modal >
    );

}
export default InfoModal;

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
        elevation: 5,
    },
    content: {
        marginVertical: 5,
        textAlign: 'justify',
        color: c.orange,
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium
    },
    contentall: {
        marginVertical: 5,
        textAlign: 'justify',
        color: c.orange,
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        textDecorationLine: "underline"
    },
    button: {
        color: c.white,
        padding: 13,
        verticalAlign: "middle",
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(14),
        alignSelf: "center",
    },
    title: {
        fontSize: RFValue(18),
        fontWeight: '600',
        marginBottom: 10,
        fontFamily: Fonts.SemiBold,
        textAlign: 'center',
        color: c.secondary,
    },
})