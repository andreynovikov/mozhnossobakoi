import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useSearchParams } from 'react-router-dom';

import ReactGA from 'react-ga4';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Masonry from '@mui/lab/Masonry';

import { SocialIcon } from 'react-social-icons';

import moment from 'moment';
import 'moment/locale/ru';

import {
    placeKeys,
    loadPlaces,
} from './queries';

import PlaceDrawer from './PlaceDrawer';
import PlaceFilter from './PlaceFilter';
import PlaceIcon from './PlaceIcon';
import PostalAddress from './PostalAddress';
import { useDocumentTitle } from './hooks';
import { formatPhoneNumber } from './utils';


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

    const {data, isSuccess} = useQuery(
        placeKeys.list(actionFilter, addressFilter),
        () => loadPlaces(actionFilter, addressFilter),
        {
            onError: (error) => {
                console.error(error);
            }
        }
    );

    useEffect(() => {
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
    }, [actionFilter, addressFilter]);

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
      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 1 }}><PlaceFilter mobile={mobile} action={actionFilter} address={addressFilter} onFiltersChanged={onFiltersChanged}/></Box>
        <Typography gutterBottom variant={mobile ? "h5" : "h4"} component="h1" sx={{ px: 1, mt: 2 }}>{title}</Typography>
          {isSuccess && data?.results ? <Masonry columns={{ xs: 1, sm: 2, md: 3, xl: Math.max(2, Math.min(4, data.results.length)) }} spacing={0}>
          {data.results.map((place, idx) =>
            <Box key={place.id} sx={{ p: 1 }}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.5}>
                    <Typography gutterBottom variant="h6" component="div">
                      <PlaceIcon kind={place.kind} fontSize="small" color={place.claimed ? "success" : "primary"} style={{ verticalAlign: 'text-top', display: 'inline-flex' }} sx={{ mr: 0.5 }} />
                      {place.name}
                    </Typography>
                    {place.last_seen && moment(place.last_seen).isAfter('0001-01-01') && <Typography sx={{ mb: 1.5 }} variant="caption" color="text.secondary">
                      {moment(place.last_seen).format('MMMM YYYY')}
                    </Typography>}
                  </Stack>
                  <Stack direction="column" spacing={0.5}>
                    {place.address && <Typography variant="body2"><PostalAddress address={place.address} /></Typography>}
                    {place.phone && <Typography variant="body2">{formatPhoneNumber(place.phone)}</Typography>}
                    {place.claim && <Typography variant="body1">{place.claim}</Typography>}
                    {place.url && <Link href={place.url} target="_blank" variant="caption">{place.url}</Link>}
                  </Stack>
                </CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={0.5}>
                  <CardActions>
                    <Button size="small" onClick={() => onOpenPlace(place.id)}>Подробнее</Button>
                    <Button size="small" onClick={() => onShowLocation(place.position)}>Показать на карте</Button>
                  </CardActions>
                  <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
                    {place.telegram && <SocialIcon url={`https://telegram.me/${place.telegram}`} target="_blank" style={{ height: 22, width: 22 }} />}
                    {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} target="_blank" style={{ height: 22, width: 22 }} />}
                  </Stack>
                </Stack>
              </Card>
            </Box>
          )}
        </Masonry>
        :
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>}
        <PlaceDrawer ref={drawerRef} open={open} onClose={onClose} mobile={mobile} id={placeId} />
      </Box>
    );
}
