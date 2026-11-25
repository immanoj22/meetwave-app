import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

/**
 * Height-driven expand/collapse for hobby chips (Selected / Popular).
 * Avoids react-native-collapsible's "starts expanded → height 0" bug inside bottom sheets,
 * while keeping motion close to Accordion (220ms, cubic easing).
 */
export default function CollapsingHobbySection({
    expanded,
    duration = 220,
    children,
}) {
    const [fullH, setFullH] = useState(0);
    const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: expanded ? 1 : 0,
            duration,
            easing: expanded
                ? Easing.out(Easing.cubic)
                : Easing.in(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [expanded, duration, progress]);

    const onInnerLayout = useCallback((e) => {
        const h = Math.ceil(e.nativeEvent.layout.height);
        if (h > 0) setFullH((prev) => (prev === h ? prev : h));
    }, []);

    const hasMeasured = fullH > 0;
    const animatedHeight =
        hasMeasured &&
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, fullH],
        });

    return (
        <Animated.View
            style={{
                width: "100%",
                overflow: "hidden",
                ...(hasMeasured ? { height: animatedHeight } : expanded ? {} : { height: 0 }),
            }}
        >
            <View collapsable={false} onLayout={onInnerLayout}>
                {children}
            </View>
        </Animated.View>
    );
}
