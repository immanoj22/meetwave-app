import { Platform } from 'react-native';

/**
 * Spread into `TextInput` / `BottomSheetTextInput` `style` objects so the
 * placeholder and value sit vertically centered in the field.
 * Android: `textAlignVertical` fixes the common top-aligned placeholder glitch.
 * iOS: avoid extra vertical padding that pushes placeholder off-center.
 */
export const textInputPlaceholderCenter = Platform.select({
  android: {
    textAlignVertical: 'center',
  },
  ios: {
    paddingVertical: 0,
  },
  default: {},
});
