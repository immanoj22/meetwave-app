import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet/src';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { c } from "../../Utilities/colors";
import { useDispatch, useSelector } from "react-redux";
import { helperSelector, update_CommonFilter, update_CommonFilterPayload, update_FilterByGender, update_HobbieList, update_HobbyLimit, update_Isfilter, update_NetworkVisible, update_PeopleFilterAge, update_PeopleFilterHobbies, update_PeoplGenderFilter, update_PopularHobbieList, update_statusbarcolor } from "../../Slices/helper";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { borderradius, deviceheight, devicewidth, ShowToast } from "../../Utilities/Dimensions";
import { Images } from "../../Utilities/images";
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { InsetMultiSlider, useSliderScrollLock } from "../../Utilities/MultiSliderInset";
import { GetItem } from "../../Actions/localstorage";
import { profileSelector } from "../../Slices/profile";
import { useTranslation } from 'react-i18next';
import SwitchToggle from "react-native-switch-toggle";


const CommonFilter = ({ visible, onClose, datareturn }) => {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const navigation = useNavigation()

    const bottomSheetModalRef = useRef();

    const [distance, setDistance] = useState([10]);
    // const [activeSections, setActiveSections] = useState([0, 1,]);
    // const [activeSubcategorySections, setActiveSubcategorySections] = useState({});  // For subcategory accordion

    const [search, setSearch] = useState("")
    const [onSearch, setOnSearch] = useState(false)
    // const [ownHobbies, setOwnHobbies] = useState(false)

    // const [areAllOpen, setAreAllOpen] = useState(false);
    const userID = GetItem("UserId")
    const [values, setValues] = useState([18, 30]);

    const [genderArray, setGenderArray] = useState([]);
    const { scrollEnabled, getSliderProps } = useSliderScrollLock();

    const {
        filterBysearch,
        commonLocation,
        peopleFilterHobbies,
        commonLocAdd,

        // peoplGenderFilter,
        // peopleFilterAge,
        // filterByGender,
        // popularHobbieList,
        // hobbieList,
        // isOnline,
        // hobbyLimitCount
    } = useSelector(helperSelector)
    const { activeTab } = filterBysearch;

    // useEffect(() => {

    // dispatch(update_statusbarcolor(c.primary))
    //     setDistance([10])

    // }, [isOnline, visible])

    const { profile } = useSelector(profileSelector)


    // const handleRemoveInterest = useCallback((interestId) => {
    //     const data = peopleFilterHobbies?.filter(id => id !== interestId)
    //     dispatch(update_PeopleFilterHobbies(data));
    // }, []);

    // const isInterestAdded = useCallback((subcategory) => {
    //     return peopleFilterHobbies?.includes(subcategory._id);
    // }, []);

    // const handlesetfn = useCallback((subcategory) => {
    //     const hobbyLimit = parseInt(hobbyLimitCount);


    //     if (peopleFilterHobbies?.includes(subcategory._id)) {
    //         const data = peopleFilterHobbies?.filter(id => id !== subcategory._id);
    //         dispatch(update_PeopleFilterHobbies(data));
    //     } else {
    //         if (peopleFilterHobbies?.length >= hobbyLimit) {
    //             ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
    //             return;
    //         }

    //         const data = [...peopleFilterHobbies, subcategory._id];
    //         dispatch(update_PeopleFilterHobbies(data));
    //     }
    // }, []);

    // const [nestedActiveSections, setNestedActiveSections] = useState([]);

    // const renderNestedContent = useCallback((section) => {
    //     if (Array.isArray(section.content)) {
    //         // Render another accordion for nested content
    //         return (
    //             <Accordion
    //                 sections={section.content}
    //                 activeSections={nestedActiveSections}
    //                 renderHeader={renderNestedHeader}
    //                 renderContent={renderNestedContent}
    //                 onChange={setNestedActiveSections}
    //                 underlayColor="transparent"
    //                 expandMultiple={true}
    //             />
    //         );
    //     } else {
    //         // Render final content
    //         return (
    //             <View style={{ padding: 10, }}>
    //                 <Text style={styles.finalContent}>{section.content}</Text>
    //             </View>
    //         );
    //     }
    // }, []);

    // const renderNestedHeader = useCallback((section, _, isActive) => (
    //     <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', }}>
    //         <Text style={styles.para}>{section.title}</Text>
    //         <View style={styles.swaproundbox}>
    //             <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
    //         </View>
    //     </View>
    // ), []);


    // const handleCategorySectionChange = useCallback((sections) => {
    //     setActiveSections(sections);
    // }, []);

    // const handleSubcategorySectionChange = useCallback((categoryId, sections) => {

    //     setActiveSubcategorySections(prev => ({
    //         ...prev,
    //         [categoryId]: sections,
    //     }))
    // }, []);

    // const renderHeader = useCallback((section, _, isActive) => (
    //     <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
    //         <Text style={styles.para}>{section?.title}</Text>
    //         <View style={styles.swaproundbox}>
    //             <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
    //         </View>
    //     </View>
    // ), []);

    // const renderContent = useCallback((section) => (
    //     <View>{section?.content}</View>
    // ), []);

    // const renderSubcategoryHeader = useCallback((section, _, isActive) => (
    //     <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: '3%', justifyContent: "space-between", }}>
    //         <Text style={{
    //             fontFamily: Fonts.Medium,
    //             color: "#e3e6e4",
    //             marginLeft: 20,
    //             fontSize: RFValue(16),
    //         }}>{section.title}</Text>
    //         <View style={styles.swaproundbox}>
    //             <Icon name={isActive ? 'angle-up' : 'angle-down'} size={devicewidth * 0.04} color="#fff" />
    //         </View>
    //     </View>
    // ), [])

    // const renderSubcategoryContent = useCallback((section) => (
    //     <View>
    //         {section.content}
    //     </View>
    // ), [])



    // const sections = [
    //     {
    //         title: 'Selected hobbies',
    //         content: (
    //             peopleFilterHobbies?.length > 0 ? (
    //                 <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5, }}>
    //                     {peopleFilterHobbies?.map((interest, index) => {
    //                         const hobby = hobbieList?.flatMap(category => category?.subcategory)
    //                             .flatMap(subcategory => subcategory?.Hobbies)
    //                             .find(hobby => hobby?._id === interest);

    //                         const subcate = hobbieList?.flatMap(category => category?.subcategory)
    //                             .find(hobby => hobby?._id === interest);

    //                         return (
    //                             <Pressable key={index} style={styles.addcontainer} onPress={() => handleRemoveInterest(interest)}>
    //                                 <Text style={styles.addbtntxt}>{hobby ? hobby?.hobbyname : subcate ? subcate?.hobbyname : ""}</Text>
    //                                 <View style={styles.lessbox}>
    //                                     <Icon name="minus" size={deviceheight * 0.0158} color="#fff" />
    //                                 </View>

    //                             </Pressable>
    //                         );
    //                     })}

    //                 </View>
    //             ) : (
    //                 <View style={{ alignItems: "center", justifyContent: "center" }}>
    //                     <Text style={{
    //                         fontFamily: Fonts.Regular,
    //                         color: c.white,
    //                         fontSize: RFValue(16),
    //                     }}>{t('None_Selected')}</Text>
    //                 </View>
    //             )
    //         ),
    //     },
    //     {
    //         title: 'Popular',
    //         content: (
    //             popularHobbieList?.length > 0 ? (
    //                 <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '4%', gap: 5 }}>
    //                     {popularHobbieList?.map((interest, index) => {

    //                         return (
    //                             <Pressable
    //                                 key={interest._id}
    //                                 style={styles.buttoncontainer2}
    //                                 onPress={() => handlesetfn(interest)}
    //                             >

    //                                 <Text style={styles.populartxt}>{interest?.hobbyname}</Text>
    //                                 {isInterestAdded(interest) ? (
    //                                     <View style={styles.greenbox}>
    //                                         <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
    //                                     </View>
    //                                 ) : (
    //                                     <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
    //                                 )}
    //                             </Pressable>
    //                         );
    //                     })}

    //                 </View>
    //             ) : (
    //                 <View style={{ alignItems: "center", justifyContent: "center" }}>
    //                     <Text style={{
    //                         fontFamily: Fonts.Regular,
    //                         color: c.white,
    //                         fontSize: RFValue(16),
    //                     }}>{t('None_Selected')}</Text>
    //                 </View>
    //             )
    //         ),
    //     },
    //     ...hobbieList?.map(category => ({
    //         title: category.category,
    //         content: (
    //             <View>
    //                 {category?.subcategory[0]?.Hobbies ? (
    //                     <Accordion
    //                         sections={category?.subcategory?.map(subcategory => ({
    //                             title: subcategory?.subcategory,
    //                             content: (
    //                                 <View style={{ marginTop: '2%' }}>
    //                                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
    //                                         {subcategory?.Hobbies?.map(hobby => (
    //                                             <Pressable
    //                                                 key={hobby._id}
    //                                                 style={styles.buttoncontainer}
    //                                                 onPress={() => handlesetfn(hobby)}>

    //                                                 <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
    //                                                 {isInterestAdded(hobby) ? (
    //                                                     <View style={styles.greenbox}>
    //                                                         <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
    //                                                     </View>
    //                                                 ) : (
    //                                                     <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
    //                                                 )}
    //                                             </Pressable>
    //                                         ))}
    //                                     </View>
    //                                 </View>
    //                             ),
    //                         }))}
    //                         activeSections={activeSubcategorySections[category._id] || []} // Control which subcategories are open based on state
    //                         renderHeader={renderSubcategoryHeader}
    //                         renderContent={renderSubcategoryContent}
    //                         onChange={(sections) => handleSubcategorySectionChange(category._id, sections)} // Handle changes for subcategory sections
    //                         underlayColor={false}
    //                         expandMultiple={true}
    //                     />
    //                 ) : (
    //                     <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: '2%', gap: 5 }}>
    //                         <View style={{ marginTop: '2%' }}>
    //                             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
    //                                 {category?.subcategory.map(hobby => (
    //                                     !hobby?.planStatus ? (
    //                                         <Pressable
    //                                             key={hobby._id}
    //                                             style={styles.buttoncontainer}
    //                                             onPress={() => handlesetfn(hobby)}>

    //                                             <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
    //                                             {isInterestAdded(hobby) ? (
    //                                                 <View style={styles.greenbox}>
    //                                                     <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
    //                                                 </View>
    //                                             ) : (
    //                                                 <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
    //                                             )}
    //                                         </Pressable>
    //                                     ) : (
    //                                         <Pressable onPress={() => navigation.navigate("Premium")} key={hobby._id} style={styles.premiumbutton}>
    //                                             <Text style={styles.btntxt}>{hobby?.hobbyname}</Text>
    //                                             <Icon name="plus" size={deviceheight * 0.0148} color={c.black} />
    //                                         </Pressable>
    //                                     )
    //                                 ))}
    //                             </View>
    //                         </View>
    //                     </View>
    //                 )}
    //             </View>
    //         ),
    //     }))
    // ];


    // const filteredSections = onSearch ? [sections[0]] : sections;

    useEffect(() => {
        openBottomSheet();
        // return () => {
        //     dispatch(update_CommonFilter(false));
        // }
    }, [visible]);

    const snapPoints = useMemo(() => ["95%"], []);

    const openBottomSheet = () => {
        if (visible) {
            bottomSheetModalRef.current.present();
        }
    };


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


    const Round = () => {
        return (
            <View style={{ width: 28, height: 28, backgroundColor: "#fff", borderRadius: borderradius * 5, justifyContent: "center", top: "10%" }} >
                <View style={{ width: 20, height: 20, backgroundColor: c.primary, borderRadius: borderradius * 5, alignSelf: "center" }} />
            </View>
        )
    }

    const handleValuesChange = useCallback((newValues) => {
        setValues(newValues);
        // dispatch(update_PeopleFilterAge(newValues));
    }, []);

    const handledistancechange = useCallback((newValues) => {
        setDistance(newValues);
    }, []);

    // const toggleAllSections = () => {
    //     if (areAllOpen) {
    //         setActiveSections([]);
    //         setActiveSubcategorySections({});
    //     } else {
    //         setActiveSections(sections?.map((_, index) => index));
    //         const newActiveSubcategorySections = hobbieList?.reduce((acc, category) => {
    //             const subcategoryIndexes = category?.subcategory?.map((_, subcategoryIndex) => subcategoryIndex);
    //             if (subcategoryIndexes) {
    //                 acc[category._id] = subcategoryIndexes;
    //             }
    //             return acc;
    //         }, {});
    //         setActiveSubcategorySections(newActiveSubcategorySections);
    //     }
    //     setAreAllOpen(!areAllOpen);
    // };



    // const handleOwnHobbies = useCallback(() => {
    //     if (ownHobbies) {
    //         setOwnHobbies(false);
    //         const profileHobbiesIds = profile?.hobbies?.map((data) => data?._id);
    //         const updatedGroupFilterHoobies = peopleFilterHobbies?.filter((hobbyId) =>
    //             !profileHobbiesIds?.includes(hobbyId)
    //         );
    //         dispatch(update_PeopleFilterHobbies(updatedGroupFilterHoobies))
    //     }
    //     else {
    //         const subcategoryIds = profile?.hobbies?.map((data) => data?._id);
    //         const updatedGroupFilterHoobies = [
    //             ...peopleFilterHobbies,
    //             ...subcategoryIds.filter((id) => !peopleFilterHobbies.includes(id))
    //         ];
    //         const hobbyLimit = parseInt(hobbyLimitCount);
    //         if (updatedGroupFilterHoobies?.length >= hobbyLimit) {
    //             ShowToast(`You can only add up to ${hobbyLimit} interests,To add more, please subscribe..`)
    //             return;
    //         }
    //         setOwnHobbies(true);
    //         dispatch(update_PeopleFilterHobbies(updatedGroupFilterHoobies));
    //     }
    // }, [])


    const handleSearchFunction = useCallback(() => {

        try {

            let payload = {
                userId: userID,
                //             hobbies: peopleFilterHobbies,
                distance: distance[0],
                address: commonLocation,
                latLong: commonLocAdd,
                activeTab: activeTab,
            }

            if (activeTab == "People" && genderArray?.length == 0) {
                ShowToast("Select Gender");
                return;
            }

            if (activeTab == "People") {
                payload.gender = genderArray?.length > 0 ? genderArray : "";
                payload.agestart = values[0];
                payload.ageend = values[1];
            }

            if (peopleFilterHobbies?.length > 0) {
                dispatch(update_CommonFilterPayload(payload));
                bottomSheetModalRef.current.dismiss();
            }
            else {
                ShowToast("Hobbies Required");
                return;
            }

        } catch (error) {
            console.log("Error on handleSearchFunction: ", error);
        }

    }, [genderArray, values, distance[0]])



    return (
        <BottomSheetModalProvider >
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                shouldMeasureContentHeight={false}
                backgroundStyle={{ backgroundColor: c.secondary }}
                enableOverDrag={false}
                enableDynamicSizing={false}
                // backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: 'gray' }}
                enablePanDownToClose={false}
                enableContentPanningGesture={false}
                enableHandlePanningGesture={false}
                onDismiss={() => {
                    dispatch(update_CommonFilter(false))
                    // setOnSearch(false)
                }}
            >

                <View style={{ width: "100%", height: "5%" }}>
                    <Pressable
                        style={{ width: "100%", height: "100%", alignItems: "flex-end", right: "5%" }}
                        onPress={() => handleSearchFunction()}
                    >
                        <View style={{ backgroundColor: c.white, width: "24%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center", padding: "1.3%" }}>
                            <Text style={{
                                fontFamily: Fonts.Medium,
                                color: c.secondary,
                                fontSize: RFValue(14),
                            }}>{t('Search')}</Text>
                        </View>

                    </Pressable>

                </View>
                <View style={{ height: "94.5%", marginHorizontal: "2%" }} >

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"
                        scrollEventThrottle={16}
                        scrollEnabled={scrollEnabled}
                        showsVerticalScrollIndicator={false}
                        style={{ marginTop: "5%" }} >


                        <View style={{ width: "100%", height: "100%", paddingHorizontal: "2.5%", }}>

                            {/* {activeTab == "People" && */}
                            <>
                                <Text style={styles.title}>{t('Looking_to_Connect')}</Text>
                                <View style={styles.genderbox}>

                                    <Pressable
                                        style={[
                                            styles.genderButton,
                                            genderArray?.includes("male") &&
                                            styles.selectedGender
                                        ]}
                                        onPress={() => {
                                            const updatedFilter = genderArray?.includes("male") ?
                                                genderArray?.filter((gen) => gen != "male")
                                                :
                                                [...genderArray, "male"];

                                            setGenderArray(updatedFilter);
                                        }}
                                    >

                                        <Text style={[
                                            styles.genderText,
                                            genderArray?.includes("male") ? styles.activegendertxt :
                                                styles.inactivegendertxt
                                        ]} >
                                            Male
                                            {
                                                genderArray?.includes("male")
                                                &&
                                                <View style={styles.greenbox}>
                                                    <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                </View>
                                            }
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.genderButton,
                                            genderArray?.includes("female") &&
                                            styles.selectedGender
                                        ]}
                                        onPress={() => {

                                            const updatedFilter = genderArray?.includes("female") ?
                                                genderArray?.filter((gen) => gen != "female")
                                                :
                                                [...genderArray, "female"];

                                            setGenderArray(updatedFilter);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.genderText,
                                                genderArray?.includes("female") ? styles.activegendertxt :
                                                    styles.inactivegendertxt
                                            ]}
                                        >
                                            Female
                                            {
                                                genderArray?.includes("female")
                                                &&
                                                <View style={styles.greenbox}>
                                                    <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                </View>
                                            }
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.genderButton,
                                            genderArray?.includes("other") &&
                                            styles.selectedGender
                                        ]}
                                        onPress={() => {

                                            const updatedFilter = genderArray?.includes("other") ?
                                                genderArray?.filter((gen) => gen != "other")
                                                :
                                                [...genderArray, "other"];
                                            setGenderArray(updatedFilter);
                                        }}
                                    >

                                        <Text
                                            style={[
                                                styles.genderText,
                                                genderArray?.includes("other") ? styles.activegendertxt :
                                                    styles.inactivegendertxt
                                            ]}>
                                            Others
                                            {
                                                genderArray?.includes("other")
                                                &&
                                                <View style={styles.greenbox}>
                                                    <Icon name="check" size={deviceheight * 0.0148} color={c.black} />
                                                </View>
                                            }
                                        </Text>
                                    </Pressable>
                                </View>


                                <View style={{ marginTop: "5%" }}>
                                    <View style={styles.lableHearder}>
                                        <Text style={styles.lablesubtitle}>{t('Age')}</Text>
                                        <Text style={styles.valueLabel}>{values.join(' - ')}</Text>
                                    </View>

                                    <InsetMultiSlider
                                        {...getSliderProps({
                                        values:
                                            values
                                            // peopleFilterAge
                                        ,
                                        onValuesChange: handleValuesChange,
                                        min: 18,
                                        max: 100,
                                        step: 1,
                                        allowOverlap: true,
                                        selectedStyle: styles.selectedTrack,
                                        unselectedStyle: styles.unselectedTrack,
                                        trackStyle: styles.track,
                                        customMarker: Round,
                                        })}
                                    />
                                </View>
                            </>
                            {/* } */}

                            {/* {(activeTab == "People" || activeTab == "Activities") && */}
                            <>
                                <View style={{ marginTop: "5%", marginBottom: "2%" }}>
                                    <View style={styles.lableHearder}>
                                        <Text style={styles.lablesubtitle}>{t('SearchRadius')} ({t('kmFromMe')})</Text>
                                        <Text style={styles.valueLabel}>{distance[0]} km</Text>
                                    </View>
                                    <InsetMultiSlider
                                        {...getSliderProps({
                                        values: distance,
                                        onValuesChange: handledistancechange,
                                        min: 0,
                                        max: 100,
                                        step: 1,
                                        allowOverlap: true,
                                        selectedStyle: styles.selectedTrack,
                                        unselectedStyle: styles.unselectedTrack,
                                        trackStyle: styles.track,
                                        customMarker: Round,
                                        })}
                                    />
                                </View>
                                {profile?.plan?.length > 0 &&
                                    <Pressable Pressable onPress={() => {
                                        navigation.navigate("LocationHome", { from: activeTab, setAddress: "currentLoc" })
                                    }}
                                        style={{
                                            width: "100%",
                                            justifyContent: "center",
                                            paddingHorizontal: "3%",
                                            paddingVertical: "3%",
                                            borderRadius: borderradius * 0.3,
                                            borderColor: c.white,
                                            borderWidth: 0.9,
                                            marginTop: "5%",
                                            marginBottom: "5%"
                                        }}>
                                        <Text style={styles.locationtxt}>{commonLocation}</Text>
                                        <View style={{ position: "absolute", right: "3%", alignSelf: "center", }} >
                                            {Images.location1}
                                        </View>
                                    </Pressable>
                                }
                            </>
                            {/* } */}

                            <View style={styles.linebar2}></View>

                            <View style={{ width: "100%", flexDirection: "column", justifyContent: "space-between", alignItems: "center", marginVertical: "2.5%" }}>


                                <Pressable onPress={() => { setOnSearch(!onSearch) }} style={{
                                    flex: 1,
                                    height: deviceheight * 0.0500,
                                    borderRadius: borderradius * 0.5,
                                    alignItems: "center",
                                    borderColor: c.white,
                                    borderWidth: 0.9,
                                    justifyContent: "center",
                                    bottom: "0.3%",
                                    padding: 3
                                }}>
                                    <View style={{ width: "95%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        <View style={{ paddingHorizontal: 10 }}>{Images.search}</View>
                                        <TextInput
                                            placeholderTextColor={'#F7E5D0'}
                                            value={search}
                                            onChangeText={setSearch}
                                            placeholder={t('Search_Hobbies')}
                                            style={styles.inputtxtstyle}
                                            keyboardType='default'
                                        />

                                    </View>
                                </Pressable>


                                {/* {profile?.hobbies?.length > 0 && */}
                                <>
                                    <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 10, }}>

                                        <View style={{ flex: 1, marginTop: "3%" }}>
                                            <Text style={{ fontFamily: Fonts.Bold, color: c.primary, fontSize: RFValue(13) }}> {t('AddOwnHobbies')} </Text>
                                            <Text style={{ fontFamily: Fonts.Bold, color: c.white, fontSize: RFValue(12) }}> {t('Add_hobbies_selected_in_your_profile')} </Text>

                                        </View>

                                        <SwitchToggle
                                            // switchOn={ownHobbies}
                                            // onPress={handleOwnHobbies}
                                            circleColorOff='#911687'
                                            circleColorOn="#911687"
                                            backgroundColorOn={c.primary}
                                            backgroundColorOff={c.pink}
                                            containerStyle={{
                                                width: devicewidth * 0.16,
                                                height: devicewidth * 0.070,
                                                borderRadius: 100,
                                                padding: devicewidth * 0.01,


                                            }}
                                            circleStyle={{ width: devicewidth * 0.050, height: devicewidth * 0.050, borderRadius: 100 }}
                                        />
                                    </View>
                                    <Text style={{ fontFamily: Fonts.Bold, color: c.grey, fontSize: RFValue(11.8), alignSelf: "center" }}> ( {t('Hobbies_Max_unPaid_users')} ) </Text>
                                </>
                                {/* } */}

                            </View>


                            <View style={{ width: '100%', flexDirection: 'row', marginBottom: '3%', marginTop: '2%', alignItems: "center", justifyContent: "flex-start", }}>

                                <Text style={{ flex: 1, fontFamily: Fonts.Bold, color: c.primary, fontSize: RFValue(14) }}>
                                    {t('Expand_all')}
                                </Text>

                                <SwitchToggle
                                    // switchOn={areAllOpen}
                                    // onPress={toggleAllSections}
                                    circleColorOff='#911687'
                                    circleColorOn="#911687"
                                    backgroundColorOn={c.primary}
                                    backgroundColorOff={c.pink}

                                    containerStyle={{
                                        width: devicewidth * 0.16,
                                        height: devicewidth * 0.070,
                                        borderRadius: 100,
                                        padding: devicewidth * 0.01,
                                        marginLeft: 10

                                    }}
                                    circleStyle={{ width: devicewidth * 0.050, height: devicewidth * 0.050, borderRadius: 100 }}
                                />

                            </View>


                            <View style={{ marginTop: "4%" }}>
                                <Text style={styles.HobbiesSubT}>{t('Hobbies')}</Text>
                                <View style={styles.linebar}></View>
                            </View>

                            {/* <View style={{ marginTop: "2%" }}>

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
                                            fontFamily: Fonts.Bold,
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
                                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                                <Text style={{
                                                    fontFamily: Fonts.Regular,
                                                    color: c.white,
                                                    fontSize: RFValue(16),
                                                }}>{t('None_Selected')}</Text>
                                            </View>

                                        )}
                                    </View>
                                }
                            </View> */}
                        </View>

                    </BottomSheetScrollView>


                </View>
            </BottomSheetModal >
        </BottomSheetModalProvider >
    )
}

