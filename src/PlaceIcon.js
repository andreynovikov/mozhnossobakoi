import { styled } from '@mui/material/styles';

import CoffeeIcon from '@mui/icons-material/Coffee';
import CottageIcon from '@mui/icons-material/Cottage';
import CabinIcon from '@mui/icons-material/Cabin';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ForestIcon from '@mui/icons-material/Forest';
import DiningIcon from '@mui/icons-material/Dining';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HotelIcon from '@mui/icons-material/Hotel';
import NightShelterIcon from '@mui/icons-material/NightShelter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
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

export default function PlaceIcon(props) {
    const StyledIcon = styled(kindIcons[props.kind] || kindIcons["other"])(props.style || {});
    return <StyledIcon {...props} />;
};
