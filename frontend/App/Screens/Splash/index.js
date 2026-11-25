import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from '../../Utilities/fonts';
import { Images } from '../../Utilities/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { c } from '../../Utilities/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { update_statusbarcolor } from '../../Slices/helper';
import { GetItem } from '../../Actions/localstorage';
import { Fetchprofile, profileSelector } from '../../Slices/profile';
import { useTranslation } from 'react-i18next';

const Splash = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      dispatch(update_statusbarcolor(c.primary))
      var userid = GetItem("UserId")
      var loginsts = GetItem("loginstatus")
      
      if (userid && loginsts) {
        dispatch(Fetchprofile(userid))
        props?.navigation.navigate("Homescreen")

      }
      else {
        setTimeout(() => props?.navigation.navigate('Login'), 0)
      }
    }, [])
  )
  return (
    <View style={styles.container}>
      <LinearGradient style={{ width: "100%", height: "100%", justifyContent: "center", }} start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']} >

        <View style={styles.boxcontainer}>
          {Images.splash}
          <View>
            <Text style={styles.para}>{t('Meetwave')}</Text>
          </View>
        </View>

      </LinearGradient >
    </View>
  )
}

export default Splash;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  boxcontainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  para: {
    fontFamily: Fonts.Black,
    fontSize: RFValue(38),
    color: c.white
  }
});