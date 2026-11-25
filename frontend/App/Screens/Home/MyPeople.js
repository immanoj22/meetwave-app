import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, ImageBackground, Pressable, ActivityIndicator } from 'react-native';
import { borderradius, devicewidth, ShowToast } from '../../Utilities/Dimensions';
import { Images } from '../../Utilities/images';
import { c } from '../../Utilities/colors';
import { Fonts } from '../../Utilities/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_FetchProfileId, update_MyPeople, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { profileSelector } from '../../Slices/profile';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { GetUserfollowing } from '../../Actions/hooks';
import { GetItem } from '../../Actions/localstorage';
import { Imageroute } from '../../Actions/constant';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { randomimages } from '../../Utilities/profileImages';
import Commonheader from '../../Navigation/commonheader';
import { getMutualHobbiesSorted, hobbyIdString } from '../../Utilities/mutualHobbies';

const { width } = Dimensions.get('window');

const MyPeople = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const userID = GetItem("UserId")
    const [page, setPage] = useState(1)

    //loaders
    const [loading, setLoading] = useState(false);
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const dispatch = useDispatch()

    const route = useRoute();
    const { payload } = route?.params || {};
    const { myPeople, isOnline } = useSelector(helperSelector)
    const { profile } = useSelector(profileSelector);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary))
        }, [])
    )

    useEffect(() => {
        handleFriendList(1)
    }, [])

    function getRandomValue() {
        const values = [0.225, 0.3, 0.275];
        const randomIndex = Math.floor(Math.random() * values.length);
        return values[randomIndex];
    }

    const handleFriendList = async (count) => {
        try {

            if (!isOnline) {
                setLoading(false)
                dispatch(update_NetworkVisible(true));
                return
            }

            if (loading) return;
            setLoading(true)

            if (!maxreached) {

                let payload = {
                    userId: userID,
                    page: count,
                    limit: 10,
                }

                if (count == 1) {
                    setMaxreached(false)
                }
                else {
                    setFooterload(true)
                }
                const result = await GetUserfollowing(payload);
                setLoading(false)
                setFooterload(false)
                if (result?.status) {

                    setPage(count)

                    if (result?.data?.length > 0) {

                        if (result?.data?.length < 10) {
                            setMaxreached(true);
                        }

                        const convert = result?.data
                            ?.map((e) => ({
                                ...e?.to,
                                height: getRandomValue(),
                            }));

                        if (count == 1) {

                            dispatch(update_MyPeople(convert))
                        }
                        else {
                            var local = [...myPeople, ...convert]
                            dispatch(update_MyPeople(local))
                        }
                    }
                    else {
                        setMaxreached(true)
                    }
                }
                else {
                    setMaxreached(true)
                }

            }

        }
        catch (err) {
            setFooterload(false)

        }
    }

    const handleNavigete = (item) => {

        if (!isOnline) {
            setLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }

        dispatch(update_FetchProfileId(item?._id))

        navigation.navigate("HomeDetail", { detail: item })
    }

    const numColumns = 2;

    const renderItems = () => {
        const columns = Array.from({ length: numColumns }, () => []);
        const columnHeights = Array(numColumns).fill(0);

        myPeople?.forEach((item) => {
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            columns[shortestColumnIndex].push(item);
            columnHeights[shortestColumnIndex] += item.height * width * 0.2 + 10;
        });

        return columns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.column} >
                {column.map((item, index) => {
                    if (!item) return null;
                    const mutualHobbies = getMutualHobbiesSorted(profile?.hobbies, item?.hobbies);
                    const showPlusBadge = mutualHobbies.length > 2;
                    const dualHobbies = mutualHobbies.length >= 2;
                    const firstPillMaxWidth = showPlusBadge ? "38%" : "52%";
                    return (
                            <Pressable
                                onPress={() => {
                                    handleNavigete(item)
                                }}
                                key={item._id ?? item.id ?? index}
                                style={[
                                    styles.item,
                                    {
                                        height: item.height * width * 2,
                                        backgroundColor: item.color,
                                        borderColor: c.white, borderWidth: 0.2,
                                    },
                                ]}
                            >
                                <ImageBackground resizeMode='cover' style={{ width: "100%", height: "100%", zIndex: 9999, elevation: 5, justifyContent: "center" }} borderRadius={borderradius * 0.5}

                                    source={
                                        !(item?.profile)
                                            ? randomimages[item?.randomIndex]
                                            : { uri: `${Imageroute.PersonalProfile}${item?.profile}` }
                                    }  >
                                    <Pressable
                                        // onPress={() => handleUserFollow(item)} 
                                        style={{ width: devicewidth * 0.09, height: devicewidth * 0.09, position: "absolute", top: "2.5%", right: "2.5%", backgroundColor: c.secondary, alignItems: "center", borderRadius: borderradius * 5, justifyContent: "center", }} >
                                        {/* {Images.profilereq} */}

                                        <Pressable style={[styles.roundbox1, { marginLeft: "4%" }]}>
                                            {Images.profiletick}
                                        </Pressable>
                                    </Pressable>

                                    <View style={{ width: "100%", position: "absolute", bottom: 0, left: 0, right: 0, justifyContent: "space-around", paddingHorizontal: "5%", paddingVertical: "2.5%", marginTop: 5 }} >
                                        <Text style={{ color: "#fff", fontFamily: Fonts.SemiBold, fontSize: RFValue(15) }} >{item?.name}</Text>
                                        {mutualHobbies.length > 0 && (
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }} >
                                                {mutualHobbies.slice(0, 2).map((hobby, hIdx) => {
                                                    const basePill = {
                                                        paddingVertical: 5,
                                                        borderRadius: borderradius * 5,
                                                        backgroundColor: "#d2d2d5",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        paddingHorizontal: 5,
                                                    };
                                                    const pillStyle = !dualHobbies
                                                        ? { ...basePill, flex: 1, minWidth: 0 }
                                                        : hIdx === 0
                                                        ? {
                                                              ...basePill,
                                                              flexGrow: 0,
                                                              flexShrink: 0,
                                                              maxWidth: firstPillMaxWidth,
                                                          }
                                                        : { ...basePill, flex: 1, minWidth: 0, flexShrink: 1 };
                                                    return (
                                                    <View key={hobbyIdString(hobby) || hIdx} style={pillStyle} >
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                            style={{ color: "#000", fontFamily: Fonts.Regular, fontSize: RFValue(9), width: "100%", textAlign: "center" }}
                                                        >{hobby?.hobbyname ?? hobby?.hobbyName}</Text>
                                                    </View>
                                                    );
                                                })}

                                                {mutualHobbies.length > 2 && (
                                                    <View style={{ flexShrink: 0, paddingVertical: 4, paddingHorizontal: 8, justifyContent: "center", alignItems: "center", backgroundColor: "#d2d2d5", borderRadius: borderradius * 5 }} >
                                                        <Text style={{ color: "#000", fontFamily: Fonts.Regular, fontSize: RFValue(9) }} >+{mutualHobbies.length - 2}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>

                                </ImageBackground>
                            </Pressable>
                    );
                })}
            </View>
        ));
    };

    const handleScrollEnd = (nativeEvent) => {

        if (!isOnline) {
            setLoading(false)
            dispatch(update_NetworkVisible(true));
            return
        }


        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && !maxreached) {
            // Load more data when reaching the end
            var count = page + 1
            handleFriendList(count)
        }
    };

    const handleBack = React.useCallback(() => {
            navigation.goBack();
        }, [navigation]);    


    return (

        <View style={{ flex: 1, }} >
            <LinearGradient style={{ width: "100%", height: "100%", }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <ImageBackground style={{ width: "100%", height: "100%", }} source={Images.homebg}  >

                    <Commonheader
                        title={t('My_Friends')}
                        onback={handleBack}
                    />

                    <>
                        {myPeople?.length > 0 ?
                            <View style={{ height: "88%", paddingVertical: "2.5%", paddingHorizontal: "3%", }} >

                                <ScrollView
                                    onScroll={({ nativeEvent }) => handleScrollEnd(nativeEvent)}
                                    scrollEventThrottle={16}
                                    showsVerticalScrollIndicator={false} >
                                    <View style={styles.container}>
                                        {renderItems()}
                                    </View>
                                    {maxreached && footerload &&
                                        <View style={{ marginVertical: "5%", alignItems: "center", paddingVertical: "2%" }} >
                                            <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                        </View>}
                                </ScrollView>

                            </View>

                            :
                            <View style={{ height: "70%", alignItems: "center", justifyContent: "center" }}>
                                <View style={{ marginTop: "5%" }}>
                                    <Text style={styles.noDataText}>{t('No_Members_Found')}</Text>
                                </View>
                            </View>
                        }
                    </>

                </ImageBackground>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // padding: 10,
    },
    column: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 5,
        elevation: 5
    },
    item: {
        width: '100%',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderradius * 0.5,
        marginTop: "2.5%"
    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "12%",
        //flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center'
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0
    },
    headertxt: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
        textAlign: "center"
    },
    noDataText: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "center"


    },
});

export default MyPeople;

