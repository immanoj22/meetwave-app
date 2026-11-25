import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import {
  borderradius,
  deviceheight,
  devicewidth,
  ShowToast,
} from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { navigateToFilterSheet } from '../../Utilities/filterSheetPresent';
import { preloadGroupFilterPage } from '../Home/filterPagePreload';
import { Images } from '../../Utilities/images';
import { RFValue } from 'react-native-responsive-fontsize';
import SwitchToggle from 'react-native-switch-toggle';
import { useDispatch, useSelector } from 'react-redux';
import {
  helperSelector,
  update_EventFilterHoobies,
  update_filterBySearch,
  update_GroupFilterHoobies,
  update_NetworkVisible,
  update_statusbarcolor,
} from '../../Slices/helper';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet/src';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import { GetItem, RemoveItem, SetItem } from '../../Actions/localstorage';
import {
  DateTimeMerge,
  EventDetails,
  addneweventapi,
  eventeditapi,
  getAdminDetails,
  getChatersAndFollowersList,
} from '../../Actions/hooks';
import { hasActiveSubscription } from '../../Actions/config';

/** Normalize API / navigation values for the per-event "hide from search" flag */
const readEventHideFlag = raw => {
  if (typeof raw === 'boolean') {
    return raw;
  }
  if (raw === null || raw === undefined) {
    return false;
  }
  if (typeof raw === 'number') {
    return raw !== 0;
  }
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    if (s === 'true' || s === '1') {
      return true;
    }
    if (s === 'false' || s === '0' || s === '') {
      return false;
    }
  }
  return Boolean(raw);
};
import { Imageroute, Imageurl } from '../../Actions/constant';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useTranslation } from 'react-i18next';
import Icons from 'react-native-vector-icons/FontAwesome6';
import { TapGestureHandler } from 'react-native-gesture-handler';
import profileImagePath, { randomimages } from '../../Utilities/profileImages';
import { profileSelector } from '../../Slices/profile';
import Button from '../../Components/button';
import AlertPopup from '../../Components/AlertPopup';
import Commonheader from '../../Navigation/commonheader';
import { showwarningmessage } from '../../Actions/config';
import Deleteicon from '../../Assets/icons/delete.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EventCreation = props => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const [startActivity, setActivity] = useState(new Date());
  const [endActivity, setEndActivity] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState(false);
  const [isDateEndPickerVisible, setIsDateEndPickerVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isHideEvent, setIsHideEvent] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const [profileImages, setProfileImages] = useState([]);

  const [groupImagesEdited, setGroupImagesEdited] = useState(false);

  const bottomSheetRef = useRef(null);
  const scrollViewRef = useRef(null);
  const memberSearchInputRef = useRef(null);
  const currentScrollYRef = useRef(0);
  const previousScrollYRef = useRef(0);
  const memberSearchFocusedRef = useRef(false);
  /** Prevents EventDetails from overwriting the hide toggle when profile/user deps re-fire */
  const hideServerSyncedForEventRef = useRef(null);
  const lastHideFetchEventIdRef = useRef(null);
  const [memberSearchY, setMemberSearchY] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [profiledata, setProfiledata] = useState([]);
  const userID = GetItem('UserId');
  const [loading, setLoading] = useState(false);
  const maxDescLength = 500;
  const [editdata, setEditData] = useState({});
  const [editId, setEditId] = useState('');
  const [editImage, setEditImage] = useState([]);
  const [changeIndex, setChangrIndex] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const { isOnline, isGroupFilter, eventFilterHoobies, hobbieList } =
    useSelector(helperSelector);
  const { profile } = useSelector(profileSelector);
  const [adminDetails, setAdminDetails] = useState({});

  const [search, setSearch] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [draftGroupMembers, setDraftGroupMembers] = useState([]);
  const [draftSelectedMembers, setDraftSelectedMembers] = useState([]);
  const [draftNewMembers, setDraftNewMembers] = useState([]);

  const draftSelectedCount = draftSelectedMembers.length;
  const hasDraftChanges =
    draftSelectedMembers.length !== selectedMembers.length ||
    draftSelectedMembers.some(id => !selectedMembers.includes(id));
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [maxreached, setMaxreached] = useState(false);
  const [page, setPage] = useState(1);
  const [apiCalled, setApiCalled] = useState(false);
  const [editMemb, setEditMem] = useState([]);
  const [pgLoad, setPgLoad] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [profileSelect, setProfileSelect] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [editProfileImage, setEditProfileImage] = useState(false);
  const [group, setGroup] = useState(false);
  const [boiImages, setBioImage] = useState(false);

  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [newMembers, setNewMembers] = useState([]);

  const mergeUniqueById = (existing = [], incoming = []) => {
    return [...new Map([...existing, ...incoming].map(item => [item?._id, item])).values()];
  };

  const handleDescChange = text => {
    if (text.length <= maxDescLength) {
      setDesc(text);
    } else {
      setDesc(text.slice(0, maxDescLength));
    }
  };

  const handleConfirm = date => {
    setActivity(date);
    setIsDatePickerVisible(false);
  };

  const handleEndActivityConfirm = date => {
    setEndActivity(date);
    setIsDateEndPickerVisible(false);
  };

  const handleTimeConfirm = time => {
    setStartTime(time);
    setIsTimePickerVisible(false);
  };

  const handleEndTimeConfirm = time => {
    setEndTime(time);
    setIsEndTimePickerVisible(false);
  };

  useEffect(() => {
    getAdminDetail();

    return () => {
      setLocation('');
      SetItem('Adddressdata', '');
    };
  }, []);

  useEffect(() => {
    getAllchats(1);
    // getAllchats closes over paging/list state; keep this trigger on search only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(update_statusbarcolor(c.primary));

      var getad = GetItem('Adddressdata');
      // console.log("GET-DETAIL==>", getad)

      if (getad?.formatted_address) {
        setLocation(getad?.formatted_address);
      }
    }, [dispatch]),
  );

  useEffect(() => {
    var getad = GetItem('Adddressdata');
    console.log('GET-DETAIL==>', getad);
    setLocation(getad?.formatted_address);
    let editData = props?.route?.params?.edit;

    // dispatch(update_EventFilterHoobies([]));

    dispatch(update_filterBySearch({ activeTab: 'EventCreation' }));
    preloadGroupFilterPage();

    const index = Math.floor(Math.random() * profileImagePath.length);
    if (!editData) {
      setGroupIndex(index);
      setIsHideEvent(false);
    }

    if (editData && !hasActiveSubscription(profile)) {
      setIsPremiumModalVisible(true);
    }

    if (editData) {
      const local = editData?.eventhobbies?.map(data => {
        return {
          _id: data?._id,
          hobbyName: data?.hobbyname,
        };
      });

      // console.log("EditEventhobbies==>", local)

      dispatch(update_EventFilterHoobies(local));

      let intrestedMembers = editData?.eventinterested?.map(
        data => data?.userId?._id,
      );
      setSelectedMembers(intrestedMembers);
      setEditMem(intrestedMembers);

      setEditData(props?.route?.params?.edit);
      setTitle(editData?.eventTitle);
      setLocation(editData?.eventAddress);
      setDesc(editData?.description);
      setCoordinates(editData?.location?.coordinates);
      setIsPublic(editData?.privacy_status == 'public' ? true : false);
      setIsPrivate(editData?.privacy_status == 'private' ? true : false);
      setIsHideEvent(readEventHideFlag(editData?.ishideInEvent));

      setActivity(
        editData?.startDate && !isNaN(new Date(editData.startDate))
          ? new Date(editData.startDate)
          : new Date(),
      );
      setEndActivity(
        editData?.endDate && !isNaN(new Date(editData.endDate))
          ? new Date(editData.endDate)
          : new Date(),
      );
      setStartTime(
        editData?.startDate && !isNaN(new Date(editData.startDate))
          ? new Date(editData.startDate)
          : new Date(),
      );
      setEndTime(
        editData?.endDate && !isNaN(new Date(editData.endDate))
          ? new Date(editData.endDate)
          : new Date(),
      );
      setEditId(editData?._id);
      var eventiamges = editData?.image?.map(e => ({
        uri: `${Imageroute.eventProfile}` + e,
      }));

      setProfileImages(eventiamges);

      if (editData?.eventprofile) {
        setProfileImage(`${Imageurl}${editData?.eventprofile}`);
      }

      setGroupIndex(editData?.eventRandomIndex);

      setEditImage(editData?.eventProfile);
    }

    // return (() => {
    //   dispatch(update_EventFilterHoobies([]));
    // })
  }, [props?.route?.params?.edit, dispatch]);

  useEffect(() => {
    const editData = props?.route?.params?.edit;
    if (!editData?.eventinterested?.length) {
      setGroupMembers([]);
      return;
    }
    const groupMember = editData.eventinterested
      .filter(data => data?.userId?._id != profile?._id)
      .map(data => data?.userId);
    setGroupMembers(groupMember || []);
  }, [props?.route?.params?.edit, profile?._id]);

  useEffect(() => {
    const edit = props?.route?.params?.edit;
    const eventId = edit?._id;
    if (!eventId) {
      hideServerSyncedForEventRef.current = null;
      lastHideFetchEventIdRef.current = null;
      return;
    }
    if (lastHideFetchEventIdRef.current !== eventId) {
      hideServerSyncedForEventRef.current = null;
      lastHideFetchEventIdRef.current = eventId;
    }
    if (hideServerSyncedForEventRef.current === eventId) {
      return;
    }
    const uid = GetItem('UserId') || profile?._id;
    if (!uid) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await EventDetails({ userId: uid, eventId });
        if (cancelled || !result?.status || !result?.data?.[0]) {
          return;
        }
        const row = result.data[0];
        hideServerSyncedForEventRef.current = eventId;
        setIsHideEvent(readEventHideFlag(row?.ishideInEvent));
      } catch (e) {
        console.log('EventCreation EventDetails', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props?.route?.params?.edit?._id, userID, profile?._id]);

  console.log('props?.route?.params?.edit==>', props?.route?.params?.edit);

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
      if (response.assets.length > adminDetails?.eventImage_limit) {
        showwarningmessage(t('Accept_limited_images_only'));
      }

      setGroupImagesEdited(true);

      const length = adminDetails?.eventImage_limit - profileImages?.length;
      setProfileImages(prevImages => [
        ...prevImages,
        ...response?.assets?.slice(0, length),
      ]);
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

  // const handleSelectImage = (source, callback) => {
  //   bottomSheetRef.current.close();

  //   const options = {
  //     mediaType: 'photo',
  //     quality: 1,
  //     selectionLimit: adminDetails?.eventImage_limit - profileImages?.length,
  //   };

  //   if (source === 'library') {
  //     launchImageLibrary(options, callback);
  //   } else if (source === 'camera') {
  //     launchCamera(options, callback);
  //   }

  //   setIsBottomSheetVisible(false);
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

  const today = new Date();
  const formattedStartDate =
    startActivity instanceof Date &&
    !isNaN(startActivity) &&
    startActivity >= today
      ? new Date(startActivity).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })
      : new Date(today).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        });

  const formattedEndDate =
    endActivity instanceof Date && !isNaN(endActivity) && endActivity >= today
      ? new Date(endActivity).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })
      : new Date(today).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        });

  // const formattedStartTime =
  //   startTime instanceof Date && !isNaN(startTime)
  //     ? startTime.toLocaleTimeString().toUpperCase()
  //     : '';

  const formattedStartTime =
    startTime instanceof Date && !isNaN(startTime)
      ? startTime
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          .toUpperCase()
      : '';

  // const formattedEndTime =
  //   endTime instanceof Date && !isNaN(endTime)
  //     ? endTime.toLocaleTimeString().toUpperCase()
  //     : '';

  const formattedEndTime =
    endTime instanceof Date && !isNaN(endTime)
      ? endTime
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          .toUpperCase()
      : '';

  const openImageSlider = index => {
    setCurrentImageIndex(index);
    setIsModalVisible(true);
    setChangrIndex(index);
  };

  const imagesForViewer = profileImages.map(uri => ({ url: uri?.uri }));
  var Delete = [];

  const [deleteArr, setDeleteArr] = useState([]);
  const handleDeleteImage = index => {
    // setDeleteArr((prev) => [...prev, profileImages[index]?.uri?.split('/')?.pop()])

    setDeleteArr(prev => [
      ...prev,
      profileImages[index]?.uri?.split('.net')?.pop(),
    ]);

    setCurrentImageIndex(0);
    //setGroupImagesEdited(true);

    setProfileImages([
      ...profileImages.slice(0, index),
      ...profileImages.slice(index + 1, profileImages?.length),
    ]);

    setIsModalVisible(false);
  };

  const handleaddevent = async () => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      let privacyStatus = '';
      if (isPrivate) {
        privacyStatus = 'private';
      } else {
        privacyStatus = 'public';
      }

      if (!title) {
        showwarningmessage(t('Please_enter_event_name'));
      } else if (!location) {
        showwarningmessage(t('Please_select_your_location'));
      } else if (!desc) {
        showwarningmessage(t('Please_enter_description'));
      } else if (!startActivity) {
        showwarningmessage(t('Please_start_activity_date'));
      } else if (!endActivity) {
        showwarningmessage(t('Please_select_end_activity_date'));
      } else if (!startTime) {
        showwarningmessage(t('Please_select_activityend_time'));
      } else if (!endTime) {
        showwarningmessage(t('Please_add_end_time'));
      } else if (!privacyStatus) {
        showwarningmessage(t('Please_enable_privacy_status'));
      } else if (eventFilterHoobies?.length <= 0) {
        showwarningmessage(t('HobbiesRequired'));
      } else {
        var getad = GetItem('Adddressdata');
        const startDate = DateTimeMerge(startActivity, startTime);
        const endDate = DateTimeMerge(endActivity, endTime);

        const selectedIds = eventFilterHoobies?.map(data => data?._id);

        const sendData = {
          userId: userID,
          eventTitle: title,
          startDate: startDate,
          endDate: endDate,
          description: desc,
          eventAddress: location,
          privacy_status: privacyStatus,
          ishideInEvent: isHideEvent,
          eventhobbies: JSON.stringify(selectedIds),
          eventRandomIndex: groupIndex,
        };

        // Handling latitude and longitude based on conditions
        if (getad?.lat && getad?.long) {
          sendData.latitude = getad.lat;
          sendData.longitude = getad.long;
        } else if (editId) {
          sendData.latitude = coordinates[0];
          sendData.longitude = coordinates[1];
        }

        let membersList = [];
        let imageList;

        // If editing, add event ID and delete data
        if (editId) {
          sendData.eventId = editId;
          imageList = [...deleteArr];
          sendData.Delete = JSON.stringify(imageList);

          membersList = Array.isArray(selectedMembers)
            ? selectedMembers.filter(id => typeof id === 'string')
            : [];

          sendData.inviteMembers = JSON.stringify(membersList);

          sendData.newMembers = JSON.stringify(newMembers);
        } else {
          membersList = groupMembers?.map(data => data?._id);
          // let all_member = [profile?._id, ...membersList];
          sendData.inviteMembers = JSON.stringify(membersList);
        }

        if (editProfileImage && profileImage != null) {
          sendData.eventProfile = [
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
          sendData.eventProfile = editImage;
        }
        const filterNewImages = profileImages?.filter(e => e?.fileName) || [];
        const existingEditImages = props?.route?.params?.edit?.image;

        if (!editId && filterNewImages.length === 0) {
          showwarningmessage(t('GroupIMGRequired'));
          setLoading(false);
          return;
        }

        if (filterNewImages.length > 0) {
          sendData.image = filterNewImages.map(item => ({
            uri:
              Platform.OS === 'android'
                ? item?.uri
                : item?.uri?.replace('file://', ''),
            type: item?.type === 'image/jpg' ? 'image/jpeg' : item?.type,
            name: item?.fileName,
          }));
        } else if (editId && existingEditImages?.length) {
          sendData.image = JSON.stringify(existingEditImages);
        }

        Keyboard.dismiss();

        if (editId) {
          if (profileImages?.length === 0) {
            ShowToast(t('GroupIMGRequired'));
            setLoading(false);
            return;
          }
          var result = await eventeditapi(sendData);
        } else {
          var result = await addneweventapi(sendData);
        }

        if (result?.status) {
          showwarningmessage(result?.message);

          RemoveItem('Adddressdata');
          navigation.navigate('EventList');
          setEditData({});
          setTitle('');
          setLocation('');
          setDesc('');
          setCoordinates([]);
          setIsPublic(false);
          setIsPrivate(false);
          setProfileImages([]);
          setGroupImagesEdited(false);
        } else {
          showwarningmessage(result?.message);
        }
      }
    } catch (err) {
      // showwarningmessage(err?.message);
      console.log('Error on handleaddEvent:', err);
    } finally {
      setLoading(false);
      setNewMembers([]);
    }
  };

  const handlePrivateSwitch = () => {
    setIsPrivate(!isPrivate);
    if (!isPrivate) setIsPublic(false);
  };

  const handleClose = () => {
    setEditData({});
    setTitle('');
    setLocation('');
    setDesc('');
    setCoordinates([]);
    setIsPublic(false);
    setIsPrivate(false);
    setProfileImages([]);
    setGroupImagesEdited(false);
    navigation.goBack();
    RemoveItem('Adddressdata');
  };

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

  const handleDraftMemberSelect = member => {
    const isSelected = draftSelectedMembers?.includes(member?._id);
    const prevMember = editMemb?.includes(member?._id);

    // Don't allow toggling "existing" members while editing
    if (prevMember) {
      return;
    }

    if (isSelected) {
      setDraftNewMembers(prevSelected =>
        prevSelected.filter(id => id !== member?._id),
      );
      setDraftSelectedMembers(prevSelected =>
        prevSelected.filter(id => id !== member?._id),
      );
      setDraftGroupMembers(prevGroup =>
        prevGroup.filter(m => m._id !== member._id),
      );
    } else {
      setDraftNewMembers(prevSelected =>
        prevSelected.includes(member?._id)
          ? prevSelected
          : [...prevSelected, member?._id],
      );
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

  const handleProfileImageResponse = response => {
    if (response.didCancel) {
    } else if (response.errorMessage) {
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0].uri;
      setProfileImage(selectedImage);
      setProfiledata(response.assets[0]);
    }
  };

  const handleGroupmember = async () => {
    // Snapshot current scroll position before opening picker
    previousScrollYRef.current = currentScrollYRef.current;
    // Initialize draft selection from committed state
    setDraftSelectedMembers(selectedMembers);
    setDraftGroupMembers(groupMembers);
    setDraftNewMembers(newMembers);
    setGroup(!group);

    // Prevent the underlying page from briefly snapping to top
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(previousScrollYRef.current, 0),
        animated: false,
      });
    });
  };

  const handleMemberSearchFocus = () => {
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
    setDraftNewMembers(newMembers);

    // Restore original scroll position (avoid jumping to top)
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(previousScrollYRef.current, 0),
        animated: false,
      });
    });
  }, [groupMembers, newMembers, selectedMembers]);

  const confirmMemberPicker = useCallback(() => {
    setSelectedMembers(draftSelectedMembers);
    setGroupMembers(draftGroupMembers);
    setNewMembers(draftNewMembers);
    closeMemberPicker();
  }, [
    closeMemberPicker,
    draftGroupMembers,
    draftNewMembers,
    draftSelectedMembers,
  ]);

  const handleCreateEventFunction = () => {
    if (hasActiveSubscription(profile)) {
      handleaddevent();
    } else {
      setIsPremiumModalVisible(true);
    }
  };

  const handleNaigatePremium = async () => {
    setIsPremiumModalVisible(false);
    navigation.navigate('Premium');
  };

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

  return (
    <View style={styles.container}>
      <LinearGradient
        style={{ width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']}
      >
        <KeyboardAvoidingView
          onStartShouldSetResponder={() => Keyboard.dismiss()}
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled
        >
          <View
            onStartShouldSetResponder={() => Keyboard.dismiss()}
            style={styles.boxcontainer}
          >
            {/* <View style={styles.topcontainer}>
              <Pressable style={{ padding: "1.5%", backgroundColor: c.intermediate, width: "23%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center" }} onPress={handleClose}>
                <Text style={styles.canceltxt}>{t('Cancel')}</Text>

              </Pressable>
              <Pressable
                style={{ padding: "1.5%", backgroundColor: c.secondary, width: "23%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center" }}
                onPress={handleaddevent}>
                <Text style={styles.savetxt}>{t('Submit')}</Text>
              </Pressable>

            </View> */}

            {/* <View style={styles.backcontainer}>
              <View style={{ width: "100%", alignSelf: "center", flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>

                <Pressable onPress={() => {
                  dispatch(update_GroupFilterHoobies([]));
                  navigation.goBack()
                }} style={styles.roundbox}>
                  {Images.back}
                </Pressable>

                {editId ?
                  <Text style={styles.headertxt}>{t('Edit_Event')}</Text>
                  :
                  <Text style={styles.headertxt}>{t('Create_Event')}</Text>
                }
              </View>
            </View> */}
            <Commonheader
              onback={() => {
                dispatch(update_GroupFilterHoobies([]));
                navigation.goBack();
              }}
              title={editId ? t('Edit_Event') : t('Create_Event')}
            />

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
              <View
                style={{ width: '100%', height: '92%', marginBottom: '8%' }}
              >
                {/* <View style={{ width: "90%", alignSelf: "center", marginTop: 10 }}>
                  {editId ?
                    <Text style={styles.title}>{t('Edit_Event')}</Text>
                    :
                    <Text style={styles.title}>{t('Create_Event')}</Text>
                  }
                </View> */}

                {/* Match Create Group: 90% column + centered profile circle */}
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
                </View>

                <View style={styles.inputsec}>
                  <View style={{ marginBottom: '2%' }}>
                    <Text style={styles.inputpara}>{t('Event_Name')}</Text>
                  </View>
                  <View style={styles.inputcontainer}>
                    <TextInput
                      placeholderTextColor={'#F7E5D0'}
                      // placeholder={t('Enter_title')}
                      style={styles.inputtxtstyle}
                      value={title}
                      onChangeText={setTitle}
                      keyboardType="default"
                    />
                  </View>
                </View>
                <View style={styles.inputsec}>
                  <View style={{ marginBottom: '2%' }}>
                    <Text style={styles.inputpara}>{t('Location')}</Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      isOnline &&
                      navigation.navigate('LocationHome', {
                        from: 'EventCreation',
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

                <View style={styles.inputsec}>
                  <View style={{ marginBottom: '2%' }}>
                    <Text style={styles.inputpara}>{t('Description')}</Text>
                  </View>
                  <View style={{ width: '100%', marginBottom: '4%' }}>
                    <Pressable style={styles.desccontainer}>
                      <TextInput
                        placeholderTextColor={'#F7E5D0'}
                        style={styles.inputtxtstyle}
                        value={desc}
                        onChangeText={handleDescChange}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </Pressable>
                    <Pressable
                      style={{
                        position: 'absolute',
                        bottom: '3%',
                        alignSelf: 'center',
                        right: '3%',
                      }}
                    >
                      <Text style={styles.descnotxt}>
                        {desc?.length}/{maxDescLength}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: '90%',
                      alignSelf: 'center',
                      marginTop: '3%',
                    }}
                  >
                    <View>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View style={{ width: '80%' }}>
                          <Text
                            style={{
                              fontFamily: Fonts.SemiBold,
                              color: c.white,
                              fontSize: RFValue(16),
                              flex: 1,
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
                            {t('This_event_will_searches_hobbies')}
                          </Text>
                        </View>
                        <Pressable
                          style={{ width: '20%' }}
                          onPress={() => {
                            navigateToFilterSheet(navigation, 'GroupfilterPage', {
                              page: 'event',
                            });
                          }}
                        >
                          {isGroupFilter ? (
                            <ActivityIndicator
                              style={{ alignSelf: 'center' }}
                              color={c?.white}
                              size={'small'}
                            />
                          ) : (
                            <View style={styles.organizerbtn}>
                              <Icons
                                name="plus"
                                size={deviceheight * 0.018}
                                color={c.white}
                              />
                            </View>
                          )}
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
                        {eventFilterHoobies?.map((interest, index) => {
                          // Find the hobby object from categories or wherever the full list is stored
                          // const hobby = hobbieList?.flatMap(category => category?.subcategory)
                          //   .flatMap(subcategory => subcategory?.Hobbies)
                          //   .find(hobby => hobby?._id === interest);

                          // const subcate = hobbieList?.flatMap(category => category?.subcategory)
                          //   .find(hobby => hobby?._id === interest);
                          return (
                            <Pressable key={index} style={styles.addcontainer}>
                              <Text
                                style={{
                                  fontSize: RFValue(12.5),
                                  color: c.secondary,
                                  fontFamily: Fonts.Medium,
                                  textAlign: 'center',
                                }}
                              >
                                {interest?.hobbyName}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.inputsec}>
                  <View style={{ marginBottom: '2%' }}>
                    <Text style={styles.inputpara}>{t('Image_Upload')}</Text>
                  </View>
                  <View
                    style={{
                      width: '100%',
                      marginBottom: '4%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    {/* <Pressable onPress={() => profileImages?.length < adminDetails?.eventImage_limit ? openImagePicker("bio") : showwarningmessage("You have reached the maximum limit")} style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: deviceheight * 0.0660,
                      paddingHorizontal: "3%",
                      borderRadius: borderradius * 0.3,
                      alignItems: "center",
                      flexDirection: "row",
                      borderColor: c.white,
                      borderWidth: 0.9,

                    }}>
                      <View style={{ justifyContent: "center" }}>

                        <Text style={{
                          fontSize: RFValue(12),
                          fontFamily: Fonts.Regular,
                          color: c.white,

                        }}>{t('Upload_Image')}</Text>
                      </View>
                      <View style={{}} >
                        {Images.upload}
                      </View>
                    </Pressable> */}

                    <ScrollView contentContainerStyle={styles.imageGrid}>
                      {profileImages.slice(0, 4).map((imageUri, index) => (
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
                            : showwarningmessage(
                                t('You_have_reached_maximum_limit'),
                              )
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
                </View>
                <View style={styles.dobinputsec}>
                  <View style={{ width: '45%' }}>
                    <View style={{ marginBottom: '2%' }}>
                      <Text style={styles.inputpara}>{t('Start_Date')}</Text>
                    </View>
                    <Pressable
                      onPress={() => setIsDatePickerVisible(true)}
                      style={{
                        width: '100%',
                        height: deviceheight * 0.06,
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <View style={[styles.dobcontainer]}>
                          <Text style={styles.inputtxtstyle1}>
                            {formattedStartDate}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',
                            right: '3%',
                            alignSelf: 'center',
                          }}
                        >
                          {Images.date}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                  <View style={{ width: '45%' }}>
                    <View style={{ marginBottom: '2%' }}>
                      <Text style={styles.inputpara}>{t('End_Date')}</Text>
                    </View>
                    <Pressable
                      onPress={() => setIsDateEndPickerVisible(true)}
                      style={{
                        width: '100%',
                        height: deviceheight * 0.06,
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <View style={styles.dobcontainer}>
                          <Text style={styles.inputtxtstyle1}>
                            {formattedEndDate}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',
                            right: '3%',
                            alignSelf: 'center',
                          }}
                        >
                          {Images.date}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.dobinputsec}>
                  <View style={{ width: '45%' }}>
                    <View style={{ marginBottom: '2%' }}>
                      <Text style={styles.inputpara}>{t('Start_Time')}</Text>
                    </View>
                    <Pressable
                      onPress={() => setIsTimePickerVisible(true)}
                      style={{
                        width: '100%',
                        height: deviceheight * 0.06,
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <View style={[styles.dobcontainer]}>
                          <Text style={styles.inputtxtstyle1}>
                            {formattedStartTime}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',
                            right: '3%',
                            alignSelf: 'center',
                          }}
                        >
                          {Images.clock}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                  <View style={{ width: '45%' }}>
                    <View style={{ marginBottom: '2%' }}>
                      <Text style={styles.inputpara}>{t('End_Time')}</Text>
                    </View>
                    <Pressable
                      onPress={() => setIsEndTimePickerVisible(true)}
                      style={{
                        width: '100%',
                        height: deviceheight * 0.06,
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <View style={styles.dobcontainer}>
                          <Text style={styles.inputtxtstyle1}>
                            {formattedEndTime}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',
                            right: '3%',
                            alignSelf: 'center',
                          }}
                        >
                          {Images.clock}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '4%',
                  }}
                >
                  <View style={{ width: '85%' }}>
                    <Text style={styles.inputpara}>{t('Private_Event')}</Text>
                    <Text style={styles.activitysubtxt}>
                      {t('Create_Event_Text')}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '15%',
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <SwitchToggle
                      switchOn={isPrivate}
                      onPress={handlePrivateSwitch}
                      circleColorOff="#911687"
                      circleColorOn="#911687"
                      backgroundColorOn="#F8BE2D"
                      backgroundColorOff="#F87FBF"
                      containerStyle={{
                        width: devicewidth * 0.16,
                        height: devicewidth * 0.075,
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
                </View>
                <View
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '4%',
                  }}
                >
                  <View style={{ width: '85%' }}>
                    <Text style={styles.inputpara}>{t('Hide_Event')}</Text>
                    <Text style={styles.activitysubtxt}>
                      {t('Hide_Event_Text')}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '15%',
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <SwitchToggle
                      switchOn={isHideEvent}
                      onPress={() => setIsHideEvent(prev => !prev)}
                      circleColorOff="#911687"
                      circleColorOn="#911687"
                      backgroundColorOn="#F8BE2D"
                      backgroundColorOff="#F87FBF"
                      containerStyle={{
                        width: devicewidth * 0.16,
                        height: devicewidth * 0.075,
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
                </View>

                {/* invited members */}
                <Text style={styles.addMembers}>{t('Members')}:</Text>
                <View style={styles.imageContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, alignContent: 'center' }}
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

                    {(groupMembers || [])
                      .filter(member => member?.blockStatus == 'unblocked')
                      .map(member => (
                        <View key={member?._id || member?.id} style={styles.imageWrapper}>
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
                                      source={randomimages[member?.randomIndex]}
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
                      ))}
                  </ScrollView>
                </View>
                {/* Member picker moved to a keyboard-safe modal */}

              </View>
            </ScrollView>
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
                            member?.blockStatus == 'unblocked' && (
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
                                      style={styles.groupprofileImage}
                                      source={randomimages[member?.randomIndex]}
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
                          onFocus={handleMemberSearchFocus}
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
                                    ? showwarningmessage(t('UserBlocked_byAdmin'))
                                    : handleDraftMemberSelect(member);
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: '4%',
                                }}
                              >
                                <View style={{ position: 'relative' }}>
                                  {member?.profile ? (
                                    <Image
                                      source={{
                                        uri: `${Imageurl}${member?.profile}`,
                                      }}
                                      style={styles.profileImage}
                                    />
                                  ) : (
                                    <Image
                                      style={styles.profileImage}
                                      source={randomimages[member?.randomIndex]}
                                      resizeMode="cover"
                                    />
                                  )}
                                  {draftSelectedMembers?.includes(member?._id) && (
                                    <View style={styles.tickbox}>{Images.tick1}</View>
                                  )}
                                </View>
                                <View style={{ marginLeft: '3%' }}>
                                  <Text style={styles.nametxt}>
                                    {member?.username}
                                  </Text>
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
              <View style={{ marginVertical: 10, padding: '1.5%' }}>
                {/* <Pressable
                style={{ padding: "1.5%", backgroundColor: c.secondary, width: "23%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center" }}
                onPress={handleaddevent}>
                <Text style={styles.savetxt}>{t('Submit')}</Text>
              </Pressable> */}
                {loading ? (
                  <Pressable
                    style={{
                      width: '50%',
                      borderRadius: borderradius * 1.5,
                      backgroundColor: c.white,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: c.white,
                      padding: '3%',
                      alignSelf: 'center',
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color={c.secondary}
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
        </KeyboardAvoidingView>
      </LinearGradient>

      <AlertPopup
        visible={isPremiumModalVisible}
        title={t('Note')}
        onSubmit={() => handleNaigatePremium()}
        onClose={() => setIsPremiumModalVisible(false)}
      >
        <Text>{t('This is a Premium Feature, You want to subscribe ?')}</Text>
      </AlertPopup>

      {imagesForViewer?.length > 0 && (
        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setIsPremiumModalVisible(false)}
        >
          {imagesForViewer?.length > 1 ? (
            <ImageViewer
              imageUrls={imagesForViewer}
              index={currentImageIndex}
              enableSwipeDown={true}
              onChange={index => setChangrIndex(index)}
              style={{ width: '100%', height: '100%' }}
              onSwipeDown={() => setIsModalVisible(false)}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
            />
          ) : (
            <ImageViewer
              imageUrls={imagesForViewer}
              index={currentImageIndex}
              enableSwipeDown={true}
              onChange={index => setChangrIndex(index)}
              style={{ width: '100%', height: '100%' }}
              onSwipeDown={() => setIsModalVisible(false)}
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
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
              onPress={() => setIsModalVisible(false)}
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
                      ? handleProfileImageResponse
                      : handleImageResponse,
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
                      ? handleProfileImageResponse
                      : handleImageResponse,
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
            </View>
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>

      <DatePicker
        modal
        open={isDatePickerVisible}
        date={startActivity}
        mode="date"
        locale="en-GB"
        onConfirm={handleConfirm}
        onCancel={() => setIsDatePickerVisible(false)}
        style={styles.datePicker}
      />

      <DatePicker
        modal
        open={isDateEndPickerVisible}
        date={endActivity}
        mode="date"
        locale="en-GB"
        onConfirm={handleEndActivityConfirm}
        onCancel={() => setIsDateEndPickerVisible(false)}
        style={styles.datePicker}
      />
      <DatePicker
        modal
        open={isTimePickerVisible}
        date={startTime}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setIsTimePickerVisible(false)}
        style={styles.datePicker}
      />
      <DatePicker
        modal
        open={isEndTimePickerVisible}
        date={endTime}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setIsEndTimePickerVisible(false)}
        style={styles.datePicker}
      />
    </View>
  );
};

export default EventCreation;

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
  addMembers: {
    fontFamily: Fonts.ExtraBold,
    color: c.white,
    fontSize: RFValue(16),
    marginTop: '3%',
    marginHorizontal: '5%',
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
    width: '90%',
    fontFamily: Fonts.ExtraBold,
    color: c.white,
    fontSize: RFValue(19),
    textAlign: 'center',
    alignContent: 'center',
  },

  title: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(20),
  },

  subtitle: {
    fontFamily: Fonts.Regular,
    color: c.white,
    fontSize: RFValue(15),
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  inputpara: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },

  topcontainer: {
    width: '90%',
    alignSelf: 'center',
    height: '8%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '2%',
  },

  organizerbtn: {
    width: '50%',
    borderRadius: borderradius * 0.3,
    height: deviceheight * 0.036,
    borderColor: c.white,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  bottomtxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },

  profilebox: {
    width: devicewidth * 0.24,
    height: devicewidth * 0.24,
    borderRadius: (devicewidth * 0.15) / 1.3,
    backgroundColor: c.primary,
  },

  inputsec: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '3%',
  },

  inputcontainer: {
    width: '100%',
    height: deviceheight * 0.066,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    borderWidth: 0.9,
  },
  inputtxtstyle: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    paddingLeft: 10,
    color: c.white,
    width: '100%',
    height: '100%',
  },
  inputtxtstyle1: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    width: '100%',
  },
  dobcontainer: {
    width: '100%',
    alignItems: 'center',
    height: deviceheight * 0.055,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.3,
    borderColor: c.white,
    borderWidth: 0.9,
    justifyContent: 'center',
  },

  // Custom styles for the date picker
  datePicker: {
    backgroundColor: c.primary,
    borderRadius: borderradius * 0.5,
  },

  canceltxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(14),
  },
  savetxt: {
    fontFamily: Fonts.Medium,
    color: c.secondary,
    fontSize: RFValue(14),
  },
  locationcontainer: {
    width: '100%',
    justifyContent: 'space-between',
    height: deviceheight * 0.066,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.3,
    alignItems: 'center',
    borderColor: c.white,
    borderWidth: 0.9,
  },
  desccontainer: {
    width: '100%',
    height: deviceheight * 0.25,
    paddingHorizontal: '3%',
    paddingVertical: '4%',
    borderRadius: borderradius * 0.3,
    alignItems: 'center',
    borderColor: c.white,
    borderWidth: 0.9,
  },
  descnotxt: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue(11),
    color: '#DEDEDE',
  },
  dobinputsec: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activitysubtxt: {
    fontSize: RFValue(11),
    fontFamily: Fonts.Regular,
    color: '#DEDEDE',
  },
  selectedImageName: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    marginTop: 5,
    backgroundColor: 'red',
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
    color: c.white,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
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
  deleteButton: {
    marginTop: '8%',
    right: '8%',

    padding: '1.8%',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: RFValue(13),
    fontFamily: Fonts.Medium,
  },
  inputpara1: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(18),
  },
  addcontainer: {
    paddingHorizontal: '3%',
    paddingVertical: '2.5%',
    borderRadius: borderradius * 1.5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    alignSelf: 'center',
    flexDirection: 'row',
    marginBottom: '4%',
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

  //invited members
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
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

  nametxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(17),
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

  imageContainer: {
    width: '100%',
    marginHorizontal: '5%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '3%',
    marginRight: '12%',
  },
  groupprofileImage: {
    width: devicewidth * 0.13,
    height: devicewidth * 0.13,
    borderRadius: borderradius * 5,
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
  dashbox: {
    width: devicewidth * 0.13,
    height: devicewidth * 0.13,
    borderRadius: borderradius * 1.7,
    borderColor: c.white,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1%',
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
  profileImage1: {
    width: '100%',
    height: '100%',
    borderRadius: (deviceheight * 0.15) / 2,
  },
});
