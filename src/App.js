import { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet, Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import ReactGA from 'react-ga4';

import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import PetsIcon from '@mui/icons-material/Pets';
import MenuIcon from '@mui/icons-material/Menu';

import { SocialIcon } from 'react-social-icons';

import Map from './Map';
import PlacesList from './PlacesList';
import PlaceView from './PlaceView';
import About from './About';
import Help from './Help';

import './App.css';


ReactGA.initialize('G-JGSV7BSDK1');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: Infinity
        },
    },
});

export default function App() {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

    const mapRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('New location:', location.pathname);
    }, [location]);

    const onShowLocation = (position) => {
        navigate('/');
        new Promise(function (resolve, reject) {
            (function waitForMap() {
                if (mapRef && mapRef.current) return resolve();
                setTimeout(waitForMap, 30);
            })();
        }).then(() => {
            mapRef.current.showLocation([position.lat, position.lng]);
        });
    };

    const handleAdd = () => {
        navigate('/');
        new Promise(function (resolve, reject) {
            (function waitForMap() {
                if (mapRef && mapRef.current) return resolve();
                setTimeout(waitForMap, 30);
            })();
        }).then(() => {
            mapRef.current.handleAdd();
        });
    };

    return (
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Layout mobile={mobile} handleAdd={handleAdd} />}>
            <Route index element={<Map ref={mapRef} mobile={mobile} />} />
            <Route path="places" element={<PlacesList mobile={mobile} onShowLocation={onShowLocation} />} />
            <Route path="places/:id" element={<PlaceView mobile={mobile} /> } />
            <Route path="help" element={<Help mobile={mobile} />} />
            <Route path="about" element={<About mobile={mobile} />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    );
}

const pages = [
    {
        title: 'Список мест',
        to: '/places'
    },
    {
        title: 'Помощь',
        to: '/help'
    },
    {
        title: 'О проекте',
        to: '/about'
    }
];

function Layout({mobile, handleAdd}) {
    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (e) => {
        setAnchorElNav(e.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
      <div className="App">
        <Box component="header" sx={{ borderBottom: 1, borderColor: 'grey.400', position: 'relative', display: 'flex', flexGrow: 0, alignItems: 'center' }}>
          <RouterLink to="/"><PetsIcon color="success" fontSize={mobile ? "medium" : "large"} sx={{ m: 1 }} /></RouterLink>
          <Typography variant={mobile ? "h6" : "h4"} component="h1" sx={{ flexGrow: 1 }} style={{ overflowX: 'hidden' }}>
            #можноссобакой
          </Typography>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="main menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.to} onClick={handleCloseNavMenu} component={RouterLink} to={page.to}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem key="social" onClick={handleCloseNavMenu}>
                <SocialIcon url="https://instagram.com/mozhnossobakoi" target="_blank" style={{ height: 25, width: 25, marginRight: 10 }} />
                <SocialIcon url="https://telegram.me/mozhnossobakoi" target="_blank" style={{ height: 25, width: 25, marginRight: 10 }} />
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex'}, mx: 2, alignItems: 'center' }}>
            <SocialIcon url="https://instagram.com/mozhnossobakoi" target="_blank" style={{ height: 25, width: 25, marginRight: 10 }} />
            <SocialIcon url="https://telegram.me/mozhnossobakoi" target="_blank" style={{ height: 25, width: 25, marginRight: 10 }} />
            {pages.map((page) => (
              <Button key={page.to} component={RouterLink} to={page.to} sx={{ my: 0, mx: 0.5 }}>
                {page.title}
              </Button>
            ))}
            <Button variant="contained" onClick={handleAdd} sx={{ my: 0, mx: 0.5 }}>Добавить место</Button>
          </Box>
        </Box>

        <Outlet />
      </div>
    );
}
