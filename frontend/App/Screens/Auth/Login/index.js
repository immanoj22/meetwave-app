import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../../Utilities/fonts';
import { c } from '../../../Utilities/colors';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  borderradius,
  deviceheight,
  ShowToast,
} from '../../../Utilities/Dimensions';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../../../Components/button';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  helperSelector,
  update_IsLogin,
  update_statusbarcolor,
} from '../../../Slices/helper';
import {
  shownegativemessage,
  showpossitvemessage,
  showwarningmessage,
} from '../../../Actions/config';
import { Createapi, Loginapi } from '../../../Actions/hooks';
import { GetItem, SetItem } from '../../../Actions/localstorage';
import { Fetchprofile } from '../../../Slices/profile';
import Eyeicon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import {
  getFcmToken,
  syncFcmTokenToServer,
} from '../../../Actions/pushnotificationconfig';

const CustomCheckBox = ({ isChecked, onToggle }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor:"red",
        paddingVertical: '2%',
        // paddingHorizontal:"2%"
      }}
      onPress={onToggle}
    >
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <Icon name="check" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
};

const Login = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [isCheckedTem, setCheckedTem] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(true);
  const [cpass, setCPass] = useState(true);
  const userEmail = GetItem('UserEmail');
  const dispatch = useDispatch();
  const { isLogin } = useSelector(helperSelector);

  useFocusEffect(
    React.useCallback(() => {
      if (isLogin) {
        // navigation.navigate("Homescreen")
        navigation.reset({ index: 0, routes: [{ name: 'Homescreen' }] });
      }
      dispatch(update_statusbarcolor(c.primary));
      setLoading(false);
    }, [dispatch, isLogin, navigation]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert(t('Holdon!'), t('Are_you_sure_want_exit?'), [
          {
            text: t('Cancel'),
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: t('YES'),
            onPress: () => BackHandler.exitApp(),
          },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [t]),
  );

  const handlelogincreate = async () => {
    //const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~])[A-Za-z\d!@#$%^&*()_\-+={[}\]|:;"'<,>.?/`~]{8,}$/;
    const passwordValidation = passwordRegex.test(password);

    try {
      if (!email) {
        showwarningmessage(t('Please_enter_your_email.'));
      } else if (
        !/^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
      ) {
        shownegativemessage(t('PleaseEnter_valid-email'));
      } else if (!password) {
        showwarningmessage(t('Password_is_required'));
        // showwarningmessage("Failure!", "Password is required", 1500);
      } else if (!passwordValidation) {
        showwarningmessage(t('Password_characters_least'));
      } else if (!confirmPass && isSignIn) {
        showwarningmessage(t('ConfirmPassword_is_required'));
      } else if (confirmPass !== password && isSignIn) {
        showwarningmessage(t('ConfirmPassword_not_match_password'));
      } else if (!isChecked && isSignIn) {
        showwarningmessage(t('PleaseConfirm_18_years_old'));
      } else if (!isCheckedTem && isSignIn) {
        showwarningmessage(t('PleaseConfirm_teams_condition'));
      } else {
        setLoading(true);
        // const token = GetItem("Fcmtoken")
        // alert(token)
        const token = await getFcmToken();

        var payload = {
          email: email,
          password: password,
          ageconfirm_status: isSignIn ? isChecked : '',
          fcmtoken: token || '',
        };

        Keyboard.dismiss();
        var result;

        if (isSignIn) {
          result = await Createapi(payload);
          if (result.status) {
            SetItem('Tooltip', true);
            SetItem('hobbyAlert', true);
          }
        } else {
          result = await Loginapi(payload);
          // console.log("LoginResponse==> ",result)
        }

        setLoading(false);

        if (result.status) {
          // showpossitvemessage("Success", result?.message)

          showwarningmessage(result?.reg_status === false ? t('Note') : t('Success!'), result?.message);

          SetItem('UserEmail', email);
          setEmail('');
          setPassword('');
          setConfirmPass('');
          setChecked(false);
          setCheckedTem(false);
          SetItem('UserName', result?.data?.name);
          SetItem('Authtoken', result?.data?.authToken);
          //condtion for exsisting users

          if (result?.TFAstatus || isSignIn) {
            navigation.push('Otp', { email: email, type: 'Otp', key: 'login' });
            // SetItem("loginstatus", true)
          } else if (result?.data?._id) {
            SetItem('UserId', result?.data?._id);
            if (token) {
              await syncFcmTokenToServer(token);
            }
            // dispatch(update_IsLogin(true))
            // SetItem("Loginstatus", "signed")

            dispatch(Fetchprofile(result?.data?._id))
              .then(() => {
                if (!result?.data?.name) {
                  console.log('2');
                  // navigation.navigate("PersonDetails")
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'PersonDetails' }],
                  });
                } else if (!result?.data?.hobbies?.length) {
                  console.log('3');
                  // navigation.navigate("SelectInterest")
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'SelectInterest' }],
                  });
                } else {
                  dispatch(update_IsLogin(true));
                  SetItem('loginstatus', true);
                  navigation.push('Homescreen');
                }
              })
              .catch(err => {});
          }
        } else {
          showwarningmessage(t('Error'), result?.message);
        }
      }
    } catch (err) {}
  };

  const handleChangeText = text => {
    // Update state with trimmed and lowercased text
    setEmail(text.toLowerCase().trim());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
    >
      <LinearGradient
        style={{ width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {isSignIn ? (
          <View
            onStartShouldSetResponder={() => Keyboard.dismiss()}
            style={styles.boxcontainer}
          >
            <View>
              <Text style={styles.title}>{t('Create_account')}</Text>
              {/* <Text style={styles.subtitle}>{t('Create_Account_Continue')}!</Text> */}
            </View>
            <View
              style={{ width: '90%', alignSelf: 'center', marginTop: '5%' }}
            >
              <View style={{ flexDirection: 'row', marginBottom: '2%' }}>
                <Text style={styles.inputpara}>{t('Email')}</Text>
                {/* {Images.star} */}
              </View>
              <View style={styles.inputcontainer}>
                <TextInput
                  // placeholderTextColor={"#F7E5D0"}
                  // placeholder={t('Enter_email')}
                  value={email}
                  onChangeText={handleChangeText}
                  style={styles.inputtxtstyle}
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="none"
                />
              </View>

              <Text style={styles.txtPassw}>{t('Password')}</Text>
              <View style={styles.inputcontainerPass}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={styles.inputtxtstyle}
                  keyboardType="default"
                  secureTextEntry={pass}
                />
                <Pressable
                  onPress={() => {
                    setPass(!pass);
                  }}
                  style={{ width: '10%', alignItems: 'center' }}
                >
                  <Eyeicon
                    name={!pass ? 'eye' : 'eye-off'}
                    size={25}
                    color={c.grey}
                  />
                </Pressable>
              </View>

              <Text style={styles.txtPassw}>{t('confirmpassword')}</Text>
              <View style={styles.inputcontainerPass}>
                <TextInput
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  style={styles.inputtxtstyle}
                  keyboardType="default"
                  secureTextEntry={cpass}
                />
                <Pressable
                  onPress={() => {
                    setCPass(!cpass);
                  }}
                  style={{ width: '10%', alignItems: 'center' }}
                >
                  <Eyeicon
                    name={!cpass ? 'eye' : 'eye-off'}
                    size={25}
                    color={c.grey}
                  />
                </Pressable>
              </View>

              <View style={styles.checkboxRow}>
                <CustomCheckBox
                  isChecked={isChecked}
                  onToggle={() => setChecked(!isChecked)}
                />
                <Text style={[styles.checkboxtxt, styles.checkboxTextWrap]}>
                  {t('Age_Confirm')}
                </Text>
              </View>

              <View style={styles.checkboxRow}>
                <CustomCheckBox
                  isChecked={isCheckedTem}
                  onToggle={() => setCheckedTem(!isCheckedTem)}
                />
                <Text style={[styles.checkboxtxt, styles.checkboxTextWrap]}>
                  {t('agree_terms_cond')}
                  <Text
                    style={styles.checkboxTeam}
                    onPress={() =>
                      navigation.navigate('Teamacondition', {
                        name: t('Teama'),
                      })
                    }
                  >
                    {t('Terms_of_Use')}
                  </Text>
                  {t('and')}
                  <Text
                    style={styles.checkboxTeam}
                    onPress={() =>
                      navigation.navigate('Teamacondition', {
                        name: t('PrivacyPolicy'),
                      })
                    }
                  >
                    {t('Privacy_Policy')}
                  </Text>
                </Text>
              </View>
            </View>
            <View>
              {loading ? (
                <Pressable
                  style={{
                    width: '50%',
                    borderRadius: borderradius * 1.5,
                    backgroundColor: c.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: c.white,
                    padding: '2%',
                    alignSelf: 'center',
                    marginTop: '5%',
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={c.primary}
                    style={styles.loader}
                  />
                </Pressable>
              ) : (
                <Button
                  top={'5%'}
                  onpress={handlelogincreate}
                  title={t('signup')}
                />
              )}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4%',
                  flexDirection: 'row',
                }}
              >
                <Text style={styles.bottomtxt}>{t('Already_account')}? </Text>
                <Pressable onPress={() => setIsSignIn(false)}>
                  <Text style={styles.signintxt}>{t('signin')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View
            onStartShouldSetResponder={() => Keyboard.dismiss()}
            style={styles.boxcontainer}
          >
            <View>
              <Text style={styles.title}>{t('Signin_acc')}</Text>
              {/* <Text style={styles.subtitle}>{t('Login_to_Continue')}!</Text> */}
            </View>
            <View
              style={{ width: '90%', alignSelf: 'center', marginTop: '5%' }}
            >
              <View style={{ flexDirection: 'row', marginBottom: '2%' }}>
                <Text style={styles.inputpara}>{t('Email')}</Text>
                {/* {Images.star} */}
              </View>

              <View style={styles.inputcontainer}>
                <TextInput
                  // placeholderTextColor={"#F7E5D0"}
                  //  placeholder={t('Enter_email')}
                  value={email}
                  onChangeText={handleChangeText}
                  style={styles.inputtxtstyle}
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="none"
                />
              </View>

              <Text style={styles.txtPassw}>{t('Password')}</Text>

              <View style={styles.inputcontainerPass}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={styles.inputtxtstyle}
                  keyboardType="default"
                  secureTextEntry={pass}
                />
                <Pressable
                  onPress={() => {
                    setPass(!pass);
                  }}
                  style={{ width: '10%', alignItems: 'center' }}
                >
                  <Eyeicon
                    name={!pass ? 'eye' : 'eye-off'}
                    size={25}
                    color={c.grey}
                  />
                </Pressable>
              </View>

              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.txtforgot}>{t('forgotPassword')}</Text>
                  {/* <View style={styles.line}></View> */}
                </View>
              </Pressable>
            </View>
            <View>
              {loading ? (
                <Pressable
                  style={{
                    width: '50%',
                    borderRadius: borderradius * 1.5,
                    backgroundColor: c.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: c.white,
                    padding: '2%',
                    alignSelf: 'center',
                    marginTop: '5%',
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={c.primary}
                    style={styles.loader}
                  />
                </Pressable>
              ) : (
                <Button
                  top={'5%'}
                  onpress={handlelogincreate}
                  title={t('signin')}
                />
              )}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '4%',
                  flexDirection: 'row',
                }}
              >
                <Text style={styles.bottomtxt}>{t('reg_here')}? </Text>
                <Pressable onPress={() => setIsSignIn(true)}>
                  <Text style={styles.signintxt}>{t('Create_account')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boxcontainer: {
    width: '100%',
    justifyContent: 'center',
    minHeight: deviceheight,
    paddingVertical: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(32),
    textAlign: 'center',
    shadowOpacity: 0.1,
  },
  subtitle: {
    fontFamily: Fonts.Regular,
    color: c.white,
    fontSize: RFValue(13),
    textAlign: 'center',
  },
  inputpara: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
    shadowOpacity: 0.1,
  },
  txtPassw: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
    paddingBottom: 5,
    marginTop: 15,
    shadowOpacity: 0.1,
  },
  txtforgot: {
    fontFamily: Fonts.Bold,
    color: c.primary,
    fontSize: RFValue(15),
    marginTop: 15,
    alignSelf: 'flex-end',
    shadowOpacity: 0.1,
  },
  line: {
    width: '30%',
    height: 2,
    backgroundColor: c.orange,
    alignSelf: 'flex-end',
    marginTop: 1,
    marginRight: 20,
    shadowOpacity: 0.1,
    marginBottom: 10,
  },
  inputcontainer: {
    width: '100%',
    height: deviceheight * 0.06,
    paddingHorizontal: '3%',
    borderRadius: borderradius * 0.3,
    alignItems: 'center',
    // paddingVertical:"3%",
    justifyContent: 'center',
    borderColor: c.white,
    borderWidth: 0.9,
    shadowOpacity: 0.1,
    // backgroundColor:"red"
  },
  inputcontainerPass: {
    width: '100%',
    height: deviceheight * 0.06,
    paddingHorizontal: '7%',
    borderRadius: borderradius * 0.3,
    alignItems: 'center',
    // paddingVertical:"3%",
    justifyContent: 'center',
    borderColor: c.white,
    borderWidth: 0.9,
    shadowOpacity: 0.1,
    flexDirection: 'row',
    // backgroundColor:"red"
  },
  inputtxtstyle: {
    fontSize: RFValue(13),
    fontFamily: Fonts.Regular,
    color: c.white,
    width: '100%',
    height: '100%',
    //  backgroundColor:"blue"
  },
  checkboxRow: {
    marginTop: '3%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxTextWrap: {
    flex: 1,
    flexShrink: 1,
  },
  checkboxtxt: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(12),
  },
  checkboxTeam: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(12),
    textDecorationLine: 'underline',
  },
  checkboxTeamFirst: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(12),
  },
  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 1.3,
    borderColor: c.primary,
    borderRadius: 4,
    marginRight: '2.5%',
  },
  checkboxChecked: {
    // backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomtxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    shadowOpacity: 0.1,
    fontSize: RFValue(14),
  },
  signintxt: {
    fontFamily: Fonts.Bold,
    color: c.primary,
    fontSize: RFValue(14),
    marginLeft: '2%',
    shadowOpacity: 0.1,
  },
});
