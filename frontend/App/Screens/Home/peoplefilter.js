

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_FilterByGender, update_HobbieList, update_HobbyLimit, update_Isfilter, update_NetworkVisible, update_PeopleFilter, update_PeopleFilterAge, update_PeopleFilterHobbies, update_PeoplGenderFilter, update_PopularHobbieList, update_statusbarcolor } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/FontAwesome6';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { hobbydatasearch } from "../../Actions/hooks";
import { GetItem } from "../../Actions/localstorage";
import { profileSelector } from "../../Slices/profile";

import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";



const Peoplefilter = ({ visible, onClose, datareturn }) => {

    const { t } = useTranslation();

    const bottomSheetModalRef = useRef();
    const [selectedGender, setSelectedGender] = useState("");

    const [page, setPage] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);

    const [ageRange, setAgeRange] = useState([20, 28]);
    const [activeSections, setActiveSections] = useState([0, 1,]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion
    const [hobbieLimit, setHobbieLimit] = useState(null);

    const [pageLoad, setPageLoad] = useState(true);
    const [search, setSearch] = useState("")
    const [onSearch, setOnSearch] = useState(false)
    const [apiCalled, setApiCalled] = useState(false);
    const [ownHobbies, setOwnHobbies] = useState(false)
    const [areAllOpen, setAreAllOpen] = useState(false);
    const userID = GetItem("UserId")

    const { filterByGender, peoplGenderFilter, peopleFilterAge, peopleFilterHobbies, popularHobbieList, hobbieList, isOnline, filterBysearch } = useSelector(helperSelector)
    const { activeTab } = filterBysearch;

    useEffect(() => {
        if (activeTab == 'People') {
            dispatch(update_statusbarcolor(c.primary))
            handlehobbysearch(1);
        }
    }, [isOnline, visible])

    const { profile } = useSelector(profileSelector)

    const handleRemoveInterest = (interestId) => {

        const data = peopleFilterHobbies?.filter(id => id !== interestId)

        dispatch(update_PeopleFilterHobbies(data));
    };
    const isInterestAdded = (subcategory) => {
        return peopleFilterHobbies?.includes(subcategory._id);
    };

    const handlehobbysearch = async (count) => {
        try {

            return;

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
                    "limit": 10
                }

                if (count == 1) {
                    setPageLoad(true)
                    setPage(1)
                    setMaxreached(false)
                }
                else {
                    setFooterload(true)
                }


                const result = await hobbydatasearch(payload)
                setPage(count)
                setHobbieLimit(result?.HobbyLimit)
                dispatch(update_HobbyLimit(result?.HobbyLimit))

                if (result?.status) {

                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 10) {
                            setMaxreached(true);
                        }

                        dispatch(update_PopularHobbieList(result?.PopularHobbies));
                        if (count == 1) {
                            dispatch(update_HobbieList(result?.data))
                        }
                        else {
                            let local = [...hobbieList, ...result?.data];
                            dispatch(update_HobbieList(local))
                        }
                    }
                    else if (count == 1) {
                        dispatch(update_HobbieList([]))
                        dispatch(update_PopularHobbieList([]));
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
        const hobbyLimit = parseInt(hobbieLimit);

        if (peopleFilterHobbies?.length >= hobbyLimit) {
            ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
            return;
        }
        if (peopleFilterHobbies?.includes(subcategory._id)) {
            // Remove the id from the array
            const data = peopleFilterHobbies?.filter(id => id !== subcategory._id);
            dispatch(update_PeopleFilterHobbies(data));

        } else {
            // Add the id to the array
            const data = [...peopleFilterHobbies, subcategory._id];
            dispatch(update_PeopleFilterHobbies(data));
        }
    };
    const [nestedActiveSections, setNestedActiveSections] = useState([]);
    const renderNestedContent = (section) => {
        if (Array.isArray(section.content)) {
            // Render another accordion for nested content
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
            // Render final content
            return (
                <View style={{ padding: 10, }}>
                    <Text style={styles.finalContent}>{section.content}</Text>
                </View>
            );
        }
    };
    const renderNestedHeader = (section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%' }}>
            <Text style={styles.para}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    );
    const handleCategorySectionChange = (sections) => {
        setActiveSections(sections);
    };

    const handleSubcategorySectionChange = (categoryId, sections) => {
        setActiveSubcategorySections(prev => ({
            ...prev,
            [categoryId]: sections,
        }))
    };

    // Render Header for Category Accordion
    const renderHeader = (section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%' }}>
            <Text style={styles.para}>{section?.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    );

    // Render Content for Category Accordion
    const renderContent = (section) => (
        <View>{section?.content}</View>
    );

    // Render Header for Subcategory Accordion
    const renderSubcategoryHeader = (section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%' }}>
            <Text style={{
                fontFamily: Fonts.Medium,
                color: "#e3e6e4",
                fontSize: RFValue(16),
            }}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    );

    // Render Content for Subcategory Accordion
    const renderSubcategoryContent = (section) => (
        <View>
            {section.content}
        </View>
    );



    const sections = [
        {
            title: 'selected hobbies',
            content: (
                peopleFilterHobbies?.length > 0 ? (
                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5, }}>
                        {peopleFilterHobbies?.map((interest, index) => {
                            // Find the hobby object from categories or wherever the full list is stored
                            const hobby = hobbieList?.flatMap(category => category?.subcategory)
                                .flatMap(subcategory => subcategory?.Hobbies)
                                .find(hobby => hobby?._id === interest);

                            const subcate = hobbieList?.flatMap(category => category?.subcategory)
                                .find(hobby => hobby?._id === interest);

                            return (
                                <Pressable key={index} style={styles.addcontainer} onPress={() => handleRemoveInterest(interest)}>
                                    <Text style={styles.addbtntxt}>{hobby ? hobby?.hobbyname : subcate ? subcate?.hobbyname : ""} - </Text>
                                    <Icon1 name="minus" size={deviceheight * 0.0148} color="#fff" />
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
        // {
        //     title: 'own hobbies',
        //     content: (
        //         profile?.hobbies?.length > 0 ? (
        //             <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
        //                 {profile?.hobbies?.map((interest, index) => {

        //                     return (
        //                         <Pressable
        //                             key={interest._id}
        //                             style={styles.buttoncontainer}
        //                             onPress={() => handlesetfn(interest)}
        //                         >

        //                             <Text style={styles.btntxt}>{interest?.hobbyname}</Text>
        //                             {isInterestAdded(interest) ? (
        //                                 <View style={styles.greenbox}>
        //                                     <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
        //                                 </View>
        //                             ) : (
        //                                 <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
        //                             )}
        //                         </Pressable>
        //                     );
        //                 })}

        //             </View>
        //         ) : (
        //             <View style={{ alignItems: "center", justifyContent: "center" }}>
        //                 <Text style={{
        //                     fontFamily: Fonts.Regular,
        //                     color: c.white,
        //                     fontSize: RFValue(16),
        //                 }}>{t('No_Data')}</Text>
        //             </View>
        //         )
        //     ),
        // },
        {
            title: 'popular hobbies',
            content: (
                popularHobbieList?.length > 0 ? (
                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
                        {popularHobbieList?.map((interest, index) => {
                            return (
                                <Pressable
                                    key={interest._id}
                                    style={styles.buttoncontainer2}
                                    onPress={() => handlesetfn(interest)}
                                >

                                    <Text style={styles.btntxt}>{interest?.hobbyname}</Text>
                                    {isInterestAdded(interest) ? (
                                        <View style={styles.greenbox}>
                                            <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                        </View>
                                    ) : (
                                        <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
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
        ...hobbieList?.map(category => ({
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
                                                        onPress={() => handlesetfn(hobby)}
                                                    >

                                                        <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                        {isInterestAdded(hobby) ? (
                                                            <View style={styles.greenbox}>
                                                                <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                            </View>
                                                        ) : (
                                                            <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
                                                        )}
                                                    </Pressable>
                                                )
                                                    :
                                                    (
                                                        <Pressable onPress={() => navigation.navigate("Premium")} key={subcategory._id} style={styles.premiumbutton}>
                                                            <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                            <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
                                                            <View style={styles.premiumIcon}>
                                                                {Images.premium}
                                                            </View>
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
                                                onPress={() => handlesetfn(hobby)}
                                            >

                                                <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                {isInterestAdded(hobby) ? (
                                                    <View style={styles.greenbox}>
                                                        <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                    </View>
                                                ) : (
                                                    <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
                                                )}
                                            </Pressable>
                                        )
                                            :
                                            (
                                                <Pressable onPress={() => navigation.navigate("Premium")} key={hobby._id} style={styles.premiumbutton}>
                                                    <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
                                                    <Icon name="plus" size={deviceheight * 0.0148} color={c.white} />
                                                    <View style={styles.premiumIcon}>
                                                        {Images.premium}
                                                    </View>
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

    const dispatch = useDispatch()
    useEffect(() => {
        openBottomSheet();
        return () => {
            dispatch(update_Isfilter(false))
        }
    }, [visible]);
    const snapPoints = useMemo(() => ["95%"], []);

    const openBottomSheet = () => {
        if (visible) {
            bottomSheetModalRef.current.present();
        }
    };

    const navigation = useNavigation()

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

    const handleAgeChange = (value) => {
        setAgeRange([Math.floor(value[0]), Math.ceil(value[1])]);
    };

    const [values, setValues] = useState([18, 30]);

    const Round = () => {
        return (
            <View style={{ width: 28, height: 28, backgroundColor: "#fff", borderRadius: borderradius * 5, justifyContent: "center", top: "10%" }} >
                <View style={{ width: 20, height: 20, backgroundColor: c.primary, borderRadius: borderradius * 5, alignSelf: "center" }} />
            </View>
        )
    }

    const handleValuesChange = useCallback((newValues) => {
        setValues(newValues);
        dispatch(update_PeopleFilterAge(newValues));

    }, []);

    const handleFilterEvents = async (status) => {

        try {

            let payload = {
                userId: userID,
                gender: peoplGenderFilter?.length > 0 ? peoplGenderFilter[0] : filterByGender,
                agestart: peopleFilterAge[0],
                ageend: peopleFilterAge[1],
                hobbies: peopleFilterHobbies,
                status: status,

            }

            if (payload?.gender?.length <= 0) {
                ShowToast("Select Gender to filter")
                return
            }
            if (payload?.hobbies?.length <= 0) {
                ShowToast("Select Hobbies to filter")
                return
            }


            if (payload?.hobbies?.length <= 0 || payload?.gender?.length <= 0) {
                return;
            }

            dispatch(update_Isfilter(false));

            bottomSheetModalRef.current.dismiss();
            navigation.navigate("People", { payload: payload })

        } catch (error) {

        }

    }

    const toggleAllSections = () => {
        if (areAllOpen) {
            setActiveSections([0]); // Close all sections
            setActiveSubcategorySections([0])
        } else {
            setActiveSections(sections?.map((_, index) => index)); // Open all sections
            setActiveSubcategorySections(sections.map((_, index) => index))
        }
        setAreAllOpen(!areAllOpen); // Toggle state
    };

    const handleOwnHobbies = () => {
        if (ownHobbies) {
            setOwnHobbies(false);

            const profileHobbiesIds = profile?.hobbies?.map((data) => data?._id);

            const updatedGroupFilterHoobies = peopleFilterHobbies?.filter((hobbyId) =>
                !profileHobbiesIds?.includes(hobbyId)
            );

            dispatch(update_PeopleFilterHobbies(updatedGroupFilterHoobies))
        }
        else {
            const subcategoryIds = profile?.hobbies?.map((data) => data?._id);

            const updatedGroupFilterHoobies = [
                ...peopleFilterHobbies,
                ...subcategoryIds.filter((id) => !peopleFilterHobbies.includes(id))
            ];

            const hobbyLimit = parseInt(hobbieLimit);

            if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
                return;
            }

            setOwnHobbies(true);
            dispatch(update_PeopleFilterHobbies(updatedGroupFilterHoobies));
        }
    }


    const handleEndReached = async (nativeEvent) => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached) {
            var count = page + 1
            handlehobbysearch(count);
        }
        else {
            setFooterload(false);
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
                onDismiss={() => {
                    dispatch(update_PeopleFilter(false))
                    setOnSearch(false)
                }}>

                <View style={{ width: "100%", height: "5%" }}>
                    <Pressable
                        style={{ alignItems: "flex-end", right: "5%" }}
                        onPress={() => handleFilterEvents("opened")}
                    >
                        <View style={{ backgroundColor: c.white, width: "24%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center", padding: "1.3%" }}>
                            <Text style={{
                                fontFamily: Fonts.Medium,
                                color: c.secondary,
                                fontSize: RFValue(14),
                            }}>{t('Submit')}</Text>
                        </View>

                    </Pressable>

                </View>
                <View style={{ height: "94.5%", marginHorizontal: "2%" }} >

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"

                        // onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                        scrollEventThrottle={16}

                        showsVerticalScrollIndicator={false}
                        style={{ marginTop: "5%" }}
                    >


                        

                    </BottomSheetScrollView>

                    {onSearch && <Pressable style={{
                        width: "100%",
                        height: deviceheight * 0.0550,
                        paddingHorizontal: "3%",
                        justifyContent: "center",
                        borderRadius: borderradius * 0.5,
                        alignItems: "center",
                        borderColor: c.white,
                        borderWidth: 0.9,

                        bottom: "0.3%"
                    }}>
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

export default Peoplefilter;
const styles = StyleSheet.create({
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    genderbox: {
        width: "100%",
        height: deviceheight * 0.0850,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        borderColor: c.white,
        borderWidth: 1.8,
        backgroundColor: c.primary,
        marginTop: "3%"
    },
    genderButton: {
        flex: 1,
        marginHorizontal: "1%",
        paddingVertical: "2%",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        height: deviceheight * 0.0650,
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
        fontSize: RFValue(16),
        color: c.black,
        verticalAlign: "middle"
    },
    inactivegendertxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        verticalAlign: "middle",
        fontSize: RFValue(16),
    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
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
        backgroundColor: c.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',

    },
    addbtntxt: {
        fontFamily: Fonts.Medium,
        color: c.secondary,
        fontSize: RFValue(13),
        marginRight: '4%',

    },
    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
    },
    buttoncontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '4%',
    },
    buttoncontainer2: {
        padding: "3.6%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.primary,
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
        color: c.white,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    premiumbutton: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.primary,
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
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%",
    },
    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.white,
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