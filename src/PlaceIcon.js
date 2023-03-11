import { styled } from '@mui/material/styles';

import CabinIcon from '@mui/icons-material/Cabin';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ForestIcon from '@mui/icons-material/Forest';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HotelIcon from '@mui/icons-material/Hotel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


// Deck

// Pets

const kindIcons = {
    "hotel": HotelIcon,
    "camp": CabinIcon,
    "cafe": FastfoodIcon,
    "shop": ShoppingCartIcon,
    "park": ForestIcon,
    "other": HomeWorkIcon
};

export const kinds =  Object.keys(kindIcons);

export default function PlaceIcon(props) {
    const StyledIcon = styled(kindIcons[props.kind] || kindIcons["other"])(props.style || {});
    return <StyledIcon {...props} />;
}
