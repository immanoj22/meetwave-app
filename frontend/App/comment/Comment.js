import { View, Text, StyleSheet, Pressable, Image, Platform, ActivityIndicator, } from 'react-native';
import { textInputPlaceholderCenter } from '../Utilities/textInputLayout';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet/src';
import { Fonts } from '../Utilities/fonts';
import { c } from '../Utilities/colors';
import { borderradius, deviceheight, devicewidth, ShowToast } from '../Utilities/Dimensions';
import { Images } from '../Utilities/images';
import { eventaddcommentapi, eventcommentlistapi, eventdeletecommentapi } from '../Actions/hooks';
import { GetItem } from '../Actions/localstorage';
import { Imageroute } from '../Actions/constant';
import { profileSelector } from '../Slices/profile';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useTranslation } from 'react-i18next';
import { randomimages } from '../Utilities/profileImages';
import { helperSelector, update_NetworkVisible } from '../Slices/helper';

const Comment = ({ visible, eventid, onclose }) => {
    const { t } = useTranslation();
    const scrollref = useRef(null)
    const [comments, setComments] = useState([])
    const [commenttext, setCommenttext] = useState("")
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1)
    const userID = GetItem("UserId")
    const dispatch = useDispatch()
    const { profile } = useSelector(profileSelector)
    const { isOnline } = useSelector(helperSelector)

    // Only reset parent visibility when this screen loses focus or the
    // component unmounts — not when `visible` / `eventid` change. Putting
    // `onclose(false)` in a `useFocusEffect` cleanup that depended on those
    // values ran *before* each open, which closed the sheet immediately.
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                bottomSheetModalRef.current?.dismiss?.();
                onclose(false);
                setPage(1);
            };
        }, [onclose])
    );

    useEffect(() => {
        if (!visible || !eventid) {
            bottomSheetModalRef.current?.dismiss?.();
            return;
        }
        setMaxreached(false);
        setComments([]);
        setPage(1);
        handleCommentlist(1);
        const frame = requestAnimationFrame(() => {
            bottomSheetModalRef.current?.present?.();
        });
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- open/refresh when sheet opens for an event
    }, [visible, eventid]);
    const bottomSheetModalRef = useRef();
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
    const [footerload, setFooterload] = useState(false)
    const [maxreached, setMaxreached] = useState(false);
    const handleCommentlist = async (page) => {
        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }

            if (!maxreached) {
                var payload = {
                    "eventId": eventid,
                    "page": page,
                    "limit": 10
                }

                if (page == 1) {
                    setLoading(true)
                }
                else {
                    setFooterload(true)
                }
                const result = await eventcommentlistapi(payload)
                setLoading(false)
                setFooterload(false)

                if (result?.data?.length > 0) {
                    var convert = result?.data?.map((e) => {

                        return ({
                            name: e?.userId?.username,
                            comment: e?.comments,
                            image: e?.userId?.profile,
                            commentid: e?._id,
                            randomIndex: e?.userId?.randomIndex
                        })
                    })

                    const ordered = [...convert].reverse();
                    if (page === 1) {
                        setComments(ordered);
                    } else {
                        setComments(prev => [...prev, ...ordered]);
                    }
                    setPage(page)
                }
                else {
                    if (page === 1) {
                        setComments([]);
                    }
                    setMaxreached(true)
                }
            }
        }
        catch (err) {
            setLoading(false)
            setFooterload(false)
        }
    }

    const handleaddComment = async () => {

        if (!commenttext == "") {
            try {

                if (!isOnline) {
                    dispatch(update_NetworkVisible(true));
                    return
                }

                var payload = {
                    "userId": userID,
                    "eventId": eventid,
                    "comments": commenttext
                }

                setCommenttext("")
                const result = await eventaddcommentapi(payload)

                if (result?.status) {

                    var convert = {
                        name: profile.username,
                        comment: commenttext,
                        image: profile.profile,
                        commentid: result?.data?._id,
                        randomIndex: profile?.randomIndex
                    }
                    var data = [...comments]
                    data.unshift(convert)
                    setComments(data)
                    scrollref.current.scrollToOffset({ offset: 0, animated: true });

                }

            }
            catch (err) {
            }
        } else {
            ShowToast("Enter the comments")
        }
    }


    const updatefn = () => {

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return
        }

        var count = page + 1
        handleCommentlist(count)
    }

    const handleDeleteComment = async (item, index) => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }


            if (item?.commentid) {
                var payload = {
                    "commentId": item?.commentid
                }
                const result = await eventdeletecommentapi(payload)
                if (result?.status) {
                    var local = [...comments]
                    local.splice(index, 1)
                    setComments(local)

                }
            }
            else {
                var local = [...comments]
                local.splice(index, 1)
                setComments(local)
            }

        }
        catch (err) {
        }

    }

    const openDeleteMenu = (item, index) => {
        // alert(item)
        // setDeleteData(item);
        // setIndexData(index)

    }




    return (
        <>
            <BottomSheetModalProvider >

                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    snapPoints={["100%"]}
                    shouldMeasureContentHeight={true}
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={true}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: c.white }}
                    keyboardBehavior={Platform.OS === 'android' ? 'none' : 'extend'}
                    keyboardBlurBehavior="restore"
                    onDismiss={() => onclose(false)}>

                    <BottomSheetScrollView
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="never"
                        showsVerticalScrollIndicator={false}>


                        <View style={{ flex: 1, height: deviceheight * 0.9, }}>
                            <View>
                                <Text style={styles.cmttxt}>{t('Comment')}</Text>
                            </View>
                            {loading ?
                                <View style={{ height: "90%", justifyContent: "center" }} >
                                    <ActivityIndicator size="small" color={c.white} />
                                </View>
                                :
                                <>
                                    {!comments?.length ?
                                        <View style={{ height: "90%", justifyContent: "center", }}>
                                            <Text style={styles.noDataText}>{t('No_Comments_Found')}</Text>
                                        </View>
                                        :
                                        <View style={{ height: "90%", }} >
                                            <BottomSheetFlatList
                                                ref={scrollref}
                                                data={comments}
                                                onEndReached={updatefn}

                                                renderItem={({ item, index }) => (
                                                    <Menu>
                                                        <MenuTrigger key={index} triggerOnLongPress={() => openDeleteMenu(item, index)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "8%", width: "95%", alignSelf: "center", }}>
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <View style={styles.avatorbox}>
                                                                    {item?.image ?
                                                                        <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                            source={{ uri: `${Imageroute.PersonalProfile}` + `${item?.image}` }}
                                                                        />
                                                                        :
                                                                        <Image style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                                            source={randomimages[item?.randomIndex]}
                                                                        />

                                                                    }

                                                                </View>
                                                                <View style={{ marginLeft: "6%" }}>
                                                                    <Text style={styles.gptitle}>{item?.name}</Text>
                                                                    <Text style={styles.gpsubtitle}>{item?.comment}</Text>
                                                                </View>

                                                            </View>

                                                        </MenuTrigger>

                                                        <MenuOptions optionsContainerStyle={{
                                                            backgroundColor: 'white',
                                                            padding: 3,
                                                            borderRadius: 5,
                                                            width: 150,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.2,
                                                            shadowRadius: 5,
                                                            elevation: 5,
                                                            marginHorizontal: 12
                                                        }}>
                                                            <MenuOption onSelect={() => handleDeleteComment(item, index)}>
                                                                <View style={{
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    paddingVertical: "5%"

                                                                }}>
                                                                    <Text style={{ color: c.black, fontFamily: Fonts.Medium, fontSize: RFValue(12) }}>{t('Delete')}</Text>
                                                                </View>
                                                            </MenuOption>
                                                        </MenuOptions>
                                                    </Menu>
                                                )}
                                            />




                                            {footerload &&
                                                <ActivityIndicator size="small" color={c.white} style={{ alignSelf: "center", position: "absolute", bottom: 0 }} />
                                            }
                                        </View>
                                    }
                                </>
                            }


                        </View>
                    </BottomSheetScrollView>


                    <View style={{ width: "90%", alignSelf: "center", height: deviceheight * 0.1, justifyContent: "center", }}>
                        <View style={styles.inputcontainer}>
                            <View style={{ width: "85%", paddingHorizontal: "5%", }} >
                                <BottomSheetTextInput
                                    placeholderTextColor={"#F7E5D0"}
                                    value={commenttext}
                                    onChangeText={setCommenttext}
                                    placeholder={t('Start_a_new_discussion')}
                                    style={styles.inputtxtstyle}
                                    keyboardType='name-phone-pad'
                                    // onFocus={handleFocus}
                                //   keyboardBlurBehavior
                                // keyboardShouldPersistTaps
                                />
                            </View>
                            <Pressable onPress={handleaddComment} style={{ width: "15%", alignItems: "center" }}>
                                {Images.send1}
                            </Pressable>

                        </View>




                    </View>


                </BottomSheetModal>

            </BottomSheetModalProvider>
        </>



    )
}

