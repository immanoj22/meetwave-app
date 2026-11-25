import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, ScrollView, StatusBar, Keyboard, ActivityIndicator, TouchableOpacity, BackHandler, Alert, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Button from '../../Components/button';
import { Images } from '../../Utilities/images';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/FontAwesome6';
import Collapsible from 'react-native-collapsible';
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_HobbieList, update_HobbyLimit, update_IsLogin, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { GetItem, SetItem } from '../../Actions/localstorage';
import { Prettylog, hobbydataadd, hobbydatasearch } from '../../Actions/hooks';
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet/src';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import {
    readHobbiesCacheForTab,
    persistHobbiesCacheForTab,
    buildHobbiesTreeFetchPayload,
    getSubcategoryHobbies,
} from '../../Utilities/hobbiesFilterCache';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";
import InfoModal from '../../Components/InfoModal';

const SelectInterest = () => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();


    const navigation = useNavigation();
    // The Accordion now holds only the collapsible category list (Nature,
    // Sports, …). "My Hobbies" and "Popular" use their own <Collapsible>
    // wrappers below — Accordion has a long-standing bug where sections
    // marked active on first mount render the open chevron but keep their
    // content height at 0 until you toggle them. Collapsible doesn't have
    // that issue.
    const [activeSections, setActiveSections] = useState([0]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion
    // Pinned-section open/closed flags. Both start open so the user lands
    // with the search bar and popular chips immediately visible.
    const [myHobbiesOpen, setMyHobbiesOpen] = useState(true);
    const [popularOpen, setPopularOpen] = useState(true);

    // Synchronously read the hobby tree cache exactly like CommonFilterPage.* does.
    // When fresh data is present we paint instantly (no spinner) and refresh in
    // the background — that's what makes the filter pages render so fast.
    const [hobbiesBootstrap] = useState(() => readHobbiesCacheForTab("People"));
    const hasCachedTree =
        (hobbiesBootstrap?.hobbiesList?.length ?? 0) > 0 &&
        hobbiesBootstrap?.isFresh;

    const [addedInterests, setAddedInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoad, setPageLoad] = useState(() => !hasCachedTree);
    const [search, setSearch] = useState("")
    const userID = GetItem("UserId")

    const [areAllOpen, setAreAllOpen] = useState(false);
    const [hobbieLimit, setHobbieLimit] = useState(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const bottomSheetRef = useRef(null);
    const [page, setPage] = useState(1)
    const [footerload, setFooterload] = useState(false)
    // We now fetch the whole tree in one request (page "all"), so pagination is
    // disabled — treat the list as fully loaded by default.
    const [maxreached, setMaxreached] = useState(true);
    const [apiCalled, setApiCalled] = useState(false);

    const { hobbieList, isOnline } = useSelector(helperSelector)
    const [hobbyAlert, setHobbyAlert] = useState(GetItem('hobbyAlert'))
    const [hobbyLimit, setHobbyLimt] = useState(() => hobbiesBootstrap?.hobbyLimit ?? 5);
    const [popularHobbies, setPopularHobbies] = useState(() => hobbiesBootstrap?.popularHobbies ?? []);
    const [hobbiesList, setHobbiesList] = useState(() => hobbiesBootstrap?.hobbiesList ?? []);
    const [onSearch, setOnSearch] = useState(false)

    const [content, setContent] = useState("Select all hobbies that apply to you ")

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {

                if (hobbiepath == "edit") {
                    navigation.navigate("ProfileHome")
                }
                else {
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
                }
                return true;
            };



            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction
            );

            return () => backHandler.remove();
        }, [])
    );

    const dispatch = useDispatch()
    // useFocusEffect(
    //     React.useCallback(() => {
    //         dispatch(update_statusbarcolor(c.primary))
    //         handlehobbysearch(1);
    //     }, [isOnline])
    // )
    const { profile } = useSelector(profileSelector)
    const { hobbiepath } = useSelector(helperSelector)

    useEffect(() => {
        if (hobbiepath == "edit" && profile?.name) {

            const subcategoryIds = profile?.hobbies.map((data) => ({
                _id: data?._id,
                hobbyName: data?.hobbyname
            }))

            setAddedInterests(subcategoryIds);
        }

        {
            hobbyAlert == undefined || hobbyAlert == null || hobbyAlert == true ?
                setAreAllOpen(false)
                :
                setAreAllOpen(false)
        }

    }, [profile, hobbiepath])


    const [hobbyLoading, setHobbyLoading] = useState(() => !hasCachedTree);

    // Ref so the fetcher always sees the latest list without putting hobbiesList
    // in its dep array (avoiding the render→loading→render loop fixed earlier).
    const hobbiesListRef = useRef(hobbiesList);
    useEffect(() => {
        hobbiesListRef.current = hobbiesList;
    }, [hobbiesList]);

    /**
     * Single-shot hobby-tree fetch (same strategy as CommonFilterPage.*):
     * one request with page "all" up to HOBBIES_TREE_FETCH_ALL_LIMIT, then
     * persist for instant subsequent paints. The `count` argument is kept for
     * call-site compatibility but no longer drives pagination.
     */
    const handlehobbysearch = useCallback(async () => {
        try {
            if (apiCalled) return;
            setApiCalled(true);

            const currentList = hobbiesListRef.current;
            const listEmpty = !Array.isArray(currentList) || currentList.length === 0;

            setPageLoad(true);
            setPage(1);
            // Only show the full-screen spinner when we have nothing to display;
            // otherwise refresh silently behind the cached view.
            if (listEmpty) {
                setHobbyLoading(true);
            }

            const payload = buildHobbiesTreeFetchPayload(userID, "");
            const result = await hobbydatasearch(payload);

            setHobbyLimt(result?.HobbyLimit ?? 5);

            if (result?.status) {
                if (result?.data?.length > 0) {
                    setPopularHobbies(result?.PopularHobbies ?? []);
                    setHobbiesList(result.data);
                    setMaxreached(true);
                    // Persist for instant paint on next visit / next screen.
                    persistHobbiesCacheForTab("People", result);
                } else {
                    setHobbiesList([]);
                    setPopularHobbies([]);
                    setMaxreached(true);
                }
            }
        }
        catch (err) {
            console.log("Error on handlehobbysearchStack: ", err);
        }
        finally {
            setPageLoad(false);
            setFooterload(false);
            setApiCalled(false);
            setHobbyLoading(false);
        }
    }, [apiCalled, userID, isOnline]);

    // Keep a stable reference to the latest fetcher so useFocusEffect doesn't
    // re-fire every time handlehobbysearch's identity changes. Without this,
    // every state update inside the fetch (apiCalled, hobbiesList, maxreached…)
    // would change the callback identity, re-run the focus effect, and trigger
    // another fetch — producing a render → loading → render → loading loop.
    const handlehobbysearchRef = useRef(handlehobbysearch);
    useEffect(() => {
        handlehobbysearchRef.current = handlehobbysearch;
    }, [handlehobbysearch]);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary));
            if (isOnline) {
                handlehobbysearchRef.current?.(1);
            }
        }, [dispatch, isOnline]),
    );

    const handleAddInterest = async () => {
        try {

            if (!isOnline) {
                setLoading(false)
                dispatch(update_NetworkVisible(true));
                return
            }

            setLoading(true)
            if (addedInterests.length === 0) {
                ShowToast(t('Please_add_one_interest_before_continuing'))
                setLoading(false)
                return;
            }

            let selectedIds = addedInterests?.map((data) => data?._id)

            var payload = {
                "HobbiesId": selectedIds,
                "userId": userID,
                "type": hobbiepath == "edit" ? "edit" : "add",
            }

            var result = await hobbydataadd(payload)

            if (result?.status) {

                if (hobbiepath == "edit") {
                    navigation.navigate("ProfileHome")
                    const userid = GetItem("UserId")
                    dispatch(Fetchprofile(userid))
                }
                else {
                    SetItem("loginstatus", true)
                    dispatch(update_IsLogin(true))
                    navigation.navigate("Homescreen")
                }
                ShowToast(result?.message)
            }
            else {
                ShowToast(result?.message)
            }

        }
        catch (err) {

        }
        setLoading(false)

    }

    const handlesetfn = (subcategory) => {
        const id = subcategory?._id;
        const name = subcategory?.hobbyname ?? subcategory?.hobbyName ?? '';

        setAddedInterests((prev) => {
            const exists = prev.some((h) => String(h?._id) === String(id));
            if (exists) {
                return prev.filter((h) => String(h?._id) !== String(id));
            }
            return [...prev, { _id: id, hobbyName: name }];
        });
    };

    const openSearchBox = () => {
        setIsBottomSheetVisible(true);
        bottomSheetRef.current.present();
    };

    const handleRemoveInterest = (interest) => {
        const id = typeof interest === 'object' ? interest?._id : interest;
        setAddedInterests((prev) =>
            prev.filter((h) => String(h?._id) !== String(id)),
        );
    };

    const isInterestAdded = (subcategory) => {
        return addedInterests?.some(
            (hobby) => String(hobby?._id) === String(subcategory?._id),
        );
    };

    const toggleCategorySection = (sectionIndex) => {
        setActiveSections((prev) =>
            prev.includes(sectionIndex)
                ? prev.filter((index) => index !== sectionIndex)
                : [...prev, sectionIndex],
        );
    };

    const toggleSubcategorySection = (categoryId, sectionIndex) => {
        setActiveSubcategorySections((prev) => {
            const currentSections = prev?.[categoryId] || [];
            const nextSections = currentSections.includes(sectionIndex)
                ? currentSections.filter((index) => index !== sectionIndex)
                : [...currentSections, sectionIndex];

            return {
                ...prev,
                [categoryId]: nextSections,
            };
        });
    };

    const renderHeader = useCallback((title, isActive, onToggle) => (
        <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
            <Text style={styles.para}>
                {title}
            </Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </Pressable>
    ), []);

    const renderSubcategoryHeader = useCallback((title, isActive, onToggle) => (
        <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
            <Text style={{
                fontFamily: Fonts.Medium,
                color: "#e3e6e4",
                marginLeft: 20,
                fontSize: RFValue(16),
            }}>{title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </Pressable>
    ), [])

    const renderHobbyButtons = useCallback((hobbies, useWhiteCheck = true) => (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {hobbies?.map((hobby) => (
                <Pressable
                    key={hobby._id}
                    style={styles.buttoncontainer}
                    onPress={() => handlesetfn(hobby)}>
                    <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                    {isInterestAdded(hobby) ? (
                        <View style={styles.greenbox}>
                            <Icon name="check" size={deviceheight * 0.0148} color={useWhiteCheck ? c.white : c.black} />
                        </View>
                    ) : (
                        <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                    )}
                </Pressable>
            ))}
        </View>
    ), [addedInterests]);

    const renderCategorySection = useCallback((category, categoryIndex) => {
        const isCategoryOpen = activeSections.includes(categoryIndex);
        const hasNestedSubcategories = Array.isArray(category?.subcategory)
            && category.subcategory.length > 0
            && Array.isArray(category.subcategory[0]?.Hobbies);

        return (
            <View key={category?._id ?? categoryIndex}>
                {renderHeader(category?.category, isCategoryOpen, () => toggleCategorySection(categoryIndex))}
                <Collapsible collapsed={!isCategoryOpen}>
                    <View>
                        {hasNestedSubcategories ? (
                            category?.subcategory?.map((subcategory, subcategoryIndex) => {
                                const openSubcategories = activeSubcategorySections[category?._id] || [];
                                const isSubcategoryOpen = openSubcategories.includes(subcategoryIndex);

                                return (
                                    <View key={subcategory?._id ?? subcategoryIndex}>
                                        {renderSubcategoryHeader(
                                            subcategory?.subcategory,
                                            isSubcategoryOpen,
                                            () => toggleSubcategorySection(category?._id, subcategoryIndex),
                                        )}
                                        <Collapsible collapsed={!isSubcategoryOpen}>
                                            <View style={{ marginTop: '2%' }}>
                                                {renderHobbyButtons(subcategory?.Hobbies, true)}
                                            </View>
                                        </Collapsible>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={{ marginTop: '2%' }}>
                                {renderHobbyButtons(category?.subcategory, false)}
                            </View>
                        )}
                    </View>
                </Collapsible>
            </View>
        );
    }, [activeSections, activeSubcategorySections, renderHeader, renderSubcategoryHeader, renderHobbyButtons]);

    const getSearchableHobbyName = useCallback((item) => {
        const candidates = [
            item?.hobbyname,
            item?.hobbyName,
            item?.HobbyName,
            item?.name,
            item?.title,
            item?.subcategory,
        ];

        for (const value of candidates) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }

        return '';
    }, []);

    const searchSourceHobbies = useMemo(() => {
        const allItems = [];
        const seen = new Set();

        const pushItem = (item) => {
            const hobbyname = getSearchableHobbyName(item);

            if (!hobbyname) {
                return;
            }

            const key = String(item?._id ?? item?.id ?? hobbyname).toLowerCase();
            if (seen.has(key)) {
                return;
            }

            seen.add(key);
            allItems.push({
                ...item,
                _id: item?._id ?? item?.id ?? hobbyname,
                hobbyname,
                originalData: item?.originalData ?? item,
            });
        };

        for (const item of popularHobbies ?? []) {
            pushItem(item);
        }

        for (const category of hobbiesList ?? []) {
            for (const sub of category?.subcategory ?? []) {
                const nestedHobbies = getSubcategoryHobbies(sub);

                if (nestedHobbies.length > 0) {
                    for (const hobby of nestedHobbies) {
                        pushItem(hobby);
                    }
                } else {
                    pushItem(sub);
                }
            }
        }

        return allItems;
    }, [hobbiesList, popularHobbies, getSubcategoryHobbies, getSearchableHobbyName]);

    const searchInterestsFiltered = useMemo(() => {
        const query = (search ?? '').trim().toLowerCase();

        if (!query) {
            return searchSourceHobbies;
        }

        return searchSourceHobbies.filter((item) =>
            String(item?.hobbyname ?? '').toLowerCase().includes(query),
        );
    }, [search, searchSourceHobbies]);

    const handleInlineSearchSelect = useCallback((item) => {
        handlesetfn(item?.originalData ?? item);
    }, [handlesetfn]);

    // Reusable header row matching the accordion header look. Used by both
    // pinned sections (My Hobbies, Popular). Press anywhere on the row to
    // collapse / expand.
    const renderPinnedHeader = (title, isOpen, onToggle) => (
        <Pressable
            onPress={onToggle}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: '3%',
                justifyContent: 'space-between',
            }}
        >
            <Text style={styles.para}>{title}</Text>
            <View style={styles.swaproundbox}>
                <Icon
                    name={isOpen ? 'angle-up' : 'angle-down'}
                    size={devicewidth * 0.04}
                    color="#fff"
                />
            </View>
        </Pressable>
    );

    // "My Hobbies" — selected chips, search input + live dropdown, expand-all
    // toggle. Opens by default but can be closed by tapping the header.
    const myHobbiesSection = (
        <View>
            {renderPinnedHeader(t('MyHobbies'), myHobbiesOpen, () =>
                setMyHobbiesOpen((p) => !p),
            )}

            {myHobbiesOpen && (
                <View>
                    {addedInterests?.length > 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                width: '100%',
                                flexWrap: 'wrap',
                                marginTop: '4%',
                                gap: 5,
                            }}
                        >
                            {addedInterests.map((interest, index) => (
                                <Pressable
                                    key={index}
                                    style={styles.addcontainer}
                                    onPress={() => handleRemoveInterest(interest)}
                                >
                                    <Text style={styles.addbtntxt}>{interest?.hobbyName}</Text>
                                    <View style={styles.lessbox}>
                                        <Icon1 name="minus" size={deviceheight * 0.0148} color="#000" />
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    <View style={styles.linebar} />

                    {/* Inline hobbies search (matches CommonFilterPage behaviour) */}
                    <View
                        style={{
                            height: deviceheight * 0.05,
                            width: '100%',
                            borderRadius: borderradius * 0.5,
                            borderColor: c.white,
                            borderWidth: 0.9,
                            justifyContent: 'center',
                            paddingHorizontal: 12,
                            marginTop: '1.5%',
                            marginBottom: '1.5%',
                        }}
                    >
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder={t('Search_Hobbies')}
                            placeholderTextColor={'#F7E5D0'}
                            style={[styles.inputtxtstyle, { paddingRight: 30 }]}
                            keyboardType="default"
                            onFocus={() => setOnSearch(true)}
                            onBlur={() => setOnSearch(false)}
                        />
                        <Pressable
                            onPress={() => {
                                if (onSearch || String(search ?? '').trim().length > 0) {
                                    setSearch('');
                                    Keyboard.dismiss();
                                    setOnSearch(false);
                                }
                            }}
                            style={{ position: 'absolute', right: 12, alignSelf: 'center' }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {onSearch || String(search ?? '').trim().length > 0 ? (
                                <Icon name="xmark" size={deviceheight * 0.02} color={c.white} />
                            ) : (
                                Images.search
                            )}
                        </Pressable>
                    </View>

                    {String(search ?? '').trim().length > 0 && (
                        <View
                            style={{
                                marginBottom: '2%',
                                borderColor: 'rgba(255,255,255,0.25)',
                                borderWidth: 1,
                                borderRadius: borderradius * 0.4,
                                overflow: 'hidden',
                                maxHeight: deviceheight * 0.058 * 4.5,
                            }}
                        >
                            <ScrollView
                                nestedScrollEnabled
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                                persistentScrollbar={true}
                            >
                                {(searchInterestsFiltered ?? []).slice(0, 80).map((item, idx) => {
                                    const added = isInterestAdded(item.originalData);
                                    const isLast =
                                        idx ===
                                        Math.min(79, (searchInterestsFiltered?.length ?? 0) - 1);
                                    return (
                                        <Pressable
                                            key={String(item?._id ?? idx)}
                                            onPress={() => handleInlineSearchSelect(item)}
                                            style={{
                                                height: deviceheight * 0.058,
                                                paddingHorizontal: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottomWidth: isLast ? 0 : 1,
                                                borderBottomColor: 'rgba(255,255,255,0.12)',
                                            }}
                                        >
                                            <Text style={styles.genderText}>{item?.hobbyname}</Text>
                                            <View
                                                style={{
                                                    width: devicewidth * 0.04,
                                                    height: devicewidth * 0.04,
                                                    borderRadius: (devicewidth * 0.15) / 2,
                                                    backgroundColor: added ? '#47db40' : '#fff',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginLeft: '2%',
                                                }}
                                            >
                                                <Icon
                                                    name={added ? 'check' : 'plus'}
                                                    size={deviceheight * 0.0148}
                                                    color={c.black}
                                                />
                                            </View>
                                        </Pressable>
                                    );
                                })}
                                {(searchInterestsFiltered?.length ?? 0) === 0 && (
                                    <View
                                        style={{
                                            paddingVertical: deviceheight * 0.02,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={styles.noDataText}>{t('No_Data')}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}

                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 3,
                        }}
                    >
                        <Pressable
                            onPress={() => toggleAllSections()}
                            style={{ marginTop: '2%', alignItems: 'flex-end' }}
                        >
                            <Text
                                style={{
                                    fontFamily: Fonts.Bold,
                                    color: c.white,
                                    fontSize: RFValue(16),
                                    flex: 0.8,
                                }}
                            >
                                {t('Expand_all')}
                            </Text>
                        </Pressable>

                        <SwitchToggle
                            switchOn={areAllOpen}
                            onPress={() => toggleAllSections()}
                            circleColorOff="#911687"
                            circleColorOn="#911687"
                            backgroundColorOn={c.primary}
                            backgroundColorOff={c.pink}
                            containerStyle={{
                                width: devicewidth * 0.16,
                                height: devicewidth * 0.070,
                                borderRadius: 100,
                                padding: devicewidth * 0.01,
                                marginLeft: 10,
                            }}
                            circleStyle={{
                                width: devicewidth * 0.050,
                                height: devicewidth * 0.050,
                                borderRadius: 100,
                            }}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    // "Popular" — popular-hobby chips. Opens by default, collapsible by tap.
    const popularSection = (
        <View>
            {renderPinnedHeader(t('Popular'), popularOpen, () =>
                setPopularOpen((p) => !p),
            )}

            {popularOpen && (
                <View>
                    {popularHobbies?.length > 0 ? (
                        <View
                            style={{
                                flexDirection: 'row',
                                width: '100%',
                                flexWrap: 'wrap',
                                marginTop: '4%',
                                gap: 5,
                            }}
                        >
                            {popularHobbies?.map((interest) => (
                                <Pressable
                                    key={interest._id}
                                    style={styles.buttoncontainer2}
                                    onPress={() => handlesetfn(interest)}
                                >
                                    <Text style={styles.btntxt}>{interest?.hobbyname}</Text>
                                    {isInterestAdded(interest) ? (
                                        <View style={styles.greenbox}>
                                            <Icon name="check" size={deviceheight * 0.0148} color={c.white} />
                                        </View>
                                    ) : (
                                        <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text
                                style={{
                                    fontFamily: Fonts.Regular,
                                    color: c.white,
                                    fontSize: RFValue(16),
                                }}
                            >
                                {t('No_Data')}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={1}
                animatedIndex={{
                    value: 1,
                }}
                opacity={Platform.OS == "android" ? 0.6 : 0.4}
            >
                <View style={{ height: "100%", alignItems: "center", justifyContent: "center" }} >
                    <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"large"} />
                </View>
            </BottomSheetBackdrop>
        ),
        []
    )
    const snapPoints = useMemo(() => ["90%"], []);

    const toggleAllSections = () => {
        if (areAllOpen) {
            // Collapse categories. Keep My Hobbies + Popular open so the
            // search bar and popular chips stay accessible.
            setActiveSections([]);
            setActiveSubcategorySections({});
            setMyHobbiesOpen(true);
            setPopularOpen(true);
        } else {
            // Expand everything: pinned sections + every category + every subcategory.
            setActiveSections(hobbiesList?.map((_, index) => index));
            const newActiveSubcategorySections = hobbiesList?.reduce((acc, category) => {
                const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
                if (subcategoryIndexes) {
                    acc[category._id] = subcategoryIndexes;
                }
                return acc;
            }, {});
            setActiveSubcategorySections(newActiveSubcategorySections);
            setMyHobbiesOpen(true);
            setPopularOpen(true);
        }
        setAreAllOpen(!areAllOpen);
    };


    // The full hobby tree is loaded in a single request now, so scrolling no
    // longer needs to paginate. Keep the handler as a no-op for safety.
    const handleEndReached = () => { };


    // Render item function
    const renderItem = ({ item }) => (

        <TouchableOpacity
            key={item._id}
            onPress={() => handlesetfn(item.originalData)}
            style={styles.genderItem}
        >
            <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between' }}>
                <Text style={styles.genderText}>{item.hobbyname} </Text>
                <View style={{ flexDirection: "row", }}>
                    {isInterestAdded(item) ? (
                        <View style={{
                            width: devicewidth * 0.04,
                            height: devicewidth * 0.04,
                            borderRadius: (devicewidth * 0.15) / 2,
                            backgroundColor: "#47db40",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "2%"
                        }}>
                            <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                        </View>
                    ) : (
                        <View style={{
                            width: devicewidth * 0.04,
                            height: devicewidth * 0.04,
                            borderRadius: (devicewidth * 0.15) / 2,
                            backgroundColor: "#fff",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "2%"
                        }}>
                            <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                        </View>
                    )}
                </View>
            </View>

        </TouchableOpacity>
    );

    useEffect(() => {
        if (areAllOpen && hobbiesList?.length) {
            setActiveSections(hobbiesList?.map((_, index) => index));
            const newActiveSubcategorySections = hobbiesList?.reduce((acc, category) => {
                const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
                if (subcategoryIndexes) {
                    acc[category._id] = subcategoryIndexes;
                }
                return acc;
            }, {});
            setActiveSubcategorySections(newActiveSubcategorySections);
        }
    }, [hobbiesList, areAllOpen])

    useEffect(() => {
        if (areAllOpen || !hobbiesList?.length) {
            return;
        }

        setMyHobbiesOpen(true);
        setPopularOpen(true);
        setActiveSections((prev) => (prev?.length ? prev : [0]));

        const firstCategory = hobbiesList[0];
        const hasNestedSubcategories = Array.isArray(firstCategory?.subcategory)
            && firstCategory.subcategory.length > 0
            && Array.isArray(firstCategory.subcategory[0]?.Hobbies);

        if (!hasNestedSubcategories) {
            return;
        }

        setActiveSubcategorySections((prev) => {
            if (Array.isArray(prev?.[firstCategory?._id]) && prev[firstCategory._id].length) {
                return prev;
            }

            return {
                ...prev,
                [firstCategory._id]: [0],
            };
        });
    }, [hobbiesList, areAllOpen]);

    const handleBack = () => {
        requestAnimationFrame(() => {
            navigation.goBack();
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient style={{ width: '100%', height: '100%' }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>

                    <View style={styles.backcontainer}>
                        <View style={{ width: "20%", paddingHorizontal: "4%" }}>
                            {hobbiepath == "edit" &&
                                <Pressable onPress={handleBack} style={styles.roundbox}>
                                    {Images.back}
                                </Pressable>
                            }
                        </View>
                    </View>
                    {hobbyLoading ? (
                        <View style={{ height: "92%", paddingBottom: "2.5%", justifyContent: "center" }} >
                            <ActivityIndicator size="large" color={c.white} />
                        </View>
                    )
                        :
                        (
                            <ScrollView
                                onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                                scrollEventThrottle={5}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false} >
                                <View style={{ width: '100%', height: '90%', marginBottom: '20%' }}>

                                    <View style={styles.outersec}>

                                        {/* My Hobbies + Popular use standalone Collapsibles to
                                            avoid an Accordion-on-mount measurement quirk where
                                            initially-active sections render the open chevron but
                                            keep their content height at 0 until toggled. */}
                                        {myHobbiesSection}
                                        {popularSection}

                                        <View>
                                            {hobbiesList?.map((category, categoryIndex) =>
                                                renderCategorySection(category, categoryIndex),
                                            )}
                                            {footerload &&
                                                <ActivityIndicator size="large" color={c.white} />
                                            }
                                        </View>
                                    </View>

                                </View>
                            </ScrollView>
                        )}
                    <View
                        style={{
                            width: '100%',
                            position: 'absolute',
                            bottom: '0.0%',
                            paddingTop: 16,
                            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                            backgroundColor: '#A22B78',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {loading ? (
                            <Pressable
                                style={{
                                    width: '50%',
                                    borderRadius: borderradius * 1.5,
                                    backgroundColor: c.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderColor: c.white,
                                    padding: '2%',
                                    alignSelf: 'center',
                                }}
                            >
                                <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                            </Pressable>
                        ) : (
                            <>{hobbiepath == 'edit' ? <Button onpress={handleAddInterest} title={t('Save_Changes')} /> : <Button onpress={handleAddInterest} title={t('Continue')} />}</>
                        )}
                    </View>
                </View>
            </LinearGradient>

            <BottomSheetModalProvider >
                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    shouldMeasureContentHeight={true}
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={true}
                    enableDynamicSizing={false}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: 'gray' }}
                    keyboardBehavior={
                        Platform.OS === 'android' ? 'fillParent' : 'interactive'
                    }
                    android_keyboardInputMode="adjustResize"
                >
                    <View style={styles.bottomSheetContent}>
                        <View style={{ width: '100%', flexDirection: 'row', marginBottom: '4%', alignItems: "center", justifyContent: "center" }}>
                            <Pressable style={[styles.searchcontainer, { justifyContent: "center" }]}>
                                <TextInput
                                    placeholderTextColor={'#F7E5D0'}
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder={t('Search_Interests')}
                                    style={styles.inputtxtstyle}
                                    keyboardType='default'
                                />
                            </Pressable>
                            <Pressable style={{ position: 'absolute', right: '3%', alignSelf: 'center' }}>
                                {Images.search}
                            </Pressable>
                        </View>

                        <View style={{ width: "100%", height: deviceheight * 0.79, paddingBottom: 2 }}>
                            <BottomSheetFlatList
                                data={searchInterestsFiltered}
                                keyExtractor={item => item._id}
                                renderItem={renderItem}
                                contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 20 }}
                                onEndReachedThreshold={0.1}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={footerload ? (
                                    <ActivityIndicator size="small" color={c.white} />
                                ) : null}
                            />

                        </View>

                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>

            <InfoModal
                visible={hobbyAlert}
                title="Note"
                content={content}
                onClose={() => {
                    SetItem("hobbyAlert", false)
                    setHobbyAlert(false);
                }}
            />


        </SafeAreaView>
    );
};

export default SelectInterest;

const styles = StyleSheet.create({
    container: { flex: 1 },
    boxcontainer: { flex: 1, width: '100%', height: "100%" },
    title: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: 'center',
    },
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        width: "90%"
    },
    backcontainer: {
        width: '100%',
        paddingTop: '6.2%',
        paddingBottom: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        marginLeft: '3%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outersec: {
        width: '90%',
        alignSelf: 'center',
        marginTop: '1%',
    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: deviceheight * 0.0570,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.4,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
    },
    swaproundbox: {
        width: devicewidth * 0.058,
        height: devicewidth * 0.058,
        borderRadius: (devicewidth * 0.15) / 2,
        borderWidth: 1,
        borderColor: '#fff',
        marginLeft: '2%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttoncontainer: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    inputtxtstyleSearch: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        alignContent: 'center',
        color: c.white,
        marginTop: 5,
        marginLeft: 8,
        width: "90%",
        height: "100%",
    },
    buttoncontainer1: {
        width: '46%',
        borderRadius: borderradius * 1.5,
        backgroundColor: c.black,
        height: deviceheight * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    buttoncontainer2: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    btntxt1: {
        fontFamily: Fonts.Medium,
        color: "#339116",
        fontSize: RFValue(12),
        marginRight: '4%',
    },
    premiumbutton: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    premiumIcon: {
        width: devicewidth * 0.0450,
        height: devicewidth * 0.0450,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        marginLeft: '3%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -deviceheight * 0.01,
        left: 0,
    },
    addcontainer: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',

    },
    linebar: {
        width: "100%",
        padding: 2,
        borderRadius: 5,
        backgroundColor: c.intermediate,
        marginTop: "5%",
        marginBottom: "2%"
    },

    lessbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.primary,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "center",
        marginLeft: 5
    },

    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        marginRight: '4%',
    },

    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#339116',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheetContent: {
        flex: 1,
        padding: "3%",
        marginTop: "3%"
    },

    btmtxt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Bold,
        color: c.white
    },

    genderItem: {
        paddingHorizontal: "1%",
        paddingVertical: "2%"
    },

    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },

    noDataText: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(16),
        textAlign: 'center',
        marginTop: 20,
    },

});
