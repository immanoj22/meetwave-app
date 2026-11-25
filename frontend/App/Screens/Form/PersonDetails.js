import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Keyboard, Image, Platform, ActivityIndicator, KeyboardAvoidingView, Modal, TouchableOpacity, BackHandler, Alert, } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFPercentage } from "react-native-responsive-fontsize";
import { borderradius, deviceheight, devicewidth, } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Button from '../../Components/button';
import { Images } from '../../Utilities/images';
import { RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from 'react-redux';
import { helperSelector, update_hobbiepath, update_NetworkVisible, update_statusbarcolor } from '../../Slices/helper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { GetItem, RemoveItem } from '../../Actions/localstorage';
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet/src';
import { editProfileapi, getValidUserName, persondetailsapi } from '../../Actions/hooks';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { Imageroute } from '../../Actions/constant';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/FontAwesome6';
import profileImagePath, { localrandomindex, randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import GenderInputModal from '../Home/GenderInputModal';
import { showwarningmessage } from '../../Actions/config';
import ImageResizer from 'react-native-image-resizer';

const EMPTY_USERNAME_GUARD = '\u200B';

const PersonDetails = (props) => {
    const { t } = useTranslation();

    const navigation = useNavigation();
    const [selectedGender, setSelectedGender] = useState("");
    const [others, setOther] = useState("");
    const [dob, setDob] = useState(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [username, setUserName] = useState("")
    const [nametxt, setNametxt] = useState("")
    const [chatDesc, setChatDesc] = useState("")
    const [emailtxt, setEmailtxt] = useState("")
    const [editUrName, setEditUrName] = useState(false)
    const usernameInputRef = useRef(null);

    const [location, setLocation] = useState("")
    const [profileImage, setProfileImage] = useState(null);
    const [profiledata, setProfiledata] = useState({});
    const [loading, setLoading] = useState(false);
    const [profileEdit, setProfileEdit] = useState(false)
    const [editImage, setEditImage] = useState("")
    const [editProfileImage, setEditProfileImage] = useState(false)
    const [imageOpened, setImageOpened] = useState(false);
    const [biotxt, setBiotxt] = useState("")
    const [isPrivate, setIsPrivate] = useState(false);
    const [profileImages, setProfileImages] = useState([]);
    const [changeIndex, setChangrIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [boiImages, setBioImage] = useState(false);
    const [deleteArr, setDeleteArr] = useState([]);
    const [errorMsg, setErrorMsg] = useState({});
    const usernameCheckTimeoutRef = useRef(null);

    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [otherGender, setOtherGender] = useState("");
    const [othersSelected, setOthersSelected] = useState(false);
    const [randomIndex, setRandomIndex] = useState(0);

    useEffect(() => {
        const index = Math.floor(Math.random() * profileImagePath.length);
        setRandomIndex(index);
    }, []);

    //const [randomIndex, setRandomIndex] = useState(0);
    const userEmail = GetItem("UserEmail")
    const { profile } = useSelector(profileSelector)

    var userid = GetItem("UserId")
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const bottomSheetRef = useRef(null);

    const openImagePicker = () => {
        setIsBottomSheetVisible(true);
        setEditProfileImage(true)
        setImageOpened(true);
        setBioImage(false);
        bottomSheetRef.current.present();
    };


    const handleSelectImage = (source, callback) => {
        bottomSheetRef.current.close();
        const options = {
            mediaType: 'photo',
            quality: 1,
            selectionLimit: boiImages ? (3 - profileImages?.length) : 1,
        };

        if (source === 'library') {
            launchImageLibrary(options, callback);
        } else if (source === 'camera') {
            launchCamera(options, callback);
        }

        setIsBottomSheetVisible(false);
    };


    const handleImageResponse = (response) => {

        if (response.didCancel) {

        } else if (response.errorMessage) {

        } else if (response.assets && response.assets.length > 0) {
            const selectedImage = response.assets[0].uri;
            setProfileImage(selectedImage);
            setProfiledata(response.assets[0])
        }
        setBioImage(false);
    };


    const handleConfirm = (date) => {
        setDob(date);
        setIsDatePickerVisible(false);
    };


    // const formattedDate = dob ? dob.toISOString().split('T')[0] : '';

    const formattedDate = dob
        ? new Date(dob).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        })
        : '';


    const dispatch = useDispatch()
    // useFocusEffect(
    //     React.useCallback(() => {
    //         var getad = GetItem("Adddressdata")
    //         dispatch(update_statusbarcolor(c.primary))
    //         if (getad?.formatted_address != "") {
    //             setLocation(getad?.formatted_address)
    //         }

    //     }, [])
    // )

    useFocusEffect(
        React.useCallback(() => {

            const loadAddress = async () => {
                const getad = await GetItem("Adddressdata");

                dispatch(update_statusbarcolor(c.primary));

                if (getad?.formatted_address?.trim()) {
                    setLocation(getad.formatted_address);
                }
            };

            loadAddress();

        }, [dispatch, c.primary])
    );
    useEffect(() => {

        setSelectedGender("");
        setDob("");
        setUserName("");
        setNametxt("");
        setChatDesc("");
        setProfileImage(null);
        setBiotxt("")

        return () => {
            RemoveItem("Adddressdata")
        }
    }, []);

    const { persondetailpath, isOnline } = useSelector(helperSelector)

    useEffect(() => {
        if (persondetailpath == "edit" && profile?.name) {


            setDob(new Date(profile?.dob))
            setUserName(profile?.username)
            setNametxt(profile?.name)
            setChatDesc(profile?.MychatDiscription)
            setEmailtxt(profile?.email)
            setBiotxt(profile?.bio)

            if (profile?.gender == "male" || profile?.gender == "female") {
                setSelectedGender(profile?.gender)
            }
            else {
                setOthersSelected(true);
                setOtherGender(profile?.gender);
            }

            setProfileImage(profile?.profile != "" ? `${Imageroute.PersonalProfile}` + `${profile?.profile}` : null);

            setLocation(profile?.personalAddress)
            setProfileEdit(true)
            setEditImage(profile?.profile)
            setEditProfileImage(false)
            setImageOpened(false)
            setOther(profile?.gender)

            setRandomIndex(profile?.randomIndex)

            var boiimages = profile?.bioimage?.map((e) => ({
                uri: `${Imageroute.boiImagePath}` + e
            }))

            setProfileImages(boiimages)
            setIsPrivate(profile?.privacy_status == "private" ? true : false)
        }


    }, [profile, persondetailpath])

    useEffect(() => {

        if (props?.route?.params?.searchdata) {
            setOther(props?.route?.params?.searchdata)
            setSelectedGender('Other')

            if (persondetailpath == "edit") {
                setLocation(profile?.personalAddress)
            }
            else {
                var getad = GetItem("Adddressdata")
                setLocation(getad?.formatted_address)
            }
        }
    }, [props])


    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {

                if (persondetailpath == "edit") {
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


    const handlepersondetails = async () => {

        try {

            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return
            }
            if (!username) {
                showwarningmessage(t('Please_enter_user_name'));
            }
            // else if (!nametxt) {
            //     showwarningmessage(t('Please_enter_user_name'));
            // }
            else if (!dob) {
                showwarningmessage(t('Please_select_date_of_birth'));
            }
            else if (!location) {
                showwarningmessage(t('select_your_location'));
            }
            else if (!selectedGender && !otherGender) {
                showwarningmessage(t('select_your_gender'));
            }
            else if (errorMsg?.username && errorMsg?.username != "") {
                showwarningmessage(t('InvalidUserName'));
            }
            else if (profileImages?.length > 3) {
                showwarningmessage(t('Only_three_images_allowed_on_Bio_images'));
            }
            else {
                setLoading(true)
                var getad = GetItem("Adddressdata");

                const age = ageCalculation(dob);

                const sendData = {
                    name: username,
                    dob: dob,
                    age: age,
                    // gender: others === 'Other' ? selectedGender : others,
                    gender: othersSelected ? otherGender : selectedGender,
                    username: username,
                    email: userEmail,
                    bio: biotxt,
                    personalAddress: location,
                    privacy_status: isPrivate ? "private" : "public",
                    randomIndex: randomIndex,
                    MychatDiscription: chatDesc
                };


                // // Setting latitude and longitude based on conditions
                // if (persondetailpath === "edit" && getad?.lat) {
                //     sendData.latitude = getad.lat;
                //     sendData.longitude = getad.long;
                // } else if (persondetailpath === "edit" && !getad?.lat) {
                //     sendData.latitude = profile?.location?.coordinates[1];
                //     sendData.longitude = profile?.location?.coordinates[0];
                // } else {
                sendData.latitude = getad?.lat ? getad?.lat : null;
                sendData.longitude = getad?.long ? getad?.long : null;
                // }

                console.log("GET_lat_long ==>", getad?.lat ? getad?.lat : null)
                console.log("GET_lat_long ==>", getad?.long ? getad?.long : null)

                getPlaceName(getad?.lat ? getad?.lat : null, getad?.long ? getad?.long : null)

                // If editing, add biodegradable data
                if (persondetailpath === "edit") {
                    sendData.biodelete = JSON.stringify(deleteArr);
                }

                // Filtering and adding images
                const filterNewImages = profileImages?.filter(e => e?.fileName) || [];
                sendData.bioimage = filterNewImages.map(item => ({
                    uri: Platform.OS === 'android' ? item?.uri : item?.uri?.replace('file://', ''),
                    type: item?.type === 'image/jpg' ? 'image/jpeg' : item?.type,
                    name: item?.fileName,
                }));

                // Handling profile image
                if (imageOpened) {
                    sendData.image = [{
                        uri: Platform.OS === 'android' ? profileImage : profileImage?.replace('file://', ''),
                        type: profiledata?.type === 'image/jpg' ? 'image/jpeg' : profiledata?.type,
                        name: profiledata?.fileName,
                    }];
                } else {
                    sendData.image = editImage;
                }

                Keyboard.dismiss()

                var result = "";
                if (profileEdit) {
                    result = await editProfileapi(sendData)
                    const userid = GetItem("UserId")
                    dispatch(Fetchprofile(userid))
                }
                else {
                    result = await persondetailsapi(sendData)
                }
                setLoading(false)


                showwarningmessage(result?.message);
                if (result.status) {

                    RemoveItem("Adddressdata")
                    if (profileEdit) {

                        const userid = GetItem("UserId")
                        dispatch(Fetchprofile(userid))

                        navigation.navigate("ProfileHome")
                    }
                    else {
                        dispatch(update_hobbiepath("add"))
                        // navigation.navigate("SelectInterest")
                        navigation.reset({ index: 0, routes: [{ name: 'SelectInterest' }] });

                    }
                }
                else {
                    showwarningmessage(result?.message);
                }
            }
        }
        catch (err) {
            showwarningmessage(result?.message);
            setLoading(false)

            console.log("Error on handlepersondetails: ", err);
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

    const openImageSlider = (index) => {
        setCurrentImageIndex(index);
        setIsModalVisible(true);
        setChangrIndex(index)
    };

    const handleDeleteImage = (index) => {

        setDeleteArr((prev) => [...prev, "/" + profileImages[index]?.uri?.split('/')?.slice(-3).join('/')])
        // setDeleteArr((prev) => [...prev, profileImages[index]?.uri?.split('/')?.pop()])
        setCurrentImageIndex(0)
        let deletedata = profileImages[index].uri.split('/').pop()
        // Delete.push(deletedata)
        setProfileImages([
            ...profileImages.slice(0, index),
            ...profileImages.slice(index + 1, profileImages?.length),
        ])
        setIsModalVisible(false);
    };

    const imagesForViewer = profileImages?.map(uri => ({ url: uri?.uri }));


    const openBioImagePicker = () => {
        setBioImage(true);
        setEditProfileImage(false)
        setIsBottomSheetVisible(true);
        bottomSheetRef.current.present();
    };

    const handleBioImageResponse = (response) => {

        if (response?.didCancel) {

        } else if (response?.errorMessage) {

        } else if (response?.assets && response?.assets?.length > 0) {
            if (response?.assets?.length > 3) {
                showwarningmessage(t('we_allow_only_limited_amount_of_images'));
            }

            const size = (3 - profileImages?.length);
            setProfileImages(prevImages => [...prevImages, ...response?.assets?.slice(0, size)])
        }

        setBioImage(false);
    };

    useEffect(() => {
        if (editUrName && usernameInputRef.current) {
            usernameInputRef.current.focus();  // Focus the TextInput to show the keyboard
        }
    }, [editUrName]);

    const handleBlur = () => {
        if (username === EMPTY_USERNAME_GUARD) {
            setUserName("");
        }
        setEditUrName(false); // Disable editing when focus is lost
    };

    const handleUsernameFocus = () => {
        if (!username) {
            setUserName(EMPTY_USERNAME_GUARD);
        }
    };

    const handleUserNameCheck = (text) => {
        const normalizedText = text.replace(/\u200B/g, '');
        setUserName(normalizedText);

        if (usernameCheckTimeoutRef.current) {
            clearTimeout(usernameCheckTimeoutRef.current);
        }

        if (!normalizedText.trim()) {
            setErrorMsg((prev) => ({
                ...prev,
                username: ""
            }));
            return;
        }

        usernameCheckTimeoutRef.current = setTimeout(async () => {
            try {
                const payload = {
                    username: normalizedText,
                    type: persondetailpath == "edit" ? "edit" : "add",
                    userId: userid
                };

                const result = await getValidUserName(payload);

                setErrorMsg((prev) => ({
                    ...prev,
                    username: result?.status ? "" : t('UserNameAlreadyExist')
                }));
            } catch (error) {
                // Keep typing responsive even if validation fails.
            }
        }, 400);
    }

    const getPlaceName = async (lat, long) => {


        console.log("Lat_Long", lat, long)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const { town, village, city } = data.address;

            console.log('Place name:', city || town || village || 'Not found');
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled>
            <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>
                <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>
                    {persondetailpath === "edit" &&
                        <View style={styles.backcontainer}>
                            <Pressable
                                onPress={() => {

                                    navigation.navigate("ProfileHome");
                                }}
                                style={styles.roundbox}
                            >
                                {Images.back}
                            </Pressable>
                        </View>
                    }
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ width: "100%", height: "85%", marginBottom: "8%", marginTop: persondetailpath === "edit" ? 0 : "8%" }}>
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <Text style={styles.title}>{t('Personal_Details')}</Text>
                            </View>
                            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: "4%", position: "relative" }}>
                                {profileImage != null ? (
                                    <View style={styles.profilebox}>

                                        <Pressable onPress={openImagePicker}><Image source={{ uri: profileImage }} style={styles.profileImage} /></Pressable>
                                        <Pressable style={styles.editbox} onPress={openImagePicker}>
                                            {Images.edit}
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={styles.profilebox}>

                                        <Pressable onPress={openImagePicker}>
                                            <Image
                                                style={{ width: "100%", height: "100%", borderRadius: borderradius * 5 }}
                                                source={randomimages[randomIndex]}
                                                resizeMode="cover"
                                            />
                                        </Pressable>
                                        <Pressable style={styles.editbox} onPress={openImagePicker}>
                                            {Images.edit}
                                        </Pressable>
                                    </View>
                                )}
                            </View>

                            <View style={styles.btnbox} >
                                {username === "" &&
                                    <Text style={styles.usernamePlaceholder}>
                                        {t('User_name')}
                                    </Text>
                                }
                                <TextInput
                                    ref={usernameInputRef}
                                    placeholder=""
                                    placeholderTextColor="#F7E5D0"
                                    style={{
                                        color: c.white,
                                        fontFamily: Fonts.Regular,
                                        fontSize: RFValue(12),
                                        textAlign: "center",
                                        textAlignVertical: "center",
                                        writingDirection: "ltr",
                                        includeFontPadding: false,
                                        paddingVertical: 0,
                                        width: "100%",
                                        height: "100%"
                                    }}

                                    keyboardType="default"
                                    value={username}
                                    onFocus={handleUsernameFocus}
                                    onChangeText={handleUserNameCheck}
                                    onBlur={handleBlur}
                                />
                            </View>

                            {errorMsg?.username &&
                                <View style={{ alignItems: "center", marginTop: "2%" }}>
                                    <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(12), color: c.white }}>
                                        {errorMsg?.username}
                                    </Text>
                                </View>
                            }


                            {persondetailpath == "edit" && emailtxt &&
                                <View style={styles.inputsec}>
                                    <View style={{ marginBottom: "2%" }}>
                                        <Text style={styles.inputpara}>{t('Email')}</Text>
                                    </View>
                                    <View style={styles.inputcontainer}>
                                        <TextInput
                                            // placeholderTextColor={"#F7E5D0"}
                                            // placeholder={t('Enter_email')}
                                            style={styles.inputtxtstyle}
                                            keyboardType="default"
                                            value={emailtxt}
                                            onChangeText={setEmailtxt}
                                            editable={false}
                                        />
                                    </View>
                                </View>
                            }

                            <View style={styles.inputsec}>
                                <View style={{ marginBottom: "2%" }}>
                                    <Text style={styles.inputpara}>{t('Date_Birth')}</Text>
                                </View>
                                <Pressable onPress={() => setIsDatePickerVisible(true)} style={{ width: '100%', flexDirection: "row", marginBottom: "1%", }}>
                                    <View style={[styles.dobcontainer, { justifyContent: "center" }]}>

                                        <Text style={{
                                            fontSize: RFValue(12),
                                            fontFamily: Fonts.Regular,
                                            color: c.white,
                                            width: "100%",
                                        }}>{formattedDate ? formattedDate : ""}</Text>
                                    </View>
                                    <View style={{ position: "absolute", right: "3%", alignSelf: "center" }}>
                                        {Images.date}
                                    </View>
                                </Pressable>
                            </View>

                            <View style={styles.inputsec}>
                                <View style={{ marginBottom: "2%" }}>
                                    <Text style={styles.inputpara}>{t('Location')}</Text>
                                </View>
                                <Pressable onPress={() => { isOnline && navigation.navigate("LocationHome", { from: "PersonDetails" }) }} style={{
                                    width: "100%",
                                    justifyContent: "center",
                                    height: deviceheight * 0.0650,
                                    paddingHorizontal: "3%",
                                    borderRadius: borderradius * 0.3,
                                    borderColor: c.white,
                                    borderWidth: 0.9,
                                }}>
                                    <Text style={styles.loctxt}>{location ? location?.split(',')?.slice(-2) : ""}</Text>
                                    <View style={{ position: "absolute", right: "3%", alignSelf: "center", }} >
                                        {Images.location1}
                                    </View>
                                </Pressable>
                            </View>

                            <View style={styles.inputsec}>
                                <View style={{ marginBottom: "2%" }}>
                                    <Text style={styles.inputpara}>{t('About_me')} ({t('optional')})</Text>
                                </View>
                                <View style={styles.biocontainer}>
                                    <TextInput
                                        // placeholderTextColor={"#F7E5D0"}
                                        // placeholder="Add your bio (optional)"
                                        style={styles.inputtxtstyle}
                                        keyboardType="default"
                                        value={biotxt}
                                        multiline={true}
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        onChangeText={setBiotxt}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputsec}>
                                <View style={{ marginBottom: "2%" }}>
                                    <Text style={styles.inputpara}>{t('Bio')} {t('Image_Upload')} ({t('optional')})</Text>
                                </View>
                                <View style={{ width: '100%', marginBottom: "4%", alignItems: "center", justifyContent: "center" }}>

                                    <ScrollView contentContainerStyle={styles.imageGrid}>

                                        {profileImages?.map((imageUri, index) => (
                                            <Pressable onPress={() => openImageSlider(index)} key={index} style={{
                                                position: 'relative',
                                                margin: 5,
                                            }}>
                                                <Image
                                                    key={index}
                                                    source={{ uri: imageUri?.uri }}
                                                    style={styles.uploadedImage}
                                                />
                                            </Pressable>

                                        ))}
                                        {profileImages?.length < 3 &&
                                            <Pressable onPress={() => { profileImages?.length < 3 ? openBioImagePicker() : showwarningmessage(t('You_cannot_select_more_than_three')) }} style={{ width: 60, height: 60, borderWidth: 1, borderColor: c.white, padding: 10, borderRadius: 28, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', }}>
                                                <Icons name="plus" size={deviceheight * 0.0190} color={c.white} />
                                            </Pressable>
                                        }
                                    </ScrollView>
                                </View>
                            </View>


                            <View style={styles.inputsec}>
                                <View style={{ marginBottom: "2%" }}>
                                    <Text style={styles.inputpara}>{t('Gender')}</Text>
                                </View>
                                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                                    <Pressable style={(selectedGender === 'male') ? styles.activegender : styles.inactivegender}
                                        onPress={() => {
                                            setOtherGender("")
                                            setOthersSelected(false)
                                            setSelectedGender('male')
                                        }}>
                                        <Text style={styles.gendertxt}>{t('Male')}</Text>
                                    </Pressable>
                                    <Pressable style={(selectedGender === 'female') ? styles.activegender : styles.inactivegender}
                                        onPress={() => {
                                            setOtherGender("")
                                            setOthersSelected(false)
                                            setSelectedGender('female')
                                        }}>
                                        <Text style={styles.gendertxt}>{t('Female')}</Text>
                                    </Pressable>

                                    <Pressable style={othersSelected ? styles.activegender : styles.inactivegender}
                                        onPress={() => {
                                            setSelectedGender("")
                                            setGenderModalVisible(true)
                                            setOthersSelected(true);
                                        }}>
                                        <Text style={styles.gendertxt}>{t('Other')}</Text>
                                    </Pressable>

                                </View>
                            </View>

                            {
                                loading ?

                                    <Pressable style={{
                                        width: "50%",
                                        borderRadius: borderradius * 1.5,
                                        backgroundColor: c.white,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderColor: c.white,
                                        padding: "2%",
                                        alignSelf: "center",
                                        marginTop: "5%"
                                    }}>
                                        <ActivityIndicator size="small" color={c.primary} style={styles.loader} />
                                    </Pressable> :
                                    <Button top={"8%"} onpress={handlepersondetails} title={t('Save')} />
                            }

                        </View>
                    </ScrollView>
                </View >
            </LinearGradient >

            <GenderInputModal
                visible={genderModalVisible}
                onClose={() => {
                    setGenderModalVisible(false)
                    setOthersSelected(false);
                    setOtherGender("")
                }}
                onSubmit={() => {
                    if (otherGender?.length <= 0) {
                        setOthersSelected(false);
                    }
                    setGenderModalVisible(false)
                }}
                value={otherGender}
                updateFn={setOtherGender}
            />

            {imagesForViewer?.length > 0 &&
                <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)}>
                    {imagesForViewer?.length > 1 ?
                        <ImageViewer
                            imageUrls={imagesForViewer}
                            index={currentImageIndex}
                            enableSwipeDown={true}
                            onChange={(index) => setChangrIndex(index)
                            }
                            style={{ width: "100%", height: "100%" }}
                            onSwipeDown={() => setIsModalVisible(false)}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                        :
                        <ImageViewer
                            imageUrls={imagesForViewer}
                            index={currentImageIndex}
                            enableSwipeDown={true}
                            onChange={(index) => setChangrIndex(index)
                            }
                            style={{ width: "100%", height: "100%" }}
                            onSwipeDown={() => setIsModalVisible(false)}
                            renderIndicator={() => null}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                        />
                    }
                    <View style={{ width: "100%", height: 100, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 16, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setIsModalVisible(false)}>
                            {Images.back}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => { handleDeleteImage(changeIndex); }}>
                            <Icon name="delete" size={30} color={c.white} />
                        </TouchableOpacity>

                    </View>
                </Modal>
            }

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

                            <Pressable onPress={() => boiImages ? handleSelectImage('camera', profileImages?.length < 3 && handleBioImageResponse) : handleSelectImage('camera', handleImageResponse)} style={{ paddingVertical: "5%", alignItems: "center" }} >
                                <Image style={{ width: devicewidth * 0.09, height: devicewidth * 0.09 }} source={Images.camera1} />
                                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13), color: c.white, marginTop: "5%" }} >{t('camera')}</Text>
                            </Pressable>

                            <Pressable onPress={() => boiImages ? handleSelectImage('library', profileImages?.length < 3 && handleBioImageResponse) : handleSelectImage('library', handleImageResponse)} style={{ paddingVertical: "5%", alignItems: "center", marginLeft: "5%" }} >
                                <Image style={{ width: devicewidth * 0.09, height: devicewidth * 0.09 }} source={Images.gallery1} />
                                <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13), color: c.white, marginTop: "5%" }} >{t('gallery')}</Text>
                            </Pressable>

                            {profileImage != null && !boiImages &&
                                <Pressable onPress={() => {
                                    setProfileImage(null);
                                    setEditProfileImage(false);
                                    setEditImage("");
                                    bottomSheetRef.current.close();
                                }}
                                    style={{ paddingVertical: "5%", alignItems: "center", marginLeft: "5%" }}>
                                    <Image style={{ width: devicewidth * 0.09, height: devicewidth * 0.09 }} source={Images.remove} />
                                    <Text style={{ fontFamily: Fonts.Regular, fontSize: RFValue(13), color: c.white, marginTop: "5%" }} >{t('remove')}</Text>
                                </Pressable>
                            }
                        </View>
                    </View>
                </BottomSheetModal>
            </BottomSheetModalProvider>

            {
                isDatePickerVisible && (
                    <DatePicker
                        modal
                        open={isDatePickerVisible}
                        date={dob || new Date()}
                        mode="date"
                        locale="en-GB"
                        onConfirm={handleConfirm}
                        onCancel={() => setIsDatePickerVisible(false)}
                        style={styles.datePicker}

                        // 🔥 Restrict to 18+ years
                        maximumDate={(() => {
                            const d = new Date();
                            d.setFullYear(d.getFullYear() - 18);
                            return d;
                        })()}
                    />
                )
            }
        </KeyboardAvoidingView >
    )
}

