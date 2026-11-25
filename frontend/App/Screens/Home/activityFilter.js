

import React, { useCallback, seEffect, useMemo, useRef, useState, useEffect } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_ActivitiesDistance, update_ActivitiesFilterHobbies, update_ActivityFilter, update_HobbieList, update_HobbyLimit, update_NetworkVisible, update_PopularHobbieList, update_statusbarcolor } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/FontAwesome6';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { InsetMultiSlider, useSliderScrollLock } from "../../Utilities/MultiSliderInset";
import { hobbydatasearch } from "../../Actions/hooks";
import { GetItem } from "../../Actions/localstorage";
import { profileSelector } from "../../Slices/profile";

import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";

const ActivityFilter = ({ visible, onClose, datareturn }) => {

    const { t } = useTranslation();

    const bottomSheetModalRef = useRef();
    const [distance, setDistance] = useState([10]);
    const [ageRange, setAgeRange] = useState([20, 28]);
    const [activeSections, setActiveSections] = useState([0, 1,]);
    const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion

    const [hobbieLimit, setHobbieLimit] = useState(null);
    const [pageLoad, setPageLoad] = useState(true);

    const [search, setSearch] = useState("")
    const [onSearch, setOnSearch] = useState(false)

    const [areAllOpen, setAreAllOpen] = useState(false);

    const [ownHobbies, setOwnHobbies] = useState(true)
    const { scrollEnabled, getSliderProps } = useSliderScrollLock();

    const userID = GetItem("UserId")
    var getad = GetItem("currentLoc")

    const [page, setPage] = useState(1)
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const [apiCalled, setApiCalled] = useState(false);

    const { profile } = useSelector(profileSelector)

    const { activitiesFilterHobbies, filterDistance, hobbieList, popularHobbieList, isOnline, filterBysearch } = useSelector(helperSelector)
    const { activeTab } = filterBysearch;


    useEffect(() => {
        if (activeTab == 'Activities') {
            dispatch(update_statusbarcolor(c.primary))
            handlehobbysearch(1);
        }
    }, [isOnline, visible])




    const handleRemoveInterest = (interestId) => {
        // setAddedInterests(addedInterests.filter(id => id !== interestId));

        const data = activitiesFilterHobbies.filter(id => id !== interestId)

        dispatch(update_ActivitiesFilterHobbies(data));

    };
    const isInterestAdded = (subcategory) => {
        return activitiesFilterHobbies?.includes(subcategory._id);
    };


    const handlehobbysearch = async (count) => {
        try {

            // return;

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (apiCalled) return;
            setApiCalled(true);

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
        if (activitiesFilterHobbies.length >= hobbyLimit) {
            // showwarningmessage("Warning", `You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`);
            ShowToast(t('YouCanOnlyAddUpTo') + " " + hobbyLimit + " " + t('interests_please_subscribe'))

            return;
        }
        if (activitiesFilterHobbies.includes(subcategory._id)) {
            // Remove the id from the array
            const data = activitiesFilterHobbies.filter(id => id !== subcategory._id);

            dispatch(update_ActivitiesFilterHobbies(data));
        } else {
            // Add the id to the array
            const data = [...activitiesFilterHobbies, subcategory._id];
            dispatch(update_ActivitiesFilterHobbies(data));
        }
    };



    const handleCategorySectionChange = (sections) => {
        setActiveSections(sections);
    };

    const handleSubcategorySectionChange = (categoryId, sections) => {
        // setActiveSubcategorySections(sections);

        setActiveSubcategorySections(prev => ({
            ...prev,
            [categoryId]: sections,
        }))
    };

    // Render Header for Category Accordion
    const renderHeader = (section, _, isActive) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%' }}>
            <Text style={styles.para}>{section.title}</Text>
            <View style={styles.swaproundbox}>
                <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
            </View>
        </View>
    );

    // Render Content for Category Accordion
    const renderContent = (section) => (
        <View>{section.content}</View>
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
                activitiesFilterHobbies?.length > 0 ? (
                    <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
                        {activitiesFilterHobbies?.map((interest, index) => {
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

                                    <Text style={styles.btntxt1}>{interest?.hobbyname}</Text>
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
                                    <View style={{ marginTop: '2%', }}>
                                        {/* Render Hobbies under the Subcategory */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                            {subcategory?.Hobbies?.map(hobby => (
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
                        <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5 }}>
                            <View style={{ marginTop: '0%' }}>
                                {/* Render Hobbies under the Subcategory */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {category?.subcategory.map(hobby => (
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
            dispatch(update_ActivityFilter(false))
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
    }, []);

    const handledistancechange = useCallback((newValues) => {
        setDistance(newValues);
    }, []);

    const handleFilterEvents = async (status) => {

        try {


            let payload = {
                userId: userID,
                latitude: (getad?.lat && filterDistance) ? getad?.lat : profile?.location?.coordinates[0],
                longitude: (getad?.long && filterDistance) ? getad?.long : profile?.location?.coordinates[1],
                distance: distance[0],
                hobbies: activitiesFilterHobbies,
                type: "submit",
            }

            if (payload?.hobbies?.length <= 0) {
                ShowToast("Select Hobbies to Filter")
                return
            }


            dispatch(update_ActivityFilter(false));
            dispatch(update_ActivitiesDistance(distance[0]))

            bottomSheetModalRef.current.dismiss();
            navigation.navigate("Activities", { payload: payload })

        } catch (error) {

        }

    }

    const toggleAllSections = () => {
        if (areAllOpen) {
            setActiveSections([0]); // Close all sections
            setActiveSubcategorySections([0])
        } else {
            setActiveSections(sections.map((_, index) => index)); // Open all sections
            setActiveSubcategorySections(sections.map((_, index) => index))
        }
        setAreAllOpen(!areAllOpen); // Toggle state
    };


    const handleOwnHobbies = () => {
        if (ownHobbies) {
            setOwnHobbies(false);

            const profileHobbiesIds = profile?.hobbies?.map((data) => data?._id);

            const updatedGroupFilterHoobies = activitiesFilterHobbies?.filter((hobbyId) =>
                !profileHobbiesIds?.includes(hobbyId)
            );

            dispatch(update_ActivitiesFilterHobbies(updatedGroupFilterHoobies))
        }
        else {
            const subcategoryIds = profile?.hobbies?.map((data) => data?._id);

            const updatedGroupFilterHoobies = [
                ...activitiesFilterHobbies,
                ...subcategoryIds.filter((id) => !activitiesFilterHobbies.includes(id))
            ];

            const hobbyLimit = parseInt(hobbieLimit);

            if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
                ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
                return;
            }

            setOwnHobbies(true);
            dispatch(update_ActivitiesFilterHobbies(updatedGroupFilterHoobies));
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
                onDismiss={() => setOnSearch(false)}
            >
                <View style={{ width: "100%", height: "5%" }}>
                    <Pressable
                        style={{ alignItems: "flex-end", right: "5%" }}
                        onPress={() => handleFilterEvents("opened")}
                    >
                        <View style={{ backgroundColor: c.white, width: "24%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center", padding: "1.3%" }}>
                            <Text style={{
                                fontFamily: Fonts.Medium,
                                color: c.secondary,
                                fontSize: RFValue(16),
                            }}>{t('Submit')}</Text>
                        </View>
                    </Pressable>

                </View>
                <View style={{ marginHorizontal: "2%", height: "94%", }} >

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"

                        // onScroll={({ nativeEvent }) => handleEndReached(nativeEvent)}
                        scrollEventThrottle={16}
                        scrollEnabled={scrollEnabled}

                        showsVerticalScrollIndicator={false}
                        style={{ marginTop: "5%" }}
                    >


                        <View style={{ width: "100%", height: "100%", paddingHorizontal: "2.5%" }}>
                            <Text style={styles.title}>{t('Looking_JoinEvent')}</Text>

                            <View style={{ marginTop: "5%" }}>
                                <Text style={styles.subtitle}>{t('Distance')}</Text>
                                <Text style={styles.valueLabel}>{distance[0]} km</Text>
                                <InsetMultiSlider
                                    {...getSliderProps({
                                    values: distance,
                                    onValuesChange: handledistancechange,
                                    min: 10,
                                    max: 50,
                                    step: 1,
                                    allowOverlap: true,
                                    selectedStyle: styles.selectedTrack,
                                    unselectedStyle: styles.unselectedTrack,
                                    trackStyle: styles.track,
                                    customMarker: Round,
                                    })}
                                />
                            </View>
                            {profile?.hobbies?.length > 0 &&
                                <View style={{ width: "100%", flexDirection: "row", marginTop: "2%", paddingBottom: "3%", alignItems: "center", alignSelf: "center", justifyContent: "center" }}>


                                    <Text style={{ fontFamily: Fonts.Bold, color: c.primary, fontSize: RFValue(14), alignItems: "flex-start", }}>{t('AddOwnHobbies')}</Text>

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
                                            padding: devicewidth * 0.01,
                                            marginLeft: "10%"

                                        }}
                                        circleStyle={{ width: devicewidth * 0.055, height: devicewidth * 0.055, borderRadius: 100 }}
                                    />


                                    <Pressable onPress={toggleAllSections} style={{ width: "39%", marginTop: "2%", alignItems: "flex-end", alignSelf: "flex-end", alignContent: "flex-end", justifyContent: "flex-end", }}>
                                        <Text style={{
                                            fontFamily: Fonts.Bold,
                                            color: c.primary,
                                            fontSize: RFValue(16),
                                        }}>
                                            {areAllOpen ? t('Close_all') : t('Open_all')}
                                        </Text>

                                    </Pressable>
                                </View>
                            }




                            <View style={{ marginTop: "2%" }}>
                                <Text style={styles.subtitle}>{t('Hobbies')}</Text>
                            </View>


                            <View style={{ width: '100%', flexDirection: 'row', marginBottom: '4%', alignItems: "center", justifyContent: "center" }}>
                                <Pressable onPress={() => {
                                    setOnSearch(!onSearch)
                                }} style={{ position: 'absolute', right: '3%', alignSelf: 'center', padding: "8%", width: "10%", alignItems: "center", }}>
                                    {Images.search}
                                </Pressable>
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
                                    <View style={{ width: "90%", alignSelf: "center", marginTop: "3%", }}>

                                        <Text style={{
                                            fontFamily: Fonts.Medium,
                                            color: "#e3e6e4",
                                            fontSize: RFValue(16),
                                        }}>
                                            {t('hobbie_search_title')}
                                        </Text>

                                        {hobbieList?.length > 0 ? (
                                            hobbieList.flatMap(category =>
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
                                            <Text style={styles.noDataText}>{t('No_Data')}</Text>
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

export default ActivityFilter;
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
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
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
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    btntxt1: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(12),
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
        height: "100%"
    },
    greenbox: {
        width: devicewidth * 0.056,
        height: devicewidth * 0.056,
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
    listText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        marginVertical: "2%",
        color: c.white,
    }
})