import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  AndroidTransition,
  MyTransition,
  Slidingbottom,
} from '../Utilities/navigationslide';
import Splash from '../Screens/Splash';
import Login from '../Screens/Auth/Login';
import Otp from '../Screens/Auth/Otp';
import PersonDetails from '../Screens/Form/PersonDetails';
import SelectInterest from '../Screens/Form/SelectInterest';
import ProfileDetail from '../Screens/Form/ProfileDetail';
import EventCreation from '../Screens/Form/EventCreation';
import Premium from '../Screens/Profile/Premium';
import SettingPage from '../Screens/Settings/SettingPage';
import ProfileHome from '../Screens/Profile/ProfileHome';
import Homescreen from './Toptab';
import HomeDetail from '../Screens/Home/HomeDetail';
import Notification from '../Screens/Notify/Notification';
import CreateGroup from '../Screens/Group/CreateGroup';
import GroupList from '../Screens/Group/GroupList';
import OthersPage from '../Screens/Form/OthersPage';
import LocationHome from '../Screens/Location/LocationHome';
import ActivityDetail from '../Screens/Home/ActivityDetail';
import GroupMembers from '../Screens/Group/GroupMembers';
import MyActivites from '../Screens/Home/MyActivites';
import MyPeople from '../Screens/Home/MyPeople';
import ChatGroup from '../Screens/Chat/ChatGroup';
import CmsPage from '../Screens/Cms/CmsPage';
import ManualLocation from '../Screens/Location/ManualLocation';
import EventList from '../Screens/Form/EventList';
import Userlist from '../Screens/Group/userslist';
import EventWishList from '../Screens/Form/EventWishList';
import FeedBack from '../Screens/Cms/FeedBack';
import HelpPage from '../Screens/Cms/HelpPage';
import { useDispatch, useSelector } from 'react-redux';
import ChangeLanguage from '../Screens/Settings/changeLanguage';
import PeopleAudience from '../Screens/Form/PeopleAudience';
import EmailAgree from '../Screens/Settings/EmailAgree';
import NewEmail from '../Screens/Settings/NewEmail';
import ToggleAccount from '../Screens/Profile/ToggleAccount';
import messaging from '@react-native-firebase/messaging';
import { setForegroundnotifiication, update_FetchProfileId } from '../Slices/helper';
import {
  isChatNotificationType,
  normalizeNotificationType,
  resolveChatDetailFromNotificationAsync,
} from '../Utilities/chatNavigation';
import { useNavigation } from '@react-navigation/native';
import { AppState, Platform, Text } from 'react-native';
import NewMemberNotify from '../Screens/Settings/NewMemberNotify';
import SingleChat from '../Screens/Chat/SingleChat';
import Privacypage from '../Screens/Profile/Pricacypage';
import ForgotPassword from '../Screens/Auth/ForgotPassword';
import VerificationOTP from '../Screens/Auth/Otp/VerificationOTP';
import ChangePassword from '../Screens/Settings/Changepass';
import FaqPage from '../Screens/Cms/FaqPage';
import EventGroupList from '../Screens/Profile/EventGroupList';
import Searchpage from '../Screens/Home/Searchpage';
import PeopleFilterPage from '../Screens/Home/PeopleFilterPage';
import ChatFilterPage from '../Screens/Home/ChatFilterPage';
import ActivitiesFilterPage from '../Screens/Home/ActivitiesFilterPage';
import GroupfilterPage from '../Screens/Home/GroupFilterPage';
import MapViewpage from '../Screens/Location/MapViewpage';
import branch from 'react-native-branch';
import { Fetchprofile } from '../Slices/profile';
import { GetItem, RemoveItem } from '../Actions/localstorage';
import { createConnection, socket } from '../Actions/socket';
import AlertPopup from '../Components/AlertPopup';
import { useTranslation } from 'react-i18next';
import Teamacondition from '../Screens/Cms/TeamandContions';
import RequestHobby from '../Screens/Cms/RequestHobby';
import GroupDetails from '../Screens/Home/GroupDetails';
import UpcomingEvent from '../Screens/Home/UpcomingEvent';
import Test from '../Screens/test';

const StackComponent = createStackNavigator();

