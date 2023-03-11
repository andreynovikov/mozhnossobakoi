/* global ymaps */

import { useState, useEffect } from 'react';

import L from 'leaflet';
import { createTileLayerComponent, updateGridLayer, withPane } from '@react-leaflet/core';
import 'leaflet-plugins/layer/tile/Yandex';


const StabLayer = L.Layer.extend({
    options: {
        minZoom: 0,
        maxZoom: 19
    },
    onAdd: function (map) {}, // eslint-disable-line no-unused-vars
    beforeAdd: function (map) { map._addZoomLimit(this) },
    onRemove: function (map) { map._removeZoomLimit(this) }
});

const stabLayer = createTileLayerComponent(function createTileLayer({ type, ...options }, context) {
            return {
                instance: new StabLayer(type, withPane(options, context)),
                context
            }
        }, updateGridLayer);

export default function YandexTileLayer({type, ...options}) {  // eslint-disable-line no-unused-vars
    const [Layer, setLayer] = useState(stabLayer);

    const createLayer = () => {
        setLayer(createTileLayerComponent(function createTileLayer({ type, ...options }, context) {
            return {
                instance: new L.Yandex(type, withPane(options, context)),
                context
            }
        }, updateGridLayer));
    };

    useEffect(() => {
        new Promise((resolve, reject) => {
            if ('ymaps' in window)
                return resolve();
            const scriptElement = document.createElement('script');
            scriptElement.onload = resolve;
            scriptElement.onerror = reject;
            scriptElement.type = 'text/javascript';
            scriptElement.src = '//api-maps.yandex.ru/2.1/?lang=ru_RU';
            document.body.appendChild(scriptElement);
        }).then(() => {
            ymaps.ready(createLayer);
        });
    }, []);

    return <Layer />;
}
