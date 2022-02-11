import { useQuery } from 'react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
    loadPlace,
} from './queries';

import PlaceIcon from './PlaceIcon';
import { formatPhoneNumber } from './utils';

import './Place.css';


export default function Place({id, mobile}) {
    const {data: place, isSuccess} = useQuery(
        placeKeys.detail(id),
        () => loadPlace(id),
        {
            enabled: !!id,
            onError: (error) => {
                console.error(error);
            }
        }
    );

    return (
      isSuccess && place ?
        <Box>

          <Stack direction="row" alignItems="baseline" spacing={1} sx={{mb:2 }}>
            <PlaceIcon kind={place.kind} fontSize="large" color={place.claimed ? "success" : "primary"} />
            <Typography variant={ mobile ? "h5" : id ? "h3" : "h1"} component="h1">
              {place.name}
              {place.last_seen && moment(place.last_seen).isAfter('0001-01-01') && <Typography variant="caption" component="div" color="text.secondary">
                {moment(place.last_seen).format('MMMM YYYY')}
              </Typography>}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="column" spacing={0.5}>
              {place.address && <Typography variant="body2">{place.address}</Typography>}
              {place.phone && <Link variant="caption" underline="none" href={`tel:${place.phone}`} target="_blank" className="phone-link">{formatPhoneNumber(place.phone)}</Link>}
              {place.url && <Link href={place.url} target="_blank" variant="caption">{place.url}</Link>}
            </Stack>
            <Stack direction="column" spacing={0.5}>
              {place.telegram && <SocialIcon url={`https://telegram.me/${place.telegram}`} target="_blank" style={{ height: 22, width: 22 }} />}
              {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} target="_blank" style={{ height: 22, width: 22 }} />}
            </Stack>
          </Stack>

          {place.claim && <Typography variant="body1" gutterBottom>{place.claim}</Typography>}


          {place.reviews.length > 0 && <Grid container spacing={2} sx={{ my: 1 }}>
            {place.reviews.map((review, idx) =>
              <Grid item key={review.id}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      &laquo;{review.message}&raquo;
                    </Typography>
                    <Typography sx={{ display: 'flex', justifyContent: 'flex-end' }} variant="caption" color="text.secondary">
                      {moment(review.visited).format('MMMM YYYY')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>}

        </Box>
      :
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
};
