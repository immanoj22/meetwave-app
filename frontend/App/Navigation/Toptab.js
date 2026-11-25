import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import People from '../Screens/Home/people';
import Activities from '../Screens/Home/activites';
import Group from '../Screens/Home/group';
import {
  ImageBackground,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  BackHandler,
  Easing,
  InteractionManager,
  AppState,
} from 'react-native';
import { borderradius, deviceheight, devicewidth, pxToPercentage, } from '../Utilities/Dimensions';
import { c } from '../Utilities/colors';
import { Fonts } from '../Utilities/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { Images } from '../Utilities/images';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { GetAllchat, GetSingleChats, requestNotificationPermission, update_EventChatCount, update_filterBySearch, update_IsLogin, update_Notification, update_SingleChatCount, update_statusbarcolor } from '../Slices/helper';
import { SetItem, GetItem } from '../Actions/localstorage';
import { createConnection, JoinRoom, socket } from '../Actions/socket';
import { useState, useEffect } from 'react';
import { Fetchprofile, update_profile } from '../Slices/profile';
import CSearch from "../Assets/icons/C_search.svg"
import CFilter from "../Assets/icons/C_filter.svg"
import CChat from "../Assets/icons/C_chat.svg"
import CAlerts from "../Assets/icons/C_alerts.svg"
import MenuIcon from "../Assets/icons/roundMenu.svg"
import { randomimages } from '../Utilities/profileImages';
import { Imageurl } from '../Actions/constant';
import { useTranslation } from 'react-i18next';
import { showwarningmessage } from '../Actions/config';
import { warmAllFilterSheets } from '../Screens/Home/filterPagePreload';
import { navigateToFilterPage } from '../Utilities/filterSheetPresent';

const Tab = createMaterialTopTabNavigator();

const TAB_SCREENS = [
  { routename: 'People', labelKey: 'Toptab_People', component: People },
  { routename: 'Chat', labelKey: 'Toptab_Chat', component: Group },
  { routename: 'Activities', labelKey: 'Toptab_Activities', component: Activities },
];

// Map of route name -> i18n key so the custom tab bar can translate labels
// without us ever passing translated values through Tab.Screen options.
// Translating via `options.tabBarLabel: t(...)` rebuilds the screen options
// object on every render of the parent — that churns the navigator's screen
// config mid-swipe and is one of the things that desyncs react-native-pager-view.
const TAB_LABEL_KEYS = TAB_SCREENS.reduce((acc, tab) => {
    acc[tab.routename] = tab.labelKey;
    return acc;
}, {});

// Pre-built screen elements at module scope. These never change identity, so
// <Tab.Navigator> never has to reconcile new <Tab.Screen> children — which is
// what was racing the pager's native index and causing the swipe "jump back".
const TAB_SCREEN_ELEMENTS = TAB_SCREENS.map((tab) => (
    <Tab.Screen
        key={tab.routename}
        name={tab.routename}
        component={tab.component}
    />
));

// Purple pill / tab strip layout (aligned with padded navigator width below).
const TAB_BAR_ROW_HEIGHT = deviceheight * 0.062;
const TAB_TRAVELING_PILL_VERTICAL_INSET_FRAC = 0.10;
const TAB_TRAVELING_PILL_HEIGHT =
    TAB_BAR_ROW_HEIGHT * (1 - 2 * TAB_TRAVELING_PILL_VERTICAL_INSET_FRAC);
const TAB_SELECTION_CHIP_RADIUS = Math.min(
    RFValue(11),
    TAB_TRAVELING_PILL_HEIGHT * 0.32,
);

