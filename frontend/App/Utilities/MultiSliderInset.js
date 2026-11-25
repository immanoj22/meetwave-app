import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { devicewidth } from "./Dimensions";

/** MultiSlider positions markers at `left: position - 24` (see node_modules MultiSlider.js). */
export const SLIDER_MARKER_INSET = 24;

/** Library defaults — low slipDisplacement freezes the thumb when the finger drifts vertically. */
export const SLIDER_TOUCH = {
    height: 50,
    width: 50,
    borderRadius: 15,
    slipDisplacement: 200,
};

export const sliderTrackContainerStyle = {
    width: "100%",
    paddingHorizontal: SLIDER_MARKER_INSET,
    overflow: "visible",
    minHeight: 50,
    justifyContent: "center",
};

const defaultTrackWidth = Math.max(
    0,
    Math.round(devicewidth * 0.9) - SLIDER_MARKER_INSET * 2
);

export function useSliderTrackWidth(initialWidth = defaultTrackWidth) {
    const [sliderTrackWidth, setSliderTrackWidth] = useState(initialWidth);
    const isDraggingRef = useRef(false);

    const onLayout = useCallback((e) => {
        if (isDraggingRef.current) return;
        const outerWidth = Math.floor(e.nativeEvent.layout.width);
        const innerWidth = Math.max(0, outerWidth - SLIDER_MARKER_INSET * 2);
        if (innerWidth > 0) {
            setSliderTrackWidth((prev) => (prev === innerWidth ? prev : innerWidth));
        }
    }, []);

    const onDragStart = useCallback(() => {
        isDraggingRef.current = true;
    }, []);

    const onDragEnd = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    return { sliderTrackWidth, onLayout, onDragStart, onDragEnd, isDraggingRef };
}

/** Pair with BottomSheetScrollView: `scrollEnabled={scrollEnabled}` */
export function useSliderScrollLock() {
    const [isSliderDragging, setIsSliderDragging] = useState(false);

    const getSliderProps = useCallback((props = {}) => ({
        ...props,
        onValuesChangeStart: (...args) => {
            setIsSliderDragging(true);
            props.onValuesChangeStart?.(...args);
        },
        onValuesChangeFinish: (...args) => {
            setIsSliderDragging(false);
            props.onValuesChangeFinish?.(...args);
        },
    }), []);

    return {
        isSliderDragging,
        scrollEnabled: !isSliderDragging,
        getSliderProps,
    };
}

/**
 * MultiSlider with horizontal inset so thumbs are not clipped at min/max.
 * Pass through all MultiSlider props except sliderLength (computed from layout).
 */
export function InsetMultiSlider({
    style,
    containerStyle,
    touchDimensions,
    onValuesChangeStart,
    onValuesChangeFinish,
    ...props
}) {
    const { sliderTrackWidth, onLayout, onDragStart, onDragEnd } = useSliderTrackWidth();

    const handleDragStart = useCallback(() => {
        onDragStart();
        onValuesChangeStart?.();
    }, [onDragStart, onValuesChangeStart]);

    const handleDragFinish = useCallback(
        (values) => {
            onDragEnd();
            onValuesChangeFinish?.(values);
        },
        [onDragEnd, onValuesChangeFinish]
    );

    return (
        <View style={[sliderTrackContainerStyle, style]} onLayout={onLayout} collapsable={false}>
            <MultiSlider
                {...props}
                sliderLength={sliderTrackWidth}
                markerOffsetX={0}
                markerOffsetY={0}
                touchDimensions={touchDimensions ?? SLIDER_TOUCH}
                onValuesChangeStart={handleDragStart}
                onValuesChangeFinish={handleDragFinish}
                containerStyle={[{ alignSelf: "stretch", overflow: "visible" }, containerStyle]}
            />
        </View>
    );
}
