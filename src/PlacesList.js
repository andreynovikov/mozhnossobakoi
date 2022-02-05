import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

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

import {
    placeKeys,
    loadPlaces,
} from './queries';

import PlaceIcon from './PlaceIcon';


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
      <Box sx={{ display: 'flex', justifyContent: 'center', px: 3, py: 2 }}>
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
                   {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} style={{ height: 22, width: 22 }} />}
             </Stack>

                  {place.claim && <Typography variant="body2" gutterBottom={!!place.url}>
                  {place.claim}
                  </Typography>}
                        {place.url && <Link href={place.url} variant="caption">{place.url}</Link>}
                 </CardContent>
                 <CardActions>
                   <Button size="small" onClick={() => onShowLocation(place.position)}>Показать на карте</Button>
                 </CardActions>
               </Card>
             </Grid>
           )}
         </Grid> : <CircularProgress />}
      </Box>
    );
}
