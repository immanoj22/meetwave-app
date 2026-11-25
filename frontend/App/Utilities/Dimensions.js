import { Dimensions, PixelRatio } from "react-native";
import { showMessage } from "react-native-flash-message";


export const devicewidth = Dimensions.get("window").width

export const deviceheight = Dimensions.get("window").height

export const borderwidth = PixelRatio.getPixelSizeForLayoutSize(1);
export const borderradius = Math.min(devicewidth, deviceheight) * 0.5 * 0.1;

const { width, height } = Dimensions.get('window');
// TOAST//
import Toast from 'react-native-simple-toast';
import { c } from "./colors";

export const ShowToastF = (data) => Toast.show(data, Toast.SHORT)

const formatMessage = (text) => {
  if (!text) return "";
  let formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  formatted = formatted.replace(/\bmeetwave\b/g, "Meetwave");
  formatted = formatted.replace(/([.!?]\s+)to\s/g, "$1To ");
  formatted = formatted.replace(/([.!?]\s+)([a-z])/g, (_, punct, letter) => punct + letter.toUpperCase());
  return formatted;
};

export const ShowToast = (description, type) => {

  if (description) {
    showMessage({
      message: type ? description : formatMessage(description),
      // description: description,
      backgroundColor: c.intermediate,
      type: "success",
      duration: 2500,
      floating: true,
      position: "top",
      // position is handled by FlashMessage's statusBarHeight + marginTop
    });
  }

  return;
}


export const showwarningmessage = (data) =>
  Toast.showWithGravity(`⚠️ ${data}`, Toast.SHORT, Toast.CENTER);

export const ShowErrorToast = (data) =>
  Toast.showWithGravity(`❌ ${data}`, Toast.LONG, Toast.BOTTOM);


export const pxToPercentage = (pxValue, dimension) => {
  if (dimension === 'width') {
    return (pxValue / width) * 100;
  } else if (dimension === 'height') {
    return (pxValue / height) * 100;
  }
  return null;
};