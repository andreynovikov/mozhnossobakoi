import { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useQuery } from 'react-query';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import L from 'leaflet';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import {
    placeKeys,
    loadPlaces,
    loadPlace,
} from './queries';

import PlaceIcon from './PlaceIcon';
import PlaceMarker from './PlaceMarker';

import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './PlacesLayer.css';


export default function PlacesLayer({mobile, onPlaceDetails}) {
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
                  <Box>
                    <Typography variant="h6" component="h6" gutterBottom>
                       <PlaceIcon kind={place.kind} color={place.claimed ? "success" : "primary"} style={{ verticalAlign: 'text-top', display: 'inline-flex' }} sx={{ mr: 0.5 }} />
                       {place.name}
                    </Typography>
                    {place.claim ?
                      <Typography variant={place.claim.length > 100 ? "body2" : "body1"} gutterBottom>
                        {place.claim}
                      </Typography>
                    : place.reviews.length > 0 && <Typography variant="body1" gutterBottom>
                       &laquo;{place.claim || place.reviews[0].message}&raquo;
                    </Typography>}
                    <Button size="small" onClick={() => onOpenPlace(place.id)}>Подробнее</Button>
                  </Box>,
                  container
                );
                marker.bindPopup(container, mobile ? undefined : { maxWidth: 450 });
            }
            setTimeout(() => marker.openPopup(), 100);
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

    const onOpenPlace = (id) => {
        marker.closePopup();
        setPlaceId(0);
        onPlaceDetails(id);
    };

    return (
        isSuccess && data ? (
          <MarkerClusterGroup showCoverageOnHover={false}>
            {data.results.map((place, idx) =>
              <PlaceMarker key={`marker-${idx}`} kind={place.kind} claimed={place.claimed} position={place.position} eventHandlers={{ click: (e) => handleMarkerClick(e, place.id) }} />
            )}
          </MarkerClusterGroup>
        ) : null
    );
};
