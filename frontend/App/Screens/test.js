import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, Pressable } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

function ScreenOne({ navigation }) {
  const regionData = {
    latitude: 9.9252,
    longitude: 78.1198,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }} >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        mapType="standard"
        initialRegion={regionData}
        // onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        myLocationEnabled={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
      />
    </View>
  )
}

function ScreenTwo() {
  return <Text>Tab Two</Text>;
}

const Tab = createMaterialTopTabNavigator();

export default function Test() {
  const regionData = {
    latitude: 9.9252,
    longitude: 78.1198,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }} >
      <MapView
        // provider={"google"}
        style={{ flex: 1 }}
        mapType="standard"
        initialRegion={regionData}
        // onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        myLocationEnabled={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
      />
    </View>
  )
}
