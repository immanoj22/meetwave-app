import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { RFValue } from "react-native-responsive-fontsize";
import {
    SLIDER_TOUCH,
    sliderTrackContainerStyle,
    useSliderTrackWidth,
} from "../../Utilities/MultiSliderInset";
import { c } from "../../Utilities/colors";
import { Fonts } from "../../Utilities/fonts";

const SLIDER_MARKER_SIZE = 28;
const SLIDER_MARKER_RADIUS = SLIDER_MARKER_SIZE / 2;

const SliderThumb = () => (
    <View
        style={{
            width: SLIDER_MARKER_SIZE,
            height: SLIDER_MARKER_SIZE,
            backgroundColor: "#fff",
            borderRadius: SLIDER_MARKER_RADIUS,
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <View
            style={{
                width: 20,
                height: 20,
                backgroundColor: c.primary,
                borderRadius: 10,
            }}
        />
    </View>
);

const KM_VALUE_MIN_WIDTH = 72;
const TABULAR_NUMS = Platform.OS === "ios" ? { fontVariant: ["tabular-nums"] } : null;

const DistanceValueLabel = React.memo(function DistanceValueLabel({ value, unit, style }) {
    return (
        <View style={{ minWidth: KM_VALUE_MIN_WIDTH, alignItems: "flex-end" }}>
            <Text style={[style, TABULAR_NUMS]} numberOfLines={1}>
                {value} {unit}
            </Text>
        </View>
    );
});

/**
 * Age + radius sliders with local drag state so the parent filter screen
 * (and hobby lists) do not re-render on every pan frame.
 */
export const FilterAgeDistanceSliders = React.memo(function FilterAgeDistanceSliders({
    showAge,
    ageValues,
    distanceValues,
    onAgeFinish,
    onDistanceFinish,
    onSliderDragStart,
    onSliderDragEnd,
    t,
    styles,
}) {
    const [values, setValues] = useState(ageValues);
    const [distance, setDistance] = useState(distanceValues);
    const { sliderTrackWidth, onLayout, onDragStart, onDragEnd } = useSliderTrackWidth();

    const isDraggingRef = useRef(false);

    useEffect(() => {
        // Only update local state if not currently dragging to avoid "jumping"
        if (!isDraggingRef.current) {
            setValues(ageValues);
        }
    }, [ageValues?.[0], ageValues?.[1]]);

    useEffect(() => {
        if (!isDraggingRef.current) {
            setDistance(distanceValues);
        }
    }, [distanceValues?.[0]]);

    const notifyDragStart = useCallback(() => {
        isDraggingRef.current = true;
        onDragStart();
        onSliderDragStart?.();
    }, [onDragStart, onSliderDragStart]);

    const notifyDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        onDragEnd();
        onSliderDragEnd?.();
    }, [onDragEnd, onSliderDragEnd]);

    const handleAgeFinish = useCallback(
        (v) => {
            notifyDragEnd();
            onAgeFinish(v);
        },
        [notifyDragEnd, onAgeFinish]
    );

    const handleDistanceFinish = useCallback(
        (v) => {
            notifyDragEnd();
            onDistanceFinish(v);
        },
        [notifyDragEnd, onDistanceFinish]
    );

    const sliderCommonProps = React.useMemo(() => ({
        sliderLength: sliderTrackWidth,
        allowOverlap: true,
        selectedStyle: styles.selectedTrack,
        unselectedStyle: styles.unselectedTrack,
        trackStyle: styles.track,
        customMarker: SliderThumb,
        touchDimensions: SLIDER_TOUCH,
        onValuesChangeStart: notifyDragStart,
        markerOffsetX: 0,
        markerOffsetY: 0,
        containerStyle: { alignSelf: "stretch", overflow: "visible" },
    }), [sliderTrackWidth, styles.selectedTrack, styles.unselectedTrack, styles.track, notifyDragStart]);

    return (
        <>
            {showAge ? (
                <View style={{ marginTop: "5%" }}>
                    <View style={[styles.lableHearder, { justifyContent: "space-between" }]}>
                        <Text style={[styles.lablesubtitle, { flex: 1, marginRight: 8 }]} numberOfLines={1}>
                            {t("Age")}
                        </Text>
                        <Text style={[styles.valueLabel, TABULAR_NUMS, { flex: 0, minWidth: KM_VALUE_MIN_WIDTH }]} numberOfLines={1}>
                            {values.join(" - ")}
                        </Text>
                    </View>
                    <View style={sliderTrackContainerStyle} onLayout={onLayout} collapsable={false}>
                        <MultiSlider
                            {...sliderCommonProps}
                            values={values}
                            onValuesChange={setValues}
                            onValuesChangeFinish={handleAgeFinish}
                            min={18}
                            max={100}
                            step={1}
                        />
                    </View>
                </View>
            ) : null}

            <View
                style={{
                    marginTop: showAge ? "5%" : 0,
                    marginBottom: "2%",
                }}
            >
                <View style={[styles.lableHearder, { justifyContent: "space-between" }]}>
                    <Text
                        style={[styles.title, { flex: 1, flexShrink: 1, marginRight: 8 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {t("Search_Radius_(kmFromMe)")}
                    </Text>
                    <DistanceValueLabel
                        value={distance[0]}
                        unit={t("km")}
                        style={[styles.valueLabel, { flex: 0 }]}
                    />
                </View>
                <View
                    style={sliderTrackContainerStyle}
                    onLayout={showAge ? undefined : onLayout}
                    collapsable={false}
                >
                    <MultiSlider
                        {...sliderCommonProps}
                        values={distance}
                        onValuesChange={setDistance}
                        onValuesChangeFinish={handleDistanceFinish}
                        min={0}
                        max={100}
                        step={1}
                    />
                </View>
            </View>
        </>
    );
});

/** Lightweight placeholder while the hobby tree is deferred off the first frame. */
export function HobbiesTreePlaceholder({ label, styles }) {
    return (
        <View style={[styles.hobbiesInitialLoader, { minHeight: RFValue(48) }]}>
            <Text
                style={{
                    fontFamily: Fonts.Regular,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: RFValue(12),
                }}
            >
                {label}
            </Text>
        </View>
    );
}
