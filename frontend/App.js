import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import FlashMessagecomp from './App/Utilities/flashmessage';
import { MenuProvider } from 'react-native-popup-menu';
import SocketContext from './App/Context/SocketContext';
import {
  createConnection,
  disconnectSocketConnection,
  ensureChatSocketBridge,
  socket,
} from './App/Actions/socket'; // Ensure this path is correct
import Routes from './App/Navigation/Routes';
import { store } from './App/Slices';
import { GetItem, SetItem } from './App/Actions/localstorage';

import 'intl-pluralrules'; // Importing the polyfill
import { I18nextProvider } from 'react-i18next';
import i18n from './App/Assets/i18n/i18n';
import NetInfo from '@react-native-community/netinfo';
import Offline from './App/Utilities/offline';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNotification } from './App/Actions/pushnotificationconfig';
import ErrorBoundary from './App/Components/ErrorBoundary';

const App = () => {
  // useEffect(() => {
  //   socket.on("Connect", (data) => {
  //     console.log("Connected:", data);
  //   });
  //   socket.on("socketId", (data) => {
  //     console.log("Socket ID:", data);
  //     SetItem("socketId", data);
  //   });
  // }, []);

  useEffect(() => {
    ensureChatSocketBridge();

    const onConnect = () => {
      console.log('Connected:', socket.id);
    };

    const onSocketId = data => {
      console.log('Socket ID:', data);
      SetItem('socketId', data);
    };

    const onDisconnect = reason => {
      console.warn('Disconnected:', reason);
    };

    // ─── Register ──────────────────────────────
    socket.on('connect', onConnect);
    socket.on('socketId', onSocketId);
    socket.on('disconnect', onDisconnect);

    // ─── Cleanup ───────────────────────────────
    return () => {
      socket.off('connect', onConnect);
      socket.off('socketId', onSocketId);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    console.log('User_Id_top', 'User_Id');

    // createConnection("User_Id");
  }, []);

  useEffect(() => {
    if (!__DEV__) {
      console.warn = () => {};
      console.error = () => {};
    }
  }, []);

  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(Boolean(state.isConnected));
      const User_Id = GetItem('UserId');
      if (User_Id) {
        createConnection(User_Id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const appStateRef = useRef(AppState.currentState);
  const User_Id = GetItem('UserId');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const wasActive = appStateRef.current === 'active';
      const isNowActive = nextState === 'active';

      if (wasActive && nextState.match(/inactive|background/)) {
        console.log('📴 App went to background');
        disconnectSocketConnection();
      }

      if (
        appStateRef.current.match(/inactive|background/) &&
        isNowActive
      ) {
        console.log('📱 App came to foreground');
        if (User_Id) {
          createConnection(User_Id);
        }
      }
      appStateRef.current = nextState; // keep ref in sync
    });

    return () => subscription.remove(); // cleanup on unmount
  }, [User_Id]);

  // useEffect(() => {
  //   const payload = {
  //     title: "TITLE",
  //     message: "MESSAGE"
  //   }

  //   localnotification(payload)
  // }, [])

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useNotification();
  const socketContextValue = useMemo(
    () => ({ socket, isConnected }),
    [isConnected],
  );

  // node version 18

  return (
    // GestureHandlerRootView MUST be the outermost wrapper. With the new
    // architecture (Fabric, enabled in android/gradle.properties:23 via
    // newArchEnabled=true) and react-native-gesture-handler@2.x, gestures
    // — including the Material Top Tab swipe handled internally by
    // react-native-pager-view / react-native-tab-view — fail to commit
    // reliably without this root view, which is what was causing tab swipes
    // to start, briefly land on the new tab, and then snap back / get stuck
    // between tabs.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SocketContext.Provider value={socketContextValue}>
          <KeyboardProvider>
            <SafeAreaProvider>
              <MenuProvider>
                <Provider store={store}>
                  <I18nextProvider i18n={i18n}>
                    <Routes />
                    <Offline isConnected={isConnected} />
                    <FlashMessagecomp />
                  </I18nextProvider>
                </Provider>
              </MenuProvider>
            </SafeAreaProvider>
          </KeyboardProvider>
        </SocketContext.Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
