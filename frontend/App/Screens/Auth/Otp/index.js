import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import React, { useState, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../../Utilities/fonts';
import { c } from '../../../Utilities/colors';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import {
  borderradius,
  deviceheight,
  devicewidth,
} from '../../../Utilities/Dimensions';
import Button from '../../../Components/button';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  update_ChatMembersList,
  update_filterBySearch,
  update_IsLogin,
  update_persondetailpath,
  update_statusbarcolor,
} from '../../../Slices/helper';
import {
  AccountDeleteverify,
  OtpVerify,
  ResendOtpVerify,
  transferEmailverify,
} from '../../../Actions/hooks';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Clearlocal, GetItem, SetItem } from '../../../Actions/localstorage';
import { Fetchprofile, clear_Redux } from '../../../Slices/profile';
import { useTranslation } from 'react-i18next';
import { showwarningmessage } from '../../../Actions/config';
import OTPTextInput from 'react-native-otp-textinput';
import Commonheader from '../../../Navigation/commonheader';
import {
  getFcmToken,
  syncFcmTokenToServer,
} from '../../../Actions/pushnotificationconfig';

const Otp = props => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [timerFinished, setTimerFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMail, setUserMail] = useState('');

  const userID = GetItem('UserId');
  const [key, setKey] = useState('');
  const route = useRoute();
  const { type, email } = route?.params || {};

  const dispatch = useDispatch();
  useFocusEffect(
    React.useCallback(() => {
      //dispatch(update_statusbarcolor(c.primary))

      setKey(props?.route?.params?.key);
      setUserMail(GetItem('UserEmail'));
      setTimerFinished(false);

      return () => {
        setOtp(['', '', '', '']);
        setKey('');
      };
    }, []),
  );

  const handleChange = async (text, index) => {
    const pasteText = await Clipboard.getString();
    const numericPasteText = isNaN(pasteText);

    if (text.length > 1) {
      text = text.slice(-1);
    }

    var newOtp = [...otp];
    newOtp[index] = text;

    if (!numericPasteText && pasteText?.length == 4) {
      newOtp = [...pasteText];
      Keyboard.dismiss();
      Clipboard.setString('');
    }

    setOtp(newOtp);

    if (index == refs.length - 1 && text != '') {
      Keyboard.dismiss();
    }
    // Move focus to next input if the text is valid
    if (text && index < refs.length - 1) {
      setTimeout(() => {
        refs[index + 1].current.focus();
      }, 200); // Short delay to ensure smooth transition
    }
  };

  const handleBackspace = (event, index) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      (otp[index] == '' || otp[index] != '')
    ) {
      if (index > 0) {
        refs[index - 1].current.focus();
      }
    }
  };

  const handleOtpVerify = async () => {
    try {
      if (otp === '') {
        showwarningmessage(t('Please_enter_OTP'));
      } else if (otp?.length < 4) {
        showwarningmessage(t('Please-4-digitOTP'));
      } else {
        setLoading(true);
        const token = await getFcmToken();
        var payload = {
          email: userMail ? userMail : GetItem('UserEmail'),
          OTP: otp,
        };
        const result = await OtpVerify(payload);
        setLoading(true);

        if (result?.status) {
          showwarningmessage(result?.message);
          setTimerFinished(true);
          setLoading(false);
          setOtp(['', '', '', '']);
          SetItem('Authtoken', result?.data?.authToken);
          SetItem('UserId', result?.data?._id);
          if (token) {
            SetItem('Fcmtoken', token);
            await syncFcmTokenToServer(token);
          }

          if (!result?.data?.name) {
            dispatch(update_persondetailpath('add'));
            dispatch(Fetchprofile(result?.data?._id));
            navigation.navigate('PersonDetails');
          } else if (!result?.data?.hobbies?.length) {
            navigation.navigate('SelectInterest');
          } else {
            SetItem('loginstatus', true);
            dispatch(update_IsLogin(true));
            navigation.navigate('Homescreen');
          }
        } else {
          showwarningmessage(result?.message);
          if (refs[3] && refs[3].current) {
            refs[3].current.focus();
          }
          setLoading(false);
        }
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      var payload = {
        email: userMail ? userMail : GetItem('UserEmail'),
      };
      const result = await ResendOtpVerify(payload);
      setOtp(['', '', '', '']);
      setLoading(true);

      if (result?.status) {
        showwarningmessage(t('ResendOTP_send') + GetItem('UserEmail'));
        setTimerFinished(false); //otp timer loop
        setLoading(false);
      } else {
        showwarningmessage(result?.message);
        setLoading(false);
      }
    } catch {
      showwarningmessage(t('Failed_resendOTP'));
      setLoading(false);
    }
  };

  const handleAccDelete = async () => {
    try {
      if (otp === '') {
        showwarningmessage(t('OTP_value_is_required'));
      } else if (otp?.length < 4) {
        showwarningmessage(t('Please-4-digitOTP'));
      } else {
        let payload = {
          email: userMail ? userMail : GetItem('UserEmail'),
          OTP: otp,
        };

        const result = await AccountDeleteverify(payload);

        console.log('PayloadDelete==> ', result);

        console.log('Delete==> ', result);

        if (result.status) {
          // showwarningmessage(result?.message);
          dispatch(clear_Redux());
          // navigation?.navigate("Login");
          setOtp(['', '', '', '']);
          Clearlocal();
          dispatch(update_IsLogin(false));
          dispatch(update_ChatMembersList([]));
          dispatch(update_filterBySearch({ search: '' }));
          navigation?.navigate('Splash');
        } else {
          showwarningmessage(result?.message);
          if (refs[3] && refs[3].current) {
            refs[3].current.focus();
          }
        }
      }
    } catch (error) {}
  };

  const handleOldEmailChange = async () => {
    try {
      if (!otp) {
        showwarningmessage(t('OTP_value_is_required'));
      } else if (otp.length < 4) {
        showwarningmessage(t('Please-4-digitOTP'));
      } else {
        let payload = {
          userId: userID,
          email: userMail ? userMail : GetItem('UserEmail'),
          OTP: otp,
          type: 'oldemail',
        };
        const result = await transferEmailverify(payload);

        if (result?.status) {
          setOtp(['', '', '', '']);
          navigation.navigate('NewEmail');
        } else {
          showwarningmessage(result?.message);
          if (refs[3] && refs[3].current) {
            refs[3].current.focus();
          }
        }
      }
    } catch (error) {}
  };

  const handleNewEmailChange = async () => {
    try {
      if (!otp) {
        showwarningmessage(t('Please-4-OTP_value_is_required'));
      } else if (otp.length < 4) {
        showwarningmessage(t('Please-4-digitOTP'));
      } else {
        let payload = {
          userId: userID,
          email: userMail ? userMail : GetItem('UserEmail'),
          alternativeEmail: email,
          OTP: otp,
          type: 'alteremail',
        };
        const result = await transferEmailverify(payload);

        console.log('Result___', result);

        if (result?.status) {
          setOtp(['', '', '', '']);
          showwarningmessage(result?.message);
          navigation.navigate('ProfileDetail');
        } else {
          showwarningmessage(result?.message);
          if (refs[3] && refs[3].current) {
            refs[3].current.focus();
          }
        }
      }
    } catch (error) {
      console.log('Error on handleNewEmailChange: ', error);
    }
  };
  const otpInput = useRef('');

  const handleBack = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        style={{ width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        colors={['#F8BE2D', '#901487']}
      >
        <View
          onStartShouldSetResponder={() => Keyboard.dismiss()}
          style={styles.boxcontainer}
        >
          <Commonheader istitle={false} onback={handleBack} />

          <View style={{ flex: 1 }}>
            <ScrollView>
              <View
                style={{ width: '100%', height: '85%', marginBottom: '5%' }}
              >
                <View
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={styles.title}>{t('Verification_Code')}</Text>
                  <View
                    style={{
                      width: '100%',
                      alignSelf: 'center',
                      marginTop: '1%',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={styles.subtitle}>
                      {t('Enter_4_digit_Code')}
                    </Text>
                    <Text style={styles.emailtitle}>
                      {userMail == '' ? email : GetItem('UserEmail')}
                    </Text>
                  </View>
                </View>
                <View style={styles.otpContainer}>
                  <OTPTextInput
                    ref={otpInput}
                    defaultValue={otpInput.current}
                    handleTextChange={setOtp}
                    autoFocus
                    keyboardType="number-pad"
                    inputCount={4}
                    tintColor={c.white}
                    containerStyle={{ width: '100%', alignSelf: 'center' }}
                    textInputStyle={{
                      width: devicewidth * 0.15,
                      height: deviceheight * 0.066,
                      backgroundColor: 'transparent',
                      borderWidth: 0.5,
                      bordercolor: '#6D40FF',
                      borderRadius: 5,
                      color: c.white,
                      fontSize: RFValue(14),
                      fontFamily: Fonts.Regular,
                    }}
                  />
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '8%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                    minHeight: 98,
                  }}
                >
                  <Text style={styles.bottomtxt}>{t('Did_get_code')}?</Text>
                  {timerFinished ? (
                    <Pressable
                      style={{ marginLeft: '2%' }}
                      onPress={handleResendOtp}
                    >
                      <Text style={styles.signintxt}>{t('Resend_it')}</Text>
                    </Pressable>
                  ) : (
                    <View style={{ marginLeft: '2%' }}>
                      <CountdownCircleTimer
                        isPlaying
                        duration={300} // 60 seconds
                        size={55}
                        strokeWidth={4}
                        colors={c.primary}
                        onComplete={() => setTimerFinished(true)}
                      >
                        {({ remainingTime }) => (
                          <Text
                            style={{
                              color: c.primary,
                              fontSize: RFValue(14),
                              fontFamily: Fonts.Regular,
                            }}
                          >
                            {remainingTime}s
                          </Text>
                        )}
                      </CountdownCircleTimer>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>

          <View
            style={{
              width: '90%',
              position: 'absolute',
              bottom: '7%',
              alignSelf: 'center',
              height: deviceheight * 0.08,
              justifyContent: 'center',
            }}
          >
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
                }}
              >
                <ActivityIndicator
                  size="small"
                  color={c.primary}
                  style={styles.loader}
                />
              </Pressable>
            ) : (
              <>
                {type == 'EmailTrans' ? (
                  <>
                    <Button onpress={handleOldEmailChange} title={'Verify'} />
                  </>
                ) : (
                  <>
                    {type == 'NewEmailTrans' ? (
                      <Button onpress={handleNewEmailChange} title={'Verify'} />
                    ) : (
                      <Button
                        onpress={() =>
                          key == 'accDelete'
                            ? handleAccDelete()
                            : handleOtpVerify()
                        }
                        title={'Verify'}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boxcontainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.SemiBold,
    color: c.white,
    fontSize: RFValue(30),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.Regular,
    color: c.white,
    width: '70%',
    fontSize: RFValue(15),
    textAlign: 'center',
  },
  emailtitle: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(18),
    textAlign: 'center',
    marginTop: '3%',
  },
  backcontainer: {
    width: '100%',
    paddingTop: '6.2%',
    height: '15%',
  },
  roundbox: {
    width: devicewidth * 0.1,
    height: devicewidth * 0.1,
    borderRadius: (devicewidth * 0.15) / 2,
    backgroundColor: '#fff',
    marginLeft: '3%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomtxt: {
    fontFamily: Fonts.Bold,
    color: c.white,
    fontSize: RFValue(15),
  },
  signintxt: {
    fontFamily: Fonts.Bold,
    color: c.primary,
    fontSize: RFValue(15),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '87%',
    alignSelf: 'center',
    marginTop: '8%',
  },

  otpInput: {
    width: devicewidth * 0.15,
    height: deviceheight * 0.061,
    color: '#fff',
    borderColor: '#ffffff',
    borderWidth: 0.8,
    borderRadius: borderradius * 0.4,
    textAlign: 'center',
    fontSize: RFPercentage(2.5),
    borderBottomWidth: 0.8,
  },
});
