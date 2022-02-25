import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useSearchParams } from 'react-router-dom';

import ReactGA from 'react-ga4';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Masonry from '@mui/lab/Masonry';

import {
    placeKeys,
    loadPlaces,
} from './queries';

import PlaceCard from './PlaceCard';
import PlaceDrawer from './PlaceDrawer';
import PlaceFilter from './PlaceFilter';
import { useDocumentTitle } from './hooks';


function humanizeAction(action) {
    switch (action) {
    case 'camp':
        return 'пожить на природе';
    case 'hotel':
        return 'переночевать';
    case 'cafe':
        return 'поесть';
    case 'shop':
        return 'купить что-то';
    case 'park':
        return 'погулять';
    default:
        return 'заняться чем-то другим';
    }
}

function humanizeAddress(address) {
    return address
        .replace('город ', 'городе ')
        .replace('республика ', 'республике ')
        .replace('ая область', 'ой области')
        .replace('ий край', 'ом крае')
        .replace('ий район', 'ом районе');
}

export default function PlacesList({mobile, onShowLocation}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [title, setTitle] = useState('');
    const [actionFilter, setActionFilter] = useState(searchParams.get('action'));
    const [addressFilter, setAddressFilter] = useState(searchParams.get('address'));
    const [open, setOpen] = useState(false);
    const [placeId, setPlaceId] = useState();

    const drawerRef = useRef();

    useDocumentTitle(title);
    const location = useLocation();

    useEffect(() => {
        setActionFilter(searchParams.get('action'));
        setAddressFilter(searchParams.get('address'));
    }, [searchParams]);

    const {data, isSuccess, isFetching} = useQuery(
        placeKeys.list(actionFilter, addressFilter),
        () => loadPlaces(actionFilter, addressFilter),
        {
            onError: (error) => {
                console.error(error);
            }
        }
    );

    useEffect(() => {
        if (!isFetching && data?.results?.length === 0) {
            setTitle("К сожалению, нет мест, удовлетворяющих выбранным критериям. Попробуйте изменить фильтры.");
            return;
        }
        var title = 'Места';
        if (actionFilter) {
            title += ', где ' + humanizeAction(actionFilter);
            if (!addressFilter)
                title += ' там';
        }
        if (addressFilter)
            title += ' в ' + humanizeAddress(addressFilter);
        title += ', куда можно с собакой';
        setTitle(title);
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: title }); // we place it here to send correct page title
    }, [actionFilter, addressFilter, isFetching, data]);

    const onFiltersChanged = (action, address) => {
        console.log('action changed:', action);
        console.log('address changed:', address);
        var params = {};
        if (action)
            params['action'] = action;
        if (address)
            params['address'] = address;
        setSearchParams(params);
        setActionFilter(action);
        setAddressFilter(address);
    }

    const onOpenPlace = (id) => {
        setPlaceId(id);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    return (
      <Box sx={{ p: 2, position: "relative", overflow: "auto" }}>
        <Box sx={{ p: 1 }}><PlaceFilter mobile={mobile} action={actionFilter} address={addressFilter} onFiltersChanged={onFiltersChanged}/></Box>
        <Typography gutterBottom variant={mobile ? "h5" : "h4"} component="h1" sx={{ px: 1, mt: 2 }}>{title}</Typography>
        {isFetching ? (
          <Box sx={{ p: 1, maxWidth: { xs: "100%", md: "50%", lg: "33%", xl: "25%"} }}>
            <PlaceCard place={{}} mobile={mobile} loading />
          </Box>
        ) : isSuccess && data?.results && (
          <Masonry columns={{ xs: 1, md: 2, lg: Math.max(2, Math.min(3, data.results.length)), xl: Math.max(2, Math.min(4, data.results.length)) }} spacing={0}>
            {data.results.map((place, idx) =>
              <Box key={place.id} sx={{ p: 1 }}>
                <PlaceCard place={place} mobile={mobile} onOpenPlace={onOpenPlace} onShowLocation={onShowLocation} />
              </Box>
            )}
          </Masonry>
        )}
        <PlaceDrawer ref={drawerRef} open={open} onClose={onClose} mobile={mobile} id={placeId} />
      </Box>
    );
}
