import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ImageBackground, Keyboard, ActivityIndicator, Image, Modal, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { navigateToFilterSheet } from '../../Utilities/filterSheetPresent';
import { Images } from '../../Utilities/images';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useDispatch, useSelector } from 'react-redux';
import { update_GroupFilter, update_ProfileHobbies, update_statusbarcolor } from '../../Slices/helper';
import { GetItem } from '../../Actions/localstorage';
import { editProfileapi } from '../../Actions/hooks';
import { GOOGLEAPIKEY, Imageroute, Imageurl } from '../../Actions/constant';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { helperSelector } from '../../Slices/helper';
import { randomimages } from '../../Utilities/profileImages';

import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-native-image-zoom-viewer';
import BiodetailPopup from './BiodetailPopup';
import Groupfilter from '../Home/GroupFilter';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet/src';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AlertPopup from '../../Components/AlertPopup';
import { showwarningmessage } from '../../Actions/config';
import Geocoder from 'react-native-geocoding';
import ImageResizer from 'react-native-image-resizer';


const ProfileDetail = () => {

    const { t } = useTranslation();

    const [imagePrevUrl, setImagePrevUrl] = useState([]);
    const [mediaVisible, setMediaVisible] = useState(false)
    const { isGroupFilter } = useSelector(helperSelector);
    const navigation = useNavigation();
    const [prfileData, setProfileData] = useState({})
    const [bio, setBio] = useState("")

    const [isExpand, setExpand] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const userID = GetItem("UserId")
    const dispatch = useDispatch()

    const [bioDesc, setBioDesc] = useState("");
    const [biosDescLoading, setBioDescLoading] = useState(false);

    const bottomSheetRef = useRef(null);
    const [boiImages, setBioImage] = useState(false);
    const [profileImages, setProfileImages] = useState([]);
    const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
    Geocoder.init(GOOGLEAPIKEY);

    const openBioImagePicker = () => {
        // setEditProfileImage(true)
        // setImageOpened(true);
        setBioImage(true);
        bottomSheetRef.current.present();
    };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         dispatch(update_statusbarcolor("#071B2E"))
    //         dispatch(Fetchprofile(userID))
    //         handleImagePreview()
    //     }, [])
    // )

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor("#071B2E"));
        }, [dispatch])
    );

    useFocusEffect(
        useCallback(() => {
            const frame = requestAnimationFrame(() => {
                dispatch(Fetchprofile(userID));
                handleImagePreview();
            });

            return () => cancelAnimationFrame(frame);
        }, [dispatch, userID, handleImagePreview])
    );
    const { profile } = useSelector(profileSelector);
    //const data = profile?.bioimage

    const handleprofilelist = async () => {
        try {
            setProfileData({ ...profile, "Groupcounts": profile.Groupcounts });
            setBioDesc(profile?.bio)

            var boiimages = profile?.bioimage?.map((e) => ({
                uri: `${Imageroute.boiImagePath}` + e
            }))
            setProfileImages(boiimages);



            const local = profile?.hobbies?.map((data) => {
                return {
                    _id: data?._id,
                    hobbyName: data?.hobbyname,
                };
            });

            dispatch(update_ProfileHobbies(local));

        } catch (err) {

        }
    };

    useEffect(() => {
        if (profile) {
            handleprofilelist()
            getCityFromCoords()
            //getAddressFromCoordinates()
        }
    }, [profile])


    const handleImagePreview = async () => {
        const path = Imageroute?.PersonalProfile
        let imageObjects = [
            {
                url: `${path}${profile?.profile}`
            }
        ]

        setImagePrevUrl(imageObjects);
    }

    const handleImageView = async () => {
        setMediaVisible(true)
    }

    const handleStaticImagePreview = async () => {

        let imageObjects = [{
            url: '',
            props: {
                source: randomimages[profile?.randomIndex]
            }
        }]
        setImagePrevUrl(imageObjects)
    }

    const handleStaticImageView = () => {
        handleStaticImagePreview()
        setMediaVisible(true)
    }

    const toggleExpand = () => {
        setExpand(!isExpand);
    }

    const handleBioImageView = () => {

        // let path = Imageurl + "/Bioimage/"

        const imageObjects = profileImages.map(image => ({
            url: image?.uri
        }));

        setImagePrevUrl(imageObjects);
        setMediaVisible(true)
    }


    function ageCalculation(birthDateString) {
        const birthDate = new Date(birthDateString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        // Adjust age if birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    }


    const getCityFromCoords = async () => {

        Geocoder.from(9.920017399999999, 78.080545)
            .then(json => {
                const addressComponents = json.results[0].address_components;
                // Extract city, town, or village from addressComponents
                // Example: Find a component with 'locality' or 'sublocality' type
                // const cityComponent = addressComponents.find(component => component.types.includes('locality') || component.types.includes('sublocality'));

                const cityComponent = addressComponents.find(component => component.types.includes('locality'));

                const villageName = addressComponents.find(component => component.types.includes('sublocality'));

                const CityName = addressComponents.find(component => component.types.includes('administrative_area_level_3'));

                if (cityComponent) {
                    console.log("City ==>", cityComponent.long_name);
                }
                if (villageName) {
                    console.log("Town ==> ", villageName.long_name);
                }
                if (CityName) {
                    console.log("Village ==> ", CityName.long_name);
                }

            })
            .catch(error => console.warn(error));

    };


    const handleEditBioDesc = async () => {
        try {
            const age = ageCalculation(profile?.dob);

            let payload = {
                "name": profile?.name,
                "type": "homeEdit",
                "dob": profile?.dob ? profile?.dob.split('T')[0] : '',
                "age": age,
                "gender": profile?.gender,
                "username": profile?.username,
                "email": profile?.email,
                "bio": bioDesc,
                "personalAddress": profile?.personalAddress,
                "privacy_status": profile?.privacy_status,
                "randomIndex": profile?.randomIndex,
                "MychatDiscription": profile?.MychatDiscription,
                "latitude": profile?.location?.coordinates[1],
                "longitude": profile?.location?.coordinates[0],
                "biodelete": "[]",
                "bioimage": [],
                "image": profile?.profile ? profile?.profile : "",
            }


            setBioDescLoading(true);
            const result = await editProfileapi(payload);

            if (result?.status) {
                dispatch(Fetchprofile(userID));
            }

        } catch (error) {

        }
        finally {
            setBioDescLoading(false);
        }
    }

    const handleEditBioImage = (type) => {

        setModalVisible(!modalVisible);

        if (type == "cancel") {
            setBioDesc(profile?.bio);
        }
        else if (type == "submit") {
            handleEditBioDesc();
        }
    }

    const handleSelectImage = (source, callback) => {
        bottomSheetRef.current.close();
        const options = {
            mediaType: 'photo',
            quality: 1,
            includeExtra: true, // Needed for EXIF
            selectionLimit: boiImages ? (3 - profileImages?.length) : 2,
        };

        const handleResponse = async (response) => {
            if (response?.assets?.length > 0) {
                const image = response.assets[0];

                try {
                    // Replace the original image with the normalized one
                    callback(response);

                } catch (error) {
                    console.error('Image resize error:', error);
                    callback(response); // fallback to original
                }
            } else {
                callback(response);
            }
        };

        if (source === 'library') {
            launchImageLibrary(options, handleResponse);
        } else if (source === 'camera') {
            launchCamera(options, handleResponse);
        }
    };

    const handleBioImageResponse = (response) => {

        if (response?.didCancel) {

        } else if (response?.errorMessage) {

        } else if (response?.assets && response?.assets?.length > 0) {
            if (response?.assets?.length > 3) {
                showwarningmessage(t('we_allow_only_limited_amount_of_images'));
            }

            const size = (3 - profileImages?.length);


            console.log("Size----", size, response?.assets?.length, boiImages, profileImages?.length);

            if (size) {
                setProfileImages(prevImages => [...prevImages, ...response?.assets?.slice(0, size)])
                handleBioImageUpdate(response?.assets?.slice(0, size))
            }
            else {
                setProfileImages(response?.assets)
                handleBioImageUpdate(response?.assets)
            }
        }
        setBioImage(false);
    };

    const handleBioImageUpdate = async (asset) => {
        try {

            let assets = asset;
            const age = ageCalculation(profile?.dob);

            let payload = {
                "name": profile?.name,
                "type": "homeEdit",
                "dob": profile?.dob,
                "age": age,
                "gender": profile?.gender,
                "username": profile?.username,
                "email": profile?.email,
                "bio": profile?.bio,
                "personalAddress": profile?.personalAddress,
                "privacy_status": profile?.privacy_status,
                "randomIndex": profile?.randomIndex,
                "MychatDiscription": profile?.MychatDiscription,
                "latitude": profile?.location?.coordinates[1],
                "longitude": profile?.location?.coordinates[0],
                "biodelete": "[]",
                "image": profile?.profile ? profile?.profile : "",
            }

            payload.bioimage = assets.map(item => ({
                uri: Platform.OS === 'android' ? item?.uri : item?.uri?.replace('file://', ''),
                type: item?.type === 'image/jpg' ? 'image/jpeg' : item?.type,
                name: item?.fileName,
            }));

            const result = await editProfileapi(payload);

            if (result?.status) {
                dispatch(Fetchprofile(userID));
            }

        } catch (error) {
            console.log("Error on handleBioImageUpdate: ", error)
        }
    }

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

    const handleNaigatePremium = async () => {
        setIsPremiumModalVisible(false)
        navigation.navigate("Premium")
    }

    return (
        <>
            <LinearGradient style={{ width: "100%", height: "100%", flex: 1 }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View style={{ height: "35%", }} >
                    <ImageBackground onStartShouldSetResponder={() => Keyboard.dismiss()}
                        source={Images.profilebackgroundbg}
                        style={{ width: devicewidth, height: deviceheight * 0.35 }} resizeMode='stretch'>
                        <View style={styles.backcontainer}>
                            <Pressable onPress={() => navigation.navigate("Homescreen")} style={styles.roundbox}>
                                {Images.back}
                            </Pressable>

                        </View>

                        <View style={{ alignItems: "center", alignSelf: "center", justifyContent: "center", marginTop: "2%" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>

                                <Pressable onPress={() => navigation.navigate("ProfileHome", { settingdata: prfileData })} style={{ padding: "2.5%", flex: 1 }}>
                                    <View style={{ flexDirection: "column", alignItems: "center", elevation: 1 }}>
                                        {Images.pencil}
                                        <Text style={styles.topViewTxt}>{t('Profile_Settings')}</Text>
                                    </View>
                                </Pressable>

                                <View style={styles.avatorbox}>

                                    {prfileData?.profile != "" ?
                                        <Pressable onPress={handleImageView}>
                                            <Image style={{ width: devicewidth * 0.24, height: "99%", borderRadius: borderradius * 1 }}
                                                source={{ uri: `${Imageroute.PersonalProfile}` + `${prfileData?.profile}` }} />
                                        </Pressable>
                                        :
                                        <Pressable onPress={handleStaticImageView} >
                                            <Image style={{ width: 95, height: "100%", borderRadius: borderradius * 1 }}
                                                source={randomimages[prfileData?.randomIndex]}
                                                resizeMode="cover"
                                            />
                                        </Pressable>

                                    }

                                </View>

                                <Pressable onPress={() => navigation.navigate("SettingPage")} style={{ padding: "2.5%", flex: 1, elevation: 1 }}>
                                    <View style={{ flexDirection: "column", alignItems: "center" }}>
                                        {Images.setting}
                                        <Text style={styles.topViewTxt}>{t('App_Settings')}</Text></View>
                                </Pressable>

                            </View>

                            <View style={{ marginTop: "3%", }}>
                                <Text style={styles.nametxt}>{prfileData?.username}</Text>
                                <View style={{ flexDirection: "row", marginTop: "0%", width: "85%" }}>
                                </View>
                            </View>

                        </View>

                    </ImageBackground>
                </View>

                <View style={{ height: "65%", }} >
                    <ImageBackground
                        source={Images.profilebackgroundbgsecond}
                        style={{ width: "100%", height: "100%", elevation: 1, }} resizeMode='stretch'>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ marginBottom: "6%" }}>

                                <View style={{ width: "90%", alignSelf: "center", marginTop: "8%" }}>
                                    <Text style={styles.headingtxt}>{t('Hobbies')} ({prfileData?.hobbies?.length || 0})</Text>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: "4%", gap: 10, alignItems: 'center' }}>

                                        {prfileData?.hobbies?.map((e, index) => (
                                            <Pressable key={index} style={styles.buttoncontainer} >
                                                <Text style={styles.btntxt}>{e?.hobbyname}</Text>
                                            </Pressable>
                                        ))}

                                        {isGroupFilter ?

                                            <View>
                                                <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                            </View>

                                            :

                                            <Pressable
                                                onPress={() => {
                                                    navigateToFilterSheet(navigation, "GroupfilterPage", { page: "profile" })
                                                    // dispatch(update_GroupFilter(true))
                                                }}
                                                style={{ width: 40, height: 40, borderWidth: 1, borderColor: c.white, padding: 10, borderRadius: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', }}>
                                                <Icon name="plus" size={deviceheight * 0.0190} color={c.white} />
                                            </Pressable>
                                        }

                                    </View>
                                </View>



                                <View style={{ width: "90%", alignSelf: "center", marginTop: "5%" }}>


                                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.headingtxt}>{t('Bio')}</Text>

                                        <View>
                                            {biosDescLoading ?
                                                <View>
                                                    <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
                                                </View>
                                                :
                                                <Pressable style={{ padding: "2.5%", }} onPress={() => {
                                                    setModalVisible(!modalVisible);
                                                }}>
                                                    {Images.pencil}
                                                </Pressable>
                                            }
                                        </View>
                                    </View>

                                    {prfileData?.bio?.length > 0 ?
                                        <View style={{ marginTop: "2%", }}>
                                            <Text
                                                style={styles.biotxt}
                                                numberOfLines={(prfileData?.bio?.length < 50 ? undefined : isExpand ? undefined : 3)}
                                            >
                                                {prfileData?.bio}
                                            </Text>

                                            {prfileData?.bio && prfileData?.bio?.length > 50 &&
                                                (
                                                    <View style={{ marginTop: "4%", }}>
                                                        <Pressable style={{
                                                            width: '28%',
                                                            borderRadius: borderradius * 1,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: "2%",
                                                        }} onPress={toggleExpand}>
                                                            <Text style={styles.moretxt}>
                                                                {isExpand ? t('View Less') : "..." + t('View More')}
                                                            </Text>
                                                        </Pressable>
                                                    </View>
                                                )
                                            }

                                        </View>
                                        :
                                        <View style={{ marginTop: "2%" }}>
                                            <Text style={styles.nobiotxt}>{t('No_Data')}</Text>
                                        </View>
                                    }

                                    <View style={{ marginTop: "5%", }}>
                                        <Text style={styles.headingtxt}>{t('bioImages')}</Text>
                                        <View style={{ flexDirection: "row", gap: 5, marginTop: "3%", alignItems: 'center' }}>
                                            {/* {data?.length > 0 ? */}
                                            <>
                                                {profileImages?.slice(0, 3)?.map((img) => (

                                                    <Pressable onPress={handleBioImageView}>
                                                        <Image
                                                            style={{
                                                                width: devicewidth * 0.145,
                                                                height: devicewidth * 0.145,
                                                                borderRadius: borderradius * 2,
                                                            }}
                                                            source={{ uri: img?.uri }}
                                                            resizeMode="cover"
                                                        />
                                                    </Pressable>

                                                ))}
                                            </>
                                            {/* : */}

                                            {profileImages?.length < 3 &&
                                                <View style={{}}>
                                                    <Pressable onPress={() => openBioImagePicker()} style={{ width: devicewidth * 0.45, flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                                                        <View style={styles.Imgorganizerbtn}>
                                                            <Icon name="plus" size={deviceheight * 0.0150} color={c.white} />
                                                        </View>
                                                    </Pressable>
                                                </View>
                                            }

                                            {/* } */}
                                        </View>

                                    </View>

                                    <View style={{ marginTop: "5%", }}>
                                        <Text style={styles.headingtxt}>{t('Groups')}</Text>

                                        <View style={{ flexDirection: "row", marginTop: "4%", marginBottom: "2.5%", width: "100%", justifyContent: 'space-between' }}>
                                            <Pressable onPress={() => navigation.navigate("PeopleAudience", { type: "Joined Groups" })} style={{
                                                width: "40%",
                                                borderRadius: borderradius * 0.9,
                                                backgroundColor: c.intermediate,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderColor: c.white,
                                                padding: "2.5%"
                                            }}>
                                                <Text style={{ color: c.white, fontSize: RFValue(12), fontFamily: Fonts.Bold }}>{t('Joined_Groups')}</Text>
                                            </Pressable>

                                            <Pressable onPress={() => navigation.navigate("PeopleAudience", { type: "Groups" })} style={{
                                                width: "40%",
                                                borderRadius: borderradius * 0.9,
                                                backgroundColor: c.intermediate,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderColor: c.white,
                                                padding: "2.5%"
                                            }}>
                                                <Text style={{ color: c.white, fontSize: RFValue(12), fontFamily: Fonts.Bold }}>{t('MyGroups')}</Text>
                                            </Pressable>

                                        </View>


                                        <Text style={styles.headingtxt}>{t('Events')}</Text>

                                        <View style={{ flexDirection: "row", marginTop: "4%", marginBottom: "2.5%", width: "100%", justifyContent: 'space-between' }}>
                                            <Pressable onPress={() => navigation.navigate("UpcomingEvent")} style={{
                                                width: "40%",
                                                borderRadius: borderradius * 0.9,
                                                backgroundColor: c.intermediate,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderColor: c.white,
                                                padding: "2.5%"
                                            }}>
                                                <Text style={{ color: c.white, fontSize: RFValue(12), fontFamily: Fonts.Bold }}>{t('Upcoming_events')}</Text>
                                            </Pressable>

                                            <Pressable onPress={() => navigation.navigate("EventList")} style={{
                                                width: "40%",
                                                borderRadius: borderradius * 0.9,
                                                backgroundColor: c.intermediate,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderColor: c.white,
                                                padding: "2.5%"
                                            }}>
                                                <Text style={{ color: c.white, fontSize: RFValue(12), fontFamily: Fonts.Bold }}>{t('MyEvents')}</Text>
                                            </Pressable>

                                        </View>

                                        <Text style={styles.headingtxt}>{t('Friends')}</Text>


                                        <View style={{ flexDirection: "row", marginTop: "4%", marginBottom: "2.5%", width: "100%", justifyContent: 'space-between' }}>

                                            <Pressable onPress={() => navigation.navigate("PeopleAudience", { type: "My Friends" })} style={{
                                                width: "40%",
                                                borderRadius: borderradius * 0.9,
                                                backgroundColor: c.intermediate,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderColor: c.white,
                                                padding: "2.5%"
                                            }}>
                                                <Text style={{ color: c.white, fontSize: RFValue(12), fontFamily: Fonts.Bold }}>{t('Friends')}</Text>
                                            </Pressable>
                                            {profile?.privacy_status == "private" &&
                                                <Pressable onPress={() => navigation.navigate("PeopleAudience", { type: "Requested Friends" })} style={{
                                                    width: "40%",
                                                    borderRadius: borderradius * 0.9,
                                                    backgroundColor: c.intermediate,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderColor: c.white,
                                                    padding: "2.5%"
                                                }}>
                                                    <Text style={{ color: c.white, fontSize: RFValue(13), fontFamily: Fonts.Bold }}>{t('Requested_Friends')}</Text>
                                                </Pressable>
                                            }

                                        </View>

                                    </View>

                                </View>

                            </View>
                        </ScrollView>

                    </ImageBackground>
                </View>

                <AlertPopup
                    visible={isPremiumModalVisible}
                    title="Note"
                    onSubmit={() => handleNaigatePremium()}
                    onClose={() => setIsPremiumModalVisible(false)} >
                    <Text>{t('You_want_to_ubscribe')}</Text>
                </AlertPopup>

                <BiodetailPopup
                    modalVisible={modalVisible}
                    setModalVisible={(e) => setModalVisible(e)}
                    bioDesc={bioDesc}
                    setBioDescription={setBioDesc}
                    submit={handleEditBioImage}
                />
            </LinearGradient>

            <BottomSheetModalProvider >
                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={["28%"]}
                    shouldMeasureContentHeight={true}
                    backgroundStyle={{ backgroundColor: c.secondary }}
                    enableOverDrag={true}
                    enableDynamicSizing={false}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: 'gray' }}>

                    <View style={{ padding: "5%", width: "100%", height: "100%", }} >
                        <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(15), color: c.white }} >{t('select_media')}</Text>
                        <View style={{ width: "100%", alignItems: "center", flexDirection: 'row', marginTop: "5%" }} >
                            <Pressable onPress={() => handleSelectImage('camera', handleBioImageResponse)} style={{ paddingVertical: "5%", alignItems: "center" }} >
                                <Image style={{ width: devicewidth * 0.09, height: devicewidth * 0.09 }} source={Images.camera1} />
                                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13), color: c.white, marginTop: "5%" }} >{t('camera')}</Text>
                            </Pressable>

                            <Pressable onPress={() => handleSelectImage('library', handleBioImageResponse)} style={{ paddingVertical: "5%", alignItems: "center", marginLeft: "5%" }} >
                                <Image style={{ width: devicewidth * 0.09, height: devicewidth * 0.09 }} source={Images.gallery1} />
                                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13), color: c.white, marginTop: "5%" }} >{t('gallery')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>

            {/* <Groupfilter visible={isGroupFilter} page={"profile"} /> */}


            {imagePrevUrl?.length > 0 &&

                <Modal visible={mediaVisible} transparent={true} onRequestClose={() => setMediaVisible(false)}>
                    {imagePrevUrl?.length > 1 ?
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            // onClick={() => setVisible(false)}
                            swipeDownThreshold={400}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setMediaVisible(false)
                                setImagePrevUrl([])
                                handleImagePreview(profile?.profile)
                            }}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                        :
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            // onClick={() => setVisible(false)}
                            swipeDownThreshold={400}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setMediaVisible(false)
                                setImagePrevUrl([])
                                handleImagePreview(profile?.profile)
                            }}
                            renderIndicator={() => null}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                    }

                    <View style={{ width: "100%", height: 90, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: "3%", left: "0%", right: 0 }}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setMediaVisible(false)}>
                            {Images.back}
                        </TouchableOpacity>
                    </View>
                </Modal>
            }

        </>


    );
};

