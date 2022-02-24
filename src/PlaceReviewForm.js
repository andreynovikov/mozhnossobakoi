import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

import moment from 'moment';
import 'moment/locale/ru';

import {
    placeKeys,
    reviewKeys,
    createReview
} from './queries';


export default function PlaceReviewForm({placeId, mobile, onClose}) {
    const [impression, setImpression] = useState("");
    const [message, setMessage] = useState("");
    const [visited, setVisited] = useState(null);

    const queryClient = useQueryClient();

    const addReview = useMutation(data => createReview(placeId, data), {
        onSuccess: (data) => {
            queryClient.invalidateQueries(reviewKeys.list(placeId));
            queryClient.invalidateQueries(placeKeys.detail(placeId));
        }
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            message: message.trim(),
            rating: impression,
            visited: visited?.date(1).format('YYYY-MM-DD')
        };
        console.log(data);
        addReview.mutate(data, { onSuccess: () => { onClose() }});
    };

    return (
      <Paper component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{p: 1}}>
        <Stack direction="row">
          <IconButton color="success" aria-label="add an alarm" onClick={() => setImpression(impression === 'good' ? '' : 'good')}>
            {impression === 'good' ? <ThumbUpIcon /> : <ThumbUpOffAltIcon /> }
          </IconButton>
          <IconButton color="error" aria-label="add an alarm" onClick={() => setImpression(impression === 'bad' ? '' : 'bad')}>
            {impression === 'bad' ? <ThumbDownIcon /> : <ThumbDownOffAltIcon /> }
          </IconButton>
        </Stack>

        <TextField
          required
          fullWidth
          size={mobile ? "small" : "medium"}
          margin="normal"
          label="Описание"
          helperText="Опишите подробно, с какой собакой и на каких условиях вы тут побывали, какие впечатления остались"
          multiline
          minRows={mobile ? 2 : 3}
          maxRows={5}
          value={message}
          onChange={(event) => { setMessage(event.target.value) }}
        />

        <LocalizationProvider dateAdapter={AdapterMoment} locale="ru">
          <DatePicker
            views={['year', 'month']}
            label="Дата посещения"
            minDate={moment().subtract(11, 'years')}
            maxDate={moment()}
            disableFuture
            value={visited}
            onChange={(value) => { setVisited(value) }}
            renderInput={(params) => <TextField
                                       {...params}
                                       helperText="Если помните, укажите примерный месяц и год посещения"
                                       size={mobile ? "small" : "medium"}
                                       margin="normal" />
                        }
          />
        </LocalizationProvider>

        <Stack direction="row" spacing={1} sx={{my: 1}}>
          <Button type="submit" variant="contained" size={mobile ? "normal" : "large"}>
            Добавить
          </Button>
          <Button variant="outlined" size={mobile ? "normal" : "large"} onClick={() => {onClose()}}>
            Отменить
          </Button>
        </Stack>
        <FormHelperText>Нажимая кнопку "Добавить", Вы даёте согласие на обработку, стилистическую правку и публикацию предоставленной Вами информации</FormHelperText>
      </Paper>
    );
};
