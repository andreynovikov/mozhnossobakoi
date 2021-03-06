import { useState, useEffect, forwardRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

import moment from 'moment';
import 'moment/locale/ru';

import {
    placeKeys,
    createPlace
} from './queries';

import PlaceIcon from './PlaceIcon';


export default forwardRef(function NewPlaceDrawer({open, onClose, mobile, position}, ref) {
    const [kind, setKind] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visited, setVisited] = useState(null);

    const queryClient = useQueryClient();

    const addPlace = useMutation(data => createPlace(data), {
        onSuccess: (data) => {
            queryClient.invalidateQueries(placeKeys.lists());
            queryClient.setQueryData(placeKeys.detail(data.id), data);
        }
    });

    useEffect(() => {
        if (!open) {
            setKind("");
            setName("");
            setDescription("");
            setVisited(null);
        }
    }, [open]);

    useEffect(() => {
        console.log(position);
    }, [position]);

    useEffect(() => {
        console.log(visited?.format("dddd, MMMM Do YYYY, h:mm:ss a"));
    }, [visited]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = {
            kind: kind,
            name: name,
            description: description.trim(),
            position: position,
            visited: visited?.date(1).format('YYYY-MM-DD')
        };
        console.log(data);
        addPlace.mutate(data, { onSuccess: () => { onClose() }});
    };

    return (
        <Drawer ref={ref}
            anchor={mobile ? "bottom" : "right"}
            variant="persistent"
            open={open}
            onClose={onClose}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                autoComplete="off"
                sx={{ mx: 2, mb: mobile ? 0.5 : 0, maxWidth: mobile ? "inherit" : 400, maxHeight: mobile ? "70vh" : "inherit" }}
            >

                <TextField
                    required
                    select
                    fullWidth
                    size={mobile ? "small" : "medium"}
                    margin="normal"
                    label="?????? ??????????"
                    value={kind}
                    onChange={(event) => { setKind(event.target.value) }}
                >
                    <MenuItem key="hotel" value="hotel">
                        <PlaceIcon kind="hotel" fontSize="small" sx={{ mr: 1 }} />
                        ?????????? / ????????????????????????
                    </MenuItem>
                    <MenuItem key="camp" value="camp">
                        <PlaceIcon kind="camp" fontSize="small" sx={{ mr: 1 }} />
                        ???????? ???????????? / ???????????????????? ????????
                    </MenuItem>
                    <MenuItem key="cafe" value="cafe">
                        <PlaceIcon kind="cafe" fontSize="small" sx={{ mr: 1 }} />
                        ???????? / ?????? / ????????????????
                    </MenuItem>
                    <MenuItem key="shop" value="shop">
                        <PlaceIcon kind="shop" fontSize="small" sx={{ mr: 1 }} />
                        ??????????????
                    </MenuItem>
                    <MenuItem key="park" value="park">
                        <PlaceIcon kind="park" fontSize="small" sx={{ mr: 1 }} />
                        ???????? / ???????? ???????????? / ??????????????
                    </MenuItem>
                    <MenuItem key="other" value="other">
                        <PlaceIcon kind="other" fontSize="small" sx={{ mr: 1 }} />
                        ????????????
                    </MenuItem>
                </TextField>

                <TextField
                    required
                    fullWidth
                    size={mobile ? "small" : "medium"}
                    margin="normal"
                    label="????????????????"
                    helperText="???????????????????? ???????????? ?? ???????????????? ???????????? ?????????????? ???? ?????????? ?????? ?????????????? ?????????? ?? ????????????????"
                    value={name}
                    onChange={(event) => { setName(event.target.value) }}
                />
                <TextField
                    required
                    fullWidth
                    size={mobile ? "small" : "medium"}
                    margin="normal"
                    label="????????????????"
                    helperText="?????????????? ????????????????, ?? ?????????? ?????????????? ?? ???? ?????????? ???????????????? ???? ?????? ????????????????"
                    multiline
                    minRows={mobile ? 1 : 3}
                    maxRows={5}
                    value={description}
                    onChange={(event) => { setDescription(event.target.value) }}
                />

                <LocalizationProvider dateAdapter={AdapterMoment} locale="ru">
                    <DatePicker
                        views={['year', 'month']}
                        label="???????? ??????????????????"
                        minDate={moment().subtract(11, 'years')}
                        maxDate={moment()}
                        disableFuture
                        value={visited}
                        onChange={(value) => { setVisited(value) }}
                        renderInput={(params) => <TextField
                                                     {...params}
                                                     helperText="???????? ??????????????, ?????????????? ?????????????????? ?????????? ?? ?????? ??????????????????"
                                                     fullWidth size={mobile ? "small" : "medium"}
                                                     margin="normal" />
                                    }
                    />
                </LocalizationProvider>

                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                >
                    <Grid item>
                        <Button
                            type="submit"
                            variant="contained"
                            size={mobile ? "normal" : "large"}
                            sx={{my: 2}}
                        >
                            ????????????????
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            size={mobile ? "normal" : "large"}
                            sx={{my: 2}}
                            onClick={() => {onClose();}}
                        >
                            ??????????????
                        </Button>
                    </Grid>
                </Grid>
                <FormHelperText>?????????????? ???????????? "????????????????", ???? ?????????? ???????????????? ???? ??????????????????, ???????????????????????????? ???????????? ?? ???????????????????? ?????????????????????????????? ???????? ????????????????????</FormHelperText>
            </Box>
        </Drawer>
    );
});
