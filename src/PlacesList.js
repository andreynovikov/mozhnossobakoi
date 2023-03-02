import { Fragment, useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

import ReactGA from 'react-ga4';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    const [notice, setNotice] = useState('');
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

    const {data, isLoading, isSuccess, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
        placeKeys.list(actionFilter, addressFilter),
        ({ pageParam = 1 }) => loadPlaces(actionFilter, addressFilter, pageParam),
        {
            getPreviousPageParam: (firstPage) => firstPage.page > 1 ? firstPage.page - 1 : undefined,
            getNextPageParam: (lastPage) => lastPage.page * 20 < lastPage.count ? lastPage.page + 1 : undefined,
            onError: (error) => {
                console.error(error);
            }
        }
    );

    const { ref: loadMoreRef } = useInView({
        onChange: (inView) => inView && hasNextPage && fetchNextPage()
    });

    useEffect(() => {
        if (!isLoading && data?.pages?.[0].results?.length === 0) {
            setTitle("К сожалению, нет мест, удовлетворяющих выбранным критериям. Попробуйте изменить фильтры.");
            return;
        }
        var title = 'Места';
        var notice = 'Это все dogfriendly места';
        if (actionFilter) {
            const action = humanizeAction(actionFilter);
            title += ', где ' + action;
            notice += ', где можно ' + action;
            if (!addressFilter)
                title += ' там';
        }
        if (addressFilter) {
            const address = humanizeAddress(addressFilter);
            title += ' в ' + address;
            notice += ' в ' + address;
        }
        setTitle(title + ', куда можно с собакой');
        setNotice(notice + ', которые нам известны.');
    }, [actionFilter, addressFilter, isLoading, data]);

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: title }); // we place it here to send correct page title
    }, [title, location]);

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

    const length = data?.pages ? data.pages.reduce((length, page) => { return length + page.results.length }, 0) : 0;

    return (
      <Box sx={{ p: 2, position: "relative", overflow: "auto" }}>
        <Box sx={{ p: 1 }}><PlaceFilter mobile={mobile} action={actionFilter} address={addressFilter} onFiltersChanged={onFiltersChanged}/></Box>
        <Typography gutterBottom variant={mobile ? "h5" : "h4"} component="h1" sx={{ px: 1, mt: 2 }}>{title}</Typography>
        {isLoading ? (
          <Box sx={{ p: 1, maxWidth: { xs: "100%", md: "50%", lg: "33%", xl: "25%"} }}>
            <PlaceCard place={{}} mobile={mobile} loading />
          </Box>
        ) : isSuccess && data?.pages && (
          <Masonry columns={{ xs: 1, md: 2, lg: Math.max(2, Math.min(3, length)), xl: Math.max(2, Math.min(4, length)) }} spacing={0}>
              {data.pages.map((page, pageIndex) =>
                  <Fragment key={page.page}>
                      {page.results.map((place, placeIndex) =>
                          <Box key={place.id} ref={(pageIndex * 20 + placeIndex) === length - 1 ? loadMoreRef : undefined } sx={{ p: 1 }}>
                              <PlaceCard place={place} mobile={mobile} onOpenPlace={onOpenPlace} onShowLocation={onShowLocation} />
                          </Box>
                      )}
                  </Fragment>
              )}
          </Masonry>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5, pb: 1 }}>
          {hasNextPage ? (
            <Button variant="outlined" size="small" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Загружаем ещё места...' : 'Загрузить больше мест'}
            </Button>
          ) : length > 0 ? (
            <Typography gutterBottom variant="body2">
              {notice}
            </Typography>
          ) : null}
        </Box>
        <PlaceDrawer ref={drawerRef} open={open} onClose={onClose} mobile={mobile} id={placeId} onShowLocation={onShowLocation} />
      </Box>
    );
}
