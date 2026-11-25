import { View, Text, Modal, StyleSheet, Pressable, Keyboard } from 'react-native'
import React from 'react'
import { c } from '../../Utilities/colors';
import { borderradius } from '../../Utilities/Dimensions';
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from '../../Utilities/fonts';

import { useTranslation } from 'react-i18next';
import { GetItem } from '../../Actions/localstorage';

const GroupPopup = ({ modalVisible, setModalVisible, deleteFn, exitFn, reportFn, blockFn, cretor, clearChatFn, redirectFn, moreOpt }) => {

    const { t } = useTranslation();
    const user_Id = GetItem('UserId');
    const admin_Id = GetItem('AdminID');

    return (
        <View style={styles.btncontainer}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }} >
                <View onStartShouldSetResponder={() => setModalVisible(!modalVisible)} style={styles.container}>

                    <View style={styles.container}>
                        <View style={styles.modalcontainer}>
                            <View style={{ alignItems: "center" }}>
                                <Text style={{ fontSize: RFValue(18), fontFamily: Fonts.SemiBold, color: c.grey, }}>{t('More_Opt')}</Text>
                            </View>

                            <View style={{ alignItems: "flex-end", marginTop: "6%" }}>
                                {moreOpt ?
                                    <>
                                        <Pressable onPress={() => {
                                            exitFn(); // Call the delete function for everyone
                                            setModalVisible(false); // Close the modal
                                        }} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('Exit_Grp')}</Text>
                                        </Pressable>

                                        <Pressable onPress={() => {
                                            clearChatFn(); // Call the delete function for me
                                            setModalVisible(false); // Close the modal
                                        }} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('ClearChat')}</Text>
                                        </Pressable>
                                        
                                        {user_Id == admin_Id ?
                                            <Pressable onPress={() => {
                                                deleteFn(); // Call the delete function for everyone
                                                setModalVisible(false); // Close the modal
                                            }} style={{ marginTop: "4%" }}>
                                                <Text style={styles.txt}>{t('Delete_Grp')}</Text>
                                            </Pressable>
                                            : ""}
                                      
                                        <Pressable onPress={() => setModalVisible(!modalVisible)} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('Cancel')}</Text>
                                        </Pressable>
                                    </>
                                    :
                                    <>
                                        <Pressable onPress={() => {
                                            redirectFn(); // Call the delete function for everyone
                                            setModalVisible(false); // Close the modal
                                        }} style={{ marginTop: "2%" }}>
                                            <Text style={styles.txt}>{t('View_Prof')}</Text>
                                        </Pressable>

                                        <Pressable onPress={() => {
                                            clearChatFn(); // Call the delete function for me
                                            setModalVisible(false); // Close the modal
                                        }} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('ClearChat')}</Text>
                                        </Pressable>

                                        <Pressable onPress={() => {
                                            reportFn(); // Call the delete function for me
                                            setModalVisible(false); // Close the modal
                                        }} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('Report_Person')}</Text>
                                        </Pressable>

                                        <Pressable onPress={() => setModalVisible(!modalVisible)} style={{ marginTop: "4%" }}>
                                            <Text style={styles.txt}>{t('Cancel')}</Text>
                                        </Pressable>
                                    </>

                                }
                            </View>

                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default GroupPopup
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
    }


});