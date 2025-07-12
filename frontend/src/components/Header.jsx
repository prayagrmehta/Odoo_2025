import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Person,
  Search,
  Dashboard,
  AdminPanelSettings,
  Logout,
  Login,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Mock user state - replace with actual auth state
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    isAdmin: false,
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setUser(null);
    handleMenuClose();
    navigate('/');
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Browse Skills', icon: <Search />, path: '/browse' },
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Swap Requests', icon: <Dashboard />, path: '/swap-requests' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    ...(user?.isAdmin ? [{ text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' }] : []),
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          Skill Swap
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Skill Swap
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button color="inherit" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button color="inherit" onClick={() => navigate('/browse')}>
                Browse Skills
              </Button>
              {user && (
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              )}
              {user && (
                <Button color="inherit" onClick={() => navigate('/swap-requests')}>Swap Requests</Button>
              )}
            </Box>
          )}

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <Avatar
                sx={{ width: 32, height: 32, cursor: 'pointer' }}
                onClick={handleProfileMenuOpen}
              >
                {user.avatar ? user.avatar : user.name.charAt(0)}
              </Avatar>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/register')}
                sx={{ color: 'white' }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        {user?.isAdmin && (
          <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
          Admin Panel
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