export default PersonDetails

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
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(32),
        textAlign: "center"
    },
    subtitle: {
        fontFamily: Fonts.Regular,
        color: c.white,
        fontSize: RFValue(15),
        textAlign: "center",
        letterSpacing: 0.1,
    },
    inputpara: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
    },
    backcontainer: {
        width: "100%",
        paddingTop: "6.2%",
        height: "15%",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center"
    },
    bottomtxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFPercentage(2),
    },
    profilebox: {
        width: devicewidth * 0.24,
        height: devicewidth * 0.24,
        borderRadius: devicewidth * 0.12,
        backgroundColor: c.primary,
        marginBottom: 8,
        // overflow: 'hidden'
    },
    editbox: {
        width: devicewidth * 0.07,
        height: devicewidth * 0.07,
        borderRadius: borderradius * 2,
        backgroundColor: c.secondary,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: "3%",
        right: 0,
        zIndex: 999,
    },
    inputsec: {
        width: "90%",
        alignSelf: "center",
        marginTop: "3%"
    },
    inputcontainer: {
        width: "100%",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        justifyContent: "center",
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
    dobcontainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: deviceheight * 0.0550,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        borderColor: c.white,
        borderWidth: 0.9,
    },
    activegender: {
        width: "30%",
        height: deviceheight * 0.0500,
        backgroundColor: c.secondary,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.secondary,
        borderWidth: 0.9,
        justifyContent: "center"
    },
    gendertxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
    },
    inactivegender: {
        width: "30%",
        height: deviceheight * 0.0500,
        paddingHorizontal: "3%",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        justifyContent: "center"
    },
    privacytxt: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
    },
    privacytxt1: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(15),
        textDecorationLine: "underline"
    },
    privacytxt2: {
        fontFamily: Fonts.Bold,
        color: c.white,
        fontSize: RFValue(14),
        textDecorationLine: "underline"
    },
    btnbox: {
        width: "38%",
        height: deviceheight * 0.0500,
        borderRadius: borderradius * 0.9,
        alignItems: "center",
        justifyContent: "center",
        borderColor: c.white,
        borderWidth: 0.9,
        alignSelf: "center",
        marginTop: "2%",
        overflow: "hidden",
    },
    usernamePlaceholder: {
        position: "absolute",
        alignSelf: "center",
        color: "#F7E5D0",
        fontFamily: Fonts.Regular,
        fontSize: RFValue(12),
    },
    btntxt: {
        fontFamily: Fonts.SemiBold,
        color: c.white,
        fontSize: RFValue(14),
    },
    // Custom styles for the date picker
    datePicker: {
        backgroundColor: c.primary,
        borderRadius: borderradius * 0.5,
    },
    loctxt: {
        width: "80%",
        fontSize: RFValue(12),
        fontFamily: Fonts.Regular,
        color: c.white,


    },
    usernameInput: {
        color: c.white,
        fontFamily: Fonts.Medium,
        fontSize: RFValue(12),
    },

    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: deviceheight * 0.15 / 2,
        resizeMode: 'cover'
    },
    bottomSheetContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    btmtxt: {
        fontSize: RFValue(15),
        fontFamily: Fonts.Bold,
        color: c.white
    },
    biocontainer: {
        width: "100%",
        height: deviceheight * 0.0850,
        paddingHorizontal: "3%",
        paddingVertical: "3%",
        justifyContent: "center",
        borderRadius: borderradius * 0.3,
        alignItems: "center",
        borderColor: c.white,
        borderWidth: 0.9,
    },
    uploadedImage: {
        width: devicewidth * 0.2,
        height: devicewidth * 0.2,
        margin: 5,
        borderRadius: borderradius * 0.2,
        resizeMode: "cover"
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: "2%",
    },
    overlay: {
        position: 'absolute',
        margin: 5,
        width: devicewidth * 0.2,
        height: devicewidth * 0.2,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: borderradius * 0.2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: RFValue(12),
        fontFamily: Fonts.Bold,
        color: c.white,
    },
    backButton: {

        marginTop: "8%",
        left: "3%",
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.8%",
    },
    deleteButton: {
        marginTop: "8%",
        right: "8%",
        padding: "1.8%",
    },
});