export default ProfileDetail;

const styles = StyleSheet.create({
    container: { flex: 1 },
    backcontainer: {
        width: '90%',
        paddingTop: '2%',
        height: '20%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        alignItems: "center"


    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatorbox: {
        width: devicewidth * 0.25,
        height: devicewidth * 0.25,
        borderRadius: devicewidth * 0.125,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#fff",
        borderWidth: 2,
        overflow: 'hidden'
    },
    nametxt: {
        fontSize: RFValue(16),
        fontFamily: Fonts.Regular,
        color: c.white,
        elevation: 1,
        textAlign: "center"
    },
    topViewTxt: {
        fontSize: RFValue(13.6),
        fontFamily: Fonts.SemiBold,
        color: c.white,
        marginLeft: 5,
        padding: "3%"
    },
    subtxt: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Light,
        color: c.white,
        textAlign: "center",
        marginTop: "1.5%"
    },
    countrytxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Medium,
        color: c.white,
        textAlign: "center",
    },
    card: {
        width: "88%",
        alignSelf: "center",
        backgroundColor: "#D07C51",
        borderColor: "#fff",
        borderWidth: 0.8,
        height: deviceheight * 0.090,
        flexDirection: "row",
        borderRadius: borderradius * 0.3,
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        top: "33%"

    },
    membertxt: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Black,
        color: c.white,
    },
    membername: {
        fontSize: RFValue(14),
        fontFamily: Fonts.Medium,
        color: c.white,
        marginTop: "4%"
    },
    innercard: {
        width: "90%",
        marginTop: "16%",
        alignSelf: "center",
        height: deviceheight * 0.190,
        borderRadius: borderradius * 0.3,
        borderWidth: 0.5,
        borderColor: "#D07C51",
        paddingHorizontal: "4%",
        paddingVertical: "4%"

    },
    paratxt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Bold,
        color: c.white,

    },
    parasubtxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: "#DEDEDE",
        marginTop: "1%"

    },
    innerbtn: {
        width: "100%",
        height: deviceheight * 0.05,
        backgroundColor: "#871B7D",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: borderradius * 0.3,
        marginTop: "3%"

    },
    innerbtntxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: c.white,
    },
    headingtxt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Bold,
        color: c.white,
    },

    buttoncontainer: {
        padding: "3%",
        borderRadius: borderradius * 1.5,
        backgroundColor: c.intermediate,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '0%',
    },
    btntxt: {
        fontFamily: Fonts.Medium,
        color: c.white,
        fontSize: RFValue(11),
        marginRight: '2%',
    },
    aboutbutton: {
        width: '45%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0490,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignSelf: 'center',
        flexDirection: 'row',
        marginBottom: '2%',

    },
    biobtn: {
        width: '100%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0480,
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: "center",
        alignSelf: "center",
        paddingHorizontal: "4%"

    },

    organizerbtn: {
        width: '22%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0320,
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    Imgorganizerbtn: {
        width: '28%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.0350,
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    lasttxt: {
        color: c.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.Bold,
        marginLeft: "5%",
    },
    biotxtinput: {
        width: '100%',
        borderRadius: borderradius * 0.3,
        height: deviceheight * 0.08,
        borderColor: c.white,
        borderWidth: 1,
        borderStyle: 'dashed',
        color: c.white,
        fontFamily: Fonts.Medium,
        fontSize: RFValue(13),
        paddingHorizontal: "4%",
        justifyContent: "center",
        alignSelf: "center",
    },
    biotxt: {
        fontSize: RFValue(13),
        fontFamily: Fonts.Regular,
        color: "#DEDEDE",
        marginTop: "1%"

    },
    nobiotxt: {
        fontFamily: Fonts.Regular,
        color: "#DEDEDE",
        fontSize: RFValue(14),
    },
    moretxt: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Bold,
        color: c.primary,
        marginTop: "1%"
    },
    backButton: {

        left: "6%",
        top: "38%",
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center"

    }


});
