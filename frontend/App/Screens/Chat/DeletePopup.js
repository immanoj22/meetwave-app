import { View, Text, ActivityIndicator, Modal, StyleSheet, Pressable, Keyboard } from 'react-native'
import React from 'react'
import { c } from '../../Utilities/colors';
import { borderradius, devicewidth } from '../../Utilities/Dimensions';
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from '../../Utilities/fonts';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';

const DeletePopup = ({ modalVisible, setModalVisible, deleteMeFn, deleteEvrFn, msgEvery }) => {

    const { t } = useTranslation();

    // Function to close the modal when touching outside
    const handleOutsideTouch = () => {
        setModalVisible(false);
        Keyboard.dismiss(); // Optional: Dismiss the keyboard if open
    };

    return (

        <View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>


                <GestureHandlerRootView style={styles.container}>
                    <View style={styles.modalcontainer}>
                        <Text style={{ fontSize: RFValue(14), fontFamily: Fonts.Regular, color: c.black }}>{t('Delete_Message')}?</Text>
                        <View style={{ alignItems: "flex-end", marginTop: "6%" }}>
                            {msgEvery &&
                                <Pressable onPress={() => {
                                    {
                                        deleteEvrFn(); // Call the delete function for everyone
                                        setModalVisible(false); // Close the modal
                                    }
                                }} >
                                    <View style={{ marginTop: "4%", padding: devicewidth * 0.025, alignItems: "flex-end" }}>
                                        <Text style={styles.txt}>{t('Delete_every')}</Text>
                                    </View>
                                </Pressable>
                            }
                            <Pressable onPress={() => {
                                {
                                    deleteMeFn(); // Call the delete function for me
                                    setModalVisible(false); // Close the modal
                                }
                            }} >
                                <View onPress={() => {

                                }} style={{ marginTop: "4%", padding: devicewidth * 0.025, alignItems: "flex-end" }}>
                                    <Text style={styles.txt}>{t('Delete_me')}</Text>
                                </View>
                            </Pressable>

                            <Pressable onPress={() => { { setModalVisible(!modalVisible) } }} >
                                <Pressable style={{ marginTop: "4%", padding: devicewidth * 0.025, alignItems: "flex-end" }}>
                                    <Text style={styles.txt}>{t('Cancel')}</Text>
                                </Pressable>
                            </Pressable>
                        </View>
                    </View>

                </GestureHandlerRootView>
            </Modal>
        </View>

    )
}

export default DeletePopup
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
        backgroundColor: c.white,
        width: '90%',
        borderRadius: borderradius * 1,
        paddingHorizontal: "6%",
        paddingVertical: "4%",

    },
    txt: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.secondary
    }


});