const CustomTopBar = React.memo((props) => {
    const { state, descriptors, navigation } = props;
    const { t } = useTranslation();

    const tabBarWidthRef = React.useRef(0);
    const [layoutVersion, setLayoutVersion] = React.useState(0);
    const routesLength = state.routes.length;
    const TAB_SELECTION_FILL = 0.96;
    const pillX = React.useRef(new Animated.Value(0)).current;
    const currentIndexRef = React.useRef(state.index);
    const targetIndexRef = React.useRef(state.index);

    const getTabWidth = React.useCallback(() => {
        const w = tabBarWidthRef.current;
        return w > 0 ? w / routesLength : 0;
    }, [routesLength]);

    const getPillX = React.useCallback((index) => {
        const tabWidth = getTabWidth();
        const indicatorWidth = tabWidth * TAB_SELECTION_FILL;
        const indicatorOffset = (tabWidth - indicatorWidth) / 2;
        return index * tabWidth + indicatorOffset;
    }, [getTabWidth]);

    const settleToIndex = React.useCallback((index) => {
        if (getTabWidth() <= 0) {
            return;
        }

        const targetX = getPillX(index);
        pillX.stopAnimation();
        pillX.setValue(targetX);
        currentIndexRef.current = index;
        targetIndexRef.current = index;
    }, [getPillX, getTabWidth, pillX]);

    const travel = React.useCallback((toIndex, quick = false) => {
        const clampedIndex = Math.max(0, Math.min(routesLength - 1, toIndex));
        targetIndexRef.current = clampedIndex;

        if (getTabWidth() <= 0) {
            currentIndexRef.current = clampedIndex;
            return;
        }

        const targetX = getPillX(clampedIndex);

        pillX.stopAnimation((value) => {
            const startX = typeof value === 'number' && !Number.isNaN(value)
                ? value
                : getPillX(currentIndexRef.current);

            if (Math.abs(startX - targetX) < 0.5) {
                settleToIndex(clampedIndex);
                return;
            }

            const travelPx = Math.abs(targetX - startX);
            const duration = quick
                ? 150
                : Math.max(180, Math.min(260, 140 + travelPx * 0.32));

            Animated.timing(pillX, {
                toValue: targetX,
                duration,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished) {
                    return;
                }

                settleToIndex(clampedIndex);
            });
        });
    }, [getPillX, getTabWidth, pillX, routesLength, settleToIndex]);

    // When layout is first measured, snap the pill to the current tab instantly
    // (no animation) so it starts in the right position.
    const handleTabBarLayout = React.useCallback((event) => {
        const nextWidth = event.nativeEvent.layout.width;
        if (Math.abs(tabBarWidthRef.current - nextWidth) < 0.5) return;
        tabBarWidthRef.current = nextWidth;
        settleToIndex(targetIndexRef.current);
        setLayoutVersion((n) => n + 1);
    }, [settleToIndex]);

    const indicatorWidth = React.useMemo(() => {
        const tabWidth = getTabWidth();
        return tabWidth * TAB_SELECTION_FILL;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layoutVersion, routesLength]);

    React.useEffect(() => {
        if (state.index === currentIndexRef.current && state.index === targetIndexRef.current) {
            settleToIndex(state.index);
            return;
        }

        travel(state.index, true);
    }, [settleToIndex, state.index, travel]);

    return (
        <View
            style={styles.tabBarContainer}
            onLayout={handleTabBarLayout}
        >
            {indicatorWidth > 0 && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.travelingPill,
                        {
                            width: indicatorWidth,
                            transform: [{ translateX: pillX }],
                        },
                    ]}
                />
            )}
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const labelKey = TAB_LABEL_KEYS[route.name];
                const label = labelKey
                    ? t(labelKey)
                    : options.tabBarLabel ?? options.title ?? route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    travel(index);
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // Use navigate so the pager animates like a swipe.
                        // `jumpTo` can switch instantly (feels like a laggy "teleport").
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        activeOpacity={0.8}
                        style={styles.tabItem}
                    >
                        <View style={styles.activePill}>
                            <Text style={styles.tabLabel}>
                                {label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

const TAB_SCREEN_OPTIONS = {
    animationEnabled: true,
    tabBarScrollEnabled: false,
    // Keep ALL three tab screens mounted from the start. With `lazy: true`
    // the act of swiping/tapping into a tab triggers a fresh mount of the
    // adjacent tab — that mount runs heavy `useEffect`s (API calls, socket
    // joins, list resets) on the JS thread *while* the pager is committing,
    // and the resulting JS thread stall is enough on Fabric / new-arch for
    // react-native-pager-view to abort the commit and rubber-band back to
    // the previous index ("snap back" symptom).
    lazy: false,
    freezeOnBlur: false,
};

const SCENE_CONTAINER_STYLE = { backgroundColor: 'transparent' };
const INITIAL_LAYOUT = {
    width: Math.round(devicewidth * (1 - 0.06)),
};
const RENDER_TAB_BAR = (tabProps) => <CustomTopBar {...tabProps} />;

/**
 * Fully stable navigator. No hooks that subscribe to changing values, no
 * inline-created options, no inline-mapped children — everything is module
 * scope or `useMemo`'d. React.memo with no props means this renders once
 * and stays put for the lifetime of Homescreen.
 *
 * NOTE: Redux's `filterBysearch.activeTab` is no longer synced from this
 * navigator. Each tab screen (people.js, group.js, activites.js) is responsible
 * for dispatching its own `activeTab` via `useFocusEffect`, which only fires
 * AFTER the tab is fully focused (never during a swipe). That avoids the
 * subtle "navigation state observer dispatches mid-transition" loop that was
 * still re-rendering subscribers and racing the pager.
 */
const HomeTabNavigator = React.memo(function HomeTabNavigator() {
    return (
        <Tab.Navigator
            // Pin the default tab explicitly. Without this, any momentary
            // remount (e.g. notification handler navigating to 'Homescreen',
            // or react-native-screens detaching/re-attaching) snaps the
            // navigator back to the first child route ("People") and is
            // visually identical to the swipe-revert symptom.
            initialRouteName="People"
            initialLayout={INITIAL_LAYOUT}
            sceneContainerStyle={SCENE_CONTAINER_STYLE}
            tabBar={RENDER_TAB_BAR}
            screenOptions={TAB_SCREEN_OPTIONS}
            swipeEnabled={true}
            keyboardDismissMode="none"
        >
            {TAB_SCREEN_ELEMENTS}
        </Tab.Navigator>
    );
});

function Homescreen(props) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { filterBysearch, singleChatCount } = useSelector(
        state => ({
            filterBysearch: state.helper.filterBysearch,
            singleChatCount: state.helper.singleChatCount,
        }),
        shallowEqual,
    )
    const profile = useSelector(state => state.profile.profile);
    const { search, activeTab } = filterBysearch;
    const User_Id = GetItem('UserId');
    const [onSearch, setOnSearch] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [localSearch, setLocalSearch] = useState(search || "");


    /* ================= BACK BUTTON HANDLER ================= */

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {

                Alert.alert(t('Holdon!'), t('Are_you_sure_want_exit?'), [
                    {
                        text: t('Cancel'),
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: t('YES'),
                        onPress: () => BackHandler.exitApp(),

                    },
                ]);
                return true;
            };

            const subscription =
                BackHandler.addEventListener(
                    'hardwareBackPress',
                    backAction
                );

            return () => subscription.remove();
        }, [t])
    );

    /* ================= TAB CHANGE ================= */
    // People → Quick Search screen only; close inline search when that tab is focused.
    useEffect(() => {
        if (activeTab !== "People") {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }
                setOnSearch(false);
                setLocalSearch("");
                dispatch(update_filterBySearch({ search: "" }));
            });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [activeTab, dispatch]);

    // Groups (Chat) + Events (Activities) share the same inline header search.
    useEffect(() => {
        if (activeTab !== "Chat" && activeTab !== "Activities") {
            return;
        }

        const trimmed = String(search ?? "").trim();
        if (!trimmed) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }
                setOnSearch(true);
                setLocalSearch(trimmed);
            });
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [activeTab, search]);

    // When inline search is closed, mirror Redux into the header field.
    // While onSearch is true, localSearch is the source of truth — do NOT
    // overwrite it from Redux or it fights the debounced dispatch below and
    // causes "Maximum update depth exceeded".
    useEffect(() => {
        if (onSearch) {
            return;
        }
        setLocalSearch(search || "");
    }, [search, onSearch]);

    // Debounce Redux updates while typing (group.js / activites.js debounce the fetch).
    useEffect(() => {
        if (!onSearch) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(update_filterBySearch({ search: localSearch.trim() }));
        }, 400);

        return () => clearTimeout(timer);
    }, [dispatch, localSearch, onSearch]);


    /* ================= STATUS BAR COLOR ================= */
    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary));
        }, [dispatch])
    );

    const profileFetchedRef = React.useRef(false);
    const appStateRef = React.useRef(AppState.currentState);

    useEffect(() => {
        if (!profileFetchedRef.current) {
            profileFetchedRef.current = true;

            dispatch(Fetchprofile(User_Id));
            requestNotificationPermission();
        }
    }, [dispatch, User_Id]);

    useEffect(() => {
        if (!socket || !User_Id) return;

        createConnection(User_Id);

        const singleChatHandler = (data) => {
            dispatch(update_SingleChatCount(data?.SingleChatCounts));
        };

        const eventChatHandler = (data) => {
            dispatch(update_EventChatCount(data?.eventChatCounts));
        };

        const notificationHandler = (data) => {
            console.log("Notification received:", data);
            if (Array.isArray(data?.data)) {
                dispatch(update_Notification(data.data));
            }
        };

        const notificationCountHandler = (data) => {
            console.log("Receive-Notification-->", data);
            if (typeof data?.data === "number") {
                const currentProfile =
                    profile && typeof profile === "object" ? profile : {};
                dispatch(update_profile({
                    ...currentProfile,
                    NotificationCount: data.data,
                }));
            }
        };

        const unblockHandler = () => {
            dispatch(Fetchprofile(User_Id));
            dispatch(GetSingleChats(1));
        };

        /* ----- REGISTER EVENTS ----- */

        socket.on("Singlechat_counts", singleChatHandler);
        socket.on("eventchat_counts", eventChatHandler);
        socket.on("notifications", notificationHandler);
        socket.on("notification_counts", notificationCountHandler);
        socket.on("unBlock", unblockHandler);

        /* ✅ VERY IMPORTANT CLEANUP */
        return () => {
            socket.off("Singlechat_counts", singleChatHandler);
            socket.off("eventchat_counts", eventChatHandler);
            socket.off("notifications", notificationHandler);
            socket.off("notification_counts", notificationCountHandler);
            socket.off("unBlock", unblockHandler);
        };

    }, [User_Id, dispatch, profile]);

    useEffect(() => {
        if (!User_Id) {
            return;
        }

        const subscription = AppState.addEventListener('change', nextAppState => {
            const wasBackgrounded = appStateRef.current.match(/inactive|background/);
            const isNowActive = nextAppState === 'active';

            if (wasBackgrounded && isNowActive) {
                createConnection(User_Id);
                dispatch(Fetchprofile(User_Id));
                dispatch(GetSingleChats(1));
                dispatch(GetAllchat(1));
            }

            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [User_Id, dispatch]);


    useEffect(() => {
        if (profile?.blockStatus === "blocked") {

            JoinRoom(profile?._id);
            showwarningmessage(t('blocked_by_Admin'));

            dispatch(update_IsLogin(false));
            SetItem("loginstatus", false);

            navigation.replace("Login"); // ✅ replace avoids stack issues
        }
    }, [profile, dispatch, navigation, t]);

    useEffect(() => {
        warmAllFilterSheets(User_Id);
    }, [User_Id]);


    useEffect(() => {

        const showListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(
                    Platform.OS === "ios"
                        ? pxToPercentage(e.endCoordinates.height, "height")
                        : e.endCoordinates.height
                );
            }
        );

        const hideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            showListener.remove();
            hideListener.remove();
        };

    }, []);


    const handleSearchChange = (text) => {
        setLocalSearch(text);
    };

    const handleFilterOpen = () => {
        navigateToFilterPage(navigation, activeTab);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ImageBackground source={Images.homebg} style={{ flex: 1 }}>
                <View style={styles.headerContainer}>
                    {onSearch ? (
                        <>
                            <View style={{ width: "95%", height: "60%", flexDirection: "row", alignItems: "center", alignSelf: 'center', justifyContent: 'space-between' }} >
                                <View style={{ flex: 1, flexDirection: "row", paddingHorizontal: 5, alignItems: "center", borderRadius: borderradius * 0.6, borderWidth: 1, borderColor: "#fff", }} >
                                    <View style={{ width: "10%", justifyContent: "center", }} >
                                        {Images.search1}
                                    </View>
                                    <View style={{ width: "80%", justifyContent: "center", }} >
                                        <TextInput
                                            placeholder={t('Toptab_Search')}
                                            placeholderTextColor={"#f7f7f7"}
                                            style={{ fontFamily: Fonts.SemiBold, color: "#fff", fontSize: RFValue(15), width: "100%", height: "100%", marginHorizontal: "3%", marginTop: "3%" }}
                                            value={localSearch}
                                            autoFocus={true}
                                            onChangeText={handleSearchChange}
                                        />
                                    </View>
                                    {localSearch ?
                                        <View style={{ width: "10%", alignItems: "center", padding: "4%", }} >
                                            <Pressable style={{
                                                width: devicewidth * 0.0530,
                                                height: devicewidth * 0.0530,
                                                borderRadius: borderradius * 2,
                                                borderWidth: 0.9,
                                                borderColor: c.white,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                                onPress={() => {
                                                    setLocalSearch("");
                                                    dispatch(update_filterBySearch({ search: "" }));
                                                }}
                                            >
                                                {Images.close1}
                                            </Pressable>

                                        </View> : null
                                    }
                                </View>

                                <Pressable onPress={() => setOnSearch(false)}
                                    style={{ width: "10.5%", alignItems: "center", padding: "3%", marginLeft: 10 }}>
                                    <MenuIcon width={devicewidth * 0.1} height={devicewidth * 0.1} />
                                </Pressable>

                            </View>
                        </>
                    ) : (
                        <>
                            <Pressable onPress={() => activeTab == "People" ? navigation.navigate("Searchpage") : setOnSearch(true)}>
                                <CSearch width={devicewidth * 0.1} height={devicewidth * 0.1} />
                            </Pressable>

                            <Pressable onPress={handleFilterOpen}>
                                <CFilter width={devicewidth * 0.1} height={devicewidth * 0.1} />
                            </Pressable>

                            <Pressable onPress={() => navigation.navigate("ProfileDetail")}>

                                <View style={{ width: devicewidth * 0.115, height: devicewidth * 0.115, borderRadius: borderradius * 5, alignItems: 'center', justifyContent: 'center' }} >
                                    {profile?.profile !== "" ?
                                        <Image style={{ width: "150%", height: "150%", borderRadius: borderradius * 5 }}
                                            source={{ uri: `${Imageurl}${profile?.profile}` }}
                                            resizeMode="cover" />
                                        :

                                        <Image style={{ width: "160%", height: "160%", borderRadius: borderradius * 5 }}
                                            source={randomimages[profile?.randomIndex]}
                                            resizeMode="cover" />
                                    }
                                </View>

                            </Pressable>

                            <Pressable onPress={() => { navigation.navigate("SingleChat") }}>
                                <CChat width={devicewidth * 0.1} height={devicewidth * 0.1} />
                                {singleChatCount > 0 ? (
                                    <View style={styles.chatCount} />
                                ) : null}
                            </Pressable>

                            <Pressable onPress={() => { navigation.navigate("Notification") }} style={{ width: "10.5%", alignItems: "center", }} >
                                <CAlerts width={devicewidth * 0.1} height={devicewidth * 0.1} />
                                {profile?.NotificationCount > 0 ?
                                    <View style={{ width: devicewidth * 0.05, height: devicewidth * 0.05, borderRadius: borderradius * 5, backgroundColor: c.secondary, position: "absolute", top: "1%", right: "1.5%" }} >
                                        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                                            <Text style={{
                                                // textAlign: "center",
                                                fontFamily: Fonts.SemiBold,
                                                color: c.white,
                                                fontSize: RFValue(11),
                                            }}>{profile?.NotificationCount < 9 ? profile?.NotificationCount : "9+"}</Text>
                                        </View>
                                    </View> : null
                                }
                            </Pressable>
                        </>
                    )}
                </View>


                <View style={{ flex: 1, paddingHorizontal: "3%", }}>
                    <HomeTabNavigator />
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        width: "100%",
        height: TAB_BAR_ROW_HEIGHT,
        flexDirection: "row",
        backgroundColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
    },
    tabItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: "transparent",
        zIndex: 2,
    },
    tabLabel: {
        // Keep fontFamily stable to avoid jank during swipe gestures.
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(15),
        textAlign: 'center',
        color: c.white,
    },
    activePill: {
        width: '96%',
        alignSelf: 'center',
        minWidth: '96%',
        height: `${Math.round((1 - 2 * TAB_TRAVELING_PILL_VERTICAL_INSET_FRAC) * 100)}%`,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: TAB_SELECTION_CHIP_RADIUS,
        overflow: "hidden",
    },
    travelingPill: {
        position: "absolute",
        top: TAB_BAR_ROW_HEIGHT * TAB_TRAVELING_PILL_VERTICAL_INSET_FRAC,
        height: TAB_TRAVELING_PILL_HEIGHT,
        left: 0,
        backgroundColor: c.secondary,
        borderRadius: TAB_SELECTION_CHIP_RADIUS,
        zIndex: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    headerContainer: {
        width: "100%",
        height: deviceheight * 0.1,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: 'center',
        justifyContent: 'space-evenly'
    },
    profileImage: {
        width: devicewidth * 0.115,
        height: devicewidth * 0.115,
        borderRadius: borderradius * 5
    },
    chatCount: {
        position: "absolute",
        right: 0,
        top: 0,
        backgroundColor: c.secondary,
        width: 11,
        height: 11,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center"
    },
});

export default Homescreen; 
