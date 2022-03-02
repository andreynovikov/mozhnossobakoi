import { useParams } from "react-router-dom";

import Container from '@mui/material/Container';

import Place from './Place';
import { useDocumentTitle } from './hooks';


export default function PlaceView({id, mobile}) {
    const params = useParams();

    const placeId = id || params.id;

    useDocumentTitle('Описание места');

    return (
      <Container sx={{ my: 2 }}>
        <Place id={placeId} mobile={mobile} />
      </Container>
    );
}
