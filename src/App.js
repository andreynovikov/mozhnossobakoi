import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet, Routes, Route, Link as RouterLink } from 'react-router-dom';

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


import './App.css';

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

    return (
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Layout mobile={mobile} />}>
            <Route index element={<Map mobile={mobile} />} />
            <Route path="places" element={<Places />} />
            <Route path="help" element={<Help />} />
            <Route path="about" element={<About />} />
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

function Layout({mobile}) {
    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (e) => {
        setAnchorElNav(e.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
      <div className="App">
        <header className="App-header">
          <Typography variant={mobile ? "h5" : "h4"} component="h1" sx={{ flexGrow: 1, p: 1 }}>
            <RouterLink to="/"><PetsIcon color="success" fontSize={mobile ? "medium" : "large"} style={{ verticalAlign: 'text-top', display: 'inline-flex' }} sx={{ mr: 1 }} /></RouterLink>
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
                <SocialIcon url="https://instagram.com/mozhnossobakoi" style={{ height: 25, width: 25, marginRight: 10 }} />
                <SocialIcon url="https://telegram.me/mozhnossobakoi" style={{ height: 25, width: 25, marginRight: 10 }} />
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex'}, mx: 2, alignItems: 'center' }}>
            <SocialIcon url="https://instagram.com/mozhnossobakoi" style={{ height: 25, width: 25, marginRight: 10 }} />
            <SocialIcon url="https://telegram.me/mozhnossobakoi" style={{ height: 25, width: 25, marginRight: 10 }} />
            {pages.map((page) => (
              <Button key={page.to} component={RouterLink} to={page.to} sx={{ my: 0, mx: 0.5 }}>
                {page.title}
              </Button>
            ))}
          </Box>
        </header>

        <Outlet />
      </div>
    );
}

function Places() {
  return (
    <div>
      <p>This is the places page.</p>
    </div>
  );
}

function Help() {
  return (
    <div>
      <p>This is the help page.</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <p>This is the about page.</p>
    </div>
  );
}
