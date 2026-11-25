import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useCallback, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../Utilities/fonts';
import { c } from '../../Utilities/colors';
import { borderradius, deviceheight, devicewidth } from '../../Utilities/Dimensions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RFValue } from "react-native-responsive-fontsize";
import { GetItem } from '../../Actions/localstorage';
import { getAdminDetails, gethelpapi } from '../../Actions/hooks';
import { useTranslation } from 'react-i18next';
import { helperSelector, update_NetworkVisible } from '../../Slices/helper';
import { useDispatch, useSelector } from 'react-redux';
import { showwarningmessage } from '../../Actions/config';

const HelpPage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userID = GetItem("UserId")
  const [desc, setDesc] = useState("")
  const [feature, setFeature] = useState("")
  const [help, setHelp] = useState("")
  const { isOnline } = useSelector(helperSelector)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAdminDetail();
    }, [])
  )

  const getAdminDetail = async () => {
    try {

      const result = await getAdminDetails();
      if (result?.status) {
        setHelp(result?.data[0]?.email)
      }

    } catch (error) {

    }
  }

  const handlegethelp = async () => {
    try {

      if (!isOnline) {
        dispatch(update_NetworkVisible(true));
        return
      }

      if (loading) return;

      setLoading(true)

      if (feature == "" || desc == "") {
        showwarningmessage(t('AllFieldsRequired'));
        return
      }

      var payload = {
        "userId": userID,
        "feature": feature,
        "description": desc,
        "email": help
      }

      Keyboard.dismiss()
      const result = await gethelpapi(payload)
      if (result?.status) {
        setDesc("")
        setFeature("")
        setDesc("")
        setHelp("")
        showwarningmessage(t('processing_kindly_wait'));
        navigation.navigate("SettingPage")
      }
      else {
        showwarningmessage(result?.message);
      }

    }
    catch (err) {

    }
    finally {
      setLoading(false)
    }
  }


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : null} keyboardVerticalOffset={Platform.OS === "ios" ? -130 : 0} style={styles.container}>
      <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}>

        <View onStartShouldSetResponder={() => Keyboard.dismiss()} style={styles.boxcontainer}>
          <View style={styles.topcontainer}>
            <Pressable style={{ padding: "1.5%", backgroundColor: c.intermediate, width: "23%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center" }} onPress={() => navigation.goBack()}>
              <Text style={styles.canceltxt}>{t('Cancel')}</Text>
            </Pressable>
            <Pressable
              style={{ padding: "1.5%", backgroundColor: c.secondary, width: "23%", borderRadius: borderradius * 0.6, alignItems: "center", justifyContent: "center" }}
              onPress={handlegethelp} >
              <Text style={styles.savetxt}>{t('Submit')}</Text>
            </Pressable>

          </View>


          {loading ?
            <View style={{ height: "92.5%", paddingBottom: "2.5%", justifyContent: "center" }} >
              <ActivityIndicator style={{ alignSelf: "center" }} color={"#fff"} size={"small"} />
            </View>
            :
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ width: "100%", height: "92%", marginBottom: "8%", }}>
                <View style={{ width: "90%", alignSelf: "center" }}>
                  <Text style={styles.title}>{t('Get_Help')}</Text>

                </View>

                <View style={styles.inputsec}>
                  <View style={{ marginBottom: "2%" }}>
                    <Text style={styles.inputpara}>{t('Feature')}</Text>
                  </View>
                  <View style={styles.inputcontainer}>
                    <TextInput
                      placeholderTextColor={"#F7E5D0"}
                      placeholder={t('Feature')}
                      style={styles.inputtxtstyle}
                      value={feature}
                      onChangeText={setFeature}
                      keyboardType='default'
                    />
                  </View>
                </View>

                <View style={styles.inputsec}>
                  <View style={{ marginBottom: "2%" }}>
                    <Text style={styles.inputpara}>{t('Description')}</Text>
                  </View>
                  <View style={{ width: '100%', marginBottom: "4%" }}>
                    <Pressable style={styles.desccontainer}>
                      <TextInput
                        placeholderTextColor={"#F7E5D0"}
                        placeholder={t('Description')}
                        style={styles.inputtxtstyle}
                        value={desc}
                        onChangeText={setDesc}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top" />
                    </Pressable>
                    <Pressable style={{ position: "absolute", bottom: "3%", alignSelf: "center", right: "3%" }} >
                      <Text style={styles.descnotxt}>0/100</Text>
                    </Pressable>

                  </View>
                </View>
                <View style={styles.inputsec}>
                  <View style={{ marginBottom: "2%" }}>
                    <Text style={styles.inputpara}>{t('Admin_Details')}</Text>
                  </View>
                  <View style={styles.inputcontainer}>
                    <Text style={{
                      fontSize: RFValue(12),
                      fontFamily: Fonts.Regular,
                      color: c.white,
                      width: "100%",
                    }}>{t('Admin_Email')}: {help} </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          }
        </View>
      </LinearGradient>

    </KeyboardAvoidingView>
  )
}

export default HelpPage;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  boxcontainer: {
    flex: 1,
    width: "100%",
    height: "100%"
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
    textAlign: "center",
    letterSpacing: 0.1
  },
  inputpara: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },
  topcontainer: {
    width: "90%",
    alignSelf: "center",
    height: "8%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "2%"

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
    width: "90%",
    alignSelf: "center",
    marginTop: "3%"
  },
  inputcontainer: {
    width: "100%",
    height: deviceheight * 0.0660,
    paddingHorizontal: "3%",
    justifyContent: "center",
    borderRadius: borderradius * 0.3,
    alignItems: "center",
    justifyContent: "center",
    borderColor: c.white,
    borderWidth: 0.9,
  },
  inputtxtstyle: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    width: "100%",
    height: "100%",
  },
  dobcontainer: {
    width: "100%",
    alignItems: "center",
    height: deviceheight * 0.0550,
    paddingHorizontal: "3%",
    borderRadius: borderradius * 0.3,
    borderColor: c.white,
    borderWidth: 0.9,
    justifyContent: "center"
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
    color: c.white,
    fontSize: RFValue(14),
  },
  locationcontainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: deviceheight * 0.0660,
    paddingHorizontal: "3%",
    borderRadius: borderradius * 0.3,
    alignItems: "center",
    borderColor: c.white,
    borderWidth: 0.9,
  },
  desccontainer: {
    width: "100%",
    alignItems: "center",
    height: deviceheight * 0.250,
    paddingHorizontal: "3%",
    paddingVertical: "4%",
    borderRadius: borderradius * 0.3,
    alignItems: "center",
    borderColor: c.white,
    borderWidth: 0.9,
  },
  descnotxt: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue(11),
    color: "#DEDEDE"
  },
  dobinputsec: {
    width: "90%",
    alignSelf: "center",
    marginTop: "3%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  activitysubtxt: {
    fontSize: RFValue(11),
    fontFamily: Fonts.Regular,
    color: "#DEDEDE",

  },
  selectedImageName: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
    color: c.white,
    marginTop: 5,
    backgroundColor: "red"
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
    color: c.white
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
    marginTop: "2%",
  },
  uploadedImage: {
    width: devicewidth * 0.2,
    height: devicewidth * 0.2,
    margin: 5,
    borderRadius: borderradius * 0.2,
    resizeMode: "cover"
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
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: c.secondary,
    borderRadius: borderradius * 0.2,
    padding: "1.8%",
    zIndex: 2000,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButtonText: {
    color: 'white',
    fontSize: RFValue(13),
    fontFamily: Fonts.Medium,
  },

});