export default Comment;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    title: {
        fontFamily: Fonts.ExtraBold,
        color: c.white,
        fontSize: RFValue(19),
        textAlign: "center"


    },
    subtitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(17),

    },
    backcontainer: {
        width: "90%",
        alignSelf: "center",
        height: "12%",
        flexDirection: "row",
        alignItems: "center",


    },
    roundbox: {
        width: devicewidth * 0.11,
        height: devicewidth * 0.11,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    locationtxt: {
        fontFamily: Fonts.Regular,
        color: "#E0D3D3",
        fontSize: RFValue(14),

    },
    locationtxt1: {
        width: "60%",
        fontFamily: Fonts.Regular,
        color: "#E0D3D3",
        fontSize: RFValue(14),

    },

    dotstyle: {
        width: "2%",
        borderWidth: 0.5,
        borderColor: "#fff",
        height: deviceheight * 0.0070,
        borderRadius: borderradius * 0.4,
        backgroundColor: c.grey,
        alignSelf: "center",
        marginLeft: "1.5%"
    },
    qstbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "2%"



    },
    abouttxt: {
        fontFamily: Fonts.Bold,
        color: c.primary,
        fontSize: RFValue(17),

    },
    paratxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Light,
        color: c.grey,
        letterSpacing: 0.3,
        textAlign: "justify"
    },
    seetxt: {
        fontFamily: Fonts.SemiBold,
        color: c.primary,
        fontSize: RFValue(17),

    },
    activityContainer: {
        flexDirection: 'row',
        marginTop: "3%",
    },
    activityBox: {
        width: devicewidth * 0.560,
        marginRight: 10,
        backgroundColor: "#901A79",
        borderRadius: borderradius * 0.5,
        paddingHorizontal: "2%",
        paddingVertical: "2%",
        height: deviceheight * 0.2
    },
    activityImage: {
        width: '100%',
        height: deviceheight * 0.15,
        borderRadius: borderradius * 0.5
    },
    activityDate: {
        fontFamily: Fonts.Light,
        color: c.grey,
        fontSize: RFValue(12),
    },
    activityTitle: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(13),
        marginTop: "3%"

    },
    activityloctxt: {
        fontFamily: Fonts.Regular,
        color: "#E0D3D3",
        fontSize: RFValue(12),
        marginTop: "1%"

    },
    friendtxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),

    },
    avatorbox: {
        width: devicewidth * 0.110,
        height: devicewidth * 0.110,
        borderRadius: (devicewidth * 0.12) / 2,
        backgroundColor: c.primary,
        marginLeft: '4%',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#fff",
        borderWidth: 1
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        borderRadius: borderradius * 0.6,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        backgroundColor: "#C77F86",
        borderWidth: 0.9,
        flexDirection: "row"

    },
    inputtxtstyle: {
        ...textInputPlaceholderCenter,
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,
        width: "100%",
        height: "100%"
    },
    cmttxt: {
        textAlign: "center",
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white
    },
    gptitle: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(16),
    },
    gpsubtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
    },
    timetxt: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(12),
    },
    msgbox: {
        width: devicewidth * 0.05,
        height: devicewidth * 0.05,
        borderRadius: borderradius * 2,
        backgroundColor: c.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2%"

    },
    msgtxt: {
        fontFamily: Fonts.Regular,
        color: c.black,
        fontSize: RFValue(10),
    },
    noDataText: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(14),
        textAlign: "center"

    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: c.white,
        borderRadius: borderradius * 0.5,
        padding: "6%",
        alignItems: "center",
    },
    modalText: {
        fontSize: RFValue(12),
        textAlign: "center",
        marginBottom: "4%",
    },
    modalButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        padding: "3%",
        borderRadius: borderradius * 0.5,
        flex: 1,
        marginHorizontal: "2%",
        alignItems: "center",
    },
    modalButtonCancel: {
        backgroundColor: c.grey,
    },
    modalButtonDelete: {
        backgroundColor: "red",
    },
    modalButtonText: {
        color: c.white,
    },

});