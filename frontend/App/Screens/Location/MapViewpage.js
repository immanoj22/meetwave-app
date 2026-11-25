import LinearGradient from "react-native-linear-gradient";
import { Images } from "../../Utilities/images";
import { borderradius, deviceheight, devicewidth } from "../../Utilities/Dimensions";
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { update_ChangeTempLoc, update_CommonLocAdd, update_CommonLocation, update_Islocationfilter, update_statusbarcolor } from '../../Slices/helper';
import React, { useEffect, useRef, useState } from "react";
import { c } from "../../Utilities/colors";
import { check, request, PERMISSIONS, RESULTS, } from 'react-native-permissions';
import { useDispatch, useSelector } from "react-redux";
import getaddressapi from "../../Actions/getaddressapi";
import { useTranslation } from "react-i18next";
import { SetItem } from "../../Actions/localstorage";
import { profileSelector } from "../../Slices/profile";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Prettyalert } from "../../Actions/hooks";
import Location from "react-native-vector-icons/MaterialIcons"
const { useNavigation, useFocusEffect } = require("@react-navigation/native");
const { SafeAreaView, StyleSheet, Keyboard, Pressable, View, Platform, Dimensions, Alert, Linking, Text } = require("react-native");

const DEFAULT_DELTA = 0.01;

const isValidCoordinate = (latitude, longitude) =>
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

const buildRegion = (latitude, longitude) => ({
    latitude: Number(latitude),
    longitude: Number(longitude),
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
});

