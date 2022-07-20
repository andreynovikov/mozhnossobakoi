import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { SocialIcon } from 'react-social-icons';

import moment from 'moment';
import 'moment/locale/ru';

import PlaceIcon from './PlaceIcon';
import PostalAddress from './PostalAddress';
import { formatPhoneNumber } from './utils';


export default function PlaceCard({place, mobile, onOpenPlace, onShowLocation, loading=false}) {
    return (
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              {loading ? (
                <Skeleton variant="circular" width={25} height={25}><PlaceIcon fontSize="small" /></Skeleton>
              ) : (
                <PlaceIcon kind={place.kind} fontSize="small" color={place.claimed ? "success" : "primary"} style={{ verticalAlign: "text-top" }} />
              )}
              <Typography variant="h6" component="div">
                {loading ? <Skeleton width="9em" /> : place.name}
              </Typography>
            </Stack>
            {(loading || (place.last_seen && moment(place.last_seen).isAfter('0001-01-01'))) && (
              <Typography sx={{ mb: 1.5, textAlign: "end" }} variant="caption" color="text.secondary">
                { loading ? <Skeleton width="5em" /> :  moment(place.last_seen).format('MMMM YYYY')}
              </Typography>
            )}
          </Stack>
          <Stack direction="column" spacing={0.5}>
            {loading ? (
              <React.Fragment>
                <Skeleton height={15} width="80%" />
                <Skeleton height={15} width="40%" />
                <Skeleton />
                <Skeleton width="85%" />
                <Skeleton width="90%" />
                <Skeleton height={12} width="30%" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {place.address && <Typography variant="body2"><PostalAddress address={place.address} /></Typography>}
                {place.phone && <Typography variant="body2">{formatPhoneNumber(place.phone)}</Typography>}
                {place.claim && <Typography variant="body1">{place.claim}</Typography>}
                {place.url && <Link href={place.url} target="_blank" variant="caption">{place.url.replace(/https?:\/\//, '')}</Link>}
              </React.Fragment>
            )}
          </Stack>

        </CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={0.5}>
          <CardActions disableSpacing sx={{ flexWrap: "wrap" }}>
            {loading ? (
              <React.Fragment>
                <Skeleton height={25} width="6em" sx={{ mx: 1 }} />
                <Skeleton height={25} width="8em" sx={{ mx: 1 }} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Button size="small" onClick={() => onOpenPlace(place.id)}>Подробнее</Button>
                <Button size="small" onClick={() => onShowLocation(place.position)}>Показать&nbsp;на&nbsp;карте</Button>
              </React.Fragment>
            )}
          </CardActions>
          <Stack direction="row" sx={{ flexWrap: "wrap", justifyContent: "flex-end", p: 0.5 }}>
            {place.vk && <SocialIcon url={place.vk} target="_blank" style={{ height: 22, width: 22, margin: 2 }} />}
            {place.facebook && <SocialIcon url={place.facebook} target="_blank" style={{ height: 22, width: 22, margin: 2 }} />}
            {place.telegram && <SocialIcon url={`https://telegram.me/${place.telegram}`} target="_blank" style={{ height: 22, width: 22, margin: 2 }} />}
            {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} network="linkedin" bgColor="#e94475" target="_blank" style={{ height: 22, width: 22, margin: 2 }} />}
          </Stack>
        </Stack>
      </Card>
    );
}

PlaceCard.propTypes = {
    loading: PropTypes.bool,
};
