import React, { useEffect, useMemo, useRef } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import MyStatusBar from '../Utilities/statusbar';
import Stacknavigator from './Stacknavigator';
import { useDispatch, useSelector } from 'react-redux';
import { c } from '../Utilities/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppState, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { bootstrapCurrentLocation } from '../Utilities/bootstrapCurrentLocation';
import { GetItem } from '../Actions/localstorage';

const Routes = () => {
  const dispatch = useDispatch();
  const statusbarcolor = useSelector(
    state => state.helper.statusbarcolor || c.primary,
  );
  // Re-bootstrap whenever the logged-in user changes so a freshly logged-in
  // user (or one switching accounts) immediately gets the device location
  // pushed into Redux. We watch this via UserId from MMKV; the value is
  // stable across renders so this effect only fires when it actually
  // changes.
  const userId = GetItem('UserId');
  const lastBootstrappedUserRef = useRef(null);

  useEffect(() => {
    // The location lives in Redux (commonLocAdd / changeCurrentLoc). Until
    // we seed it, the Groups/People/Activities feeds fall back to the
    // user's stored profile coordinates on the server, and the advanced
    // filter address line shows "Change Location". Bootstrap runs once at
    // mount and again whenever the logged-in user changes.
    if (lastBootstrappedUserRef.current === userId) {
      return;
    }
    lastBootstrappedUserRef.current = userId;
    bootstrapCurrentLocation(dispatch).catch(() => {
      // Permission denial / GPS failure is non-fatal; the filter UI still
      // exposes a manual picker. We deliberately swallow here so a denied
      // OS dialog does not crash the navigation tree.
    });
  }, [dispatch, userId]);

  // Refresh the active location when the app comes back to the foreground.
  // If the user travelled while the app was backgrounded (e.g. drove from
  // Madurai to Trichy), the cached Redux location is stale and the feed
  // would keep showing groups from the old city until they manually opened
  // the picker. Doing this here means it works for every tab that reads
  // changeCurrentLoc / commonLocAdd.
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      const wasInactive = appStateRef.current.match(/inactive|background/);
      const isNowActive = nextState === 'active';
      if (wasInactive && isNowActive) {
        bootstrapCurrentLocation(dispatch, { requestIfNeeded: false }).catch(
          () => {},
        );
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [dispatch]);

  const MyTheme = useMemo(() => ({
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent', // This removes the default gray/white background
    },
  }), []);

  const insets = useSafeAreaInsets();
  const GRADIENT_END = '#901487';
  return (
    <View
      style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: GRADIENT_END }}
    >
      <LinearGradient
        style={{ width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']}
      >
        <MyStatusBar backgroundColor={statusbarcolor} />
        {/* <SafeAreaProvider style={{ flex: 1, }} > */}

        <NavigationContainer theme={MyTheme}>
          <Stacknavigator />
        </NavigationContainer>

        {/* </SafeAreaProvider> */}
      </LinearGradient>
    </View>
  );
};
export default Routes;