const MapViewpage = (props) => {
    const { t } = useTranslation();

    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [location, setLocation] = useState();
    const [loading, setLoading] = useState(false);
    const [selectPage, setSelectPage] = useState("")
    const [addressLoc, setAddressLoc] = useState("")
    const [region, setRegion] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const { profile } = useSelector(profileSelector);

    useFocusEffect(
        React.useCallback(() => {
            Getcurrentlocation()
            dispatch(update_statusbarcolor(c.primary))
        }, [])
    )

    useFocusEffect(
        React.useCallback(() => {

            setSelectPage(props?.route?.params?.from)

            setAddressLoc(props?.route?.params?.setAddress)

            return (() => {
                getLocationFN();
            })
        }, [])
    )

    const getLocationFN = async (loc) => {
        if (!loc || !isValidCoordinate(loc.latitude, loc.longitude)) {
            return;
        }

        const { latitude, longitude } = loc;

        const address = await getaddressapi(latitude, longitude);

        const addressdata = {
            lat: latitude,
            long: longitude,
            formatted_address: address
        };

        // console.log("MapvViewer------????", addressdata, addressLoc);

        if (addressLoc == "commonFilterPage") {
            /** Preview only — CommonFilterPage persists on Search tap. */
            dispatch(
                update_ChangeTempLoc({
                    ...addressdata,
                    latitude: addressdata.lat,
                    longitude: addressdata.long,
                })
            );
        }
        else if (addressLoc === "currentLoc") {
            SetItem("currentLoc", addressdata);
            dispatch(update_CommonLocation(addressdata?.formatted_address));
            dispatch(update_CommonLocAdd(addressdata));


        } else {
            SetItem("Adddressdata", addressdata);
            SetItem("AdddressFilter", addressdata);
        }

        if (
            addressLoc !== "commonFilterPage" &&
            (selectPage == "People" ||
                selectPage == "Activities" ||
                selectPage == "Chat")
        ) {
            dispatch(update_Islocationfilter(true));
        }
    }


    const requestLocationPermission = async () => {
        try {
            const permission = Platform.OS == 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

            const result = await check(permission);

            if (result === RESULTS.DENIED) {
                const requestResult = await request(permission);
                if (requestResult === RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert(
                        t('PermissionDenied'),
                        t('Location_access _Please_enable_settings.'),
                        [
                            {
                                text: t('Cancel'),
                                style: "cancel"
                            },
                            {
                                text: t('OpenSettings'),
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                    return false;
                }
            } else if (result === RESULTS.GRANTED) {
                return true;
            } else if (result === RESULTS.BLOCKED || result === RESULTS.LIMITED) {
                Alert.alert(
                    t('PermissionBlocked'),
                    t('Location_access_blocked_Please_enable_settings'),
                    [
                        {
                            text: t('Cancel'),
                            style: "cancel"
                        },
                        {
                            text: t('OpenSettings'),
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
                return false;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };


    const handleRegionChangeComplete = async (region) => {

        // Update the location based on the center of the map

        const { latitude, longitude } = region;

        // console.log("InitialChange----------->>", latitude, longitude);
        // return;

        // setLocation({
        //     latitude: latitude,
        //     longitude: longitude,
        // });
        getLocationFN(region)

    };

    const resolveInitialCoordinates = async () => {
        const routeCoords = props?.route?.params?.coordinates;
        let latitude = routeCoords?.latitude ?? routeCoords?.lat;
        let longitude = routeCoords?.longitude ?? routeCoords?.long;

        if (!isValidCoordinate(latitude, longitude)) {
            const position = await new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (error) => reject(error),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            });
            latitude = position?.latitude;
            longitude = position?.longitude;
        }

        return { latitude: Number(latitude), longitude: Number(longitude) };
    };

    const Getcurrentlocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            console.warn(t('Location_permission_not_granted'));
            return;
        }

        setLoading(true);

        try {
            const { latitude, longitude } = await resolveInitialCoordinates();

            if (!isValidCoordinate(latitude, longitude)) {
                throw new Error('Invalid map coordinates');
            }

            const regionData = buildRegion(latitude, longitude);
            setLocation({ latitude, longitude });
            setRegion(regionData);
            getLocationFN(regionData);

            const addressdata = {
                lat: latitude,
                long: longitude,
                latitude,
                longitude,
                formatted_address: profile?.personalAddress,
            };

            if (addressLoc == "commonFilterPage") {
                dispatch(
                    update_ChangeTempLoc({
                        ...addressdata,
                    })
                );
            }
            else if (addressLoc === "currentLoc") {
                SetItem("currentLoc", addressdata);
                dispatch(update_CommonLocation(addressdata?.formatted_address));
                dispatch(update_CommonLocAdd(addressdata));
            } else {
                SetItem("Adddressdata", addressdata);
            }

            if (
                addressLoc !== "commonFilterPage" &&
                (selectPage == "People" ||
                    selectPage == "Activities" ||
                    selectPage == "Chat")
            ) {
                dispatch(update_Islocationfilter(true));
            }
        } catch (error) {
            Alert.alert(t('LocationError'), t('Something_went_wrong') + " " + `${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };
    const mapviewref = useRef(null)

    useEffect(() => {
        if (!mapReady || !region || !mapviewref.current) {
            return;
        }

        mapviewref.current.animateToRegion(region, 200);
    }, [mapReady, region]);
    const fetchcurrentlocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (error) => reject(error),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            });

            if (!isValidCoordinate(position?.latitude, position?.longitude)) {
                return;
            }

            const payload = buildRegion(position.latitude, position.longitude);
            setRegion(payload);
            setLocation({ latitude: position.latitude, longitude: position.longitude });
            setCurretlcoation({
                latitude: position.latitude,
                longitude: position.longitude,
            });
            getLocationFN(payload);

            mapviewref.current?.animateCamera(
                {
                    center: {
                        latitude: position.latitude,
                        longitude: position.longitude,
                    },
                    zoom: 16,
                    heading: 0,
                    altitude: 1000,
                    pitch: 0,
                },
                { duration: 100 },
            );
        } catch (error) {
            Alert.alert(t('LocationError'), t('Something_went_wrong') + " " + `${error.message || error}`);
        }
    };

    const [currentlocation, setCurretlcoation] = useState(null)

    useEffect(() => {
        fetchcurrent()
    }, [])
    const fetchcurrent = async () => {
        try {
            const position = await new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (error) => reject(error),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            });
            if (isValidCoordinate(position?.latitude, position?.longitude)) {
                setCurretlcoation({
                    latitude: position.latitude,
                    longitude: position.longitude,
                });
            }
        } catch (error) {
            console.warn('Could not fetch device location for map marker', error);
        }
    };

    return (
        <SafeAreaProvider style={styles.container}>
            {/* <LinearGradient style={{ width: "100%", height: "100%" }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} colors={['#F8BE2D', '#901487']}> */}

            <View style={{ flex: 1 }}>
                <Pressable
                    onPress={() => {
                        // getLocationFN()
                        navigation.goBack();
                    }}
                    style={{
                        position: "absolute",
                        width: devicewidth * 0.10,
                        height: devicewidth * 0.10,
                        borderRadius: (devicewidth * 0.15) / 2,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        top: 20,
                        left: 20,
                    }}
                >
                    {Images.back}
                </Pressable>
                {region && isValidCoordinate(region.latitude, region.longitude) ? (
                    <View style={{ flex: 1 }}>

                        <MapView
                            ref={mapviewref}
                            style={styles.map}
                            mapType="standard"
                            region={region}
                            onMapReady={() => setMapReady(true)}
                            onRegionChangeComplete={handleRegionChangeComplete}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            zoomEnabled={true}
                            scrollEnabled={true}
                            loadingEnabled={true}
                        >
                            {currentlocation &&
                                isValidCoordinate(
                                    currentlocation.latitude,
                                    currentlocation.longitude,
                                ) && (
                                <Marker coordinate={currentlocation}>
                                    <View style={{ width: 17, height: 17, borderRadius: 30, backgroundColor: c.pink, borderWidth: 2, borderColor: c.primary }} />
                                </Marker>
                            )}
                        </MapView>

                        <View style={{
                            width: devicewidth * 0.15,
                            height: deviceheight * 0.075,
                            position: "absolute",
                            bottom: "50%",
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center"
                        }}>
                            {Images.pinPointer}
                        </View>

                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>{t('Loadingmap')}</Text>
                    </View>
                )}

                <Pressable onPress={() => fetchcurrentlocation()} style={{ width: devicewidth * 0.125, height: devicewidth * 0.125, backgroundColor: c.white, position: "absolute", bottom: "5%", right: "5%", borderRadius: borderradius * 2, justifyContent: "center", alignItems: "center" }} >
                    <Location name={"my-location"} size={devicewidth * 0.075} />
                </Pressable>
            </View>

            {/* </LinearGradient> */}
        </SafeAreaProvider>
    )

}
export default MapViewpage

const styles = StyleSheet.create({

    container: {
        flex: 1
    },
    boxcontainer: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    backcontainer: {
        width: "100%",
        paddingTop: "6.2%",
        height: "15%",
    },
    roundbox: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

})
