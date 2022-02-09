import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, LayersControl, TileLayer, useMapEvents } from 'react-leaflet';
import { AddressSuggestions } from 'react-dadata';

import Button from '@mui/material/Button';

import DraggableMarker from './DraggableMarker';
import LocateControl from './LocateControl';
import NewPlaceDrawer from './NewPlaceDrawer';
import PlaceDrawer from './PlaceDrawer';
import PlacesLayer from './PlacesLayer';
import YandexTileLayer from './YandexTileLayer';

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

function MapEvents({onMapMoved, onMapZoomed, onBaseLayerChange}) {
    useMapEvents({
        moveend: (e) => {
            onMapMoved(e.target.getCenter());
        },
        zoomend: (e) => {
            onMapZoomed(e.target.getZoom());
        },
        baselayerchange: (e) => {
            onBaseLayerChange(e.name);
        }
    });
    return null;
}

export default forwardRef(function Map({mobile}, ref) {
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
    const [tileLayer, setTileLayer] = useStickyState('Yandex Map', 'tileLayer');
    const [value, setValue] = useState();
    const [placeId, setPlaceId] = useState(0);
    const [placeDrawerOpen, setPlaceDrawerOpen] = useState(false);
    const [newPlaceDrawerOpen, setNewPlaceDrawerOpen] = useState(false);
    const [offset, setOffset] = useState([0, 0]);
    const [position, setPosition] = useState({lat: 0, lng: 0});

    const placeDrawerRef = useRef();
    const newPlaceDrawerRef = useRef();
    const markerRef = useRef();

    const setValueEx = (v) => {
        setValue(v);
        if (v.data?.geo_lat && v.data?.geo_lon) {
            map.flyTo([v.data?.geo_lat, v.data?.geo_lon], Math.min(Math.max(13, map.getZoom()), 17));
        }
    };

    const onPositionChange = (pos) => {
        setPosition(pos);
    };

    const showLocation = (location) => {
        map.setView(location, 18);
    };

    const handleAdd = () => {
        markerRef.current.setPosition(map.getCenter());
        let offset = undefined;
        if (mobile) {
            offset = [0, newPlaceDrawerRef.current.children[0].offsetHeight / 2];
        } else {
            offset = [newPlaceDrawerRef.current.children[0].offsetWidth / 2, 0];
        }
        setOffset(offset);
        map.panBy(offset, {animate: true});
        setNewPlaceDrawerOpen(true);
    };

    const onPlaceDetails = (id) => {
        setPlaceId(id);
        setPlaceDrawerOpen(true);
    };

    const onPlaceDrawerClose = () => {
        setPlaceDrawerOpen(false);
        setPlaceId(0);
    };

    const onNewPlaceDrawerClose = () => {
        map.panBy([-offset[0], -offset[1]], {animate: true});
        setNewPlaceDrawerOpen(false);
    };

    useImperativeHandle(ref, () => ({
        showLocation,
        handleAdd
    }));

    return (
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom whenCreated={setMap} className="map">
            <MapEvents onMapMoved={setMapCenter} onMapZoomed={setMapZoom} onBaseLayerChange={setTileLayer} />
            <LayersControl position="bottomright">
              <LayersControl.BaseLayer checked={tileLayer === 'Yandex Map'} name="Yandex Map">
                <YandexTileLayer />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked={tileLayer === 'Open Street Map'} name="Open Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked={tileLayer === 'Stadia Maps'} name="Stadia Maps">
                <TileLayer
                  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            {!newPlaceDrawerOpen && <PlacesLayer onPlaceDetails={onPlaceDetails} />}
            <LocateControl options={locateOptions} startDirectly={false} />
            <DraggableMarker ref={markerRef} visible={newPlaceDrawerOpen} onPositionChange={onPositionChange} />
          </MapContainer>

          {!newPlaceDrawerOpen && <AddressSuggestions
            filterFromBound="country"
            filterToBound="house"
            inputProps={{placeholder: "Введите адрес"}}
            containerClassName="AddressSuggestions"
            token="6f1eeeda9215d36fce5802a014e1487e488cb2b3"
            value={value}
            onChange={setValueEx} />
          }

          {mobile && <Button variant="contained" onClick={handleAdd} disabled={newPlaceDrawerOpen} className="add-button">Добавить место</Button>}
          <PlaceDrawer ref={placeDrawerRef} open={placeDrawerOpen} onClose={onPlaceDrawerClose} mobile={mobile} id={placeId} />
          <NewPlaceDrawer ref={newPlaceDrawerRef} open={newPlaceDrawerOpen} onClose={onNewPlaceDrawerClose} mobile={mobile} position={position} />
        </div>
    );
});
