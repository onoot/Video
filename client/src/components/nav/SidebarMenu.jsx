// client/src/components/nav/SidebarMenu.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as ViewIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Tune as TuneIcon,
  SettingsApplications as SettingsApplicationsIcon,
  ListAlt as ListAltIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { StorageContext } from '../../contex';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;
const collapsedWidth = 73;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const SidebarMenu = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const { user, setUser } = useContext(StorageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleExpandClick = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const handleLogout = () => {
    setUser({
      username: null,
      login: null,
      isAuth: false,
      role: 0,
      permissions: {},
    });
    navigate('/auth');
  };

  const menuItems = [
    {
      key: 'dashboard',
      text: 'Сводка',
      icon: <DashboardIcon />,
      path: '/main',
      visible: user?.isAuth
    },
    {
      key: 'queue',
      text: 'Очередь',
      icon: <ListAltIcon />,
      path: '/queue',
      visible: true
    },
    {
      key: 'watch',
      text: 'Watcher',
      icon: <ViewIcon />,
      path: '/watch',
      visible: user?.isAuth
    },
    {
      key: 'preset',
      text: 'Пресеты',
      icon: <TuneIcon />,
      path: '/preset',
      visible: user?.isAuth
    },
    {
      key: 'settings',
      text: 'Настройки',
      icon: <SettingsIcon />,
      path: '/settings',
      visible: user?.isAuth,
    }
  ];

  const renderMenuItem = (item, depth = 0) => {
    if (!item.visible) return null;

    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.key];

    return (
      <React.Fragment key={item.key}>
        <ListItemButton
          sx={{
            pl: depth === 0 ? 2 : depth * 3,
            pr: 2,
            py: 1,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            backgroundColor: isActive ? theme.palette.primary.main + '20' : 'transparent',
            '&:hover': {
              backgroundColor: isActive ? theme.palette.primary.main + '30' : theme.palette.action.hover,
            },
            ...(open ? {} : {
              justifyContent: 'center',
              px: 2,
            })
          }}
          onClick={() => {
            if (hasChildren) {
              handleExpandClick(item.key);
            } else if (item.path) {
              handleItemClick(item.path);
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: open ? 56 : 'auto',
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary
          }}>
            {item.icon}
          </ListItemIcon>
          
          {open && (
            <>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                }}
              />
              {hasChildren && (
                isExpanded ? <ExpandLess /> : <ExpandMore />
              )}
            </>
          )}
        </ListItemButton>

        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem({
                ...child,
                key: `${item.key}-${child.text.toLowerCase().replace(' ', '-')}`
              }, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // Скрываем меню на странице авторизации
  if (location.pathname === '/auth' || !user?.isAuth) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            ...(open ? {} : {
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            })
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <DrawerHeader>
          {open && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ml: 1
              }}
            >
              ЕУЫЕ
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        <List sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
        
        <Divider />
        
        {/* User info section */}
        {user?.isAuth && (
          <Box sx={{ p: open ? 2 : 1 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                p: open ? 1.5 : 1,
              }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ 
                minWidth: open ? 56 : 'auto',
                color: theme.palette.error.main
              }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{
                    color: theme.palette.error.main,
                    fontWeight: 500
                  }}
                />
              )}
            </ListItemButton>
          </Box>
        )}
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ml: open ? 0 : `${collapsedWidth}px`,
          width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedWidth}px)`,
          ...(isMobile && {
            width: '100%',
            ml: 0
          })
        }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
};

export default SidebarMenu;