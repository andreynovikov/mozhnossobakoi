import { renderToStaticMarkup } from 'react-dom/server';
import { Marker } from 'react-leaflet';

import Box from '@mui/material/Box';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import { createSvgIcon } from '@mui/material/utils';

import L from 'leaflet';

import PlaceIcon, { kinds } from './PlaceIcon';


const iconHtml = renderToStaticMarkup(
    <Box sx={{height: 50, display: "flex", justifyContent: "center", alignItems: "center"}}>
      <AddLocationIcon color="primary" sx={{ position: "fixed", fontSize: 52 }} />
    </Box>
);

export const placeAddMarkerIcon = new L.DivIcon({
    iconSize: new L.Point(50, 50),
    iconAnchor: new L.Point(25, 47),
    popupAnchor: new L.Point(0, -45),
    html: iconHtml,
    className: 'map-marker'
});

const LocationMarkerIcon = createSvgIcon(
    <g>
      <path d="m 12,4 c -3.35,0 -6,2.57 -6,6.2 0,2.34 1.95,5.44 6,9.14 4.05,-3.7 6,-6.79 6,-9.14 C 18,6.57 15.35,4 12,4 Z" fill="#ffffff" />
      <path d="M 12,2 C 7.8,2 4,5.22 4,10.2 4,13.52 6.67,17.45 12,22 17.33,17.45 20,13.52 20,10.2 20,5.22 16.2,2 12,2 Z m 0,17.33 C 7.95,15.63 6,12.54 6,10.19 6,6.57 8.65,4 12,4 c 3.35,0 6,2.57 6,6.2 0,2.34 -1.95,5.44 -6,9.13z" />
    </g>,
    'LocationMarker'
);

const iconCache = {
    'success': {},
    'primary': {}
};

function generateMarkerIcon(kind, color) {
    const iconHtml = renderToStaticMarkup(
        <Box sx={{height: 50, display: "flex", justifyContent: "center", alignItems: "center"}}>
          <LocationMarkerIcon color="primary" sx={{ position: "fixed", fontSize: 52 }} />
          <PlaceIcon kind={kind} color={color} fontSize="small" sx={{ position: "fixed", marginBottom: 1 }} />
        </Box>
    );

    const markerIcon = new L.DivIcon({
        iconSize: new L.Point(50, 50),
        iconAnchor: new L.Point(25, 47),
        popupAnchor: new L.Point(0, -45),
        html: iconHtml,
        className: 'map-marker'
    });
    iconCache[color][kind] = markerIcon;
}

for (var kind of kinds) {
    generateMarkerIcon(kind, 'success');
    generateMarkerIcon(kind, 'primary');
}

function getMarkerIcon(kind, claimed) {
    const color = claimed ? 'success' : 'primary';
    return iconCache[color][kind];
}

export default function PlaceMarker(props) {
    return <Marker icon={getMarkerIcon(props.kind, props.claimed)} {...props} />
};
