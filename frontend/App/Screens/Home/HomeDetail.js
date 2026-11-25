import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
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
import { Images } from '../../Utilities/images';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import {
  helperSelector,
  update_FetchChat,
  update_FetchProfileId,
  update_followingsDetails,
  update_MyPeople,
  update_NetworkVisible,
  update_NotificationRender,
  update_statusbarcolor,
} from '../../Slices/helper';
import {
  PersonalDetails,
  PrivateUserAccFollow,
  UpdateGroupMembers,
  UserBlockandUnblock,
  UserFollowBack,
  UserProfilelike,
  UserUnFollow,
  UserUnlikeprofile,
  callAddRequestHobby,
  createUpdateGroupMembers,
  otherGroupapi,
  otherJoinEventapi,
  otherJoinGroupapi,
} from '../../Actions/hooks';
import { Imageroute, Imageurl } from '../../Actions/constant';
import { GetItem } from '../../Actions/localstorage';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import ImageViewer from 'react-native-image-zoom-viewer';
import { randomimages } from '../../Utilities/profileImages';

import { useTranslation } from 'react-i18next';
import SwitchToggle from 'react-native-switch-toggle';
import Geolocation from 'react-native-geolocation-service';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import AlertPopup from '../../Components/AlertPopup';

/** Read created/joined lists from eventAndGroupLists API (always normalize to arrays). */
const extractProfileGroupList = (result, key) => {
  if (!result?.status) {
    return [];
  }
  const row = result?.data?.[0];
  const list = row?.[key];
  return Array.isArray(list) ? list : [];
};

