import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const audioRecorderPlayer = new AudioRecorderPlayer();

const Voicerecord = ({}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('0:00');
  const [recordedFilePath, setRecordedFilePath] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        return result === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      
    }
    return false;
  };

  // Start recording
  const onStartRecord = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    setIsRecording(true);
    try {
      const result = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      });
    } catch (error) {
    }
  };

  // Stop recording
  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordedFilePath(result); // Store the recorded file path
    } catch (error) {
    }
  };

  // Play recorded audio
  const onStartPlay = async () => {
    if (!recordedFilePath) return;
    setIsPlaying(true);
    try {
      await audioRecorderPlayer.startPlayer(recordedFilePath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        setCurrentPositionSec(e.currentPosition);
        setDurationSec(e.duration);

        if (e.currentPosition === e.duration) {
          onStopPlay();
        }
      });
    } catch (error) {
    }
  };

  // Stop playing audio
  const onStopPlay = async () => {
    setIsPlaying(false);
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      
    }
  };

  // Handle seek bar change
  const onSeek = async (value) => {
    const seekTime = (value / 100) * durationSec;
    await audioRecorderPlayer.seekToPlayer(seekTime);
    setCurrentPositionSec(seekTime);
  };

  return (
    <View style={{width:"80%",height:50,backgroundColor:"red"}} >

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  buttonStart: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonStop: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonPlay: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default Voicerecord;
