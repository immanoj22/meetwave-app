import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_GroupFilter, update_HobbieList, update_NetworkVisible, update_GroupFilterHoobies, update_PopularHobbieList, update_statusbarcolor, update_EventFilterHoobies, update_ChatFilterHoobies, update_ProfileHobbies, update_HobbyLimit } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { hobbydataadd, hobbydatasearch } from "../../Actions/hooks";
import { GetItem } from "../../Actions/localstorage";
import { Fetchprofile, profileSelector } from "../../Slices/profile";
import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";

const Groupfilter = ({ visible, onClose, datareturn, page }) => {

    const { t } = useTranslation();
    const bottomSheetModalRef = useRef();
    const [activeSections, setActiveSections] = useState([0, 1,]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion
    const [hobbieLimit, setHobbieLimit] = useState(null);
    const [pageLoad, setPageLoad] = useState(true);
    const [search, setSearch] = useState("")
    const [onSearch, setOnSearch] = useState(false)
    const [ownHobbies, setOwnHobbies] = useState(false)
    const [areAllOpen, setAreAllOpen] = useState(false);
    const [pageCount, setPageCount] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);
    const userID = GetItem("UserId")

    const { groupFilterHoobies, eventFilterHoobies, chatFilterHoobies, popularHobbieList, hobbieList, isOnline, filterBysearch, profileHobbies, hobbyLimitCount } = useSelector(helperSelector)
    const { activeTab } = filterBysearch;
    const { profile } = useSelector(profileSelector);

    const [hobbiesList, setHobbiesList] = useState([]);
    const [popularList, setPopularList] = useState([]);

    useEffect(() => {
        if (activeTab == 'Chat' || activeTab == "CreateGroup" || activeTab == "EventCreation") {
            dispatch(update_statusbarcolor(c.primary))
            handlehobbysearch(1);
            const subcategoryIds = profile?.hobbies?.map((data) => data?._id);
            var result = 0;
            if (activeTab == 'Chat') {
                result = groupFilterHoobies?.filter((id) => subcategoryIds.includes(id))
            }
            else if (activeTab == "CreateGroup") {
                result = groupFilterHoobies?.filter((id) => subcategoryIds.includes(id))
            }
            else if (activeTab == "EventCreation") {
                result = eventFilterHoobies?.filter((id) => subcategoryIds.includes(id))
            }
            setOwnHobbies(result?.length > 0);
        }
        return (() => {
            if (bottomSheetModalRef.current) {
                bottomSheetModalRef.current.dismiss();
            }
        })

    }, [isOnline, visible])


    const navigation = useNavigation()

    const dispatch = useDispatch()

    useEffect(() => {

        openBottomSheet();
        return () => {
            dispatch(update_GroupFilter(false))
        }
    }, [visible]);

    const snapPoints = useMemo(() => ["95%"], []);

    const openBottomSheet = () => {
        if (visible) {
            bottomSheetModalRef.current.present();
        }
    };


    const handleRemoveInterest = (interestId) => {

        if (page == "group") {
            const data = groupFilterHoobies?.filter(id => id !== interestId)
            dispatch(update_GroupFilterHoobies(data));
        }
        else if (page == "event") {
            const data = eventFilterHoobies?.filter(id => id !== interestId)
            dispatch(update_EventFilterHoobies(data));
        }
        else if (page == "chat") {
            const data = chatFilterHoobies?.filter(id => id !== interestId)
            dispatch(update_ChatFilterHoobies(data));
        }
        else if (page == "profile") {
            const data = profileHobbies?.filter(id => id !== interestId)
            dispatch(update_ProfileHobbies(data));
        }

    };

    const isInterestAdded = (subcategory) => {

        if (page == "group") {
            return groupFilterHoobies?.includes(subcategory._id);
        }
        else if (page == "event") {
            return eventFilterHoobies?.includes(subcategory._id);
        }
        else if (page == "chat") {
            return chatFilterHoobies?.includes(subcategory._id);
        }
        else if (page == "profile") {
            return profileHobbies?.includes(subcategory._id);
        }

        return;
    };

    const handlehobbysearch = async (count) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;
            setApiCalled(true);

            if (!maxreached || count == 1) {

                var payload = {
                    "userId": userID,
                    "hobbyname": search,
                    "page": count,
                    "limit": 1
                }

                if (count == 1) {
                    setPageLoad(true)
                    setPageCount(1)
                    setMaxreached(false)
                }
                else {
                    setFooterload(true)
                }
                const result = await hobbydatasearch(payload)
                setPageCount(count)
                setHobbieLimit(result?.HobbyLimit)
                dispatch(update_HobbyLimit(result?.HobbyLimit))

                if (result?.status) {

                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 10) {
                            setMaxreached(true);
                        }

                        // dispatch(update_PopularHobbieList(result?.PopularHobbies));
                        setPopularList(result?.PopularHobbies)

                        if (count == 1) {
                            // dispatch(update_HobbieList(result?.data))
                            setHobbiesList(result?.data);
                        }
                        else {
                            let local = [...hobbiesList, ...result?.data];
                            // dispatch(update_HobbieList(local))
                            setHobbiesList(local);
                        }
                    }
                    else if (count == 1) {
                        // dispatch(update_HobbieList([]))
                        // dispatch(update_PopularHobbieList([]));
                        setHobbiesList([]);
                        setPopularList([])
                    }
                    else {
                        setMaxreached(true);
                    }
                }
                setPageLoad(false)
            }

        }

        catch (err) {
            setPageLoad(false)
        }
        finally {
            setPageLoad(false)
            setFooterload(false)
            setApiCalled(false)
        }
    }

    const handlesetfn = (subcategory) => {
        const hobbyLimit = parseInt(hobbyLimitCount);

        if (page == "group") {

            if (groupFilterHoobies?.includes(subcategory._id)) {
                const data = groupFilterHoobies?.filter(id => id !== subcategory._id);
                dispatch(update_GroupFilterHoobies(data));

            } else {
                if (groupFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + " " + hobbyLimit + " " + t('interests_please_subscribe'))
                    return;
                }

                const data = [...groupFilterHoobies, subcategory._id];
                dispatch(update_GroupFilterHoobies(data));
            }
        }
        else if (page == "event") {

            if (eventFilterHoobies?.includes(subcategory._id)) {
                const data = eventFilterHoobies?.filter(id => id !== subcategory._id);
                dispatch(update_EventFilterHoobies(data));

            } else {
                if (eventFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + " " + hobbyLimit + " " + t('interests_please_subscribe'))
                    return;
                }

                const data = [...eventFilterHoobies, subcategory._id];
                dispatch(update_EventFilterHoobies(data));
            }
        }
        else if (page == "chat") {

            if (chatFilterHoobies?.includes(subcategory._id)) {
                const data = chatFilterHoobies?.filter(id => id !== subcategory._id);
                dispatch(update_ChatFilterHoobies(data));

            } else {
                if (chatFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + " " + hobbyLimit + " " + t('interests_please_subscribe'))
                    return;
                }

                const data = [...chatFilterHoobies, subcategory._id];
                dispatch(update_ChatFilterHoobies(data));
            }

        }
        else if (page == "profile") {

            if (profileHobbies?.includes(subcategory._id)) {
                const data = profileHobbies?.filter(id => id !== subcategory._id);
                dispatch(update_ProfileHobbies(data));

            } else {
                if (profileHobbies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + " " + hobbyLimit + " " + t('interests_please_subscribe'))
                    return;
                }

                const data = [...profileHobbies, subcategory._id];
                dispatch(update_ProfileHobbies(data));
            }
        }

    };

    const [nestedActiveSections, setNestedActiveSections] = useState([]);

    const renderNestedContent = useCallback((section) => {
        if (Array.isArray(section.content)) {
            return (
                <Accordion
                    sections={section.content}
                    activeSections={nestedActiveSections}
                    renderHeader={renderNestedHeader}
                    renderContent={renderNestedContent}
                    onChange={setNestedActiveSections}
                    underlayColor="transparent"
                    expandMultiple={true}
                />
            );
        } else {
            return (
                <View style={{ padding: 10, }}>
                    <Text style={styles.finalContent}>{section.content}</Text>
                </View>
            );
        }
    }, []);

    const renderNestedHeader = useCallback((section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', }}>
            <Text style={styles.para}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), []);


    const handleCategorySectionChange = useCallback((sections) => {
        setActiveSections(sections);
    }, []);

    const handleSubcategorySectionChange = useCallback((categoryId, sections) => {

        setActiveSubcategorySections(prev => ({
            ...prev,
            [categoryId]: sections,
        }))
    }, []);

    const renderHeader = useCallback((section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
            <Text style={styles.para}>{section?.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), []);

    const renderContent = useCallback((section) => (
        <View>{section?.content}</View>
    ), []);

    const renderSubcategoryHeader = useCallback((section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
            <Text style={{
                fontFamily: Fonts.Medium,
                color: "#e3e6e4",
                marginLeft: 20,
                fontSize: RFValue(16),
            }}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    ), [])

    const renderSubcategoryContent = useCallback((section) => (
        <View>
            {section.content}
        </View>
    ), [])


    const sections = [
        {
            title: t('Selectedhobbies'),
            content: (

                (page == "group" ? groupFilterHoobies : page == "event" ? eventFilterHoobies : page == "chat" ? chatFilterHoobies : page == "profile" ? profileHobbies : [])?.length > 0 ? (

                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5, }}>
                        {(page == "group" ? groupFilterHoobies : page == "event" ? eventFilterHoobies : page == "chat" ? chatFilterHoobies : page == "profile" ? profileHobbies : [])?.map((interest, index) => {
                            // Find the hobby object from categories or wherever the full list is stored

                            const hobby = hobbiesList?.flatMap(category => category?.subcategory)
                                .flatMap(subcategory => subcategory?.Hobbies)
                                .find(hobby => hobby?._id == interest);

                            const subcate = hobbiesList?.flatMap(category => category?.subcategory)
                                .find(hobby => hobby?._id == interest);

                            return (
                                <Pressable key={index} style={styles.addcontainer} onPress={() => handleRemoveInterest(interest)}>
                                    <Text style={styles.addbtntxt}>{hobby ? hobby?.hobbyname : subcate ? subcate?.hobbyname : ""} </Text>
                                    <View style={styles.lessbox}>
                                        <Icon name="minus" size={deviceheight * 0.0158} color="#fff" />
                                    </View>
                                </Pressable>
                            );
                        })}

                    </View>
                ) : (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}>{t('No_Data')}</Text>
                    </View>
                )
            ),
        },
        {
            title: t('OwnHobbies'),
            content: (
                profile?.hobbies?.length > 0 ? (
                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
                        {profile?.hobbies?.map((interest, index) => {

                            return (
                                <Pressable
                                    key={interest._id}
                                    style={styles.buttoncontainer}
                                    onPress={() => handlesetfn(interest)}
                                >

                                    <Text style={styles.btntxt}>{interest?.hobbyname}</Text>
                                    {isInterestAdded(interest) ? (
                                        <View style={styles.greenbox}>
                                            <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                        </View>
                                    ) : (
                                        <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                    )}
                                </Pressable>
                            );
                        })}

                    </View>
                ) : (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}>{t('No_Data')}</Text>
                    </View>
                )
            ),
        },
        {
            title: t('Popularhobbies'),
            content: (
                popularList?.length > 0 ? (
                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
                        {popularList?.map((interest, index) => {

                            return (
                                <Pressable
                                    key={interest._id}
                                    style={styles.buttoncontainer2}
                                    onPress={() => handlesetfn(interest)} >

                                    <Text style={styles.btntxt}>{interest?.hobbyname}</Text>
                                    {isInterestAdded(interest) ? (
                                        <View style={styles.greenbox}>
                                            <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                        </View>
                                    ) : (
                                        <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                    )}
                                </Pressable>
                            );
                        })}

                    </View>
                ) : (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(16),
                        }}>{t('No_Data')}</Text>
                    </View>
                )
            ),
        },
        ...hobbiesList?.map(category => ({
            title: category.category,  // Display Category name
            content: (
                <View>
                    {category?.subcategory[0]?.Hobbies ?
                        <Accordion
                            sections={category?.subcategory.map(subcategory => ({
                                title: subcategory?.subcategory,  // Subcategory title
                                content: (
                                    <View style={{ marginTop: '2%' }}>
                                        {/* Render Hobbies under the Subcategory */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                            {subcategory?.Hobbies?.map(hobby => (

                                                !hobby?.planStatus ? (
                                                    <Pressable
                                                        key={hobby._id}
                                                        style={styles.buttoncontainer}
                                                        onPress={() => handlesetfn(hobby)} >

                                                        <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                        {isInterestAdded(hobby) ? (
                                                            <View style={styles.greenbox}>
                                                                <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                            </View>
                                                        ) : (
                                                            <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                                        )}
                                                    </Pressable>
                                                )
                                                    :
                                                    (
                                                        <Pressable onPress={() => navigation.navigate("Premium")} key={subcategory._id} style={styles.premiumbutton}>
                                                            <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                            <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                                        </Pressable>
                                                    )

                                            ))}
                                        </View>
                                    </View>
                                ),
                            }))}
                            activeSections={activeSubcategorySections[category._id] || []}  // Handle active subcategory sections
                            renderHeader={renderSubcategoryHeader}
                            renderContent={renderSubcategoryContent}
                            onChange={(sections) => handleSubcategorySectionChange(category._id, sections)}  // Update the active sections for subcategories
                            underlayColor={false}
                            expandMultiple={true}
                        />
                        :
                        <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5, }}>
                            <View style={{ marginTop: '2%' }}>
                                {/* Render Hobbies under the Subcategory */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {category?.subcategory.map(hobby => (

                                        !hobby?.planStatus ? (
                                            <Pressable
                                                key={hobby._id}
                                                style={styles.buttoncontainer}
                                                onPress={() => handlesetfn(hobby)}>

                                                <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                {isInterestAdded(hobby) ? (
                                                    <View style={styles.greenbox}>
                                                        <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                    </View>
                                                ) : (
                                                    <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                                )}
                                            </Pressable>
                                        )
                                            :
                                            (
                                                <Pressable onPress={() => navigation.navigate("Premium")} key={hobby._id} style={styles.premiumbutton}>
                                                    <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                    <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
                                                </Pressable>
                                            )

                                    ))}
                                </View>
                            </View>

                        </View>
                    }
                </View>

            ),
        }))
    ];


    const filteredSections = onSearch ? [sections[0]] : sections;

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


    const handleFilterEvents = async (status) => {

        try {

            if (page == "group" && groupFilterHoobies?.length <= 0) {
                ShowToast(t('Select_Hobbies_to_filter'))
                return
            }
            else if (page == "event" && eventFilterHoobies?.length <= 0) {
                ShowToast(t('Select_Hobbies_to_filter'))
                return
            }
            else if (page == "chat" && chatFilterHoobies?.length <= 0) {
                ShowToast(t('Select_Hobbies_to_filter'))
                return
            }
            else if (page == "profile" && profileHobbies?.length <= 0) {
                ShowToast(t('Select_Hobbies_to_filter'))
                return
            }

            bottomSheetModalRef.current.dismiss();

        } catch (error) {
        }

    }

    const toggleAllSections = () => {
        if (areAllOpen) {
            setActiveSections([]);
            setActiveSubcategorySections({});
        } else {
            setActiveSections(sections?.map((_, index) => index));
            const newActiveSubcategorySections = hobbiesList?.reduce((acc, category) => {
                const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
                if (subcategoryIndexes) {
                    acc[category._id] = subcategoryIndexes;
                }
                return acc;
            }, {});
            setActiveSubcategorySections(newActiveSubcategorySections);
        }
        setAreAllOpen(!areAllOpen);
    };


    const handleOwnHobbies = () => {
        if (ownHobbies) {
            setOwnHobbies(false);

            const profileHobbiesIds = profile?.hobbies?.map((data) => data?._id);
            var updatedGroupFilterHoobies = [];

            if (page == "group") {
                updatedGroupFilterHoobies = groupFilterHoobies?.filter((hobbyId) =>
                    !profileHobbiesIds?.includes(hobbyId)
                );

                dispatch(update_GroupFilterHoobies(updatedGroupFilterHoobies))

            }
            else if (page == "event") {
                updatedGroupFilterHoobies = eventFilterHoobies?.filter((hobbyId) =>
                    !profileHobbiesIds?.includes(hobbyId)
                );
                dispatch(update_EventFilterHoobies(updatedGroupFilterHoobies))
            }
            else if (page == "chat") {
                updatedGroupFilterHoobies = chatFilterHoobies?.filter((hobbyId) =>
                    !profileHobbiesIds?.includes(hobbyId)
                );
                dispatch(update_ChatFilterHoobies(updatedGroupFilterHoobies))
            }
            else if (page == "profile") {
                updatedGroupFilterHoobies = profileHobbies?.filter((hobbyId) =>
                    !profileHobbiesIds?.includes(hobbyId)
                );
                dispatch(update_ProfileHobbies(updatedGroupFilterHoobies))
            }

        }
        else {

            const subcategoryIds = profile?.hobbies?.map((data) => data?._id);

            var updatedGroupFilterHoobies = [];

            if (page == "group") {
                updatedGroupFilterHoobies = [
                    ...groupFilterHoobies,
                    ...subcategoryIds.filter((id) => !groupFilterHoobies.includes(id))
                ];
                const hobbyLimit = parseInt(hobbyLimitCount);

                if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + `${hobbyLimit}` + t('interests_please_subscribe'))

                    return;
                }
                setOwnHobbies(true);

                dispatch(update_GroupFilterHoobies(updatedGroupFilterHoobies))

            }
            else if (page == "event") {
                updatedGroupFilterHoobies = [
                    ...eventFilterHoobies,
                    ...subcategoryIds.filter((id) => !eventFilterHoobies.includes(id))
                ];
                const hobbyLimit = parseInt(hobbyLimitCount);

                if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + `${hobbyLimit}` + t('interests_please_subscribe'))
                    return;
                }
                setOwnHobbies(true);

                dispatch(update_EventFilterHoobies(updatedGroupFilterHoobies))

            }
            else if (page == "chat") {
                updatedGroupFilterHoobies = [
                    ...chatFilterHoobies,
                    ...subcategoryIds.filter((id) => !chatFilterHoobies.includes(id))
                ];
                const hobbyLimit = parseInt(hobbyLimitCount);

                if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + `${hobbyLimit}` + t('interests_please_subscribe'))
                    return;
                }
                setOwnHobbies(true);
                dispatch(update_ChatFilterHoobies(updatedGroupFilterHoobies))
            }
            else if (page == "profile") {
                updatedGroupFilterHoobies = [
                    ...profileHobbies,
                    ...subcategoryIds.filter((id) => !profileHobbies.includes(id))
                ];
                const hobbyLimit = parseInt(hobbyLimitCount);

                if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                    ShowToast(t('YouCanOnlyAddUpTo') + `${hobbyLimit}` + t('interests_please_subscribe'))
                    return;
                }
                setOwnHobbies(true);
                dispatch(update_ProfileHobbies(updatedGroupFilterHoobies))
            }
        }
    }


    const handleEndReached = async (nativeEvent) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        if (apiCalled) return;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached) {
            var count = pageCount + 1
            setFooterload(true)
            handlehobbysearch(count);
        }
        else {
            setFooterload(false);
        }
    }

    const handleUpdatedProfileHobbies = async () => {
        try {
            if (apiCalled) return;
            setApiCalled(true);

            let payload = {
                "HobbiesId": profileHobbies,
                "userId": userID,
                "type": "edit",
            }

            if (profileHobbies?.length == 0) {
                ShowToast(t('HobbiesRequired'));
                return;
            }
            const result = await hobbydataadd(payload);

            ShowToast(result?.message)
            if (result?.status) {
                dispatch(update_ProfileHobbies([]));
                dispatch(Fetchprofile(userID))
            }

            bottomSheetModalRef?.current?.dismiss();

        } catch (error) {
        }
        finally {
            setApiCalled(false);
        }
    }


    return (
        <BottomSheetModalProvider >
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                shouldMeasureContentHeight={true}
                backgroundStyle={{ backgroundColor: c.secondary }}
                enableOverDrag={true}
                enableDynamicSizing={false}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: 'gray' }}
                handleStyle={{ height: 34 }}
                onDismiss={() => {
                    dispatch(update_GroupFilter(false))
                    setOnSearch(false)
                    setOwnHobbies(false)
                }}>

                <View style={{ width: "100%", height: "5%" }}>
                    <Pressable
                        style={{ alignItems: "flex-end", right: "5%" }}
                        onPress={() => page == "profile" ? handleUpdatedProfileHobbies() : handleFilterEvents("opened")}>

                        <View style={{ backgroundColor: c.white, width: "24%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center", padding: "1.3%" }}>
                            <Text style={{
                                fontFamily: Fonts.Medium,
                                color: c.secondary,
                                fontSize: RFValue(14),
                            }}>
                                {t('Submit')}
                            </Text>
                        </View>

                    </Pressable>

                </View>
                <View style={{ marginHorizontal: "2%", height: "94%", }} >

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"
                        // onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        style={{ marginTop: "2%" }}>

                        <View style={{ width: "100%", height: "100%", paddingHorizontal: "2.5%" }}>

                            {page != "group" && page != "event" &&
                                <>
                                    <Text style={styles.title}>{t('Looking_to_Connect')}</Text>

                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

                                        {profile?.hobbies?.length > 0 &&
                                            <View style={{ flexDirection: "row", marginTop: "2%", alignItems: "flex-start", paddingBottom: "3%", alignItems: "center", }}>

                                                <Text style={{ fontFamily: Fonts.Bold, color: c.primary, fontSize: RFValue(14), }}>{t('AddOwnHobbies')}</Text>
                                                <SwitchToggle
                                                    switchOn={ownHobbies}
                                                    onPress={handleOwnHobbies}
                                                    circleColorOff='#911687'
                                                    circleColorOn="#911687"
                                                    backgroundColorOn={c.primary}
                                                    backgroundColorOff={c.pink}
                                                    containerStyle={{
                                                        width: devicewidth * 0.16,
                                                        height: devicewidth * 0.074,
                                                        borderRadius: 100,
                                                        marginLeft: "10%",
                                                        padding: devicewidth * 0.01,

                                                    }}
                                                    circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                                                />
                                            </View>
                                        }


                                        <Pressable onPress={toggleAllSections} style={{ marginTop: "2%", alignItems: "flex-end" }}>
                                            <Text style={{
                                                fontFamily: Fonts.Bold,
                                                color: c.primary,
                                                fontSize: RFValue(14)
                                            }}>
                                                {areAllOpen ? t('Close_all') : t('Open_all')}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </>
                            }

                            <View style={{ paddingLeft: "6%", marginTop: "4%", marginBottom: '3%', flexDirection: "row", justifyContent: "space-evenly", alignContent: "center" }}>

                                <View style={{}}>
                                    <Text style={styles.subtitle}>{t('Hobbies')}</Text>
                                    <View style={styles.linebar}></View>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row', marginBottom: '0%', alignItems: "center", justifyContent: "center" }}>
                                    <Pressable onPress={() => {
                                        setOnSearch(!onSearch)
                                    }} style={{ position: 'absolute', right: '3%', alignSelf: 'center', padding: "8%", width: "10%", alignItems: "center", }}>
                                        {Images.search}
                                    </Pressable>
                                </View>
                            </View>

                            <View style={{ marginTop: "2%" }}>

                                <Accordion
                                    sections={filteredSections}
                                    activeSections={activeSections}
                                    renderHeader={renderHeader}
                                    renderContent={renderContent}
                                    onChange={handleCategorySectionChange}
                                    underlayColor={false}
                                    expandMultiple={true}
                                />

                                {onSearch &&
                                    <View style={{ width: "90%", alignSelf: "center", marginTop: "3%" }}>

                                        <Text style={{
                                            fontFamily: Fonts.Bold,
                                            color: "#e3e6e4",
                                            fontSize: RFValue(16),
                                        }}>
                                            {t('hobbie_search_title')}
                                        </Text>

                                        {hobbiesList?.length > 0 ? (
                                            hobbiesList.flatMap(category =>
                                                category.subcategory?.flatMap(subcategory =>
                                                    subcategory.Hobbies?.filter(hobby => {
                                                        // Match hobby name with search term
                                                        return hobby.hobbyname.toLowerCase().includes(search.toLowerCase());
                                                    }).map(filteredHobby => {
                                                        const isPremium = filteredHobby.planStatus;

                                                        return (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    if (isPremium) {
                                                                        navigation.navigate('Premium', { subcategory: filteredHobby });
                                                                    } else {
                                                                        handlesetfn(filteredHobby);
                                                                    }
                                                                }}
                                                                key={filteredHobby._id}
                                                                style={styles.genderItem}
                                                            >
                                                                <Text style={[
                                                                    styles.listText,
                                                                    isPremium && { color: '#FFD700' }
                                                                ]}>
                                                                    {filteredHobby.hobbyname}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })
                                                )
                                            )
                                        ) : (
                                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                                <Text style={{
                                                    fontFamily: Fonts.Regular,
                                                    color: c.white,
                                                    fontSize: RFValue(16),
                                                }}>{t('No_Data')}</Text>
                                            </View>

                                        )}
                                    </View>
                                }

                                {footerload &&
                                    <ActivityIndicator size="small" color={c.white} />
                                }

                            </View>
                        </View>

                    </BottomSheetScrollView>

                    {onSearch && <Pressable
                        style={{
                            width: "100%",
                            height: deviceheight * 0.0550,
                            paddingHorizontal: "3%",
                            justifyContent: "center",
                            borderRadius: borderradius * 0.5,
                            alignItems: "center",
                            borderColor: c.white,
                            borderWidth: 0.9,
                            bottom: "0%"
                        }}
                    >
                        <BottomSheetTextInput
                            placeholderTextColor={'#F7E5D0'}
                            value={search}
                            onChangeText={setSearch}
                            placeholder={t('Search_Interests')}
                            style={styles.inputtxtstyle}
                            keyboardType='default'
                        />
                    </Pressable>}
                </View>
            </BottomSheetModal>
        </BottomSheetModalProvider>

    )
}

