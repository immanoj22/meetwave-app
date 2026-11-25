import FlashMessage from "react-native-flash-message";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "./fonts";
import { borderradius } from "./Dimensions";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const FlashMessagecomp = () => {
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top || StatusBar.currentHeight || 0;
    return (
        <FlashMessage
            floating={"Yes"}
            animated={true}
            textStyle={{ fontFamily: Fonts.Regular, fontSize: RFValue(12) }}
            titleStyle={{ fontFamily: Fonts.Bold, fontSize: RFValue(14) }}
            position="top"
            statusBarHeight={statusBarHeight}
            style={{
                // Add a little breathing room below the status bar/battery area.
                marginTop: 8,
                borderRadius: borderradius * 0.3,
            }}
        />
    );
};

export default FlashMessagecomp;