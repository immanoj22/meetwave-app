import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, StatusBar, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../Utilities/images';
import { genderlistapi } from '../../Actions/hooks';
import { helperSelector, update_FilterByGender } from '../../Slices/helper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const OthersPage = (props) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [search, setSearch] = useState("");
    const [genderList, setGenderList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [maxReached, setMaxReached] = useState(false);
    const dispatch = useDispatch()
    const { filterByGender } = useSelector(helperSelector)
    const [selectPage, setSelectPage] = useState("")
    const [apiCalled, setApiCalled] = useState(false);

    const fetchGenders = async (newPage) => {
        try {

            if (apiCalled) return;
            setApiCalled(true);

            if (!maxReached) {
                newPage == 1 ? setLoading(true) : setIsFetchingMore(true); // Show loading spinner based on page
                const payload = {
                    "gender": search,
                    "page": newPage,
                    "limit": 20,
                };

                const result = await genderlistapi(payload);
                if (result?.data?.length > 0) {
                    const newGenderList = result.data;

                    if (newPage == 1) {
                        setGenderList(newGenderList); // Replace the list on the first page
                    } else {
                        setGenderList(prevGenderList => [...prevGenderList, ...newGenderList]); // Append to the list for subsequent pages
                    }

                    setPage(newPage)
                }
                else {
                    setGenderList([])
                }

                if (result?.data?.length == 0) {
                    setMaxReached(true);
                }
            }
        } catch (err) {

        }
        finally {
            setIsFetchingMore(false);
            setApiCalled(false)
        }

    };

    useEffect(() => {
        setLoading(true)
        fetchGenders(1); // Fetch the first page of data on mount
        setLoading(false)
        setSelectPage(props?.route?.params?.page)

    }, [search]);

    const handleLoadMore = () => {
        if (isFetchingMore || search != "") return;
        const newPage = page + 1;
        fetchGenders(newPage)
    };

    const isInterestAdded = (item) => {
        return filterByGender?.includes(item);
    };

    const renderGenderItem = ({ item }) => (
        <TouchableOpacity onPress={() => { selectPage && selectPage == "peopleFilter" ? handleGenderList(item?.gendername) : navigation.navigate("PersonDetails", { searchdata: item.gendername }) }} style={styles.genderItem}>
            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "center" }}>
                <Text style={styles.genderText}>{item.gendername}</Text>
                {isInterestAdded(item?.gendername) ? (
                    <View style={{
                        width: devicewidth * 0.05,
                        height: devicewidth * 0.05,
                        borderRadius: (devicewidth * 0.15) / 2,
                        backgroundColor: "#47db40",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "2%"
                    }}>
                        <Icon name="check" size={deviceheight * 0.0180} color={c.black} />
                    </View>
                ) : (
                    <View style={{
                        width: devicewidth * 0.05,
                        height: devicewidth * 0.05,
                        borderRadius: (devicewidth * 0.15) / 2,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "2%"
                    }}>
                        <Icon name="plus" size={deviceheight * 0.0180} color={c.black} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const handleGenderList = (item) => {
        // Check if the item already exists in the array

        if (!filterByGender.includes(item)) {
            dispatch(update_FilterByGender([...filterByGender, item]));
        }
        else {
            const filters = filterByGender?.filter((data) => data != item)
            dispatch(update_FilterByGender(filters));
        }

    }


    const renderFooter = () => {
        if (!isFetchingMore) return null;
        return <ActivityIndicator size="large" color={c.white} style={styles.loader} />;
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={c.primary} />
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={styles.boxcontainer}>
                    <View style={styles.backcontainer}>
                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                            <Pressable onPress={() => navigation.goBack()} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>
                            <View style={{ width: "83%", flexDirection: 'row', alignItems: "center", marginLeft: "3%" }}>
                                <Pressable style={styles.searchcontainer}>
                                    {Images.search1}
                                    <TextInput
                                        placeholderTextColor={'#F7E5D0'}
                                        value={search}
                                        onChangeText={(text) => {
                                            setSearch(text)
                                            setMaxReached(false)
                                        }}
                                        placeholder={t('StartTyping')}
                                        style={styles.inputtxtstyle}
                                    />
                                </Pressable>
                                {search &&
                                    <Pressable style={styles.closebox} onPress={() => setSearch("")}>
                                        {Images.close1}
                                    </Pressable>
                                }
                            </View>
                        </View>
                    </View>

                    <View style={{ width: "100%", height: deviceheight * 0.88 }}>
                        {loading ? (
                            <ActivityIndicator size="large" color={c.white} style={styles.loader} />
                        ) : (

                            <>
                                {
                                    genderList?.length > 0 ?

                                        <FlatList
                                            data={genderList}
                                            renderItem={renderGenderItem}
                                            keyExtractor={(item, index) => index.toString()}
                                            onEndReached={handleLoadMore}
                                            onEndReachedThreshold={0.1}
                                            ListFooterComponent={renderFooter}
                                            contentContainerStyle={{ paddingBottom: "8%" }}

                                        />
                                        :
                                        <Text style={styles.noDataText}>{t('No_Data_Found')}</Text>
                                }
                            </>

                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export default OthersPage;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: devicewidth,
        height: deviceheight
    },
    title: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(16),
    },
    subtitle: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(12),
    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: deviceheight * 0.120,
        flexDirection: "row",
        alignItems: "center",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    headertxt: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
        textAlign: "center"
    },
    searchcontainer: {
        width: '100%',
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'space-between',
        height: deviceheight * 0.0520,
        paddingHorizontal: '3%',
        borderRadius: borderradius * 0.9,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    inputtxtstyle: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: '100%',
        marginLeft: "1%"
    },
    genderItem: {
        padding: "4%",
        borderBottomWidth: 0.4,
        borderBottomColor: '#ccc',
        alignItems: "center",
        justifyContent: "center"
    },
    genderText: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
    },
    noDataText: {
        height: "80%",
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: 'center',
        marginTop: 20,
        alignContent: 'center',
        textAlignVertical: 'center',
    },
    closebox: {
        width: devicewidth * 0.08,
        height: devicewidth * 0.08,
        alignItems: "center",
        justifyContent: "center",
        position: 'absolute',
        right: '3%',
        alignSelf: "center",
    }
});
