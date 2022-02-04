import { useState, useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Marker } from 'react-leaflet';

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
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef} />
        : null
    )
});
