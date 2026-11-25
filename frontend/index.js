/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { LogBox } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';
import { handleBackgroundMessage } from './App/Actions/pushnotificationconfig';
enableScreens(true);
import 'react-native-reanimated';

// Hide the in-app warning notifications (LogBox) in development.
// Errors (red screen) will still show by default.
LogBox.ignoreAllLogs(true);

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent(appName, () => App);