const SESSION_FILTER_STORAGE_KEYS = [
  'AdddressFilter',
  'AdddressFilter:People',
  'AdddressFilter:Chat',
  'AdddressFilter:Activities',
  'GenderFilter',
  'GenderFilter:People',
  'GenderFilter:Chat',
  'GenderFilter:Activities',
  'RadiusFilter',
  'RadiusFilter:People',
  'RadiusFilter:Chat',
  'RadiusFilter:Activities',
  'hobbiesFilter',
  'hobbiesFilter:People',
  'hobbiesFilter:Chat',
  'hobbiesFilter:Activities',
  'SelectAge',
  'SelectAge:People',
  'SelectAge:Chat',
  'SelectAge:Activities',
];

const Stacknavigator = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  const profile = useSelector(state => state.profile.profile);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const User_Id = GetItem('UserId');

  if (User_Id == '') {
    branch.clearPartnerParameters();
  }

  useEffect(() => {
    SESSION_FILTER_STORAGE_KEYS.forEach((key) => {
      RemoveItem(key);
    });

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
    });

    // handlehobbysearch();

    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect(() => {
  //     // handleForegroundNotification();
  //     // handleBackgroundNotification();
  //     Fetchbackgroundfn();
  //     return () => {
  //         messaging().onMessage(() => { });
  //     };
  // }, [foregroundnotification]);
  useEffect(() => {
    if (!socket) return;

    if (User_Id) {
      createConnection(User_Id);
    }

    const expiredPlanHandler = () => {
      setIsModalVisible(true);
    };

    socket.on('expiredPlan', expiredPlanHandler);

    return () => {
      socket.off('expiredPlan', expiredPlanHandler);
    };
  }, [User_Id]);

  const handleNaigatePremium = async () => {
    setIsModalVisible(false);
    navigation.navigate('Premium');
  };

  // useEffect(() => {

  //     const unsubscribe = branch.subscribe(async ({ error, params }) => {
  //         redirectcall(params)
  //     });

  //     return () => unsubscribe();

  // }, []);

  const redirectcall = useCallback(params => {
    if (!params?.data) {
      return;
    }

    const paramsDtl = JSON.parse(params?.data);
    let eventId = {
      _id: paramsDtl?.routeId,
      userId: GetItem('UserId'),
      imageURL: paramsDtl?.imageURL,
    };
    if (GetItem('UserId') && paramsDtl?.screen == 'ActivityDetail') {
      navigation.navigate('ActivityDetail', { detail: eventId });
    } else if (GetItem('UserId') && paramsDtl?.screen == 'GroupDetails') {
      navigation.navigate('GroupDetails', { detail: eventId });
    } else {
      navigation.navigate('Login');
    }
    branch.clearPartnerParameters();
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = branch.subscribe({
      onOpenComplete: async ({ error, params }) => {
        if (error) {
          console.log('Branch error:', error);
          return;
        }

        if (!params) return;

        redirectcall(params);
      },
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [redirectcall]);

  const foregroundnotification = useSelector(
    state => state.helper.foregroundnotification,
  );
  const isOnline = useSelector(state => state.helper.isOnline);

  const navigateFromNotificationPayload = useCallback(async resp => {
    if (!resp) {
      return;
    }

    const notifType = normalizeNotificationType(resp?.type);

    if (resp?.type == 'profile') {
      dispatch(update_FetchProfileId(resp?._id));
      navigation.navigate('HomeDetail', {
        detail: { _id: resp?._id, username: resp?.username },
      });
    } else if (isChatNotificationType(notifType)) {
      const detil = await resolveChatDetailFromNotificationAsync(resp);
      if (!detil?._id) {
        return;
      }
      navigation.navigate('ChatGroup', {
        detil,
        pageFrom: 'Notification',
        refreshKey: Date.now(),
      });
    } else if (
      resp?.type == 'eventcreate' ||
      resp?.type == 'Added to Event' ||
      resp?.type == 'Event' ||
      resp?.type == 'event'
    ) {
      const eventId =
        resp?._id ||
        resp?.eventId ||
        resp?._doc?._id ||
        resp?._doc?.eventId;

      if (!eventId) {
        return;
      }

      navigation.navigate('ActivityDetail', {
        detail: {
          ...resp,
          _id: eventId,
          eventId,
          userId: profile?._id,
        },
      });
    } else if (resp?.type == 'eventedit') {
      const eventId =
        resp?._doc?._id ||
        resp?._id ||
        resp?.eventId;

      if (!eventId) {
        return;
      }

      navigation.navigate('ActivityDetail', {
        detail: {
          ...(resp?._doc || resp),
          _id: eventId,
          eventId,
          userId: profile?._id,
        },
      });
    } else if (resp?.type == 'Newgroup') {
      navigation.navigate('GroupDetails', { detail: resp?._doc || resp });
    } else if (resp?.type == 'editchat') {
      navigation.navigate('GroupDetails', {
        detail: { ...resp, _id: resp?.chatGroupId },
      });
    } else if (resp?.type == 'grouprequest') {
      navigation.navigate('GroupDetails', {
        detail: { ...resp, _id: resp?.chatGroupId },
      });
    } else if (resp?.type == 'notification') {
      navigation.navigate('Notification', {
        userid: resp?._id,
        type: 'notify',
      });
    } else if (resp?.type == 'home') {
      navigation.navigate('Homescreen');
    } else if (resp?.type == 'newuserjoined') {
      dispatch(update_FetchProfileId(resp?._id));
      navigation.navigate('HomeDetail', {
        detail: { _id: resp?._id, username: resp?.username },
      });
    }
  }, [dispatch, navigation, profile?._id]);
  useEffect(() => {
    if (!foregroundnotification || !User_Id || !isOnline) {
      return;
    }

    const payload = foregroundnotification;
    dispatch(setForegroundnotifiication(null));

    (async () => {
      try {
        await navigateFromNotificationPayload(payload);
      } catch (error) {
        console.warn('notification navigation failed:', error?.message);
      }
    })();
  }, [
    dispatch,
    foregroundnotification,
    navigateFromNotificationPayload,
    User_Id,
    isOnline,
  ]);

  const openapp = useCallback(
    remoteMessage => {
      if (!remoteMessage?.data?.Records) {
        return;
      }

      try {
        const resp = JSON.parse(remoteMessage.data.Records);
        console.log('backgroundNotifyData==>', remoteMessage?.data);
        dispatch(setForegroundnotifiication(resp));
      } catch (error) {}
    },
    [dispatch],
  );

  const Fetchbackgroundfn = useCallback(() => {
    return messaging().onNotificationOpenedApp(async remoteMessage => {
      openapp(remoteMessage);
      if (remoteMessage) {
        messaging().clearAllDeliveredNotifications();
      }
    });
  }, [openapp]);

  useEffect(() => {
    const unsubscribe = Fetchbackgroundfn();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [Fetchbackgroundfn]);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          openapp(remoteMessage);
        }
      });
  }, [openapp]);

  return (
    <>
      <StackComponent.Navigator
        screenOptions={{
          ...Platform.select({ ios: MyTransition, android: AndroidTransition }),
        }}
        initialRouteName={'Splash'}
        // initialRouteName={"Test"}
      >
        <StackComponent.Screen name={'Test'} component={Test} />

        <StackComponent.Screen name={'Userlist'} component={Userlist} />
        <StackComponent.Screen name={'Splash'} component={Splash} />
        <StackComponent.Screen
          options={{ gestureEnabled: false }}
          name={'Otp'}
          component={Otp}
        />
        <StackComponent.Screen
          options={{ gestureEnabled: false }}
          name={'Login'}
          component={Login}
        />
        <StackComponent.Screen
          options={{ gestureEnabled: false }}
          name={'PersonDetails'}
          component={PersonDetails}
        />
        <StackComponent.Screen
          options={{ gestureEnabled: false }}
          name={'SelectInterest'}
          component={SelectInterest}
        />
        <StackComponent.Screen
          name={'ProfileDetail'}
          component={ProfileDetail}
        />
        <StackComponent.Screen
          name={'EventCreation'}
          component={EventCreation}
        />
        <StackComponent.Screen name={'Premium'} component={Premium} />
        <StackComponent.Screen name={'SettingPage'} component={SettingPage} />
        <StackComponent.Screen name={'ProfileHome'} component={ProfileHome} />
        <StackComponent.Screen name={'HomeDetail'} component={HomeDetail} />
        <StackComponent.Screen name={'Notification'} component={Notification} />
        <StackComponent.Screen name={'CreateGroup'} component={CreateGroup} />
        <StackComponent.Screen name={'GroupList'} component={GroupList} />
        <StackComponent.Screen name={'OthersPage'} component={OthersPage} />
        <StackComponent.Screen name={'LocationHome'} component={LocationHome} />
        <StackComponent.Screen
          name={'ActivityDetail'}
          component={ActivityDetail}
        />
        <StackComponent.Screen name={'GroupDetails'} component={GroupDetails} />
        <StackComponent.Screen name={'GroupMembers'} component={GroupMembers} />
        <StackComponent.Screen
          options={{ gestureEnabled: false }}
          name={'Homescreen'}
          component={Homescreen}
        />
        <StackComponent.Screen name={'MyActivites'} component={MyActivites} />
        <StackComponent.Screen name={'MyPeople'} component={MyPeople} />
        <StackComponent.Screen name={'ChatGroup'} component={ChatGroup} />
        <StackComponent.Screen name={'CmsPage'} component={CmsPage} />
        <StackComponent.Screen
          name={'Teamacondition'}
          component={Teamacondition}
        />
        <StackComponent.Screen
          name={'ManualLocation'}
          component={ManualLocation}
        />
        <StackComponent.Screen name={'EventList'} component={EventList} />
        <StackComponent.Screen
          name={'EventWishList'}
          component={EventWishList}
        />
        <StackComponent.Screen name={'FeedBack'} component={FeedBack} />
        <StackComponent.Screen name={'HelpPage'} component={HelpPage} />
        <StackComponent.Screen
          name={'ChangeLanguage'}
          component={ChangeLanguage}
        />
        <StackComponent.Screen
          name={'PeopleAudience'}
          component={PeopleAudience}
        />
        <StackComponent.Screen name={'EmailAgree'} component={EmailAgree} />
        <StackComponent.Screen name={'NewEmail'} component={NewEmail} />
        <StackComponent.Screen
          name={'ToggleAccount'}
          component={ToggleAccount}
        />
        <StackComponent.Screen
          name={'NewMemberNotify'}
          component={NewMemberNotify}
        />
        <StackComponent.Screen name={'SingleChat'} component={SingleChat} />
        <StackComponent.Screen name={'Privacypage'} component={Privacypage} />
        <StackComponent.Screen
          name={'ForgotPassword'}
          component={ForgotPassword}
        />
        <StackComponent.Screen
          name={'VerificationOTP'}
          component={VerificationOTP}
        />
        <StackComponent.Screen
          name={'ChangePassword'}
          component={ChangePassword}
        />
        <StackComponent.Screen name={'FaqPage'} component={FaqPage} />
        <StackComponent.Screen
          name={'EventGroupList'}
          component={EventGroupList}
        />
        <StackComponent.Screen name={'Searchpage'} component={Searchpage} />
        <StackComponent.Screen name={'MapViewpage'} component={MapViewpage} />

        <StackComponent.Screen
          name={'CommonFilterPage'}
          //options={Slidingbottom}
          options={{ presentation: 'transparentModal', ...Slidingbottom }}
          component={PeopleFilterPage}
        />
        <StackComponent.Screen
          name={'PeopleFilterPage'}
          options={{ presentation: 'transparentModal', ...Slidingbottom }}
          component={PeopleFilterPage}
        />
        <StackComponent.Screen
          name={'ChatFilterPage'}
          options={{ presentation: 'transparentModal', ...Slidingbottom }}
          component={ChatFilterPage}
        />
        <StackComponent.Screen
          name={'ActivitiesFilterPage'}
          options={{ presentation: 'transparentModal', ...Slidingbottom }}
          component={ActivitiesFilterPage}
        />
        <StackComponent.Screen
          name={'GroupfilterPage'}
          //options={Slidingbottom}
          options={{ presentation: 'transparentModal', ...Slidingbottom }}
          component={GroupfilterPage}
        />
        <StackComponent.Screen name={'RequestHobby'} component={RequestHobby} />
        <StackComponent.Screen
          name={'UpcomingEvent'}
          component={UpcomingEvent}
        />
      </StackComponent.Navigator>

      <AlertPopup
        visible={isModalVisible}
        title="Note"
        onSubmit={() => handleNaigatePremium()}
        onClose={() => {
          navigation.navigate('Homescreen');
          dispatch(Fetchprofile(User_Id));
          setIsModalVisible(false);
        }}
      >
        <Text>{t('ended_subscribe_again?')}</Text>
      </AlertPopup>
    </>
  );
};
export default Stacknavigator;
