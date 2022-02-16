import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';

import {
    locationKeys,
    loadLocations,
} from './queries';


const allActions = [
    "camp",
    "hotel",
    "cafe",
    "shop",
    "park"
];

function simplifyLocation(option) {
    return option.replace('город ', '').replace('республика ', '');
}

function cityComparator(a, b) {
    if (a.startsWith('город')) {
        if (b.startsWith('город')) {
            return a.localeCompare(b);
        } else {
            return -1;
        }
    } else if (b.startsWith('город')) {
        return 1;
    } else {
        return 0;
    }
}

function regionComparator(a, b) {
    if (a.endsWith('область') || a.endsWith('край') || a.startsWith('республика')) {
        if (b.endsWith('область') || b.endsWith('край') || b.startsWith('республика')) {
            return a.replace('республика ', '').localeCompare(b.replace('республика ', ''));
        } else {
            return -1;
        }
    } else if (b.endsWith('область') || b.endsWith('край') || b.startsWith('республика')) {
        return 1;
    } else {
        return 0;
    }
}

function chainedComparator(...comparators) {
    return (a, b) => {
        var order = 0;
        var i = 0;
        while (!order && comparators[i]) {
            order = comparators[i++](a, b);
        }
        return order;
    };
}

export default function PlaceFilter({mobile, action, address, onFiltersChanged}) {
    const [actions, setActions] = useState(allActions);
    const [locations, setLocations] = useState([]);
    const [subLocations, setSubLocations] = useState([]);

    const {data, isSuccess} = useQuery(
        locationKeys.lists(),
        () => loadLocations(),
        {
            onError: (error) => {
                console.error(error);
            }
        }
    );

    const generateSubLocations = () => {
        const location = address.split(', ')[0];
        const l = Object.keys(data.results[location]);
        const a = l.reduce((list, name) => {
            for (var kind of Object.keys(data.results[location][name]))
                if (list.indexOf(kind) < 0)
                    list.push(kind);
            return list;
        }, []);
        l.sort(chainedComparator(
            cityComparator,
            (a, b) => {
                return a.localeCompare(b);
            }
        ));
        if (l.includes(''))
            l.splice(l.indexOf(''), 1); // remove ''
        setSubLocations(l);
        setActions(a);
        if (action && a.indexOf(action) < 0)
            setAction(null);
    };

    useEffect(() => {
        if (isSuccess) {
            var l = Object.keys(data.results);
            l.sort(chainedComparator(
                cityComparator,
                regionComparator,
                (a, b) => {
                    return a.localeCompare(b);
                }
            ));
            var t = 0;
            l = l.reduce((list, name) => {
                if (name.startsWith('город')) {
                    if (t === 0) t++;
                } else if (name.endsWith('область') || name.endsWith('край') || name.startsWith('республика')) {
                    if (t === 1) {
                        list.push(''); // divider
                        t++;
                    }
                } else if (t > 0) {
                    list.push(''); // divider
                    t = 0;
                }
                list.push(name);
                return list;
            }, []);
            setLocations(l);
        }
    }, [isSuccess, data]);

    useEffect(() => {
        if (data && address)
            generateSubLocations();
    }, [data, address]);

    const setAction = (newAction) => {
        newAction = newAction || null;
        console.log('new action:', newAction);
        if (newAction !== action)
            onFiltersChanged(newAction, address);
    };

    const setLocation = (location) => {
        console.log('location');
        // call listener, sublocations will be updated on address change
        if (location) {
            onFiltersChanged(action, location);
        } else {
            setActions(allActions);
            onFiltersChanged(action, null);
        }
    };

    const setSubLocation = (subLocation) => {
        console.log('sublocation');
        const location = address?.split(', ')[0];
        if (subLocation) {
            const a = Object.keys(data.results[location][subLocation]);
            setActions(a);
            if (action && a.indexOf(action) < 0)
                onFiltersChanged(null, location + ', ' + subLocation);
            else
                onFiltersChanged(action, location + ', ' + subLocation);
        } else if (location) {
            onFiltersChanged(action, location);
        } else {
            onFiltersChanged(action, null);
        }
    };

    return (
      <Stack direction={mobile ? "column": "row"} spacing={1}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="location-select-label">Где находится?</InputLabel>
          <Select
            labelId="location-select-label"
            disabled={locations.length === 0}
            value={(locations.length && address?.split(', ')[0]) || ''}
            label="Где находится?"
            autoWidth
            renderValue={simplifyLocation}
            onChange={(event) => setLocation(event.target.value)}
          >
            <MenuItem key="none" value="" dense>Всё равно</MenuItem>
            <Divider key="none-div" />
            {locations.map((location, idx) =>
              location ? <MenuItem key={idx} value={location} dense sx={{ pr: 3 }}>{simplifyLocation(location)}</MenuItem> : <Divider key={idx} />
            )}
          </Select>
        </FormControl>
        { subLocations.length ? (
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="sub-location-select-label">Уточните расположение</InputLabel>
            <Select
              labelId="sub-location-select-label"
              disabled={subLocations.length === 0}
              value={(subLocations.length && address?.split(', ')[1]) || ''}
              label="Уточните расположение"
              autoWidth
              renderValue={simplifyLocation}
              onChange={(event) => setSubLocation(event.target.value)}
            >
              <MenuItem key="none" value="" dense>Всё равно</MenuItem>
              <Divider key="none-div" />
              {subLocations.map((location, idx) =>
                <MenuItem key={idx} value={location} dense sx={{ pr: 3 }}>{simplifyLocation(location)}</MenuItem>
              )}
            </Select>
          </FormControl>
        ) : ''}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="action-select-label">Что интересует?</InputLabel>
          <Select
            labelId="action-select-label"
            value={action || ''}
            label="Что интересует?"
            autoWidth
            onChange={(event) => setAction(event.target.value)}
          >
            <MenuItem key="none" value="" dense>Всё</MenuItem>
            {actions.length > 0 && <Divider key="none-div" />}
            {actions.indexOf('camp') >= 0 && <MenuItem key="camp" value="camp" dense>Пожить на природе</MenuItem>}
            {actions.indexOf('hotel') >= 0 && <MenuItem key="hotel" value="hotel" dense>Переночевать</MenuItem>}
            {actions.indexOf('cafe') >= 0 && <MenuItem key="cafe" value="cafe" dense>Поесть</MenuItem>}
            {actions.indexOf('shop') >= 0 && <MenuItem key="shop" value="shop" dense>Купить</MenuItem>}
            {actions.indexOf('park') >= 0 && <MenuItem key="park" value="park" dense>Погулять</MenuItem>}
            {actions.indexOf('other') >= 0 && <MenuItem key="other" value="other" dense>Другое</MenuItem>}
          </Select>
        </FormControl>
      </Stack>
    );
};
