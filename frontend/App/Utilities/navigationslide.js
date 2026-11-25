import { animate } from '@gorhom/bottom-sheet/src/utilities';
import { CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import { Platform } from 'react-native';

export const MyTransition = {
  gestureEnabled: Platform.OS === 'ios',
  gestureDirection: 'horizontal',
  headerShown: false,

  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },

  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export const AndroidTransition = {
 gesturesEnabled: false,
  gestureDirection: 'horizontal',
  swipeEnabled: false,
  headerShown: false,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  },
};

export const Slidingbottom = {
  gestureEnabled: false,
  gestureDirection: 'horizontal',
  headerShown: false,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },

  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },
  })

};

export const Fliprotation = {
  gestureEnabled: false,
  gestureDirection: 'horizontal',
  headerShown: false,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },

  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      transform: [
        {
          rotateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['90deg', '0deg'],
          }),
        },
      ],
    },
  })
};