export default Groupfilter;
const styles = StyleSheet.create({
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    genderbox: {
        width: "100%",
        height: deviceheight * 0.0830,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        backgroundColor: c.primary,
        marginTop: "3%"
    },
    genderButton: {
        width: "32%",
        alignItems: "center",
        justifyContent: "center",
        height: deviceheight * 0.0830,
        borderRadius: borderradius * 0.6,
    },
    selectedGender: {
        backgroundColor: c.white,
    },
    genderText: {
        fontSize: RFValue(20),
    },
    activegendertxt: {
        fontFamily: Fonts.Bold,
        color: c.black,
    },
    inactivegendertxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(14),
    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        marginBottom: "1%",
    },
    linebar: {
        width: 60,
        height: 3,
        backgroundColor: c.intermediate,
        marginBottom: "1%",
    },
    valueLabel: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "right",
        marginBottom: "2%",
    },
    slider: {
        width: "100%",
    },
    addcontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',

    },


    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        marginRight: '4%',
        textAlign: "center"

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
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
    },
    buttoncontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
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
    btntxt1: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(12),
        marginRight: '4%',
    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    premiumbutton: {
        padding: "3%",
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
        width: devicewidth * 0.0550,
        height: devicewidth * 0.0550,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        marginLeft: '3%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -deviceheight * 0.01,
        left: 0,
    },
    headtitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: 'center',
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
    thumbStyle: {
        width: "30%",
        height: "30%",
        borderRadius: 15,
        backgroundColor: "red",
    },
    inputsec: {
        width: "100%",
        alignSelf: "center",
        marginTop: "3%"
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        paddingVertical: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%"
    },
    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        marginLeft: 1,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.grey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTrack: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 1

    },
    unselectedTrack: {
        backgroundColor: '#E8E6EA',
        borderRadius: borderradius * 1
    },
    track: {
        height: 7,
    },
    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    listText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        marginVertical: "2.5%",
        color: c.white,
    }
})