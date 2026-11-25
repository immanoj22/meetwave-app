import { Text, StyleSheet, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "./fonts";
import { c } from "./colors";
import { useTranslation } from "react-i18next";


export default function NoData() {
    const { t } = useTranslation();

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{
                fontFamily: Fonts.Bold,
                color: c.white,
                fontSize: RFValue(16),
            }}> {t('No_Data_Found')}
            </Text>
        </View>
    )

}
