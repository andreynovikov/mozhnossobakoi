import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SocialIcon } from 'react-social-icons';

import moment from 'moment';
import 'moment/locale/ru';

import {
    placeKeys,
    loadPlaces,
} from './queries';

import PlaceIcon from './PlaceIcon';
import { formatPhoneNumber } from './utils';


export default function PlacesList({onShowLocation}) {
    const {data, isSuccess} = useQuery(
        placeKeys.list(),
        () => loadPlaces(),
        {
            onError: (error) => {
                console.error(error);
            }
        }
    );

    return (
      <Box sx={{ justifyContent: 'center', px: 3, py: 2 }}>
         <Alert severity="info" sx={{mb: 3}}>Скоро здесь появится поиск по городу и типу места.</Alert>
         {isSuccess && data ? <Grid container spacing={2}>
           {data.results.map((place, idx) =>
             <Grid item key={place.id} xs={12} sm={6} md={4}>
               <Card sx={{ minWidth: 275 }}>
                 <CardContent>
                   <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.5}>
                     <Typography gutterBottom variant="h6" component="div">
                       <PlaceIcon kind={place.kind} fontSize="small" color={place.claimed ? "success" : "primary"} style={{ verticalAlign: 'text-top', display: 'inline-flex' }} sx={{ mr: 0.5 }} />
                       {place.name}
                     </Typography>
                     {place.last_visited && <Typography sx={{ mb: 1.5 }} variant="caption" color="text.secondary">
                       {moment(place.last_visited).format('MMMM YYYY')}
                     </Typography>}
                   </Stack>
                   <Stack direction="column" spacing={0.5}>
                     {place.address && <Typography variant="body2">{place.address}</Typography>}
                     {place.phone && <Typography variant="body2">{formatPhoneNumber(place.phone)}</Typography>}
                     {place.claim && <Typography variant="body1">{place.claim}</Typography>}
                     {place.url && <Link href={place.url} variant="caption">{place.url}</Link>}
                   </Stack>
                 </CardContent>
                 <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={0.5}>
                   <CardActions>
                     <Button size="small" onClick={() => onShowLocation(place.position)}>Показать на карте</Button>
                   </CardActions>
                   <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
                     {place.telegram && <SocialIcon url={`https://telegram.me/${place.telegram}`} style={{ height: 22, width: 22 }} />}
                     {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} style={{ height: 22, width: 22 }} />}
                   </Stack>
                 </Stack>
               </Card>
             </Grid>
           )}
         </Grid> : <CircularProgress />}
      </Box>
    );
}
