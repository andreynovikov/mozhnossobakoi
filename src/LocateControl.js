import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

import Locate from 'leaflet.locatecontrol';

import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';


function LocateControl({options, startDirectly}) {
    const map = useMap();

    useEffect(() => {
        const lc = new Locate(options);
        lc.addTo(map);

        if (startDirectly) {
            // request location update and set location
            lc.start();
        }
    // eslint-disable-next-line
    }, [map]);

    return null;
}

export default LocateControl;
