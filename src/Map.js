import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, LayersControl, TileLayer, useMapEvents } from 'react-leaflet';

import { AddressSuggestions } from 'react-dadata';
import ReactGA from 'react-ga4';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import DraggableMarker from './DraggableMarker';
import LocateControl from './LocateControl';
import NewPlaceDrawer from './NewPlaceDrawer';
import PlaceDrawer from './PlaceDrawer';
import PlacesLayer from './PlacesLayer';
import YandexTileLayer from './YandexTileLayer';

import { useStickyState, useDocumentTitle, useHashParams } from './hooks';

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

function getPrecision(zoom) {
    if (zoom < 2) return 0;
    if (zoom < 3) return 1;
    if (zoom < 4) return 2;
    if (zoom < 6) return 3;
    if (zoom < 10) return 4;
    if (zoom < 14) return 5;
    return 6;
}

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
    const [map, setMap] = useState(null);
    const [mapCenter, setMapCenter] = useStickyState({lat: 59.950240, lng: 30.317502}, "mapCenter");
    const [mapZoom, setMapZoom] = useStickyState(15, "mapZoom");
    const [tileLayer, setTileLayer] = useStickyState('Yandex Map', 'tileLayer');
    const [value, setValue] = useState();
    const [placeId, setPlaceId] = useState(0);
    const [offset, setOffset] = useState([0, 0]);
    const [position, setPosition] = useState({lat: 0, lng: 0});
    const [locationErrorOpen, setLocationErrorOpen] = useState(false);

    const placeDrawerRef = useRef();
    const newPlaceDrawerRef = useRef();
    const markerRef = useRef();

    const [hashParams, setHashParams] = useHashParams();

    useDocumentTitle('#можноссобакой - карта и каталог доступных для посещения с собакой мест');
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: 'Карта мест' });
    }, []);

    useEffect(() => {
        if (map && hashParams.map) {
            const coords = hashParams.map.split('/');
            if (coords.length === 3) {
                coords[0] = Math.min(19, Math.max(3, Number(coords[0])));
                coords[1] = Math.min(90, Math.max(-90, Number(coords[1])));
                coords[2] = Math.min(180, Math.max(-180, Number(coords[2])));
                map.setView([coords[1], coords[2]], coords[0]);
            }
        }
        if (map && hashParams.map === undefined) {
            const zoom = map.getZoom();
            const precision = getPrecision(zoom);
            const center = map.getCenter();
            hashParams.map = [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision)].join('/');
            setHashParams(hashParams, {replace: true});
        }
    }, [map, hashParams.map]);

    const setValueEx = (v) => {
        setValue(v);
        if (v.data?.geo_lat && v.data?.geo_lon) {
            map.flyTo([v.data?.geo_lat, v.data?.geo_lon], Math.min(Math.max(13, map.getZoom()), 17));
        }
    };

	const onLocationError = (err, control) => {
		setLocationErrorOpen(true);
	}

    const onPositionChange = (pos) => {
        setPosition(pos);
    };

    const showLocation = (location) => {
        map.setView(location, 18);
    };

    const onMapMoved = (center) => {
        if (mapCenter.lat === center.lat && mapCenter.lng === center.lng) // leaflet fires 'moveend' event twice
            return;
        setMapCenter(center);
        const zoom = map.getZoom();
        const precision = getPrecision(zoom);
        hashParams.map = [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision)].join('/');
        setHashParams(hashParams, {replace: true});
    };

    const handleAdd = () => {
        hashParams.place = 'new';
        setHashParams(hashParams);
    };

    const handlePlaceDetails = (id) => {
        hashParams.place = id;
        setHashParams(hashParams);
    };

    const handleCloseDrawer = () => {
        setPlaceId(0);
        if (hashParams.place === 'new')
            map.panBy([-offset[0], -offset[1]], {animate: true});
        delete hashParams.place;
        setHashParams(hashParams);
    };

    const locateOptions = {
        position: 'topleft',
        setView: 'untilPan',
        keepCurrentZoomLevel: true,
        flyTo: true,
        showPopup: false,
        strings: {
            title: 'Определить текущее местоположение'
        },
        onLocationError,
        onActivate: () => {} // callback before engine starts retrieving locations
    }

    useEffect(() => {
        if (hashParams.place) {
            if (hashParams.place === 'new') {
                if (map && markerRef) {
                    markerRef.current.setPosition(map.getCenter());
                    let offset = undefined;
                    if (mobile)
                        offset = [0, newPlaceDrawerRef.current.children[0].offsetHeight / 2];
                    else
                        offset = [newPlaceDrawerRef.current.children[0].offsetWidth / 2, 0];
                    setOffset(offset);
                    map.panBy(offset, {animate: true});
                }
            } else {
                const id = parseInt(hashParams.place);
                if (id > 0)
                    setPlaceId(id);
            }
        }
    }, [hashParams.place, map, markerRef]);

    useImperativeHandle(ref, () => ({
        showLocation,
        handleAdd
    }));

    return (
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom whenCreated={setMap} minZoom={3} className="map">
            <MapEvents onMapMoved={onMapMoved} onMapZoomed={setMapZoom} onBaseLayerChange={setTileLayer} />
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
            {hashParams.place !== 'new' && <PlacesLayer mobile={mobile} onPlaceDetails={handlePlaceDetails} />}
            <LocateControl options={locateOptions} startDirectly={false} />
            <DraggableMarker ref={markerRef} visible={hashParams.place === 'new'} onPositionChange={onPositionChange} />
          </MapContainer>

          {hashParams.place !== 'new' && <AddressSuggestions
            filterFromBound="country"
            filterToBound="house"
            inputProps={{placeholder: "Введите адрес"}}
            containerClassName="AddressSuggestions"
            token="6f1eeeda9215d36fce5802a014e1487e488cb2b3"
            value={value}
            onChange={setValueEx} />
          }

          {mobile && <Button variant="contained" onClick={handleAdd} disabled={hashParams.place === 'new'} className="add-button">Добавить место</Button>}
          <PlaceDrawer ref={placeDrawerRef} open={parseInt(hashParams.place) > 0} onClose={handleCloseDrawer} mobile={mobile} id={placeId} />
          <NewPlaceDrawer ref={newPlaceDrawerRef} open={hashParams.place === 'new'} onClose={handleCloseDrawer} mobile={mobile} position={position} />

          <Dialog open={locationErrorOpen} onClose={() => setLocationErrorOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
              Невозможно определить, где вы находитесь
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Скорее всего необходимо разрешение определять ваше местоположение: это делается в настройках устройства или браузера.
            </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLocationErrorOpen(false)}>Не сейчас</Button>
              <Button href="https://yandex.ru/support/common/browsers-settings/geolocation.html" target="_blank" autoFocus onClick={() => setLocationErrorOpen(false)}>Посмотреть инструкцию</Button>
            </DialogActions>
          </Dialog>

        </div>
    );
});
