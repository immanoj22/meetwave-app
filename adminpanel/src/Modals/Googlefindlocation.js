import React, { useState, useEffect } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'

import {
    withGoogleMap,
    GoogleMap,
    InfoWindow,
    Marker,
} from "react-google-maps";
import { GetAddressBasedOnLatLng } from "../config/common";

import {ADDRESS_KEY} from "../config/config"

const ViewMapModal = ({ props, viewMapShow, handleViewMapClose, handleClose, location, show }) => {
    console.log("UserUnblock", location?.location?.coordinates, show);
    const dispatch = useDispatch()

    const [MapLoaded, SetMapLoaded] = useState(false);
    const [getCenter, SetgetCenter] = useState({});
    const [Clicked, SetClicked] = useState({});
    const [isOpen, SetIsOpen] = useState(true);
    const [userlocation, setUserlocation] = useState({})
    console.log("userlocation", userlocation);

    console.log("getCenter", getCenter, Clicked);

    useEffect(() => {

        var pos = {
            lat: Number(location?.location?.coordinates?.[1]),
            lng: Number(location?.location?.coordinates?.[0]),
        };
        SetgetCenter(pos);
        SetClicked(pos);
        console.log("posss", pos);
        Address()
    }, []);




    const Address = async () => {
        let address = await GetAddressBasedOnLatLng({
            lat: Number(location?.location?.coordinates?.[1]),
            lng: Number(location?.location?.coordinates?.[0]),
            key: ADDRESS_KEY
        })
        // console.log("addfdfdfdf", address);
        setUserlocation(address)
        dispatch({
            type: "userlocation",
            userlocation: address
        })
    }

    const MapContainer = withGoogleMap((props) => (
        <GoogleMap
            defaultZoom={15}
            defaultCenter={getCenter}
            onTilesLoaded={() => SetMapLoaded(true)}
            onClick={(e) => {
                SetIsOpen(false);
                SetClicked({
                    lat: e?.latLng?.lat(),
                    lng: e?.latLng?.lng(),
                });
            }
            }
        >
            <Marker
                clickable={true}

                position={Clicked}

            >

            </Marker>
        </GoogleMap>
    ));

    console.log("viewMapShowviewMapShow", show);
    return (
        <div>

            <Modal
                show={show}
                onHide={handleClose}
                centered
                size="md"
                className="common_modal viewmap_modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>View Address</Modal.Title>
                </Modal.Header>
                {console.log("MapContainerMapContainer"
                )}
                <Modal.Body className="pb-4">
                    <div className="viewOnMap">

                        <MapContainer
                            containerElement={<div style={{ height: `400px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ViewMapModal;