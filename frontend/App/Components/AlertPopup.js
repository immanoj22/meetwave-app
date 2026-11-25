import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { c } from '../Utilities/colors';
import { Fonts } from '../Utilities/fonts';
import { devicewidth } from '../Utilities/Dimensions';
import { useTranslation } from 'react-i18next';

const normalizeBody = (children, contentStyle) => {
    if (children == null || children === false) {
        return null;
    }
    if (typeof children === 'string' || typeof children === 'number') {
        return <Text style={contentStyle}>{String(children)}</Text>;
    }
    if (React.isValidElement(children) && children.type === Text) {
        return React.cloneElement(children, {
            style: [contentStyle, children.props?.style],
        });
    }
    return children;
};

const AlertPopup = ({ visible, title, onClose, children, onSubmit }) => {
    const { t } = useTranslation();
    const hasTitle = Boolean(title && String(title).trim());
    const body = normalizeBody(children, styles.content);

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    {hasTitle ? (
                        <Text style={styles.title}>{title}</Text>
                    ) : null}

                    {body ? <View style={styles.body}>{body}</View> : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.85}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>{t('Close')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.85}
                            onPress={onSubmit}
                        >
                            <Text style={styles.buttonText}>{t('Ok')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AlertPopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalBox: {
        maxWidth: devicewidth * 0.78,
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: c.secondary,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 9,
        elevation: 5,
    },
    title: {
        fontSize: RFValue(17),
        fontWeight: '600',
        marginBottom: 6,
        fontFamily: Fonts.Medium,
        textAlign: 'center',
        color: c.white,
    },
    body: {
        alignItems: 'center',
        maxWidth: '100%',
    },
    content: {
        textAlign: 'center',
        color: c.white,
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        lineHeight: RFValue(18),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    button: {
        minWidth: 70,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginHorizontal: 6,
        backgroundColor: c.intermediate,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: RFValue(13),
        textAlign: 'center',
        fontFamily: Fonts.SemiBold,
        color: c.white,
    },
});
