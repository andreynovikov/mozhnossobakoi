import { useState, useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Marker } from 'react-leaflet';

import { placeAddMarkerIcon } from './PlaceMarker';


export default forwardRef(function DraggableMarker({visible, onPositionChange}, ref) {
    const [position, setPosition] = useState({ lat: 0, lng: 0 });
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [],
    );

    useEffect(() => {
        onPositionChange(position);
    }, [position, onPositionChange]);

    useImperativeHandle(ref, () => ({
        setPosition
    }));

    return (
        visible ?
          <Marker
            draggable
            icon={placeAddMarkerIcon}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef} />
        : null
    )
});
