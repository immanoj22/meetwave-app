import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  borderradius,
  deviceheight,
  devicewidth,
  ShowToast,
} from '../../Utilities/Dimensions';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { navigateToFilterSheet } from '../../Utilities/filterSheetPresent';
import { preloadGroupFilterPage } from '../Home/filterPagePreload';
import { Images } from '../../Utilities/images';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Button from '../../Components/button';
import { useDispatch, useSelector } from 'react-redux';
import {
  helperSelector,
  update_GroupFilterHoobies,
  update_GroupFilter,
  update_NetworkVisible,
  update_statusbarcolor,
  update_filterBySearch,
} from '../../Slices/helper';
import {
  EditGroupDetails,
  createGroupMembers,
  getAdminDetails,
  getChatersAndFollowersList,
  GetGroupInfo,
} from '../../Actions/hooks';
import { GetItem, SetItem } from '../../Actions/localstorage';
import { profileSelector } from '../../Slices/profile';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet/src';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import profileImagePath, { randomimages } from '../../Utilities/profileImages';
import { useTranslation } from 'react-i18next';
import SwitchToggle from 'react-native-switch-toggle';
import Icons from 'react-native-vector-icons/FontAwesome6';
import { Imageroute, Imageurl } from '../../Actions/constant';
import AlertPopup from '../../Components/AlertPopup';
import { hasActiveSubscription } from '../../Actions/config';
import ImageViewer from 'react-native-image-zoom-viewer';
import Deleteicon from '../../Assets/icons/delete.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreateGroup = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [draftGroupMembers, setDraftGroupMembers] = useState([]);
  const [draftSelectedMembers, setDraftSelectedMembers] = useState([]);

  const draftSelectedCount = draftSelectedMembers.length;
  const hasDraftChanges =
    draftSelectedMembers.length !== selectedMembers.length ||
    draftSelectedMembers.some(id => !selectedMembers.includes(id));
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [maxreached, setMaxreached] = useState(false);
  const [page, setPage] = useState(1);
  const [apiCalled, setApiCalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pgLoad, setPgLoad] = useState(false);
  const [data, setData] = useState({
    name: '',
    desc: '',
  });

  const [editMemb, setEditMem] = useState([]);
  const route = useRoute();
  const { grpDetail, editSts } = route?.params || {};

  const [editStatus, setEditStatus] = useState(false);
  const [search, setSearch] = useState('');
  const [hideGroup, sethideGroup] = useState(false);
  const [privateGroup, setPrivateGroup] = useState(false);
  const { profile } = useSelector(profileSelector);
  const { isOnline, isGroupFilter, groupFilterHoobies, hobbieList } =
    useSelector(helperSelector);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user_Id = GetItem('UserId');
  const [profileImages, setProfileImages] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [changeIndex, setChangrIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [profileSelect, setProfileSelect] = useState(false);
  const [deleteArr, setDeleteArr] = useState([]);
  const [imageVisible, setImageVisible] = useState(false);
  const [boiImages, setBioImage] = useState(false);
  const [location, setLocation] = useState('');
  var user_id = profile?._id;

  const scrollViewRef = useRef(null);
  const memberSearchInputRef = useRef(null);
  const currentScrollYRef = useRef(0);
  const previousScrollYRef = useRef(0);
  const memberSearchFocusedRef = useRef(false);
  const [group, setGroup] = useState(false);
  const [memberSearchY, setMemberSearchY] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [editId, setEditId] = useState('');
  const dispatch = useDispatch();

  const mergeUniqueById = (existing = [], incoming = []) => {
    return [...new Map([...existing, ...incoming].map(item => [item?._id, item])).values()];
  };

  useEffect(() => {
    const index = Math.floor(Math.random() * profileImagePath.length);
    if (!grpDetail) {
      setGroupIndex(index);
      setProfileImage(null);
    }

    setEditStatus(editSts ? editSts : false);
    if (editSts && !hasActiveSubscription(profile)) {
      setIsModalVisible(true);
    }
    getAdminDetail();
    dispatch(update_filterBySearch({ activeTab: 'CreateGroup' }));
    preloadGroupFilterPage();
    // This is an initialization effect; adding deps here causes unwanted resets
    // when edit payloads change during navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [groupIndex, setGroupIndex] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(update_statusbarcolor(c.primary));

      //alert (grpDetail?.groupHideStatus);

      var getad = GetItem('Adddressdata');
      console.log('GET-DETAIL==>', getad);

      if (getad?.formatted_address) {
        setLocation(getad?.formatted_address);
      }
    }, [dispatch]),
  );

  useEffect(() => {
    getAdminDetail();

    return () => {
      setLocation('');
      SetItem('Adddressdata', '');
    };
  }, []);

  useEffect(() => {
    var getad = GetItem('Adddressdata');
    console.log('GET-DETAIL==>', grpDetail);

    setLocation(getad?.formatted_address);
    setPrivateGroup(
      typeof grpDetail?.groupStatus === 'boolean'
        ? grpDetail.groupStatus
        : !!grpDetail?.groupStatus,
    );
    sethideGroup(
      typeof grpDetail?.groupHideStatus === 'boolean'
        ? grpDetail.groupHideStatus
        : !!grpDetail?.groupHideStatus,
    );

    if (grpDetail) {
      const index = Math.floor(Math.random() * profileImagePath.length);
      setData({
        name: grpDetail?.groupName ? grpDetail?.groupName : '',
        desc: grpDetail?.groupDesc ? grpDetail?.groupDesc : '',
      });
      setGroupMembers(grpDetail?.groupMembers ? grpDetail?.groupMembers : []);
      setEditMem(
        grpDetail?.groupMembers
          ? grpDetail?.groupMembers?.map(data => data?._id)
          : [],
      );

      setSelectedMembers(
        grpDetail?.groupMembers
          ? grpDetail?.groupMembers?.map(data => data?._id)
          : [],
      );
      setProfileImage(
        grpDetail?.groupProfile != '' ? grpDetail?.groupProfile : null,
      );
      setEditImage(
        grpDetail?.groupProfile != '' ? grpDetail?.groupProfile : '',
      );
      setGroupIndex(grpDetail?.groupIndex ? grpDetail?.groupIndex : '');

      var eventiamges = grpDetail?.groupImages?.map(e => ({
        uri: `${Imageroute.groupBioImagePath}` + e,
      }));

      setProfileImages(eventiamges);
      setDeleteArr([]);

      setEditId(grpDetail?.groupId);
      setLocation(grpDetail?.groupAddress);
      setCoordinates(grpDetail?.groupLocation?.coordinates);

      let local = grpDetail?.groupHobbies
        ? grpDetail?.groupHobbies?.map(data => {
          return {
            _id: data?._id,
            hobbyName: data?.hobbyname,
          };
        })
        : [];

      dispatch(update_GroupFilterHoobies(local));
    }
  }, [grpDetail, dispatch]);

  useEffect(() => {
    if (!editSts || !grpDetail?.groupId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const uid = GetItem('UserId') || profile?._id;
        if (!uid) {
          return;
        }
        const result = await GetGroupInfo({
          userId: uid,
          groupId: grpDetail.groupId,
        });
        if (cancelled || !result?.status || !result?.data?.[0]) {
          return;
        }
        const g = result.data[0];
        if (typeof g.ishidegroup === 'boolean') {
          sethideGroup(g.ishidegroup);
        }
        if (typeof g.isPrivate === 'boolean') {
          setPrivateGroup(g.isPrivate);
        }
      } catch (e) {
        console.log('CreateGroup GetGroupInfo', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editSts, grpDetail?.groupId, profile?._id]);

  const handleDraftMemberSelect = member => {
    const isSelected = draftSelectedMembers?.includes(member?._id);
    const prevMember = editMemb?.includes(member?._id);

    // Don't allow toggling "existing" members while editing
    if (prevMember) {
      return;
    }

    if (isSelected) {
      setDraftSelectedMembers(prevSelected =>
        prevSelected.filter(id => id !== member?._id),
      );
      setDraftGroupMembers(prevGroup =>
        prevGroup.filter(m => m._id !== member._id),
      );
    } else {
      setDraftSelectedMembers(prevSelected =>
        prevSelected.includes(member?._id)
          ? prevSelected
          : [...prevSelected, member?._id],
      );
      setDraftGroupMembers(prevGroup => mergeUniqueById([member], prevGroup));
    }
  };

  const handleGroupMemberRemove = member => {
    const isSelected = editMemb.includes(member?._id);

    if (!isSelected) {
      setGroupMembers(prevGroupMembers =>
        prevGroupMembers.filter(m => m._id !== member._id),
      );

      // Optionally, also remove the member from the selectedMembers state
      setSelectedMembers(prevSelected =>
        prevSelected.filter(id => id !== member?._id),
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllchats(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]),
  );

  const getAllchats = async count => {
    try {
      let payload = {
        userId: GetItem('UserId'),
        username: search,
        page: count,
        limit: 10,
      };

      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (count == 1) {
        setMaxreached(false);
        setPage(1);
      }

      if (!maxreached || count == 1) {
        if (apiCalled) return;

        setApiCalled(true);
        setPgLoad(true);

        const result = await getChatersAndFollowersList(payload);

        if (result?.status) {
          if (result?.data?.length > 0) {
            const value = [
              ...new Map(
                result?.data?.map(data => [data?.to?._id, { ...data?.to }]),
              ).values(),
            ];
            if (count == 1) {
              setInvitedMembers(value);
            } else {
              setInvitedMembers(prev => mergeUniqueById(prev, value));
            }
            setPage(count + 1);
          } else {
            if (count === 1) {
              setInvitedMembers([]);
            }
            setMaxreached(true);
          }
        } else if (search != '') {
          setInvitedMembers([]);
          setPage(1);
        } else if (result?.data?.length <= 0) {
          setMaxreached(true);
        }
      }
    } catch (error) {
    } finally {
      setPgLoad(false);
      setApiCalled(false);
    }
  };

  const getAdminDetail = async () => {
    try {
      const result = await getAdminDetails();
      if (result?.status) {
        setAdminDetails(result?.data[0]);
      }
    } catch (error) {
      console.log('Error on getAdminDetail: ', error);
    }
  };

  const CreateNewGroup = async () => {
    try {
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (data?.name == '') {
        ShowToast(t('GroupName_Required'));
        return;
      }

      if (!location) {
        ShowToast(t('Please_select_your_location'));
        return;
      }

      if (groupFilterHoobies?.length <= 0) {
        ShowToast(t('HobbiesRequired'));
        return;
      }

      var getad = GetItem('Adddressdata');

      const selectedIds = groupFilterHoobies?.map(data => data?._id);

      const sendData = {
        userId: profile?._id || user_Id,
        isGroupchat: true,
        chatName: data?.name,
        groupDiscription: data?.desc,
        groupAddress: location,
        groupIndex: groupIndex,
        grouphobbies: JSON.stringify(selectedIds),
        isPrivate: privateGroup,
        hide_group: hideGroup,
      };

      if (getad?.lat && getad.long) {
        sendData.latitude = getad?.lat;
        sendData.longitude = getad.long;
      } else if (editId) {
        sendData.latitude = coordinates[1];
        sendData.longitude = coordinates[0];
      }

      // Handle members list based on edit status
      let membersList;
      let imageList;
      if (!editStatus) {
        membersList = groupMembers?.map(data => data?._id);
        let all_member = [profile?._id, ...membersList];
        sendData.members = JSON.stringify(all_member);
      } else {
        imageList = [...deleteArr];
        sendData.deletedGroupImg = JSON.stringify(imageList);
        membersList = [...selectedMembers];
        sendData.instanceId = editId;
        sendData.members = JSON.stringify(membersList);
      }

      console.log('deleteArr==>', sendData);

      // Handle profile image

      console.log('editProfileImage--->', editProfileImage);
      if (editProfileImage && profileImage != null) {
        sendData.image = [
          {
            uri:
              Platform.OS === 'android'
                ? profileImage
                : profileImage?.replace('file://', ''),
            type:
              profiledata?.type === 'image/jpg'
                ? 'image/jpeg'
                : profiledata?.type,
            name: profiledata?.fileName,
          },
        ];
      } else {
        sendData.image = editImage;
      }

      if (!editStatus && profileImages?.length == 0) {
        ShowToast(t('GroupIMGRequired'));
        return;
      }

      console.log('filterNewImages==>', filterNewImages);
      const filterNewImages = profileImages?.filter(e => e?.fileName) || [];
      sendData.groupImages = filterNewImages.map(item => ({
        uri:
          Platform.OS === 'android'
            ? item?.uri
            : item?.uri?.replace('file://', ''),
        type: item?.type === 'image/jpg' ? 'image/jpeg' : item?.type,
        name: item?.fileName,
      }));

      // Handle new members addition if in edit status
      if (editStatus) {
        const idsNotInEditMem = selectedMembers.filter(
          id => !editMemb.includes(id),
        );
        sendData.newMemberAdd = JSON.stringify(idsNotInEditMem);
        sendData.type = 'Add';
      }

      // if (selectedMembers.length > 1) {

      //  console.log("PRofile_______", profileImages);

      // setLoading(true);
      let result;

      Keyboard.dismiss();
      console.log('EditData==>', sendData);

      if (!editStatus) {
        result = await createGroupMembers(sendData);
      } else {
        if (profileImages?.length == 0) {
          ShowToast(t('GroupIMGRequired'));
          return;
        } else {
          result = await EditGroupDetails(sendData);
        }
      }

      if (result?.status) {
        setLoading(false);
        // dispatch(update_GroupFilterHoobies([]));
        // // navigation.navigate("Chat")
        // navigation.navigate("Homescreen", {
        //     screen: "Chat",
        // });

        setLoading(false);
        navigation.navigate('Homescreen', { screen: 'Chat' });

        // Delay the Redux update so it doesn't block navigation
        setTimeout(() => {
          dispatch(update_GroupFilterHoobies([]));
        }, 300);
      } else {
        setLoading(false);
        ShowToast(result?.message);
      }

      console.log('Result_______', result);

      // }
      // else {

      //     ShowToast(t('Select_atleast_two_members'))
      //     setLoading(false);
      // }
    } catch (error) {
      console.log('Error on CreateNewGroup:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        animatedIndex={{
          value: 1,
        }}
        opacity={Platform.OS == 'android' ? 0.6 : 0.4}
      >
        <View
          style={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator
            style={{ alignSelf: 'center' }}
            color={'#fff'}
            size={'large'}
          />
        </View>
      </BottomSheetBackdrop>
    ),
    [],
  );

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profiledata, setProfiledata] = useState({});

  const [editProfileImage, setEditProfileImage] = useState(false);
  const [editImage, setEditImage] = useState('');

  const openImagePicker = type => {
    setIsBottomSheetVisible(true);

    if (type == 'profile') {
      setEditProfileImage(true);
      setProfileSelect(true);
      setBioImage(false);
    } else {
      setProfileSelect(false);
    }

    bottomSheetRef.current.present();
  };

  const handleImageResponse = response => {
    if (response.didCancel) {
    } else if (response.errorMessage) {
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0].uri;
      setProfileImage(selectedImage);
      setProfiledata(response.assets[0]);
    }
  };

  const handleUploadImageResponse = response => {
    if (response.didCancel) {
    } else if (response.errorMessage) {
    } else if (response.assets && response.assets.length > 0) {
      if (response.assets.length > adminDetails?.eventImage_limit) {
        ShowToast(t('Accept_limited_imagesonly'));
      }
      const length = adminDetails?.eventImage_limit - profileImages?.length;
      setProfileImages(prevImages => [
        ...prevImages,
        ...response?.assets?.slice(0, length),
      ]);
    }
  };

  // const handleSelectImage = (source, callback) => {
  //     bottomSheetRef.current.close();

  //     const options = {
  //         mediaType: 'photo',
  //         quality: 1,
  //         selectionLimit: adminDetails?.eventImage_limit - profileImages?.length,
  //     };

  //     if (source === 'library') {
  //         launchImageLibrary(options, callback);
  //     } else if (source === 'camera') {
  //         launchCamera(options, callback);
  //     }

  //     setIsBottomSheetVisible(false);
  // };

  const handleSelectImage = (source, callback) => {
    bottomSheetRef.current.close();
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeExtra: true,
      selectionLimit: boiImages ? 3 - profileImages?.length : 1,
    };

    if (source === 'library') {
      launchImageLibrary(options, callback);
    } else if (source === 'camera') {
      launchCamera(options, callback);
    }
  };

  // const handleFocus = () => {
  //   previousScrollYRef.current = currentScrollYRef.current;
  //   memberSearchFocusedRef.current = true;
  // };
  const handleFocus = () => {
    previousScrollYRef.current = currentScrollYRef.current;
    memberSearchFocusedRef.current = true;
  };

  const closeMemberPicker = useCallback(() => {
    Keyboard.dismiss();
    memberSearchFocusedRef.current = false;
    setSearch('');
    setGroup(false);

    // Reset draft back to committed state (Cancel behavior)
    setDraftSelectedMembers(selectedMembers);
    setDraftGroupMembers(groupMembers);

    // Restore original scroll position (avoid jumping to top)
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(previousScrollYRef.current, 0),
        animated: false,
      });
    });
  }, [groupMembers, selectedMembers]);

  const confirmMemberPicker = useCallback(() => {
    setSelectedMembers(draftSelectedMembers);
    setGroupMembers(draftGroupMembers);
    closeMemberPicker();
  }, [closeMemberPicker, draftGroupMembers, draftSelectedMembers]);

  const [keyboardVisible, setKeyboardVisible] = useState(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(false);
        if (memberSearchFocusedRef.current) {
          // Member search input is inside the modal; don't scroll the underlying page.
          if (group) {
            return;
          }
          const inputHandle = memberSearchInputRef.current;
          scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
            inputHandle,
            24,
            true,
          );
        }
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(true);
        if (memberSearchFocusedRef.current) {
          // Keep the picker open so the user can scroll/select friends
          // after dismissing the keyboard.
          memberSearchFocusedRef.current = false;
        }
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [closeMemberPicker]);

  const handleScrollEnd = nativeEvent => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    if (search?.trim()) {
      return;
    }

    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const hasScrollableContent =
      contentSize.height > layoutMeasurement.height + 40;
    const isEndReached =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (
      hasScrollableContent &&
      contentOffset.y > 0 &&
      isEndReached &&
      !maxreached &&
      !pgLoad &&
      !apiCalled
    ) {
      getAllchats(page);
    }
  };

  const handleGroupmember = async () => {
    // Snapshot current scroll position before opening picker
    previousScrollYRef.current = currentScrollYRef.current;
    // Initialize draft selection from committed state
    setDraftSelectedMembers(selectedMembers);
    setDraftGroupMembers(groupMembers);
    setGroup(!group);

    // Prevent the underlying page from briefly snapping to top
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(previousScrollYRef.current, 0),
        animated: false,
      });
    });
  };

  const handleCreateEventFunction = () => {
    if (hasActiveSubscription(profile)) {
      setLoading(true);
      CreateNewGroup();
    } else {
      setIsModalVisible(true);
    }
  };

  const handleNaigatePremium = async () => {
    setIsModalVisible(false);
    navigation.navigate('Premium');
  };

  const openImageSlider = index => {
    console.log('index-----', index);
    setCurrentImageIndex(index);
    setImageVisible(true);
    setChangrIndex(index);
  };

  const imagesForViewer = profileImages?.map(uri => ({ url: uri?.uri }));

  const handleDeleteImage = index => {
    //setDeleteArr((prev) => [...prev, profileImages[index]?.uri?.split(".net").pop()]);
    setDeleteArr(prev => [
      ...prev,
      profileImages[index]?.uri?.split('.net')?.pop(),
    ]);
    setCurrentImageIndex(0);

    setProfileImages([
      ...profileImages.slice(0, index),
      ...profileImages.slice(index + 1, profileImages?.length),
    ]);

    setImageVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
    >
      <LinearGradient
        style={{ width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']}
      >
        <View style={styles.boxcontainer}>
          <View style={styles.backcontainer}>
            <View
              style={{
                width: '70%',
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Pressable
                onPress={() => {
                  dispatch(update_GroupFilterHoobies([]));
                  navigation.goBack();
                }}
                style={styles.roundbox}
              >
                {Images.back}
              </Pressable>
              <Text style={styles.headertxt}>
                {grpDetail ? t('Edit') : t('Create')} {t('Group')}
              </Text>
            </View>
          </View>

          <View style={{ width: '100%', height: '80%' }}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: keyboardVisible ? deviceheight * 0.14 : deviceheight * 0.34,
              }}
              onScroll={({ nativeEvent }) => {
                currentScrollYRef.current = nativeEvent.contentOffset.y;
                handleScrollEnd(nativeEvent);
              }}
              scrollEventThrottle={16}
            >
              <View style={{ marginBottom: '22%' }}>
                <View
                  style={{ width: '90%', alignSelf: 'center', marginTop: '3%' }}
                >
                  <View
                    style={{
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '4%',
                    }}
                  >
                    <View style={styles.profilebox}>
                      <Pressable onPress={() => openImagePicker('profile')}>
                        {profileImage != null ? (
                          <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage1}
                          />
                        ) : (
                          <Image
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: borderradius * 5,
                            }}
                            source={randomimages[groupIndex]}
                            resizeMode="cover"
                          />
                        )}

                        <Pressable
                          style={styles.editbox}
                          onPress={() => openImagePicker('profile')}
                        >
                          <View>{Images.edit}</View>
                        </Pressable>
                      </Pressable>
                    </View>
                  </View>
                  <View style={{ marginTop: '4%' }}>
                    <Text style={styles.title}>{t('Name')}</Text>
                    <Pressable style={styles.searchcontainer1}>
                      <TextInput
                        placeholderTextColor={'#F7E5D0'}
                        style={styles.inputtxtstyle}
                        value={data?.name}
                        onChangeText={text => {
                          setData({ ...data, name: text });
                        }}
                        keyboardType="default"
                      />
                    </Pressable>
                  </View>

                  <View style={{ marginTop: '4%' }}>
                    <Text style={styles.title}>{t('Description')}</Text>
                    <Pressable style={styles.desccontainer}>
                      <TextInput
                        multiline={true}
                        placeholderTextColor={'#F7E5D0'}
                        // placeholder={`${t('Your')} ${t('Group')} ${t('Description')} (${t('optional')})`}
                        style={styles.Destxtstyle}
                        value={data?.desc}
                        onChangeText={text => {
                          setData({ ...data, desc: text });
                        }}
                        keyboardType="default"
                      />
                    </Pressable>
                  </View>

                  <View style={styles.inputsec}>
                    <View style={{ marginBottom: '2%' }}>
                      <Text style={styles.inputpara}>{t('Location')}</Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        isOnline &&
                        navigation.navigate('LocationHome', {
                          from: 'CreateGroup',
                        })
                      }
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        height: deviceheight * 0.078,
                        paddingHorizontal: '3%',
                        borderRadius: borderradius * 0.3,
                        borderColor: c.white,
                        borderWidth: 0.9,
                      }}
                    >
                      <Text
                        style={{
                          width: '90%',
                          fontSize: RFValue(12),
                          fontFamily: Fonts.Regular,
                          color: c.white,
                        }}
                      >
                        {location || ''}
                      </Text>
                      <View
                        style={{
                          position: 'absolute',
                          right: '3%',
                          alignSelf: 'center',
                        }}
                      >
                        {Images.location1}
                      </View>
                    </Pressable>
                  </View>

                  <View style={{ marginTop: '5%', width: '100%' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ width: '80%' }}>
                        <Text
                          style={{
                            fontFamily: Fonts.SemiBold,
                            color: c.white,
                            fontSize: RFValue(16),
                          }}
                        >
                          {t('TagHobbies')}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.Regular,
                            color: c.white,
                            fontSize: RFValue(12),
                          }}
                        >
                          {t('This_group_will_searches_hobbies')}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          // dispatch(update_GroupFilter(true))
                          navigateToFilterSheet(navigation, 'GroupfilterPage', {
                            page: 'group',
                          });
                        }}
                      >
                        <View style={{ width: '100%' }}>
                          {isGroupFilter ? (
                            <ActivityIndicator
                              style={{ alignSelf: 'center' }}
                              color={c?.white}
                              size={'small'}
                            />
                          ) : (
                            <View
                              style={{
                                width: '40',
                                borderRadius: borderradius * 0.3,
                                height: deviceheight * 0.036,
                                borderColor: c.white,
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'flex-end',
                              }}
                            >
                              <Icons
                                name="plus"
                                size={deviceheight * 0.018}
                                color={c.white}
                              />
                            </View>
                          )}
                        </View>
                      </Pressable>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        flexWrap: 'wrap',
                        marginTop: '2%',
                        gap: 5,
                      }}
                    >
                      {groupFilterHoobies?.map((interest, index) => {
                        return (
                          <Pressable key={index} style={styles.addcontainer}>
                            <Text
                              style={{
                                fontSize: RFValue(12.5),
                                color: c.pink,
                                fontFamily: Fonts.Medium,
                                textAlign: 'center',
                              }}
                            >
                              {interest?.hobbyName}{' '}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* image upload  */}

                  <View style={{ marginTop: '5%', width: '100%' }}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={{ width: '80%' }}>
                        <Text
                          style={{
                            fontFamily: Fonts.SemiBold,
                            color: c.white,
                            fontSize: RFValue(16),
                          }}
                        >
                          {t('Image_Upload')}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        marginBottom: '4%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    ></View>
                    <ScrollView contentContainerStyle={styles.imageGrid}>
                      {profileImages?.slice(0, 4).map((imageUri, index) => (
                        <Pressable
                          onPress={() => openImageSlider(index)}
                          key={index}
                          style={{
                            position: 'relative',
                            margin: 1,
                          }}
                        >
                          <Image
                            key={index}
                            source={{ uri: imageUri?.uri }}
                            style={styles.uploadedImage}
                          />
                          {index === 3 && (
                            <View style={styles.overlay}>
                              <Text style={styles.moreText}>{t('More')}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}

                      <Pressable
                        onPress={() =>
                          profileImages?.length < adminDetails?.eventImage_limit
                            ? openImagePicker('bio')
                            : ShowToast(t('You_have_reached_maximum_limit'))
                        }
                        style={styles.dashbox1}
                      >
                        <Icon
                          name="plus"
                          size={deviceheight * 0.019}
                          color={c.white}
                        />
                      </Pressable>
                    </ScrollView>
                  </View>

                  <View
                    style={{
                      marginTop: '6%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ width: '80%' }}>
                      <Text style={styles.title}>{t('PrivateGroup')}</Text>
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          color: c.white,
                          fontSize: RFValue(12),
                        }}
                      >
                        {t('This_group_not_show_earches')}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          color: c.white,
                          fontSize: RFValue(12),
                          marginTop: 4,
                        }}
                      >
                        {t('Private_group_manage_requests_hint')}
                      </Text>
                    </View>

                    <SwitchToggle
                      switchOn={privateGroup}
                      onPress={() => setPrivateGroup(!privateGroup)}
                      circleColorOff="#911687"
                      circleColorOn="#911687"
                      backgroundColorOn={c.primary}
                      backgroundColorOff={c.pink}
                      containerStyle={{
                        width: devicewidth * 0.16,
                        height: devicewidth * 0.074,
                        borderRadius: 100,
                        padding: devicewidth * 0.01,
                      }}
                      circleStyle={{
                        width: devicewidth * 0.055,
                        height: devicewidth * 0.055,
                        borderRadius: 100,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      marginTop: '6%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ width: '80%' }}>
                      <Text style={styles.title}>{t('hideGrp')}</Text>
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          color: c.white,
                          fontSize: RFValue(12),
                        }}
                      >
                        {t('Hide_group_show_up')}
                      </Text>
                    </View>
                    <SwitchToggle
                      switchOn={hideGroup}
                      onPress={() => sethideGroup(!hideGroup)}
                      circleColorOff="#911687"
                      circleColorOn="#911687"
                      backgroundColorOn={c.primary}
                      backgroundColorOff={c.pink}
                      containerStyle={{
                        width: devicewidth * 0.16,
                        height: devicewidth * 0.074,
                        borderRadius: 100,
                        padding: devicewidth * 0.01,
                      }}
                      circleStyle={{
                        width: devicewidth * 0.055,
                        height: devicewidth * 0.055,
                        borderRadius: 100,
                      }}
                    />
                  </View>

                  <View style={{ marginTop: '6%' }}>
                    <Text style={styles.title}>{t('Admin')}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: '4%',
                      alignContent: 'center',
                    }}
                  >
                    {profile?.profile ? (
                      <Image
                        source={{ uri: `${Imageurl}${profile?.profile}` }}
                        style={styles.groupprofileImage}
                      />
                    ) : (
                      <Image
                        source={randomimages[profile?.randomIndex]}
                        style={styles.groupprofileImage}
                      />
                    )}
                    <View style={{ marginLeft: '3%' }}>
                      <Text style={styles.nametxt}>{profile?.name}</Text>
                      <Text style={styles.subtxt}>
                        {profile?.MychatDiscription}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: '4%' }}>
                    <Text style={styles.title}>{t('Members')}</Text>
                  </View>

                  <View style={styles.imageContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        gap: 10,
                        alignContent: 'center',
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          handleGroupmember(group);
                        }}
                        style={styles.dashbox}
                      >
                        <Icon
                          name="plus"
                          size={deviceheight * 0.025}
                          color={c.white}
                        />
                      </Pressable>

                      {groupMembers?.map(
                        member =>
                          member.blockStatus == 'unblocked' && (
                            <View key={member?.id} style={styles.imageWrapper}>
                              <View style={{}}>
                                {member?.profile ? (
                                  <Image
                                    source={{
                                      uri: `${Imageurl}${member?.profile}`,
                                    }}
                                    style={styles.groupprofileImage}
                                  />
                                ) : (
                                  <>
                                    <View
                                      style={{
                                        width: devicewidth * 0.13,
                                        height: devicewidth * 0.13,
                                      }}
                                    >
                                      <Image
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          borderRadius: borderradius * 5,
                                        }}
                                        source={
                                          randomimages[member?.randomIndex]
                                        }
                                        resizeMode="cover"
                                      />
                                    </View>
                                  </>
                                )}
                                {editMemb.includes(member?._id) ? (
                                  <View style={styles.addboxtick}>
                                    {Images.whiteTick}
                                  </View>
                                ) : (
                                  <>
                                    <Pressable
                                      style={styles.addbox}
                                      onPress={() =>
                                        handleGroupMemberRemove(member)
                                      }
                                    >
                                      {Images.close3}
                                    </Pressable>
                                  </>
                                )}
                              </View>
                              <View>
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: RFValue(12),
                                    textAlign: 'center',
                                  }}
                                >
                                  {member?.username?.length > 3
                                    ? `${member?.username.slice(0, 6)}...`
                                    : member?.username}
                                </Text>
                              </View>
                            </View>
                          ),
                      )}
                    </ScrollView>
                  </View>

                  {/* Member picker moved to a keyboard-safe modal */}
                </View>
              </View>
            </ScrollView>
          </View>
          <Modal
            visible={group}
            transparent={true}
            animationType="slide"
            onRequestClose={closeMemberPicker}
          >
            <Pressable
              style={styles.memberPickerOverlay}
              onPress={closeMemberPicker}
            >
              <Pressable
                style={styles.memberPickerSheet}
                onPress={() => {}}
              >
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  enabled
                >
                  <View style={styles.memberPickerHeaderRow}>
                    <Text style={styles.title}>{t('Members')}</Text>
                    <Pressable onPress={closeMemberPicker} hitSlop={10}>
                      {Images.close1}
                    </Pressable>
                  </View>

                  <View style={styles.imageContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 10, alignContent: 'center' }}
                    >
                      {draftGroupMembers?.map(
                        member =>
                          member.blockStatus == 'unblocked' && (
                            <View key={member?.id} style={styles.imageWrapper}>
                              <View>
                                {member?.profile ? (
                                  <Image
                                    source={{
                                      uri: `${Imageurl}${member?.profile}`,
                                    }}
                                    style={styles.groupprofileImage}
                                  />
                                ) : (
                                  <Image
                                    source={randomimages[member?.randomIndex]}
                                    style={styles.groupprofileImage}
                                    resizeMode="cover"
                                  />
                                )}
                              </View>
                            </View>
                          ),
                      )}
                    </ScrollView>
                  </View>

                  <View style={styles.memberPickerSearchRow}>
                    <Pressable style={styles.searchcontainer}>
                      {Images.search1}
                      <TextInput
                        ref={memberSearchInputRef}
                        placeholderTextColor={'#F7E5D0'}
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t('Start_Typing')}
                        style={styles.inputtxtstyle}
                        autoFocus
                        onFocus={handleFocus}
                        onBlur={() => {
                          memberSearchFocusedRef.current = false;
                        }}
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </Pressable>
                  </View>

                  <View style={{ flex: 1, marginTop: '5%' }}>
                    <Text style={styles.title}>{t('YourFriends')}</Text>

                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingBottom: deviceheight * 0.22 + (insets?.bottom || 0),
                      }}
                    >
                      {!pgLoad && invitedMembers.length == 0 && (
                        <View
                          style={{
                            margin: '5%',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={styles.subtxt}>{t('No_Members_Found')}</Text>
                        </View>
                      )}

                      {pgLoad && (
                        <ActivityIndicator
                          style={{ marginTop: '5%', alignSelf: 'center' }}
                          color={c.white}
                          size={'small'}
                        />
                      )}

                      {invitedMembers.map(
                        member =>
                          member?.blockStatus == 'unblocked' && (
                            <Pressable
                              key={member?._id}
                              onPress={() => {
                                member?.blockStatus != 'unblocked'
                                  ? ShowToast(t('UserBlocked_byAdmin'))
                                  : handleDraftMemberSelect(member);
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: '4%',
                              }}
                            >
                              <View
                                style={{
                                  position: 'relative',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {member?.profile ? (
                                  <Image
                                    source={{
                                      uri: `${Imageurl}${member?.profile}`,
                                    }}
                                    style={styles.profileImage}
                                  />
                                ) : (
                                  <Image
                                    source={randomimages[member?.randomIndex]}
                                    resizeMode="cover"
                                    style={styles.profileImage}
                                  />
                                )}
                                {draftSelectedMembers?.includes(member?._id) && (
                                  <View style={styles.tickbox}>{Images.tick1}</View>
                                )}
                              </View>
                              <View style={{ marginLeft: '3%' }}>
                                <Text style={styles.nametxt}>{member?.username}</Text>
                                <Text style={styles.subtxt}>
                                  {member?.MychatDiscription}
                                </Text>
                              </View>
                            </Pressable>
                          ),
                      )}
                    </ScrollView>
                  </View>
                  {(draftSelectedCount > 0 || hasDraftChanges) && (
                    <View
                      style={[
                        styles.memberPickerFooter,
                        { bottom: Math.max(insets?.bottom || 0, 8) + 8 },
                      ]}
                    >
                      <Button
                        onpress={confirmMemberPicker}
                        title={
                          draftSelectedCount > 0
                            ? `Add (${draftSelectedCount})`
                            : t('Done')
                        }
                      />
                    </View>
                  )}
                </KeyboardAvoidingView>
              </Pressable>
            </Pressable>
          </Modal>
          {keyboardVisible && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '1.5%',
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
                    marginTop: '5%',
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={c.primary}
                    style={styles.loader}
                  />
                </Pressable>
              ) : (
                <Button
                  onpress={handleCreateEventFunction}
                  title={t('Continue')}
                />
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      <AlertPopup
        visible={isModalVisible}
        title="Note"
        onSubmit={() => handleNaigatePremium()}
        onClose={() => setIsModalVisible(false)}
      >
        <Text>{t('You_want_to_ubscribe')}</Text>
      </AlertPopup>

      {imagesForViewer?.length > 0 && (
        <Modal
          visible={imageVisible}
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          {imagesForViewer?.length > 1 ? (
            <ImageViewer
              imageUrls={imagesForViewer}
              index={currentImageIndex}
              enableSwipeDown={true}
              onChange={index => setChangrIndex(index)}
              style={{ width: '100%', height: '100%' }}
              onSwipeDown={() => setImageVisible(false)}
              saveToLocalByLongPress={false}
              onLongPress={() => { }}
            />
          ) : (
            <ImageViewer
              imageUrls={imagesForViewer}
              index={currentImageIndex}
              enableSwipeDown={true}
              onChange={index => setChangrIndex(index)}
              style={{ width: '100%', height: '100%' }}
              onSwipeDown={() => setImageVisible(false)}
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              onLongPress={() => { }}
            />
          )}

          <View
            style={{
              width: '100%',
              height: 100,
              backgroundColor: 'rgba(0,0,0,0.3)',
              position: 'absolute',
              top: Platform.OS == 'android' ? '0%' : '5%',
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setImageVisible(false)}
            >
              {Images.back}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                handleDeleteImage(changeIndex);
              }}
            >
              {/* <Icon name="delete" size={30} color={c.white} /> */}
              <Deleteicon
                width={devicewidth * 0.08}
                height={devicewidth * 0.08}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={['27%']}
          shouldMeasureContentHeight={true}
          backgroundStyle={{ backgroundColor: c.secondary }}
          enableOverDrag={true}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: 'gray' }}
        >
          <View style={{ padding: '5%', width: '100%', height: '100%' }}>
            <Text
              style={{
                fontFamily: Fonts.Bold,
                fontSize: RFValue(15),
                color: c.white,
              }}
            >
              {t('select_media')}
            </Text>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: '5%',
              }}
            >
              <Pressable
                onPress={() =>
                  handleSelectImage(
                    'camera',
                    profileSelect
                      ? handleImageResponse
                      : handleUploadImageResponse,
                  )
                }
                style={{ paddingVertical: '5%', alignItems: 'center' }}
              >
                <Image
                  style={{
                    width: devicewidth * 0.09,
                    height: devicewidth * 0.09,
                  }}
                  source={Images.camera1}
                />
                <Text
                  style={{
                    fontFamily: Fonts.Regular,
                    fontSize: RFValue(13),
                    color: c.white,
                    marginTop: '5%',
                  }}
                >
                  {t('camera')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  handleSelectImage(
                    'library',
                    profileSelect
                      ? handleImageResponse
                      : handleUploadImageResponse,
                  )
                }
                style={{
                  paddingVertical: '5%',
                  alignItems: 'center',
                  marginLeft: '5%',
                }}
              >
                <Image
                  style={{
                    width: devicewidth * 0.09,
                    height: devicewidth * 0.09,
                  }}
                  source={Images.gallery1}
                />
                <Text
                  style={{
                    fontFamily: Fonts.Regular,
                    fontSize: RFValue(13),
                    color: c.white,
                    marginTop: '5%',
                  }}
                >
                  {t('gallery')}
                </Text>
              </Pressable>
              {(editImage != '' || profileImage != null) && (
                <Pressable
                  onPress={() => {
                    setEditImage('');
                    setProfileImage(null);
                    setEditProfileImage(true);
                    bottomSheetRef.current?.close();
                  }}
                  style={{
                    paddingVertical: '5%',
                    alignItems: 'center',
                    marginLeft: '5%',
                  }}
                >
                  <Image
                    style={{
                      width: devicewidth * 0.09,
                      height: devicewidth * 0.09,
                    }}
                    source={Images.remove}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.Regular,
                      fontSize: RFValue(13),
                      color: c.white,
                      marginTop: '5%',
                    }}
                  >
                    {t('remove')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
      {/* <Groupfilter visible={isGroupFilter} page={"group"} /> */}
    </KeyboardAvoidingView>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  memberPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  memberPickerSheet: {
    height: deviceheight * 0.75,
    backgroundColor: c.secondary,
    borderTopLeftRadius: borderradius * 0.8,
    borderTopRightRadius: borderradius * 0.8,
    paddingHorizontal: '5%',
    paddingTop: '4%',
  },
  memberPickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberPickerSearchRow: {
    marginTop: '4%',
  },
  memberPickerFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: '5%',
    alignItems: 'center',
  },
  boxcontainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  nametxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(17),
  },
  subtxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(12),
  },
  backcontainer: {
    width: '90%',
    alignSelf: 'center',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundbox: {
    width: devicewidth * 0.1,
    height: devicewidth * 0.1,
    borderRadius: (devicewidth * 0.15) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headertxt: {
    fontFamily: Fonts.ExtraBold,
    color: c.white,
    fontSize: RFValue(19),
    textAlign: 'center',
  },
  title: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(16),
  },
  heading: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(26),
    width: '90%',
    marginTop: '2%',
  },
  imageContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '5%',
    marginRight: '12%',
  },
  imageWrapper: {
    position: 'relative',
  },
  addbox: {
    position: 'absolute',
    bottom: '3%',
    right: 0,
    backgroundColor: c.secondary,
    borderRadius: borderradius * 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: devicewidth * 0.06,
    height: devicewidth * 0.06,
  },
  addboxtick: {
    position: 'absolute',
    bottom: '3%',
    right: 0,
    backgroundColor: 'green',
    borderRadius: borderradius * 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: devicewidth * 0.06,
    height: devicewidth * 0.06,
  },
  tickbox: {
    position: 'absolute',
    bottom: '3%',
    right: 0,
    backgroundColor: c.white,
    borderRadius: borderradius * 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: devicewidth * 0.05,
    height: devicewidth * 0.05,
  },
  dashbox: {
    width: devicewidth * 0.13,
    height: devicewidth * 0.13,
    borderRadius: borderradius * 1.7,
    borderColor: c.white,
    borderWidth: 3.8,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1%',
  },
  searchcontainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: deviceheight * 0.052,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.5,
    borderColor: c.white,
    borderWidth: 0.9,
  },
  inputtxtstyle: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    width: '90%',
  },

  Destxtstyle: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    width: '100%',
    height: '100%',
    paddingTop: 10,
    textAlignVertical: 'top',
    justifyContent: 'flex-start',
    position: 'relative',
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
  },
  profileImage1: {
    width: '100%',
    height: '100%',
    borderRadius: (deviceheight * 0.15) / 2,
  },
  groupprofileImage: {
    width: devicewidth * 0.13,
    height: devicewidth * 0.13,
    borderRadius: borderradius * 5,
  },
  searchcontainer1: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: deviceheight * 0.052,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.5,
    borderColor: c.white,
    borderWidth: 0.9,
    marginTop: '4%',
  },
  desccontainer: {
    width: '100%',
    alignItems: 'center',
    height: deviceheight * 0.2,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.5,
    borderColor: c.white,
    borderWidth: 0.9,
    alignSelf: 'baseline',
    marginTop: '4%',
  },
  profilebox: {
    width: devicewidth * 0.24,
    height: devicewidth * 0.24,
    borderRadius: (devicewidth * 0.15) / 1.3,
    backgroundColor: c.white,
  },
  editbox: {
    width: devicewidth * 0.07,
    height: devicewidth * 0.07,
    borderRadius: borderradius * 2,
    backgroundColor: c.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '3%',
    right: 0,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addcontainer: {
    padding: '3%',
    borderRadius: borderradius * 1.5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    alignSelf: 'center',
    flexDirection: 'row',
    marginBottom: '4%',
  },
  btmtxt: {
    fontSize: RFValue(16),
    fontFamily: Fonts.Bold,
    color: c.white,
  },
  organizerbtn: {
    width: '15%',
    borderRadius: borderradius * 0.3,
    height: deviceheight * 0.036,
    borderColor: c.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '5%',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '2%',
  },
  uploadedImage: {
    width: devicewidth * 0.2,
    height: devicewidth * 0.2,
    margin: 3,
    borderRadius: borderradius * 0.2,
    resizeMode: 'cover',
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

  dashbox1: {
    width: devicewidth * 0.13,
    height: devicewidth * 0.13,
    borderRadius: borderradius * 1.7,
    borderColor: c.white,
    borderWidth: 3,
    alignSelf: 'center',
    alignContent: 'center',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1%',
    marginLeft: '2%',
  },
  backButton: {
    marginTop: '8%',
    left: '3%',
    width: devicewidth * 0.1,
    height: devicewidth * 0.1,
    borderRadius: (devicewidth * 0.15) / 2,
    backgroundColor: '#fff',
    marginLeft: '3%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.8%',
  },
  deleteButton: {
    marginTop: '8%',
    right: '8%',
    padding: '1.8%',
  },
  inputsec: {
    width: '100%',
    alignSelf: 'center',
    marginTop: '3%',
  },
  inputpara: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },
});
