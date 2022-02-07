import { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useQuery } from 'react-query';
import { Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import L from 'leaflet';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import {
    placeKeys,
    loadPlaces,
    loadPlace,
} from './queries';

import PlaceIcon from './PlaceIcon';
import { formatPhoneNumber } from './utils';

import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './PlacesLayer.css';


export default function PlacesLayer() {
    const [placeId, setPlaceId] = useState(0);
    const [marker, setMarker] = useState(0);

    const {data, isSuccess} = useQuery(
        placeKeys.list(),
        () => loadPlaces(),
        {
            onError: (error) => {
                console.error(error);
            }
        }
    );

    const {data: place, isSuccess: isPlaceSuccess} = useQuery(
        placeKeys.detail(placeId),
        () => loadPlace(placeId),
        {
            enabled: !!placeId
        }
    );

    useEffect(() => {
        console.log('effect', isPlaceSuccess, placeId, place?.id, marker?._leaflet_id);
        if (isPlaceSuccess && placeId === place.id && placeId === marker?.placeId) {
            console.log('add', isPlaceSuccess, placeId, place.id, marker._leaflet_id);
            if (!marker.getPopup()) {
                const container = L.DomUtil.create('div');
                render(
                  <Stack direction="column" spacing={0.5}>
                    <Typography variant="h6" component="h6">
                       <PlaceIcon kind={place.kind} color={place.claimed ? "success" : "primary"} style={{ verticalAlign: 'text-top', display: 'inline-flex' }} sx={{ mr: 0.5 }} />
                       {place.name}
                    </Typography>
                    {(place.claim || place.reviews.length > 0) && <Typography variant="body1">
                      &laquo;{place.claim || place.reviews[0].message}&raquo;
                    </Typography>}
                    {place.phone && <Link variant="caption" underline="none" href={`tel:${place.phone}`} target="_blank" className="phone-link">{formatPhoneNumber(place.phone)}</Link>}
                    {place.url && <Link href={place.url} target="_blank" variant="caption">{place.url}</Link>}
                  </Stack>,
                  container
                );
                marker.bindPopup(container, {
                    minWidth: 300,
                    maxWidth: 450
                });
            }
            marker.openPopup();
        }
    }, [place, marker, placeId, isPlaceSuccess]);

    const handleMarkerClick = (e, id) => {
        console.log('click', id, e.target._leaflet_id);
        if (id === marker?.placeId) {
            setMarker(undefined);
            setPlaceId(0);
        } else {
            e.target.placeId = id;
            setMarker(e.target);
            setPlaceId(id);
        }
    };

    return (
        isSuccess && data ? (
          <MarkerClusterGroup showCoverageOnHover={false}>
            {data.results.map((marker, idx) =>
              <Marker key={`marker-${idx}`} position={marker.position} eventHandlers={{ click: (e) => handleMarkerClick(e, marker.id) }} />
            )}
          </MarkerClusterGroup>
        ) : null
    );
};