export default CommonFilter;

const styles = StyleSheet.create({
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    locationtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(13.5),
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
    lableHearder: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: '2%',
    },

    lablesubtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        flex: 0.7
    },

    valueLabel: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "right",
        flex: 0.3
    },
    HobbiesSubT: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    linebar: {
        width: 60,
        height: 3,
        backgroundColor: c.intermediate,
        marginBottom: "1%",
    },
    linebar2: {
        width: "100%",
        padding: 2,
        borderRadius: 5,
        backgroundColor: c.intermediate,
        marginBottom: "1%",
    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
        marginBottom: "1%",
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
    },

    para: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2.5),
    },
    para_sub: {
        fontFamily: Fonts.Bold,
        color: c.white,
        marginLeft: 20,
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
    OwnHobbiestxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    populartxt: {
        fontFamily: Fonts.Medium,
        color: c.black,
        fontSize: RFValue(13),
        marginRight: '4%',
    },
    premiumbutton: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.grey,
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
        width: "90%",
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
        width: "90%",
        height: "100%",
    },
    greenbox: {
        width: devicewidth * 0.045,
        height: devicewidth * 0.045,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: c.grey,
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    searchIconstyle: {
        height: deviceheight * 0.0500,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: c.white,
        justifyContent: "center",
        paddingHorizontal: 10
    }
})