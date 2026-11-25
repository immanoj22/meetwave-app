import { View, Text, Modal, StyleSheet, Pressable, TextInput, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight } from '../../Utilities/Dimensions';
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from '../../Utilities/fonts';
import { useTranslation } from 'react-i18next';

const BiodetailPopup = ({ modalVisible, bioDesc, setModalVisible, setBioDescription, submit }) => {

    const { t } = useTranslation();
    const handleSend = () => {
        if (bioDesc.trim() !== "") {
            Keyboard.dismiss(); // Hide keyboard after sending
        }
    };
    const [keyboardvisible, setKeyboardvisible] = useState(false)

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            (event) => {
                setKeyboardvisible(true)
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setKeyboardvisible(false)
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const closefn = () => {
        if (keyboardvisible) {
            Keyboard.dismiss()
        }
        else {
            setModalVisible(false)
            setBioDescription("");
        }
    }

    return (
        <View style={styles.btncontainer}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>

                <View onStartShouldSetResponder={() => closefn()} style={styles.container}>
                    <View style={styles.modalcontainer}>
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontSize: RFValue(18), fontFamily: Fonts.SemiBold, color: c.grey, }}>{t('Bio')}</Text>

                            <View style={styles.desccontainer}>

                                <TextInput
                                    multiline={true}
                                    placeholderTextColor={"#F7E5D0"}
                                    style={styles.Destxtstyle}
                                    value={bioDesc}
                                    placeholder={t('Enter_the_Bio')}
                                    onChangeText={setBioDescription}
                                    //blurOnSubmit={true} // Ensures the keyboard dismisses on submit
                                    submitBehavior="blurAndSubmit"
                                    onSubmitEditing={handleSend} // Triggers when return key is pressed
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === "Enter") {
                                            handleSend();
                                        }
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: "6%", justifyContent: 'flex-end' }}>

                            <Pressable onPress={() => submit("submit")} style={{ marginTop: "4%", marginRight: 20 }}>
                                <Text style={styles.txt}>{t('Submit')}</Text>
                            </Pressable>

                            <Pressable onPress={() => submit("cancel")} style={{ marginTop: "4%", }}>
                                <Text style={styles.txt}>{t('Cancel')}</Text>
                            </Pressable>

                        </View>

                    </View>

                </View>
            </Modal>
        </View>
    )
}

export default BiodetailPopup
const styles = StyleSheet.create({
    btncontainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',

    },
    modalcontainer: {
        backgroundColor: c.secondary,
        width: '90%',
        borderRadius: borderradius * 1,
        paddingHorizontal: "6%",
        paddingVertical: "6%",

    },
    txt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Medium,
        color: c.white
    },

    Destxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        height: '100%',
        paddingTop: 10,
        textAlignVertical: 'top',
        justifyContent: 'flex-start',
        position: 'relative'
    },
    desccontainer: {
        width: '100%',
        alignItems: 'center',
        height: deviceheight * 0.200,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.5,
        borderColor: c.white,
        borderWidth: 0.9,
        alignSelf: 'baseline',
        marginTop: "4%"
    }


});