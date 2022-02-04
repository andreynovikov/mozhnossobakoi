import { useState, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { AddressSuggestions } from 'react-dadata';

import Button from '@mui/material/Button';

import DraggableMarker from './DraggableMarker';
import LocateControl from './LocateControl';
import NewPlaceDrawer from './NewPlaceDrawer';
import PlacesLayer from './PlacesLayer';

import { useStickyState } from './hooks';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import 'leaflet/dist/leaflet.css';
import 'react-dadata/dist/react-dadata.css';

import './Map.css';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12,41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    tooltipAnchor: [16, -28]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({onMapMoved, onMapZoomed}) {
    useMapEvents({
        moveend: (e) => {
            onMapMoved(e.target.getCenter());
        },
        zoomend: (e) => {
            onMapZoomed(e.target.getZoom());
        }
    });
    return null;
}

export default function Map({mobile}) {
    const locateOptions = {
        position: 'topleft',
        setView: 'untilPan',
        keepCurrentZoomLevel: true,
        flyTo: true,
        showPopup: false,
        strings: {
            title: 'Определить текущее местоположение'
        },
        onActivate: () => {} // callback before engine starts retrieving locations
    }

    const [map, setMap] = useState(null);
    const [mapCenter, setMapCenter] = useStickyState([59.950240, 30.317502], "mapCenter");
    const [mapZoom, setMapZoom] = useStickyState(15, "mapZoom");
    const [value, setValue] = useState();
    const [open, setOpen] = useState(false);
    const [offset, setOffset] = useState([0, 0]);
    const [position, setPosition] = useState({lat: 0, lng: 0});

    const drawerRef = useRef(null);
    const markerRef = useRef(null);

    const setValueEx = (v) => {
        setValue(v);
        if (v.data?.geo_lat && v.data?.geo_lon) {
            map.flyTo([v.data?.geo_lat, v.data?.geo_lon], Math.min(Math.max(13, map.getZoom()), 17));
        }
    };

    const onPositionChange = (pos) => {
        setPosition(pos);
    };

    const handleAdd = () => {
        markerRef.current.setPosition(map.getCenter());
        let offset = undefined;
        if (mobile) {
            offset = [0, drawerRef.current.children[0].offsetHeight / 2];
        } else {
            offset = [drawerRef.current.children[0].offsetWidth / 2, 0];
        }
        setOffset(offset);
        map.panBy(offset, {animate: true});
        setOpen(true);
    };

    const onClose = () => {
        map.panBy([-offset[0], -offset[1]], {animate: true});
        setOpen(false);
    };

    return (
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom whenCreated={setMap} className="map">
            <MapEvents onMapMoved={setMapCenter} onMapZoomed={setMapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!open && <PlacesLayer />}
            <LocateControl options={locateOptions} startDirectly={false} />
            <DraggableMarker ref={markerRef} visible={open} onPositionChange={onPositionChange} />
          </MapContainer>

          <AddressSuggestions
            filterFromBound="country"
            filterToBound="house"
            inputProps={{placeholder: "Введите адрес"}}
            containerClassName="AddressSuggestions"
            token="6f1eeeda9215d36fce5802a014e1487e488cb2b3"
            value={value}
            onChange={setValueEx} />

          <Button variant="contained" onClick={handleAdd} disabled={open} className="add-button">Добавить место</Button>
          <NewPlaceDrawer ref={drawerRef} open={open} onClose={onClose} mobile={mobile} position={position} />
        </div>
    );
};
