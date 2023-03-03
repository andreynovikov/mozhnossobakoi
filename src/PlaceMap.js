import { useState, useEffect } from 'react';
import { MapContainer, LayersControl, TileLayer, useMapEvents } from 'react-leaflet';

import PlaceMarker from './PlaceMarker';
import YandexTileLayer from './YandexTileLayer';

import { useStickyState } from './hooks';


function MapEvents({onMapZoomed, onBaseLayerChange}) {
    useMapEvents({
        zoomend: (e) => {
            onMapZoomed(e.target.getZoom());
        },
        baselayerchange: (e) => {
            onBaseLayerChange(e.name);
        }
    });
    return null;
}

export default function PlaceMap({position, kind, claimed, onShowLocation}) {
    const [map, setMap] = useState(null);
    const [mapZoom, setMapZoom] = useState(17);
    const [tileLayer, setTileLayer] = useStickyState('Yandex Map', 'tileLayer');

    useEffect(() => {
        if (map)
            map.attributionControl.setPosition('bottomleft');
    }, [map]);

    return (
      <MapContainer ref={setMap} center={position} zoom={mapZoom} dragging={false} keyboard={false}
                    scrollWheelZoom="center" doubleClickZoom="center" touchZoom="center" minZoom={3}
                    style={{width: "100%", height: "100%"}}>
        <MapEvents onMapZoomed={setMapZoom} onBaseLayerChange={setTileLayer} />
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
        </LayersControl>
        <PlaceMarker kind={kind} claimed={claimed} position={position} eventHandlers={{ click: () => onShowLocation() }} />
      </MapContainer>
    );
}
