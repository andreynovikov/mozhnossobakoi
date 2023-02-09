import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Circle, MapContainer, LayersControl, TileLayer, useMapEvents } from 'react-leaflet';

import { AddressSuggestions } from 'react-dadata';
import ReactGA from 'react-ga4';

import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import ErrorBoundary from './ErrorBoundary';
import DraggableMarker from './DraggableMarker';
import LocateControl from './LocateControl';
import NewPlaceDrawer from './NewPlaceDrawer';
import PlaceDrawer from './PlaceDrawer';
import PlacesLayer from './PlacesLayer';
import YandexTileLayer from './YandexTileLayer';
import { kinds } from './PlaceIcon';

import { useStickyState, useDocumentTitle, useHashParams } from './hooks';

import 'leaflet/dist/leaflet.css';
import 'react-dadata/dist/react-dadata.css';

import './Map.css';


function getPrecision(zoom) {
    if (zoom < 2) return 0;
    if (zoom < 3) return 1;
    if (zoom < 4) return 2;
    if (zoom < 6) return 3;
    if (zoom < 10) return 4;
    if (zoom < 14) return 5;
    return 6;
}

function MapEvents({onMapMoved, onMapZoomed, onBaseLayerChange, onFilterChange}) {
    useMapEvents({
        moveend: (e) => {
            onMapMoved(e.target.getCenter());
        },
        zoomend: (e) => {
            onMapZoomed(e.target.getZoom());
        },
        baselayerchange: (e) => {
            onBaseLayerChange(e.name);
        },
        overlayadd: (e) => {
            onFilterChange(e.name, true);
        },
        overlayremove: (e) => {
            onFilterChange(e.name, false);
        }
    });
    return null;
}

export default forwardRef(function Map({mobile}, ref) {
    const [map, setMap] = useState(null);
    const [mapCenter, setMapCenter] = useStickyState({lat: 59.950240, lng: 30.317502}, "mapCenter");
    const [mapZoom, setMapZoom] = useStickyState(15, "mapZoom");
    const [tileLayer, setTileLayer] = useStickyState('Yandex Map', 'tileLayer');
    const [filter, setFilter] = useStickyState(kinds, 'kindFilter');
    const [value, setValue] = useState();
    const [placeId, setPlaceId] = useState(0);
    const [offset, setOffset] = useState([0, 0]);
    const [position, setPosition] = useState({lat: 0, lng: 0});
    const [locationErrorOpen, setLocationErrorOpen] = useState(false);
    const [filterErrorOpen, setFilterErrorOpen] = useState(false);

    const placeDrawerRef = useRef();
    const newPlaceDrawerRef = useRef();
    const markerRef = useRef();

    const theme = useTheme();
    const mobileLayout = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

    const [hashParams, setHashParams] = useHashParams();

    useDocumentTitle('#можноссобакой - карта и каталог доступных для посещения с собакой мест');
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: 'Карта мест' });
    }, []);

    useEffect(() => {
        if (map)
            map.attributionControl.setPosition('bottomleft');
    }, [map]);

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

    useEffect(() => {
        setFilterErrorOpen(filter.length === 1);
    }, [filter]);

    const setValueEx = (v) => {
        setValue(v);
        if (v.data?.geo_lat && v.data?.geo_lon) {
            map.flyTo([v.data.geo_lat, v.data.geo_lon], Math.min(Math.max(v.data.house !== null ? 16 : 13, map.getZoom()), v.data.house !== null ? 20 : 17));
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

    const onFilterChange = (name, checked) => {
        const map = {
            "Пожить на природе": 'camp',
            "Переночевать": 'hotel',
            "Поесть": 'cafe',
            "Купить": 'shop',
            "Погулять": 'park',
            "Другое": 'other'
        };
        const kind = map[name];
        const f = [...filter];
        const index = f.indexOf(kind);
        if (checked && index < 0)
            f.push(kind);
        if (!checked && index !== -1)
            f.splice(index, 1);
        setFilter(f);
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
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom whenCreated={setMap} minZoom={3} worldCopyJump={true} className="map">
            <MapEvents onMapMoved={onMapMoved} onMapZoomed={setMapZoom} onBaseLayerChange={setTileLayer} onFilterChange={onFilterChange} />
            <LayersControl position="topleft">
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
                  attribution='&copy; <a href="https://stadiamaps.com">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org">OpenMapTiles</a> &copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
                  url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer checked={tileLayer === 'Satellite Map'} name="Satellite Map">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay checked={filter.includes('camp')} name="Пожить на природе">
                <Circle center={[0,0]} radius={0} stroke={false} fill={false} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked={filter.includes('hotel')} name="Переночевать">
                <Circle center={[0,0]} radius={0} stroke={false} fill={false} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked={filter.includes('cafe')} name="Поесть">
                <Circle center={[0,0]} radius={0} stroke={false} fill={false} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked={filter.includes('shop')} name="Купить">
                <Circle center={[0,0]} radius={0} stroke={false} fill={false} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked={filter.includes('park')} name="Погулять">
                <Circle center={[0,0]} radius={0} stroke={false} fill={false} />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked={filter.includes('other')} name="Другое">
              </LayersControl.Overlay>
            </LayersControl>
            {hashParams.place !== 'new' && <PlacesLayer mobile={mobile} kindFilter={filter} onPlaceDetails={handlePlaceDetails} />}
            <LocateControl options={locateOptions} startDirectly={false} />
            <DraggableMarker ref={markerRef} visible={hashParams.place === 'new'} onPositionChange={onPositionChange} />
          </MapContainer>

          <ErrorBoundary>
            {hashParams.place !== 'new' && (
              <AddressSuggestions
                filterFromBound="country"
                filterToBound="house"
                inputProps={{placeholder: "Введите адрес"}}
                token="6f1eeeda9215d36fce5802a014e1487e488cb2b3"
                value={value}
                onChange={setValueEx} />
            )}
          </ErrorBoundary>

          {mobileLayout && hashParams.place !== 'new' && <Button variant="contained" onClick={handleAdd} className="add-button">Добавить место</Button>}
          <PlaceDrawer ref={placeDrawerRef} open={parseInt(hashParams.place) > 0} onClose={handleCloseDrawer} mobile={mobile} id={placeId} fromMap />
          <NewPlaceDrawer ref={newPlaceDrawerRef} open={hashParams.place === 'new'} onClose={handleCloseDrawer} mobile={mobile} position={position} />

          <Dialog open={locationErrorOpen} onClose={() => setLocationErrorOpen(false)} aria-labelledby="location-dialog-title" aria-describedby="location-dialog-description">
            <DialogTitle id="location-dialog-title">
              Невозможно определить, где вы находитесь
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="location-dialog-description">
                Скорее всего необходимо разрешение определять ваше местоположение: это делается в настройках устройства или браузера.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLocationErrorOpen(false)}>Не сейчас</Button>
              <Button href="https://yandex.ru/support/common/browsers-settings/geolocation.html" target="_blank" autoFocus onClick={() => setLocationErrorOpen(false)}>Посмотреть инструкцию</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={filterErrorOpen} onClose={() => setFilterErrorOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="filter-dialog-description">
            <DialogContent>
              <DialogContentText id="filter-dialog-description">
                Вы отключили все типы мест, ничего не будет отображаться на карте, пока вы не выберите хотя бы один тип.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={() => setFilterErrorOpen(false)}>Понятно</Button>
            </DialogActions>
          </Dialog>

        </div>
    );
});
