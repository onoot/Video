// client/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { StorageContext, NotificationProvider } from './contex';
import AppRouter from './components/AppRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SidebarMenu from './components/nav/SidebarMenu';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5e35b1',
      light: '#9162e4',
      dark: '#280680',
    },
    secondary: {
      main: '#00acc1',
      light: '#5ddef4',
      dark: '#007c91',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(94, 53, 177, 0.08)',
          },
        },
      },
    },
  },
});

const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: null,
    login: null,
    isAuth: false,
    role: 0,
    permissions: {},
  });
  const [activeTab, setActiveTab] = useState({ page: 0, type: 'quick' });
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = () => {
      switch (location.pathname) {
        case '/':
        case '/main':
          return 'Dashboard';
        case '/queue':
          return 'Queue';
        case '/watch':
          return 'Watcher';
        case '/preset':
          return 'Presets';
        case '/settings':
          return 'Settings';
        default:
          return 'Dashboard';
      }
    };

    setPageTitle(getPageTitle());
  }, [location.pathname]);

  return (
    <StorageContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

function App() {
  const RouterComponent = BrowserRouter;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterComponent>
        <AppProvider>
          <NotificationProvider>
            <SidebarMenu>
              <AppRouter />
            </SidebarMenu>
          </NotificationProvider>
        </AppProvider>
      </RouterComponent>
    </ThemeProvider>
  );
}

export default App;