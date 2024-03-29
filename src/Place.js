import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

import ReactGA from 'react-ga4';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ShareIcon from '@mui/icons-material/Share';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

import { SocialIcon } from 'react-social-icons';

import moment from 'moment';
import 'moment/locale/ru';

import {
    placeKeys,
    loadPlace,
} from './queries';

import PlaceIcon from './PlaceIcon';
import PlaceMap from './PlaceMap';
import PlaceReviewForm from './PlaceReviewForm';
import PlaceShareDialog from './PlaceShareDialog';
import { formatPhoneNumber } from './utils';
import { useDocumentTitle } from './hooks';

import './Place.css';


export default function Place({id, mobile, fromMap, onShowLocation, setDocumentTitle}) {
    const [title, setTitle] = useState('');
    const [reviewMode, setReviewMode] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    useDocumentTitle(title);
    const location = useLocation();

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

    useEffect(() => {
        if (isSuccess) {
            if (setDocumentTitle)
                setTitle(place.name + ': описание места, куда можно с собакой');
            ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: place.name });
        }
    }, [place, isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      isSuccess && place ?
        <Box>

          <Stack direction="row" alignItems="baseline" spacing={1} sx={{mb:2}}>
            <PlaceIcon kind={place.kind} fontSize="large" color={place.claimed ? "success" : "primary"} />
            <Typography variant={ mobile ? "h5" : id ? "h3" : "h1"} component="h2">
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
              {place.url && <Link href={place.url} target="_blank" variant="caption">{place.url.replace(/https?:\/\//, '')}</Link>}
            </Stack>
            <Stack direction="column" spacing={0.5}>
              {place.vk && <SocialIcon url={place.vk} target="_blank" style={{ height: 22, width: 22 }} />}
              {place.facebook && <SocialIcon url={place.facebook} target="_blank" style={{ height: 22, width: 22 }} />}
              {place.telegram && <SocialIcon url={`https://telegram.me/${place.telegram}`} target="_blank" style={{ height: 22, width: 22 }} />}
              {place.instagram && <SocialIcon url={`https://instagram.com/${place.instagram}`} network="linkedin" bgColor="#e94475" target="_blank" style={{ height: 22, width: 22 }} />}
            </Stack>
          </Stack>

          {place.claim && <Typography variant="body1" gutterBottom>{place.claim}</Typography>}

          {reviewMode ?
            <PlaceReviewForm placeId={place.id} mobile={mobile} onClose={() => setReviewMode(false)} />
          :
           <Stack direction="row" spacing={1} sx={{my: 1.5}}>
              <Button variant="outlined" size={mobile ? "small" : "medium"} onClick={() => setReviewMode(true)}>
                Оставить отзыв
              </Button>
              <Button variant="outlined" size={mobile ? "small" : "medium"} onClick={()=> setShareOpen(true)}>
                <ShareIcon />
              </Button>
            </Stack>
          }

          {place.reviews.length > 0 && <Grid container direction={mobile ? "column" : "row"} spacing={2} sx={{ my: 1 }}>
            {place.reviews.map((review) =>
              <Grid item key={review.id}>
                <Paper sx={{p: 1, minWidth: 200, maxWidth: mobile ? "inherit" : 320}}>
                  <Typography variant="body1" gutterBottom>
                    { review.rating > 0 ?
                      <ThumbUpOffAltIcon color="success" fontSize="small" sx={{float: "right", ml: 1, mb: 1}} />
                    : review.rating < 0 ?
                      <ThumbDownOffAltIcon color="error" fontSize="small" sx={{float: "right", ml: 1, mb: 1}} />
                    : null }
                    &laquo;{review.message}&raquo;
                  </Typography>
                  <Typography sx={{ display: 'flex', justifyContent: 'flex-end' }} variant="caption" color="text.secondary">
                    {moment(review.visited).format('MMMM YYYY')}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>}

          {!fromMap && <Box sx={{mt: 2, mb: 1, width: "100%", height: 300}}>
            <PlaceMap position={place.position} kind={place.kind} claimed={place.claimed} onShowLocation={() => onShowLocation(place.position)} />
          </Box>}

          <PlaceShareDialog place={place} open={shareOpen} onClose={() => setShareOpen(false)} />

        </Box>
      :
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
}

Place.defaultProps = {
    setDocumentTitle: false
};