const HomeDetail = () => {
  const { t } = useTranslation();

  const { fetchProfileId, myPeople, isOnline } = useSelector(helperSelector);
  const { profile } = useSelector(profileSelector);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [bioMediaVisible, setBioMediaVisible] = useState(false);
  const [staticMediaVisible, setStaticMediaVisible] = useState(false);
  const [imagePrevUrl, setImagePrevUrl] = useState([]);
  const [bioImagePrevUrl, setBioImagePrevUrl] = useState([]);
  const [staticImagePrevUrl, setStaticImagePrevUrl] = useState([]);

  const [profileDetail, setProfileDetail] = useState();
  const [respFollowBack, setRespFollowBack] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [apiType, setApiType] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedEvents, setIsExpandedEvents] = useState(false);
  const [blockUser, setBlockUser] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);
  const [region, setRegion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [gethobbyData, sethobbyData] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { detail, type } = route?.params || {};
  const user_Id = GetItem('UserId');
  const groupsFetchGenRef = useRef(0);
  const profileFetchGenRef = useRef(0);

  /** Route param wins over Redux so groups/profile match the screen we opened. */
  const profileUserId = useMemo(() => {
    const id = detail?._id ?? fetchProfileId;
    return id != null && id !== '' ? String(id) : '';
  }, [detail?._id, fetchProfileId]);

  const isOwnProfile = profileUserId !== '' && profileUserId === String(user_Id);

  const [joinEvent, setJoinEvent] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [joinGrouoList, setJoinGrouoList] = useState([]);

  const [isExpandedJoinEvent, setIsExpandedJoinEvent] = useState(false);
  const [isExpandedGroup, setIsExpandedGroup] = useState(false);
  const [isExpandedJoinGroup, setIsExpandedJoinGroup] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [distanceInKm, setDistanceInKm] = useState(0);

  const isHiddenFromFeed = item => {
    const hideFlags = [
      item?.ishidegroup,
      item?.hide_group,
      item?.hideFromFeeds,
      item?.isHidden,
    ];

    return hideFlags.some(
      flag => flag === true || flag === 'true' || flag === 1 || flag === '1',
    );
  };

  // useEffect(() => {
  //     Getcurrentlocation()

  //     return () => {
  //         if (renderLocation.current) {
  //             clearTimeout(renderLocation.current);
  //         }
  //     }
  // }, [])

  const [location, setLocation] = useState(null);
  const renderLocation = useRef(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const profileDetailRef = useRef(profileDetail);
  profileDetailRef.current = profileDetail;

  useEffect(() => {
    const nextLikes = profile?.LikeData?.likeId;
    setLikeSts(Array.isArray(nextLikes) ? nextLikes : []);
  }, [profile?.LikeData?.likeId, detail?._id]);

  useEffect(() => {
    return () => {
      setProfileDetail(undefined);
      setFollowingSts('');
      setImagePrevUrl([]);
      setBioImagePrevUrl([]);
      setStaticImagePrevUrl([]);
      const viewedId = profileDetailRef.current?._id;
      if (viewedId) {
        dispatch(update_FetchChat(viewedId));
      }
    };
  }, [detail?._id, dispatch]);

  const loadProfileGroupsAndEvents = useCallback(
    async (targetUserId) => {
      if (!targetUserId) {
        return;
      }
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      const generation = ++groupsFetchGenRef.current;
      setJoinEvent([]);
      setGroupList([]);
      setJoinGrouoList([]);

      const basePayload = {
        toUserId: targetUserId,
        fromUserId: user_Id,
      };

      try {
        const [joinEventRes, createGroupRes, joinGroupRes] = await Promise.all([
          otherJoinEventapi({ ...basePayload, type: 'joinEvent' }),
          otherGroupapi({ ...basePayload, type: 'createGroup' }),
          otherJoinGroupapi({ ...basePayload, type: 'joinGroup' }),
        ]);

        if (groupsFetchGenRef.current !== generation) {
          return;
        }

        setJoinEvent(extractProfileGroupList(joinEventRes, 'joinEvents'));
        setGroupList(extractProfileGroupList(createGroupRes, 'createGroup'));
        setJoinGrouoList(extractProfileGroupList(joinGroupRes, 'joinGroups'));
      } catch {
        if (groupsFetchGenRef.current === generation) {
          setJoinEvent([]);
          setGroupList([]);
          setJoinGrouoList([]);
        }
      }
    },
    [dispatch, isOnline, user_Id],
  );

  useEffect(() => {
    groupsFetchGenRef.current += 1;
    setJoinEvent([]);
    setGroupList([]);
    setJoinGrouoList([]);

    if (!profileUserId) {
      return;
    }

    const canLoadGroupsAndEvents =
      isOwnProfile ||
      profileDetail?.privacy_status === 'public' ||
      profileDetail?.followingsDetails?.status === 'completed';

    if (canLoadGroupsAndEvents) {
      loadProfileGroupsAndEvents(profileUserId);
    }
  }, [
    profileUserId,
    isOwnProfile,
    profileDetail?.privacy_status,
    profileDetail?.followingsDetails?.status,
    loadProfileGroupsAndEvents,
  ]);

  // const Getcurrentlocation = async () => {

  //     const hasPermission = await requestLocationPermission();
  //     if (!hasPermission) {
  //         console.log("Location permission not granted");
  //         return;
  //     }

  //     try {

  //         const [longitude, latitude] = profile?.location?.coordinates;

  //         setLocation({ latitude, longitude });

  //         setRegion({
  //             latitude,
  //             longitude,
  //             latitudeDelta: 0.01,
  //             longitudeDelta: 0.01,
  //         });

  //         const addressdata = {
  //             lat: latitude,
  //             long: longitude,
  //             formatted_address: profile?.personalAddress
  //         };

  //         //  dispatch(update_ChangeCurrentLoc(addressdata));

  //         // if (activeTab == "People" || activeTab == "Activities") {
  //         //     dispatch(update_Islocationfilter(true));
  //         // }

  //     } catch (error) {
  //         Alert.alert("Location Error", `Something went wrong: ${error.message || error}`);
  //     } finally {

  //     }
  // };

  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS == 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(permission);

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert(
            t('PermissionDenied'),
            t('Location_access _Please_enable_settings.'),
            [
              {
                text: t('Cancel'),
                style: 'cancel',
              },
              {
                text: t('OpenSettings'),
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }
      } else if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.BLOCKED || result === RESULTS.LIMITED) {
        Alert.alert(
          t('PermissionBlocked'),
          t('Location_access_blocked_Please_enable_settings'),
          [
            {
              text: t('Cancel'),
              style: 'cancel',
            },
            {
              text: t('OpenSettings'),
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return false;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  //  console.log("details==> ", detail)

  const [followingSts, setFollowingSts] = useState();

  const [likeSts, setLikeSts] = useState([]);

  const hobbyIdString = h => {
    if (h == null) return '';
    if (typeof h === 'object' && h._id != null) return String(h._id);
    return String(h);
  };

  const sortedDetailHobbies = useMemo(() => {
    const list = profileDetail?.hobbies;
    if (!Array.isArray(list) || list.length === 0) return [];

    const myIds = new Set(
      (profile?.hobbies || []).map(h => hobbyIdString(h)).filter(Boolean),
    );

    const enriched = list.map(h => {
      const id = hobbyIdString(h);
      return { ...h, isMutual: id.length > 0 && myIds.has(id) };
    });

    return [...enriched].sort((a, b) => {
      if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1;
      return (a?.hobbyname || '').localeCompare(b?.hobbyname || '', undefined, {
        sensitivity: 'base',
      });
    });
  }, [profileDetail?.hobbies, profile?.hobbies]);

  const profileAvatarSize = devicewidth * 0.23;

  const PersonalDetailsFunction = useCallback(async (showLoading = true) => {
    const targetId = profileUserId;
    if (!targetId) {
      return;
    }

    try {
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }

      const generation = ++profileFetchGenRef.current;

      const result = await PersonalDetails({
        from: user_Id,
        to: targetId,
      });

      if (profileFetchGenRef.current !== generation) {
        return;
      }

      if (result?.status) {
        setDistanceInKm(result?.distanceInKm);

        if (result?.data.length != 0) {
          const row = result.data[0];
          setProfileDetail(row);
          setRespFollowBack(result?.resposeFollowBack);

          handleImagePreview(row?.profile);

          const blockedUser = (row?.userblocked || []).filter(
            (user) => String(user) === String(user_Id),
          );
          setBlockUser(blockedUser.length > 0);

          const userBlocked = (profileRef.current?.userblocked || []).filter(
            (user) => String(user) === String(targetId),
          );
          setHideDetails(userBlocked.length > 0);

          handleBioImagePreview(row?.bioimage, Imageurl);
          handleStaticImagePreview(row?.randomIndex);

          setFollowingSts(row?.followingsDetails ? row.followingsDetails : null);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, isOnline, profileUserId, user_Id]);

  const personalDetailsRef = useRef(PersonalDetailsFunction);
  personalDetailsRef.current = PersonalDetailsFunction;

  useFocusEffect(
    React.useCallback(() => {
      dispatch(update_statusbarcolor(c.primary));
      dispatch(Fetchprofile(user_Id));

      if (
        detail?._id &&
        String(detail._id) !== String(fetchProfileId ?? '')
      ) {
        dispatch(update_FetchProfileId(detail._id));
      }

      personalDetailsRef.current(true);
    }, [detail?._id, dispatch, fetchProfileId, user_Id]),
  );

  // const coords = profileDetail?.location?.coordinates;
  // const parsed = JSON.parse(coords); // turns it into [78.1197754, 9.9252007]
  // const [longitude, latitude] = coordinates;

  // console.log("profileDetail==>", coords)

  // const destination = {
  //     latitude: profileDetail?.location?.coordinates[1],    // Example: Mumbai
  //     longitude: profileDetail?.location?.coordinates[0],
  // };

  // const dist = haversine(location, destination, { unit: 'km' });
  // console.log("Distance:", dist);

  const sendMessageTo = async () => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    if (apiCalled) {
      ShowToast(t('Inprogress,Wait_for_some_time'));
      return;
    }
    setApiCalled(true);

    try {
      let memb = [user_Id, detail?._id];
      let payload = {
        userId: user_Id,
        isGroupchat: false,
        members: JSON.stringify(memb),
        chatName: profileDetail?.username,
        isPrivate: false,
        hide_group: false,
      };

      setApiType(prev => [...prev, 'chat']);

      const result = await UpdateGroupMembers(payload);

      if (result?.statusCode == 200) {
        let passload = {
          _id: result?.data?._id,
          profile: profileDetail?.profile,
          name: profileDetail?.name,
          chatName: profileDetail?.name,
          username: profileDetail?.name,
          members: [
            {
              _id: profileDetail?._id,
              name: profileDetail?.name,
              username: profileDetail?.username,
              MychatDiscription: profileDetail?.MychatDiscription,
              online_status: false,
              randomIndex: profileDetail?.randomIndex,
              userblocked: profileDetail?.userblocked,
              profile: profileDetail?.profile,
            },
            {
              _id: profile?._id,
              name: profile?.name,
              username: profile?.username,
              MychatDiscription: profile?.MychatDiscription,
              online_status: false,
              randomIndex: profile?.randomIndex,
              userblocked: profile?.userblocked,
              profile: profile?.profile,
            },
          ],
          randomIndex: profileDetail?.randomIndex,
          ImagePath: '/PersonalProfile/',
          isGroupchat: false,
        };

        // navigation.push("ChatGroup", { detil: passload })
        navigation.navigate('ChatGroup', { detil: passload });
      } else {
        ShowToast(result?.message);
        console.log('Request_sendMessageTo: ', result?.message);
      }
    } catch (error) {
      console.log('Error on sendMessageTo: ', error);
    } finally {
      setApiCalled(false);
      setApiType(prev => prev.filter(data => data != 'chat'));
    }
  };

  const handleFollowRequest = async data => {
    try {
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (apiCalled) {
        ShowToast(t('Inprogress,Wait_for_some_time'));
        return;
      }

      let payload = {
        from: user_Id,
        to: detail?._id,
        userId: user_Id,
      };

      if (data == 'followback') {
        payload.Followback = 'completed';
      }

      setApiType(prev => [...prev, 'follow']);
      setApiCalled(true);

      const result = await UserFollowBack(payload);

      console.log('FollowingFrPayload==>', payload);
      console.log('FollowingFrrequest==>', result);

      if (result.status) {
        ShowToast(result?.message);
        PersonalDetailsFunction(false);
        dispatch(update_NotificationRender('followRequest'));
        setFollowingSts(result?.data);
        dispatch(
          update_followingsDetails({
            id: detail?._id,
            newDetails: result?.data,
          }),
        );
        dispatch(Fetchprofile(user_Id));
      }
    } catch (error) {
    } finally {
      setApiType(prev => prev.filter(data => data != 'follow'));
      setApiCalled(false);
    }
  };

  const handleUserUnFollowRequest = async data => {
    try {
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (apiCalled) {
        ShowToast(t('Inprogress,Wait_for_some_time'));
        return;
      }

      let payload = {
        from: user_Id,
        to: detail?._id,
        userId: user_Id,
        request_id: data?._id ? data?._id : followingSts?._id,
        accept: 'unfollowed',
      };
      setApiType(prev => [...prev, 'follow']);
      setApiCalled(true);

      const result = await UserUnFollow(payload);

      if (result.status) {
        PersonalDetailsFunction(false);
        dispatch(update_NotificationRender('unFollowRequest'));
        setFollowingSts(result?.data);
        ShowToast(`${detail?.username} Unfriended`, 'noraml');
        dispatch(
          update_followingsDetails({
            id: detail?._id,
            newDetails: result?.data,
          }),
        );
        dispatch(Fetchprofile(user_Id));

        if (myPeople?.length > 0) {
          let local = myPeople?.filter(mem => {
            return mem?._id != detail?._id;
          });

          dispatch(update_MyPeople(local));
        }
      }
    } catch (error) {
    } finally {
      setApiType(prev => prev.filter(data => data != 'follow'));
      setApiCalled(false);
    }
  };
  const handleImagePreview = async fileName => {
    const path = Imageroute?.PersonalProfile;

    const imageObjects = [
      {
        url: `${path}${fileName}`,
      },
    ];

    // Update the state
    setImagePrevUrl([...imageObjects]);
  };

  const handleBioImagePreview = async (fileName, path) => {
    if (!Array.isArray(fileName) || fileName.length === 0) {
      setBioImagePrevUrl([]);
      return;
    }

    const imageObjects = fileName.map(fileNames => ({
      url: `${path}${fileNames}`,
    }));

    setBioImagePrevUrl(imageObjects);
  };

  const handleStaticImagePreview = async (randomIndex) => {
    const imageObjects = [
      {
        url: '',
        props: {
          source: randomimages[randomIndex ?? profileDetail?.randomIndex],
        },
      },
    ];

    setStaticImagePrevUrl(imageObjects);
  };

  const handleImageView = () => {
    setMediaVisible(true);
    setBioMediaVisible(false);
    setStaticMediaVisible(false);
  };

  const openImageSlider = index => {
    setCurrentImageIndex(index);
    setBioMediaVisible(true);
    setMediaVisible(false);
    setStaticMediaVisible(false);
  };

  const handleBioImageView = () => {
    setBioMediaVisible(true);
    setMediaVisible(false);
    setStaticMediaVisible(false);
  };

  const handleStaticImageView = () => {
    handleStaticImagePreview();
    setStaticMediaVisible(true);
    setMediaVisible(false);
    setBioMediaVisible(false);
  };

  const formatDate = date => {
    const messageDate = new Date(date);
    const day = messageDate.getDate().toString().padStart(2, '0');
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
    const year = messageDate.getFullYear();
    return `${day} ${getMonthName(messageDate.getMonth())} ${year}`;
  };

  const getMonthName = monthIndex => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[monthIndex];
  };

  const transformEventData = async event => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    let payload = {
      _id: event._id,
      userId: profileDetail,
      eventTitle: event.eventTitle,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      image: event.image,
      event_status: event.event_status,
      location: event.location,
      privacy_status: event.privacy_status,
      eventinterested: event.eventinterested.map(user => ({
        userId: user,
        joinstatus: user.joinstatus,
        _id: user.join_id,
      })),
      eventAddress: event?.eventAddress,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    navigation.navigate('ActivityDetail', {
      detail: payload,
      pageFrom: 'Event',
    });
  };

  const transformGroupData = async event => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }
    navigation.navigate('GroupDetails', { detail: event });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEventExpansion = () => {
    setIsExpandedEvents(!isExpandedEvents);
  };

  const toggleJoinEventExpansion = () => {
    setIsExpandedJoinEvent(!isExpandedJoinEvent);
  };

  const toggleGroupExpansion = () => {
    setIsExpandedGroup(!isExpandedGroup);
  };

  const toggleJoinGroupExpansion = () => {
    setIsExpandedJoinGroup(!isExpandedJoinGroup);
  };
  const canViewProfileSections =
    isOwnProfile ||
    profileDetail?.privacy_status === 'public' ||
    profileDetail?.followingsDetails?.status === 'completed';
  const canViewHobbiesSection =
    canViewProfileSections && !profileDetail?.ishidehobbies;
  const canViewEventsAndGroupsSection =
    canViewProfileSections && !profileDetail?.ishideevent;

  const renderGroupSection = ({
    title,
    groups,
    expanded,
    onToggle,
  }) => {
    const visibleGroups = (groups || []).filter(e => !isHiddenFromFeed(e));

    return (
      <View
        style={{
          width: '100%',
          alignSelf: 'center',
          marginTop: '2%',
          alignContent: 'space-between',
        }}
      >
        <Text style={styles.headingtxtbtn}>{title}</Text>

        <View>
          {visibleGroups.length === 0 ? (
            <Text
              style={{
                fontFamily: Fonts.Regular,
                color: c.white,
                fontSize: RFValue(14),
                textAlign: 'center',
                marginTop: '4%',
              }}
            >
              ---
            </Text>
          ) : (
            <>
              {visibleGroups
                .slice(0, expanded ? visibleGroups.length : 3)
                .map((e, index) => (
                  <Pressable
                    key={index}
                    onPress={() => transformGroupData(e)}
                  >
                    <View
                      style={{
                        width: '100%',
                        borderRadius: borderradius * 0.4,
                        paddingHorizontal: '3%',
                        paddingVertical: '4%',
                        marginBottom: '1%',
                        marginTop: '4%',
                        borderColor: '#fff',
                        borderWidth: 0.5,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <View style={{ flex: 0.8 }}>
                          <Text style={styles.eventtitle}>{e?.chatName}</Text>
                        </View>
                        <View
                          style={{
                            flex: 0.2,
                            width: '25%',
                            borderRadius: borderradius * 0.3,
                            height: deviceheight * 0.04,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: c.white,
                            borderStyle: 'solid',
                          }}
                        >
                          <Text style={styles.subeventtitle}>
                            {e?.isPrivate ? 'Private' : 'Public'}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          marginTop: '4%',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '90%',
                        }}
                      >
                        <View
                          style={{
                            flex: 0.9,
                            flexDirection: 'row',
                          }}
                        >
                          <Text style={styles.datetxt}>
                            {e?.groupDiscription}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 0.1,
                            flexDirection: 'row',
                            gap: 5,
                          }}
                        >
                          {Images.groupMemb}
                          <Text style={styles.counttxt}>
                            {e?.members?.length}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}

              {visibleGroups.length > 3 && (
                <TouchableOpacity
                  onPress={onToggle}
                  style={{
                    marginTop: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.SemiBold,
                      color: c.white,
                      fontSize: RFValue(14),
                      textAlign: 'center',
                      marginTop: '4%',
                    }}
                  >
                    {expanded ? t('View_Less') : t('View_More')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const handleShowAllUser = async () => {
    if (!isOnline) {
      dispatch(update_NetworkVisible(true));
      return;
    }

    let payload = profileDetail?.Mutualfriends;

    navigation.navigate('PeopleAudience', {
      type: 'ShowAll',
      userData: payload,
    });
  };

  const handleConfirmRequest = async e => {
    try {
      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return;
      }

      if (apiCalled) {
        ShowToast(t('Inprogress,Wait_for_some_time'));
        return;
      }

      let payload = {
        from: user_Id,
        to: detail?._id,
        request_id: e?._id,
        accept: 'followed',
        userId: user_Id,
      };
      setApiCalled(true);
      const result = await PrivateUserAccFollow(payload);

      if (result.status) {
        PersonalDetailsFunction(false);
        dispatch(Fetchprofile(user_Id));
        dispatch(update_NotificationRender('ConfirmRequest'));
      }
      setApiCalled(false);
    } catch (error) {}
  };
  const userBlockUnblockFn = () => {
    const willBlock = !blockUser;
    Alert.alert(
      `${willBlock ? t('Block') : t('Unblock')}`,
      t('Are_you_sure_want_to') +
        ' ' +
        `${willBlock ? 'block' : 'unblock'}` +
        ' ' +
        t('this_user'),
      [
        {
          text: t('No'),
          style: 'cancel',
        },
        {
          text: t('YES'),
          onPress: () => handleUserBlock(willBlock),
        },
      ],
    );
  };
  const handleUserBlock = async (willBlock) => {
    try {
      let payload = {
        userId: user_Id,
        toUserId: detail?._id,
        type: willBlock ? 'block' : 'unblock',
      };

      if (apiCalled) {
        ShowToast(t('Inprogress,Wait_for_some_time'));
        return;
      }
      setApiCalled(true);
      setApiType(prev => [...prev, 'block']);
      const result = await UserBlockandUnblock(payload);

      if (result?.status) {
        const data = result?.data;
        const viewerIsBlocker = (data?.userblocked || []).some(
          (user) => String(user) === String(user_Id),
        );
        setBlockUser(viewerIsBlocker);
        if (willBlock) {
          setHideDetails(false);
        }
        PersonalDetailsFunction(false);
      } else {
        ShowToast(result?.message);
      }
    } catch (error) {
    } finally {
      setApiCalled(false);
      setApiType(prev => prev.filter(data => data != 'block'));
    }
  };

  const selectHobby = async e => {
    let local = [e?._id];
    sethobbyData(local);
    setIsModalVisible(true);
  };

  const handleRequesthobby = async () => {
    console.log('GETHobby=>', gethobbyData);
    console.log('GETHobbyuser_Id=>', user_Id);
    setIsModalVisible(false);

    var payload = {
      userId: user_Id,
      HobbyId: gethobbyData,
    };
    const result = await callAddRequestHobby(payload);

    if (result?.status) {
      dispatch(Fetchprofile(user_Id));
      ShowToast(result?.message);
    } else {
      ShowToast(result?.message);
    }

    console.log('GEThobby_Result=>', result);
  };

  // const address = profileDetail?.personalAddress || "";
  // let parts = [];

  // if (address.includes(",")) {
  //     parts = address.split(",").map(p => p.trim());
  // } else {
  //     // Otherwise, split by spaces for simpler addresses
  //     parts = address.split(" ").map(p => p.trim());
  // }

  // console.log("Address==> ", address);

  // const number = parts[0]; // first token is usually number
  // const streetType = parts[parts.length - 1]; // last word is type (e.g., way, st, rd)
  // const streetName = parts.slice(1, -1).join(" "); // middle part is street name

  // console.log({ number, streetName, streetType });

  const address = profileDetail?.personalAddress?.trim() || '';
  let parts = [];

  // Split by comma if present, otherwise by spaces
  if (address.includes(',')) {
    parts = address
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
  } else {
    parts = address
      .split(' ')
      .map(p => p.trim())
      .filter(Boolean);
  }

  let number = '';
  let streetName = '';
  let streetType = '';
  let area = '';
  let city = '';
  let state = '';
  let pincode = '';

  // Detect if last part is numeric (pincode)
  const lastPart = parts[parts.length - 1];
  if (/^\d{5,6}$/.test(lastPart)) {
    pincode = lastPart;
    // assume Indian format: ... City State Pincode
    state = parts.slice(-3, -1).join(' ');
    city = parts[parts.length - 3];
    area = parts.slice(0, -3).join(' ');
  } else if (/^\d/.test(parts[0])) {
    // Assume Western format: number + street name + street type
    number = parts[0];
    streetType = parts[parts.length - 1];
    streetName = parts.slice(1, -1).join(' ');
  } else {
    // Otherwise, treat the whole thing as an area
    area = parts.join(' ');
  }

  console.log('UserAddress==>', {
    number,
    streetName,
    streetType,
    area,
    city,
    state,
    pincode,
  });

  const handleBack = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
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
                width: '100%',
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '5%',
              }}
            >
              <Pressable onPress={handleBack} style={styles.roundbox}>
                {Images.back}
              </Pressable>
            </View>
          </View>
          {isLoading ? (
            <View
              style={{
                height: '92.5%',
                paddingBottom: '2.5%',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator
                style={{ alignSelf: 'center' }}
                color={'#fff'}
                size={'small'}
              />
            </View>
          ) : (
            <View style={{ width: '100%', height: '88%' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: '8%' }}>
                  <View style={{ alignSelf: 'center' }}>
                    <View style={styles.profileAvatarRing}>
                      {profileDetail?.profile ? (
                        <View
                          style={{
                            width: profileAvatarSize,
                            height: profileAvatarSize,
                          }}
                        >
                          <TouchableOpacity
                            onPress={handleImageView}
                            activeOpacity={0.7}
                          >
                            <Image
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: profileAvatarSize / 2,
                              }}
                              source={{
                                uri: `${Imageurl}${profileDetail?.profile}`,
                              }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            width: profileAvatarSize,
                            height: profileAvatarSize,
                          }}
                        >
                          <Pressable onPress={handleStaticImageView}>
                            <Image
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: profileAvatarSize / 2,
                              }}
                              source={randomimages[profileDetail?.randomIndex]}
                              resizeMode="cover"
                            />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={{ alignSelf: 'center', marginTop: '3%' }}>
                    <View
                      style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={styles.nametxt}>
                        {profileDetail?.username}
                      </Text>
                    </View>

                    {!hideDetails && (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2%',
                          }}
                        >
                          {profileDetail?.gender && (
                            <Text style={styles.gendertxt}>
                              {profileDetail?.gender},
                            </Text>
                          )}
                          <Text style={[styles.gendertxt, { marginLeft: 2 }]}>
                            {profileDetail?.age}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '1%',
                          }}
                        >
                          {/* <Text style={styles.connectxt}>{profileDetail?.personalAddress && profileDetail?.personalAddress?.split(',')?.slice(-1)}</Text> */}
                          <Text style={styles.connectxt}>
                            {/* {profileDetail?.personalAddress &&
                                                            //profileDetail?.personalAddress?.split(',')?.slice(-3, -2)[0]?.trim()
                                                            streetName
                                                        } */}
                            {console.log('streetType==>', streetType)}

                            {streetType ? streetName + ', ' + streetType : area}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* {console.log("profileDetail===?", detail?.distanceInKm)} */}
                          {Images.location}
                          <Text style={styles.kmtxt}>
                            {' '}
                            {distanceInKm} kms away
                          </Text>
                        </View>

                        <>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: '4%',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {apiCalled && apiType?.includes('chat') ? (
                              <View
                                style={[styles.roundbox1, { marginLeft: '4%' }]}
                              >
                                <ActivityIndicator
                                  style={{ alignSelf: 'center' }}
                                  color={c?.primary}
                                  size={'small'}
                                />
                              </View>
                            ) : (
                              <>
                                {profileDetail?.followingsDetails &&
                                profileDetail?.followingsDetails?.status ==
                                  'completed' &&
                                !blockUser ? (
                                  <Pressable
                                    onPress={() => sendMessageTo()}
                                    style={styles.roundbox1}
                                  >
                                    {Images.chat}
                                  </Pressable>
                                ) : (
                                  ''
                                )}
                              </>
                            )}

                            {apiCalled && apiType?.includes('follow') ? (
                              <View
                                style={[styles.roundbox1, { marginLeft: '4%' }]}
                              >
                                <ActivityIndicator
                                  style={{ alignSelf: 'center' }}
                                  color={c?.primary}
                                  size={'small'}
                                />
                              </View>
                            ) : (
                              <>
                                {(respFollowBack?.toFromDetails != null ||
                                  respFollowBack?.fromToDetails == null) && (
                                  <>
                                    {followingSts &&
                                    followingSts?.status != 'unfollowed' &&
                                    followingSts?.status != 'reject' ? (
                                      <>
                                        {profileDetail?.followingsDetails
                                          ?.status == 'completed' ? (
                                          <Pressable
                                            onPress={() =>
                                              handleUserUnFollowRequest()
                                            }
                                            style={[
                                              styles.roundbox1,
                                              { marginLeft: '4%' },
                                            ]}
                                          >
                                            {Images.profiletick1}
                                          </Pressable>
                                        ) : (
                                          <Pressable
                                            onPress={() =>
                                              handleUserUnFollowRequest()
                                            }
                                            style={[
                                              styles.roundbox1,
                                              { marginLeft: '4%' },
                                            ]}
                                          >
                                            {Images.profilepending1}
                                          </Pressable>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <Pressable
                                          onPress={() => handleFollowRequest()}
                                          style={[
                                            styles.roundbox1,
                                            { marginLeft: '4%' },
                                          ]}
                                        >
                                          {Images.profilereq1}
                                        </Pressable>
                                      </>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </View>
                        </>

                        {/*--------------------------------------------------------------------------     confirm reject button -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/}

                        <View style={{ marginTop: 10, alignSelf: 'center' }}>
                          {respFollowBack?.fromToDetails?.status ==
                            'pending' && (
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 5,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Pressable
                                onPress={() =>
                                  handleConfirmRequest(
                                    respFollowBack?.fromToDetails,
                                  )
                                }
                                style={styles.confirmbtn}
                              >
                                <Text style={styles.confirmbtntxt}>
                                  {t('Accept')}
                                </Text>
                              </Pressable>
                              {/* <Pressable onPress={() => handleUserUnFollowRequest(respFollowBack?.fromToDetails)} style={styles.confirmbtn1}>
                                                                {Images.close4}
                                                            </Pressable> */}
                              <Pressable
                                onPress={() =>
                                  handleUserUnFollowRequest(
                                    respFollowBack?.fromToDetails,
                                  )
                                }
                                style={styles.confirmbtn}
                              >
                                <Text style={styles.confirmbtntxt}>
                                  {t('Delete')}
                                </Text>
                              </Pressable>
                            </View>
                          )}

                          {respFollowBack?.fromToDetails?.status ==
                            'completed' &&
                            respFollowBack?.toFromDetails == null && (
                              <Pressable
                                onPress={() =>
                                  handleFollowRequest('followback')
                                }
                                style={styles.followbtn}
                              >
                                <Text style={styles.followbtntxt}>
                                  {t('AcceptFriendRequest')}
                                </Text>
                              </Pressable>
                            )}
                        </View>

                        <>
                          {profileDetail?.privacy_status !== 'public' && (
                            <>
                              {profileDetail?.followingsDetails?.status !==
                                'completed' && (
                                <>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      marginTop: '8%',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Pressable
                                      style={[
                                        styles.roundbox1,
                                        { marginLeft: '4%' },
                                      ]}
                                    >
                                      {Images.LockIcon}
                                    </Pressable>
                                    <Text style={styles.acctxt}>
                                      {t('Private_Account')}{' '}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      marginTop: '8%',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {/* <Text style={styles.acctxt}>{t('Follow_See')}.</Text> */}
                                  </View>
                                </>
                              )}
                            </>
                          )}
                        </>
                      </>
                    )}
                  </View>
                  {!hideDetails ? (
                    <>
                      {canViewProfileSections && (
                        <>
                          {profileDetail?.bioimage.length > 0 && (
                            <View
                              style={{
                                width: '90%',
                                alignSelf: 'center',
                                marginTop: '2.5%',
                              }}
                            >
                              <View style={{ marginTop: '4%' }}>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                  {profileDetail?.bioimage?.map(
                                    (item, index) => (
                                      <View key={index}>
                                        <Pressable
                                          onPress={() => {
                                            openImageSlider(index);
                                          }}
                                          key={index}
                                        >
                                          <Image
                                            style={{
                                              width: devicewidth * 0.14,
                                              height: devicewidth * 0.14,
                                              borderRadius: borderradius * 2,
                                            }}
                                            source={{
                                              uri: `${Imageurl}${item}`,
                                            }}
                                            resizeMode="cover"
                                          />
                                        </Pressable>
                                      </View>
                                    ),
                                  )}
                                </View>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                      {canViewProfileSections && (
                        <>
                          {profileDetail?.bio != '' ? (
                            <View style={styles.parabox}>
                              <View style={{ marginTop: '2%' }}>
                                <Text
                                  style={styles.paratxt}
                                  numberOfLines={
                                    profileDetail?.bio?.length < 50
                                      ? undefined
                                      : isExpanded
                                      ? undefined
                                      : 3
                                  }
                                >
                                  {profileDetail?.bio}
                                </Text>

                                {profileDetail?.bio &&
                                  profileDetail?.bio.length > 50 && (
                                    <TouchableOpacity onPress={toggleExpand}>
                                      <Text
                                        style={{
                                          fontFamily: Fonts.Bold,
                                          color: c.white,
                                          fontSize: RFValue(14),
                                        }}
                                      >
                                        {isExpanded
                                          ? t('View_Less')
                                          : '...' + t('View_More')}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                              </View>
                            </View>
                          ) : (
                            <View style={styles.parabox}>
                              <Text style={styles.headingtxt}>{t('Bio')}</Text>
                              <View style={{ marginTop: '2%' }}>
                                <Text style={styles.paratxt1}>
                                  {t('No_Data')}
                                </Text>
                              </View>
                            </View>
                          )}

                          {profileDetail?.Mutualfriends?.length > 0 && (
                            <View
                              style={{
                                width: '90%',
                                alignSelf: 'center',
                                marginTop: '2.5%',
                              }}
                            >
                              <Text style={styles.headingtxt}>
                                {t('mutual_friends')}
                              </Text>
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  marginTop: '4%',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View style={{ flexDirection: 'row', gap: 5 }}>
                                  {console.log(
                                    'Mutualfriends==>',
                                    profileDetail?.Mutualfriends,
                                  )}

                                  {profileDetail?.Mutualfriends?.slice(
                                    0,
                                    5,
                                  )?.map((item, index) => (
                                    <View key={index}>
                                      {item?.toDetails?.profile ? (
                                        item?.toDetails?._id ==
                                        fetchProfileId ? (
                                          ''
                                        ) : (
                                          <Image
                                            style={{
                                              width: devicewidth * 0.092,
                                              height: devicewidth * 0.092,
                                              borderRadius: borderradius * 2,
                                            }}
                                            source={{
                                              uri: `${Imageurl}${item?.toDetails?.profile}`,
                                            }}
                                            resizeMode="cover"
                                          />
                                        )
                                      ) : item?.toDetails?._id ==
                                        fetchProfileId ? (
                                        ''
                                      ) : (
                                        <View
                                          style={{
                                            width: devicewidth * 0.092,
                                            height: devicewidth * 0.092,
                                            borderRadius: borderradius * 2,
                                          }}
                                        >
                                          <Image
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              borderRadius: borderradius * 5,
                                            }}
                                            source={
                                              randomimages[
                                                item?.toDetails?.randomIndex
                                              ]
                                            }
                                            resizeMode="cover"
                                          />
                                        </View>
                                      )}
                                    </View>
                                  ))}
                                </View>
                                <Pressable onPress={handleShowAllUser}>
                                  <View
                                    style={{
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'row',
                                      gap: 5,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontFamily: Fonts.Medium,
                                        color: c.white,
                                        fontSize: RFValue(13),
                                      }}
                                    >
                                      {t('View_all')}
                                    </Text>
                                    {Images.forward}
                                  </View>
                                </Pressable>
                              </View>
                            </View>
                          )}
                          {canViewHobbiesSection && (
                            <View
                              style={{
                                width: '90%',
                                alignSelf: 'center',
                                marginTop: '3.5%',
                              }}
                            >
                              <Text style={styles.headingtxt}>
                                {t('Hobbies')}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  marginTop: '3%',
                                  gap: 10,
                                }}
                              >
                                {sortedDetailHobbies.length > 0 ? (
                                  sortedDetailHobbies.map((e, index) => (
                                    <Pressable
                                      key={hobbyIdString(e) || index}
                                      style={[
                                        styles.smallbtnOuter,
                                        e.isMutual && styles.smallbtnMutualOuter,
                                      ]}
                                      onPress={() => selectHobby(e)}
                                    >
                                      <View
                                        style={[
                                          styles.smallbtn,
                                          e.isMutual && styles.smallbtnMutualInner,
                                        ]}
                                      >
                                        <Text
                                          //numberOfLines={1}
                                          ellipsizeMode="tail"
                                          style={styles.smallbtntxt}
                                        >
                                          {e?.hobbyname}
                                        </Text>
                                      </View>
                                    </Pressable>
                                  ))
                                ) : (
                                  <Text
                                    style={{
                                      fontFamily: Fonts.Regular,
                                      color: c.white,
                                      fontSize: RFValue(14),
                                      textAlign: 'center',
                                      width: '100%',
                                    }}
                                  >
                                    {t('No_Hobbies')}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}

                          {/* created events */}
                          {
                            //!profileDetail?.ishideevent && profileDetail?.events?.length > 0 &&
                            canViewEventsAndGroupsSection && (
                              <View
                                style={{
                                  width: '90%',
                                  alignSelf: 'center',
                                  marginTop: '4%',
                                }}
                              >
                                <View
                                  style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    alignContent: 'space-between',
                                  }}
                                >
                                  <Text style={styles.headingtxtbtn}>
                                    {profileDetail?.username + '‘s'} Created
                                    Events{' '}
                                  </Text>
                                  {/* <Text style={styles.headingtxtbtn}> Join Event </Text> */}
                                  {/* <Text style={styles.headingtxtbtn}> Group </Text> */}
                                  {/* <Text style={styles.headingtxtbtn}> Join Group </Text> */}
                                </View>

                                  <View style={{ marginTop: '2%' }}>
                                    {(() => {
                                      const visibleEvents =
                                        profileDetail?.events || [];

                                    if (visibleEvents.length === 0) {
                                      return (
                                        <Text
                                          style={{
                                            fontFamily: Fonts.Regular,
                                            color: c.white,
                                            fontSize: RFValue(14),
                                            textAlign: 'center',
                                            marginTop: '4%',
                                          }}
                                        >
                                          ---
                                        </Text>
                                      );
                                    }

                                    return (
                                      <>
                                        {visibleEvents
                                          .slice(
                                            0,
                                            isExpandedEvents
                                              ? visibleEvents.length
                                              : 3,
                                          )
                                          .map((e, index) => (
                                            <Pressable
                                              key={index}
                                              onPress={() =>
                                                transformEventData(e)
                                              }
                                            >
                                              <View
                                                style={{
                                                  width: '100%',
                                                  borderRadius:
                                                    borderradius * 0.4,
                                                  paddingHorizontal: '3%',
                                                  paddingVertical: '4%',
                                                  marginBottom: '1%',
                                                  marginTop: '4%',
                                                  borderColor: '#fff',
                                                  borderWidth: 0.5,
                                                }}
                                              >
                                                <View
                                                  style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    flex: 1,
                                                  }}
                                                >
                                                  <View style={{ flex: 0.8 }}>
                                                    <Text
                                                      style={styles.eventtitle}
                                                    >
                                                      {e?.eventTitle}
                                                    </Text>
                                                  </View>
                                                  <View
                                                    style={{
                                                      flex: 0.2,
                                                      width: '25%',
                                                      borderRadius:
                                                        borderradius * 0.3,
                                                      height:
                                                        deviceheight * 0.04,
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      borderColor: c.white,
                                                      borderStyle: 'solid',
                                                    }}
                                                  >
                                                    <Text
                                                      style={
                                                        styles.subeventtitle
                                                      }
                                                    >
                                                      {e?.privacy_status ? e?.privacy_status.charAt(0).toUpperCase() + e?.privacy_status.slice(1) : ''}
                                                    </Text>
                                                  </View>
                                                </View>
                                                <View
                                                  style={{
                                                    marginTop: '4%',
                                                    flexDirection: 'row',
                                                    justifyContent:
                                                      'space-between',
                                                    width: '90%',
                                                  }}
                                                >
                                                  <View
                                                    style={{
                                                      flexDirection: 'row',
                                                      gap: 5,
                                                    }}
                                                  >
                                                    {Images.date}
                                                    <Text
                                                      style={styles.datetxt}
                                                    >
                                                      {formatDate(e?.startDate)}
                                                    </Text>
                                                  </View>
                                                  <View
                                                    style={{
                                                      flexDirection: 'row',
                                                      gap: 5,
                                                    }}
                                                  >
                                                    {Images.location}
                                                    <Text
                                                      style={styles.datetxt}
                                                    >
                                                      {e?.eventAddress?.slice(
                                                        0,
                                                        20,
                                                      ) + '...'}
                                                    </Text>
                                                  </View>
                                                </View>
                                              </View>
                                            </Pressable>
                                          ))}

                                        {visibleEvents.length > 3 && (
                                          <TouchableOpacity
                                            onPress={toggleEventExpansion}
                                            style={{
                                              marginTop: 10,
                                              alignItems: 'center',
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontFamily: Fonts.SemiBold,
                                                color: c.white,
                                                fontSize: RFValue(14),
                                                textAlign: 'center',
                                                marginTop: '4%',
                                              }}
                                            >
                                              {isExpandedEvents
                                                ? t('View_Less')
                                                : t('View_More')}
                                            </Text>
                                          </TouchableOpacity>
                                        )}
                                      </>
                                    );
                                  })()}
                                </View>

                                {/* Join Event  List*/}

                                <View
                                  style={{
                                    width: '100%',
                                    alignSelf: 'center',
                                    marginTop: '2%',
                                    alignContent: 'space-between',
                                  }}
                                >
                                  <Text style={styles.headingtxtbtn}>
                                    {profileDetail?.username + '‘s'} Joined
                                    Events{' '}
                                  </Text>

                                  <View>
                                    {(() => {
                                      const visibleJoinEvents =
                                        joinEvent || [];

                                      if (visibleJoinEvents.length === 0) {
                                        return (
                                          <Text
                                            style={{
                                              fontFamily: Fonts.Regular,
                                              color: c.white,
                                              fontSize: RFValue(14),
                                              textAlign: 'center',
                                              marginTop: '4%',
                                            }}
                                          >
                                            ---
                                          </Text>
                                        );
                                      }
``
                                      return (
                                        <>
                                          {visibleJoinEvents
                                            .slice(
                                              0,
                                              isExpandedJoinEvent
                                                ? visibleJoinEvents.length
                                                : 3,
                                            )
                                            .map((e, index) => (
                                              <Pressable
                                                key={index}
                                                onPress={() =>
                                                  transformEventData(e)
                                                }
                                              >
                                                <View
                                                  style={{
                                                    width: '100%',
                                                    borderRadius:
                                                      borderradius * 0.4,
                                                    paddingHorizontal: '3%',
                                                    paddingVertical: '4%',
                                                    marginBottom: '1%',
                                                    marginTop: '4%',
                                                    borderColor: '#fff',
                                                    borderWidth: 0.5,
                                                  }}
                                                >
                                                  <View
                                                    style={{
                                                      flexDirection: 'row',
                                                      alignItems: 'center',
                                                      flex: 1,
                                                    }}
                                                  >
                                                    <View style={{ flex: 0.8 }}>
                                                      <Text
                                                        style={
                                                          styles.eventtitle
                                                        }
                                                      >
                                                        {e?.eventTitle}
                                                      </Text>
                                                    </View>
                                                    <View
                                                      style={{
                                                        flex: 0.2,
                                                        width: '25%',
                                                        borderRadius:
                                                          borderradius * 0.3,
                                                        height:
                                                          deviceheight * 0.04,
                                                        alignItems: 'center',
                                                        justifyContent:
                                                          'center',
                                                        borderColor: c.white,
                                                        borderStyle: 'solid',
                                                      }}
                                                    >
                                                      <Text
                                                        style={
                                                          styles.subeventtitle
                                                        }
                                                      >
                                                        {e?.privacy_status ? e?.privacy_status.charAt(0).toUpperCase() + e?.privacy_status.slice(1) : ''}
                                                      </Text>
                                                    </View>
                                                  </View>
                                                  <View
                                                    style={{
                                                      marginTop: '4%',
                                                      flexDirection: 'row',
                                                      justifyContent:
                                                        'space-between',
                                                      width: '90%',
                                                    }}
                                                  >
                                                    <View
                                                      style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                      }}
                                                    >
                                                      {Images.date}
                                                      <Text
                                                        style={styles.datetxt}
                                                      >
                                                        {formatDate(
                                                          e?.startDate,
                                                        )}
                                                      </Text>
                                                    </View>
                                                    <View
                                                      style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                      }}
                                                    >
                                                      {Images.location}
                                                      <Text
                                                        style={styles.datetxt}
                                                      >
                                                        {e?.eventAddress?.slice(
                                                          0,
                                                          20,
                                                        ) + '...'}
                                                      </Text>
                                                    </View>
                                                  </View>
                                                </View>
                                              </Pressable>
                                            ))}

                                          {visibleJoinEvents.length > 3 && (
                                            <TouchableOpacity
                                              onPress={toggleJoinEventExpansion}
                                              style={{
                                                marginTop: 10,
                                                alignItems: 'center',
                                              }}
                                            >
                                              <Text
                                                style={{
                                                  fontFamily: Fonts.SemiBold,
                                                  color: c.white,
                                                  fontSize: RFValue(14),
                                                  textAlign: 'center',
                                                  marginTop: '4%',
                                                }}
                                              >
                                                {isExpandedJoinEvent
                                                  ? t('View_Less')
                                                  : t('View_More')}
                                              </Text>
                                            </TouchableOpacity>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </View>
                                </View>

                                {renderGroupSection({
                                  title: `${profileDetail?.username + '‘s'} Created Groups `,
                                  groups: groupList,
                                  expanded: isExpandedGroup,
                                  onToggle: toggleGroupExpansion,
                                })}

                                {renderGroupSection({
                                  title: `${profileDetail?.username + '‘s'} Joined Groups `,
                                  groups: joinGrouoList,
                                  expanded: isExpandedJoinGroup,
                                  onToggle: toggleJoinGroupExpansion,
                                })}
                              </View>
                            )
                          }
                        </>
                      )}

                    </>
                  ) : (
                    <View style={styles.parabox}>
                      {/* <Text style={styles.headingtxt}>{t('Alert')}</Text> */}
                      <View style={{ marginTop: '2%' }}>
                        <Text style={styles.paratxt}>
                          {t('ThisUserBlockedYou')}
                        </Text>
                      </View>
                    </View>
                  )}

                  <>
                    {/* block user  */}

                    {detail?._id && detail?._id !== user_Id && (
                      <View
                        style={{
                          width: '95%',
                          marginTop: '5%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            marginLeft: 20,
                            fontFamily: Fonts.Bold,
                            color: c.primary,
                            fontSize: RFValue(15),
                          }}
                        >
                          {`${blockUser ? 'Unblock' : 'Block'} this user?`}
                        </Text>

                        {apiCalled && apiType?.includes('block') ? (
                          <ActivityIndicator
                            style={{ alignSelf: 'center' }}
                            color={'#fff'}
                            size={'small'}
                          />
                        ) : (
                          <>
                            <SwitchToggle
                              switchOn={blockUser}
                              onPress={() => userBlockUnblockFn()}
                              circleColorOff="#911687"
                              circleColorOn="#911687"
                              backgroundColorOn={c.primary}
                              backgroundColorOff={c.pink}
                              containerStyle={{
                                width: devicewidth * 0.15,
                                height: devicewidth * 0.074,
                                borderRadius: 100,
                                padding: devicewidth * 0.01,
                                flex: 0.2,
                              }}
                              circleStyle={{
                                width: devicewidth * 0.055,
                                height: devicewidth * 0.055,
                                borderRadius: 100,
                              }}
                            />
                          </>
                        )}
                      </View>
                    )}
                  </>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </LinearGradient>

      {imagePrevUrl?.length > 0 && (
        <Modal
          visible={mediaVisible}
          transparent={true}
          onRequestClose={() => setMediaVisible(false)}
        >
          {imagePrevUrl?.length > 1 ? (
            <ImageViewer
              imageUrls={imagePrevUrl}
              // onClick={() => setVisible(false)}
              swipeDownThreshold={400}
              enableSwipeDown={true}
              onSwipeDown={() => {
                setMediaVisible(false);
                setImagePrevUrl([]);
                handleImagePreview(profileDetail?.profile);
              }}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
            />
          ) : (
            <ImageViewer
              imageUrls={imagePrevUrl}
              // onClick={() => setVisible(false)}
              swipeDownThreshold={400}
              enableSwipeDown={true}
              onSwipeDown={() => {
                setMediaVisible(false);
                setImagePrevUrl([]);
                handleImagePreview(profileDetail?.profile);
              }}
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
            />
          )}

          <View
            style={{
              width: '100%',
              height: 90,
              backgroundColor: 'rgba(0,0,0,0.3)',
              position: 'absolute',
              top: deviceheight * 0.045,
              left: '0%',
              right: 0,
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMediaVisible(false)}
            >
              {Images.back}
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {bioImagePrevUrl?.length > 0 && (
        <Modal
          visible={bioMediaVisible}
          transparent={true}
          onRequestClose={() => setBioMediaVisible(false)}
        >
          {bioImagePrevUrl?.length > 0 ? (
            <ImageViewer
              imageUrls={bioImagePrevUrl}
              // onClick={() => setVisible(false)}
              index={currentImageIndex}
              swipeDownThreshold={400}
              enableSwipeDown={true}
              onSwipeDown={() => {
                setBioMediaVisible(false);
                setBioImagePrevUrl([]);
                handleBioImagePreview(profileDetail?.bioimage, Imageurl);
              }}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
            />
          ) : (
            <ImageViewer
              imageUrls={bioImagePrevUrl}
              // onClick={() => setVisible(false)}
              index={currentImageIndex}
              swipeDownThreshold={400}
              enableSwipeDown={true}
              onSwipeDown={() => {
                setBioMediaVisible(false);
                setBioImagePrevUrl([]);
                handleBioImagePreview(profileDetail?.bioimage, Imageurl);
              }}
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              onLongPress={() => {}}
            />
          )}

          <View
            style={{
              width: '100%',
              height: 90,
              backgroundColor: 'rgba(0,0,0,0.3)',
              position: 'absolute',
              top: deviceheight * 0.045,
              left: '0%',
              right: 0,
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setBioMediaVisible(false)}
            >
              {Images.back}
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {staticImagePrevUrl?.length > 0 && (
        <Modal
          visible={staticMediaVisible}
          transparent={true}
          onRequestClose={() => setStaticMediaVisible(false)}
        >
          <ImageViewer
            imageUrls={staticImagePrevUrl}
            // onClick={() => setVisible(false)}
            swipeDownThreshold={400}
            enableSwipeDown={true}
            onSwipeDown={() => {
              setStaticMediaVisible(false);
              setStaticImagePrevUrl([]);
              handleStaticImagePreview();
            }}
            saveToLocalByLongPress={false}
            onLongPress={() => {}}
          />

          <View
            style={{
              width: '100%',
              height: 90,
              backgroundColor: 'rgba(0,0,0,0.3)',
              position: 'absolute',
              top: '0%',
              left: '0%',
              right: 0,
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStaticMediaVisible(false)}
            >
              {Images.back}
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      <AlertPopup
        visible={isModalVisible}
        onSubmit={() => handleRequesthobby()}
        onClose={() => setIsModalVisible(false)}
      >
        Would you like to add this to your hobbies?
      </AlertPopup>
    </View>
  );
};

export default HomeDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boxcontainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(22),
  },
  subtitle: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(17),
  },
  backcontainer: {
    width: '90%',
    alignSelf: 'center',
    height: '8%',
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
  avatorbox: {
    width: devicewidth * 0.3,
    height: devicewidth * 0.3,
    borderRadius: (devicewidth * 0.12) / 2,
    backgroundColor: c.primary,
    marginLeft: '4%',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  editbox: {
    width: devicewidth * 0.08,
    height: devicewidth * 0.08,
    borderRadius: borderradius * 2,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '0%',
    right: -10,
  },
  nametxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(22),
  },
  gendertxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(14),
    textTransform: 'capitalize',
  },
  connectxt: {
    fontFamily: Fonts.Black,
    color: c.white,
    fontSize: RFValue(16),
    textAlign: 'center',
  },
  kmtxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(16),
    textAlign: 'center',
  },
  countrytxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(16),
  },
  roundbox1: {
    width: devicewidth * 0.1,
    height: devicewidth * 0.1,
    borderRadius: (devicewidth * 0.15) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: '29%',
    borderRadius: borderradius * 1.5,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    padding: '2.3%',
    alignSelf: 'center',
  },
  btntxt: {
    color: c.secondary,
    fontSize: RFValue(11),
    fontFamily: Fonts.Bold,
  },
  parabox: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: borderradius * 0.3,
    paddingHorizontal: '4%',
    paddingVertical: '4%',
    marginVertical: '4%',
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  parabox1: {
    width: '90%',
    alignSelf: 'center',
    height: deviceheight * 0.1,
    borderRadius: borderradius * 0.3,
    backgroundColor: '#CA6859',
    paddingHorizontal: '4%',
    paddingVertical: '4%',
    marginVertical: '4%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingtxt: {
    fontSize: RFValue(16),
    fontFamily: Fonts.Medium,
    color: c.white,
  },
  headingtxtbtn: {
    fontSize: RFValue(15),
    fontFamily: Fonts.Medium,
    color: c.white,
    // borderColor: c.primary,
    // borderWidth: 1,
    justifyContent: 'center',
    //borderRadius: 5,
    // padding: 5,
    margin: 5,
  },
  paratxt: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Light,
    color: c.white,
    letterSpacing: 0.3,
    textAlign: 'justify',
  },
  paratxt1: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Light,
    color: c.white,
    letterSpacing: 0.3,
    textAlign: 'justify',
  },
  smallbtnOuter: {
    width: '31%',
    height: deviceheight * 0.048,
    alignSelf: 'center',
    marginBottom: '4%',
    borderRadius: borderradius * 0.9,
    overflow: 'hidden',
  },
  smallbtnMutualOuter: {
    padding: c.mutualProfileChipBorderWidth,
    backgroundColor: c.mutualProfileRingGreen,
  },
  smallbtn: {
    flex: 1,
    width: '100%',
    borderRadius: borderradius * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.white,
    flexDirection: 'row',
  },
  smallbtnMutualInner: {
    borderRadius: Math.max(0, borderradius * 0.9 - c.mutualProfileChipBorderWidth),
  },
  profileAvatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  smallbtntxt: {
    // fontFamily: Fonts.Regular,
    // color: c.pink,
    // fontSize: RFValue(12),
    // fontFamily: Fonts.Medium,
    // marginRight: '2%',

    fontFamily: Fonts.Medium,
    color: c.pink,
    fontSize: RFValue(12),
    lineHeight: RFValue(14),
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  acctxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    fontSize: RFValue(16),
    textAlign: 'center',
    marginLeft: '2%',
  },
  eventtitle: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(14),
    marginRight: '2%',
  },
  subeventtitle: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(15),
  },
  starttxt: {
    fontFamily: Fonts.Regular,
    color: c.white,
    fontSize: RFValue(14),
    marginRight: '2%',
  },
  datetxt: {
    fontFamily: Fonts.Medium,
    color: c.white,
    fontSize: RFValue(14),
    marginRight: '2%',
  },

  counttxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
    marginRight: '2%',
  },

  //follow

  followingbtn: {
    width: '40%',
    borderRadius: borderradius * 0.5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    padding: '3.5%',
    alignSelf: 'center',
  },

  followbtn: {
    width: 'auto',
    minWidth: '40%',
    borderRadius: borderradius * 0.5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    borderColor: c.white,
    padding: '1.5%',
    alignSelf: 'center',
  },
  followbtntxt: {
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 4,
    color: c.secondary,
    fontSize: RFValue(12),
    fontFamily: Fonts.Medium,
  },
  confirmbtn: {
    width: '40%',
    borderRadius: borderradius * 0.5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    paddingHorizontal: '6%',
    paddingVertical: '4%',
  },
  confirmbtn1: {
    width: devicewidth * 0.08,
    height: devicewidth * 0.08,
    borderRadius: borderradius * 5,
    backgroundColor: c.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: c.white,
    padding: '1%',
  },
  confirmbtntxt: {
    color: c.secondary,
    fontSize: RFValue(12),
    fontFamily: Fonts.Medium,
  },
  backButton: {
    left: '6%',
    top: '38%',
    width: devicewidth * 0.1,
    height: devicewidth * 0.1,
    borderRadius: (devicewidth * 0.15) / 2,
    backgroundColor: '#fff',
    marginLeft: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
